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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Aviso Importante
            </DialogTitle>
            <DialogDescription className="text-center pt-4 space-y-4">
              <p className="text-base text-foreground">
                Você está na área de <strong className="text-primary">ATACADO</strong>.
              </p>
              <p className="text-lg font-semibold text-foreground">
                O pedido mínimo é de <span className="text-primary text-xl">R$ 200,00</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Se deseja comprar sem pedido mínimo, acesse nossa loja de varejo.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
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
