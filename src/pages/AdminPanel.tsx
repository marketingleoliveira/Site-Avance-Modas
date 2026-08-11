import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getSiteSetting, updateSiteSetting, uploadSiteImage, HeroSettings, StoreSelectorSettings, FeaturesSettings, ContactSettings, LayoutSettings, ProductSectionsSettings, ProductSection, InstagramSettings, AtacadoSettings, VideosSettings, PromoBannerSettings, AnnouncementSettings, CountdownBannerSettings, createAdminUser } from "@/lib/site-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Save, Image, Home, Settings, Phone, Layout, Grid, Plus, Trash2, ArrowUp, ArrowDown, Mail, Download, Users, Instagram, UserPlus, Shield, ShoppingBag, Loader2, Play, Tag, Megaphone, Truck, Percent, CreditCard, RefreshCw, Star, Gift, Clock, Check, Heart, Package, Zap, Award, ThumbsUp, Store, Wrench, BookOpen, MessageSquare, ChevronDown, ChevronRight, PanelLeft, FileText, Palette, Type, LayoutDashboard, HeadphonesIcon, MessageCircle } from "lucide-react";
import logoAvance from "@/assets/logo-avance.png";
import RouteSEO from "@/components/seo/RouteSEO";
import HeroEditor from "@/components/admin/HeroEditor";
import VideosEditor from "@/components/admin/VideosEditor";
import PromoBannerEditor from "@/components/admin/PromoBannerEditor";
import AnnouncementEditor from "@/components/admin/AnnouncementEditor";
import StoreConfigEditor, { ShopifyConfigSettings, BrandSettings, ShippingSettings, SocialSettings, LegalSettings } from "@/components/admin/StoreConfigEditor";
import MaintenanceEditor, { MaintenanceSettings } from "@/components/admin/MaintenanceEditor";
import DocumentationPage from "@/components/admin/DocumentationPage";
import PrivateLabelEditor from "@/components/admin/PrivateLabelEditor";
import CountdownBannerEditor from "@/components/admin/CountdownBannerEditor";
import SACManager from "@/components/admin/SACManager";
import SupportTicketsManager from "@/components/admin/SupportTicketsManager";
import DashboardStats from "@/components/admin/DashboardStats";
import SizeChartManager from "@/components/admin/SizeChartManager";
import WholesaleOrdersManager from "@/components/admin/WholesaleOrdersManager";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import CouponsManager from "@/components/admin/CouponsManager";
import RestockManager from "@/components/admin/RestockManager";
import GuidesManager from "@/components/admin/GuidesManager";
import SearchConsoleDashboard from "@/components/admin/SearchConsoleDashboard";
import MarketingRequestManager from "@/components/admin/MarketingRequestManager";
import { cn } from "@/lib/utils";

interface NewsletterSubscriber {
  id: string;
  email: string | null;
  whatsapp: string | null;
  subscribed_at: string;
  source: string;
  is_active: boolean;
}

interface AdminUser {
  user_id: string;
  created_at: string;
  email?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeType?: 'warning' | 'info' | 'success';
}

