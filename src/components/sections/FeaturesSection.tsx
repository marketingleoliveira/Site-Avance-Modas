import { Truck, CreditCard, RefreshCcw, Shield } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Frete Grátis",
    description: "Para compras acima de R$1.500",
  },
  {
    icon: CreditCard,
    title: "Parcelamento",
    description: "Em até 6x sem juros",
  },
  {
    icon: RefreshCcw,
    title: "Trocas",
    description: "Apenas em caso de defeito",
  },
  {
    icon: Shield,
    title: "Compra Segura",
    description: "Site 100% protegido",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-6 sm:py-8 lg:py-12 bg-primary">
      <div className="container px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="flex flex-col items-center text-center gap-2 sm:gap-3"
            >
              <div className="p-2.5 sm:p-3 lg:p-4 bg-primary-foreground/10 rounded-full">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-primary-foreground text-xs sm:text-sm uppercase tracking-wider">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-primary-foreground/80 leading-snug">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
