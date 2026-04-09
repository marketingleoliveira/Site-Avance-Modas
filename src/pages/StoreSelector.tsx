import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";
import { useStoreContext } from "@/stores/storeContextStore";
import { ArrowRight } from "lucide-react";

const StoreSelector = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10 sm:mb-14">
          <img
            src={logoAvance}
            alt="Avance Modas"
            className="h-14 sm:h-18 lg:h-20 mx-auto mb-6 object-contain"
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">
            Avance Modas
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Escolha como deseja comprar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link
            to="/atacado"
            onClick={() => setStoreType("atacado")}
            className="group relative bg-foreground text-background rounded-2xl p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_hsl(0_0%_0%/0.4)] hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-background/5 rounded-full -translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 mb-6 rounded-2xl bg-background/15 border border-background/10 px-3 py-2 backdrop-blur-sm group-hover:bg-background/20 transition-colors duration-300">
                <img
                  src={logoAvance}
                  alt="Logo Avance Atacado"
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
                <div className="leading-none text-left">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-background/60">Linha</p>
                  <p className="text-sm font-black uppercase text-background">Atacado</p>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
                ATACADO
              </h2>
              <p className="text-sm text-background/60 mb-8 leading-relaxed">
                Compras em quantidade com preços especiais para revendedores
              </p>

              <div className="inline-flex items-center gap-2 text-sm font-semibold border-b border-background/30 pb-1 group-hover:border-background group-hover:gap-3 transition-all duration-300">
                Acessar Atacado
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Link>

          <Link
            to="/varejo"
            onClick={() => setStoreType("varejo")}
            className="group relative bg-background text-foreground rounded-2xl p-8 sm:p-10 border-2 border-foreground/10 transition-all duration-500 hover:border-accent hover:shadow-[0_20px_60px_-15px_hsl(var(--accent)/0.25)] hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 mb-6 rounded-2xl bg-accent/10 border border-accent/20 px-3 py-2 backdrop-blur-sm group-hover:bg-accent/15 transition-colors duration-300">
                <img
                  src={logoAvance}
                  alt="Logo Avance Varejo"
                  className="h-8 w-auto object-contain"
                />
                <div className="leading-none text-left">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Linha</p>
                  <p className="text-sm font-black uppercase text-accent">Varejo</p>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
                VAREJO
              </h2>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Compras unitárias com toda a qualidade Avance Modas
              </p>

              <div className="inline-flex items-center gap-2 text-sm font-semibold text-accent border-b border-accent/30 pb-1 group-hover:border-accent group-hover:gap-3 transition-all duration-300">
                Acessar Varejo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-10 sm:mt-14 text-muted-foreground text-xs">
          <p>© 2026 Avance Modas - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
