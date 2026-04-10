import { useState, useCallback, MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, Headphones } from "lucide-react";
import logo from "@/assets/logo-avance.png";
import CartDrawer from "@/components/cart/CartDrawer";
import SearchModal from "@/components/search/SearchModal";

const navLinks = [
  { name: "Novidades", href: "/categoria/lancamentos" },
  { 
    name: "Produtos", 
    href: "#",
    submenu: [
      { name: "Shorts", href: "/categoria/shorts" },
      { name: "Bermudas", href: "/categoria/bermudas" },
      { name: "Leggings", href: "/categoria/leggings" },
      { name: "Tops", href: "/categoria/tops" },
      { name: "Blusas", href: "/categoria/blusas" },
      { name: "Conjuntos", href: "/categoria/conjuntos" },
    ]
  },
  { name: "Promoções", href: "/categoria/promocoes" },
  { name: "Private Label", href: "/private-label" },
  
  { 
    name: "Contato", 
    href: "/contato",
    submenu: [
      { name: "Fale Conosco", href: "/contato" },
      { name: "Suporte", href: "/suporte" },
    ]
  },
  { name: "Rastreio", href: "/rastreio" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const handleToggleMenu = useCallback(() => {
    if (mobileMenuOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setMobileMenuOpen(false);
        setIsClosing(false);
      }, 200);
    } else {
      setMobileMenuOpen(true);
    }
  }, [mobileMenuOpen]);

  const handleCloseMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  return (
    <header className="bg-background sticky top-0 z-50 border-b border-border/50">
      <div className="container px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 group/logo">
            <img src={logo} alt="Avance" className="w-[60px] h-[60px] object-contain transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:brightness-110" />
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center gap-5 xl:gap-7">
              {navLinks.map((link) => (
                <div 
                  key={link.name} 
                  className="relative group"
                  onMouseEnter={() => link.submenu && setActiveSubmenu(link.name)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  {link.submenu ? (
                    <span 
                      className="flex items-center gap-1 text-[11px] xl:text-xs font-semibold tracking-[0.15em] uppercase text-foreground hover:text-accent transition-colors py-2 cursor-pointer"
                    >
                      {link.name}
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  ) : (
                    <Link 
                      to={link.href}
                      className={`text-[11px] xl:text-xs font-semibold tracking-[0.15em] uppercase transition-colors py-2 ${
                        location.pathname === link.href ? 'text-accent' : 'text-foreground hover:text-accent'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}
                  
                  {link.submenu && activeSubmenu === link.name && (
                    <div className="absolute top-full left-0 bg-background border border-border py-2 min-w-[180px] animate-slide-down shadow-lg z-50">
                      {link.submenu.map((sublink) => (
                        <Link 
                          key={sublink.name}
                          to={sublink.href}
                          className={`block px-5 py-2.5 text-xs font-medium tracking-wide transition-colors ${
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
            </div>
          </nav>

          {/* Right Actions - Search bar + icons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* SAC Button (desktop) */}
            <Link
              to="/sac"
              className="hidden lg:flex items-center gap-2 px-5 py-2 border-2 border-primary rounded-full text-primary font-semibold text-xs tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Headphones className="w-4 h-4" />
              SAC
            </Link>

            {/* Search bar (desktop) */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 px-4 py-2 border border-border rounded-full text-muted-foreground hover:border-foreground/30 transition-colors min-w-[200px] xl:min-w-[220px]"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs tracking-wide">O que você procura?</span>
            </button>
            
            {/* Search icon (mobile) */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <CartDrawer />
            
            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 hover:bg-secondary rounded-full transition-colors active:scale-95"
              onClick={handleToggleMenu}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className={`lg:hidden bg-background border-t border-border max-h-[calc(100vh-56px)] overflow-y-auto ${
            isClosing ? 'animate-slide-up' : 'animate-slide-down'
          }`}
        >
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
                    onClick={handleCloseMenu}
                    className={`block text-xs font-semibold tracking-[0.15em] uppercase transition-colors py-2.5 border-b border-border/50 active:bg-secondary/50 ${
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
                        onClick={handleCloseMenu}
                        className={`text-xs font-medium transition-colors py-2 border-b border-border/30 active:bg-secondary/50 ${
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
