import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-model.jpg";

const PromoBanner = () => {
  return (
    <section className="py-16 bg-secondary">
      <div className="container">
        <div className="relative overflow-hidden rounded-lg bg-primary">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
          
          <div className="relative grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
            <div>
              <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded mb-4 uppercase tracking-wider">
                Oferta Especial
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
                Compre 3 e Ganhe 20% OFF
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-md">
                Aproveite essa promoção exclusiva e renove seu guarda-roupa fitness com peças de alta qualidade.
              </p>
              <Button variant="heroOutline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Aproveitar Agora
              </Button>
            </div>
            
            <div className="hidden lg:flex justify-end">
              <img 
                src={heroImage} 
                alt="Promoção"
                className="w-80 h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
