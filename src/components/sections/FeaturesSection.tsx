import { Truck, CreditCard, Shield, Heart } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Frete Grátis",
    description: "acima de R$1.500",
    iconColor: "text-emerald-400",
  },
  {
    icon: CreditCard,
    title: "Pague com cartão",
    description: "em até 12x s/ juros",
    iconColor: "text-blue-400",
  },
  {
    icon: Shield,
    title: "Compra Segura",
    description: "100% de confiabilidade",
    iconColor: "text-yellow-400",
  },
  {
    icon: Heart,
    title: "+ CONFORTO + QUALIDADE",
    description: "Somos sua nova marca favorita",
    iconColor: "text-pink-400",
  },
];

const MarqueeContent = () => (
  <div className="flex items-center gap-12 sm:gap-16 lg:gap-20 shrink-0 animate-marquee">
    {features.map((feature) => (
      <div key={feature.title} className="flex items-center gap-2 shrink-0">
        <feature.icon className={`w-4 h-4 ${feature.iconColor}`} />
        <span className="text-xs sm:text-sm font-bold text-primary-foreground uppercase tracking-wider whitespace-nowrap">
          {feature.title}
        </span>
        <span className="text-xs sm:text-sm text-primary-foreground/70 whitespace-nowrap">
          {feature.description}
        </span>
      </div>
    ))}
  </div>
);

const FeaturesSection = () => {
  return (
    <section className="py-3 sm:py-4 bg-primary overflow-hidden">
      <div className="flex gap-12 sm:gap-16 lg:gap-20">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </section>
  );
};

export default FeaturesSection;
