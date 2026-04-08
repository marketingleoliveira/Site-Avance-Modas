import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";
import { useStoreContext } from "@/stores/storeContextStore";
import { ArrowRight, Store, ShoppingBag } from "lucide-react";

const StoreSelector = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl">
        {/* Logo Central */}
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

        {/* Store Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Atacado Card */}
          <Link 
            to="/atacado"
            onClick={() => setStoreType('atacado')}
            className="group relative bg-foreground text-background rounded-2xl p-8 sm:p-10 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_hsl(0_0%_0%/0.4)] hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-background/5 rounded-full -translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 mb-6 rounded-xl bg-background/10 flex items-center justify-center group-hover:bg-background/20 transition-colors duration-300">
                <Store className="w-7 h-7" />
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

          {/* Varejo Card */}
          <Link 
            to="/varejo"
            onClick={() => setStoreType('varejo')}
            className="group relative bg-background text-foreground rounded-2xl p-8 sm:p-10 border-2 border-foreground/10 transition-all duration-500 hover:border-accent hover:shadow-[0_20px_60px_-15px_hsl(340_100%_50%/0.2)] hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full -translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 mb-6 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                <ShoppingBag className="w-7 h-7 text-accent" />
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

        {/* Footer */}
        <div className="text-center mt-10 sm:mt-14 text-muted-foreground text-xs">
          <p>© 2026 Avance Modas - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
