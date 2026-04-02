import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCartStore } from "@/stores/cartStore";
import { useStoreContext } from "@/stores/storeContextStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Clock, Loader2, Package, Send } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const WholesaleCheckout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice } = useCartStore();
  const isAtacado = useStoreContext((state) => state.isAtacado());
  const [sending, setSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const totalPrice = getTotalPrice();
  const hasWholesaleItems = items.some((item) => item.lineId?.startsWith("local-"));
  const canAccessCheckout = isAtacado || hasWholesaleItems;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

  if (!canAccessCheckout || items.length === 0) {
    return <Navigate to="/atacado" replace />;
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error("E-mail inválido");
      return;
    }

    setAcceptedRules(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setSending(true);

    try {
      const cartData = items.map((item) => ({
        title: item.product.node.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        price: item.price.amount,
        currencyCode: item.price.currencyCode,
        selectedOptions: item.selectedOptions,
        imageUrl: item.product.node.images?.edges?.[0]?.node?.url || null,
      }));

      const { error } = await supabase.from("wholesale_orders").insert({
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_whatsapp: form.whatsapp.trim(),
        cart_items: cartData,
        total_amount: totalPrice,
        currency_code: items[0]?.price.currencyCode || "BRL",
      });

      if (error) throw error;

      setShowConfirmDialog(false);
      toast.success("Solicitação enviada com sucesso!");
      navigate("/atacado/confirmacao", {
        replace: true,
        state: { fromWholesaleSubmission: true },
      });
    } catch (error) {
      console.error("Error submitting wholesale order:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 sm:mb-6 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <h1 className="mb-4 sm:mb-6 text-xl font-bold sm:text-2xl md:text-3xl">Finalizar Pedido Atacado</h1>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Dados do Comprador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome ou razão social"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(11) 99999-9999"
                    value={form.whatsapp}
                    onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    required
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail de Contato *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    maxLength={255}
                  />
                </div>

                <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Após a confirmação, sua solicitação seguirá para análise da nossa equipe.
                </p>
              </form>
            </CardContent>
          </Card>

          <Card className="order-first md:order-last">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={`${item.variantId}-${item.lineId ?? item.quantity}`}
                    className="flex gap-3 rounded-xl border border-border/50 bg-secondary/30 p-3"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border/50 bg-card">
                      {item.product.node.images?.edges?.[0]?.node && (
                        <img
                          src={item.product.node.images.edges[0].node.url}
                          alt={item.product.node.title}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-medium">{item.product.node.title}</h2>

                      {item.selectedOptions.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.selectedOptions.map((option) => option.value).join(" • ")}
                        </p>
                      )}

                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Qtd: {item.quantity}</span>
                        <span className="text-sm font-semibold text-primary">
                          {formatPrice(parseFloat(item.price.amount) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
            </div>

            <AlertDialogTitle className="text-center text-xl">
              Confirmar Solicitação de Atacado
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-center">

                <p className="text-sm text-muted-foreground">
                  Ao enviar esta solicitação, analisaremos seu pedido e entraremos em contato pelo
                  WhatsApp ou e-mail informados para continuar o atendimento.
                </p>

                <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/50 p-3 text-left">
                  <Checkbox
                    id="accept-rules"
                    checked={acceptedRules}
                    onCheckedChange={(checked) => setAcceptedRules(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="accept-rules" className="cursor-pointer text-sm leading-relaxed">
                    Li e aceito as <strong>regras de atacado</strong> e confirmo que desejo enviar esta solicitação.
                  </label>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={sending}>Cancelar</AlertDialogCancel>
            <Button onClick={handleConfirmSubmit} disabled={!acceptedRules || sending} className="w-full sm:w-auto">
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Confirmar e Enviar
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default WholesaleCheckout;
