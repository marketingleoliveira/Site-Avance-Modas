import { useState, useEffect } from "react";
import { Heart, ShoppingBag, Eye, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopifyProduct, fetchProducts, fetchProductsByType } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import logoAvance from "@/assets/logo-avance.png";
import { useActiveCoupons } from "@/hooks/useActiveCoupons";
import CouponBadge from "@/components/product/CouponBadge";

interface ShopifyProductGridProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
  type?: 'ATACADO' | 'VAREJO';
}

const ShopifyProductGrid = ({ 
  title = "Nossos Produtos", 
  subtitle = "Conheça nossa coleção de roupas fitness.",
  limit = 8,
  showViewAll = true,
  type,
}: ShopifyProductGridProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const { getCouponForProduct } = useActiveCoupons(type === 'ATACADO' ? 'atacado' : 'varejo');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      if (type) {
        const data = await fetchProductsByType(type, Math.max(limit * 3, 20));
        setProducts(data.slice(0, limit));
      } else {
        const data = await fetchProducts(limit);
        setProducts(data);
      }
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

  const getColorOptions = (product: ShopifyProduct) => {
    const colorOption = product.node.options?.find(
      opt => opt.name.toLowerCase() === 'cor' || opt.name.toLowerCase() === 'color'
    );
    return colorOption?.values?.slice(0, 5) || [];
  };

  if (loading) {
    return (
      <section className="py-10 sm:py-16 lg:py-20 bg-background">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-3">{title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-3 sm:p-4 space-y-2">
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
      <section className="py-10 sm:py-16 lg:py-20 bg-background">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-3">{title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
          </div>
          <div className="text-center py-10 sm:py-16 bg-card rounded-xl border border-border">
            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4">
              Esta loja ainda não tem produtos.
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
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-[3px] bg-accent rounded-full" />
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-accent">Destaques</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">{title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-xl">{subtitle}</p>
          </div>
          {showViewAll && (
            <Button variant="outline" size="sm" className="hidden sm:flex border-foreground/20 hover:bg-foreground hover:text-background font-semibold">
              Ver Todos
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product) => {
            const firstImage = product.node.images.edges[0]?.node;
            const price = product.node.priceRange.minVariantPrice;
            const colors = getColorOptions(product);
            const productCoupon = getCouponForProduct(product.node.handle);
            
            return (
              <Link
                key={product.node.id}
                to={`/produto/${product.node.handle}`}
                className="group relative bg-card rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_16px_48px_-12px_hsl(0_0%_0%/0.15)] hover:-translate-y-1 block border border-transparent hover:border-accent/20"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  {firstImage ? (
                    <img 
                      src={firstImage.url} 
                      alt={firstImage.altText || product.node.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 product-image-vibrant"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Logo Avance */}
                  <div className="absolute right-2 top-2 z-10">
                    <img 
                      src={logoAvance} 
                      alt="Avance Modas" 
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain opacity-80"
                    />
                  </div>

                  {/* Colors badge */}
                  {colors.length > 0 && (
                    <div className="absolute left-2 bottom-2 z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background/90 backdrop-blur-sm rounded-full shadow-md text-[10px] sm:text-xs font-semibold text-foreground">
                        <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
                        <span>{colors.length} {colors.length === 1 ? 'cor' : 'cores'}</span>
                      </div>
                    </div>
                  )}

                  {productCoupon && <CouponBadge coupon={productCoupon} variant="ribbon" />}

                  <div className="absolute top-12 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-10">
                    <button className="p-1.5 sm:p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-md hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button className="p-1.5 sm:p-2 bg-background/90 backdrop-blur-sm rounded-full shadow-md hover:bg-accent hover:text-accent-foreground transition-colors">
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300 z-10">
                    <Button 
                      variant="default"
                      size="sm" 
                      className="w-full gap-2 bg-foreground text-background hover:bg-accent hover:text-accent-foreground font-semibold text-xs sm:text-sm h-9 sm:h-10 rounded-lg shadow-lg"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Adicionar ao Carrinho</span>
                      <span className="sm:hidden">Adicionar</span>
                    </Button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-3 sm:p-4 text-center space-y-1.5">
                  <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors duration-300 text-[11px] sm:text-sm leading-tight uppercase tracking-wider">
                    {product.node.title}
                  </h3>
                  
                  <p className="text-lg sm:text-xl font-black text-accent tracking-tight">
                    {formatPrice(price.amount, price.currencyCode)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {showViewAll && (
          <div className="mt-8 sm:hidden text-center">
            <Button variant="outline" size="sm" className="border-foreground/20 hover:bg-foreground hover:text-background font-semibold">
              Ver Todos os Produtos
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'preto': '#1a1a1a', 'black': '#1a1a1a',
    'branco': '#f5f5f5', 'white': '#f5f5f5',
    'vermelho': '#dc2626', 'red': '#dc2626',
    'azul': '#2563eb', 'blue': '#2563eb',
    'verde': '#16a34a', 'green': '#16a34a',
    'rosa': '#ec4899', 'pink': '#ec4899',
    'amarelo': '#eab308', 'yellow': '#eab308',
    'laranja': '#ea580c', 'orange': '#ea580c',
    'roxo': '#9333ea', 'purple': '#9333ea',
    'cinza': '#6b7280', 'gray': '#6b7280',
    'bege': '#d4a574', 'beige': '#d4a574',
    'marrom': '#78350f', 'brown': '#78350f',
    'bordo': '#881337', 'burgundy': '#881337',
    'vinho': '#881337', 'nude': '#dbb89c',
    'marinho': '#1e3a5f', 'navy': '#1e3a5f',
    'coral': '#f97316', 'lilás': '#a78bfa',
    'creme': '#fef3c7', 'off white': '#faf5ef',
    'marsala': '#7c2d12',
  };
  return colorMap[colorName.toLowerCase().trim()] || '#9ca3af';
}

export default ShopifyProductGrid;
