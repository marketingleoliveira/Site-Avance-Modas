import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { fetchProductsByType, ShopifyProduct } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { useStoreContext } from "@/stores/storeContextStore";
import { toast } from "sonner";
import { ShoppingBag, ChevronRight } from "lucide-react";
import logoAvance from "@/assets/logo-avance.png";
import { useActiveCoupons } from "@/hooks/useActiveCoupons";
import CouponBadge from "@/components/product/CouponBadge";

// Mapping of filter categories to title keywords
const categoryKeywords: Record<string, string[]> = {
  leggings: ['legging', 'leggings', 'calça'],
  tops: ['top', 'tops', 'regata', 'cropped', 'nadador'],
  camisetas: ['camiseta', 'camisetas', 'baby look', 'tapa bumbum', 'blusa'],
  shorts: ['short', 'shorts'],
  bermudas: ['bermuda', 'bermudas'],
  conjuntos: ['conjunto', 'conjuntos'],
  blusas: ['blusa', 'blusas', 'camiseta', 'regata', 'top', 'cropped', 'baby look', 'tapa bumbum'],
};

const categoryConfig: Record<string, { title: string; description: string }> = {
  shorts: {
    title: "Shorts",
    description: "Os melhores shorts fitness para seu treino",
  },
  bermudas: {
    title: "Bermudas",
    description: "Bermudas confortáveis para todas as atividades",
  },
  leggings: {
    title: "Leggings",
    description: "Leggings de alta qualidade e compressão",
  },
  tops: {
    title: "Tops",
    description: "Tops e blusas para seu look fitness",
  },
  camisetas: {
    title: "Camisetas",
    description: "Camisetas confortáveis para seu treino",
  },
  blusas: {
    title: "Blusas",
    description: "Blusas e tops para seu look fitness",
  },
  conjuntos: {
    title: "Conjuntos",
    description: "Conjuntos completos para arrasar no treino",
  },
  lancamentos: {
    title: "Lançamentos",
    description: "As novidades mais recentes da Avance Modas",
  },
  promocoes: {
    title: "Promoções",
    description: "Ofertas imperdíveis para você",
  },
  todos: {
    title: "Todos os Produtos",
    description: "Veja todos os nossos produtos",
  }
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  
  // Use persistent store context
  const storeType = useStoreContext(state => state.storeType);
  const { getCouponForProduct } = useActiveCoupons(storeType === 'ATACADO' ? 'atacado' : 'varejo');
  const displayStoreType = storeType === 'atacado' ? 'ATACADO' : 'VAREJO';

  const config = category ? categoryConfig[category] : null;

  useEffect(() => {
    const loadProducts = async () => {
      if (!config) return;
      setLoading(true);
      
      // Fetch all products filtered by store type (ATACADO/VAREJO)
      const allProducts = await fetchProductsByType(displayStoreType, 100);
      
      // Filter by category keywords (or show all if category is 'todos')
      if (category === 'todos') {
        setProducts(allProducts);
      } else if (category === 'promocoes') {
        // Show only products with a discount (compareAtPrice > price)
        const promoProducts = allProducts.filter(product => {
          const compareAtPrice = product.node.compareAtPriceRange?.minVariantPrice?.amount;
          const currentPrice = product.node.priceRange.minVariantPrice.amount;
          return compareAtPrice && parseFloat(compareAtPrice) > parseFloat(currentPrice);
        });
        setProducts(promoProducts);
      } else {
        const keywords = categoryKeywords[category || ''] || [];
        if (keywords.length === 0) {
          setProducts(allProducts);
        } else {
          const filtered = allProducts.filter(product => {
            const title = product.node.title.toLowerCase();
            return keywords.some(keyword => title.includes(keyword.toLowerCase()));
          });
          setProducts(filtered);
        }
      }
      
      setLoading(false);
    };

    loadProducts();
  }, [category, config, displayStoreType]);

  const handleAddToCart = (product: ShopifyProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const firstVariant = product.node.variants.edges[0]?.node;
    const isAtacadoProduct = product.node.title?.toUpperCase().includes('ATACADO');
    if (!firstVariant || (!isAtacadoProduct && !firstVariant.availableForSale)) {
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

  if (!config) {
    return (
      <div className="min-h-screen bg-background">
        <AnnouncementBar />
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-xl font-bold">Categoria não encontrada</h1>
          <Link to="/" className="text-sm text-accent hover:underline mt-4 inline-block">
            Voltar ao início
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container px-4 sm:px-6 py-2 sm:py-3">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-foreground font-medium">{config.title}</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="container px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{config.title}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{config.description}</p>
      </div>

      {/* Products Grid */}
      <section className="pb-10 sm:pb-12 lg:pb-16">
        <div className="container px-4 sm:px-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary mb-2 sm:mb-3 rounded"></div>
                  <div className="h-2.5 sm:h-3 bg-secondary rounded w-3/4 mb-1.5 sm:mb-2"></div>
                  <div className="h-2.5 sm:h-3 bg-secondary rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 sm:py-16 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground text-xs sm:text-sm">Nenhum produto encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products.map((product) => {
                const productCoupon = getCouponForProduct(product.node.handle);
                return (
                <Link
                  key={product.node.id}
                  to={`/produto/${product.node.handle}`}
                  className="group"
                >
                  <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-2 sm:mb-3 rounded">
                    <img
                      src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                      alt={product.node.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Promotion Badge */}
                    {(() => {
                      const compareAtPrice = product.node.compareAtPriceRange?.minVariantPrice?.amount;
                      const currentPrice = product.node.priceRange.minVariantPrice.amount;
                      const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(currentPrice);
                      const discountPercent = hasDiscount 
                        ? Math.round((1 - parseFloat(currentPrice) / parseFloat(compareAtPrice)) * 100)
                        : 0;
                      return hasDiscount ? (
                        <div className="absolute top-0 left-0 z-10">
                          <div className="bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-md">
                            -{discountPercent}% OFF
                          </div>
                        </div>
                      ) : null;
                    })()}
                    
                    {/* Logo Avance */}
                    <div className="absolute right-2 top-2">
                      <img 
                        src={logoAvance} 
                        alt="Avance Modas" 
                        className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] object-contain"
                      />
                    </div>

                    {productCoupon && <CouponBadge coupon={productCoupon} variant="ribbon" />}
                    
                    {/* Quick Add Button */}
                    <button 
                      className="absolute bottom-0 left-0 right-0 bg-black/80 text-white py-2 sm:py-2.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">Adicionar</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                  
                  <div className="space-y-0.5 sm:space-y-1">
                    <h3 className="text-[10px] sm:text-xs font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors leading-tight">
                      {product.node.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-foreground">
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

      <TestimonialsSection />

      <Footer />
    </div>
  );
};

export default CategoryPage;
