import { Link } from "react-router-dom";
import { useStoreContext } from "@/stores/storeContextStore";
import { ArrowRight, ShoppingBag, Store, Truck, ShieldCheck, Repeat, Headphones } from "lucide-react";
import defaultBanner from "@/assets/store-selector-banner.jpg";
import { useStoreSelectorSettings } from "@/hooks/useSiteSettings";

const StoreSelector = () => {
  const setStoreType = useStoreContext(state => state.setStoreType);
  const { settings } = useStoreSelectorSettings();
  const bannerImage = settings?.header_banner_image || defaultBanner;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-[#fafafa]">
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

      <div className="w-full flex items-center justify-center px-4 py-6 sm:p-8 flex-1">
      {/* Decorative wavy lines — top left & bottom right */}
      <svg className="pointer-events-none absolute top-0 left-0 w-64 h-64 text-accent/30" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <path d="M0 40 Q 50 0, 100 40 T 200 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M0 60 Q 50 20, 100 60 T 200 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M0 80 Q 50 40, 100 80 T 200 80" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      <svg className="pointer-events-none absolute bottom-0 right-0 w-72 h-72 text-accent/30" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <path d="M0 120 Q 50 80, 100 120 T 200 120" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M0 140 Q 50 100, 100 140 T 200 140" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M0 160 Q 50 120, 100 160 T 200 160" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Decorative dot grids */}
      <div
        className="pointer-events-none absolute hidden md:block top-[14%] left-[34%] w-32 h-20 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--accent) / 0.55) 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute hidden md:block bottom-[14%] right-[6%] w-28 h-20 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(hsl(var(--accent) / 0.55) 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="w-full">
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
      </div>
    </div>
  );
};

export default StoreSelector;
