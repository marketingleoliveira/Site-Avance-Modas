import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchProductsByTag, ShopifyProduct } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Heart, Eye, ShoppingBag, ArrowLeft } from "lucide-react";

const categoryConfig: Record<string, { title: string; description: string; tag: string }> = {
  shorts: {
    title: "Shorts",
    description: "Os melhores shorts fitness para seu treino",
    tag: "shorts"
  },
  bermudas: {
    title: "Bermudas",
    description: "Bermudas confortáveis para todas as atividades",
    tag: "bermudas"
  },
  leggings: {
    title: "Leggings",
    description: "Leggings de alta qualidade e compressão",
    tag: "leggings"
  },
  blusas: {
    title: "Blusas",
    description: "Blusas e tops para seu look fitness",
    tag: "blusas"
  },
  conjuntos: {
    title: "Conjuntos",
    description: "Conjuntos completos para arrasar no treino",
    tag: "conjuntos"
  },
  lancamentos: {
    title: "Lançamentos",
    description: "As novidades mais recentes da Avance Modas",
    tag: "lancamentos"
  },
  promocoes: {
    title: "Promoções",
    description: "Ofertas imperdíveis para você",
    tag: "promocoes"
  }
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const config = category ? categoryConfig[category] : null;

  useEffect(() => {
    const loadProducts = async () => {
      if (!config) return;
      setLoading(true);
      const fetchedProducts = await fetchProductsByTag(config.tag);
      setProducts(fetchedProducts);
      setLoading(false);
    };

    loadProducts();
  }, [category, config]);

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

  if (!config) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold">Categoria não encontrada</h1>
          <Link to="/" className="text-accent hover:underline mt-4 inline-block">
            Voltar ao início
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-secondary py-16">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{config.title}</h1>
          <p className="text-lg text-muted-foreground">{config.description}</p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary rounded-lg mb-4"></div>
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-secondary rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">Nenhum produto encontrado nesta categoria.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione a tag "{config.tag}" aos produtos no painel do Shopify para exibi-los aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      <Footer />
    </div>
  );
};

export default CategoryPage;
