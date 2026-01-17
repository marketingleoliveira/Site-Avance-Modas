import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSectionDynamic from "@/components/sections/HeroSectionDynamic";
import FeaturesSectionDynamic from "@/components/sections/FeaturesSectionDynamic";
import NewsletterSection from "@/components/sections/NewsletterSection";
import PromoBanner from "@/components/sections/PromoBanner";
import ProductSectionsDynamic from "@/components/sections/ProductSectionsDynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Store } from "lucide-react";

const InicioAtacado = () => {
  const [showNotice, setShowNotice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already seen the notice in this session
    const hasSeenNotice = sessionStorage.getItem("atacado_notice_seen");
    if (!hasSeenNotice) {
      setShowNotice(true);
    }
  }, []);

  const handleContinueAtacado = () => {
    sessionStorage.setItem("atacado_notice_seen", "true");
    setShowNotice(false);
  };

  const handleGoToVarejo = () => {
    sessionStorage.setItem("atacado_notice_seen", "true");
    navigate("/varejo");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      
      {/* Notice Modal */}
      <Dialog open={showNotice} onOpenChange={setShowNotice}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="bg-primary p-6 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2 text-primary-foreground">
                <ShoppingBag className="w-6 h-6" />
                Bem-vindo ao Atacado
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                Você está na área de <strong className="text-foreground">ATACADO</strong>
              </p>
              
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-lg font-bold text-amber-800 dark:text-amber-400">
                  Pedido Mínimo
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">
                  R$ 200,00
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Deseja comprar sem pedido mínimo? Acesse nossa loja de varejo.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleContinueAtacado} 
                className="flex-1 gap-2"
                size="lg"
              >
                <ShoppingBag className="w-4 h-4" />
                Continuar no Atacado
              </Button>
              <Button 
                onClick={handleGoToVarejo} 
                variant="outline"
                className="flex-1 gap-2"
                size="lg"
              >
                <Store className="w-4 h-4" />
                Ir para Varejo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <main className="flex-1">
        <HeroSectionDynamic type="ATACADO" />
        <FeaturesSectionDynamic />
        <ProductSectionsDynamic type="ATACADO" />
        <PromoBanner />
        <NewsletterSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default InicioAtacado;
