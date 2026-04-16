import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Package, AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useContactSettings } from "@/hooks/useSiteSettings";

interface OrderItem {
  title: string;
  variant_title: string | null;
  quantity: number;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  total: string;
  currency: string;
  items: OrderItem[];
  within_7_days: boolean;
}

const lookupSchema = z.object({
  email: z.string().trim().email({ message: "E-mail inválido" }).max(255),
  order_number: z.string().trim().min(1, "Informe o número do pedido").max(50),
});

const formatCurrency = (amount: string, currency: string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" }).format(Number(amount));

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

type Step = "lookup" | "select" | "submit" | "done";

const QuickReturnPage = () => {
  const [step, setStep] = useState<Step>("lookup");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [reason, setReason] = useState("");

  const { settings: contact } = useContactSettings();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = lookupSchema.safeParse({ email, order_number: orderNumber });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-customer-orders", {
        body: { email: parsed.data.email, order_number: parsed.data.order_number },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const found: CustomerOrder[] = data?.orders || [];
      if (found.length === 0) {
        toast.error("Nenhum pedido encontrado", {
          description: "Verifique o e-mail e o número do pedido.",
        });
        setLoading(false);
        return;
      }

      const eligible = found.filter((o) => o.within_7_days);
      if (eligible.length === 0) {
        toast.error("Pedido fora do prazo de troca", {
          description: "A troca rápida é válida apenas para pedidos dos últimos 7 dias.",
        });
        setLoading(false);
        return;
      }

      setOrders(eligible);
      if (eligible.length === 1) {
        setSelectedOrder(eligible[0]);
      }
      setStep("select");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao buscar pedido";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || selectedItemIdx === null) {
      toast.error("Selecione um item para devolver");
      return;
    }
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, "").length < 10) {
      toast.error("Informe um WhatsApp válido com DDD");
      return;
    }

    const item = selectedOrder.items[selectedItemIdx];
    setLoading(true);
    try {
      const { error } = await supabase.from("return_requests").insert({
        customer_name: selectedOrder.customer_name,
        customer_email: email.trim(),
        customer_whatsapp: whatsapp.replace(/\D/g, ""),
        order_number: selectedOrder.order_number,
        shopify_order_id: selectedOrder.id,
        order_date: selectedOrder.created_at,
        item_title: item.title,
        item_variant: item.variant_title,
        item_quantity: item.quantity,
        reason: reason.trim() || null,
      });

      if (error) throw error;

      // Notifica equipe via WhatsApp (link wa.me em nova aba)
      const teamPhone = contact?.whatsapp_number?.replace(/\D/g, "");
      if (teamPhone) {
        const msg = `🔄 *Nova Troca Rápida*\n\nPedido: ${selectedOrder.order_number}\nCliente: ${selectedOrder.customer_name}\nE-mail: ${email}\nWhatsApp: ${whatsapp}\n\nItem: ${item.title}${item.variant_title ? ` - ${item.variant_title}` : ""}\nQtd: ${item.quantity}${reason ? `\n\nMotivo: ${reason}` : ""}`;
        window.open(`https://wa.me/${teamPhone}?text=${encodeURIComponent(msg)}`, "_blank");
      }

      setStep("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar solicitação";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("lookup");
    setEmail("");
    setOrderNumber("");
    setOrders([]);
    setSelectedOrder(null);
    setSelectedItemIdx(null);
    setWhatsapp("");
    setReason("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        <Link
          to="/varejo"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Troca Rápida</h1>
          <p className="text-muted-foreground">
            Solicite a devolução de itens comprados nos últimos 7 dias.
          </p>
        </div>

        {/* STEP 1: Lookup */}
        {step === "lookup" && (
          <form onSubmit={handleLookup} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail da compra *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Número do pedido *</Label>
              <Input
                id="order"
                type="text"
                placeholder="Ex: 1234"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Está no e-mail de confirmação da sua compra (ex: #1234).
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                A troca rápida é válida apenas para pedidos realizados nos últimos <strong>7 dias</strong>.
              </span>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando pedido...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar meu pedido
                </>
              )}
            </Button>
          </form>
        )}

        {/* STEP 2: Select order + item */}
        {step === "select" && (
          <div className="space-y-6">
            {orders.length > 1 && !selectedOrder && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Selecione o pedido</h2>
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{o.order_number}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(o.created_at)}</p>
                      </div>
                      <p className="font-bold">{formatCurrency(o.total, o.currency)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedOrder && (
              <form onSubmit={handleSubmitReturn} className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">{selectedOrder.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(selectedOrder.created_at)} • {selectedOrder.customer_name}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold mb-3">Selecione o item para devolver *</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedItemIdx === idx
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="item"
                          checked={selectedItemIdx === idx}
                          onChange={() => setSelectedItemIdx(idx)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          {item.variant_title && (
                            <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">Quantidade: {item.quantity}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="space-y-2">
                    <Label htmlFor="wpp">Seu WhatsApp (com DDD) *</Label>
                    <Input
                      id="wpp"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo da devolução (opcional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Ex: tamanho não serviu, produto com defeito..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={500}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={reset} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" size="lg" disabled={loading || selectedItemIdx === null}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Iniciar processo de devolução"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 3: Done */}
        {step === "done" && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Solicitação registrada!</h2>
            <p className="text-muted-foreground mb-6">
              Nossa equipe entrará em contato pelo WhatsApp informado em até 24 horas úteis para dar continuidade à sua troca.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} variant="outline">
                Nova solicitação
              </Button>
              <Button asChild>
                <Link to="/varejo">Voltar à loja</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default QuickReturnPage;
