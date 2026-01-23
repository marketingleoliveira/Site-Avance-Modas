import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Store, 
  Palette, 
  MessageCircle, 
  Truck, 
  FileText, 
  AlertCircle, 
  Check,
  Upload,
  Globe,
  Key,
  Loader2,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  RefreshCw,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { updateSiteSetting, uploadSiteImage, invalidateSettingsCache } from "@/lib/site-settings";
import { invalidateShopifyConfigCache } from "@/lib/shopify-api";
import { toast } from "sonner";

export interface ShopifyConfigSettings {
  store_domain: string;
  storefront_token: string;
  api_version: string;
}

export interface BrandSettings {
  brand_name: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

export interface ShippingSettings {
  free_shipping_minimum: number;
  free_shipping_enabled: boolean;
  shipping_notice: string;
  exchange_policy: string;
  return_days: number;
}

export interface SocialSettings {
  whatsapp_number: string;
  whatsapp_message: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  email: string;
  address: string;
}

export interface LegalSettings {
  company_name: string;
  cnpj: string;
  privacy_policy: string;
  terms_of_use: string;
  wholesale_policy: string;
  // Atacado exchange policy
  exchange_atacado_text: string;
  exchange_atacado_conditions: string;
  exchange_atacado_days: number;
  // Varejo exchange policy
  exchange_varejo_text: string;
  exchange_varejo_conditions: string;
  exchange_varejo_days: number;
}

interface StoreConfigEditorProps {
  shopifyConfig: ShopifyConfigSettings | null;
  brandSettings: BrandSettings | null;
  shippingSettings: ShippingSettings | null;
  socialSettings: SocialSettings | null;
  legalSettings: LegalSettings | null;
  onUpdate: () => void;
}

export default function StoreConfigEditor({
  shopifyConfig,
  brandSettings,
  shippingSettings,
  socialSettings,
  legalSettings,
  onUpdate
}: StoreConfigEditorProps) {
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  
  // Local state for forms
  const [localShopify, setLocalShopify] = useState<ShopifyConfigSettings>(shopifyConfig || {
    store_domain: "",
    storefront_token: "",
    api_version: "2025-07"
  });
  
  const [localBrand, setLocalBrand] = useState<BrandSettings>(brandSettings || {
    brand_name: "Minha Loja",
    logo_url: "",
    favicon_url: "",
    primary_color: "#6b7280",
    secondary_color: "#f3f4f6",
    accent_color: "#10b981"
  });
  
  const [localShipping, setLocalShipping] = useState<ShippingSettings>(shippingSettings || {
    free_shipping_minimum: 299,
    free_shipping_enabled: true,
    shipping_notice: "Frete grátis para compras acima de R$299",
    exchange_policy: "Primeira troca grátis em até 30 dias",
    return_days: 30
  });
  
  const [localSocial, setLocalSocial] = useState<SocialSettings>(socialSettings || {
    whatsapp_number: "",
    whatsapp_message: "Olá! Vim pelo site e gostaria de mais informações.",
    instagram_url: "",
    facebook_url: "",
    tiktok_url: "",
    email: "",
    address: ""
  });
  
  const [localLegal, setLocalLegal] = useState<LegalSettings>(legalSettings || {
    company_name: "",
    cnpj: "",
    privacy_policy: "",
    terms_of_use: "",
    wholesale_policy: "",
    exchange_atacado_text: "Trocas somente em casos de defeito de fabricação. Prazo de 7 dias após o recebimento.",
    exchange_atacado_conditions: "O produto deve estar sem uso, com etiquetas originais e na embalagem.",
    exchange_atacado_days: 7,
    exchange_varejo_text: "Aceitamos trocas em até 7 dias após o recebimento.",
    exchange_varejo_conditions: "O produto deve estar sem uso, com etiquetas originais e na embalagem.",
    exchange_varejo_days: 7
  });

  // Auto-test connection on mount if credentials exist
  useEffect(() => {
    if (shopifyConfig?.store_domain && shopifyConfig?.storefront_token) {
      const timer = setTimeout(() => {
        testShopifyConnection(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogoUpload = async (file: File) => {
    const path = `brand/logo-${Date.now()}.${file.name.split('.').pop()}`;
    const url = await uploadSiteImage(file, path);
    if (url) {
      setLocalBrand({ ...localBrand, logo_url: url });
      toast.success("Logo enviado com sucesso!");
    } else {
      toast.error("Erro ao enviar logo");
    }
  };

  const handleFaviconUpload = async (file: File) => {
    const path = `brand/favicon-${Date.now()}.${file.name.split('.').pop()}`;
    const url = await uploadSiteImage(file, path);
    if (url) {
      setLocalBrand({ ...localBrand, favicon_url: url });
      toast.success("Favicon enviado com sucesso!");
    } else {
      toast.error("Erro ao enviar favicon");
    }
  };

  const saveAllSettings = async () => {
    setSaving(true);
    try {
      const results = await Promise.all([
        updateSiteSetting('shopify_config', localShopify),
        updateSiteSetting('brand_settings', localBrand),
        updateSiteSetting('shipping_settings', localShipping),
        updateSiteSetting('social_settings', localSocial),
        updateSiteSetting('legal_settings', localLegal),
      ]);
      
      if (results.every(r => r)) {
        // Invalidate all caches to ensure new config is used immediately
        invalidateSettingsCache();
        invalidateShopifyConfigCache();
        toast.success("Todas as configurações foram salvas!");
        onUpdate();
      } else {
        toast.error("Erro ao salvar algumas configurações");
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const testShopifyConnection = useCallback(async (showToast: boolean = true) => {
    if (!localShopify.store_domain || !localShopify.storefront_token) {
      if (showToast) {
        toast.error("Preencha o domínio e o token primeiro");
      }
      return;
    }

    setConnectionStatus('testing');
    setConnectionError('');
    setShopName('');

    try {
      const url = `https://${localShopify.store_domain}/api/${localShopify.api_version}/graphql.json`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': localShopify.storefront_token
        },
        body: JSON.stringify({
          query: `{ shop { name } }`
        }),
      });

      if (response.status === 402) {
        setConnectionStatus('error');
        setConnectionError('Plano do Shopify requer upgrade para usar a API');
        return;
      }

      if (!response.ok) {
        if (response.status === 401) {
          setConnectionStatus('error');
          setConnectionError('Token inválido ou sem permissões');
          return;
        }
        if (response.status === 404) {
          setConnectionStatus('error');
          setConnectionError('Loja não encontrada. Verifique o domínio.');
          return;
        }
        setConnectionStatus('error');
        setConnectionError(`Erro HTTP: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data.errors) {
        setConnectionStatus('error');
        setConnectionError(data.errors[0]?.message || 'Erro na API do Shopify');
        return;
      }

      if (data.data?.shop?.name) {
        setConnectionStatus('success');
        setShopName(data.data.shop.name);
        if (showToast) {
          toast.success(`Conectado à loja: ${data.data.shop.name}`);
        }
      } else {
        setConnectionStatus('error');
        setConnectionError('Resposta inesperada da API');
      }
    } catch (error) {
      setConnectionStatus('error');
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setConnectionError('Não foi possível conectar. Verifique o domínio.');
      } else {
        setConnectionError(error instanceof Error ? error.message : 'Erro desconhecido');
      }
    }
  }, [localShopify]);

  const saveSection = async (key: string, value: unknown) => {
    setSaving(true);
    const success = await updateSiteSetting(key, value);
    setSaving(false);
    
    if (success) {
      // Invalidate caches to ensure new config is used immediately
      if (key === 'shopify_config') {
        invalidateSettingsCache('shopify_config');
        invalidateShopifyConfigCache();
      }
      toast.success("Configurações salvas!");
      onUpdate();
    } else {
      toast.error("Erro ao salvar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações da Loja</h2>
          <p className="text-muted-foreground">
            Configure as credenciais do Shopify e personalize sua loja
          </p>
        </div>
        <Button onClick={saveAllSettings} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Tudo
        </Button>
      </div>

      <Tabs defaultValue="shopify" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shopify" className="gap-2 relative">
            <Store className="w-4 h-4" />
            Shopify
            {connectionStatus === 'success' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
            {connectionStatus === 'error' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
            )}
            {connectionStatus === 'testing' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-2">
            <Palette className="w-4 h-4" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="shipping" className="gap-2">
            <Truck className="w-4 h-4" />
            Envio
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-2">
            <FileText className="w-4 h-4" />
            Legal
          </TabsTrigger>
        </TabsList>

        {/* Shopify Configuration */}
        <TabsContent value="shopify">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Conexão Shopify
              </CardTitle>
              <CardDescription>
                Configure as credenciais da sua loja Shopify para conectar este layout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Como obter as credenciais</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>1. Acesse o <strong>Admin do Shopify</strong> → Configurações → Apps e canais de vendas</p>
                  <p>2. Clique em <strong>Desenvolver apps</strong> → Criar um app</p>
                  <p>3. Configure as permissões da <strong>Storefront API</strong></p>
                  <p>4. Copie o <strong>Storefront Access Token</strong></p>
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Domínio da Loja
                  </Label>
                  <Input
                    placeholder="sua-loja.myshopify.com"
                    value={localShopify.store_domain}
                    onChange={(e) => setLocalShopify({ ...localShopify, store_domain: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    O domínio .myshopify.com da sua loja (ex: minha-loja.myshopify.com)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Storefront Access Token
                  </Label>
                  <div className="relative">
                    <Input
                      type={showToken ? "text" : "password"}
                      placeholder="Token de acesso da Storefront API"
                      value={localShopify.storefront_token}
                      onChange={(e) => setLocalShopify({ ...localShopify, storefront_token: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Token público para acessar produtos e criar carrinhos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Versão da API</Label>
                  <Input
                    value={localShopify.api_version}
                    onChange={(e) => setLocalShopify({ ...localShopify, api_version: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 2025-07 (versão mais recente)
                  </p>
                </div>
              </div>

              {/* Connection Status Display */}
              {connectionStatus === 'success' && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium block">
                      Conexão validada com sucesso!
                    </span>
                    {shopName && (
                      <span className="text-lg font-semibold text-green-800 dark:text-green-200">
                        {shopName}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                    Conectada
                  </Badge>
                </div>
              )}

              {connectionStatus === 'error' && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm text-red-700 dark:text-red-300 font-medium block">
                      Falha na conexão
                    </span>
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {connectionError}
                    </span>
                  </div>
                </div>
              )}

              {connectionStatus === 'idle' && localShopify.store_domain && localShopify.storefront_token && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800">
                  <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    Credenciais preenchidas. Clique em "Testar Conexão" para validar.
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => testShopifyConnection(true)} 
                  disabled={connectionStatus === 'testing' || !localShopify.store_domain || !localShopify.storefront_token}
                  variant="outline"
                  className="gap-2"
                >
                  {connectionStatus === 'testing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wifi className="w-4 h-4" />
                  )}
                  Testar Conexão
                </Button>
                
                <Button onClick={() => saveSection('shopify_config', localShopify)} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Conexão Shopify
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Settings */}
        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>
                Configure o logo, cores e nome da sua marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Nome da Marca</Label>
                  <Input
                    value={localBrand.brand_name}
                    onChange={(e) => setLocalBrand({ ...localBrand, brand_name: e.target.value })}
                    placeholder="Nome da sua loja"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Logo</Label>
                  {localBrand.logo_url && (
                    <img 
                      src={localBrand.logo_url} 
                      alt="Logo" 
                      className="h-16 object-contain bg-secondary rounded p-2"
                    />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Cores do Tema</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Cor Principal</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localBrand.primary_color}
                        onChange={(e) => setLocalBrand({ ...localBrand, primary_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={localBrand.primary_color}
                        onChange={(e) => setLocalBrand({ ...localBrand, primary_color: e.target.value })}
                        placeholder="#6b7280"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localBrand.secondary_color}
                        onChange={(e) => setLocalBrand({ ...localBrand, secondary_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={localBrand.secondary_color}
                        onChange={(e) => setLocalBrand({ ...localBrand, secondary_color: e.target.value })}
                        placeholder="#f3f4f6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localBrand.accent_color}
                        onChange={(e) => setLocalBrand({ ...localBrand, accent_color: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={localBrand.accent_color}
                        onChange={(e) => setLocalBrand({ ...localBrand, accent_color: e.target.value })}
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nota: Para aplicar as cores, atualize as variáveis CSS em index.css após salvar.
                </p>
              </div>

              <Button onClick={() => saveSection('brand_settings', localBrand)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Identidade Visual
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Configurações de Envio
              </CardTitle>
              <CardDescription>
                Configure frete grátis, políticas de troca e devolução
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Frete Grátis</Label>
                    <Badge variant={localShipping.free_shipping_enabled ? "default" : "secondary"}>
                      {localShipping.free_shipping_enabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    value={localShipping.free_shipping_minimum}
                    onChange={(e) => setLocalShipping({ 
                      ...localShipping, 
                      free_shipping_minimum: Number(e.target.value) 
                    })}
                    placeholder="299"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor mínimo para frete grátis (em R$)
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Prazo de Devolução</Label>
                  <Input
                    type="number"
                    value={localShipping.return_days}
                    onChange={(e) => setLocalShipping({ 
                      ...localShipping, 
                      return_days: Number(e.target.value) 
                    })}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dias para devolução/troca
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Mensagem de Frete</Label>
                <Input
                  value={localShipping.shipping_notice}
                  onChange={(e) => setLocalShipping({ ...localShipping, shipping_notice: e.target.value })}
                  placeholder="Frete grátis para compras acima de R$299"
                />
              </div>

              <div className="space-y-4">
                <Label>Política de Troca</Label>
                <Input
                  value={localShipping.exchange_policy}
                  onChange={(e) => setLocalShipping({ ...localShipping, exchange_policy: e.target.value })}
                  placeholder="Primeira troca grátis em até 30 dias"
                />
              </div>

              <Button onClick={() => saveSection('shipping_settings', localShipping)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações de Envio
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social/Contact Settings */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contato e Redes Sociais
              </CardTitle>
              <CardDescription>
                Configure WhatsApp, redes sociais e informações de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>WhatsApp</Label>
                  <Input
                    value={localSocial.whatsapp_number}
                    onChange={(e) => setLocalSocial({ ...localSocial, whatsapp_number: e.target.value })}
                    placeholder="5511999999999"
                  />
                  <p className="text-xs text-muted-foreground">
                    Número com código do país (ex: 5511999999999)
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Mensagem Padrão WhatsApp</Label>
                  <Input
                    value={localSocial.whatsapp_message}
                    onChange={(e) => setLocalSocial({ ...localSocial, whatsapp_message: e.target.value })}
                    placeholder="Olá! Vim pelo site..."
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Instagram</Label>
                  <Input
                    value={localSocial.instagram_url}
                    onChange={(e) => setLocalSocial({ ...localSocial, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/sualoja"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Facebook</Label>
                  <Input
                    value={localSocial.facebook_url}
                    onChange={(e) => setLocalSocial({ ...localSocial, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/sualoja"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>TikTok</Label>
                  <Input
                    value={localSocial.tiktok_url}
                    onChange={(e) => setLocalSocial({ ...localSocial, tiktok_url: e.target.value })}
                    placeholder="https://tiktok.com/@sualoja"
                  />
                </div>

                <div className="space-y-4">
                  <Label>E-mail</Label>
                  <Input
                    value={localSocial.email}
                    onChange={(e) => setLocalSocial({ ...localSocial, email: e.target.value })}
                    placeholder="contato@sualoja.com.br"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Endereço</Label>
                <Input
                  value={localSocial.address}
                  onChange={(e) => setLocalSocial({ ...localSocial, address: e.target.value })}
                  placeholder="Rua Exemplo, 123 - São Paulo, SP"
                />
              </div>

              <Button onClick={() => saveSection('social_settings', localSocial)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Contato
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Settings */}
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informações Legais e Políticas
              </CardTitle>
              <CardDescription>
                Configure razão social, CNPJ e todas as políticas do site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Dados da Empresa</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Razão Social</Label>
                    <Input
                      value={localLegal.company_name}
                      onChange={(e) => setLocalLegal({ ...localLegal, company_name: e.target.value })}
                      placeholder="Nome Empresarial LTDA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input
                      value={localLegal.cnpj}
                      onChange={(e) => setLocalLegal({ ...localLegal, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                </div>
              </div>

              {/* Exchange Policy - Atacado */}
              <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">ATACADO</span>
                  Política de Troca Atacado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Esta política é exibida para produtos com "ATACADO" no título.
                </p>
                
                <div className="space-y-2">
                  <Label>Prazo para Troca (dias)</Label>
                  <Input
                    type="number"
                    value={localLegal.exchange_atacado_days}
                    onChange={(e) => setLocalLegal({ ...localLegal, exchange_atacado_days: parseInt(e.target.value) || 7 })}
                    min={1}
                    max={90}
                    className="max-w-[150px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Texto Principal da Política</Label>
                  <textarea
                    value={localLegal.exchange_atacado_text}
                    onChange={(e) => setLocalLegal({ ...localLegal, exchange_atacado_text: e.target.value })}
                    placeholder="Trocas somente em casos de defeito de fabricação..."
                    className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Condições para Troca</Label>
                  <textarea
                    value={localLegal.exchange_atacado_conditions}
                    onChange={(e) => setLocalLegal({ ...localLegal, exchange_atacado_conditions: e.target.value })}
                    placeholder="O produto deve estar sem uso, com etiquetas originais..."
                    className="w-full min-h-[60px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Exchange Policy - Varejo */}
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">VAREJO</span>
                  Política de Troca Varejo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Esta política é exibida para produtos com "VAREJO" no título.
                </p>
                
                <div className="space-y-2">
                  <Label>Prazo para Troca (dias)</Label>
                  <Input
                    type="number"
                    value={localLegal.exchange_varejo_days}
                    onChange={(e) => setLocalLegal({ ...localLegal, exchange_varejo_days: parseInt(e.target.value) || 7 })}
                    min={1}
                    max={90}
                    className="max-w-[150px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Texto Principal da Política</Label>
                  <textarea
                    value={localLegal.exchange_varejo_text}
                    onChange={(e) => setLocalLegal({ ...localLegal, exchange_varejo_text: e.target.value })}
                    placeholder="Aceitamos trocas em até 7 dias..."
                    className="w-full min-h-[80px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Condições para Troca</Label>
                  <textarea
                    value={localLegal.exchange_varejo_conditions}
                    onChange={(e) => setLocalLegal({ ...localLegal, exchange_varejo_conditions: e.target.value })}
                    placeholder="O produto deve estar sem uso, com etiquetas originais..."
                    className="w-full min-h-[60px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Privacy Policy */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Política de Privacidade</h3>
                <p className="text-sm text-muted-foreground">
                  Exibida no modal acessível pelo rodapé do site.
                </p>
                <textarea
                  value={localLegal.privacy_policy}
                  onChange={(e) => setLocalLegal({ ...localLegal, privacy_policy: e.target.value })}
                  placeholder="Digite aqui a política de privacidade completa da sua loja..."
                  className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Terms of Use */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Termos de Uso</h3>
                <p className="text-sm text-muted-foreground">
                  Exibido no modal acessível pelo rodapé do site.
                </p>
                <textarea
                  value={localLegal.terms_of_use}
                  onChange={(e) => setLocalLegal({ ...localLegal, terms_of_use: e.target.value })}
                  placeholder="Digite aqui os termos de uso completos da sua loja..."
                  className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Wholesale Policy */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Políticas de Atacado</h3>
                <p className="text-sm text-muted-foreground">
                  Exibida no modal acessível pelo rodapé e no modal de boas-vindas do atacado.
                </p>
                <textarea
                  value={localLegal.wholesale_policy}
                  onChange={(e) => setLocalLegal({ ...localLegal, wholesale_policy: e.target.value })}
                  placeholder="Digite aqui as políticas específicas para clientes atacadistas..."
                  className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Dica</AlertTitle>
                <AlertDescription>
                  Se você deixar os campos de políticas vazios, os modais usarão o conteúdo padrão definido nos componentes.
                </AlertDescription>
              </Alert>

              <Button onClick={() => saveSection('legal_settings', localLegal)} disabled={saving} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Salvar Informações Legais e Políticas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
