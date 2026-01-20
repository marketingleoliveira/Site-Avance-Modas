import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-model.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[85vh] gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} 
      />

      <div className="container relative h-full px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center min-h-[60vh] sm:min-h-[70vh] lg:min-h-[85vh] py-8 lg:py-12">
          {/* Content */}
          <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 z-10 order-2 lg:order-1">
            <span className="text-muted-foreground font-medium tracking-widest uppercase text-xs sm:text-sm">
              BEM VINDOS A AVANCE MODAS
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground">
              Moda Fitness
              <br />
              <span className="text-accent">Que Inspira</span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
              Descubra nossa coleção de roupas fitness desenvolvidas com tecidos de alta qualidade para o seu melhor desempenho.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Ver Coleção
              </Button>
              <Button variant="heroOutline" size="lg" className="w-full sm:w-auto">
                Lançamentos
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 pt-2 sm:pt-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-mint rounded-full flex-shrink-0" />
                Frete Grátis +R$299
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-mint rounded-full flex-shrink-0" />
                Parcelamos em 6x
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-mint rounded-full flex-shrink-0" />
                Troca Fácil
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-lg xl:max-w-2xl">
              <img 
                alt="Modelo fitness usando roupas Avance" 
                className="w-full h-auto object-cover rounded-lg shadow-hover" 
                src="/lovable-uploads/ed06370d-6a7a-4b82-87c6-835ea02c4d21.jpg" 
              />
              {/* Floating Badge - Hidden on mobile */}
              <div className="hidden sm:block absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-accent text-accent-foreground px-4 py-3 lg:px-6 lg:py-4 rounded-lg shadow-lg animate-fade-up">
                <p className="text-lg lg:text-2xl font-bold">Conjunto Top + Short</p>
                <p className="text-xs lg:text-sm uppercase tracking-wider">COR ALGODÃO DOCE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;