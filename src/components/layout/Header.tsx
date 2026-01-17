import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/logo-avance.png";
import CartDrawer from "@/components/cart/CartDrawer";

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
  { name: "Contato", href: "/contato" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const location = useLocation();

  return (
    <header className="bg-card sticky top-0 z-50 shadow-soft">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Avance" className="h-16 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative group"
                onMouseEnter={() => link.submenu && setActiveSubmenu(link.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                {link.submenu ? (
                  <span className="flex items-center gap-1 text-sm font-semibold tracking-wider uppercase text-foreground hover:text-accent transition-colors py-2 cursor-pointer">
                    {link.name}
                    <ChevronDown className="w-4 h-4" />
                  </span>
                ) : (
                  <Link 
                    to={link.href} 
                    className={`flex items-center gap-1 text-sm font-semibold tracking-wider uppercase transition-colors py-2 ${
                      location.pathname === link.href ? 'text-accent' : 'text-foreground hover:text-accent'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
                
                {link.submenu && activeSubmenu === link.name && (
                  <div className="absolute top-full left-0 bg-card shadow-hover py-4 min-w-[180px] animate-fade-in">
                    {link.submenu.map((sublink) => (
                      <Link 
                        key={sublink.name}
                        to={sublink.href}
                        className={`block px-6 py-2 text-sm font-medium transition-colors ${
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
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <User className="w-5 h-5" />
            </button>
            <CartDrawer />
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 hover:bg-secondary rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border animate-slide-in">
          <nav className="container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.submenu ? (
                  <span className="block text-sm font-semibold tracking-wider uppercase text-foreground py-2">
                    {link.name}
                  </span>
                ) : (
                  <Link 
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm font-semibold tracking-wider uppercase transition-colors py-2 ${
                      location.pathname === link.href ? 'text-accent' : 'text-foreground hover:text-accent'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
                {link.submenu && (
                  <div className="pl-4 mt-2 flex flex-col gap-2">
                    {link.submenu.map((sublink) => (
                      <Link 
                        key={sublink.name}
                        to={sublink.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-sm font-medium transition-colors py-1 ${
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
