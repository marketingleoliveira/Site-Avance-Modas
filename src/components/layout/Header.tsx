import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/logo-avance.png";
import CartDrawer from "@/components/cart/CartDrawer";
import SearchModal from "@/components/search/SearchModal";
const navLinks = [
  { name: "Início", href: "/" },
  { 
    name: "Produtos", 
    href: "#",
    submenu: [
      { name: "Shorts", href: "/categoria/shorts" },
      { name: "Bermudas", href: "/categoria/bermudas" },
      { name: "Leggings", href: "/categoria/leggings" },
      { name: "Blusas", href: "/categoria/blusas" },
      { name: "Conjuntos", href: "/categoria/conjuntos" },
    ]
  },
  { name: "Lançamentos", href: "/categoria/lancamentos" },
  { name: "Promoções", href: "/categoria/promocoes" },
  { name: "Rastrear Pedido", href: "/rastreio" },
  { name: "Contato", href: "/contato" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-background sticky top-0 z-50 border-b border-border">
      <div className="container px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Avance" className="h-10 sm:h-12 lg:h-14 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative group"
                onMouseEnter={() => link.submenu && setActiveSubmenu(link.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                {link.submenu ? (
                  <span className="flex items-center gap-1 text-[10px] xl:text-xs font-semibold tracking-[0.15em] uppercase text-foreground hover:text-muted-foreground transition-colors py-2 cursor-pointer">
                    {link.name}
                    <ChevronDown className="w-3 h-3" />
                  </span>
                ) : (
                  <Link 
                    to={link.href} 
                    className={`flex items-center gap-1 text-[10px] xl:text-xs font-semibold tracking-[0.15em] uppercase transition-colors py-2 ${
                      location.pathname === link.href ? 'text-accent' : 'text-foreground hover:text-muted-foreground'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
                
                {link.submenu && activeSubmenu === link.name && (
                  <div className="absolute top-full left-0 bg-background border border-border py-2 min-w-[160px] animate-fade-in shadow-lg">
                    {link.submenu.map((sublink) => (
                      <Link 
                        key={sublink.name}
                        to={sublink.href}
                        className={`block px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                          location.pathname === sublink.href 
                            ? 'text-accent bg-secondary' 
                            : 'text-foreground hover:text-accent hover:bg-secondary'
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label="Buscar produtos"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors hidden sm:flex">
              <User className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
            <CartDrawer />
            
            {/* Search Modal */}
            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 hover:bg-secondary rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border animate-slide-in max-h-[calc(100vh-56px)] overflow-y-auto">
          <nav className="container px-4 sm:px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.submenu ? (
                  <span className="block text-xs font-semibold tracking-[0.15em] uppercase text-foreground py-2.5 border-b border-border/50">
                    {link.name}
                  </span>
                ) : (
                  <Link 
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-xs font-semibold tracking-[0.15em] uppercase transition-colors py-2.5 border-b border-border/50 ${
                      location.pathname === link.href ? 'text-accent' : 'text-foreground hover:text-accent'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
                {link.submenu && (
                  <div className="pl-4 flex flex-col">
                    {link.submenu.map((sublink) => (
                      <Link 
                        key={sublink.name}
                        to={sublink.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-xs font-medium transition-colors py-2 border-b border-border/30 ${
                          location.pathname === sublink.href 
                            ? 'text-accent' 
                            : 'text-muted-foreground hover:text-accent'
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
