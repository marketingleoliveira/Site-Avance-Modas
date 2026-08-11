import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProductSections, useLayoutSettings } from "@/hooks/useSiteSettings";
import { fetchProductsByType, ShopifyProduct } from "@/lib/shopify-api";
import { COLOR_MAP } from "@/lib/color-utils";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import logoAvance from "@/assets/logo-avance.png";
import { useActiveCoupons } from "@/hooks/useActiveCoupons";
import CouponBadge from "@/components/product/CouponBadge";
import PriceDisplay from "@/components/product/PriceDisplay";
import { useAtacadoSettings } from "@/hooks/useAtacadoSettings";

interface ProductSectionsDynamicProps {
  type: 'ATACADO' | 'VAREJO';
}

// Category filter icons - SVG paths for each category
const categoryIcons: Record<string, React.ReactNode> = {
  leggings: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 8h16v4l-2 20h-4l-2-16-2 16h-4l-2-20v-4z" />
    </svg>
  ),
  tops: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 10c0-2 2-4 6-4s6 2 6 4v2c2 0 4 2 4 4v8h-6v-6h-8v6h-6v-8c0-2 2-4 4-4v-2z" />
    </svg>
  ),
  camisetas: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 8l-6 4v6l4-2v16h16V16l4 2V12l-6-4c0 2-2 4-6 4s-6-2-6-4z" />
    </svg>
  ),
  shorts: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 10h20v4l-3 12h-6l-1-8-1 8h-6l-3-12v-4z" />
    </svg>
  ),
  bermudas: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 10h20v4l-2 16h-7l-1-10-1 10h-7l-2-16v-4z" />
    </svg>
  ),
  conjuntos: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 6c0-1 2-2 6-2s6 1 6 2v2c1 0 2 1 2 2v4h-4v-2h-8v2h-4v-4c0-1 1-2 2-2v-2z" />
      <path d="M12 18h16v2l-2 14h-5l-1-10-1 10h-5l-2-14v-2z" />
    </svg>
  ),
  todos: (
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="8" width="10" height="10" rx="2" />
      <rect x="22" y="8" width="10" height="10" rx="2" />
      <rect x="8" y="22" width="10" height="10" rx="2" />
      <rect x="22" y="22" width="10" height="10" rx="2" />
    </svg>
  ),
};

// Available category filters
const categoryFilters = [
  { id: 'todos', label: 'TODOS', tag: null },
  { id: 'leggings', label: 'LEGGINGS', tag: 'leggings' },
  { id: 'tops', label: 'TOPS', tag: 'tops' },
  { id: 'camisetas', label: 'CAMISETAS', tag: 'camisetas' },
  { id: 'shorts', label: 'SHORTS', tag: 'shorts' },
  { id: 'bermudas', label: 'BERMUDAS', tag: 'bermudas' },
  { id: 'conjuntos', label: 'CONJUNTOS', tag: 'conjuntos' },
];

const getColorHex = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  const mapped = COLOR_MAP[normalized];
  return mapped ? mapped.bg : '#6b7280';
};

