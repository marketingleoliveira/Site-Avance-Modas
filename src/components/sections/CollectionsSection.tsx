import { useState, useEffect } from "react";
import { ShopifyCollection, fetchCollectionsByType } from "@/lib/shopify-collections";
import { ShoppingBag } from "lucide-react";

interface CollectionsSectionProps {
  type: 'ATACADO' | 'VAREJO';
}

const CollectionsSection = ({ type }: CollectionsSectionProps) => {
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      setLoading(true);
      const data = await fetchCollectionsByType(type);
      setCollections(data);
      setLoading(false);
    };
    loadCollections();
  }, [type]);

  if (loading) {
    return (
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Categorias
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) {
    return (
      <section className="py-20 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Categorias
            </h2>
          </div>
          <div className="text-center py-16 bg-card rounded-lg">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma coleção encontrada</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ainda não há coleções de {type.toLowerCase()} cadastradas.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Categorias
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection, index) => {
            // Remove "ATACADO" ou "VAREJO" do nome para exibição
            const displayName = collection.title
              .replace(/ATACADO/gi, '')
              .replace(/VAREJO/gi, '')
              .replace(/-/g, ' ')
              .trim() || collection.title;

            return (
              <a 
                key={collection.id} 
                href={`#${collection.handle}`}
                className="group relative overflow-hidden bg-card rounded-lg hover-lift" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-square overflow-hidden">
                  {collection.image ? (
                    <img 
                      src={collection.image.url} 
                      alt={collection.image.altText || collection.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-bold text-primary-foreground mb-1">
                    {displayName}
                  </h3>
                  <p className="text-sm text-primary-foreground/80">
                    {collection.products.edges.length} produtos
                  </p>
                </div>
                
                {/* Default Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-card group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="text-lg font-bold text-foreground text-center">
                    {displayName}
                  </h3>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
