import { useState, useCallback, MouseEvent } from "react";
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
  { 
    name: "Lançamentos", 
    href: "/categoria/lancamentos",
    submenu: [
      { name: "Todos os Lançamentos", href: "/categoria/lancamentos" },
      { name: "Private Label", href: "/private-label" },
    ]
  },
  { name: "Promoções", href: "/categoria/promocoes" },
  { name: "Rastrear Pedido", href: "/rastreio" },
  { name: "Contato", href: "/contato" },
];

// Ripple effect hook
const useRipple = () => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const createRipple = useCallback((e: MouseEvent<HTMLElement>) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  }, []);

  const rippleElements = ripples.map(ripple => (
    <span
      key={ripple.id}
      className="absolute rounded-full bg-foreground/15 pointer-events-none animate-ripple"
      style={{
        left: ripple.x,
        top: ripple.y,
        width: 10,
        height: 10,
        marginLeft: -5,
        marginTop: -5,
      }}
    />
  ));

  return { createRipple, rippleElements };
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { createRipple, rippleElements } = useRipple();

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
    <header className="bg-background sticky top-0 z-50 border-b border-border">
      <div className="container px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Avance" className="h-10 sm:h-12 lg:h-14 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 select-none">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative group"
                onMouseEnter={() => link.submenu && setActiveSubmenu(link.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                {link.submenu ? (
                  <span 
                    className="relative overflow-hidden flex items-center gap-1 text-[10px] xl:text-xs font-semibold tracking-[0.15em] uppercase text-foreground hover:text-muted-foreground transition-colors py-2 cursor-pointer"
                    onClick={createRipple}
                  >
                    {link.name}
                    <ChevronDown className="w-3 h-3" />
                    {rippleElements}
                  </span>
                ) : (
                  <Link 
                    to={link.href}
                    onClick={createRipple}
                    className={`relative overflow-hidden flex items-center gap-1 text-[10px] xl:text-xs font-semibold tracking-[0.15em] uppercase transition-colors py-2 ${
                      location.pathname === link.href ? 'text-accent' : 'text-foreground hover:text-muted-foreground'
                    }`}
                  >
                    {link.name}
                    {rippleElements}
                  </Link>
                )}
                
                {link.submenu && activeSubmenu === link.name && (
                  <div className="absolute top-full left-0 bg-background border border-border py-2 min-w-[160px] animate-slide-down shadow-lg z-50">
                    {link.submenu.map((sublink) => (
                      <Link 
                        key={sublink.name}
                        to={sublink.href}
                        onClick={createRipple}
                        className={`relative overflow-hidden block px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                          location.pathname === sublink.href 
                            ? 'text-accent bg-secondary' 
                            : 'text-foreground hover:text-accent hover:bg-secondary'
                        }`}
                      >
                        {sublink.name}
                        {rippleElements}
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
              onClick={(e) => {
                createRipple(e);
                setSearchOpen(true);
              }}
              className="relative overflow-hidden p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label="Buscar produtos"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {rippleElements}
            </button>
            <button 
              onClick={createRipple}
              className="relative overflow-hidden p-2 hover:bg-secondary rounded-full transition-colors hidden sm:flex"
            >
              <User className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {rippleElements}
            </button>
            <CartDrawer />
            
            {/* Search Modal */}
            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
            
            {/* Mobile Menu Button */}
            <button 
              className="relative overflow-hidden lg:hidden p-2 hover:bg-secondary rounded-full transition-colors active:scale-95"
              onClick={(e) => {
                createRipple(e);
                handleToggleMenu();
              }}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {rippleElements}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className={`lg:hidden bg-background border-t border-border max-h-[calc(100vh-56px)] overflow-y-auto select-none ${
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
                    onClick={(e) => {
                      createRipple(e);
                      handleCloseMenu();
                    }}
                    className={`relative overflow-hidden block text-xs font-semibold tracking-[0.15em] uppercase transition-colors py-2.5 border-b border-border/50 active:bg-secondary/50 ${
                      location.pathname === link.href ? 'text-accent' : 'text-foreground hover:text-accent'
                    }`}
                  >
                    {link.name}
                    {rippleElements}
                  </Link>
                )}
                {link.submenu && (
                  <div className="pl-4 flex flex-col">
                    {link.submenu.map((sublink) => (
                      <Link 
                        key={sublink.name}
                        to={sublink.href}
                        onClick={(e) => {
                          createRipple(e);
                          handleCloseMenu();
                        }}
                        className={`relative overflow-hidden text-xs font-medium transition-colors py-2 border-b border-border/30 active:bg-secondary/50 ${
                          location.pathname === sublink.href 
                            ? 'text-accent' 
                            : 'text-muted-foreground hover:text-accent'
                        }`}
                      >
                        {sublink.name}
                        {rippleElements}
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
