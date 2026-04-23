import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CountdownBanner from "@/components/sections/CountdownBanner";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSectionDynamic from "@/components/sections/HeroSectionDynamic";
import FeaturesSectionDynamic from "@/components/sections/FeaturesSectionDynamic";
import NewsletterSection from "@/components/sections/NewsletterSection";
import ProductSectionsDynamic from "@/components/sections/ProductSectionsDynamic";
import ModelVideosSection from "@/components/sections/ModelVideosSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { useAtacadoSettings } from "@/hooks/useAtacadoSettings";
import { useStoreContext } from "@/stores/storeContextStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingBag, Store } from "lucide-react";
import WholesalePolicyModal from "@/components/legal/WholesalePolicyModal";

const InicioAtacado = () => {
  const [showNotice, setShowNotice] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const navigate = useNavigate();
  const { settings: atacadoSettings, loading } = useAtacadoSettings();
  const setStoreType = useStoreContext(state => state.setStoreType);

  useEffect(() => {
    // Set store type for checkout validation (persists across pages)
    setStoreType('atacado');
    sessionStorage.setItem("store_type", "atacado");
    
    // Check if user has already seen the notice in this session
    const hasSeenNotice = sessionStorage.getItem("atacado_notice_seen");
    if (!hasSeenNotice && !loading && atacadoSettings.show_minimum_order_notice) {
      setShowNotice(true);
    }
  }, [loading, atacadoSettings.show_minimum_order_notice]);

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
      <CountdownBanner />
      <AnnouncementBar />
      <Header />
      
      {/* Notice Modal */}
      <Dialog open={showNotice} onOpenChange={setShowNotice}>
        <DialogContent className="sm:max-w-lg w-[95vw] p-0 overflow-hidden">
          <div className="bg-primary p-5 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-bold flex items-center justify-center gap-2 text-primary-foreground">
                <ShoppingBag className="w-5 h-5" />
                Bem-vindo ao Atacado
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                Você está na área de <strong className="text-foreground">ATACADO</strong>
              </p>
              
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-base font-bold text-amber-800 dark:text-amber-400">
                  Pedido Mínimo
                </p>
                <p className="text-xl font-bold text-amber-900 dark:text-amber-300 mt-1">
                  R$ {atacadoSettings.minimum_order.toFixed(2).replace('.', ',')}
                </p>
              </div>
              
              <p className="text-xs text-muted-foreground px-2">
                Deseja comprar sem pedido mínimo? Acesse nossa loja de varejo.
              </p>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox 
                id="accept-policies" 
                checked={acceptedPolicies}
                onCheckedChange={(checked) => setAcceptedPolicies(checked === true)}
              />
              <label 
                htmlFor="accept-policies" 
                className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
              >
                Li e aceito as{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPolicyModal(true);
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Políticas de Atacado
                </button>
                {" "}e declaro que minha compra é destinada à revenda comercial.
              </label>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                onClick={handleContinueAtacado} 
                className="w-full gap-2"
                size="lg"
                disabled={!acceptedPolicies}
              >
                <ShoppingBag className="w-4 h-4" />
                Continuar no Atacado
              </Button>
              <Button 
                onClick={handleGoToVarejo} 
                variant="outline"
                className="w-full gap-2"
                size="default"
              >
                <Store className="w-4 h-4" />
                Ir para Varejo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <WholesalePolicyModal open={showPolicyModal} onOpenChange={setShowPolicyModal} />
      
      <main className="flex-1">
        <HeroSectionDynamic type="ATACADO" />
        <FeaturesSectionDynamic />
        <ProductSectionsDynamic type="ATACADO" />
        <TestimonialsSection />
        <ModelVideosSection />
        <NewsletterSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default InicioAtacado;
