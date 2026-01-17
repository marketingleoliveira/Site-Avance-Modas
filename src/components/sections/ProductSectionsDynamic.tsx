import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProductSections, useLayoutSettings } from "@/hooks/useSiteSettings";
import { fetchCollectionsByType, getProductsFromCollections } from "@/lib/shopify-collections";
import { fetchProductsByTag, ShopifyProduct } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

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
  { id: 'shorts', label: 'SHORTS', tag: 'shorts' },
  { id: 'bermudas', label: 'BERMUDAS', tag: 'bermudas' },
  { id: 'conjuntos', label: 'CONJUNTOS', tag: 'conjuntos' },
];

// Color mapping for variants
const colorMap: Record<string, string> = {
  'preto': '#000000',
  'black': '#000000',
  'branco': '#ffffff',
  'white': '#ffffff',
  'rosa': '#ff69b4',
  'pink': '#ff69b4',
  'azul': '#2563eb',
  'blue': '#2563eb',
  'marinho': '#1e3a5f',
  'navy': '#1e3a5f',
  'verde': '#22c55e',
  'green': '#22c55e',
  'vermelho': '#ef4444',
  'red': '#ef4444',
  'amarelo': '#eab308',
  'yellow': '#eab308',
  'laranja': '#f97316',
  'orange': '#f97316',
  'roxo': '#a855f7',
  'purple': '#a855f7',
  'cinza': '#6b7280',
  'gray': '#6b7280',
  'grey': '#6b7280',
  'bege': '#d4b896',
  'beige': '#d4b896',
  'nude': '#e8d0c0',
  'coral': '#ff7f7f',
  'turquesa': '#40e0d0',
  'vinho': '#722f37',
  'bordô': '#800020',
  'marsala': '#8e5050',
  'caramelo': '#c68642',
  'chumbo': '#36454f',
  'grafite': '#474747',
  'off-white': '#faf9f6',
  'creme': '#fffdd0',
};

const getColorHex = (colorName: string): string | null => {
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || null;
};

const ProductSectionsDynamic = ({ type }: ProductSectionsDynamicProps) => {
  const { settings: sectionsSettings, loading: sectionsLoading } = useProductSections(type);
  const { settings: layoutSettings } = useLayoutSettings();
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const collections = await fetchCollectionsByType(type);
      const products = getProductsFromCollections(collections);
      setAllProducts(products);
      setLoading(false);
    };

    loadProducts();
  }, [type]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'todos') {
      return allProducts;
    }
    return allProducts.filter(product => 
      (product.node.tags || []).some(tag =>
        tag.toLowerCase() === activeFilter.toLowerCase()
      )
    );
  }, [allProducts, activeFilter]);

  const handleAddToCart = (product: ShopifyProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant || !firstVariant.availableForSale) {
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
    
    return colorOption.values
      .map(color => ({ name: color, hex: getColorHex(color) }))
      .filter(c => c.hex !== null)
      .slice(0, 6);
  };

  const colsDesktop = layoutSettings?.products_columns_desktop || "5";
  const colsMobile = layoutSettings?.products_columns_mobile || "2";

  if (sectionsLoading || loading) {
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

  const sectionTitle = type === 'ATACADO' ? 'PRODUTOS ATACADO' : 'PRODUTOS VAREJO';

  return (
    <section className="py-12 bg-background" id="produtos">
      <div className="container">
        {/* Section Header with Category Filters */}
        <div className="mb-10">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight uppercase">
              {sectionTitle}
            </h2>
            <Link 
              to={`/categoria/todos`}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
            >
              Ver Todos →
            </Link>
          </div>

          {/* Category Filters */}
          <div className="flex items-center justify-center gap-6 md:gap-10 py-4 border-t border-b border-border/50">
            {categoryFilters.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`flex flex-col items-center gap-2 transition-all duration-200 group ${
                  activeFilter === category.id 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className={`relative ${
                  activeFilter === category.id 
                    ? 'text-foreground' 
                    : 'text-muted-foreground group-hover:text-foreground'
                }`}>
                  {categoryIcons[category.id] || categoryIcons.todos}
                </div>
                <span className={`text-[10px] md:text-xs font-medium tracking-wider uppercase ${
                  activeFilter === category.id 
                    ? 'border-b-2 border-foreground pb-1' 
                    : ''
                }`}>
                  {category.label}
                </span>
              </button>
            ))}
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
            `}</style>
            <div className="grid products-grid gap-4 md:gap-6">
              {filteredProducts.slice(0, 10).map((product) => {
                const colors = getProductColors(product);
                
                return (
                  <Link
                    key={product.node.id}
                    to={`/produto/${product.node.handle}`}
                    className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Product Image with Color Swatches */}
                    <div className="relative">
                      <div className="aspect-[3/4] overflow-hidden bg-secondary">
                        <img
                          src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                          alt={product.node.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Color Swatches - Right Side */}
                      {colors.length > 0 && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                          {colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-5 h-5 rounded-full shadow-md border-2 border-white"
                              style={{ backgroundColor: color.hex || '#ccc' }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      )}

                      {/* Tags/Badges */}
                      <div className="absolute left-2 top-2 flex flex-col gap-1">
                        {(product.node.tags || []).slice(0, 2).map((tag, idx) => {
                          if (tag.toLowerCase().includes('lycra')) {
                            return (
                              <span key={idx} className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                                LYCRA
                              </span>
                            );
                          }
                          if (tag.toLowerCase().includes('uv')) {
                            return (
                              <span key={idx} className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">
                                UV 50+
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="text-xs font-semibold text-foreground line-clamp-2 uppercase tracking-wide leading-tight mb-2">
                        {product.node.title}
                      </h3>
                      <p className="text-base font-bold text-foreground">
                        {formatPrice(
                          product.node.priceRange.minVariantPrice.amount,
                          product.node.priceRange.minVariantPrice.currencyCode
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ProductSectionsDynamic;
