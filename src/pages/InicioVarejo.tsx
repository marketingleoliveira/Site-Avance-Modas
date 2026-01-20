import { useEffect } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSectionDynamic from "@/components/sections/HeroSectionDynamic";
import FeaturesSectionDynamic from "@/components/sections/FeaturesSectionDynamic";
import NewsletterSection from "@/components/sections/NewsletterSection";
import PromoBanner from "@/components/sections/PromoBanner";
import ProductSectionsDynamic from "@/components/sections/ProductSectionsDynamic";
import ModelVideosSection from "@/components/sections/ModelVideosSection";
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
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1">
        <HeroSectionDynamic type="VAREJO" />
        <FeaturesSectionDynamic />
        <ProductSectionsDynamic type="VAREJO" />
        <PromoBanner />
        <ModelVideosSection />
        <NewsletterSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default InicioVarejo;
