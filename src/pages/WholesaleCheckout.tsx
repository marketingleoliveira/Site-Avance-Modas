import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/stores/cartStore";
import { useStoreContext } from "@/stores/storeContextStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Package, Send, AlertCircle, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const WholesaleCheckout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const isAtacado = useStoreContext(state => state.isAtacado());
  const [sending, setSending] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });

  const totalPrice = getTotalPrice();
  const hasWholesaleItems = items.some(item => item.lineId?.startsWith("local-"));
  const canAccessCheckout = isAtacado || hasWholesaleItems;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  };

  // Redirect if not atacado or cart empty
  if (!canAccessCheckout) {
    return <Navigate to="/atacado" replace />;
  }

  if (items.length === 0 && !hasSubmitted) {
    return <Navigate to="/atacado" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

    setSending(true);
    try {
      const cartData = items.map(item => ({
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
        currency_code: items[0]?.price.currencyCode || 'BRL',
      });

      if (error) throw error;

      setHasSubmitted(true);
      navigate("/atacado/confirmacao", { replace: true });
      clearCart();
      toast.success("Solicitação enviada com sucesso!");
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
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">Finalizar Pedido Atacado</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Dados do Comprador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome ou razão social"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={(e) => setForm(prev => ({ ...prev, whatsapp: e.target.value }))}
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
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    maxLength={255}
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={sending}>
                  {sending ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" /> Enviar Solicitação</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Nossa equipe entrará em contato em até 48h úteis.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50">
                    <div className="w-16 h-16 bg-card rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                      {item.product.node.images?.edges?.[0]?.node && (
                        <img
                          src={item.product.node.images.edges[0].node.url}
                          alt={item.product.node.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.product.node.title}</h4>
                      {item.selectedOptions.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.selectedOptions.map(o => o.value).join(' • ')}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">Qtd: {item.quantity}</span>
                        <span className="font-semibold text-sm text-primary">
                          {formatPrice(parseFloat(item.price.amount) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WholesaleCheckout;
