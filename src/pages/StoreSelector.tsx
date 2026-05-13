import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";
import modelLeft from "@/assets/store-selector-model-left.png";
import { useStoreContext } from "@/stores/storeContextStore";
import {
  ArrowUpRight,
  Gem,
  Heart,
  Star,
  Truck,
  ShieldCheck,
  Repeat,
  Headphones,
  Sparkles,
} from "lucide-react";

const StoreSelector = () => {
  const setStoreType = useStoreContext((state) => state.setStoreType);

  const features = [
    { Icon: Gem, title: "QUALIDADE", desc: "Produtos premium" },
    { Icon: Heart, title: "CONFORTO", desc: "Para o seu dia a dia" },
    { Icon: Star, title: "ESTILO", desc: "Looks que inspiram" },
  ];

  const trust = [
    { Icon: Truck, title: "ENVIO RÁPIDO", desc: "Para todo o Brasil" },
    { Icon: ShieldCheck, title: "COMPRA SEGURA", desc: "Dados protegidos" },
    { Icon: Repeat, title: "TROCA FÁCIL", desc: "Mais praticidade" },
    { Icon: Headphones, title: "ATENDIMENTO", desc: "Suporte humano" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f5f5f5] flex items-center justify-center p-3 sm:p-6">
      {/* Editorial card frame */}
      <div className="relative w-full max-w-7xl bg-white rounded-[28px] overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] border border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px] lg:min-h-[760px]">
          {/* LEFT — Editorial model panel */}
          <aside className="relative lg:col-span-5 bg-gradient-to-br from-foreground via-foreground to-black overflow-hidden">
            {/* huge typographic backdrop */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-end justify-start pl-2 pointer-events-none select-none"
            >
              <span className="font-display italic text-white/[0.06] leading-none text-[18rem] lg:text-[22rem] xl:text-[26rem] -mb-16 tracking-tighter">
                A
              </span>
            </div>

            {/* accent slash */}
            <div className="absolute top-0 right-0 h-full w-[2px] bg-accent/70" />
            <div className="absolute top-8 left-8 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-bold tracking-[0.25em] text-white uppercase">
                  New Collection · 2026
                </span>
              </div>
            </div>

            {/* Model */}
            <img
              src={modelLeft}
              alt="Modelo Avance Modas"
              loading="eager"
              className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-[0_30px_50px_rgba(0,0,0,0.4)] animate-fade-in"
            />

            {/* Bottom signature strip */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-8 py-6">
              <p className="text-white/60 text-[10px] tracking-[0.3em] uppercase mb-1">
                Avance · Moda Fitness
              </p>
              <p className="text-white font-display text-2xl italic leading-tight">
                Movimento que veste atitude.
              </p>
            </div>
          </aside>

          {/* RIGHT — Content panel */}
          <section className="relative lg:col-span-7 flex flex-col px-6 py-8 sm:px-12 sm:py-12 lg:px-16 lg:py-14">
            {/* Header row */}
            <header className="flex items-center justify-between mb-8 lg:mb-10">
              <img src={logoAvance} alt="Avance Modas" className="h-12 sm:h-14 object-contain" />
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground uppercase">
                  Online agora
                </span>
              </div>
            </header>

            {/* Title block */}
            <div className="mb-8 lg:mb-10">
              <p className="text-[11px] font-bold tracking-[0.35em] text-accent uppercase mb-3">
                Bem-vinda à Avance
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-foreground">
                Escolha
                <br />
                como você
                <br />
                quer <span className="italic text-accent">comprar.</span>
              </h1>
              <p className="mt-5 text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed">
                Duas experiências sob medida — para revendedoras que movimentam estoque e para quem
                busca o look perfeito do dia.
              </p>
            </div>

            {/* Feature pills inline */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8 lg:mb-10">
              {features.map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[10px] font-bold tracking-wider text-foreground">{title}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action rows — horizontal magazine cards */}
            <div className="space-y-4 mb-8 lg:mb-10">
              {/* Atacado */}
              <Link
                to="/atacado"
                onClick={() => setStoreType("atacado")}
                className="group relative flex items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-foreground text-white overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-700" />
                <div className="relative z-10 flex-1 min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.3em] text-white/50 uppercase mb-1">
                    01 — Para Revendedoras
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-none">
                    Atacado
                  </h2>
                  <p className="text-white/60 text-xs sm:text-sm mt-2 max-w-sm">
                    Compras em quantidade com preços especiais
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline text-[11px] font-bold tracking-widest uppercase text-white/80 group-hover:text-white transition-colors">
                    Acessar
                  </span>
                  <div className="w-12 h-12 rounded-full bg-white text-foreground flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>

              {/* Varejo */}
              <Link
                to="/varejo"
                onClick={() => setStoreType("varejo")}
                className="group relative flex items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-accent text-white overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-15px_hsl(0_85%_50%/0.5)]"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-white" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-700" />
                <div className="relative z-10 flex-1 min-w-0">
                  <p className="text-[10px] font-bold tracking-[0.3em] text-white/70 uppercase mb-1">
                    02 — Para Você
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-none">
                    Varejo
                  </h2>
                  <p className="text-white/80 text-xs sm:text-sm mt-2 max-w-sm">
                    Compras unitárias com toda a qualidade Avance
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline text-[11px] font-bold tracking-widest uppercase text-white group-hover:tracking-[0.25em] transition-all">
                    Acessar
                  </span>
                  <div className="w-12 h-12 rounded-full bg-white text-accent flex items-center justify-center group-hover:rotate-45 transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Trust footer */}
            <div className="mt-auto border-t border-border/60 pt-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {trust.map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-accent shrink-0" />
                    <div className="min-w-0 leading-tight">
                      <p className="text-[9px] font-bold tracking-wider text-foreground">{title}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-[10px] text-muted-foreground/70 tracking-wider mt-5">
                © 2026 Avance Modas — Todos os direitos reservados
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;