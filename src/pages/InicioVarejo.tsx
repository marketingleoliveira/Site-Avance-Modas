import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSectionDynamic from "@/components/sections/HeroSectionDynamic";
import FeaturesSectionDynamic from "@/components/sections/FeaturesSectionDynamic";
import NewsletterSection from "@/components/sections/NewsletterSection";
import InstagramSection from "@/components/sections/InstagramSection";
import PromoBanner from "@/components/sections/PromoBanner";
import ShopifyProductGridFiltered from "@/components/shopify/ShopifyProductGridFiltered";

const InicioVarejo = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1">
        <HeroSectionDynamic type="VAREJO" />
        <FeaturesSectionDynamic />
        <ShopifyProductGridFiltered 
          title="Produtos Varejo" 
          subtitle="Conheça nossa coleção com a qualidade Avance Modas."
          limit={8}
          type="VAREJO"
        />
        <PromoBanner />
        <NewsletterSection />
        <InstagramSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default InicioVarejo;
