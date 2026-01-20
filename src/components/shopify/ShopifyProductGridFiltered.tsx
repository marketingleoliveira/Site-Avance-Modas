import { useState, useEffect } from "react";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopifyProduct } from "@/lib/shopify-api";
import { ShopifyCollection, fetchCollectionsByType, getProductsFromCollections } from "@/lib/shopify-collections";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ShopifyProductGridFilteredProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
  type: 'ATACADO' | 'VAREJO';
}

const ShopifyProductGridFiltered = ({ 
  title = "Nossos Produtos", 
  subtitle = "Conheça nossa coleção de roupas fitness.",
  limit = 8,
  showViewAll = true,
  type
}: ShopifyProductGridFilteredProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const collections = await fetchCollectionsByType(type);
      const allProducts = getProductsFromCollections(collections);
      setProducts(allProducts.slice(0, limit));
      setLoading(false);
    };
    loadProducts();
  }, [limit, type]);

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
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
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
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
          </div>
          <div className="text-center py-16 bg-card rounded-lg">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ainda não há produtos de {type.toLowerCase()} cadastrados.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="produtos" className="py-20 bg-background">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h2>
            <p className="text-muted-foreground max-w-xl">{subtitle}</p>
          </div>
          {showViewAll && (
            <Button variant="outline">Ver Todos</Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <button className="p-2 bg-card rounded-full shadow-soft hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-card rounded-full shadow-soft hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300">
                    <Button 
                      variant="shop" 
                      size="sm" 
                      className="w-full gap-2"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {product.node.title}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(price.amount, price.currencyCode)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopifyProductGridFiltered;
