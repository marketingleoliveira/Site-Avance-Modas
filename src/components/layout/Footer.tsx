import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Package, Shield, Lock, BadgeCheck } from "lucide-react";
import logo from "@/assets/logo-avance.png";
import PrivacyPolicyModal from "@/components/legal/PrivacyPolicyModal";
import TermsOfUseModal from "@/components/legal/TermsOfUseModal";
import WholesalePolicyModal from "@/components/legal/WholesalePolicyModal";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

// Payment method icons with real brand colors
const VisaIcon = () => (
  <svg viewBox="0 0 50 32" className="h-7 w-auto transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(26,91,199,0.6)]">
    <rect x="1" y="1" width="48" height="30" rx="4" fill="#1A5BC7" />
    <text x="25" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fontStyle="italic" fill="white" fontFamily="Arial, sans-serif">
      VISA
    </text>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 50 32" className="h-7 w-auto transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(235,0,27,0.5)]">
    <rect x="1" y="1" width="48" height="30" rx="4" fill="#1A1F36" />
    <circle cx="19" cy="16" r="8" fill="#EB001B" />
    <circle cx="31" cy="16" r="8" fill="#F79E1B" />
    <path d="M25 9.5a8 8 0 0 0 0 13" fill="#FF5F00" />
  </svg>
);

const EloIcon = () => (
  <svg viewBox="0 0 50 32" className="h-7 w-auto transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,205,0,0.6)]">
    <rect x="1" y="1" width="48" height="30" rx="4" fill="#000000" />
    <text x="25" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFCD00" fontFamily="Arial, sans-serif">
      elo
    </text>
    <circle cx="38" cy="10" r="4" fill="#00A4E0" />
    <circle cx="38" cy="22" r="4" fill="#EF4123" />
    <circle cx="12" cy="16" r="4" fill="#FFCD00" />
  </svg>
);

const HipercardIcon = () => (
  <svg viewBox="0 0 50 32" className="h-7 w-auto transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(177,31,36,0.5)]">
    <rect x="1" y="1" width="48" height="30" rx="4" fill="#B11F24" />
    <text x="25" y="19" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">
      HIPERCARD
    </text>
  </svg>
);

const PixIcon = () => (
  <svg viewBox="0 0 50 32" className="h-7 w-auto transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(50,187,177,0.6)]">
    <rect x="1" y="1" width="48" height="30" rx="4" fill="#32BBB1" />
    <g transform="translate(25, 16) rotate(45)">
      <rect x="-6" y="-6" width="12" height="12" fill="white" rx="2" />
    </g>
    <text x="25" y="28" textAnchor="middle" fontSize="6" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">
      PIX
    </text>
  </svg>
);

const BoletoIcon = () => (
  <svg viewBox="0 0 50 32" className="h-7 w-auto transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
    <rect x="1" y="1" width="48" height="30" rx="4" fill="#2D2D2D" />
    <rect x="8" y="8" width="2" height="14" fill="#FFF" />
    <rect x="12" y="8" width="1" height="14" fill="#FFF" />
    <rect x="15" y="8" width="3" height="14" fill="#FFF" />
    <rect x="20" y="8" width="1" height="14" fill="#FFF" />
    <rect x="23" y="8" width="2" height="14" fill="#FFF" />
    <rect x="27" y="8" width="1" height="14" fill="#FFF" />
    <rect x="30" y="8" width="3" height="14" fill="#FFF" />
    <rect x="35" y="8" width="1" height="14" fill="#FFF" />
    <rect x="38" y="8" width="2" height="14" fill="#FFF" />
    <rect x="42" y="8" width="1" height="14" fill="#FFF" />
    <text x="25" y="28" textAnchor="middle" fontSize="5" fill="#999" fontFamily="Arial, sans-serif">
      BOLETO
    </text>
  </svg>
);

