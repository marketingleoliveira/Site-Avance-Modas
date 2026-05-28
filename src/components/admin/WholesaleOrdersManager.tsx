import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Package, Eye, RefreshCw, Loader2, FileText, ClipboardCheck } from "lucide-react";
import { downloadOrderGuidePdf, downloadOrderStockPdf } from "@/lib/wholesale-order-exports";

interface CartItemData {
  title: string;
  variantTitle: string;
  quantity: number;
  price: string;
  currencyCode: string;
  selectedOptions: Array<{ name: string; value: string }>;
  imageUrl: string | null;
}

interface WholesaleOrder {
  id: string;
  order_number?: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string;
  cart_items: CartItemData[];
  total_amount: number;
  status: string;
  admin_notes: string | null;
  currency_code: string;
  customer_document?: string | null;
  payment_method?: string | null;
  shipping_address?: Record<string, unknown> | null;
  shipping_cost?: number | null;
  shipping_region?: string | null;
}

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_contato: "Em Contato",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const statusColors: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  em_contato: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  finalizado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const WholesaleOrdersManager = () => {
  const [orders, setOrders] = useState<WholesaleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WholesaleOrder | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase.from("wholesale_orders").select("*").order("created_at", { ascending: false });
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }
      const { data, error } = await query;
      if (error) throw error;
      setOrders((data as unknown as WholesaleOrder[]) || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleOpenOrder = (order: WholesaleOrder) => {
    setSelectedOrder(order);
    setAdminNotes(order.admin_notes || "");
    setNewStatus(order.status);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("wholesale_orders")
        .update({
          status: newStatus,
          admin_notes: adminNotes.trim() || null,
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;
      toast.success("Solicitação atualizada!");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Erro ao atualizar solicitação");
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (amount: number, currency = "BRL") => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Solicitações Atacado
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="em_contato">Em Contato</SelectItem>
                <SelectItem value="finalizado">Finalizados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50 hover:border-border transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">#{order.order_number || "—"}</span>
                    <span className="font-medium">{order.customer_name}</span>
                    <Badge className={statusColors[order.status] || ""}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.customer_email} • {order.customer_whatsapp}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)} • {(order.cart_items as CartItemData[]).length} itens • {formatPrice(order.total_amount, order.currency_code)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenOrder(order)}>
                    <Eye className="w-4 h-4 mr-1" /> Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Guia de Solicitação de Pedido (PDF)"
                    onClick={() => downloadOrderGuidePdf(order as never)}
                  >
                    <FileText className="w-4 h-4 mr-1" /> Gerar Guia
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Controle de Estoque (PDF)"
                    onClick={() => downloadOrderStockPdf(order as never)}
                  >
                    <ClipboardCheck className="w-4 h-4 mr-1" /> Gerar Estoque
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Solicitação
              {selectedOrder?.order_number && (
                <span className="ml-2 text-sm font-mono text-muted-foreground">#{selectedOrder.order_number}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{selectedOrder.customer_whatsapp}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              {/* Cart items */}
              <div>
                <h4 className="font-semibold mb-3">Itens do Pedido</h4>
                <div className="space-y-2">
                  {(selectedOrder.cart_items as CartItemData[]).map((item, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedOptions?.map(o => o.value).join(" • ")} • Qtd: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">
                        {formatPrice(parseFloat(item.price) * item.quantity, item.currencyCode)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(selectedOrder.total_amount, selectedOrder.currency_code)}
                  </span>
                </div>
              </div>

              {/* Status + notes */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_contato">Em Contato</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Anotações internas sobre esta solicitação..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleUpdateOrder} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Salvar Alterações
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => downloadOrderGuidePdf(selectedOrder as never)}>
                    <FileText className="w-4 h-4 mr-2" /> Gerar Guia
                  </Button>
                  <Button variant="outline" onClick={() => downloadOrderStockPdf(selectedOrder as never)}>
                    <ClipboardCheck className="w-4 h-4 mr-2" /> Gerar Estoque
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WholesaleOrdersManager;
