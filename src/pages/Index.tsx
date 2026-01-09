import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import ProductsSection from "@/components/sections/ProductsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import NewsletterSection from "@/components/sections/NewsletterSection";
import InstagramSection from "@/components/sections/InstagramSection";
import PromoBanner from "@/components/sections/PromoBanner";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CategoriesSection />
        <ProductsSection />
        <PromoBanner />
        <NewsletterSection />
        <InstagramSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
