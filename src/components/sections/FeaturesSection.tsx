import { Truck, CreditCard, RefreshCcw, Shield } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Frete Grátis",
    description: "Para compras acima de R$299",
  },
  {
    icon: CreditCard,
    title: "Parcelamento",
    description: "Em até 6x sem juros",
  },
  {
    icon: RefreshCcw,
    title: "Troca Fácil",
    description: "Primeira troca grátis",
  },
  {
    icon: Shield,
    title: "Compra Segura",
    description: "Site 100% protegido",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-12 bg-primary">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="p-4 bg-primary-foreground/10 rounded-full">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-primary-foreground text-sm uppercase tracking-wider">
                {feature.title}
              </h3>
              <p className="text-sm text-primary-foreground/80">
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
