import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { Button } from "@/components/ui/button";
import { ChevronRight, Package, Sparkles, Truck, MessageCircle, CheckCircle } from "lucide-react";
import { getSiteSetting } from "@/lib/site-settings";

interface PrivateLabelSettings {
  enabled: boolean;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  hero_cta_text: string;
  hero_cta_link: string;
  section1_title: string;
  section1_description: string;
  section1_features: Array<{ title: string; description: string }>;
  section2_title: string;
  section2_description: string;
  section2_image: string;
  section3_title: string;
  section3_steps: Array<{ title: string; description: string }>;
  cta_title: string;
  cta_description: string;
  cta_button_text: string;
  cta_whatsapp_number: string;
}

const defaultSettings: PrivateLabelSettings = {
  enabled: true,
  hero_title: "PRIVATE LABEL",
  hero_subtitle: "Crie sua própria marca de moda fitness com a qualidade Avance Modas. Oferecemos produção personalizada com seu logo e etiquetas exclusivas.",
  hero_image: "",
  hero_cta_text: "Solicitar Orçamento",
  hero_cta_link: "#contato",
  section1_title: "Por que escolher Private Label?",
  section1_description: "Tenha sua própria marca de roupas fitness sem precisar investir em estrutura de produção. Nós cuidamos de tudo para você.",
  section1_features: [
    { title: "Produção Própria", description: "Fabricamos internamente com controle total de qualidade." },
    { title: "Personalização Total", description: "Etiquetas, tags e embalagens com sua marca." },
    { title: "Pedido Mínimo Acessível", description: "Quantidades flexíveis para você começar." },
    { title: "Entrega Rápida", description: "Produção ágil e envio para todo o Brasil." },
  ],
  section2_title: "Qualidade Garantida",
  section2_description: "Utilizamos os mesmos tecidos e acabamentos premium da linha Avance Modas. Sua marca terá produtos de alta qualidade, reconhecidos no mercado fitness.",
  section2_image: "",
  section3_title: "Como Funciona",
  section3_steps: [
    { title: "1. Entre em Contato", description: "Fale conosco via WhatsApp ou formulário." },
    { title: "2. Escolha os Modelos", description: "Selecione os produtos do nosso catálogo." },
    { title: "3. Personalize", description: "Envie seu logo e informações da etiqueta." },
    { title: "4. Aprovação", description: "Validamos a arte e iniciamos a produção." },
    { title: "5. Entrega", description: "Receba seus produtos prontos para venda." },
  ],
  cta_title: "Pronto para começar sua marca?",
  cta_description: "Entre em contato agora e solicite um orçamento personalizado. Nossa equipe está pronta para ajudar você a criar sua linha exclusiva de moda fitness.",
  cta_button_text: "Falar no WhatsApp",
  cta_whatsapp_number: "5511999999999",
};

const PrivateLabelPage = () => {
  const [settings, setSettings] = useState<PrivateLabelSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSetting<PrivateLabelSettings>('private_label');
        if (data) {
          setSettings({ ...defaultSettings, ...data });
        }
      } catch (error) {
        console.error('Error loading private label settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Tenho interesse no serviço de Private Label. Gostaria de mais informações.");
    window.open(`https://wa.me/${settings.cta_whatsapp_number}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <div className="container py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-secondary rounded-lg"></div>
            <div className="h-8 bg-secondary rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-secondary rounded w-3/4 mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const iconMap: Record<number, React.ReactNode> = {
    0: <Package className="w-8 h-8" />,
    1: <Sparkles className="w-8 h-8" />,
    2: <Truck className="w-8 h-8" />,
    3: <CheckCircle className="w-8 h-8" />,
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container px-4 sm:px-6 py-2 sm:py-3">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <Link to="/categoria/lancamentos" className="hover:text-foreground transition-colors">Lançamentos</Link>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-foreground font-medium">Private Label</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {settings.hero_image && (
          <div className="absolute inset-0 z-0">
            <img 
              src={settings.hero_image} 
              alt="Private Label" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          </div>
        )}
        <div className="container relative z-10 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight">
              {settings.hero_title}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed">
              {settings.hero_subtitle}
            </p>
            <Button 
              size="lg" 
              className="text-sm sm:text-base px-8 py-6"
              onClick={handleWhatsAppClick}
            >
              {settings.hero_cta_text}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-secondary/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {settings.section1_title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {settings.section1_description}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {settings.section1_features.map((feature, idx) => (
              <div key={idx} className="bg-card p-6 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {iconMap[idx] || <Package className="w-8 h-8" />}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="py-16 sm:py-20">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {settings.section2_title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {settings.section2_description}
              </p>
              <ul className="mt-6 space-y-3">
                {['Tecidos de alta qualidade', 'Acabamento premium', 'Modelagem confortável', 'Durabilidade garantida'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-foreground">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              {settings.section2_image ? (
                <img 
                  src={settings.section2_image} 
                  alt="Qualidade" 
                  className="w-full aspect-[4/3] object-cover rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-secondary rounded-xl flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 sm:py-20 bg-secondary/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {settings.section3_title}
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {settings.section3_steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 sm:gap-6 items-start">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-card p-4 sm:p-6 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-foreground mb-1">{step.title.replace(/^\d+\.\s*/, '')}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contato" className="py-16 sm:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {settings.cta_title}
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              {settings.cta_description}
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-sm sm:text-base px-8 py-6 gap-2"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="w-5 h-5" />
              {settings.cta_button_text}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivateLabelPage;
