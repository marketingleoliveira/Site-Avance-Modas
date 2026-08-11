import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RefreshCw, PackageCheck, PackageX, Search, Bell, ChevronRight, Palette, Ruler } from "lucide-react";
import { toast } from "sonner";
import { storefrontApiRequest } from "@/lib/shopify-api";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Reposição de estoque — sincroniza com o Shopify e detecta, em tempo real,
 * variantes que voltaram a ficar disponíveis (reposição) ou que esgotaram.
 *
 * A detecção é feita comparando o snapshot atual com o anterior (persistido
 * em localStorage), pois a Storefront API não expõe webhooks de inventário.
 */

const POLL_MS = 30_000;
const EVENTS_LIMIT = 200;

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
            edges { node { id title availableForSale } }
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

/**
 * Busca o inventário exato via Admin API (edge function `shopify-inventory`).
 * Caso indisponível, cai para a Storefront API — que só devolve quantidades
 * quando o escopo `unauthenticated_read_product_inventory` estiver liberado.
 */
async function fetchExactInventory(): Promise<VariantRow[] | null> {
  const { data, error } = await supabase.functions.invoke("shopify-inventory");
  if (error || !data?.variants || data.unavailable || data.variants.length === 0) {
    console.warn(
      "Inventário exato indisponível, usando Storefront API:",
      error?.message ?? data?.reason ?? "sem dados"
    );
    return null;
  }
  return (data.variants as Array<{
    variantId: string;
    variantTitle: string;
    productTitle: string;
    handle: string;
    available: boolean;
    quantity: number | null;
  }>).map((v) => ({
    key: v.variantId,
    productTitle: v.productTitle,
    handle: v.handle,
    variantTitle: v.variantTitle,
    available: !!v.available,
    quantity: typeof v.quantity === "number" ? v.quantity : null,
  }));
}

