import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import { fetchCollectionsByType, getProductsFromCollections } from "@/lib/shopify-collections";
import { ShopifyProduct } from "@/lib/shopify-api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ShoppingBag, ChevronRight } from "lucide-react";

const categoryConfig: Record<string, { title: string; description: string; keywords: string[] }> = {
  shorts: {
    title: "Shorts",
    description: "Os melhores shorts fitness para seu treino",
    keywords: ["short", "shorts"]
  },
  bermudas: {
    title: "Bermudas",
    description: "Bermudas confortáveis para todas as atividades",
    keywords: ["bermuda", "bermudas"]
  },
  leggings: {
    title: "Leggings",
    description: "Leggings de alta qualidade e compressão",
    keywords: ["legging", "leggings", "calça"]
  },
  tops: {
    title: "Tops",
    description: "Tops e blusas para seu look fitness",
    keywords: ["top", "tops", "blusa", "camiseta", "regata", "cropped"]
  },
  blusas: {
    title: "Blusas",
    description: "Blusas e tops para seu look fitness",
    keywords: ["blusa", "blusas", "camiseta", "regata", "top", "cropped"]
  },
  conjuntos: {
    title: "Conjuntos",
    description: "Conjuntos completos para arrasar no treino",
    keywords: ["conjunto", "conjuntos"]
  },
  lancamentos: {
    title: "Lançamentos",
    description: "As novidades mais recentes da Avance Modas",
    keywords: ["lançamento", "lancamento", "novo", "novidade"]
  },
  promocoes: {
    title: "Promoções",
    description: "Ofertas imperdíveis para você",
    keywords: ["promoção", "promocao", "oferta", "desconto"]
  },
  todos: {
    title: "Todos os Produtos",
    description: "Veja todos os nossos produtos",
    keywords: []
  }
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const config = category ? categoryConfig[category] : null;

  // Detect current store type from URL
  const isAtacado = window.location.pathname.includes('/atacado') || 
                    sessionStorage.getItem('store_type') === 'atacado';
  const storeType: 'ATACADO' | 'VAREJO' = isAtacado ? 'ATACADO' : 'VAREJO';

  useEffect(() => {
    const loadProducts = async () => {
      if (!config) return;
      setLoading(true);
      
      // Fetch all products from collections by type
      const collections = await fetchCollectionsByType(storeType);
      const fetchedProducts = getProductsFromCollections(collections);
      setAllProducts(fetchedProducts);
      
      // Filter by category keywords (or show all if category is 'todos')
      if (category === 'todos' || config.keywords.length === 0) {
        setProducts(fetchedProducts);
      } else {
        const filtered = fetchedProducts.filter(product => {
          const title = product.node.title.toLowerCase();
          return config.keywords.some(keyword => title.includes(keyword.toLowerCase()));
        });
        setProducts(filtered);
      }
      
      setLoading(false);
    };

    loadProducts();
  }, [category, config, storeType]);

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
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{config.title}</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="container py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{config.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
      </div>

      {/* Products Grid */}
      <section className="pb-16">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary mb-3"></div>
                  <div className="h-3 bg-secondary rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-secondary rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground text-sm">Nenhum produto encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <Link
                  key={product.node.id}
                  to={`/produto/${product.node.handle}`}
                  className="group"
                >
                  <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-3">
                    <img
                      src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                      alt={product.node.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Quick Add Button */}
                    <button 
                      className="absolute bottom-0 left-0 right-0 bg-black/80 text-white py-2.5 text-xs font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Adicionar
                    </button>
                  </div>
                  
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

      <Footer />
    </div>
  );
};

export default CategoryPage;
