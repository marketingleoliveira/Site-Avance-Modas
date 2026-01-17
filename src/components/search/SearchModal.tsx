import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify-api";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const searchProducts = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      // Search using Shopify's query syntax
      const products = await fetchProducts(20, `title:*${searchTerm}*`);
      setResults(products);
    } catch (error) {
      console.error("Error searching products:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [open]);

  const handleProductClick = (handle: string) => {
    onOpenChange(false);
    navigate(`/produto/${handle}`);
  };

  const formatPrice = (amount: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(amount));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            placeholder="Buscar produtos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="p-1 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum produto encontrado para "{query}"
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              {results.map((product) => (
                <button
                  key={product.node.id}
                  onClick={() => handleProductClick(product.node.handle)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-secondary rounded-lg transition-colors text-left"
                >
                  {product.node.images.edges[0] && (
                    <img
                      src={product.node.images.edges[0].node.url}
                      alt={product.node.title}
                      className="w-16 h-16 object-cover rounded-md bg-muted"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {product.node.title}
                    </h4>
                    <p className="text-sm text-primary font-semibold mt-1">
                      {formatPrice(product.node.priceRange.minVariantPrice.amount)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                Digite para buscar produtos
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;