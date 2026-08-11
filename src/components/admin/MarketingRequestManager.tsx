import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, FileDown, Clock, Loader2, Save, Search, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import MarketingRequestHistory from "@/components/admin/MarketingRequestHistory";
import {
  MarketingRequestRecord,
  RequestItem,
  emptySignatures,
  generateRequestPDF,
} from "@/lib/marketing-request-pdf";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify-api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const newItem = (): RequestItem => ({
  id: Math.random().toString(36).slice(2, 11),
  sku: "",
  size: "",
  color: "",
  fabric: "",
});

const MarketingRequestManager = () => {
  const [items, setItems] = useState<RequestItem[]>([newItem()]);
  const [minTime, setMinTime] = useState("7 dias");
  const [maxTime, setMaxTime] = useState("30 dias");
  const [requesterName, setRequesterName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ShopifyProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, ShopifyProduct['node']>>({});

  const searchProducts = useCallback(async (term: string) => {
    if (!term || term.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await fetchProducts(20, term);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchProducts]);

  const addItem = () => setItems((prev) => [...prev, newItem()]);

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
    setSelectedProducts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateItem = (id: string, field: keyof RequestItem, value: string) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const handleProductSelect = (itemId: string, product: ShopifyProduct['node']) => {
    setSelectedProducts(prev => ({ ...prev, [itemId]: product }));
    
    // Auto-fill SKU from first variant or handle
    const firstVariant = product.variants.edges[0]?.node;
    updateItem(itemId, "sku", firstVariant?.sku || product.handle);
    
    // Reset size and color when product changes
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, size: "", color: "" } : item
    ));
  };

  const buildRecord = (requestNumber: string): MarketingRequestRecord => ({
    request_number: requestNumber,
    requester_name: requesterName.trim() || null,
    purpose: purpose.trim() || null,
    items,
    min_time: minTime,
    max_time: maxTime,
    status: "rascunho",
    withdrawal_date: null,
    return_date: null,
    signatures: emptySignatures(),
    notes: null,
    created_at: new Date().toISOString(),
  });

  const validate = () => {
    const filled = items.filter((item) => item.sku.trim() || item.color.trim() || item.size.trim());
    if (filled.length === 0) {
      toast.error("Preencha ao menos uma peça (SKU, tamanho ou cor).");
      return false;
    }
    return true;
  };

  const handleSaveAndGenerate = async () => {
    if (!validate()) return;
    setSaving(true);

    const requestNumber = `MKT-${format(new Date(), "yyyyMMdd-HHmmss")}`;
    const record = buildRecord(requestNumber);

    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await (supabase as any)
        .from("marketing_requests")
        .insert({
          request_number: record.request_number,
          requester_name: record.requester_name,
          purpose: record.purpose,
          items: record.items,
          min_time: record.min_time,
          max_time: record.max_time,
          status: record.status,
          signatures: record.signatures,
          created_by: userData?.user?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      generateRequestPDF({ ...record, id: data?.id, created_at: data?.created_at ?? record.created_at });
      toast.success(`Solicitação ${requestNumber} salva e PDF gerado.`);

      setItems([newItem()]);
      setRequesterName("");
      setPurpose("");
      setRefreshToken((token) => token + 1);
    } catch (error) {
      console.error("Erro ao salvar solicitação:", error);
      toast.error("Não foi possível salvar a solicitação no banco.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewPDF = () => {
    if (!validate()) return;
    generateRequestPDF(buildRecord("PREVIA"));
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="requester">Solicitante</Label>
          <Input
            id="requester"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            placeholder="Nome do responsável pelo Marketing"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purpose">Finalidade</Label>
          <Input
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Ex: Ensaio fotográfico coleção 2026"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min-time">Tempo Mínimo (Permanência)</Label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Input id="min-time" value={minTime} onChange={(e) => setMinTime(e.target.value)} placeholder="Ex: 7 dias" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-time">Tempo Máximo (Permanência)</Label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Input id="max-time" value={maxTime} onChange={(e) => setMaxTime(e.target.value)} placeholder="Ex: 30 dias" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Itens da Solicitação</h3>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </div>

        {items.map((item) => {
          const selectedProduct = selectedProducts[item.id];
          const variants = selectedProduct?.variants.edges.map(e => e.node) || [];
          
          // Get unique sizes and colors for the selected product
          const sizes = Array.from(new Set(variants.flatMap(v => 
            v.selectedOptions.filter(o => o.name.toLowerCase() === "tamanho" || o.name.toLowerCase() === "size").map(o => o.value)
          )));
          const colors = Array.from(new Set(variants.flatMap(v => 
            v.selectedOptions.filter(o => o.name.toLowerCase() === "cor" || o.name.toLowerCase() === "color").map(o => o.value)
          )));

          return (
            <Card key={item.id} className="relative">
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Produto (Busca)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal",
                          !selectedProduct && "text-muted-foreground"
                        )}
                      >
                        {selectedProduct ? selectedProduct.title : "Pesquisar produto..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder="Digite o nome do produto..." 
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                        />
                        <CommandList>
                          {searching && <div className="p-4 text-sm text-center">Buscando...</div>}
                          <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                          <CommandGroup>
                            {searchResults.map((result) => (
                              <CommandItem
                                key={result.node.id}
                                value={result.node.title}
                                onSelect={() => handleProductSelect(item.id, result.node)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedProduct?.id === result.node.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {result.node.title}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {item.sku && <p className="text-[10px] text-muted-foreground mt-1">SKU: {item.sku}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Tamanho</Label>
                  <Select 
                    value={item.size} 
                    onValueChange={(val) => updateItem(item.id, "size", val)}
                    disabled={!selectedProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedProduct ? "Selecione" : "Aguardando produto"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                      {sizes.length === 0 && selectedProduct && (
                        <SelectItem value="U">Tamanho Único</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Select 
                    value={item.color} 
                    onValueChange={(val) => updateItem(item.id, "color", val)}
                    disabled={!selectedProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedProduct ? "Selecione" : "Aguardando produto"} />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map(color => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                      {colors.length === 0 && selectedProduct && (
                        <SelectItem value="N/A">N/A</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Tecido</Label>
                  <Select 
                    value={item.fabric} 
                    onValueChange={(val) => updateItem(item.id, "fabric", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Milano">Milano</SelectItem>
                      <SelectItem value="Velocity">Velocity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover item"
                    className="absolute -top-2 -right-2 bg-background border rounded-full h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-b pb-6">
        <Button variant="outline" onClick={handlePreviewPDF}>
          <FileDown className="w-4 h-4 mr-2" />
          Prévia em PDF
        </Button>
        <Button onClick={handleSaveAndGenerate} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar e Gerar PDF
        </Button>
      </div>

      <MarketingRequestHistory refreshToken={refreshToken} />
    </div>
  );
};

export default MarketingRequestManager;