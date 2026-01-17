import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PromoBanner = () => {
  return (
    <section className="py-8">
      <div className="container">
        <div className="relative overflow-hidden bg-gradient-to-r from-foreground to-foreground/90 text-background">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12">
            <div className="text-center md:text-left">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70 mb-2 block">
                Oferta Especial
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                COMPRE 3 E GANHE 20% OFF
              </h2>
              <p className="text-sm opacity-80 max-w-md">
                Promoção por tempo limitado. Não perca!
              </p>
            </div>
            
            <Button 
              variant="outline"
              size="lg" 
              className="border-background text-background hover:bg-background hover:text-foreground font-semibold tracking-wide group shrink-0"
            >
              Aproveitar
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
