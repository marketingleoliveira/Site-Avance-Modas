import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Tag, Loader2, Copy, Check, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { fetchProductsPaged, type ShopifyProduct } from "@/lib/shopify-api";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number;
  is_active: boolean;
  applies_to: 'varejo' | 'atacado' | 'all';
  product_handles: string[];
  created_at: string;
}

const CouponsManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Form
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [percent, setPercent] = useState<number>(8);
  const [appliesTo, setAppliesTo] = useState<'varejo' | 'atacado' | 'all'>('varejo');
  const [creating, setCreating] = useState(false);
  const [restrictToProducts, setRestrictToProducts] = useState(false);
  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);

  // Product picker state
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsLoadingMore, setProductsLoadingMore] = useState(false);
  const [productsCursor, setProductsCursor] = useState<string | null>(null);
  const [productsHasMore, setProductsHasMore] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  const PAGE_SIZE = 30;

  // Edit state for changing product list of an existing coupon
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHandles, setEditHandles] = useState<string[]>([]);
  const [editSearch, setEditSearch] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error("Erro ao carregar cupons");
    } else {
      setCoupons((data || []) as Coupon[]);
    }
    setLoading(false);
  };

  // Build Shopify search query combining title scope + free text
  const buildShopifyQuery = (scope: 'varejo' | 'atacado' | 'all', term: string) => {
    const parts: string[] = [];
    if (scope === 'varejo') parts.push('title:*VAREJO*');
    else if (scope === 'atacado') parts.push('title:*ATACADO*');
    const t = term.trim();
    if (t) parts.push(`title:*${t}*`);
    return parts.join(' AND ') || undefined;
  };

  const loadProductsFirstPage = async (scope: 'varejo' | 'atacado' | 'all', term: string) => {
    setProductsLoading(true);
    setActiveSearchTerm(term);
    try {
      const page = await fetchProductsPaged(PAGE_SIZE, null, buildShopifyQuery(scope, term));
      setProducts(page.edges);
      setProductsCursor(page.endCursor);
      setProductsHasMore(page.hasNextPage);
    } catch {
      toast.error("Erro ao carregar produtos");
    } finally {
      setProductsLoading(false);
    }
  };

  const loadMoreProducts = async (scope: 'varejo' | 'atacado' | 'all') => {
    if (!productsHasMore || productsLoadingMore || !productsCursor) return;
    setProductsLoadingMore(true);
    try {
      const page = await fetchProductsPaged(PAGE_SIZE, productsCursor, buildShopifyQuery(scope, activeSearchTerm));
      // Dedupe by handle in case of overlap
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.node.handle));
        const merged = [...prev];
        for (const e of page.edges) if (!seen.has(e.node.handle)) merged.push(e);
        return merged;
      });
      setProductsCursor(page.endCursor);
      setProductsHasMore(page.hasNextPage);
    } finally {
      setProductsLoadingMore(false);
    }
  };

  useEffect(() => { load(); }, []);

  // (Re)load first page whenever the picker opens, scope changes, or search is committed
  useEffect(() => {
    if (!restrictToProducts && !editingId) return;
    const scope = editingId
      ? (coupons.find((c) => c.id === editingId)?.applies_to ?? 'varejo')
      : appliesTo;
    const term = editingId ? editSearch : productSearch;
    const handler = setTimeout(() => loadProductsFirstPage(scope, term), 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restrictToProducts, editingId, appliesTo, productSearch, editSearch]);

  // Server-paged results are already scope+search filtered. We still apply a defensive
  // client-side scope check (keyword in title) to honor the project's title-based separation.
  const enforceScope = (list: ShopifyProduct[], scope: 'varejo' | 'atacado' | 'all') => {
    if (scope === 'all') return list;
    const kw = scope === 'varejo' ? 'VAREJO' : 'ATACADO';
    return list.filter((p) => p.node.title.toUpperCase().includes(kw));
  };

  const filteredForCreate = enforceScope(products, appliesTo);

  const toggleHandle = (handle: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(handle)) setList(list.filter((h) => h !== handle));
    else setList([...list, handle]);
  };

  const handleCreate = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { toast.error("Informe o código do cupom"); return; }
    if (percent <= 0 || percent > 100) { toast.error("Percentual deve ser entre 1 e 100"); return; }
    if (restrictToProducts && selectedHandles.length === 0) {
      toast.error("Selecione ao menos um produto ou desative a restrição");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('coupons').insert({
      code: trimmed,
      description: description.trim() || null,
      discount_percent: percent,
      applies_to: appliesTo,
      is_active: true,
      product_handles: restrictToProducts ? selectedHandles : [],
    });
    setCreating(false);
    if (error) {
      if (error.code === '23505') {
        toast.error("Já existe um cupom com esse código");
      } else {
        toast.error("Erro ao criar cupom: " + error.message);
      }
      return;
    }
    toast.success(`Cupom ${trimmed} criado!`, {
      description: "Lembre-se de criar o mesmo código no Shopify Admin para que o desconto seja aplicado no checkout.",
    });
    setCode(""); setDescription(""); setPercent(8); setAppliesTo('varejo');
    setRestrictToProducts(false); setSelectedHandles([]); setProductSearch("");
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('coupons').update({ is_active: !current }).eq('id', id);
    if (error) toast.error("Erro ao atualizar cupom");
    else { toast.success(current ? "Cupom desativado" : "Cupom ativado"); load(); }
  };

  const handleDelete = async (id: string, codeText: string) => {
    if (!confirm(`Excluir o cupom ${codeText}? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir cupom");
    else { toast.success("Cupom excluído"); load(); }
  };

  const startEdit = (c: Coupon) => {
    setEditingId(c.id);
    setEditHandles(c.product_handles || []);
    setEditSearch("");
  };

  const cancelEdit = () => { setEditingId(null); setEditHandles([]); setEditSearch(""); };

  const saveEdit = async (c: Coupon) => {
    setSavingEdit(true);
    const { error } = await supabase
      .from('coupons')
      .update({ product_handles: editHandles })
      .eq('id', c.id);
    setSavingEdit(false);
    if (error) { toast.error("Erro ao salvar produtos do cupom"); return; }
    toast.success(editHandles.length === 0 ? "Cupom agora vale para todos os produtos" : `${editHandles.length} produto(s) elegível(eis)`);
    cancelEdit();
    load();
  };

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopied(c);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>⚠️ Importante:</strong> O desconto é aplicado pelo <strong>Shopify</strong> no checkout para evitar conflitos com o sistema de pagamento. 
          Para cada cupom criado aqui, você precisa também criar o mesmo código no <strong>Shopify Admin → Discounts</strong> com o mesmo percentual.
          Assim o desconto entra automaticamente no valor final ao redirecionar para o Shopify. <strong>Dica:</strong> ao restringir produtos abaixo, configure também no Shopify a opção "Aplicar a produtos específicos" com os mesmos itens.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Criar Novo Cupom
          </CardTitle>
          <CardDescription>O código será automaticamente convertido em maiúsculas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código do Cupom</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="EX: AVANCE8" />
            </div>
            <div className="space-y-2">
              <Label>Percentual de Desconto (%)</Label>
              <Input type="number" min={1} max={100} value={percent} onChange={(e) => setPercent(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: 8% off em todos os produtos" />
            </div>
            <div className="space-y-2">
              <Label>Aplica-se a</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={appliesTo}
                onChange={(e) => { setAppliesTo(e.target.value as 'varejo' | 'atacado' | 'all'); setSelectedHandles([]); }}
              >
                <option value="varejo">Varejo</option>
                <option value="atacado">Atacado</option>
                <option value="all">Ambos</option>
              </select>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3 bg-secondary/20">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Package className="w-4 h-4" /> Restringir a produtos específicos
                </Label>
                <p className="text-xs text-muted-foreground">
                  Quando ativo, o desconto só será aplicado aos produtos selecionados. Caso contrário, vale para todos os produtos do escopo escolhido.
                </p>
              </div>
              <Switch checked={restrictToProducts} onCheckedChange={(v) => { setRestrictToProducts(v); if (!v) setSelectedHandles([]); }} />
            </div>

            {restrictToProducts && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Buscar produto por título ou handle..."
                      className="pl-8"
                    />
                  </div>
                  <Badge variant="secondary">{selectedHandles.length} selecionado(s)</Badge>
                </div>

                {productsLoading ? (
                  <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>
                ) : (
                  <ScrollArea className="h-64 border rounded-md bg-background">
                    <div className="p-2 space-y-1">
                      {filteredForCreate.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Nenhum produto encontrado</p>
                      ) : filteredForCreate.map((p) => {
                        const handle = p.node.handle;
                        const checked = selectedHandles.includes(handle);
                        return (
                          <label key={handle} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer">
                            <Checkbox checked={checked} onCheckedChange={() => toggleHandle(handle, selectedHandles, setSelectedHandles)} />
                            <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                              {p.node.images?.edges?.[0]?.node?.url && (
                                <img src={p.node.images.edges[0].node.url} alt={p.node.title} className="w-full h-full object-cover" loading="lazy" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{p.node.title}</p>
                              <p className="text-xs text-muted-foreground truncate font-mono">{handle}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}

                {selectedHandles.length > 0 && (
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedHandles([])}>Limpar seleção</Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button onClick={handleCreate} disabled={creating}>
            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Criar Cupom
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" /> Cupons Cadastrados ({coupons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : coupons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum cupom cadastrado</p>
          ) : (
            <div className="space-y-2">
              {coupons.map((c) => (
                <div key={c.id} className="border rounded-lg bg-background">
                  <div className="flex items-center justify-between gap-4 p-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => copyCode(c.code)}
                          className="font-mono font-bold text-base flex items-center gap-1 hover:text-primary"
                          title="Copiar código"
                        >
                          {c.code}
                          {copied === c.code ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 opacity-50" />}
                        </button>
                        <Badge variant="secondary">{c.discount_percent}% OFF</Badge>
                        <Badge variant="outline">
                          {c.applies_to === 'all' ? 'Ambos' : c.applies_to === 'varejo' ? 'Varejo' : 'Atacado'}
                        </Badge>
                        {(c.product_handles?.length ?? 0) > 0 ? (
                          <Badge className="bg-primary/10 text-primary border border-primary/20">
                            <Package className="w-3 h-3 mr-1" /> {c.product_handles.length} produto(s)
                          </Badge>
                        ) : (
                          <Badge variant="outline">Todos os produtos</Badge>
                        )}
                        {!c.is_active && <Badge variant="destructive">Inativo</Badge>}
                      </div>
                      {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => editingId === c.id ? cancelEdit() : startEdit(c)}>
                        <Package className="w-4 h-4 mr-1" />
                        {editingId === c.id ? 'Fechar' : 'Produtos'}
                      </Button>
                      <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c.id, c.is_active)} />
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id, c.code)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {editingId === c.id && (
                    <div className="border-t p-3 space-y-2 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={editSearch}
                            onChange={(e) => setEditSearch(e.target.value)}
                            placeholder="Buscar produto..."
                            className="pl-8 h-9"
                          />
                        </div>
                        <Badge variant="secondary">{editHandles.length} selecionado(s)</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Deixe vazio para que o cupom valha para todos os produtos do escopo ({c.applies_to === 'all' ? 'Ambos' : c.applies_to}).
                      </p>
                      {productsLoading ? (
                        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>
                      ) : (
                        <ScrollArea className="h-56 border rounded-md bg-background">
                          <div className="p-2 space-y-1">
                            {enforceScope(products, c.applies_to).map((p) => {
                              const handle = p.node.handle;
                              const checked = editHandles.includes(handle);
                              return (
                                <label key={handle} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer">
                                  <Checkbox checked={checked} onCheckedChange={() => toggleHandle(handle, editHandles, setEditHandles)} />
                                  <div className="w-9 h-9 rounded overflow-hidden bg-muted flex-shrink-0">
                                    {p.node.images?.edges?.[0]?.node?.url && (
                                      <img src={p.node.images.edges[0].node.url} alt={p.node.title} className="w-full h-full object-cover" loading="lazy" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{p.node.title}</p>
                                    <p className="text-xs text-muted-foreground truncate font-mono">{handle}</p>
                                  </div>
                                </label>
                              );
                            })}
                            {productsHasMore && (
                              <div className="flex justify-center py-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => loadMoreProducts(c.applies_to)}
                                  disabled={productsLoadingMore}
                                >
                                  {productsLoadingMore ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                                  Carregar mais
                                </Button>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditHandles([])}>Limpar tudo</Button>
                        <Button variant="outline" size="sm" onClick={cancelEdit}>Cancelar</Button>
                        <Button size="sm" onClick={() => saveEdit(c)} disabled={savingEdit}>
                          {savingEdit ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                          Salvar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponsManager;