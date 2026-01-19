import { useEffect, useState } from "react";
import { Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSetting } from "@/lib/site-settings";
import logoAvance from "@/assets/logo-avance.png";

interface MaintenanceSettings {
  enabled: boolean;
  message?: string;
}

interface SocialSettings {
  whatsapp_number?: string;
  whatsapp_message?: string;
  instagram_url?: string;
  tiktok_url?: string;
}

export default function MaintenancePage() {
  const [socialSettings, setSocialSettings] = useState<SocialSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const social = await getSiteSetting<SocialSettings>('social_settings');
      setSocialSettings(social);
    };
    loadSettings();
  }, []);

  const whatsappNumber = socialSettings?.whatsapp_number || "5511999999999";
  const whatsappMessage = encodeURIComponent(socialSettings?.whatsapp_message || "Olá! Gostaria de saber quando o site volta ao ar.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-card p-6 rounded-2xl shadow-xl border border-border">
            <img 
              src={logoAvance} 
              alt="Logo" 
              className="h-20 md:h-24 object-contain"
            />
          </div>
        </div>

        {/* Animated Icon */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <svg 
              className="w-10 h-10 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Estamos em Manutenção
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Nosso site está passando por melhorias para oferecer uma experiência ainda melhor para você.
          </p>
          <p className="text-xl font-semibold text-primary">
            Voltamos em breve!
          </p>
        </div>

        {/* Social Links */}
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Enquanto isso, nos acompanhe nas redes sociais:
          </p>
          
          <div className="flex items-center justify-center gap-4">
            {/* Instagram */}
            <Button
              variant="outline"
              size="lg"
              className="gap-2 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 transition-all"
              onClick={() => window.open("https://instagram.com/avancemodasoficial", "_blank")}
            >
              <Instagram className="w-5 h-5" />
              Instagram
            </Button>

            {/* TikTok */}
            <Button
              variant="outline"
              size="lg"
              className="gap-2 hover:bg-slate-50 hover:border-slate-400 transition-all"
              onClick={() => window.open("https://tiktok.com/@avancemodasoficial", "_blank")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              TikTok
            </Button>
          </div>
        </div>

        {/* WhatsApp Button */}
        <div className="pt-4">
          <Button
            size="lg"
            className="gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all"
            onClick={() => window.open(whatsappUrl, "_blank")}
          >
            <MessageCircle className="w-6 h-6" />
            Fale Conosco pelo WhatsApp
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-8">
          © 2026 Avance Modas. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
