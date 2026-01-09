import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo-avance.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <img src={logo} alt="Avance" className="h-16 w-auto object-contain brightness-0 invert" />
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Moda fitness de qualidade para quem busca estilo e performance nos treinos.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Links Rápidos</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="/#produtos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Produtos
                </a>
              </li>
              <li>
                <a href="/#produtos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Lançamentos
                </a>
              </li>
              <li>
                <a href="/#produtos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Promoções
                </a>
              </li>
              <li>
                <a href="/#contato" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Categorias</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="/#produtos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Shorts
                </a>
              </li>
              <li>
                <a href="/#produtos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Leggings
                </a>
              </li>
              <li>
                <a href="/#produtos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Tops
                </a>
              </li>
              <li>
                <a href="/#produtos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Conjuntos
                </a>
              </li>
              <li>
                <a href="/#produtos" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Acessórios
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Contato</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail className="w-4 h-4" />
                contato@avance.com.br
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                São Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2025 Avance. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
            <a href="/" className="hover:text-primary-foreground transition-colors">Política de Privacidade</a>
            <a href="/" className="hover:text-primary-foreground transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
