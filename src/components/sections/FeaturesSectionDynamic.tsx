import { Truck, Percent, Tag, CreditCard, RefreshCw, Shield, Star, Gift, Clock, Check, Heart, Package, Zap, Award, ThumbsUp } from "lucide-react";
import { useFeaturesSettings, useLayoutSettings } from "@/hooks/useSiteSettings";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  percent: Percent,
  tag: Tag,
  'credit-card': CreditCard,
  refresh: RefreshCw,
  shield: Shield,
  star: Star,
  gift: Gift,
  clock: Clock,
  check: Check,
  heart: Heart,
  package: Package,
  zap: Zap,
  award: Award,
  'thumbs-up': ThumbsUp,
};

const FeaturesSectionDynamic = () => {
  const { settings, loading } = useFeaturesSettings();
  const { settings: layoutSettings } = useLayoutSettings();

  const defaultItems = [
    { icon: "truck", title: "Frete Grátis", description: "acima de R$1.500" },
    { icon: "percent", title: "5% Desconto", description: "no Pix" },
    { icon: "tag", title: "Cupom", description: "PRIMEIRACOMPRA" },
    { icon: "credit-card", title: "6x s/ juros", description: "no cartão" },
    { icon: "refresh", title: "Trocas", description: "apenas em caso de defeito" },
  ];

  const items = settings?.items || defaultItems;
  const colsDesktop = layoutSettings?.features_columns_desktop || "5";

  if (loading) {
    return (
      <section className="py-4 bg-card border-y border-border">
        <div className="container">
          <div className="flex items-center justify-center gap-8 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-primary text-primary-foreground" style={{ height: '60px' }}>
      <div className="container h-full flex items-center">
        <div 
          className="flex items-center justify-between overflow-x-auto scrollbar-hide gap-4 md:gap-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.slice(0, parseInt(colsDesktop)).map((item, index) => {
            const Icon = iconMap[item.icon] || Truck;
            return (
              <div 
                key={index} 
                className="flex items-center gap-2 flex-shrink-0 px-2"
              >
                <Icon className="w-4 h-4 opacity-80" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold whitespace-nowrap">{item.title}</span>
                  <span className="text-xs opacity-70 whitespace-nowrap hidden sm:inline">{item.description}</span>
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
