import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { getSiteSetting, updateSiteSetting, uploadSiteImage, HeroSettings, StoreSelectorSettings, FeaturesSettings, ContactSettings, LayoutSettings, ProductSectionsSettings, ProductSection, InstagramSettings, createAdminUser } from "@/lib/site-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Save, Image, Home, Settings, Phone, Layout, Grid, Plus, Trash2, ArrowUp, ArrowDown, Mail, Download, Users, Instagram, UserPlus, Shield } from "lucide-react";
import logoAvance from "@/assets/logo-avance.png";

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  source: string;
  is_active: boolean;
}

interface AdminUser {
  user_id: string;
  created_at: string;
  email?: string;
}

const AdminPanel = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [heroAtacado, setHeroAtacado] = useState<HeroSettings | null>(null);
  const [heroVarejo, setHeroVarejo] = useState<HeroSettings | null>(null);
  const [storeSelector, setStoreSelector] = useState<StoreSelectorSettings | null>(null);
  const [features, setFeatures] = useState<FeaturesSettings | null>(null);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings | null>(null);
  const [sectionsAtacado, setSectionsAtacado] = useState<ProductSectionsSettings | null>(null);
  const [sectionsVarejo, setSectionsVarejo] = useState<ProductSectionsSettings | null>(null);
  const [instagramSettings, setInstagramSettings] = useState<InstagramSettings | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New admin form
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    const loadSettings = async () => {
      const [atacado, varejo, selector, feat, contact, layout, secAtacado, secVarejo, instagram] = await Promise.all([
        getSiteSetting<HeroSettings>('hero_atacado'),
        getSiteSetting<HeroSettings>('hero_varejo'),
        getSiteSetting<StoreSelectorSettings>('store_selector'),
        getSiteSetting<FeaturesSettings>('features'),
        getSiteSetting<ContactSettings>('contact_settings'),
        getSiteSetting<LayoutSettings>('layout_settings'),
        getSiteSetting<ProductSectionsSettings>('product_sections_atacado'),
        getSiteSetting<ProductSectionsSettings>('product_sections_varejo'),
        getSiteSetting<InstagramSettings>('instagram_settings'),
      ]);
      setHeroAtacado(atacado);
      setHeroVarejo(varejo);
      setStoreSelector(selector);
      setFeatures(feat);
      setContactSettings(contact || {
        whatsapp_number: "5511999999999",
        email: "contato@avancemodas.com.br",
        address: "Endereço da loja",
        instagram: "@avancemodas"
      });
      setLayoutSettings(layout || {
        features_gap: "6",
        features_columns_mobile: "2",
        features_columns_desktop: "5",
        products_gap: "6",
        products_columns_mobile: "2",
        products_columns_desktop: "4"
      });
      setSectionsAtacado(secAtacado || {
        sections: [{ id: "main", title: "Produtos Atacado", subtitle: "", tag_filter: "", limit: 8, order: 1 }]
      });
      setSectionsVarejo(secVarejo || {
        sections: [{ id: "main", title: "Produtos Varejo", subtitle: "", tag_filter: "", limit: 8, order: 1 }]
      });
      setInstagramSettings(instagram || {
        username: "avancemodasoficial",
        curator_feed_id: "abf84bdb-32da-4a02-b55e-4116eef0cf19",
        show_section: true,
        button_text: "Ver nosso Instagram",
        subtitle_text: "Siga-nos no Instagram"
      });
    };
    
    if (isAdmin) {
      loadSettings();
      loadSubscribers();
      loadAdminUsers();
    }
  }, [isAdmin]);

  const loadSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      
      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const loadAdminUsers = async () => {
    setLoadingAdmins(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, created_at')
        .eq('role', 'admin');
      
      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      toast.error("Preencha e-mail e senha");
      return;
    }

    if (newAdminPassword.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setCreatingAdmin(true);
    const result = await createAdminUser(newAdminEmail, newAdminPassword);
    setCreatingAdmin(false);

    if (result.success) {
      toast.success("Administrador criado com sucesso!");
      setNewAdminEmail("");
      setNewAdminPassword("");
      loadAdminUsers();
    } else {
      toast.error(result.error || "Erro ao criar administrador");
    }
  };

  const exportSubscribers = () => {
    if (subscribers.length === 0) {
      toast.error("Nenhum inscrito para exportar");
      return;
    }

    const csvContent = [
      ['Email', 'Data de Inscrição', 'Fonte', 'Ativo'],
      ...subscribers.map(s => [
        s.email,
        new Date(s.subscribed_at).toLocaleDateString('pt-BR'),
        s.source,
        s.is_active ? 'Sim' : 'Não'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Lista exportada com sucesso!");
  };

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setSubscribers(prev => 
        prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s)
      );
      toast.success(currentStatus ? "Inscrito desativado" : "Inscrito ativado");
    } catch (error) {
      console.error('Error updating subscriber:', error);
      toast.error("Erro ao atualizar inscrito");
    }
  };

  const handleStoreSelectorImageUpload = async (file: File, imageKey: keyof StoreSelectorSettings) => {
    if (!storeSelector) return;
    const path = `store_selector/${imageKey}-${Date.now()}.${file.name.split('.').pop()}`;
    const url = await uploadSiteImage(file, path);
    
    if (url) {
      setStoreSelector({ ...storeSelector, [imageKey]: url });
      toast.success("Imagem enviada com sucesso!");
    } else {
      toast.error("Erro ao enviar imagem");
    }
  };

  const handleHeroImageUpload = async (
    file: File, 
    type: 'atacado' | 'varejo'
  ) => {
    const settings = type === 'atacado' ? heroAtacado : heroVarejo;
    const setSetting = type === 'atacado' ? setHeroAtacado : setHeroVarejo;
    if (!settings) return;
    
    const path = `hero_${type}/image_url-${Date.now()}.${file.name.split('.').pop()}`;
    const url = await uploadSiteImage(file, path);
    
    if (url) {
      setSetting({ ...settings, image_url: url });
      toast.success("Imagem enviada com sucesso!");
    } else {
      toast.error("Erro ao enviar imagem");
    }
  };

  const saveSettings = async (key: string, value: unknown) => {
    setSaving(true);
    const success = await updateSiteSetting(key, value);
    setSaving(false);
    
    if (success) {
      toast.success("Configurações salvas!");
    } else {
      toast.error("Erro ao salvar configurações");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <img src={logoAvance} alt="Avance" className="h-10 object-contain" />
            <div>
              <h1 className="font-bold text-foreground">Painel de Design</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/" target="_blank">
                <Home className="w-4 h-4 mr-2" />
                Ver Site
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="selector" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 max-w-6xl gap-1">
            <TabsTrigger value="selector" className="text-xs">
              <Image className="w-3 h-3 mr-1" />
              Entrada
            </TabsTrigger>
            <TabsTrigger value="atacado" className="text-xs">Hero Atacado</TabsTrigger>
            <TabsTrigger value="varejo" className="text-xs">Hero Varejo</TabsTrigger>
            <TabsTrigger value="features" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Benefícios
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">
              <Layout className="w-3 h-3 mr-1" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="sections" className="text-xs">
              <Grid className="w-3 h-3 mr-1" />
              Seções
            </TabsTrigger>
            <TabsTrigger value="instagram" className="text-xs">
              <Instagram className="w-3 h-3 mr-1" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">
              <Phone className="w-3 h-3 mr-1" />
              Contato
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="text-xs">
              <Mail className="w-3 h-3 mr-1" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="admins" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Admins
            </TabsTrigger>
          </TabsList>

          {/* Store Selector Settings */}
          <TabsContent value="selector">
            <Card>
              <CardHeader>
                <CardTitle>Página de Seleção (Entrada)</CardTitle>
                <CardDescription>
                  Configure as imagens exibidas na página inicial de escolha entre Atacado e Varejo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Imagem Atacado</Label>
                    {storeSelector?.atacado_image && (
                      <img 
                        src={storeSelector.atacado_image} 
                        alt="Atacado" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleStoreSelectorImageUpload(file, 'atacado_image');
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Imagem Varejo</Label>
                    {storeSelector?.varejo_image && (
                      <img 
                        src={storeSelector.varejo_image} 
                        alt="Varejo" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleStoreSelectorImageUpload(file, 'varejo_image');
                      }}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => saveSettings('store_selector', storeSelector)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Atacado Settings */}
          <TabsContent value="atacado">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section - Atacado</CardTitle>
                <CardDescription>
                  Configure o banner principal da página de Atacado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Imagem Principal</Label>
                  {heroAtacado?.image_url && (
                    <img 
                      src={heroAtacado.image_url} 
                      alt="Hero Atacado" 
                      className="w-full max-w-md h-60 object-cover rounded-lg"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleHeroImageUpload(file, 'atacado');
                      }}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Texto Promocional</Label>
                    <Input
                      value={heroAtacado?.promo_text || ''}
                      onChange={(e) => setHeroAtacado(prev => prev ? {...prev, promo_text: e.target.value} : null)}
                      placeholder="ATÉ 30% OFF"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo Promo</Label>
                    <Input
                      value={heroAtacado?.promo_subtitle || ''}
                      onChange={(e) => setHeroAtacado(prev => prev ? {...prev, promo_subtitle: e.target.value} : null)}
                      placeholder="ATACADO"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto do Botão</Label>
                    <Input
                      value={heroAtacado?.button_text || ''}
                      onChange={(e) => setHeroAtacado(prev => prev ? {...prev, button_text: e.target.value} : null)}
                      placeholder="COMPRE AGORA"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => saveSettings('hero_atacado', heroAtacado)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Varejo Settings */}
          <TabsContent value="varejo">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section - Varejo</CardTitle>
                <CardDescription>
                  Configure o banner principal da página de Varejo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Imagem Principal</Label>
                  {heroVarejo?.image_url && (
                    <img 
                      src={heroVarejo.image_url} 
                      alt="Hero Varejo" 
                      className="w-full max-w-md h-60 object-cover rounded-lg"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleHeroImageUpload(file, 'varejo');
                      }}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Texto Promocional</Label>
                    <Input
                      value={heroVarejo?.promo_text || ''}
                      onChange={(e) => setHeroVarejo(prev => prev ? {...prev, promo_text: e.target.value} : null)}
                      placeholder="ATÉ 20% OFF"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo Promo</Label>
                    <Input
                      value={heroVarejo?.promo_subtitle || ''}
                      onChange={(e) => setHeroVarejo(prev => prev ? {...prev, promo_subtitle: e.target.value} : null)}
                      placeholder="NOVIDADES"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Texto do Botão</Label>
                    <Input
                      value={heroVarejo?.button_text || ''}
                      onChange={(e) => setHeroVarejo(prev => prev ? {...prev, button_text: e.target.value} : null)}
                      placeholder="COMPRE AGORA"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => saveSettings('hero_varejo', heroVarejo)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Barra de Benefícios</CardTitle>
                <CardDescription>
                  Configure os ícones e textos da barra de benefícios abaixo do hero
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {features?.items.map((item, index) => (
                  <div key={index} className="grid md:grid-cols-3 gap-4 p-4 bg-secondary rounded-lg">
                    <div className="space-y-2">
                      <Label>Ícone</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={item.icon}
                        onChange={(e) => {
                          const newItems = [...(features?.items || [])];
                          newItems[index] = { ...newItems[index], icon: e.target.value };
                          setFeatures({ items: newItems });
                        }}
                      >
                        <option value="truck">Caminhão</option>
                        <option value="percent">Porcentagem</option>
                        <option value="tag">Tag</option>
                        <option value="credit-card">Cartão</option>
                        <option value="refresh">Troca</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const newItems = [...(features?.items || [])];
                          newItems[index] = { ...newItems[index], title: e.target.value };
                          setFeatures({ items: newItems });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...(features?.items || [])];
                          newItems[index] = { ...newItems[index], description: e.target.value };
                          setFeatures({ items: newItems });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={() => saveSettings('features', features)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Settings */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Contato</CardTitle>
                <CardDescription>
                  Configure as informações de contato exibidas na página de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Número do WhatsApp (com código do país)</Label>
                    <Input
                      value={contactSettings?.whatsapp_number || ''}
                      onChange={(e) => setContactSettings(prev => prev ? {...prev, whatsapp_number: e.target.value} : null)}
                      placeholder="5511999999999"
                    />
                    <p className="text-xs text-muted-foreground">Ex: 5511999999999 (sem + ou espaços)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      value={contactSettings?.email || ''}
                      onChange={(e) => setContactSettings(prev => prev ? {...prev, email: e.target.value} : null)}
                      placeholder="contato@avancemodas.com.br"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input
                      value={contactSettings?.address || ''}
                      onChange={(e) => setContactSettings(prev => prev ? {...prev, address: e.target.value} : null)}
                      placeholder="Endereço da loja"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input
                      value={contactSettings?.instagram || ''}
                      onChange={(e) => setContactSettings(prev => prev ? {...prev, instagram: e.target.value} : null)}
                      placeholder="@avancemodas"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => saveSettings('contact_settings', contactSettings)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Settings */}
          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Layout</CardTitle>
                <CardDescription>
                  Configure espaçamentos e número de colunas nas grades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Barra de Benefícios</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Espaçamento (gap)</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={layoutSettings?.features_gap || '6'}
                        onChange={(e) => setLayoutSettings(prev => prev ? {...prev, features_gap: e.target.value} : null)}
                      >
                        <option value="2">Pequeno (2)</option>
                        <option value="4">Médio (4)</option>
                        <option value="6">Grande (6)</option>
                        <option value="8">Extra Grande (8)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Colunas Mobile</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={layoutSettings?.features_columns_mobile || '2'}
                        onChange={(e) => setLayoutSettings(prev => prev ? {...prev, features_columns_mobile: e.target.value} : null)}
                      >
                        <option value="1">1 Coluna</option>
                        <option value="2">2 Colunas</option>
                        <option value="3">3 Colunas</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Colunas Desktop</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={layoutSettings?.features_columns_desktop || '5'}
                        onChange={(e) => setLayoutSettings(prev => prev ? {...prev, features_columns_desktop: e.target.value} : null)}
                      >
                        <option value="3">3 Colunas</option>
                        <option value="4">4 Colunas</option>
                        <option value="5">5 Colunas</option>
                        <option value="6">6 Colunas</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Grade de Produtos</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Espaçamento (gap)</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={layoutSettings?.products_gap || '6'}
                        onChange={(e) => setLayoutSettings(prev => prev ? {...prev, products_gap: e.target.value} : null)}
                      >
                        <option value="2">Pequeno (2)</option>
                        <option value="4">Médio (4)</option>
                        <option value="6">Grande (6)</option>
                        <option value="8">Extra Grande (8)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Colunas Mobile</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={layoutSettings?.products_columns_mobile || '2'}
                        onChange={(e) => setLayoutSettings(prev => prev ? {...prev, products_columns_mobile: e.target.value} : null)}
                      >
                        <option value="1">1 Coluna</option>
                        <option value="2">2 Colunas</option>
                        <option value="3">3 Colunas</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Colunas Desktop</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={layoutSettings?.products_columns_desktop || '4'}
                        onChange={(e) => setLayoutSettings(prev => prev ? {...prev, products_columns_desktop: e.target.value} : null)}
                      >
                        <option value="2">2 Colunas</option>
                        <option value="3">3 Colunas</option>
                        <option value="4">4 Colunas</option>
                        <option value="5">5 Colunas</option>
                        <option value="6">6 Colunas</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => saveSettings('layout_settings', layoutSettings)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Sections */}
          <TabsContent value="sections">
            <div className="space-y-6">
              {/* Atacado Sections */}
              <Card>
                <CardHeader>
                  <CardTitle>Seções de Produtos - Atacado</CardTitle>
                  <CardDescription>
                    Organize os produtos em seções com títulos e filtros por tag
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sectionsAtacado?.sections.map((section, index) => (
                    <div key={section.id} className="p-4 bg-secondary rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Seção {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSections = [...sectionsAtacado.sections];
                              if (index > 0) {
                                [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
                                newSections.forEach((s, i) => s.order = i + 1);
                                setSectionsAtacado({ sections: newSections });
                              }
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSections = [...sectionsAtacado.sections];
                              if (index < newSections.length - 1) {
                                [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
                                newSections.forEach((s, i) => s.order = i + 1);
                                setSectionsAtacado({ sections: newSections });
                              }
                            }}
                            disabled={index === sectionsAtacado.sections.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newSections = sectionsAtacado.sections.filter((_, i) => i !== index);
                              setSectionsAtacado({ sections: newSections });
                            }}
                            disabled={sectionsAtacado.sections.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={section.title}
                            onChange={(e) => {
                              const newSections = [...sectionsAtacado.sections];
                              newSections[index] = { ...newSections[index], title: e.target.value };
                              setSectionsAtacado({ sections: newSections });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input
                            value={section.subtitle}
                            onChange={(e) => {
                              const newSections = [...sectionsAtacado.sections];
                              newSections[index] = { ...newSections[index], subtitle: e.target.value };
                              setSectionsAtacado({ sections: newSections });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Filtro por Tag</Label>
                          <Input
                            value={section.tag_filter}
                            onChange={(e) => {
                              const newSections = [...sectionsAtacado.sections];
                              newSections[index] = { ...newSections[index], tag_filter: e.target.value };
                              setSectionsAtacado({ sections: newSections });
                            }}
                            placeholder="Deixe vazio para todos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Limite de Produtos</Label>
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={section.limit}
                            onChange={(e) => {
                              const newSections = [...sectionsAtacado.sections];
                              newSections[index] = { ...newSections[index], limit: parseInt(e.target.value) || 8 };
                              setSectionsAtacado({ sections: newSections });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newSection: ProductSection = {
                          id: `section-${Date.now()}`,
                          title: "Nova Seção",
                          subtitle: "",
                          tag_filter: "",
                          limit: 8,
                          order: (sectionsAtacado?.sections.length || 0) + 1
                        };
                        setSectionsAtacado({
                          sections: [...(sectionsAtacado?.sections || []), newSection]
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Seção
                    </Button>
                    <Button 
                      onClick={() => saveSettings('product_sections_atacado', sectionsAtacado)}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar Seções Atacado"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Varejo Sections */}
              <Card>
                <CardHeader>
                  <CardTitle>Seções de Produtos - Varejo</CardTitle>
                  <CardDescription>
                    Organize os produtos em seções com títulos e filtros por tag
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sectionsVarejo?.sections.map((section, index) => (
                    <div key={section.id} className="p-4 bg-secondary rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Seção {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSections = [...sectionsVarejo.sections];
                              if (index > 0) {
                                [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
                                newSections.forEach((s, i) => s.order = i + 1);
                                setSectionsVarejo({ sections: newSections });
                              }
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSections = [...sectionsVarejo.sections];
                              if (index < newSections.length - 1) {
                                [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
                                newSections.forEach((s, i) => s.order = i + 1);
                                setSectionsVarejo({ sections: newSections });
                              }
                            }}
                            disabled={index === sectionsVarejo.sections.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newSections = sectionsVarejo.sections.filter((_, i) => i !== index);
                              setSectionsVarejo({ sections: newSections });
                            }}
                            disabled={sectionsVarejo.sections.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={section.title}
                            onChange={(e) => {
                              const newSections = [...sectionsVarejo.sections];
                              newSections[index] = { ...newSections[index], title: e.target.value };
                              setSectionsVarejo({ sections: newSections });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtítulo</Label>
                          <Input
                            value={section.subtitle}
                            onChange={(e) => {
                              const newSections = [...sectionsVarejo.sections];
                              newSections[index] = { ...newSections[index], subtitle: e.target.value };
                              setSectionsVarejo({ sections: newSections });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Filtro por Tag</Label>
                          <Input
                            value={section.tag_filter}
                            onChange={(e) => {
                              const newSections = [...sectionsVarejo.sections];
                              newSections[index] = { ...newSections[index], tag_filter: e.target.value };
                              setSectionsVarejo({ sections: newSections });
                            }}
                            placeholder="Deixe vazio para todos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Limite de Produtos</Label>
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={section.limit}
                            onChange={(e) => {
                              const newSections = [...sectionsVarejo.sections];
                              newSections[index] = { ...newSections[index], limit: parseInt(e.target.value) || 8 };
                              setSectionsVarejo({ sections: newSections });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newSection: ProductSection = {
                          id: `section-${Date.now()}`,
                          title: "Nova Seção",
                          subtitle: "",
                          tag_filter: "",
                          limit: 8,
                          order: (sectionsVarejo?.sections.length || 0) + 1
                        };
                        setSectionsVarejo({
                          sections: [...(sectionsVarejo?.sections || []), newSection]
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Seção
                    </Button>
                    <Button 
                      onClick={() => saveSettings('product_sections_varejo', sectionsVarejo)}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar Seções Varejo"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Newsletter Subscribers */}
          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Inscritos na Newsletter
                    </CardTitle>
                    <CardDescription>
                      Gerencie os e-mails cadastrados na newsletter
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadSubscribers} disabled={loadingSubscribers}>
                      {loadingSubscribers ? "Atualizando..." : "Atualizar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportSubscribers}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSubscribers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum inscrito ainda</p>
                    <p className="text-sm mt-1">Os e-mails cadastrados aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-2">
                      <span>Total: <strong className="text-foreground">{subscribers.length}</strong> inscritos</span>
                      <span>Ativos: <strong className="text-green-600">{subscribers.filter(s => s.is_active).length}</strong></span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                      {subscribers.map((subscriber) => (
                        <div 
                          key={subscriber.id} 
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            subscriber.is_active ? 'bg-background' : 'bg-secondary/50 opacity-60'
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{subscriber.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Inscrito em {new Date(subscriber.subscribed_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              subscriber.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {subscriber.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.is_active)}
                            >
                              {subscriber.is_active ? 'Desativar' : 'Ativar'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instagram Settings */}
          <TabsContent value="instagram">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="w-5 h-5" />
                  Configurações do Instagram
                </CardTitle>
                <CardDescription>
                  Configure o feed do Instagram exibido no site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label className="text-base">Exibir seção do Instagram</Label>
                    <p className="text-sm text-muted-foreground">Mostrar o feed do Instagram no rodapé do site</p>
                  </div>
                  <Switch
                    checked={instagramSettings?.show_section ?? true}
                    onCheckedChange={(checked) => 
                      setInstagramSettings(prev => prev ? {...prev, show_section: checked} : null)
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome de usuário do Instagram</Label>
                    <Input
                      value={instagramSettings?.username || ''}
                      onChange={(e) => setInstagramSettings(prev => prev ? {...prev, username: e.target.value} : null)}
                      placeholder="avancemodasoficial"
                    />
                    <p className="text-xs text-muted-foreground">Sem o @</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Feed ID do Curator.io</Label>
                    <Input
                      value={instagramSettings?.curator_feed_id || ''}
                      onChange={(e) => setInstagramSettings(prev => prev ? {...prev, curator_feed_id: e.target.value} : null)}
                      placeholder="abf84bdb-32da-4a02-b55e-4116eef0cf19"
                    />
                    <p className="text-xs text-muted-foreground">
                      Obtenha em <a href="https://curator.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">curator.io</a>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Texto do botão</Label>
                    <Input
                      value={instagramSettings?.button_text || ''}
                      onChange={(e) => setInstagramSettings(prev => prev ? {...prev, button_text: e.target.value} : null)}
                      placeholder="Ver nosso Instagram"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={instagramSettings?.subtitle_text || ''}
                      onChange={(e) => setInstagramSettings(prev => prev ? {...prev, subtitle_text: e.target.value} : null)}
                      placeholder="Siga-nos no Instagram"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => saveSettings('instagram_settings', instagramSettings)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Users Management */}
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Gerenciamento de Administradores
                </CardTitle>
                <CardDescription>
                  Crie novas contas de administrador para gerenciar o painel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create new admin form */}
                <div className="p-4 bg-secondary rounded-lg space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Criar novo administrador
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="novo@admin.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Senha</Label>
                      <Input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateAdmin} disabled={creatingAdmin}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {creatingAdmin ? "Criando..." : "Criar Administrador"}
                  </Button>
                </div>

                {/* Existing admins list */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Administradores existentes</h3>
                    <Button variant="outline" size="sm" onClick={loadAdminUsers} disabled={loadingAdmins}>
                      {loadingAdmins ? "Atualizando..." : "Atualizar"}
                    </Button>
                  </div>
                  
                  {loadingAdmins ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : adminUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum administrador encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {adminUsers.map((admin) => (
                        <div 
                          key={admin.user_id} 
                          className="flex items-center justify-between p-3 rounded-lg border bg-background"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Shield className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {admin.user_id === user?.id ? `${user.email} (você)` : `Admin ID: ${admin.user_id.slice(0, 8)}...`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Criado em {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Admin
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Novos administradores receberão um e-mail de confirmação antes de poderem acessar o painel.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
