import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RefreshCw, PackageCheck, PackageX, Search, Bell } from "lucide-react";
import { toast } from "sonner";
import { storefrontApiRequest } from "@/lib/shopify-api";
import { cn } from "@/lib/utils";

/**
 * Reposição de estoque — sincroniza com o Shopify e detecta, em tempo real,
 * variantes que voltaram a ficar disponíveis (reposição) ou que esgotaram.
 *
 * A detecção é feita comparando o snapshot atual com o anterior (persistido
 * em localStorage), pois a Storefront API não expõe webhooks de inventário.
 */

const POLL_MS = 30_000;
const SNAPSHOT_KEY = "avance_restock_snapshot_v1";
const EVENTS_KEY = "avance_restock_events_v1";

type VariantState = {
  available: boolean;
  quantity: number | null;
};

type Snapshot = Record<string, VariantState>;

export interface RestockEvent {
  id: string;
  type: "restock" | "soldout";
  productTitle: string;
  handle: string;
  variantTitle: string;
  quantity: number | null;
  at: string;
}

interface VariantRow {
  key: string;
  productTitle: string;
  handle: string;
  variantTitle: string;
  available: boolean;
  quantity: number | null;
}

const QUERY_WITH_QTY = `
  query RestockProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title handle
          variants(first: 100) {
            edges { node { id title availableForSale quantityAvailable } }
          }
        }
      }
    }
  }
`;

const QUERY_NO_QTY = `
  query RestockProductsNoQty($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title handle
          variants(first: 100) {
            edges { node { id title availableForSale } }
          }
        }
      }
    }
  }
`;

type ApiVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable?: number | null;
};

