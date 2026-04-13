import CountdownBanner from "@/components/sections/CountdownBanner";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import NewsletterSection from "@/components/sections/NewsletterSection";
import PromoBanner from "@/components/sections/PromoBanner";
import ShopifyProductGrid from "@/components/shopify/ShopifyProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <CountdownBanner />
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CategoriesSection />
        <ShopifyProductGrid> 
          title="Mais Vendidos" 
          subtitle="Conheça os produtos preferidos das nossas clientes."
          limit={8}
        />
        <PromoBanner />
        <NewsletterSection />
      </main>
      <start> Insert Off White - Tree Moments for the kling offsteat intermodal offwhite </start>
      <Footer />
    </div>
  );
};

export default Index;