// Security badges
const SecurityBadge = ({ 
  icon: Icon, 
  label, 
  delay,
  isVisible 
}: { 
  icon: React.ElementType; 
  label: string; 
  delay: number;
  isVisible: boolean;
}) => (
  <div 
    className={cn(
      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 transition-all duration-500 hover:bg-primary-foreground/20 hover:border-primary-foreground/40 hover:scale-105 group",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <Icon className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
    <span className="text-[9px] sm:text-[10px] font-medium text-primary-foreground/90 whitespace-nowrap">{label}</span>
  </div>
);

const paymentMethods = [
  { Icon: VisaIcon, name: "Visa" },
  { Icon: MastercardIcon, name: "Mastercard" },
  { Icon: HipercardIcon, name: "Hipercard" },
  { Icon: EloIcon, name: "Elo" },
  { Icon: PixIcon, name: "Pix" },
  { Icon: BoletoIcon, name: "Boleto" },
];

// Animated section component
interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedSection = ({ children, delay = 0, className }: AnimatedSectionProps) => {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showWholesale, setShowWholesale] = useState(false);
  const { ref: footerRef, isVisible: footerVisible } = useIntersectionObserver({ threshold: 0.05 });
  
  return (
    <>
      <footer ref={footerRef} className="bg-primary text-primary-foreground overflow-hidden">
        <div className="container px-4 sm:px-6 py-8 sm:py-10 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {/* Brand */}
            <AnimatedSection delay={0} className="col-span-2 lg:col-span-1 flex flex-col gap-3 sm:gap-4 lg:gap-6">
              {/* Logo with premium effects */}
              <div className="relative group">
                {/* Glow effect background */}
                <div className="absolute -inset-2 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Logo container with glass effect */}
                <div className="relative flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
                  {/* Logo icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-lg blur-md animate-pulse" />
                    <img 
                      src={logo} 
                      alt="Avance" 
                      className="relative h-10 sm:h-12 lg:h-14 w-auto object-contain brightness-0 invert drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>
                  
                  {/* Brand name with gradient */}
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-lg">
                      AVANCE
                    </span>
                    <span className="text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-white/60 font-medium">
                      Moda Fitness
                    </span>
                  </div>
                </div>
                
                {/* Decorative line */}
                <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
              
              <p className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 leading-relaxed">
                Moda fitness de qualidade para quem busca estilo e performance nos treinos e na moda praia.
              </p>
              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 font-medium">
                  Formas de Pagamento
                </p>
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={method.name}
                      className={cn(
                        "transition-all duration-500 cursor-pointer",
                        footerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      )}
                      style={{ transitionDelay: `${400 + index * 80}ms` }}
                      title={method.name}
                    >
                      <method.Icon />
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Badges */}
              <div className="space-y-2">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/50 font-medium">
                  Compra Segura
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <SecurityBadge 
                    icon={Shield} 
                    label="Site Protegido" 
                    delay={700} 
                    isVisible={footerVisible} 
                  />
                  <SecurityBadge 
                    icon={Lock} 
                    label="SSL Secure" 
                    delay={800} 
                    isVisible={footerVisible} 
                  />
                  <SecurityBadge 
                    icon={BadgeCheck} 
                    label="Loja Verificada" 
                    delay={900} 
                    isVisible={footerVisible} 
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* Quick Links */}
            <AnimatedSection delay={100}>
              <h4 className="text-[11px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4 lg:mb-6">
                Links Rápidos
              </h4>
              <ul className="flex flex-col gap-1.5 sm:gap-2 lg:gap-3">
                {[
                  { href: "/", label: "Sobre Nós" },
                  { href: "/#produtos", label: "Produtos" },
                  { href: "/#produtos", label: "Lançamentos" },
                  { href: "/#produtos", label: "Promoções" },
                  { href: "/#contato", label: "Contato" },
                ].map((link, index) => (
                  <li
                    key={link.label}
                    className={cn(
                      "transition-all duration-500",
                      footerVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}
                    style={{ transitionDelay: `${200 + index * 50}ms` }}
                  >
                    <a
                      href={link.href}
                      className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li
                  className={cn(
                    "transition-all duration-500",
                    footerVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  )}
                  style={{ transitionDelay: "450ms" }}
                >
                  <Link
                    to="/rastreio"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center gap-1.5 sm:gap-2 hover:translate-x-1"
                  >
                    <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Rastrear Pedido
                  </Link>
                </li>
              </ul>
            </AnimatedSection>

            {/* Categories */}
            <AnimatedSection delay={200}>
              <h4 className="text-[11px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4 lg:mb-6">
                Categorias
              </h4>
              <ul className="flex flex-col gap-1.5 sm:gap-2 lg:gap-3">
                {["Shorts", "Leggings", "Tops", "Conjuntos", "Acessórios"].map((category, index) => (
                  <li
                    key={category}
                    className={cn(
                      "transition-all duration-500",
                      footerVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}
                    style={{ transitionDelay: `${300 + index * 50}ms` }}
                  >
                    <a
                      href="/#produtos"
                      className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors hover:translate-x-1 inline-block"
                    >
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </AnimatedSection>

            {/* Contact */}
            <AnimatedSection delay={300} className="col-span-2 sm:col-span-1">
              <h4 className="text-[11px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4 lg:mb-6">
                Contato
              </h4>
              <ul className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                {[
                  { icon: Phone, text: "(11) 9 8927-3818" },
                  { icon: Mail, text: "contato@avance.com.br", className: "break-all" },
                  { icon: MapPin, text: "São Paulo, SP - Brasil", iconClassName: "mt-0.5" },
                ].map((item, index) => (
                  <li
                    key={item.text}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 transition-all duration-500",
                      item.className,
                      footerVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                    )}
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    <item.icon className={cn("w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0", item.iconClassName)} />
                    {item.text}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={400} className="border-t border-primary-foreground/20 mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 lg:pt-8 flex flex-col items-center gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs lg:text-sm text-primary-foreground/60">
                © 2026 Avance. Todos os direitos reservados.
              </p>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-primary-foreground/50 mt-0.5 sm:mt-1">
                CNPJ: 61.705.129/0001-90
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 text-[10px] sm:text-xs lg:text-sm text-primary-foreground/60 flex-wrap justify-center">
              {[
                { label: "Política de Privacidade", onClick: () => setShowPrivacy(true) },
                { label: "Termos de Uso", onClick: () => setShowTerms(true) },
                { label: "Políticas de Atacado", onClick: () => setShowWholesale(true) },
              ].map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={cn(
                    "hover:text-primary-foreground transition-all whitespace-nowrap hover:scale-105 duration-300",
                    footerVisible ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: `${500 + index * 50}ms` }}
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/admin/login"
                className={cn(
                  "hover:text-primary-foreground transition-all whitespace-nowrap hover:scale-105 duration-300",
                  footerVisible ? "opacity-100" : "opacity-0"
                )}
                style={{ transitionDelay: "650ms" }}
              >
                Painel Admin
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </footer>

      <PrivacyPolicyModal open={showPrivacy} onOpenChange={setShowPrivacy} />
      <TermsOfUseModal open={showTerms} onOpenChange={setShowTerms} />
      <WholesalePolicyModal open={showWholesale} onOpenChange={setShowWholesale} />
    </>
  );
};
export default Footer;
