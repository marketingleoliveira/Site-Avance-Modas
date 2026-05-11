import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";
import modelLeft from "@/assets/store-selector-model-left.png";
import modelRight from "@/assets/store-selector-model-right.png";
import { useStoreContext } from "@/stores/storeContextStore";
import { ArrowRight, ShoppingBag, Store } from "lucide-react";

const StoreSelector = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Full-viewport background (escapes #root max-width/padding) */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ffe1e1 0%, #fff5f5 35%, #ffffff 50%, #fff0f0 65%, #ffd4d4 100%)' }}
      >
        <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-accent/25 blur-3xl" />
      </div>

      {/* Fitness models — hidden on small screens, decorative */}
      <img
        src={modelLeft}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none select-none hidden lg:block fixed left-0 bottom-0 h-[92vh] w-auto object-contain object-bottom opacity-90 drop-shadow-[0_25px_40px_rgba(0,0,0,0.18)] animate-fade-in [animation-delay:300ms] [animation-fill-mode:both]"
      />
      <img
        src={modelRight}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none select-none hidden lg:block fixed right-0 bottom-0 h-[92vh] w-auto object-contain object-bottom opacity-90 drop-shadow-[0_25px_40px_rgba(0,0,0,0.18)] animate-fade-in [animation-delay:500ms] [animation-fill-mode:both]"
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Logo & Title */}
        <div className="text-center mb-14 animate-fade-in">
          <img
            src={logoAvance}
            alt="Avance Modas"
            className="h-24 sm:h-32 mx-auto mb-5 object-contain"
          />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-2">
            Avance <span className="text-accent">Modas</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-3 tracking-wide">
            Moda fitness que transforma seu estilo ✨
          </p>
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

        {/* Footer */}
        <div className="text-center mt-14 text-muted-foreground/60 text-xs tracking-wider animate-fade-in [animation-delay:600ms] [animation-fill-mode:both]">
          <p>© 2026 Avance Modas — Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