type ApiProduct = {
  node: {
    id: string;
    title: string;
    handle: string;
    variants: { edges: Array<{ node: ApiVariant }> };
  };
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function fetchAllVariants(): Promise<VariantRow[]> {
  const rows: VariantRow[] = [];
  let after: string | null = null;
  let useQty = true;

  // Até 4 páginas de 100 produtos (limite defensivo para não estourar a cota da API).
  for (let page = 0; page < 4; page++) {
    let data: { data?: { products?: { edges: ApiProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } } | null = null;
    try {
      data = await storefrontApiRequest(useQty ? QUERY_WITH_QTY : QUERY_NO_QTY, { first: 100, after });
    } catch (error) {
      // A loja pode não ter o escopo de leitura de inventário liberado.
      if (useQty) {
        useQty = false;
        page--;
        continue;
      }
      throw error;
    }

    const products = data?.data?.products;
    if (!products) break;

    for (const edge of products.edges) {
      for (const v of edge.node.variants.edges) {
        rows.push({
          key: v.node.id,
          productTitle: edge.node.title,
          handle: edge.node.handle,
          variantTitle: v.node.title,
          available: !!v.node.availableForSale,
          quantity: typeof v.node.quantityAvailable === "number" ? v.node.quantityAvailable : null,
        });
      }
    }

    if (!products.pageInfo?.hasNextPage) break;
    after = products.pageInfo.endCursor;
  }

  return rows;
}

const RestockManager = () => {
  const [rows, setRows] = useState<VariantRow[]>([]);
  const [events, setEvents] = useState<RestockEvent[]>(() => readJSON<RestockEvent[]>(EVENTS_KEY, []));
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);
  const firstRun = useRef(true);

  const sync = useCallback(async (silent = false) => {
    if (!silent) setSyncing(true);
    try {
      const fresh = await fetchAllVariants();
      const previous = readJSON<Snapshot>(SNAPSHOT_KEY, {});
      const nextSnapshot: Snapshot = {};
      const newEvents: RestockEvent[] = [];
      const now = new Date().toISOString();

      for (const row of fresh) {
        nextSnapshot[row.key] = { available: row.available, quantity: row.quantity };
        const prev = previous[row.key];
        if (!prev) continue;

        const cameBack = !prev.available && row.available;
        const grew =
          prev.available &&
          row.available &&
          typeof prev.quantity === "number" &&
          typeof row.quantity === "number" &&
          row.quantity > prev.quantity;

        if (cameBack || grew) {
          newEvents.push({
            id: `${row.key}-${now}`,
            type: "restock",
            productTitle: row.productTitle,
            handle: row.handle,
            variantTitle: row.variantTitle,
            quantity: row.quantity,
            at: now,
          });
        } else if (prev.available && !row.available) {
          newEvents.push({
            id: `${row.key}-out-${now}`,
            type: "soldout",
            productTitle: row.productTitle,
            handle: row.handle,
            variantTitle: row.variantTitle,
            quantity: row.quantity,
            at: now,
          });
        }
      }

      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(nextSnapshot));
      setRows(fresh);
      setLastSync(new Date());

      if (newEvents.length && !firstRun.current) {
        const merged = [...newEvents, ...events].slice(0, 200);
        setEvents(merged);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(merged));
        const restocks = newEvents.filter((e) => e.type === "restock").length;
        if (restocks > 0) {
          toast.success(`${restocks} reposição(ões) de estoque detectada(s)`);
        }
      }
      firstRun.current = false;
    } catch (error) {
      console.error("Erro ao sincronizar estoque:", error);
      if (!silent) toast.error("Não foi possível sincronizar o estoque do Shopify");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [events]);

  useEffect(() => {
    sync(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoSync) return;
    const id = window.setInterval(() => sync(true), POLL_MS);
    return () => window.clearInterval(id);
  }, [autoSync, sync]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows
      .filter((r) => (onlyOutOfStock ? !r.available : true))
      .filter((r) => (term ? `${r.productTitle} ${r.variantTitle}`.toLowerCase().includes(term) : true))
      .slice(0, 400);
  }, [rows, search, onlyOutOfStock]);

  const stats = useMemo(() => {
    const total = rows.length;
    const out = rows.filter((r) => !r.available).length;
    return { total, out, inStock: total - out };
  }, [rows]);

  const clearEvents = () => {
    setEvents([]);
    localStorage.removeItem(EVENTS_KEY);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de controle */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{stats.total} variantes</Badge>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{stats.inStock} em estoque</Badge>
          <Badge variant="destructive">{stats.out} esgotadas</Badge>
          {lastSync && <span>Última sincronização: {lastSync.toLocaleTimeString("pt-BR")}</span>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="auto-sync" checked={autoSync} onCheckedChange={setAutoSync} />
            <Label htmlFor="auto-sync" className="text-sm">Tempo real</Label>
          </div>
          <Button variant="outline" size="sm" onClick={() => sync(false)} disabled={syncing}>
            <RefreshCw className={cn("w-4 h-4 mr-2", syncing && "animate-spin")} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Eventos de reposição */}
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Reposições detectadas
          </h3>
          {events.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearEvents}>Limpar</Button>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {events.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              Nenhuma movimentação detectada ainda. O sistema compara o estoque a cada 30 segundos e registra aqui
              toda vez que um produto for reposto no Shopify.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {e.type === "restock" ? (
                      <PackageCheck className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <PackageX className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{e.productTitle}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {e.variantTitle} · {new Date(e.at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={e.type === "restock" ? "default" : "destructive"} className="shrink-0">
                    {e.type === "restock"
                      ? e.quantity != null ? `Reposto (${e.quantity})` : "Reposto"
                      : "Esgotou"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>

      {/* Lista de variantes */}
      <div className="rounded-lg border border-border">
        <div className="flex flex-col gap-3 px-4 py-3 border-b border-border md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto ou tamanho..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="only-out" checked={onlyOutOfStock} onCheckedChange={setOnlyOutOfStock} />
            <Label htmlFor="only-out" className="text-sm">Somente esgotados</Label>
          </div>
        </div>
        <ScrollArea className="max-h-[520px]">
          <ul className="divide-y divide-border">
            {filtered.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.productTitle}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.variantTitle}</p>
                </div>
                <Badge variant={r.available ? "secondary" : "destructive"} className="shrink-0">
                  {r.available
                    ? r.quantity != null ? `${r.quantity} un.` : "Disponível"
                    : "Esgotado"}
                </Badge>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-sm text-muted-foreground">Nenhuma variante encontrada.</li>
            )}
          </ul>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RestockManager;
