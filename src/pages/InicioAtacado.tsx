import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import CollectionsSection from "@/components/sections/CollectionsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import NewsletterSection from "@/components/sections/NewsletterSection";
import InstagramSection from "@/components/sections/InstagramSection";
import PromoBanner from "@/components/sections/PromoBanner";
import ShopifyProductGridFiltered from "@/components/shopify/ShopifyProductGridFiltered";

const InicioAtacado = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CollectionsSection type="ATACADO" />
        <ShopifyProductGridFiltered 
          title="Produtos Atacado" 
          subtitle="Conheça nossa linha exclusiva para revendedores."
          limit={8}
          type="ATACADO"
        />
        <PromoBanner />
        <NewsletterSection />
        <InstagramSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default InicioAtacado;
