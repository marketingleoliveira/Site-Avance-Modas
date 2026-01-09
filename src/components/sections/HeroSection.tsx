import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-model.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] lg:min-h-[90vh] gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container relative h-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[80vh] lg:min-h-[90vh] py-12">
          {/* Content */}
          <div className="flex flex-col gap-8 z-10 order-2 lg:order-1">
            <span className="text-muted-foreground font-medium tracking-widest uppercase text-sm">
              Nova Coleção
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Moda Fitness
              <br />
              <span className="text-accent">Que Inspira</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Descubra nossa coleção de roupas fitness desenvolvidas com tecidos de alta qualidade para o seu melhor desempenho.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl">
                Ver Coleção
              </Button>
              <Button variant="heroOutline" size="xl">
                Lançamentos
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-mint rounded-full" />
                Frete Grátis +R$299
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-mint rounded-full" />
                Parcelamos em 6x
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-mint rounded-full" />
                Troca Fácil
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Modelo fitness usando roupas Avance"
                className="w-full max-w-lg lg:max-w-2xl h-auto object-cover rounded-lg shadow-hover"
              />
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground px-6 py-4 rounded-lg shadow-lg animate-fade-up">
                <p className="text-2xl font-bold">-20%</p>
                <p className="text-sm uppercase tracking-wider">Primeira Compra</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
