import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Package } from "lucide-react";
import logo from "@/assets/logo-avance.png";
import PrivacyPolicyModal from "@/components/legal/PrivacyPolicyModal";
import TermsOfUseModal from "@/components/legal/TermsOfUseModal";
import WholesalePolicyModal from "@/components/legal/WholesalePolicyModal";

// Payment method icons as simple SVG components
const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="currentColor">
    <rect x="1" y="1" width="46" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <text x="24" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fontStyle="italic">
      VISA
    </text>
  </svg>
);
const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="currentColor">
    <rect x="1" y="1" width="46" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="18" cy="16" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="30" cy="16" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const EloIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="currentColor">
    <rect x="1" y="1" width="46" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <text x="24" y="20" textAnchor="middle" fontSize="10" fontWeight="bold">
      elo
    </text>
  </svg>
);
const HipercardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="currentColor">
    <rect x="1" y="1" width="46" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <text x="24" y="18" textAnchor="middle" fontSize="7" fontWeight="bold">
      hipercard
    </text>
  </svg>
);
const PixIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="currentColor">
    <rect x="1" y="1" width="46" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M24 8 L30 14 L24 20 L18 14 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M24 12 L30 18 L24 24 L18 18 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const BoletoIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="currentColor">
    <rect x="1" y="1" width="46" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <rect x="8" y="10" width="2" height="12" fill="currentColor" />
    <rect x="12" y="10" width="1" height="12" fill="currentColor" />
    <rect x="15" y="10" width="3" height="12" fill="currentColor" />
    <rect x="20" y="10" width="1" height="12" fill="currentColor" />
    <rect x="23" y="10" width="2" height="12" fill="currentColor" />
    <rect x="27" y="10" width="1" height="12" fill="currentColor" />
    <rect x="30" y="10" width="3" height="12" fill="currentColor" />
    <rect x="35" y="10" width="1" height="12" fill="currentColor" />
    <rect x="38" y="10" width="2" height="12" fill="currentColor" />
  </svg>
);
const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showWholesale, setShowWholesale] = useState(false);
  return (
    <>
      <footer className="bg-primary text-primary-foreground overflow-hidden">
        <div className="container px-4 sm:px-6 py-8 sm:py-10 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1 flex flex-col gap-3 sm:gap-4 lg:gap-6">
              <img src={logo} alt="Avance" className="h-10 sm:h-12 lg:h-16 w-auto object-contain brightness-0 invert" />
              <p className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 leading-relaxed">
                Moda fitness de qualidade para quem busca estilo e performance nos treinos e na moda praia..
              </p>
              {/* Payment Methods */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <VisaIcon />
                <MastercardIcon />
                <HipercardIcon />
                <EloIcon />
                <PixIcon />
                <BoletoIcon />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[11px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4 lg:mb-6">
                Links Rápidos
              </h4>
              <ul className="flex flex-col gap-1.5 sm:gap-2 lg:gap-3">
                <li>
                  <a
                    href="/"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a
                    href="/#produtos"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Produtos
                  </a>
                </li>
                <li>
                  <a
                    href="/#produtos"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Lançamentos
                  </a>
                </li>
                <li>
                  <a
                    href="/#produtos"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Promoções
                  </a>
                </li>
                <li>
                  <a
                    href="/#contato"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Contato
                  </a>
                </li>
                <li>
                  <Link
                    to="/rastreio"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center gap-1.5 sm:gap-2"
                  >
                    <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Rastrear Pedido
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-[11px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4 lg:mb-6">
                Categorias
              </h4>
              <ul className="flex flex-col gap-1.5 sm:gap-2 lg:gap-3">
                <li>
                  <a
                    href="/#produtos"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Shorts
                  </a>
                </li>
                <li>
                  <a
                    href="/#produtos"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Leggings
                  </a>
                </li>
                <li>
                  <a
                    href="/#produtos"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Tops
                  </a>
                </li>
                <li>
                  <a
                    href="/#produtos"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Conjuntos
                  </a>
                </li>
                <li>
                  <a
                    href="/#produtos"
                    className="text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Acessórios
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-[11px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4 lg:mb-6">
                Contato
              </h4>
              <ul className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
                <li className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80">
                  (11) 9 8927-3818
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                </li>
                <li className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80 break-all">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  contato@avance.com.br
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-[11px] sm:text-xs lg:text-sm text-primary-foreground/80">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                  São Paulo, SP - Brasil
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/20 mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 lg:pt-8 flex flex-col items-center gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs lg:text-sm text-primary-foreground/60">
                © 2026 Avance. Todos os direitos reservados.
              </p>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-primary-foreground/50 mt-0.5 sm:mt-1">
                CNPJ: 61.705.129/0001-90
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 text-[10px] sm:text-xs lg:text-sm text-primary-foreground/60 flex-wrap justify-center">
              <button
                onClick={() => setShowPrivacy(true)}
                className="hover:text-primary-foreground transition-colors whitespace-nowrap"
              >
                Política de Privacidade
              </button>
              <button
                onClick={() => setShowTerms(true)}
                className="hover:text-primary-foreground transition-colors whitespace-nowrap"
              >
                Termos de Uso
              </button>
              <button
                onClick={() => setShowWholesale(true)}
                className="hover:text-primary-foreground transition-colors whitespace-nowrap"
              >
                Políticas de Atacado
              </button>
            </div>
          </div>
        </div>
      </footer>

      <PrivacyPolicyModal open={showPrivacy} onOpenChange={setShowPrivacy} />
      <TermsOfUseModal open={showTerms} onOpenChange={setShowTerms} />
      <WholesalePolicyModal open={showWholesale} onOpenChange={setShowWholesale} />
    </>
  );
};
export default Footer;
