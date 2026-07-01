import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import SEOContentBlock from "@/components/seo/SEOContentBlock";
import { fetchProductsByType, ShopifyProduct } from "@/lib/shopify-api";
import { ChevronRight, ShoppingBag } from "lucide-react";
import type { LandingConfig } from "@/content/seoContent";

const SITE = "https://avancemodas.com.br";

const CommercialLanding = ({ config }: { config: LandingConfig }) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const url = `${SITE}/${config.slug}`;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await fetchProductsByType(config.storeType, 100);
      const filtered = config.filterKeywords.length === 0
        ? all
        : all.filter(p => {
            const t = p.node.title.toLowerCase();
            return config.filterKeywords.some(k => t.includes(k.toLowerCase()));
          });
      setProducts(filtered.slice(0, 24));
      setLoading(false);
    })();
  }, [config]);

  const formatPrice = (a: string, c: string) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: c }).format(parseFloat(a));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: config.h1, item: url }
    ]
  };
  const itemListLd = products.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: config.h1,
    itemListElement: products.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/produto/${p.node.handle}`,
      name: p.node.title,
      image: p.node.images.edges[0]?.node.url
    }))
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{config.metaTitle}</title>
        <meta name="description" content={config.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={config.metaTitle} />
        <meta property="og:description" content={config.metaDescription} />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.metaTitle} />
        <meta name="twitter:description" content={config.metaDescription} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        {itemListLd && <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>}
      </Helmet>

      <AnnouncementBar />
      <Header />

      <div className="border-b border-border">
        <div className="container px-4 sm:px-6 py-2 sm:py-3">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="text-foreground font-medium">{config.h1}</span>
          </nav>
        </div>
      </div>

      <div className="container px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{config.h1}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-3xl">
          {config.content.intro.split(". ").slice(0, 2).join(". ")}.
        </p>
      </div>

      <section className="pb-8 sm:pb-12">
        <div className="container px-4 sm:px-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary mb-2 rounded" />
                  <div className="h-3 bg-secondary rounded w-3/4 mb-1" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-lg">
              <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Estamos preparando novos produtos para esta seleção. Enquanto isso, veja nossas categorias:
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <Link to="/categoria/leggings" className="px-4 py-2 text-xs border border-border rounded-full hover:bg-secondary">Leggings</Link>
                <Link to="/categoria/tops" className="px-4 py-2 text-xs border border-border rounded-full hover:bg-secondary">Tops</Link>
                <Link to="/categoria/conjuntos" className="px-4 py-2 text-xs border border-border rounded-full hover:bg-secondary">Conjuntos</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products.map(product => (
                <Link key={product.node.id} to={`/produto/${product.node.handle}`} className="group">
                  <div className="relative overflow-hidden bg-secondary aspect-[3/4] mb-2 rounded">
                    <img
                      src={product.node.images.edges[0]?.node.url || "/placeholder.svg"}
                      alt={`${product.node.title} — Avance Modas`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-[10px] sm:text-xs font-medium text-foreground line-clamp-2 leading-tight">
                      {product.node.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      {formatPrice(product.node.priceRange.minVariantPrice.amount, product.node.priceRange.minVariantPrice.currencyCode)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SEOContentBlock block={config.content} />

      <Footer />
    </div>
  );
};

export default CommercialLanding;
