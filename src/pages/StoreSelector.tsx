import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";
import { useStoreContext } from "@/stores/storeContextStore";
import { ArrowRight, ShoppingBag, Store } from "lucide-react";

const StoreSelector = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fff0f0 0%, #ffffff 40%, #fff5f5 70%, #ffe8e8 100%)' }}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, hsl(0 85% 60% / 0.3), transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, hsl(340 80% 60% / 0.3), transparent 70%)' }} />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, hsl(20 90% 60% / 0.25), transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo & Title */}
        <div className="text-center mb-14">
          <img
            src={logoAvance}
            alt="Avance Modas"
            className="h-16 sm:h-20 mx-auto mb-5 object-contain"
          />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-2">
            Avance <span className="text-accent">Modas</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-3 tracking-wide">
            Moda fitness que transforma seu estilo ✨
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Escolha como deseja comprar
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7">
          {/* Atacado */}
          <Link
            to="/atacado"
            onClick={() => setStoreType("atacado")}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_-12px_hsl(0_0%_0%/0.08)] hover:shadow-[0_20px_60px_-15px_hsl(0_85%_50%/0.2)] transition-all duration-500 hover:-translate-y-2 border border-border/50"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60" />
            
            {/* Decorative circle */}
            <div className="absolute top-12 right-6 w-24 h-24 rounded-full bg-foreground/[0.04] group-hover:scale-150 transition-transform duration-700" />

            <div className="relative p-8 sm:p-9">
              <div className="inline-flex items-center gap-3 mb-7 rounded-2xl bg-foreground/5 border border-foreground/10 px-4 py-2.5">
                <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Linha</p>
                  <p className="text-sm font-black uppercase text-foreground">Atacado</p>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-2 tracking-tight">
                ATACADO
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Compras em quantidade com preços especiais para revendedores
              </p>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-foreground uppercase tracking-wider group-hover:tracking-[0.2em] transition-all duration-300">Acessar</span>
                <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>

          {/* Varejo */}
          <Link
            to="/varejo"
            onClick={() => setStoreType("varejo")}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_-12px_hsl(0_0%_0%/0.08)] hover:shadow-[0_20px_60px_-15px_hsl(0_85%_50%/0.25)] transition-all duration-500 hover:-translate-y-2 border border-border/50"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-accent via-accent/80 to-accent/60" />
            
            {/* Decorative circles */}
            <div className="absolute top-12 right-6 w-24 h-24 rounded-full bg-accent/[0.06] group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-8 left-6 w-16 h-16 rounded-full bg-accent/[0.04] group-hover:scale-[2] transition-transform duration-700" />

            <div className="relative p-8 sm:p-9">
              <div className="inline-flex items-center gap-3 mb-7 rounded-2xl bg-accent/5 border border-accent/15 px-4 py-2.5">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Linha</p>
                  <p className="text-sm font-black uppercase text-accent">Varejo</p>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-2 tracking-tight">
                VAREJO
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Compras unitárias com toda a qualidade Avance Modas
              </p>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-accent uppercase tracking-wider group-hover:tracking-[0.2em] transition-all duration-300">Acessar</span>
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-14 text-muted-foreground/60 text-xs tracking-wider">
          <p>© 2026 Avance Modas — Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