const ProductSectionsDynamic = ({ type }: ProductSectionsDynamicProps) => {
  const { settings: sectionsSettings, loading: sectionsLoading } = useProductSections(type);
  const { settings: layoutSettings } = useLayoutSettings();
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const addItem = useCartStore((state) => state.addItem);
  const { getCouponForProduct } = useActiveCoupons(type === 'ATACADO' ? 'atacado' : 'varejo');
  const { settings: atacadoSettings } = useAtacadoSettings();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      // Fetch products filtered by store type directly
      const products = await fetchProductsByType(type, 250);
      setAllProducts(products);
      setLoading(false);
    };

    loadProducts();
  }, [type]);

  // When filter changes, filter products locally based on title keywords
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);

  // Mapping of filter categories to title keywords
  const categoryKeywords: Record<string, string[]> = {
    leggings: ['legging', 'leggings', 'calça'],
    tops: ['top', 'tops', 'regata', 'cropped', 'nadador'],
    camisetas: ['camiseta', 'camisetas', 'baby look', 'tapa bumbum', 'blusa'],
    shorts: ['short', 'shorts'],
    bermudas: ['bermuda', 'bermudas'],
    conjuntos: ['conjunto', 'conjuntos'],
  };

  useEffect(() => {
    const loadFilteredProducts = async () => {
      if (activeFilter === 'todos') {
        // Sort: leggings first, then tops, then the rest
        const leggingsKw = categoryKeywords.leggings;
        const topsKw = categoryKeywords.tops;
        const getRank = (title: string) => {
          const t = title.toLowerCase();
          if (leggingsKw.some(k => t.includes(k))) return 0;
          if (topsKw.some(k => t.includes(k))) return 1;
          return 2;
        };
        const sorted = [...allProducts].sort(
          (a, b) => getRank(a.node.title) - getRank(b.node.title)
        );
        setFilteredProducts(sorted);
        return;
      }
      
      setFilterLoading(true);
      
      // Filter products locally by title keywords
      const keywords = categoryKeywords[activeFilter] || [activeFilter];
      const filtered = allProducts.filter(product => {
        const title = product.node.title.toLowerCase();
        // Check if the title contains any of the category keywords
        return keywords.some(keyword => title.includes(keyword.toLowerCase()));
      });
      
      setFilteredProducts(filtered);
      setFilterLoading(false);
    };

    loadFilteredProducts();
  }, [activeFilter, allProducts, type]);

  const handleAddToCart = (product: ShopifyProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const firstVariant = product.node.variants.edges[0]?.node;
    const isAtacadoProduct = product.node.title?.toUpperCase().includes('ATACADO');
    // For VAREJO, we still check availability. For ATACADO, we assume immediate availability as per business rules.
    if (!firstVariant || (type === 'VAREJO' && !firstVariant.availableForSale)) {
      toast.error("Produto indisponível");
      return;
    }

    addItem({
      product: product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions
    });
    
    toast.success("Adicionado ao carrinho!");
  };

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode
    }).format(parseFloat(amount));
  };

  const getProductColors = (product: ShopifyProduct) => {
    const colorOption = product.node.options.find(opt => 
      opt.name.toLowerCase() === 'cor' || opt.name.toLowerCase() === 'color'
    );
    if (!colorOption) return [];
    
    return colorOption.values.map(color => ({ name: color, hex: getColorHex(color) }));
  };

  const colsDesktop = layoutSettings?.products_columns_desktop || "5";
  const colsMobile = layoutSettings?.products_columns_mobile || "2";

  if (sectionsLoading || loading || filterLoading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary rounded mb-3"></div>
                <div className="h-3 bg-secondary rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-secondary rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background" id="produtos">
      <div className="container">
        {/* Section Header with Category Filters */}
        <div className="mb-10">
          {type === 'ATACADO' && atacadoSettings.show_minimum_order_notice && (
            <div className="flex justify-center mb-6 -mt-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-amber-800 shadow-sm">
                Pedido mínimo da loja: R$ {atacadoSettings.minimum_order.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}

          {/* Category Filters */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex items-center justify-start sm:justify-center gap-6 sm:gap-8 md:gap-12 py-5 min-w-max sm:min-w-0">
              {categoryFilters.map((category) => {
                const isActive = activeFilter === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveFilter(category.id)}
                    className="flex flex-col items-center gap-2 sm:gap-2.5 transition-all duration-300 group flex-shrink-0"
                  >
                    <div className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-foreground text-background shadow-lg scale-110' 
                        : 'bg-secondary text-muted-foreground group-hover:bg-foreground/10 group-hover:text-foreground group-hover:scale-105'
                    }`}>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 [&>svg]:w-full [&>svg]:h-full">
                        {categoryIcons[category.id] || categoryIcons.todos}
                      </div>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-colors duration-300 ${
                      isActive 
                        ? 'text-foreground' 
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}>
                      {category.label}
                    </span>
                    {/* Active indicator line */}
                    <div className={`h-0.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-6 sm:w-8 bg-accent' : 'w-0 bg-transparent'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-lg">
            <p className="text-muted-foreground text-sm">
              Nenhum produto encontrado para esta categoria.
            </p>
          </div>
        ) : (
          <>
            <style>{`
              .products-grid {
                grid-template-columns: repeat(${colsMobile}, minmax(0, 1fr));
              }
              @media (min-width: 768px) {
                .products-grid {
                  grid-template-columns: repeat(3, minmax(0, 1fr));
                }
              }
              @media (min-width: 1024px) {
                .products-grid {
                  grid-template-columns: repeat(${colsDesktop}, minmax(0, 1fr));
                }
              }
              .product-card-image-secondary {
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
              }
              .product-card:hover .product-card-image-secondary {
                opacity: 1;
              }
            `}</style>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const colors = getProductColors(product);
                const tags = product.node.tags || [];
                const isNew = tags.some(tag => tag.toLowerCase() === 'novo');
                const isPromo = tags.some(tag => tag.toLowerCase() === 'promoção' || tag.toLowerCase() === 'promocao');
                
                // Check if product has compare at price (on sale)
                const compareAtPrice = product.node.compareAtPriceRange?.minVariantPrice?.amount;
                const currentPrice = product.node.priceRange.minVariantPrice.amount;
                const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(currentPrice);
                const discountPercent = hasDiscount 
                  ? Math.round((1 - parseFloat(currentPrice) / parseFloat(compareAtPrice)) * 100)
                  : 0;
                const productCoupon = getCouponForProduct(product.node.handle);
                
                return (
                  <Link
                    key={product.node.id}
                    to={`/produto/${product.node.handle}`}
                    className="product-card group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-[300px] mx-auto flex flex-col"
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden flex-shrink-0">
                      <div className="relative h-[400px] w-[300px] overflow-hidden bg-secondary">
                        <img
                          src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                          alt={product.node.title}
                          loading="lazy"
                          className="product-card-image absolute inset-0 w-full h-full object-cover object-top"
                        />
                        {product.node.images.edges[1]?.node.url && (
                          <img
                            src={product.node.images.edges[1].node.url}
                            alt={product.node.title}
                            loading="lazy"
                            className="product-card-image-secondary absolute inset-0 w-full h-full object-cover object-top"
                          />
                        )}
                      </div>
                      
                      {/* Logo - Top Right */}
                      <div className="absolute right-2 top-2 pointer-events-none">
                        <img 
                          src={logoAvance} 
                          alt="Avance Modas" 
                          className="w-[50px] h-[50px] object-contain"
                        />
                      </div>

                      {/* Coupon Badge */}
                      {productCoupon && <CouponBadge coupon={productCoupon} variant="ribbon" />}

                      {/* Discount Ribbon - Diagonal flag */}
                      {(isPromo || hasDiscount) && (
                        <div className="absolute -left-[34px] top-[18px] z-10 pointer-events-none rotate-[-45deg] w-[140px]">
                          <div className="bg-red-600 text-white text-sm font-black uppercase tracking-wide text-center py-1 shadow-lg">
                            {hasDiscount ? `-${discountPercent}%` : 'PROMO'}
                          </div>
                        </div>
                      )}

                      {/* New Ribbon - Diagonal flag */}
                      {isNew && !isPromo && !hasDiscount && (
                        <div className="absolute -left-[34px] top-[18px] z-10 pointer-events-none rotate-[-45deg] w-[140px]">
                          <div className="bg-emerald-600 text-white text-sm font-black uppercase tracking-wide text-center py-1 shadow-lg">
                            NOVO
                          </div>
                        </div>
                      )}
                      {/* Material Tags */}
                      <div className="absolute left-2 bottom-2 flex flex-col gap-1 pointer-events-none">
                        {tags.slice(0, 2).map((tag, idx) => {
                          if (tag.toLowerCase().includes('lycra')) {
                            return (
                              <span key={idx} className="bg-foreground/80 text-background text-[8px] px-1.5 py-0.5 rounded font-bold uppercase backdrop-blur-sm">
                                LYCRA
                              </span>
                            );
                          }
                          if (tag.toLowerCase().includes('uv')) {
                            return (
                              <span key={idx} className="bg-foreground/80 text-background text-[8px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
                                UV 50+
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3 sm:p-4 text-center space-y-2.5 flex-1 flex flex-col justify-center">
                      <h3 className="text-[11px] sm:text-xs font-semibold text-foreground line-clamp-2 uppercase tracking-wide leading-tight">
                        {product.node.title}
                      </h3>
                      
                      {/* Price */}
                      <PriceDisplay
                        amount={currentPrice}
                        compareAtAmount={hasDiscount ? compareAtPrice : null}
                        currencyCode={product.node.priceRange.minVariantPrice.currencyCode}
                        size="md"
                        align="center"
                        showPixBadge={type === 'VAREJO'}
                        showInstallments={type === 'VAREJO'}
                      />

                      <span
                        className="block w-full py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm hover:shadow-md text-center cursor-pointer"
                      >
                        Comprar
                      </span>

                      {/* Available Sizes */}
                      {(() => {
                        const sizeOption = product.node.options?.find(
                          opt => opt.name.toLowerCase() === 'tamanho' || opt.name.toLowerCase() === 'size'
                        );
                        const sizes = sizeOption?.values || [];
                        if (sizes.length === 0) return null;
                        return (
                          <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5">
                            {sizes.map(size => (
                              <span
                                key={size}
                                className="text-[10px] sm:text-xs font-semibold text-muted-foreground border border-border rounded px-2 py-1 leading-none"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Available Colors Count */}
                      {(() => {
                        const colorCount = colors.length;
                        if (colorCount === 0) return null;
                        return (
                          <div className="flex items-center justify-center gap-1.5 pt-0.5">
                            <div className="flex -space-x-1">
                              {colors.map((c, i) => (
                                <span
                                  key={i}
                                  className="w-3 h-3 rounded-full border border-background shadow-sm"
                                  style={{ backgroundColor: c.hex || '#ccc' }}
                                />
                              ))}
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">
                              {colorCount} {colorCount === 1 ? 'cor' : 'cores'}
                            </span>
                          </div>
                        );
                      })()}
                      {/* Stock Info */}
                      {(() => {
                        const firstVariant = product.node.variants.edges[0]?.node;
                        if (!firstVariant) return null;
                        
                        const isAtacado = product.node.title?.toUpperCase().includes('ATACADO');
                        
                        return (
                          <div className="flex items-center justify-center gap-1.5 pt-0.5">
                            <span className={`text-[9px] sm:text-[10px] font-medium ${
                              isAtacado 
                                ? 'text-emerald-600' 
                                : (firstVariant.availableForSale || (firstVariant as any).inventoryQuantity > 0)
                                  ? 'text-muted-foreground' 
                                  : 'text-destructive'
                            }`}>
                              {isAtacado 
                                ? 'Disponibilidade imediata' 
                                : (firstVariant.availableForSale || (firstVariant as any).inventoryQuantity > 0)
                                  ? ((firstVariant as any).inventoryQuantity > 0 ? `${(firstVariant as any).inventoryQuantity} em estoque` : 'Em estoque')
                                  : 'Esgotado'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Ver Todos Button - Highly Prominent */}
            <div className="flex flex-col items-center mt-14 mb-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-foreground/30 to-transparent mb-6" />
              <Link
                to={activeFilter === 'todos' ? '/categoria/todos' : `/categoria/${activeFilter}`}
                className="group relative inline-flex items-center gap-4 px-10 sm:px-14 py-5 sm:py-6 bg-accent text-accent-foreground font-extrabold text-base sm:text-lg uppercase tracking-[0.2em] rounded-full shadow-2xl hover:shadow-[0_20px_50px_-12px_hsl(var(--accent)/0.6)] hover:scale-105 transition-all duration-300 ring-4 ring-accent/20 hover:ring-accent/40 animate-pulse-subtle"
              >
                <span className="relative z-10">Ver Todos os Produtos</span>
                <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 relative z-10 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <p className="mt-4 text-xs sm:text-sm text-muted-foreground font-medium tracking-wide">
                Explore toda a coleção {type === 'ATACADO' ? 'atacado' : 'varejo'}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ProductSectionsDynamic;
