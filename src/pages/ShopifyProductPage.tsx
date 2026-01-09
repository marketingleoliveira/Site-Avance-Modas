import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Minus, Plus, Truck, RefreshCcw, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShopifyProductGrid from "@/components/shopify/ShopifyProductGrid";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const ShopifyProductPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      setLoading(true);
      const data = await fetchProductByHandle(handle);
      setProduct(data);
      setLoading(false);
    };
    loadProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 py-12 bg-background">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
                <div className="h-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header />
        <main className="flex-1 py-12 bg-background">
          <div className="container text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para a loja
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images.edges;
  const variants = product.variants.edges;
  const currentVariant = variants[selectedVariant]?.node;

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const formatPrice = (amount: string, currencyCode: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode
    }).format(parseFloat(amount));
  };

  const handleAddToCart = () => {
    if (!currentVariant) {
      toast.error("Selecione uma variante");
      return;
    }

    const productWrapper: ShopifyProduct = {
      node: product
    };

    addItem({
      product: productWrapper,
      variantId: currentVariant.id,
      variantTitle: currentVariant.title,
      price: currentVariant.price,
      quantity,
      selectedOptions: currentVariant.selectedOptions || [],
    });

    toast.success("Adicionado ao carrinho!", {
      description: `${product.title} x${quantity}`,
      position: "top-center",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1 py-12 bg-background">
        <div className="container">
          <nav className="text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-card rounded-lg overflow-hidden">
                {images.length > 0 ? (
                  <img 
                    src={images[currentImage].node.url} 
                    alt={images[currentImage].node.altText || product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-card/80 rounded-full hover:bg-card transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-card/80 rounded-full hover:bg-card transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImage === i ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img.node.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {product.title}
                </h1>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(currentVariant?.price.amount || product.priceRange.minVariantPrice.amount, currentVariant?.price.currencyCode || 'BRL')}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Em até <strong>6x sem juros</strong>
              </p>

              {/* Variants */}
              {variants.length > 1 && (
                <div>
                  <p className="text-sm font-semibold mb-3">Variante:</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant, i) => (
                      <button
                        key={variant.node.id}
                        onClick={() => setSelectedVariant(i)}
                        disabled={!variant.node.availableForSale}
                        className={`px-4 py-2 rounded-md border-2 font-semibold transition-all ${
                          selectedVariant === i
                            ? "border-primary bg-primary text-primary-foreground"
                            : variant.node.availableForSale
                              ? "border-border hover:border-primary"
                              : "border-border opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {variant.node.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <p className="text-sm font-semibold mb-3">Quantidade:</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-border rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={!currentVariant?.availableForSale}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Adicionar ao Carrinho
                </Button>
                <Button variant="outline" size="xl">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Frete Grátis +R$299</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Troca Grátis</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Compra Segura</span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold mb-3">Descrição</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <ShopifyProductGrid 
            title="Você também pode gostar" 
            subtitle="Confira outros produtos da nossa coleção"
            limit={4}
            showViewAll={false}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShopifyProductPage;
