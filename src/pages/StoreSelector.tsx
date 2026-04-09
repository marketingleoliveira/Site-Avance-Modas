import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";
import { useStoreContext } from "@/stores/storeContextStore";
import { ArrowRight, ShoppingBag, Store } from "lucide-react";

const StoreSelector = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fff0f0 0%, #ffffff 40%, #fff5f5 70%, #ffe8e8 100%)' }}>
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
            className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_-12px_hsl(0_0%_0%/0.08)] hover:shadow-[0_20px_60px_-15px_hsl(0_85%_50%/0.25)] transition-all duration-500 hover:-translate-y-2 border border-border/50 animate-fade-in [animation-delay:400ms] [animation-fill-mode:both] animate-[pulse_2.5s_ease-in-out_infinite] hover:animate-none"
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
