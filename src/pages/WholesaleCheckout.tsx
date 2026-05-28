import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  QrCode,
  Send,
  Truck,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  calculateShipping,
  DEFAULT_ITEM_WEIGHT_KG,
  fetchAddressByCep,
  formatCep,
  formatDocument,
  formatPhone,
  isValidCep,
  isValidDocument,
  toKilograms,
  type ShippingQuote,
} from "@/lib/shipping-loggi";
import {
  getRealShippingQuote,
  type RealShippingQuote,
} from "@/lib/shopify-shipping-quote";

type PaymentMethod = "pix" | "credit_card_3x";

const WholesaleCheckout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice } = useCartStore();
  const isAtacado = useStoreContext((state) => state.isAtacado());
  const [sending, setSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<RealShippingQuote | ShippingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    document: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    paymentMethod: "" as PaymentMethod | "",
  });

  const subtotal = getTotalPrice();
  const FREE_SHIPPING_THRESHOLD = 1500;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const rawShippingCost = shippingQuote?.cost ?? 0;
  const shippingCost = freeShipping ? 0 : rawShippingCost;
  const totalPrice = subtotal + shippingCost;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Peso total do carrinho (kg) — usa o peso de cada variante Shopify ou um padrão.
  const totalWeightKg = items.reduce((sum, item) => {
    const variant = item.product.node.variants.edges.find(
      (v) => v.node.id === item.variantId
    )?.node;
    const kg = variant
      ? toKilograms(variant.weight, variant.weightUnit) || DEFAULT_ITEM_WEIGHT_KG
      : DEFAULT_ITEM_WEIGHT_KG;
    return sum + kg * item.quantity;
  }, 0);

  const hasWholesaleItems = items.some((item) => item.lineId?.startsWith("local-"));
  const canAccessCheckout = isAtacado || hasWholesaleItems;

  // Cotação real via Shopify quando endereço estiver completo;
  // fallback estimado (peso) enquanto o resto do endereço não chega.
  useEffect(() => {
    if (!isValidCep(form.cep)) {
      setShippingQuote(null);
      return;
    }

    const addressReady =
      form.street.trim() &&
      form.number.trim() &&
      form.city.trim() &&
      form.state.trim().length === 2;

    if (!addressReady) {
      // Mostra prévia estimada enquanto o endereço completa.
      setShippingQuote(calculateShipping(form.cep, totalWeightKg));
      return;
    }

    let cancelled = false;
    setQuoteLoading(true);

    const quoteItems = items.map((item) => {
      const variant = item.product.node.variants.edges.find(
        (v) => v.node.id === item.variantId
      )?.node;
      return {
        productTitle: item.product.node.title,
        variantId: item.variantId,
        selectedOptions: item.selectedOptions,
        quantity: item.quantity,
        weight: variant?.weight,
        weightUnit: variant?.weightUnit,
      };
    });

    const timer = setTimeout(() => {
      getRealShippingQuote(quoteItems, {
        cep: form.cep,
        street: form.street,
        number: form.number,
        complement: form.complement,
        city: form.city,
        state: form.state,
      })
        .then((quote) => {
          if (cancelled) return;
          setShippingQuote(
            quote ?? calculateShipping(form.cep, totalWeightKg)
          );
        })
        .finally(() => {
          if (!cancelled) setQuoteLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setQuoteLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cep, form.street, form.number, form.city, form.state, form.complement, totalWeightKg]);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

  if (!canAccessCheckout || items.length === 0) {
    return <Navigate to="/atacado" replace />;
  }

  const handleCepChange = async (raw: string) => {
    const formatted = formatCep(raw);
    setForm((prev) => ({ ...prev, cep: formatted }));

    if (!isValidCep(formatted)) {
      setShippingQuote(null);
      return;
    }

    setCepLoading(true);
    try {
      const [address, quote] = await Promise.all([
        fetchAddressByCep(formatted),
        Promise.resolve(calculateShipping(formatted, totalWeightKg)),
      ]);

      setShippingQuote(quote);

      if (address) {
        setForm((prev) => ({
          ...prev,
          street: address.logradouro || prev.street,
          neighborhood: address.bairro || prev.neighborhood,
          city: address.localidade || prev.city,
          state: address.uf || prev.state,
        }));
      } else {
        toast.error("CEP não encontrado. Preencha o endereço manualmente.");
      }
    } finally {
      setCepLoading(false);
    }
  };

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

    if (!isValidDocument(form.document)) {
      toast.error("CPF ou CNPJ inválido");
      return;
    }

    if (!isValidCep(form.cep) || !shippingQuote) {
      toast.error("Informe um CEP válido para calcular o frete");
      return;
    }

    if (!form.street.trim() || !form.number.trim() || !form.city.trim() || !form.state.trim()) {
      toast.error("Preencha o endereço completo de entrega");
      return;
    }

    if (!form.paymentMethod) {
      toast.error("Selecione uma forma de pagamento");
      return;
    }

    setAcceptedRules(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setSending(true);

    try {
      const cartData = items.map((item) => {
        const variantNode = item.product.node.variants.edges.find(
          (v) => v.node.id === item.variantId
        )?.node;
        return {
          title: item.product.node.title,
          variantTitle: item.variantTitle,
          variantId: item.variantId,
          sku: variantNode?.sku ?? null,
          quantity: item.quantity,
          price: item.price.amount,
          currencyCode: item.price.currencyCode,
          selectedOptions: item.selectedOptions,
          imageUrl: item.product.node.images?.edges?.[0]?.node?.url || null,
        };
      });

      const { error } = await supabase.from("wholesale_orders").insert({
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_whatsapp: form.whatsapp.trim(),
        customer_document: form.document.trim(),
        shipping_address: {
          cep: form.cep.trim(),
          street: form.street.trim(),
          number: form.number.trim(),
          complement: form.complement.trim() || null,
          neighborhood: form.neighborhood.trim(),
          city: form.city.trim(),
          state: form.state.trim().toUpperCase(),
        },
        shipping_cost: shippingCost,
        shipping_region: shippingQuote?.region ?? null,
        payment_method: form.paymentMethod || null,
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

        <div className="grid gap-6 sm:gap-8 md:grid-cols-5">
          <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Dados do Comprador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="wholesale-checkout-form" onSubmit={handleFormSubmit} className="space-y-4">
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
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, whatsapp: formatPhone(e.target.value) }))
                    }
                    required
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">CPF ou CNPJ *</Label>
                  <Input
                    id="document"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    value={form.document}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, document: formatDocument(e.target.value) }))
                    }
                    required
                    maxLength={18}
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
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      form="wholesale-checkout-form"
                      placeholder="00000-000"
                      value={form.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      required
                      maxLength={9}
                    />
                    {cepLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    form="wholesale-checkout-form"
                    placeholder="Nome da rua"
                    value={form.street}
                    onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                    required
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    form="wholesale-checkout-form"
                    placeholder="123"
                    value={form.number}
                    onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                    required
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    form="wholesale-checkout-form"
                    placeholder="Apto, sala, bloco (opcional)"
                    value={form.complement}
                    onChange={(e) => setForm((prev) => ({ ...prev, complement: e.target.value }))}
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    form="wholesale-checkout-form"
                    placeholder="Bairro"
                    value={form.neighborhood}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, neighborhood: e.target.value }))
                    }
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    form="wholesale-checkout-form"
                    placeholder="Cidade"
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF *</Label>
                  <Input
                    id="state"
                    form="wholesale-checkout-form"
                    placeholder="SP"
                    value={form.state}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))
                    }
                    required
                    maxLength={2}
                  />
                </div>
              </div>

              {shippingQuote && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">
                        {freeShipping
                          ? "Frete grátis · Pedido acima de R$ 1.500"
                          : ("source" in shippingQuote && shippingQuote.source !== "estimated")
                          ? `Frete Loggi · ${shippingQuote.serviceName ?? "Cotação Shopify"}`
                          : `Frete estimado · ${shippingQuote.region}`}
                      </span>
                      <span className="font-bold text-primary flex items-center gap-2">
                        {quoteLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                        {freeShipping ? (
                          <>
                            <span className="text-xs line-through text-muted-foreground font-normal">
                              {formatPrice(rawShippingCost)}
                            </span>
                            <span>GRÁTIS</span>
                          </>
                        ) : (
                          formatPrice(shippingQuote.cost)
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prazo: {shippingQuote.estimatedDays} · Peso: {shippingQuote.weightKg.toFixed(1).replace(".", ",")}kg
                      {"source" in shippingQuote && shippingQuote.source === "mixed" && (
                        <> · {shippingQuote.matchedItems}/{shippingQuote.totalItems} itens cotados via Shopify</>
                      )}
                      {"source" in shippingQuote && shippingQuote.source === "estimated" && (
                        <> · valor estimado — preencha o endereço completo para cotação real</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {!freeShipping && remainingForFreeShipping > 0 && (
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-xs text-muted-foreground">
                  Faltam <strong className="text-primary">{formatPrice(remainingForFreeShipping)}</strong> para você ganhar <strong className="text-primary">frete grátis</strong> no pedido atacado.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Forma de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="payment">Selecione *</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, paymentMethod: value as PaymentMethod }))
                }
              >
                <SelectTrigger id="payment">
                  <SelectValue placeholder="Escolha a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card_3x">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Cartão de crédito em até 3x
                    </span>
                  </SelectItem>
                  <SelectItem value="pix">
                    <span className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      Pix
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Após o envio, nossa equipe entrará em contato para confirmar o pagamento conforme a opção escolhida.
              </p>
            </CardContent>
          </Card>

          <Button
            type="submit"
            form="wholesale-checkout-form"
            className="h-12 w-full text-base font-semibold"
            disabled={sending}
          >
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
          </div>

          <div className="md:col-span-2">
          <Card>
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

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-medium">
                    {freeShipping ? (
                      <span className="text-primary font-semibold">GRÁTIS</span>
                    ) : shippingQuote ? (
                      formatPrice(shippingCost)
                    ) : (
                      "A calcular"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
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
