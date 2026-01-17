import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProductSections, useLayoutSettings } from "@/hooks/useSiteSettings";
import { fetchCollectionsByType, getProductsFromCollections } from "@/lib/shopify-collections";
import { fetchProductsByTag, ShopifyProduct } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Heart, Eye, ShoppingBag } from "lucide-react";

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
          // Filter by tag
          const products = await fetchProductsByTag(section.tag_filter, section.limit);
          productsMap[section.id] = products;
        } else {
          // Get all products from collections by type
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

  const gap = layoutSettings?.products_gap || "6";
  const colsMobile = layoutSettings?.products_columns_mobile || "2";
  const colsDesktop = layoutSettings?.products_columns_desktop || "4";

  if (sectionsLoading || loading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className={`grid grid-cols-${colsMobile} md:grid-cols-${colsDesktop} gap-${gap}`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary rounded-lg mb-4"></div>
                <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-secondary rounded w-1/2"></div>
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
          <section key={section.id} className="py-16" id="produtos">
            <div className="container">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {section.subtitle}
                  </p>
                )}
              </div>

              {/* Products Grid */}
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum produto encontrado nesta seção.
                    {section.tag_filter && (
                      <span className="block text-sm mt-2">
                        Adicione a tag "{section.tag_filter}" aos produtos no Shopify.
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <div 
                  className="grid gap-6"
                  style={{
                    gridTemplateColumns: `repeat(${colsMobile}, minmax(0, 1fr))`,
                  }}
                >
                  <style>{`
                    @media (min-width: 768px) {
                      .products-grid-${section.id} {
                        grid-template-columns: repeat(${colsDesktop}, minmax(0, 1fr)) !important;
                      }
                    }
                  `}</style>
                  <div 
                    className={`grid gap-${gap} products-grid-${section.id}`}
                    style={{
                      gridTemplateColumns: `repeat(${colsMobile}, minmax(0, 1fr))`,
                      display: 'contents'
                    }}
                  >
                  </div>
                  {products.map((product) => (
                    <Link
                      key={product.node.id}
                      to={`/produto/${product.node.handle}`}
                      className="group"
                    >
                      <div className="relative overflow-hidden rounded-lg bg-secondary aspect-[3/4] mb-4">
                        <img
                          src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                          alt={product.node.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          <button 
                            className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Heart className="w-5 h-5" />
                          </button>
                          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                            onClick={(e) => handleAddToCart(product, e)}
                          >
                            <ShoppingBag className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {product.node.title}
                      </h3>
                      <p className="text-accent font-semibold mt-1">
                        {formatPrice(
                          product.node.priceRange.minVariantPrice.amount,
                          product.node.priceRange.minVariantPrice.currencyCode
                        )}
                      </p>
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
