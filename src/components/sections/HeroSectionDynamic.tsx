import { Button } from "@/components/ui/button";
import { useHeroSettings } from "@/hooks/useSiteSettings";
import heroFallback from "@/assets/hero-model.jpg";

interface HeroSectionDynamicProps {
  type: 'ATACADO' | 'VAREJO';
}

const HeroSectionDynamic = ({ type }: HeroSectionDynamicProps) => {
  const { settings, loading } = useHeroSettings(type);

  if (loading) {
    return (
      <section className="relative min-h-[70vh] bg-secondary animate-pulse">
        <div className="container h-full flex items-center justify-center">
          <div className="w-32 h-32 bg-muted rounded-full" />
        </div>
      </section>
    );
  }

  const heroImage = settings?.image_url || heroFallback;
  const title = settings?.title || (type === 'ATACADO' ? 'Atacado Avance' : 'Varejo Avance');
  const subtitle = settings?.subtitle || 'Moda fitness de qualidade';
  const promoText = settings?.promo_text || 'ATÉ 30% OFF';
  const promoSubtitle = settings?.promo_subtitle || type;
  const buttonText = settings?.button_text || 'COMPRE AGORA';

  return (
    <section className="relative min-h-[70vh] lg:min-h-[80vh] bg-gradient-to-br from-secondary via-background to-secondary overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />

      <div className="container relative h-full">
        <div className="grid lg:grid-cols-12 gap-4 items-center min-h-[70vh] lg:min-h-[80vh] py-8">
          {/* Hero Image - Takes most of the space */}
          <div className="lg:col-span-7 relative order-2 lg:order-1 flex justify-center">
            <div className="relative w-full max-w-2xl">
              <img 
                src={heroImage}
                alt={title}
                className="w-full h-auto object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>

          {/* Promo Banner - Right side */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">
            {/* Repeating text effect */}
            <div className="hidden lg:flex flex-col gap-1 text-primary/30 font-bold text-xl tracking-wider">
              {[...Array(6)].map((_, i) => (
                <span key={i}>APROVEITE</span>
              ))}
            </div>

            {/* Main promo */}
            <div className="space-y-2">
              <p className="text-accent font-bold text-3xl sm:text-4xl lg:text-5xl">
                {promoText}
              </p>
              <h1 className="text-primary font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight">
                {promoSubtitle}
              </h1>
            </div>

            <Button 
              variant="outline" 
              size="xl"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold tracking-wider"
            >
              {buttonText}
            </Button>

            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              POR TEMPO LIMITADO
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionDynamic;
