import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getSiteSetting, updateSiteSetting, uploadSiteImage, HeroSettings, StoreSelectorSettings, FeaturesSettings, ContactSettings, LayoutSettings, ProductSectionsSettings, ProductSection, InstagramSettings, AtacadoSettings, VideosSettings, PromoBannerSettings, AnnouncementSettings, createAdminUser } from "@/lib/site-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Save, Image, Home, Settings, Phone, Layout, Grid, Plus, Trash2, ArrowUp, ArrowDown, Mail, Download, Users, Instagram, UserPlus, Shield, ShoppingBag, Loader2, Play, Tag, Megaphone, Truck, Percent, CreditCard, RefreshCw, Star, Gift, Clock, Check, Heart, Package, Zap, Award, ThumbsUp } from "lucide-react";
import logoAvance from "@/assets/logo-avance.png";
import HeroEditor from "@/components/admin/HeroEditor";
import VideosEditor from "@/components/admin/VideosEditor";
import PromoBannerEditor from "@/components/admin/PromoBannerEditor";
import AnnouncementEditor from "@/components/admin/AnnouncementEditor";

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
  const navigate = useNavigate();
  
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [heroAtacado, setHeroAtacado] = useState<HeroSettings | null>(null);
  const [heroVarejo, setHeroVarejo] = useState<HeroSettings | null>(null);
  const [storeSelector, setStoreSelector] = useState<StoreSelectorSettings | null>(null);
  const [features, setFeatures] = useState<FeaturesSettings | null>(null);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings | null>(null);
  const [sectionsAtacado, setSectionsAtacado] = useState<ProductSectionsSettings | null>(null);
  const [sectionsVarejo, setSectionsVarejo] = useState<ProductSectionsSettings | null>(null);
  const [instagramSettings, setInstagramSettings] = useState<InstagramSettings | null>(null);
  const [atacadoSettings, setAtacadoSettings] = useState<AtacadoSettings | null>(null);
  const [videosSettings, setVideosSettings] = useState<VideosSettings | null>(null);
  const [promoBannerSettings, setPromoBannerSettings] = useState<PromoBannerSettings | null>(null);
  const [announcementSettings, setAnnouncementSettings] = useState<AnnouncementSettings | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New admin form
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate("/admin/login", { replace: true });
          return;
        }
        
        // Check admin role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (!roleData) {
          console.log('User is not admin, redirecting...');
          await supabase.auth.signOut();
          navigate("/admin/login", { replace: true });
          return;
        }
        
        setUser({ id: session.user.id, email: session.user.email });
        setIsAdmin(true);
        setAuthLoading(false);
        
      } catch (error) {
        console.error('Auth check error:', error);
        navigate("/admin/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  useEffect(() => {
    const loadSettings = async () => {
      const [atacado, varejo, selector, feat, contact, layout, secAtacado, secVarejo, instagram, atacadoConfig, videos, promoBanner, announcement] = await Promise.all([
        getSiteSetting<HeroSettings>('hero_atacado'),
        getSiteSetting<HeroSettings>('hero_varejo'),
        getSiteSetting<StoreSelectorSettings>('store_selector'),
        getSiteSetting<FeaturesSettings>('features'),
        getSiteSetting<ContactSettings>('contact_settings'),
        getSiteSetting<LayoutSettings>('layout_settings'),
        getSiteSetting<ProductSectionsSettings>('product_sections_atacado'),
        getSiteSetting<ProductSectionsSettings>('product_sections_varejo'),
        getSiteSetting<InstagramSettings>('instagram_settings'),
        getSiteSetting<AtacadoSettings>('atacado_settings'),
        getSiteSetting<VideosSettings>('videos_settings'),
        getSiteSetting<PromoBannerSettings>('promo_banner_settings'),
        getSiteSetting<AnnouncementSettings>('announcement_settings'),
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
      setAtacadoSettings(atacadoConfig || {
        minimum_order: 200,
        show_minimum_order_notice: true,
        minimum_order_message: "O pedido mínimo é de R$ 200,00"
      });
      setVideosSettings(videos || { videos: [] });
      setPromoBannerSettings(promoBanner || {
        enabled: true,
        tag: "Oferta Especial",
        title: "COMPRE 3 E GANHE 20% OFF",
        description: "Promoção por tempo limitado. Não perca!",
        button_text: "Aproveitar",
        button_link: "/#produtos"
      });
      setAnnouncementSettings(announcement || {
        enabled: true,
        messages: [
          "FRETE GRÁTIS ACIMA DE R$299",
          "GRADE ABERTA - QUALQUER QUANTIDADE",
          "ATÉ 6X SEM JUROS"
        ],
        interval: 4000
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
          <TabsList className="grid w-full grid-cols-7 lg:grid-cols-14 max-w-7xl gap-1">
            <TabsTrigger value="selector" className="text-xs">
              <Image className="w-3 h-3 mr-1" />
              Entrada
            </TabsTrigger>
            <TabsTrigger value="announcement" className="text-xs">
              <Megaphone className="w-3 h-3 mr-1" />
              Anúncios
            </TabsTrigger>
            <TabsTrigger value="atacado" className="text-xs">Hero Atacado</TabsTrigger>
            <TabsTrigger value="varejo" className="text-xs">Hero Varejo</TabsTrigger>
            <TabsTrigger value="videos" className="text-xs">
              <Play className="w-3 h-3 mr-1" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="promo-banner" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              Promoção
            </TabsTrigger>
            <TabsTrigger value="atacado-config" className="text-xs">
              <ShoppingBag className="w-3 h-3 mr-1" />
              Atacado
            </TabsTrigger>
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

          {/* Announcement Bar Settings */}
          <TabsContent value="announcement">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Barra de Anúncios
                </CardTitle>
                <CardDescription>
                  Configure as mensagens rotativas exibidas no topo do site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AnnouncementEditor
                  settings={announcementSettings}
                  onChange={setAnnouncementSettings}
                />
                <Button 
                  onClick={() => saveSettings('announcement_settings', announcementSettings)}
                  disabled={saving}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Anúncios"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Atacado Settings */}
          <TabsContent value="atacado">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Hero Section - Atacado
                </CardTitle>
                <CardDescription>
                  Configure o banner principal da página de Atacado com preview em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <HeroEditor
                  settings={heroAtacado}
                  onChange={setHeroAtacado}
                  type="atacado"
                />
                <Button 
                  onClick={() => saveSettings('hero_atacado', heroAtacado)}
                  disabled={saving}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações do Hero Atacado"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Settings */}
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Vídeos das Modelos
                </CardTitle>
                <CardDescription>
                  Gerencie os vídeos exibidos na seção "Veja Nossos Looks" das páginas iniciais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <VideosEditor
                  settings={videosSettings}
                  onChange={setVideosSettings}
                />
                <Button 
                  onClick={() => saveSettings('videos_settings', videosSettings)}
                  disabled={saving}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Vídeos"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promo Banner Settings */}
          <TabsContent value="promo-banner">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Banner Promocional
                </CardTitle>
                <CardDescription>
                  Configure o banner de promoção exibido nas páginas iniciais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PromoBannerEditor
                  settings={promoBannerSettings}
                  onChange={setPromoBannerSettings}
                />
                <Button 
                  onClick={() => saveSettings('promo_banner_settings', promoBannerSettings)}
                  disabled={saving}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Banner"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atacado Config Settings */}
          <TabsContent value="atacado-config">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Atacado</CardTitle>
                <CardDescription>
                  Configure o pedido mínimo e regras para vendas no atacado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pedido Mínimo (R$)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="10"
                        value={atacadoSettings?.minimum_order || 200}
                        onChange={(e) => setAtacadoSettings(prev => prev ? {...prev, minimum_order: parseFloat(e.target.value) || 0} : null)}
                        placeholder="200"
                      />
                      <p className="text-xs text-muted-foreground">
                        Valor mínimo para finalizar compra no atacado
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Mostrar Aviso de Pedido Mínimo</Label>
                        <p className="text-xs text-muted-foreground">
                          Exibe popup ao entrar na página de atacado
                        </p>
                      </div>
                      <Switch
                        checked={atacadoSettings?.show_minimum_order_notice ?? true}
                        onCheckedChange={(checked) => setAtacadoSettings(prev => prev ? {...prev, show_minimum_order_notice: checked} : null)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Mensagem do Aviso</Label>
                    <Input
                      value={atacadoSettings?.minimum_order_message || ''}
                      onChange={(e) => setAtacadoSettings(prev => prev ? {...prev, minimum_order_message: e.target.value} : null)}
                      placeholder="O pedido mínimo é de R$ 200,00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Mensagem exibida no popup e no carrinho
                    </p>
                    
                    {/* Preview */}
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                        Preview do Aviso:
                      </p>
                      <p className="text-lg font-bold text-amber-900 dark:text-amber-300 mt-1">
                        Pedido Mínimo: R$ {(atacadoSettings?.minimum_order || 200).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => saveSettings('atacado_settings', atacadoSettings)}
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
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Hero Section - Varejo
                </CardTitle>
                <CardDescription>
                  Configure o banner principal da página de Varejo com preview em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <HeroEditor
                  settings={heroVarejo}
                  onChange={setHeroVarejo}
                  type="varejo"
                />
                <Button 
                  onClick={() => saveSettings('hero_varejo', heroVarejo)}
                  disabled={saving}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações do Hero Varejo"}
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
                {/* Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preview</Label>
                  <div className="bg-primary text-primary-foreground rounded-lg overflow-hidden" style={{ height: '60px' }}>
                    <div className="h-full flex items-center justify-center px-4 gap-6 overflow-x-auto">
                      {features?.items.map((item, index) => {
                        const iconMap: Record<string, React.ReactNode> = {
                          truck: <Truck className="w-4 h-4 opacity-80" />,
                          percent: <Percent className="w-4 h-4 opacity-80" />,
                          tag: <Tag className="w-4 h-4 opacity-80" />,
                          'credit-card': <CreditCard className="w-4 h-4 opacity-80" />,
                          refresh: <RefreshCw className="w-4 h-4 opacity-80" />,
                          shield: <Shield className="w-4 h-4 opacity-80" />,
                          star: <Star className="w-4 h-4 opacity-80" />,
                          gift: <Gift className="w-4 h-4 opacity-80" />,
                          clock: <Clock className="w-4 h-4 opacity-80" />,
                          check: <Check className="w-4 h-4 opacity-80" />,
                          heart: <Heart className="w-4 h-4 opacity-80" />,
                          package: <Package className="w-4 h-4 opacity-80" />,
                          zap: <Zap className="w-4 h-4 opacity-80" />,
                          award: <Award className="w-4 h-4 opacity-80" />,
                          'thumbs-up': <ThumbsUp className="w-4 h-4 opacity-80" />,
                        };
                        return (
                          <div key={index} className="flex items-center gap-2 flex-shrink-0">
                            {iconMap[item.icon] || <Truck className="w-4 h-4 opacity-80" />}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold whitespace-nowrap">{item.title}</span>
                              <span className="text-xs opacity-70 whitespace-nowrap">{item.description}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Editor */}
                {features?.items.map((item, index) => (
                  <div key={index} className="grid md:grid-cols-4 gap-4 p-4 bg-secondary rounded-lg items-end">
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
                        <option value="truck">🚚 Caminhão</option>
                        <option value="percent">% Porcentagem</option>
                        <option value="tag">🏷️ Tag</option>
                        <option value="credit-card">💳 Cartão</option>
                        <option value="refresh">🔄 Troca</option>
                        <option value="shield">🛡️ Escudo</option>
                        <option value="star">⭐ Estrela</option>
                        <option value="gift">🎁 Presente</option>
                        <option value="clock">⏰ Relógio</option>
                        <option value="check">✓ Check</option>
                        <option value="heart">❤️ Coração</option>
                        <option value="package">📦 Pacote</option>
                        <option value="zap">⚡ Raio</option>
                        <option value="award">🏆 Prêmio</option>
                        <option value="thumbs-up">👍 Positivo</option>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newItems = features?.items.filter((_, i) => i !== index) || [];
                        setFeatures({ items: newItems });
                      }}
                      disabled={(features?.items.length || 0) <= 1}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newItem = { icon: "truck", title: "Novo Benefício", description: "Descrição" };
                      setFeatures({ items: [...(features?.items || []), newItem] });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Benefício
                  </Button>
                  <Button 
                    onClick={() => saveSettings('features', features)}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>
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
