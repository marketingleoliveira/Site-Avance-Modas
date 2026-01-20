import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePromoBannerSettings } from "@/hooks/useSiteSettings";

const PromoBanner = () => {
  const { settings, loading } = usePromoBannerSettings();

  // Don't render if loading or disabled
  if (loading) {
    return (
      <section className="py-8">
        <div className="container">
          <div className="h-32 bg-secondary/50 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (!settings?.enabled) {
    return null;
  }

  return (
    <section className="py-6 sm:py-8">
      <div className="container px-4 sm:px-6">
        <div className="relative overflow-hidden bg-gradient-to-r from-foreground to-foreground/90 text-background rounded-lg">
          <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 p-6 sm:p-8 md:p-12 md:flex-row">
            <div className="text-center md:text-left w-full md:w-auto">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase opacity-70 mb-1.5 sm:mb-2 block">
                {settings.tag || "Oferta Especial"}
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2 leading-tight">
                {settings.title || "COMPRE 3 E GANHE 20% OFF"}
              </h2>
              <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto md:mx-0">
                {settings.description || "Promoção por tempo limitado. Não perca!"}
              </p>
            </div>
            
            <Button 
              variant="outline"
              size="lg" 
              className="border-background text-background hover:bg-background hover:text-foreground font-semibold tracking-wide group shrink-0 w-full sm:w-auto h-10 sm:h-11 text-sm"
              asChild
            >
              <Link to={settings.button_link || "/#produtos"}>
                {settings.button_text || "Aproveitar"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
