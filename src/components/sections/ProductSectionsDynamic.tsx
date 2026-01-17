import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProductSections, useLayoutSettings } from "@/hooks/useSiteSettings";
import { fetchCollectionsByType, getProductsFromCollections } from "@/lib/shopify-collections";
import { fetchProductsByTag, ShopifyProduct } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

interface ProductSectionsDynamicProps {
  type: 'ATACADO' | 'VAREJO';
}

const ProductSectionsDynamic = ({ type }: ProductSectionsDynamicProps) => {
  const { settings: sectionsSettings, loading: sectionsLoading } = useProductSections(type);
  const { settings: layoutSettings } = useLayoutSettings();
  const [sectionProducts, setSectionProducts] = useState<Record<string, ShopifyProduct[]>>({});
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      if (!sectionsSettings?.sections) return;
      
      setLoading(true);
      const productsMap: Record<string, ShopifyProduct[]> = {};

      for (const section of sectionsSettings.sections) {
        if (section.tag_filter) {
          const products = await fetchProductsByTag(section.tag_filter, section.limit);
          productsMap[section.id] = products;
        } else {
          const collections = await fetchCollectionsByType(type);
          const allProducts = getProductsFromCollections(collections);
          productsMap[section.id] = allProducts.slice(0, section.limit);
        }
      }

      setSectionProducts(productsMap);
      setLoading(false);
    };

    if (sectionsSettings) {
      loadProducts();
    }
  }, [sectionsSettings, type]);

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

  const sortedSections = sectionsSettings?.sections.sort((a, b) => a.order - b.order) || [];

  return (
    <>
      {sortedSections.map((section) => {
        const products = sectionProducts[section.id] || [];
        
        return (
          <section key={section.id} className="py-12" id="produtos">
            <div className="container">
              {/* Section Header - Clean & Minimal */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.subtitle}
                    </p>
                  )}
                </div>
                <Link 
                  to={`/categoria/${section.tag_filter || 'todos'}`}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                >
                  Ver Todos →
                </Link>
              </div>

              {/* Products Grid - Compact & Clean */}
              {products.length === 0 ? (
                <div className="text-center py-12 bg-secondary/30 rounded-lg">
                  <p className="text-muted-foreground text-sm">
                    Nenhum produto encontrado.
                    {section.tag_filter && (
                      <span className="block mt-1 text-xs">
                        Adicione a tag "{section.tag_filter}" no Shopify.
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <div 
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${colsMobile}, minmax(0, 1fr))`
                  }}
                >
                  <style>{`
                    @media (min-width: 768px) {
                      .products-grid-${section.id} {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                      }
                    }
                    @media (min-width: 1024px) {
                      .products-grid-${section.id} {
                        grid-template-columns: repeat(${colsDesktop}, minmax(0, 1fr)) !important;
                      }
                    }
                  `}</style>
                  <div 
                    className={`grid gap-4 products-grid-${section.id}`}
                    style={{
                      gridTemplateColumns: `repeat(${colsMobile}, minmax(0, 1fr))`,
                      display: 'contents'
                    }}
                  />
                  {products.map((product) => (
                    <Link
                      key={product.node.id}
                      to={`/produto/${product.node.handle}`}
                      className="group"
                    >
                      {/* Product Image - Smaller aspect ratio */}
                      <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-3">
                        <img
                          src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                          alt={product.node.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Quick Add Button - Clean overlay */}
                        <button 
                          className="absolute bottom-0 left-0 right-0 bg-black/80 text-white py-2.5 text-xs font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Adicionar
                        </button>
                      </div>
                      
                      {/* Product Info - Minimal */}
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                          {product.node.title}
                        </h3>
                        <p className="text-sm font-bold text-foreground">
                          {formatPrice(
                            product.node.priceRange.minVariantPrice.amount,
                            product.node.priceRange.minVariantPrice.currencyCode
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
};

export default ProductSectionsDynamic;
