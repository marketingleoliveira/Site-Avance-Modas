import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageCircle, Mail, MapPin, Instagram, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ContactSettings {
  whatsapp_number: string;
  email: string;
  address: string;
  instagram: string;
  [key: string]: string;
}

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    whatsapp_number: "5511999999999",
    email: "contato@avancemodas.com.br",
    address: "Endereço da loja",
    instagram: "@avancemodas"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_settings')
        .maybeSingle();

      if (data?.setting_value) {
        setContactSettings(data.setting_value as ContactSettings);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission - in production, you'd send this to an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setLoading(false);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Olá! Vim pelo site da Avance Modas e gostaria de mais informações.");
    window.open(`https://wa.me/${contactSettings.whatsapp_number}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-secondary py-10 sm:py-12 lg:py-16">
        <div className="container px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">Contato</h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Estamos aqui para ajudar! Entre em contato conosco por qualquer um dos canais abaixo.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-16">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="bg-card p-5 sm:p-6 lg:p-8 rounded-lg shadow-soft order-2 lg:order-1">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Envie uma mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Nome</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">E-mail</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Telefone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Mensagem</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Como podemos ajudar?"
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 order-1 lg:order-2">
              {/* WhatsApp Card */}
              <div className="bg-card p-5 sm:p-6 lg:p-8 rounded-lg shadow-soft">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">Fale Conosco</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Prefere um atendimento mais rápido? Clique no botão abaixo para falar diretamente conosco pelo WhatsApp.
                </p>
                <Button 
                  onClick={handleWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Chamar no WhatsApp
                </Button>
              </div>

              {/* Other Contact Info */}
              <div className="bg-card p-5 sm:p-6 lg:p-8 rounded-lg shadow-soft space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">Outras Formas de Contato</h2>
                
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">E-mail</h3>
                    <a href={`mailto:${contactSettings.email}`} className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors break-all">
                      {contactSettings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Endereço</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{contactSettings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base">Instagram</h3>
                    <a 
                      href={`https://instagram.com/${contactSettings.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {contactSettings.instagram}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
