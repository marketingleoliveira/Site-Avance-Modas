import { Link } from "react-router-dom";
import { useStoreContext } from "@/stores/storeContextStore";
import { ArrowRight, ShoppingBag, Store, Truck, ShieldCheck, Repeat, Headphones } from "lucide-react";
import defaultBanner from "@/assets/store-selector-banner.jpg";
import atacadoImg from "@/assets/store-card-atacado.jpg";
import varejoImg from "@/assets/store-card-varejo.jpg";
import { useStoreSelectorSettings } from "@/hooks/useSiteSettings";

const StoreSelector = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);
  const { settings } = useStoreSelectorSettings();
  const bannerImage = settings?.header_banner_image || defaultBanner;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-[#f5f5f5]">
      {/* Full-width Header Banner (1920x500) */}
      <div className="relative z-10 w-full animate-fade-in overflow-hidden">
        <img
          src={bannerImage}
          alt="Avance Modas — Moda Fitness Premium"
          className="w-full h-auto block object-cover object-center"
          style={{ aspectRatio: '1920 / 500' }}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Cards section */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
          {/* Atacado */}
          <Link
            to="/atacado"
            onClick={() => setStoreType("atacado")}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-12px_hsl(0_0%_0%/0.12)] hover:shadow-[0_20px_60px_-15px_hsl(0_0%_0%/0.25)] transition-all duration-500 hover:-translate-y-1 border border-border/40 animate-fade-in [animation-delay:200ms] [animation-fill-mode:both]"
          >
            <div className="h-1.5 w-full bg-foreground" />
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto]">
              <div className="p-6 sm:p-8 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center mb-5">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3 tracking-tight">ATACADO</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Compras em quantidade com preços especiais para revendedores.
                </p>
                <div className="h-px w-10 bg-border mb-5" />
                <div className="relative overflow-hidden rounded-lg bg-foreground text-white py-3 px-5 font-bold text-xs uppercase tracking-widest inline-flex items-center justify-center gap-2 self-start group-hover:gap-3 transition-all duration-300">
                  <span>Acessar Atacado</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
              <div className="relative w-full sm:w-44 md:w-52 h-40 sm:h-auto overflow-hidden bg-muted">
                <img src={atacadoImg} alt="Atacado" loading="lazy" width={800} height={800} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          </Link>

          {/* Varejo */}
          <Link
            to="/varejo"
            onClick={() => setStoreType("varejo")}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-12px_hsl(0_0%_0%/0.12)] hover:shadow-[0_20px_60px_-15px_hsl(0_85%_50%/0.25)] transition-all duration-500 hover:-translate-y-1 border border-border/40 animate-fade-in [animation-delay:350ms] [animation-fill-mode:both]"
          >
            <div className="h-1.5 w-full bg-accent" />
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto]">
              <div className="p-6 sm:p-8 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3 tracking-tight">VAREJO</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Compre variadas com toda a qualidade Avance Modas.
                </p>
                <div className="h-px w-10 bg-border mb-5" />
                <div className="relative overflow-hidden rounded-lg bg-accent text-white py-3 px-5 font-bold text-xs uppercase tracking-widest inline-flex items-center justify-center gap-2 self-start group-hover:gap-3 transition-all duration-300">
                  <span>Acessar Varejo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
              <div className="relative w-full sm:w-44 md:w-52 h-40 sm:h-auto overflow-hidden bg-muted">
                <img src={varejoImg} alt="Varejo" loading="lazy" width={800} height={800} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          </Link>
        </div>

        {/* Trust bar */}
        <div className="mt-8 sm:mt-10 bg-white border border-border/40 rounded-2xl px-5 sm:px-8 py-5 shadow-[0_8px_30px_-12px_hsl(0_0%_0%/0.1)] animate-fade-in [animation-delay:500ms] [animation-fill-mode:both]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { Icon: Truck, title: "FRETE RÁPIDO", desc: "Para todo o Brasil" },
              { Icon: ShieldCheck, title: "COMPRA SEGURA", desc: "Seus dados protegidos" },
              { Icon: Repeat, title: "TROCA FÁCIL", desc: "Até 7 dias após o recebimento" },
              { Icon: Headphones, title: "ATENDIMENTO", desc: "Suporte via WhatsApp" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-accent shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold tracking-wider text-foreground leading-tight">{title}</p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center my-8 text-muted-foreground/70 text-xs tracking-wider animate-fade-in [animation-delay:650ms] [animation-fill-mode:both]">
          <p>© 2026 Avance Modas — Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default StoreSelector;