async function fetchAllVariants(): Promise<VariantRow[]> {
  const exact = await fetchExactInventory();
  if (exact && exact.length > 0) return exact;

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

type SnapshotRow = {
  variant_id: string;
  available: boolean;
  quantity: number | null;
};

async function loadSnapshot(): Promise<Record<string, VariantState>> {
  const { data, error } = await supabase
    .from("restock_snapshots")
    .select("variant_id, available, quantity");
  if (error) {
    console.error("Erro ao carregar snapshot de estoque:", error);
    return {};
  }
  const map: Record<string, VariantState> = {};
  for (const row of (data ?? []) as SnapshotRow[]) {
    map[row.variant_id] = { available: row.available, quantity: row.quantity };
  }
  return map;
}

type EventRow = {
  id: string;
  event_type: "restock" | "soldout";
  product_title: string;
  handle: string;
  variant_title: string;
  quantity: number | null;
  occurred_at: string;
};

const mapEvent = (row: EventRow): RestockEvent => ({
  id: row.id,
  type: row.event_type,
  productTitle: row.product_title,
  handle: row.handle,
  variantTitle: row.variant_title,
  quantity: row.quantity,
  at: row.occurred_at,
});

/** Tokens usados para diferenciar tamanho de cor no título da variante. */
const SIZE_TOKENS = new Set([
  "PP", "P", "M", "G", "GG", "G1", "G2", "G3", "XG", "EXG", "EXGG", "XGG",
  "U", "ÚNICO", "UNICO", "TAM ÚNICO",
]);

const isSizeToken = (value: string) => {
  const upper = value.trim().toUpperCase();
  return SIZE_TOKENS.has(upper) || /^\d{1,3}$/.test(upper);
};

/** Separa o título da variante do Shopify ("P / Preto") em tamanho e cor. */
function parseVariant(variantTitle: string): { size: string | null; color: string | null } {
  const parts = (variantTitle ?? "")
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return { size: null, color: null };

  const size = parts.find(isSizeToken) ?? null;
  const color = parts.find((p) => !isSizeToken(p)) ?? null;
  return { size, color };
}

interface GroupedEvents {
  productTitle: string;
  handle: string;
  events: RestockEvent[];
  restocks: number;
  soldouts: number;
  lastAt: string;
}

const RestockManager = () => {
  const [rows, setRows] = useState<VariantRow[]>([]);
  const [events, setEvents] = useState<RestockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [expandedVariantGroups, setExpandedVariantGroups] = useState<Record<string, boolean>>({});
  const firstRun = useRef(true);

  const loadEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from("restock_events")
      .select("id, event_type, product_title, handle, variant_title, quantity, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(EVENTS_LIMIT);
    if (error) {
      console.error("Erro ao carregar histórico de reposições:", error);
      return;
    }
    setEvents(((data ?? []) as EventRow[]).map(mapEvent));
  }, []);

  const sync = useCallback(async (silent = false) => {
    if (!silent) setSyncing(true);
    try {
      const fresh = await fetchAllVariants();
      const previous = await loadSnapshot();
      const newEvents: Array<{
        variant_id: string;
        event_type: "restock" | "soldout";
        product_title: string;
        handle: string;
        variant_title: string;
        quantity: number | null;
        previous_quantity: number | null;
        occurred_at: string;
      }> = [];
      const now = new Date().toISOString();

      for (const row of fresh) {
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
            variant_id: row.key,
            event_type: "restock",
            product_title: row.productTitle,
            handle: row.handle,
            variant_title: row.variantTitle,
            quantity: row.quantity,
            previous_quantity: prev.quantity ?? null,
            occurred_at: now,
          });
        } else if (prev.available && !row.available) {
          newEvents.push({
            variant_id: row.key,
            event_type: "soldout",
            product_title: row.productTitle,
            handle: row.handle,
            variant_title: row.variantTitle,
            quantity: row.quantity,
            previous_quantity: prev.quantity ?? null,
            occurred_at: now,
          });
        }
      }

      // Persiste o snapshot compartilhado (upsert em lotes para respeitar limites de payload).
      const snapshotRows = fresh.map((row) => ({
        variant_id: row.key,
        product_title: row.productTitle,
        handle: row.handle,
        variant_title: row.variantTitle,
        available: row.available,
        quantity: row.quantity,
        updated_at: now,
      }));
      for (let i = 0; i < snapshotRows.length; i += 500) {
        const { error: upsertError } = await supabase
          .from("restock_snapshots")
          .upsert(snapshotRows.slice(i, i + 500), { onConflict: "variant_id" });
        if (upsertError) console.error("Erro ao salvar snapshot:", upsertError);
      }

      setRows(fresh);
      setLastSync(new Date());

      if (newEvents.length && !firstRun.current) {
        const { error: insertError } = await supabase.from("restock_events").insert(newEvents);
        if (insertError) console.error("Erro ao registrar reposições:", insertError);
        await loadEvents();
        const restocks = newEvents.filter((e) => e.event_type === "restock").length;
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
  }, [loadEvents]);

  useEffect(() => {
    loadEvents();
    sync(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Histórico compartilhado em tempo real entre administradores.
  useEffect(() => {
    const channel = supabase
      .channel("restock-events-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "restock_events" },
        () => {
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadEvents]);

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

  /** Agrupa as movimentações por produto (categoria) para exibição expansível. */
  const groupedEvents = useMemo<GroupedEvents[]>(() => {
    const map = new Map<string, GroupedEvents>();
    for (const e of events) {
      const key = e.handle || e.productTitle;
      const group = map.get(key);
      if (group) {
        group.events.push(e);
        if (e.type === "restock") group.restocks += 1;
        else group.soldouts += 1;
        if (e.at > group.lastAt) group.lastAt = e.at;
      } else {
        map.set(key, {
          productTitle: e.productTitle,
          handle: e.handle,
          events: [e],
          restocks: e.type === "restock" ? 1 : 0,
          soldouts: e.type === "soldout" ? 1 : 0,
          lastAt: e.at,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
  }, [events]);

  const toggleProduct = (key: string) =>
    setExpandedProducts((prev) => ({ ...prev, [key]: !prev[key] }));

  /** Agrupa as variantes filtradas por produto → tamanho → cores. */
  const groupedVariants = useMemo(() => {
    const map = new Map<
      string,
      {
        productTitle: string;
        handle: string;
        sizes: Map<string, { size: string; colors: Array<{ color: string; available: boolean; quantity: number | null }> }>;
        total: number;
        available: number;
      }
    >();

    for (const r of filtered) {
      const key = r.handle || r.productTitle;
      let group = map.get(key);
      if (!group) {
        group = { productTitle: r.productTitle, handle: r.handle, sizes: new Map(), total: 0, available: 0 };
        map.set(key, group);
      }
      const { size, color } = parseVariant(r.variantTitle);
      const sizeKey = size ?? "Único";
      let sizeGroup = group.sizes.get(sizeKey);
      if (!sizeGroup) {
        sizeGroup = { size: sizeKey, colors: [] };
        group.sizes.set(sizeKey, sizeGroup);
      }
      sizeGroup.colors.push({
        color: color ?? r.variantTitle,
        available: r.available,
        quantity: r.quantity,
      });
      group.total += 1;
      if (r.available) group.available += 1;
    }

    return Array.from(map.values()).sort((a, b) => a.productTitle.localeCompare(b.productTitle));
  }, [filtered]);

  const toggleVariantGroup = (key: string) =>
    setExpandedVariantGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const clearEvents = async () => {
    const { error } = await supabase
      .from("restock_events")
      .delete()
      .not("id", "is", null);
    if (error) {
      console.error("Erro ao limpar histórico:", error);
      toast.error("Não foi possível limpar o histórico");
      return;
    }
    setEvents([]);
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
              {groupedEvents.map((group) => {
                const key = group.handle || group.productTitle;
                const isOpen = !!expandedProducts[key];
                return (
                  <li key={key}>
                    {/* Categoria: nome do produto (clicável) */}
                    <button
                      type="button"
                      onClick={() => toggleProduct(key)}
                      aria-expanded={isOpen}
                      aria-label={`Ver variantes repostas de ${group.productTitle}`}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <ChevronRight
                          className={cn(
                            "w-4 h-4 shrink-0 text-muted-foreground transition-transform",
                            isOpen && "rotate-90"
                          )}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{group.productTitle}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {group.events.length} variante(s) · {new Date(group.lastAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {group.restocks > 0 && (
                          <Badge className="gap-1">
                            <PackageCheck className="w-3 h-3" />
                            {group.restocks}
                          </Badge>
                        )}
                        {group.soldouts > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <PackageX className="w-3 h-3" />
                            {group.soldouts}
                          </Badge>
                        )}
                      </div>
                    </button>

                    {/* Variantes (cor e tamanho) detectadas */}
                    {isOpen && (
                      <ul className="border-t border-border bg-muted/30">
                        {group.events.map((e) => {
                          const { size, color } = parseVariant(e.variantTitle);
                          return (
                            <li
                              key={e.id}
                              className="flex items-center justify-between gap-3 px-4 py-2.5 pl-11"
                            >
                              <div className="flex min-w-0 flex-wrap items-center gap-2">
                                {size && (
                                  <Badge variant="outline" className="gap-1 text-xs">
                                    <Ruler className="w-3 h-3" />
                                    {size}
                                  </Badge>
                                )}
                                {color && (
                                  <Badge variant="outline" className="gap-1 text-xs">
                                    <Palette className="w-3 h-3" />
                                    {color}
                                  </Badge>
                                )}
                                {!size && !color && (
                                  <span className="text-xs text-muted-foreground">{e.variantTitle}</span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(e.at).toLocaleString("pt-BR")}
                                </span>
                              </div>
                              <Badge
                                variant={e.type === "restock" ? "default" : "destructive"}
                                className="shrink-0 text-xs"
                              >
                                {e.type === "restock"
                                  ? e.quantity != null ? `Reposto (${e.quantity})` : "Reposto"
                                  : "Esgotou"}
                              </Badge>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
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
            {groupedVariants.map((group) => {
              const key = group.handle || group.productTitle;
              const isOpen = !!expandedVariantGroups[key];
              const sizes = Array.from(group.sizes.values());
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => toggleVariantGroup(key)}
                    aria-expanded={isOpen}
                    aria-label={`Ver tamanhos e cores de ${group.productTitle}`}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-90"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{group.productTitle}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {sizes.length} tamanho(s) · {group.total} variante(s)
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={group.available > 0 ? "secondary" : "destructive"}
                      className="shrink-0"
                    >
                      {group.available > 0 ? `${group.available} disponíveis` : "Esgotado"}
                    </Badge>
                  </button>

                  {isOpen && (
                    <ul className="border-t border-border bg-muted/30">
                      {sizes.map((sizeGroup) => {
                        const availableColors = sizeGroup.colors.filter((c) => c.available);
                        return (
                          <li key={sizeGroup.size} className="px-4 py-2.5 pl-11">
                            <div className="flex items-center justify-between gap-3">
                              <Badge variant="outline" className="gap-1 text-xs">
                                <Ruler className="w-3 h-3" />
                                {sizeGroup.size}
                              </Badge>
                              <Badge
                                variant={availableColors.length > 0 ? "secondary" : "destructive"}
                                className="shrink-0 gap-1 text-xs"
                              >
                                <Palette className="w-3 h-3" />
                                {availableColors.length} de {sizeGroup.colors.length} cor(es)
                              </Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {sizeGroup.colors.map((c, i) => (
                                <span
                                  key={`${sizeGroup.size}-${c.color}-${i}`}
                                  className={cn(
                                    "rounded-full border px-2 py-0.5 text-[11px]",
                                    c.available
                                      ? "border-border text-foreground"
                                      : "border-destructive/30 text-muted-foreground line-through"
                                  )}
                                >
                                  {c.color}
                                  {c.available && c.quantity != null ? ` (${c.quantity})` : ""}
                                </span>
                              ))}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
            {groupedVariants.length === 0 && (
              <li className="px-4 py-6 text-sm text-muted-foreground">Nenhuma variante encontrada.</li>
            )}
          </ul>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RestockManager;