interface MenuCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const AdminPanel = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["vendas"]);
  
  // Notification counts
  const [pendingSacCount, setPendingSacCount] = useState(0);
  const [newSubscribersCount, setNewSubscribersCount] = useState(0);
  const [openSupportCount, setOpenSupportCount] = useState(0);
  const [pendingWholesaleCount, setPendingWholesaleCount] = useState(0);
  
  const [heroAtacado, setHeroAtacado] = useState<HeroSettings | null>(null);
  const [heroVarejo, setHeroVarejo] = useState<HeroSettings | null>(null);
  const [storeSelector, setStoreSelector] = useState<StoreSelectorSettings | null>(null);
  const [featuresAtacado, setFeaturesAtacado] = useState<FeaturesSettings | null>(null);
  const [featuresVarejo, setFeaturesVarejo] = useState<FeaturesSettings | null>(null);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings | null>(null);
  const [sectionsAtacado, setSectionsAtacado] = useState<ProductSectionsSettings | null>(null);
  const [sectionsVarejo, setSectionsVarejo] = useState<ProductSectionsSettings | null>(null);
  const [instagramSettings, setInstagramSettings] = useState<InstagramSettings | null>(null);
  const [atacadoSettings, setAtacadoSettings] = useState<AtacadoSettings | null>(null);
  const [videosSettings, setVideosSettings] = useState<VideosSettings | null>(null);
  const [promoBannerSettings, setPromoBannerSettings] = useState<PromoBannerSettings | null>(null);
  const [countdownBannerSettings, setCountdownBannerSettings] = useState<CountdownBannerSettings | null>(null);
  const [announcementSettings, setAnnouncementSettings] = useState<AnnouncementSettings | null>(null);
  const [shopifyConfig, setShopifyConfig] = useState<ShopifyConfigSettings | null>(null);
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [socialSettings, setSocialSettings] = useState<SocialSettings | null>(null);
  const [legalSettings, setLegalSettings] = useState<LegalSettings | null>(null);
  const [maintenanceSettings, setMaintenanceSettings] = useState<MaintenanceSettings | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New admin form
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  
  // Change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Load notification counts
  const loadNotificationCounts = async () => {
    try {
      // Get pending SAC tickets count
      const { count: sacCount, error: sacError } = await supabase
        .from('sac_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente');
      
      if (!sacError && sacCount !== null) {
        setPendingSacCount(sacCount);
      }

      // Get new subscribers from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: subscriberCount, error: subscriberError } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .gte('subscribed_at', sevenDaysAgo.toISOString())
        .eq('is_active', true);
      
      if (!subscriberError && subscriberCount !== null) {
        setNewSubscribersCount(subscriberCount);
      }

      // Get open support tickets count
      const { count: supportCount, error: supportError } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aberto');
      
      if (!supportError && supportCount !== null) {
        setOpenSupportCount(supportCount);
      }

      // Get pending wholesale orders count
      const { count: wholesaleCount, error: wholesaleError } = await supabase
        .from('wholesale_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente');
      
      if (!wholesaleError && wholesaleCount !== null) {
        setPendingWholesaleCount(wholesaleCount);
      }
    } catch (error) {
      console.error('Error loading notification counts:', error);
    }
  };

  // Dashboard item (standalone, always at top)
  const dashboardItem: MenuItem = {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />
  };

  // Menu categories with dynamic badges
  const menuCategories: MenuCategory[] = useMemo(() => [
    {
      id: "estrutura",
      label: "Estrutura & Layout",
      icon: <Palette className="w-4 h-4" />,
      items: [
        { id: "store-config", label: "Configurações da Loja", icon: <Store className="w-4 h-4" /> },
        { id: "maintenance", label: "Modo Manutenção", icon: <Wrench className="w-4 h-4" />, badge: maintenanceSettings?.enabled ? "ATIVO" : undefined, badgeType: 'warning' as const },
        { id: "selector", label: "Página de Entrada", icon: <Image className="w-4 h-4" /> },
        { id: "layout", label: "Layout & Grades", icon: <Layout className="w-4 h-4" /> },
        { id: "sections", label: "Seções de Produtos", icon: <Grid className="w-4 h-4" /> },
        { id: "features", label: "Barra de Benefícios", icon: <Settings className="w-4 h-4" /> },
        { id: "size-charts", label: "Tabelas de Medidas", icon: <FileText className="w-4 h-4" /> },
        { id: "testimonials", label: "Depoimentos", icon: <Star className="w-4 h-4" /> },
      ]
    },
    {
      id: "conteudo",
      label: "Conteúdo & Textos",
      icon: <Type className="w-4 h-4" />,
      items: [
        { id: "announcement", label: "Barra de Anúncios", icon: <Megaphone className="w-4 h-4" /> },
        { id: "countdown", label: "Banner Countdown", icon: <Clock className="w-4 h-4" /> },
        { id: "atacado", label: "Hero Atacado", icon: <Image className="w-4 h-4" /> },
        { id: "varejo", label: "Hero Varejo", icon: <Image className="w-4 h-4" /> },
        { id: "videos", label: "Vídeos das Modelos", icon: <Play className="w-4 h-4" /> },
        { id: "promo-banner", label: "Banner Promocional", icon: <Tag className="w-4 h-4" /> },
        { id: "atacado-config", label: "Regras Atacado", icon: <ShoppingBag className="w-4 h-4" /> },
        { id: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" /> },
        { id: "contact", label: "Contato", icon: <Phone className="w-4 h-4" /> },
        { id: "private-label", label: "Private Label", icon: <Tag className="w-4 h-4" /> },
        { id: "guides", label: "Guias (SEO)", icon: <BookOpen className="w-4 h-4" /> },
        { id: "search-console", label: "Search Console", icon: <LayoutDashboard className="w-4 h-4" /> },
      ]
    },
    {
      id: "vendas",
      label: "Vendas",
      icon: <ShoppingBag className="w-4 h-4" />,
      items: [
        { id: "wholesale-orders", label: "Solicitações Atacado", icon: <Package className="w-4 h-4" />, badge: pendingWholesaleCount > 0 ? String(pendingWholesaleCount) : undefined, badgeType: 'warning' as const },
        { id: "coupons", label: "Cupons de Desconto", icon: <Percent className="w-4 h-4" /> },
        { id: "restock", label: "Reposição", icon: <RefreshCw className="w-4 h-4" /> },
        { id: "marketing-request", label: "Solicitação", icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      id: "atendimento",
      label: "Atendimento & Gestão",
      icon: <MessageSquare className="w-4 h-4" />,
      items: [
        { id: "sac", label: "SAC - Atendimento", icon: <MessageSquare className="w-4 h-4" />, badge: pendingSacCount > 0 ? String(pendingSacCount) : undefined, badgeType: 'warning' as const },
        { id: "support-tickets", label: "Suporte em Tempo Real", icon: <HeadphonesIcon className="w-4 h-4" />, badge: openSupportCount > 0 ? String(openSupportCount) : undefined, badgeType: 'warning' as const },
        { id: "newsletter", label: "Contatos WhatsApp", icon: <MessageCircle className="w-4 h-4" />, badge: newSubscribersCount > 0 ? `+${newSubscribersCount}` : undefined, badgeType: 'info' as const },
        { id: "admins", label: "Administradores", icon: <Shield className="w-4 h-4" /> },
        { id: "docs", label: "Documentação", icon: <BookOpen className="w-4 h-4" /> },
      ]
    }
  ], [maintenanceSettings?.enabled, pendingSacCount, newSubscribersCount, openSupportCount, pendingWholesaleCount]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
      const [atacado, varejo, selector, featAtacado, featVarejo, contact, layout, secAtacado, secVarejo, instagram, atacadoConfig, videos, promoBanner, countdownBanner, announcement, shopify, brand, shipping, social, legal, maintenance] = await Promise.all([
        getSiteSetting<HeroSettings>('hero_atacado'),
        getSiteSetting<HeroSettings>('hero_varejo'),
        getSiteSetting<StoreSelectorSettings>('store_selector'),
        getSiteSetting<FeaturesSettings>('features_atacado'),
        getSiteSetting<FeaturesSettings>('features_varejo'),
        getSiteSetting<ContactSettings>('contact_settings'),
        getSiteSetting<LayoutSettings>('layout_settings'),
        getSiteSetting<ProductSectionsSettings>('product_sections_atacado'),
        getSiteSetting<ProductSectionsSettings>('product_sections_varejo'),
        getSiteSetting<InstagramSettings>('instagram_settings'),
        getSiteSetting<AtacadoSettings>('atacado_settings'),
        getSiteSetting<VideosSettings>('videos_settings'),
        getSiteSetting<PromoBannerSettings>('promo_banner_settings'),
        getSiteSetting<CountdownBannerSettings>('countdown_banner_settings'),
        getSiteSetting<AnnouncementSettings>('announcement_settings'),
        getSiteSetting<ShopifyConfigSettings>('shopify_config'),
        getSiteSetting<BrandSettings>('brand_settings'),
        getSiteSetting<ShippingSettings>('shipping_settings'),
        getSiteSetting<SocialSettings>('social_settings'),
        getSiteSetting<LegalSettings>('legal_settings'),
        getSiteSetting<MaintenanceSettings>('maintenance_settings'),
      ]);
      setHeroAtacado(atacado);
      setHeroVarejo(varejo);
      setStoreSelector(selector);
      setFeaturesAtacado(featAtacado);
      setFeaturesVarejo(featVarejo);
      
      // Migrate legacy features if needed
      if (!featAtacado || !featVarejo) {
        getSiteSetting<FeaturesSettings>('features').then(legacy => {
          if (legacy) {
            if (!featAtacado) setFeaturesAtacado(legacy);
            if (!featVarejo) setFeaturesVarejo(legacy);
          }
        });
      }
      setContactSettings(contact || {
        whatsapp_number: "5511932105187",
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
      setCountdownBannerSettings(countdownBanner || {
        enabled: false,
        promo_text: "PROMO - FRETE EXPRESSO POR 14,90 PARA TODO O BRASIL!",
        button_text: "APROVEITAR AGORA",
        button_link: "/#produtos",
        end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      setAnnouncementSettings(announcement || {
        enabled: true,
        messages: [
          "FRETE GRÁTIS ACIMA DE R$299",
          "GRADE ABERTA - QUALQUER QUANTIDADE",
          "ATÉ 3X SEM JUROS"
        ],
        interval: 4000
      });
      setShopifyConfig(shopify);
      setBrandSettings(brand);
      setShippingSettings(shipping);
      setSocialSettings(social);
      setLegalSettings(legal);
      setMaintenanceSettings(maintenance);
    };
    
    if (isAdmin) {
      loadSettings();
      loadSubscribers();
      loadAdminUsers();
      loadNotificationCounts();
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

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
    }
  };

  const exportSubscribers = () => {
    if (subscribers.length === 0) {
      toast.error("Nenhum inscrito para exportar");
      return;
    }

    const csvContent = [
      ['WhatsApp', 'Email', 'Data de Inscrição', 'Fonte', 'Ativo'],
      ...subscribers.map(s => [
        s.whatsapp || '',
        s.email || '',
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
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `store_selector/${String(imageKey)}-${Date.now()}.${ext}`;
    try {
      const url = await uploadSiteImage(file, path);
      if (url) {
        setStoreSelector({ ...storeSelector, [imageKey]: url });
        toast.success("Imagem enviada com sucesso!");
      } else {
        toast.error("Erro ao enviar imagem");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar imagem");
    }
  };

  const handleHeroImageUpload = async (
    file: File, 
    type: 'atacado' | 'varejo'
  ) => {
    const settings = type === 'atacado' ? heroAtacado : heroVarejo;
    const setSetting = type === 'atacado' ? setHeroAtacado : setHeroVarejo;
    if (!settings) return;
    
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `hero_${type}/image_url-${Date.now()}.${ext}`;
    try {
      const url = await uploadSiteImage(file, path);
      if (url) {
        setSetting({ ...settings, image_url: url });
        toast.success("Imagem enviada com sucesso!");
      } else {
        toast.error("Erro ao enviar imagem");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar imagem");
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

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats />;
      
      case "wholesale-orders":
        return <WholesaleOrdersManager />;
      
      case "coupons":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Cupons de Desconto
              </CardTitle>
              <CardDescription>
                Crie e gerencie cupons aplicados no checkout do Shopify (sem conflito com o sistema de pagamento)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CouponsManager />
            </CardContent>
          </Card>
        );
      
      case "restock":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Reposição de Estoque
              </CardTitle>
              <CardDescription>
                Sincronizado com o estoque do Shopify. Atualiza automaticamente a cada 30 segundos e registra toda
                reposição de produtos em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestockManager />
            </CardContent>
          </Card>
        );

      case "marketing-request":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Solicitação de Peças (Marketing)
              </CardTitle>
              <CardDescription>
                Crie documentos PDF para solicitação de peças do estoque para a equipe de marketing.
                Inclui campos para SKU, Tamanho, Cor e Tipo de Tecido, além de espaços para assinaturas de retirada e devolução.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketingRequestManager />
            </CardContent>
          </Card>
        );
      
      case "marketing-request":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Solicitação de Peças (Marketing)
              </CardTitle>
              <CardDescription>
                Crie documentos PDF para solicitação de peças do estoque para a equipe de marketing.
                Inclui campos para SKU, Tamanho, Cor e Tipo de Tecido, além de espaços para assinaturas de retirada e devolução.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketingRequestManager />
            </CardContent>
          </Card>
        );
      
      case "wholesale-orders":
        return <WholesaleOrdersManager />;
      
      case "coupons":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Cupons de Desconto
              </CardTitle>
              <CardDescription>
                Crie e gerencie cupons aplicados no checkout do Shopify (sem conflito com o sistema de pagamento)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CouponsManager />
            </CardContent>
          </Card>
        );
      
      case "restock":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Reposição de Estoque
              </CardTitle>
              <CardDescription>
                Sincronizado com o estoque do Shopify. Atualiza automaticamente a cada 30 segundos e registra toda
                reposição de produtos em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestockManager />
            </CardContent>
          </Card>
        );
      
      case "store-config":
        return (
          <StoreConfigEditor
            shopifyConfig={shopifyConfig}
            brandSettings={brandSettings}
            shippingSettings={shippingSettings}
            socialSettings={socialSettings}
            legalSettings={legalSettings}
            onUpdate={() => {
              getSiteSetting<ShopifyConfigSettings>('shopify_config').then(setShopifyConfig);
              getSiteSetting<BrandSettings>('brand_settings').then(setBrandSettings);
              getSiteSetting<ShippingSettings>('shipping_settings').then(setShippingSettings);
              getSiteSetting<SocialSettings>('social_settings').then(setSocialSettings);
              getSiteSetting<LegalSettings>('legal_settings').then(setLegalSettings);
            }}
          />
        );

      case "maintenance":
        return (
          <MaintenanceEditor
            settings={maintenanceSettings}
            onUpdate={() => {
              getSiteSetting<MaintenanceSettings>('maintenance_settings').then(setMaintenanceSettings);
            }}
          />
        );

      case "selector":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Página de Seleção (Entrada)</CardTitle>
              <CardDescription>
                Configure as imagens exibidas na página inicial de escolha entre Atacado e Varejo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Homepage (Página de Seleção)</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="homepage-toggle" className="text-sm font-normal text-muted-foreground">
                      {storeSelector?.homepage_enabled !== false ? "Ativa" : "Desativada"}
                    </Label>
                    <Switch
                      id="homepage-toggle"
                      checked={storeSelector?.homepage_enabled !== false}
                      onCheckedChange={(checked) => {
                        if (!storeSelector) return;
                        setStoreSelector({ ...storeSelector, homepage_enabled: checked });
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quando desativada, o usuário que acessar a raiz do site (<code>/</code>) será redirecionado diretamente para a página de Varejo, sem ver a tela de escolha entre Atacado e Varejo. Lembre-se de clicar em "Salvar Configurações" abaixo.
                </p>
              </div>
              <div className="space-y-4 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Banner do Topo (Header)</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="header-banner-toggle" className="text-sm font-normal text-muted-foreground">
                      {storeSelector?.header_banner_enabled !== false ? "Ativo" : "Inativo"}
                    </Label>
                    <Switch
                      id="header-banner-toggle"
                      checked={storeSelector?.header_banner_enabled !== false}
                      onCheckedChange={(checked) => {
                        if (!storeSelector) return;
                        setStoreSelector({ ...storeSelector, header_banner_enabled: checked });
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Imagem horizontal exibida no topo da página de entrada. Recomendado: 1920x640px.
                </p>
                {storeSelector?.header_banner_image && (
                  <img
                    src={storeSelector.header_banner_image}
                    alt="Banner do topo"
                    className="w-full max-h-56 object-cover rounded-lg border"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleStoreSelectorImageUpload(file, 'header_banner_image');
                  }}
                />
              </div>
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
        );

      case "announcement":
        return (
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
        );

      case "countdown":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Banner com Countdown
              </CardTitle>
              <CardDescription>
                Configure o banner de oferta com contagem regressiva no topo do site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CountdownBannerEditor
                settings={countdownBannerSettings}
                onChange={setCountdownBannerSettings}
              />
              <Button 
                onClick={() => saveSettings('countdown_banner_settings', countdownBannerSettings)}
                disabled={saving}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Countdown"}
              </Button>
            </CardContent>
          </Card>
        );

      case "atacado":
        return (
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
        );

      case "varejo":
        return (
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
        );

      case "videos":
        return (
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
        );

      case "promo-banner":
        return (
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
        );

      case "atacado-config":
        return (
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
        );

      case "features":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Barra de Benefícios</CardTitle>
              <CardDescription>
                Configure os ícones e textos da barra de benefícios abaixo do hero
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Varejo</h3>
                </div>
                {renderFeaturesEditor('varejo')}
              </div>
              
              <div className="pt-8 border-t space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Atacado</h3>
                </div>
                {renderFeaturesEditor('atacado')}
              </div>
            </CardContent>
          </Card>
        );

      case "contact":
        return (
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
                    placeholder="5511932105187"
                  />
                  <p className="text-xs text-muted-foreground">Ex: 5511932105187 (sem + ou espaços)</p>
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
        );

      case "layout":
        return (
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
        );

      case "sections":
        return (
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
        );

      case "newsletter":
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Contatos WhatsApp
                  </CardTitle>
                  <CardDescription>
                    Gerencie os contatos de WhatsApp capturados no site
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
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum contato ainda</p>
                  <p className="text-sm mt-1">Os números de WhatsApp capturados aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-2">
                    <span>Total: <strong className="text-foreground">{subscribers.length}</strong> contatos</span>
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
                          <p className="font-medium text-sm">
                            {subscriber.whatsapp
                              ? subscriber.whatsapp.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
                              : subscriber.email || '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Capturado em {new Date(subscriber.subscribed_at).toLocaleDateString('pt-BR', {
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
        );

      case "instagram":
        return (
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
        );

      case "admins":
        return (
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

              {/* Change own password */}
              <div className="p-4 bg-secondary rounded-lg space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Alterar sua senha
                </h3>
                <p className="text-sm text-muted-foreground">
                  Logado como: <strong>{user?.email}</strong>
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nova Senha</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Nova Senha</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>
                <Button onClick={handleChangePassword} disabled={changingPassword}>
                  <Shield className="w-4 h-4 mr-2" />
                  {changingPassword ? "Alterando..." : "Alterar Senha"}
                </Button>
              </div>

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
        );

      case "sac":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Central de Atendimento (SAC)
              </CardTitle>
              <CardDescription>
                Gerencie as solicitações e reclamações dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SACManager />
            </CardContent>
          </Card>
        );

      case "wholesale-orders":
        return <WholesaleOrdersManager />;

      case "restock":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Reposição de Estoque
              </CardTitle>
              <CardDescription>
                Sincronizado com o estoque do Shopify. Atualiza automaticamente a cada 30 segundos e registra toda
                reposição de produtos em tempo real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RestockManager />
            </CardContent>
          </Card>
        );
      

      case "coupons":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Cupons de Desconto
              </CardTitle>
              <CardDescription>
                Crie e gerencie cupons aplicados no checkout do Shopify (sem conflito com o sistema de pagamento)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CouponsManager />
            </CardContent>
          </Card>
        );

      case "support-tickets":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeadphonesIcon className="w-5 h-5" />
                Suporte em Tempo Real
              </CardTitle>
              <CardDescription>
                Gerencie as solicitações de ajuda dos clientes em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupportTicketsManager />
            </CardContent>
          </Card>
        );

      case "private-label":
        return <PrivateLabelEditor />;

      case "docs":
        return <DocumentationPage />;

      case "size-charts":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tabelas de Medidas por Produto
              </CardTitle>
              <CardDescription>
                Envie uma tabela de medidas personalizada para cada produto. Produtos sem tabela usarão a tabela padrão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SizeChartManager />
            </CardContent>
          </Card>
        );

      case "testimonials":
        return <TestimonialsManager />;

      case "guides":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Guias (Hub de SEO)
              </CardTitle>
              <CardDescription>
                Crie e gerencie artigos pilares publicados em /guias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GuidesManager />
            </CardContent>
          </Card>
        );

      case "search-console":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Google Search Console
              </CardTitle>
              <CardDescription>
                Consultas, páginas, CTR, posição média e inspeção de URLs — direto do Search Console.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchConsoleDashboard />
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderFeaturesEditor = (type: 'atacado' | 'varejo') => {
    const feat = type === 'atacado' ? featuresAtacado : featuresVarejo;
    const setFeat = type === 'atacado' ? setFeaturesAtacado : setFeaturesVarejo;
    const key = type === 'atacado' ? 'features_atacado' : 'features_varejo';

    return (
      <div className="space-y-6">
        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview ({type === 'atacado' ? 'Atacado' : 'Varejo'})</Label>
          <div className="bg-primary text-primary-foreground rounded-lg overflow-hidden" style={{ height: '60px' }}>
            <div className="h-full flex items-center justify-center px-4 gap-6 overflow-x-auto">
              {feat?.items.map((item, index) => {
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
        <div className="space-y-4">
          {feat?.items.map((item, index) => (
            <div key={index} className="grid md:grid-cols-5 gap-4 p-4 bg-secondary rounded-lg items-end">
              <div className="space-y-2">
                <Label>Ícone</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={item.icon}
                  onChange={(e) => {
                    const newItems = [...(feat?.items || [])];
                    newItems[index] = { ...newItems[index], icon: e.target.value };
                    setFeat({ items: newItems });
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
                    const newItems = [...(feat?.items || [])];
                    newItems[index] = { ...newItems[index], title: e.target.value };
                    setFeat({ items: newItems });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={item.description}
                  onChange={(e) => {
                    const newItems = [...(feat?.items || [])];
                    newItems[index] = { ...newItems[index], description: e.target.value };
                    setFeat({ items: newItems });
                  }}
                />
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (index === 0) return;
                    const newItems = [...(feat?.items || [])];
                    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
                    setFeat({ items: newItems });
                  }}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (index === (feat?.items.length || 0) - 1) return;
                    const newItems = [...(feat?.items || [])];
                    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
                    setFeat({ items: newItems });
                  }}
                  disabled={index === (feat?.items.length || 0) - 1}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newItems = feat?.items.filter((_, i) => i !== index) || [];
                  setFeat({ items: newItems });
                }}
                disabled={(feat?.items.length || 0) <= 1}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const newItem = { icon: "truck", title: "Novo Benefício", description: "Descrição" };
              setFeat({ items: [...(feat?.items || []), newItem] });
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Benefício
          </Button>
          <Button 
            onClick={() => saveSettings(key, feat)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : `Salvar ${type === 'atacado' ? 'Atacado' : 'Varejo'}`}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-secondary flex">
      <RouteSEO title="Painel Admin | Avance Modas" description="Painel administrativo." path="/admin" noindex />
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r border-border flex flex-col transition-all duration-300 sticky top-0 h-screen",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={logoAvance} alt="Avance" className="h-8 object-contain" />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Dashboard Button (standalone) */}
          <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors mb-4",
              activeTab === "dashboard"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              !sidebarOpen && "justify-center px-2"
            )}
          >
            {dashboardItem.icon}
            {sidebarOpen && <span>{dashboardItem.label}</span>}
          </button>

          {menuCategories.map((category) => (
            <div key={category.id} className="mb-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors",
                  !sidebarOpen && "justify-center px-2"
                )}
              >
                {category.icon}
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{category.label}</span>
                    {expandedCategories.includes(category.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>
              
              {sidebarOpen && expandedCategories.includes(category.id) && (
                <div className="mt-1 space-y-1 pl-4">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                        activeTab === item.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      {item.icon}
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium animate-pulse",
                          item.badgeType === 'warning' && "bg-destructive text-destructive-foreground",
                          item.badgeType === 'info' && "bg-primary text-primary-foreground",
                          item.badgeType === 'success' && "bg-accent text-accent-foreground",
                          !item.badgeType && "bg-muted text-muted-foreground"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!sidebarOpen && (
                <div className="mt-1 space-y-1">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      title={item.label}
                      className={cn(
                        "w-full flex items-center justify-center p-2 rounded-md transition-colors relative",
                        activeTab === item.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      {item.icon}
                      {item.badge && (
                        <span className={cn(
                          "absolute -top-1 -right-1 w-4 h-4 text-[8px] flex items-center justify-center rounded-full font-bold animate-pulse",
                          item.badgeType === 'warning' && "bg-destructive text-destructive-foreground",
                          item.badgeType === 'info' && "bg-primary text-primary-foreground",
                          !item.badgeType && "bg-muted text-muted-foreground"
                        )}>
                          {item.badge.length > 2 ? '!' : item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          {sidebarOpen ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href="/" target="_blank">
                    <Home className="w-3 h-3 mr-1" />
                    Site
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="icon" asChild>
                <a href="/" target="_blank" title="Ver Site">
                  <Home className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Painel de Controle</h1>
              <p className="text-sm text-muted-foreground">
                {menuCategories.flatMap(c => c.items).find(i => i.id === activeTab)?.label || "Dashboard"}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
