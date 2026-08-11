import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, FileDown, Clock, Loader2, Save } from "lucide-react";
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

  const addItem = () => setItems((prev) => [...prev, newItem()]);

  const removeItem = (id: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));

  const updateItem = (id: string, field: keyof RequestItem, value: string) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

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

        {items.map((item) => (
          <Card key={item.id} className="relative">
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={item.sku} onChange={(e) => updateItem(item.id, "sku", e.target.value)} placeholder="Ex: BER-001" />
              </div>
              <div className="space-y-2">
                <Label>Tamanho</Label>
                <Input value={item.size} onChange={(e) => updateItem(item.id, "size", e.target.value)} placeholder="Ex: G1" />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <Input value={item.color} onChange={(e) => updateItem(item.id, "color", e.target.value)} placeholder="Ex: Preto" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Tecido</Label>
                <Input value={item.fabric} onChange={(e) => updateItem(item.id, "fabric", e.target.value)} placeholder="Ex: Suplex" />
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
        ))}
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