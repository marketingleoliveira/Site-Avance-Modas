import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import CountdownBanner from "@/components/sections/CountdownBanner";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSectionDynamic from "@/components/sections/HeroSectionDynamic";
import FeaturesSectionDynamic from "@/components/sections/FeaturesSectionDynamic";
import NewsletterSection from "@/components/sections/NewsletterSection";
import ProductSectionsDynamic from "@/components/sections/ProductSectionsDynamic";
import OnlineUsersCounter from "@/components/sections/OnlineUsersCounter";
import ModelVideosSection from "@/components/sections/ModelVideosSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import BrandWordsMarquee from "@/components/sections/BrandWordsMarquee";
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
      <Helmet>
        <title>Varejo Avance Modas — Moda Fitness Feminina Premium</title>
        <meta name="description" content="Compre moda fitness feminina no varejo Avance Modas: leggings, tops, shorts e conjuntos com tecido tecnológico, UV 50+ e Aloe Vera. Envio para todo o Brasil." />
        <link rel="canonical" href="https://avancemodas.com.br/varejo" />
        <meta property="og:title" content="Varejo Avance Modas — Moda Fitness Feminina Premium" />
        <meta property="og:description" content="Leggings, tops, shorts e conjuntos com tecido tecnológico, UV 50+ e Aloe Vera. Compre no varejo com envio para todo o Brasil." />
        <meta property="og:url" content="https://avancemodas.com.br/varejo" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Varejo Avance Modas — Moda Fitness Feminina Premium" />
        <meta name="twitter:description" content="Leggings, tops, shorts e conjuntos com tecido tecnológico, UV 50+ e Aloe Vera." />
      </Helmet>
      <CountdownBanner />
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1">
        <HeroSectionDynamic type="VAREJO" />
        <FeaturesSectionDynamic />
        <OnlineUsersCounter />
        <ProductSectionsDynamic type="VAREJO" />
        <TestimonialsSection />
        <BrandWordsMarquee />
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
