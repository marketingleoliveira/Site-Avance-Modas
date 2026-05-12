import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";
import modelLeft from "@/assets/store-selector-model-left.png";
import { useStoreContext } from "@/stores/storeContextStore";
import { ArrowRight, ShoppingBag, Store, Gem, Heart, Star, Truck, ShieldCheck, Repeat, Headphones, Sparkles } from "lucide-react";

const StoreSelector = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center lg:justify-end p-4 lg:pr-16 xl:pr-24" style={{ background: 'linear-gradient(135deg, #ffe1e1 0%, #fff5f5 35%, #ffffff 50%, #fff0f0 65%, #ffd4d4 100%)' }}>
      {/* Decorative red blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-accent/25 blur-3xl" />

      {/* Fitness models — hidden on small screens, decorative */}
      <img
        src={modelLeft}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none select-none hidden lg:block absolute left-0 bottom-0 h-screen w-auto object-contain object-bottom drop-shadow-[0_25px_40px_rgba(0,0,0,0.18)] animate-fade-in [animation-delay:300ms] [animation-fill-mode:both] z-0"
      />

      <div className="relative z-10 w-full max-w-3xl lg:mr-0">
        {/* Logo & Title */}
        <div className="text-center mb-10 animate-fade-in">
          <img
            src={logoAvance}
            alt="Avance Modas"
            className="h-20 sm:h-24 mx-auto mb-4 object-contain"
          />
          {/* Premium badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/40 bg-white/80 backdrop-blur-sm mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">Moda Fitness Premium</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-2">
            Avance <span className="text-accent">Modas</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-3 tracking-wide">
            Moda fitness que transforma seu estilo ✨
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8">
            {[
              { Icon: Gem, title: "QUALIDADE", desc: "Produtos premium" },
              { Icon: Heart, title: "CONFORTO", desc: "Para o seu dia a dia" },
              { Icon: Star, title: "ESTILO", desc: "Looks que inspiram" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-border/60 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold tracking-wider text-foreground leading-tight">{title}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7">
          {/* Atacado */}
          <Link
            to="/atacado"
            onClick={() => setStoreType("atacado")}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_-12px_hsl(0_0%_0%/0.08)] hover:shadow-[0_20px_60px_-15px_hsl(0_85%_50%/0.2)] transition-all duration-500 hover:-translate-y-2 border border-border/50 animate-fade-in [animation-delay:200ms] [animation-fill-mode:both]"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60" />

            <div className="relative p-8 sm:p-9 text-center">
              <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-5">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-2 tracking-tight">
                ATACADO
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Compras em quantidade com preços especiais para revendedores
              </p>

              {/* Animated banner button */}
              <div className="relative overflow-hidden rounded-xl bg-foreground text-white py-3.5 px-6 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 group-hover:tracking-[0.25em] transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <span>Acessar Atacado</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Link>

          {/* Varejo */}
          <Link
            to="/varejo"
            onClick={() => setStoreType("varejo")}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_-12px_hsl(0_0%_0%/0.08)] hover:shadow-[0_20px_60px_-15px_hsl(0_85%_50%/0.25)] transition-all duration-500 hover:-translate-y-2 border border-border/50 animate-fade-in [animation-delay:400ms] [animation-fill-mode:both]"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-accent via-accent/80 to-accent/60" />

            <div className="relative p-8 sm:p-9 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
                <Store className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-2 tracking-tight">
                VAREJO
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Compras unitárias com toda a qualidade Avance Modas
              </p>

              {/* Animated banner button */}
              <div className="relative overflow-hidden rounded-xl bg-accent text-white py-3.5 px-6 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 group-hover:tracking-[0.25em] transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <span>Acessar Varejo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        </div>

        {/* Trust bar */}
        <div className="mt-10 mx-auto max-w-2xl bg-white/85 backdrop-blur-sm border border-border/60 rounded-2xl px-6 py-4 shadow-[0_8px_30px_-12px_hsl(0_0%_0%/0.12)] animate-fade-in [animation-delay:600ms] [animation-fill-mode:both]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { Icon: Truck, title: "ENVIO RÁPIDO", desc: "Para todo o Brasil" },
              { Icon: ShieldCheck, title: "COMPRA SEGURA", desc: "Seus dados protegidos" },
              { Icon: Repeat, title: "TROCA FÁCIL", desc: "Mais praticidade" },
              { Icon: Headphones, title: "ATENDIMENTO", desc: "Suporte humanizado" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 text-accent shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold tracking-wider text-foreground leading-tight">{title}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-muted-foreground/60 text-xs tracking-wider animate-fade-in [animation-delay:700ms] [animation-fill-mode:both]">
          <p>© 2026 Avance Modas — Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
