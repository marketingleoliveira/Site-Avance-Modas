import { Truck, Percent, Tag, CreditCard, RefreshCw } from "lucide-react";
import { useFeaturesSettings } from "@/hooks/useSiteSettings";

const iconMap: Record<string, React.ElementType> = {
  truck: Truck,
  percent: Percent,
  tag: Tag,
  'credit-card': CreditCard,
  refresh: RefreshCw,
};

const FeaturesSectionDynamic = () => {
  const { settings, loading } = useFeaturesSettings();

  const defaultItems = [
    { icon: "truck", title: "Frete Grátis", description: "acima de R$279" },
    { icon: "percent", title: "5% Desconto", description: "no Pix" },
    { icon: "tag", title: "Cupom Primeira Compra", description: "PRIMEIRACOMPRA" },
    { icon: "credit-card", title: "Pague com cartão", description: "em até 6x s/ juros" },
    { icon: "refresh", title: "Primeira Troca", description: "Frete Grátis" },
  ];

  const items = settings?.items || defaultItems;

  if (loading) {
    return (
      <section className="py-6 bg-card border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-card border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] || Truck;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSectionDynamic;
