import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getSiteSetting, updateSiteSetting, uploadSiteImage, HeroSettings, StoreSelectorSettings, FeaturesSettings, ContactSettings } from "@/lib/site-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Save, Image, Home, Settings, Phone } from "lucide-react";
import logoAvance from "@/assets/logo-avance.png";

const AdminPanel = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [heroAtacado, setHeroAtacado] = useState<HeroSettings | null>(null);
  const [heroVarejo, setHeroVarejo] = useState<HeroSettings | null>(null);
  const [storeSelector, setStoreSelector] = useState<StoreSelectorSettings | null>(null);
  const [features, setFeatures] = useState<FeaturesSettings | null>(null);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    const loadSettings = async () => {
      const [atacado, varejo, selector, feat, contact] = await Promise.all([
        getSiteSetting<HeroSettings>('hero_atacado'),
        getSiteSetting<HeroSettings>('hero_varejo'),
        getSiteSetting<StoreSelectorSettings>('store_selector'),
        getSiteSetting<FeaturesSettings>('features'),
        getSiteSetting<ContactSettings>('contact_settings'),
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
    };
    
    if (isAdmin) {
      loadSettings();
    }
  }, [isAdmin]);

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
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="selector">
              <Image className="w-4 h-4 mr-2" />
              Página Inicial
            </TabsTrigger>
            <TabsTrigger value="atacado">Hero Atacado</TabsTrigger>
            <TabsTrigger value="varejo">Hero Varejo</TabsTrigger>
            <TabsTrigger value="features">
              <Settings className="w-4 h-4 mr-2" />
              Benefícios
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="w-4 h-4 mr-2" />
              Contato
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
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
