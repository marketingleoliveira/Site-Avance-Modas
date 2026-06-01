import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search, X } from "lucide-react";
import { fetchProductsByType, type ShopifyProduct } from "@/lib/shopify-api";
import { toast } from "sonner";

export interface PickerCartItem {
  title: string;
  variantTitle: string;
  quantity: number;
  price: string;
  currencyCode: string;
  selectedOptions: Array<{ name: string; value: string }>;
  imageUrl: string | null;
  sku?: string | null;
  variantId?: string;
}

interface Props {
  onAdd: (item: PickerCartItem) => void;
}

let cachedProducts: ShopifyProduct[] | null = null;

const WholesaleOrderProductPicker = ({ onAdd }: Props) => {
  const [products, setProducts] = useState<ShopifyProduct[]>(cachedProducts || []);
  const [loading, setLoading] = useState(!cachedProducts);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ShopifyProduct | null>(null);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (cachedProducts) return;
    let active = true;
    (async () => {
      try {
        const data = await fetchProductsByType("ATACADO", 250);
        if (!active) return;
        cachedProducts = data;
        setProducts(data);
      } catch (e) {
        console.error(e);
        toast.error("Erro ao carregar produtos do atacado");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 12);
    return products
      .filter((p) => p.node.title.toLowerCase().includes(q))
      .slice(0, 12);
  }, [products, search]);

  const selectProduct = (p: ShopifyProduct) => {
    setSelected(p);
    setOptions({});
    setQty(1);
  };

  const reset = () => {
    setSelected(null);
    setOptions({});
    setQty(1);
  };

  // Find matching variant for the selected options
  const matchingVariant = useMemo(() => {
    if (!selected) return null;
    const optionNames = selected.node.options.map((o) => o.name);
    if (optionNames.some((n) => !options[n])) return null;
    return (
      selected.node.variants.edges.find((v) =>
        v.node.selectedOptions.every((so) => options[so.name] === so.value)
      )?.node || null
    );
  }, [selected, options]);

  const handleAdd = () => {
    if (!selected || !matchingVariant) {
      toast.error("Selecione todas as opções");
      return;
    }
    const item: PickerCartItem = {
      title: selected.node.title,
      variantTitle: matchingVariant.title,
      variantId: matchingVariant.id,
      sku: matchingVariant.sku ?? null,
      quantity: Math.max(1, Math.floor(qty || 1)),
      price: matchingVariant.price.amount,
      currencyCode: matchingVariant.price.currencyCode,
      selectedOptions: matchingVariant.selectedOptions,
      imageUrl: selected.node.images?.edges?.[0]?.node?.url || null,
    };
    onAdd(item);
    toast.success("Produto adicionado ao pedido");
    reset();
  };

  return (
    <div className="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h5 className="text-sm font-semibold">Adicionar produto ao pedido</h5>
        {selected && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <X className="w-3 h-3 mr-1" /> Trocar produto
          </Button>
        )}
      </div>

      {!selected && (
        <>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto do atacado..."
              className="pl-8 h-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Nenhum produto encontrado
                </p>
              ) : (
                filtered.map((p) => (
                  <button
                    type="button"
                    key={p.node.id}
                    onClick={() => selectProduct(p)}
                    className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition text-left"
                  >
                    {p.node.images?.edges?.[0]?.node?.url && (
                      <img
                        src={p.node.images.edges[0].node.url}
                        alt={p.node.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <span className="text-xs flex-1 truncate">{p.node.title}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {selected.node.images?.edges?.[0]?.node?.url && (
              <img
                src={selected.node.images.edges[0].node.url}
                alt={selected.node.title}
                className="w-10 h-10 object-cover rounded"
              />
            )}
            <p className="text-xs font-medium flex-1">{selected.node.title}</p>
          </div>

          {selected.node.options.map((opt) => (
            <div key={opt.name} className="space-y-1">
              <p className="text-xs text-muted-foreground">{opt.name}</p>
              <div className="flex flex-wrap gap-1">
                {opt.values.map((val) => {
                  const active = options[opt.name] === val;
                  return (
                    <button
                      type="button"
                      key={val}
                      onClick={() =>
                        setOptions((prev) => ({ ...prev, [opt.name]: val }))
                      }
                      className={`px-2 py-1 text-xs rounded border transition ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent border-border"
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <div className="space-y-1 flex-1">
              <p className="text-xs text-muted-foreground">Quantidade</p>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
                className="h-8"
              />
            </div>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!matchingVariant}
              className="self-end h-8"
            >
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </Button>
          </div>
          {!matchingVariant && Object.keys(options).length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              Selecione todas as opções para adicionar.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WholesaleOrderProductPicker;