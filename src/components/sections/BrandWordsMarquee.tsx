import { Sparkles } from "lucide-react";

const words = [
  "Tecnologia com propósito",
  "Cuidado",
  "Funcionalidade",
  "Beleza",
  "Conforto",
  "Performance",
  "Liberdade de movimento",
  "Estilo",
  "Confiança",
  "Empoderamento",
  "Leveza",
  "Sofisticação",
];

const Row = () => (
  <div className="flex items-center gap-10 sm:gap-14 lg:gap-16 shrink-0 animate-marquee pr-10 sm:pr-14 lg:pr-16">
    {words.map((w) => (
      <div key={w} className="flex items-center gap-3 shrink-0">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-sm sm:text-base lg:text-lg font-semibold tracking-[0.15em] uppercase text-primary-foreground whitespace-nowrap">
          {w}
        </span>
      </div>
    ))}
  </div>
);

const BrandWordsMarquee = () => {
  return (
    <section
      aria-label="Valores da marca Avance Modas"
      className="bg-primary py-4 sm:py-5 overflow-hidden border-y border-border"
    >
      <div className="flex">
        <Row />
        <Row />
      </div>
    </section>
  );
};

export default BrandWordsMarquee;