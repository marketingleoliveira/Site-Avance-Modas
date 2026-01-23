import { useState, useEffect } from "react";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopifyProduct, fetchProducts } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";

interface ShopifyProductGridProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
}

const ShopifyProductGrid = ({ 
  title = "Nossos Produtos", 
  subtitle = "Conheça nossa coleção de roupas fitness.",
  limit = 8,
  showViewAll = true 
}: ShopifyProductGridProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchProducts(limit);
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, [limit]);

  const handleAddToCart = (product: ShopifyProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const firstVariant = product.node.variants.edges[0]?.node;
    if (!firstVariant) {
      toast.error("Produto indisponível");
      return;
    }

    addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || [],
    });

    toast.success("Adicionado ao carrinho!", {
      description: product.node.title,
      position: "top-center",
    });
  };

  const formatPrice = (amount: string, currencyCode: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode
    }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <section className="py-10 sm:py-16 lg:py-20 bg-background">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">{title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 sm:h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-10 sm:py-16 lg:py-20 bg-background">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">{title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
          </div>
          <div className="text-center py-10 sm:py-16 bg-card rounded-lg">
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4">
              Esta loja ainda não tem produtos. Crie seu primeiro produto dizendo no chat o que deseja vender!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produtos" className="py-10 sm:py-16 lg:py-20 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">{title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">{subtitle}</p>
          </div>
          {showViewAll && (
            <Button variant="outline" size="sm" className="hidden sm:flex">Ver Todos</Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.map((product) => {
            const firstImage = product.node.images.edges[0]?.node;
            const price = product.node.priceRange.minVariantPrice;
            
            return (
              <Link
                key={product.node.id}
                to={`/produto/${product.node.handle}`}
                className="group bg-card rounded-lg overflow-hidden hover-lift shadow-card block"
              >
                <div className="relative aspect-square overflow-hidden">
                  {firstImage ? (
                    <img 
                      src={firstImage.url} 
                      alt={firstImage.altText || product.node.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Logo Avance */}
                  <div className="absolute right-2 top-2">
                    <img 
                      src={logoAvance} 
                      alt="Avance Modas" 
                      className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] object-contain"
                    />
                  </div>

                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <button className="p-1.5 sm:p-2 bg-card rounded-full shadow-soft hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button className="p-1.5 sm:p-2 bg-card rounded-full shadow-soft hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300">
                    <Button 
                      variant="shop" 
                      size="sm" 
                      className="w-full gap-1.5 sm:gap-2 text-xs sm:text-sm"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Adicionar</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-foreground mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-accent transition-colors text-xs sm:text-sm lg:text-base">
                    {product.node.title}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
                      {formatPrice(price.amount, price.currencyCode)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {showViewAll && (
          <div className="mt-6 sm:hidden text-center">
            <Button variant="outline" size="sm">Ver Todos os Produtos</Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopifyProductGrid;
