import { Sun, Layers, ArrowDownToLine, type LucideIcon } from "lucide-react";

const PantsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M6 2h12l-.5 7c-.2 2.5-.4 5-.7 7.5L16 22h-3l-.6-9h-.8L11 22H8l-.8-5.5C6.9 14 6.7 11.5 6.5 9L6 2z" />
  </svg>
);

const UVIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" />
    <text x="12" y="14" textAnchor="middle" fontSize="5" fontWeight="700" fill="currentColor" stroke="none">UV</text>
  </svg>
);

const PocketIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 4h14l-1.5 16a1 1 0 0 1-1 .9H7.5a1 1 0 0 1-1-.9L5 4z" />
    <path d="M9 4c0 2 1.3 3.5 3 3.5S15 6 15 4" />
  </svg>
);

const CompressionIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3v4M10 5l2 2 2-2" />
    <path d="M3 11c3-1.5 6-1.5 9 0s6 1.5 9 0" />
    <path d="M3 15c3-1.5 6-1.5 9 0s6 1.5 9 0" />
    <path d="M3 19c3-1.5 6-1.5 9 0s6 1.5 9 0" />
  </svg>
);

const features = [
  { Icon: UVIcon, label: "Conforto", sub: "térmico" },
  { Icon: PocketIcon, label: "Bolsos", sub: "laterais" },
  { Icon: CompressionIcon, label: "Compressão", sub: "Inteligente" },
  { Icon: PantsIcon, label: "Zero", sub: "transparência" },
];

const ProductFeatureBadges = () => {
  return (
    <div className="flex items-start justify-between sm:justify-start gap-3 sm:gap-6 py-3 border-b border-border">
      {features.map(({ Icon, label, sub }) => (
        <div key={label} className="flex flex-col items-center text-center gap-1 flex-1 sm:flex-none">
          <Icon style={{ width: 50, height: 50 }} className="text-foreground" />
          <div className="leading-tight">
            <p className="text-[10px] sm:text-xs font-semibold text-foreground">{label}</p>
            <p className="text-[10px] sm:text-xs text-foreground">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductFeatureBadges;