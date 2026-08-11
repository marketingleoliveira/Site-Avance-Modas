import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileDown, ChevronDown, ChevronRight, Loader2, Save, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  MarketingRequestRecord,
  emptySignatures,
  generateRequestPDF,
  statusLabels,
} from "@/lib/marketing-request-pdf";

const statusStyles: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  retirado: "bg-primary text-primary-foreground",
  devolvido: "bg-emerald-600 text-white",
  atrasado: "bg-destructive text-destructive-foreground",
  cancelado: "bg-secondary text-secondary-foreground",
};

const toRecord = (row: Record<string, unknown>): MarketingRequestRecord => ({
  id: row.id as string,
  request_number: (row.request_number as string) ?? "",
  requester_name: (row.requester_name as string) ?? null,
  purpose: (row.purpose as string) ?? null,
  items: Array.isArray(row.items) ? (row.items as MarketingRequestRecord["items"]) : [],
  min_time: (row.min_time as string) ?? "",
  max_time: (row.max_time as string) ?? "",
  status: (row.status as string) ?? "rascunho",
  withdrawal_date: (row.withdrawal_date as string) ?? null,
  return_date: (row.return_date as string) ?? null,
  signatures: {
    ...emptySignatures(),
    ...((row.signatures as MarketingRequestRecord["signatures"]) ?? {}),
  },
  notes: (row.notes as string) ?? null,
  created_at: (row.created_at as string) ?? undefined,
});

const toLocalInput = (value: string | null) => {
  if (!value) return "";
  try {
    return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
};

interface MarketingRequestHistoryProps {
  refreshToken?: number;
}

const MarketingRequestHistory = ({ refreshToken = 0 }: MarketingRequestHistoryProps) => {
  const [requests, setRequests] = useState<MarketingRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("marketing_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar solicitações:", error);
      toast.error("Não foi possível carregar o histórico de solicitações.");
      setLoading(false);
      return;
    }

    setRequests(((data as Record<string, unknown>[]) ?? []).map(toRecord));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  const patchLocal = (id: string, patch: Partial<MarketingRequestRecord>) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const saveRequest = async (request: MarketingRequestRecord) => {
    if (!request.id) return;
    setSavingId(request.id);
    const { error } = await (supabase as any)
      .from("marketing_requests")
      .update({
        status: request.status,
        withdrawal_date: request.withdrawal_date,
        return_date: request.return_date,
        signatures: request.signatures,
        notes: request.notes,
      })
      .eq("id", request.id);
    setSavingId(null);

    if (error) {
      console.error("Erro ao salvar solicitação:", error);
      toast.error("Não foi possível salvar as alterações.");
      return;
    }
    toast.success("Solicitação atualizada.");
  };

  const deleteRequest = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Excluir esta solicitação permanentemente?")) return;
    const { error } = await (supabase as any).from("marketing_requests").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir solicitação:", error);
      toast.error("Não foi possível excluir a solicitação.");
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success("Solicitação excluída.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Carregando solicitações...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Solicitações Salvas ({requests.length})</h3>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {requests.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma solicitação salva ainda.</p>
      )}

      {requests.map((request) => {
        const expanded = expandedId === request.id;
        return (
          <Card key={request.id}>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 text-left flex-1 min-w-0"
                  onClick={() => setExpandedId(expanded ? null : request.id ?? null)}
                  aria-expanded={expanded}
                >
                  {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-medium truncate">{request.request_number}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {request.items.length} peça(s)
                    {request.created_at ? ` • ${format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}` : ""}
                  </span>
                </button>
                <Badge className={cn("border-0", statusStyles[request.status])}>
                  {statusLabels[request.status] || request.status}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => generateRequestPDF(request)}>
                  <FileDown className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>

              {expanded && (
                <div className="space-y-4 border-t pt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="py-1 pr-4">SKU</th>
                          <th className="py-1 pr-4">Tamanho</th>
                          <th className="py-1 pr-4">Cor</th>
                          <th className="py-1">Tecido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {request.items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="py-1 pr-4">{item.sku || "-"}</td>
                            <td className="py-1 pr-4">{item.size || "-"}</td>
                            <td className="py-1 pr-4">{item.color || "-"}</td>
                            <td className="py-1">{item.fabric || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={request.status}
                        onChange={(e) => patchLocal(request.id!, { status: e.target.value })}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data da Retirada</Label>
                      <Input
                        type="datetime-local"
                        value={toLocalInput(request.withdrawal_date)}
                        onChange={(e) =>
                          patchLocal(request.id!, {
                            withdrawal_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data da Devolução</Label>
                      <Input
                        type="datetime-local"
                        value={toLocalInput(request.return_date)}
                        onChange={(e) =>
                          patchLocal(request.id!, {
                            return_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                          })
                        }
                      />
                    </div>
                  </div>

                  {(["withdrawal", "return"] as const).map((stage) => (
                    <div key={stage} className="space-y-2">
                      <Label className="text-sm font-semibold">
                        {stage === "withdrawal" ? "Assinaturas — Retirada" : "Assinaturas — Devolução"}
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(["marketing", "direction", "ecommerce"] as const).map((role) => (
                          <Input
                            key={role}
                            value={request.signatures[stage][role]}
                            placeholder={
                              role === "marketing" ? "Marketing" : role === "direction" ? "Diretoria" : "E-commerce"
                            }
                            onChange={(e) =>
                              patchLocal(request.id!, {
                                signatures: {
                                  ...request.signatures,
                                  [stage]: { ...request.signatures[stage], [role]: e.target.value },
                                },
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Input
                      value={request.notes ?? ""}
                      onChange={(e) => patchLocal(request.id!, { notes: e.target.value })}
                      placeholder="Anotações internas"
                    />
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => deleteRequest(request.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                    <Button size="sm" onClick={() => saveRequest(request)} disabled={savingId === request.id}>
                      {savingId === request.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MarketingRequestHistory;