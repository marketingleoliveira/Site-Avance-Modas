import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSectionDynamic from "@/components/sections/HeroSectionDynamic";
import FeaturesSectionDynamic from "@/components/sections/FeaturesSectionDynamic";
import NewsletterSection from "@/components/sections/NewsletterSection";
import PromoBanner from "@/components/sections/PromoBanner";
import ProductSectionsDynamic from "@/components/sections/ProductSectionsDynamic";

const InicioAtacado = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      
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
