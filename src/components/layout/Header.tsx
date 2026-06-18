import { useState, useCallback, MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, Headphones, Mail, RefreshCw, Repeat } from "lucide-react";
import logo from "@/assets/logo-avance.png";
import CartDrawer from "@/components/cart/CartDrawer";
import SearchModal from "@/components/search/SearchModal";
import { useStoreContext } from "@/stores/storeContextStore";

const navLinks = [
  { name: "Início", href: "/varejo" },
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
  { name: "Rastreio", href: "/rastreio" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const storeType = useStoreContext((s) => s.storeType);
  const setStoreType = useStoreContext((s) => s.setStoreType);

  // Determine current store context (pathname takes precedence over persisted store)
  const isAtacadoContext =
    location.pathname.startsWith("/atacado") ||
    (!location.pathname.startsWith("/varejo") && storeType === "atacado");
  const otherStore = isAtacadoContext
    ? { label: "Varejo", href: "/varejo", type: "varejo" as const }
    : { label: "Atacado", href: "/atacado", type: "atacado" as const };

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
            <img src={logo} alt="Logotipo Avance Modas" className="w-[60px] h-[60px] object-contain transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:brightness-110" />
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
            {/* Switch store (blinking) */}
            <Link
              to={otherStore.href}
              onClick={() => setStoreType(otherStore.type)}
              aria-label={`Ir para ${otherStore.label}`}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs tracking-wider uppercase bg-accent text-accent-foreground shadow-[0_0_0_0_hsl(var(--accent)/0.6)] animate-pulse-ring hover:animate-none hover:bg-accent/90 transition-colors"
            >
              <Repeat className="w-4 h-4" />
              {otherStore.label}
            </Link>

            {/* SAC Button (desktop) */}
            <Link
              to="/sac"
              className="hidden lg:flex items-center gap-2 px-5 py-2 border-2 border-primary rounded-full text-primary font-semibold text-xs tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <Headphones className="w-4 h-4" />
              SAC
            </Link>

            {/* Contato Button (desktop) */}
            {/* Trocas Button (desktop) */}
            <a
              href="https://troqueavancemodas.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-5 py-2 border-2 border-accent rounded-full text-accent font-semibold text-xs tracking-wider uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              Trocas
            </a>

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

            {/* Switch store (mobile, blinking) */}
            <Link
              to={otherStore.href}
              onClick={() => setStoreType(otherStore.type)}
              aria-label={`Ir para ${otherStore.label}`}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] tracking-wider uppercase bg-accent text-accent-foreground animate-pulse-ring"
            >
              <Repeat className="w-3.5 h-3.5" />
              {otherStore.label}
            </Link>

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
            
            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
              <Link
                to="/sac"
                onClick={handleCloseMenu}
                className="flex items-center gap-2 px-4 py-3 border-2 border-primary rounded-full text-primary font-semibold text-xs tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Headphones className="w-4 h-4" />
                SAC
              </Link>
              <a
                href="https://troqueavancemodas.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCloseMenu}
                className="flex items-center gap-2 px-4 py-3 border-2 border-accent rounded-full text-accent font-semibold text-xs tracking-wider uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4" />
                Trocas
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
