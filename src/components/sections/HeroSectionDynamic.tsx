import { Button } from "@/components/ui/button";
import { useHeroSettings } from "@/hooks/useSiteSettings";
import heroFallback from "@/assets/hero-model.jpg";
import { ArrowRight } from "lucide-react";

interface HeroSectionDynamicProps {
  type: 'ATACADO' | 'VAREJO';
}

const HeroSectionDynamic = ({ type }: HeroSectionDynamicProps) => {
  const { settings, loading } = useHeroSettings(type);

  if (loading) {
    return (
      <section className="relative h-[60vh] lg:h-[75vh] bg-secondary animate-pulse" />
    );
  }

  const heroImage = settings?.image_url || heroFallback;
  const promoText = settings?.promo_text || 'ATÉ 30% OFF';
  const promoSubtitle = settings?.promo_subtitle || type;
  const buttonText = settings?.button_text || 'VER COLEÇÃO';

  return (
    <section className="relative h-[60vh] lg:h-[75vh] overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage}
          alt={promoSubtitle}
          className="w-full h-full object-cover object-top"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative h-full flex items-center">
        <div className="max-w-lg space-y-6 text-white">
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold tracking-widest uppercase rounded-full">
            {type === 'ATACADO' ? 'Atacado' : 'Varejo'}
          </span>

          {/* Main Text */}
          <div className="space-y-2">
            <p className="text-accent font-bold text-2xl lg:text-3xl">
              {promoText}
            </p>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-none">
              {promoSubtitle}
            </h1>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg"
            className="bg-white text-black hover:bg-white/90 font-semibold tracking-wide group"
          >
            {buttonText}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionDynamic;
