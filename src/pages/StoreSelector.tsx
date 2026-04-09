import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";
import { useStoreContext } from "@/stores/storeContextStore";
import { ArrowRight, ShoppingBag, Store } from "lucide-react";

const StoreSelector = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);

  return (
    <div className="min-h-screen bg-foreground relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
            <img
              src={logoAvance}
              alt="Avance Modas"
              className="h-12 w-auto object-contain brightness-0 invert"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-3">
            Avance Modas
          </h1>
          <p className="text-white/50 text-sm sm:text-base tracking-widest uppercase">
            Escolha como deseja comprar
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* Atacado */}
          <Link
            to="/atacado"
            onClick={() => setStoreType("atacado")}
            className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] to-white/[0.04] group-hover:from-white/[0.18] group-hover:to-white/[0.08] transition-all duration-500" />
            <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-white/25 transition-colors duration-500" />
            
            {/* Accent glow on hover */}
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/0 group-hover:bg-accent/20 rounded-full blur-3xl transition-all duration-700" />

            <div className="relative p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Linha</p>
                  <p className="text-sm font-black uppercase text-white">Atacado</p>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
                ATACADO
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-10">
                Compras em quantidade com preços especiais para revendedores
              </p>

              <div className="flex items-center gap-3 text-sm font-bold text-accent group-hover:gap-4 transition-all duration-300">
                <span className="uppercase tracking-wider">Acessar Atacado</span>
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Varejo */}
          <Link
            to="/varejo"
            onClick={() => setStoreType("varejo")}
            className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
          >
            {/* White card */}
            <div className="absolute inset-0 bg-white rounded-2xl" />
            
            {/* Accent decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full translate-x-10 -translate-y-10 group-hover:scale-[2.5] transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full -translate-x-8 translate-y-8 group-hover:scale-[3] transition-transform duration-700" />

            <div className="relative p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <Store className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Linha</p>
                  <p className="text-sm font-black uppercase text-accent">Varejo</p>
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3 tracking-tight">
                VAREJO
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-10">
                Compras unitárias com toda a qualidade Avance Modas
              </p>

              <div className="flex items-center gap-3 text-sm font-bold text-accent group-hover:gap-4 transition-all duration-300">
                <span className="uppercase tracking-wider">Acessar Varejo</span>
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/25 text-xs tracking-wider">
          <p>© 2026 Avance Modas — Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
