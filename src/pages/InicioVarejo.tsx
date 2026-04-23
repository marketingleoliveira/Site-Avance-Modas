import { useEffect } from "react";
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
import NewsletterPopup from "@/components/newsletter/NewsletterPopup";
import { useStoreContext } from "@/stores/storeContextStore";

const InicioVarejo = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);
  
  useEffect(() => {
    // Set store type for checkout validation (persists across pages)
    setStoreType('varejo');
    sessionStorage.setItem("store_type", "varejo");
  }, [setStoreType]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <CountdownBanner />
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1">
        <HeroSectionDynamic type="VAREJO" />
        <FeaturesSectionDynamic />
        <ProductSectionsDynamic type="VAREJO" />
        <TestimonialsSection />
        <ModelVideosSection />
        <NewsletterSection />
      </main>
      
      <Footer />
      
      {/* Newsletter Popup - appears after 5 seconds */}
      <NewsletterPopup delayMs={5000} />
    </div>
  );
};

export default InicioVarejo;
