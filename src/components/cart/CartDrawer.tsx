import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2, AlertTriangle, CheckCircle, Package, Store, Send, Tag, X, BadgePercent, Ban } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useStoreContext } from "@/stores/storeContextStore";
import { useAtacadoSettings } from "@/hooks/useAtacadoSettings";
import { useCouponStore } from "@/stores/couponStore";
import { toast } from "sonner";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Use persistent store context instead of URL-based detection
  const isAtacado = useStoreContext(state => state.isAtacado());
  const { settings: atacadoSettings, loading: settingsLoading } = useAtacadoSettings();
  
  const { 
    items, 
    isLoading,
    isSyncing,
    updateQuantity, 
    removeItem, 
    getCheckoutUrl,
    syncCart,
    getTotalItems,
    getTotalPrice
  } = useCartStore();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const hasWholesaleItems = items.some((item) => item.lineId?.startsWith('local-'));
  const useWholesaleFlow = isAtacado || hasWholesaleItems;

  // Coupon
  const appliedCoupon = useCouponStore((s) => s.applied);
  const isValidatingCoupon = useCouponStore((s) => s.isValidating);
  const applyCoupon = useCouponStore((s) => s.apply);
  const removeCoupon = useCouponStore((s) => s.remove);
  const [couponInput, setCouponInput] = useState("");

  const couponContext: 'varejo' | 'atacado' = useWholesaleFlow ? 'atacado' : 'varejo';
  const couponScopeOk = appliedCoupon && (appliedCoupon.applies_to === 'all' || appliedCoupon.applies_to === couponContext);
  const restrictedHandles = appliedCoupon?.product_handles ?? [];
  const hasHandleRestriction = restrictedHandles.length > 0;
  const isItemEligible = (handle?: string) =>
    !!couponScopeOk && (!hasHandleRestriction || (!!handle && restrictedHandles.includes(handle)));
  // Sum eligible items: when there are restrictions, only items whose handle is in the list count.
  const eligibleSubtotal = couponScopeOk
    ? items.reduce((sum, item) => {
        return isItemEligible(item.product?.node?.handle)
          ? sum + parseFloat(item.price.amount) * item.quantity
          : sum;
      }, 0)
    : 0;
  const couponEligible = couponScopeOk && eligibleSubtotal > 0;
  const discountAmount = couponEligible ? (eligibleSubtotal * appliedCoupon!.discount_percent) / 100 : 0;
  const finalPrice = totalPrice - discountAmount;
  const ineligibleCount = couponScopeOk && hasHandleRestriction
    ? items.filter((it) => !isItemEligible(it.product?.node?.handle)).length
    : 0;
  
  // Only apply minimum order validation for atacado when settings are loaded
  const minimumOrder = atacadoSettings.minimum_order;
  const isBelowMinimum = useWholesaleFlow && !settingsLoading && totalPrice < minimumOrder;
  const remainingForMinimum = Math.max(0, minimumOrder - totalPrice);

  // Sync cart with Shopify when drawer opens
  useEffect(() => {
    if (isOpen) {
      syncCart();
    }
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    // Atacado: redirect to wholesale checkout form
    if (useWholesaleFlow) {
      if (!settingsLoading && totalPrice < minimumOrder) {
        toast.error("Pedido mínimo não atingido", {
          description: `No atacado, o pedido mínimo é de ${formatPrice(minimumOrder)}. Faltam ${formatPrice(remainingForMinimum)} para finalizar.`,
        });
        return;
      }
      setIsOpen(false);
      navigate("/atacado/checkout");
      return;
    }
    
    // Varejo: normal Shopify checkout
    const checkoutUrl = getCheckoutUrl();

    if (checkoutUrl) {
      // Append the Shopify discount code as a URL param so the discount is applied
      // by Shopify itself in the checkout, avoiding any payment system conflicts.
      let finalUrl = checkoutUrl;
      if (couponEligible) {
        try {
          const u = new URL(checkoutUrl);
          u.searchParams.set('discount', appliedCoupon!.code);
          finalUrl = u.toString();
        } catch {
          finalUrl = checkoutUrl + (checkoutUrl.includes('?') ? '&' : '?') + 'discount=' + encodeURIComponent(appliedCoupon!.code);
        }
      }
      window.open(finalUrl, '_blank');
      setIsOpen(false);
      toast.success("Checkout aberto!", {
        description: couponEligible
          ? `Cupom ${appliedCoupon!.code} será aplicado automaticamente no Shopify.`
          : "Complete seu pedido na nova aba.",
      });
    } else {
      toast.error("Erro ao abrir checkout", {
        description: "Tente adicionar um produto novamente.",
      });
    }
  };

  const handleApplyCoupon = async () => {
    const result = await applyCoupon(couponInput, couponContext);
    if (result.ok) {
      // Re-read store after apply to validate eligibility against current cart
      const applied = useCouponStore.getState().applied;
      const restricted = applied?.product_handles ?? [];
      if (restricted.length > 0) {
        const anyEligible = items.some((it) => it.product?.node?.handle && restricted.includes(it.product.node.handle));
        if (!anyEligible) {
          useCouponStore.getState().remove();
          toast.error("Cupom válido, mas nenhum produto do carrinho é elegível", {
            description: "Este cupom só vale para produtos selecionados pela loja.",
          });
          return;
        }
      }
      toast.success(result.message);
      setCouponInput("");
    } else {
      toast.error(result.message);
    }
  };

  const formatPrice = (amount: number, currencyCode: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button aria-label="Abrir carrinho" className="p-2 hover:bg-secondary rounded-full transition-colors relative">
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground border-0">
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Carrinho de Compras
            </SheetTitle>
            {isSyncing && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Sincronizando...
              </div>
            )}
          </div>
          <SheetDescription>
            {totalItems === 0 ? "Seu carrinho está vazio" : `${totalItems} ${totalItems !== 1 ? 'itens' : 'item'} no carrinho`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-4 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-1">Carrinho vazio</p>
                <p className="text-sm text-muted-foreground">Adicione produtos para continuar</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.variantId} 
                    className={`relative flex gap-3 p-3 rounded-xl border transition-all duration-300 ${
                      couponEligible && hasHandleRestriction
                        ? isItemEligible(item.product?.node?.handle)
                          ? 'bg-green-50/60 dark:bg-green-950/20 border-green-300/70 dark:border-green-800/60 shadow-sm shadow-green-100'
                          : 'bg-secondary/10 border-dashed border-border/40 opacity-70 scale-[0.98]'
                        : 'bg-secondary/30 border-border/50 hover:border-border hover:shadow-sm'
                    }`}
                  >
                    <div className="w-20 h-20 bg-card rounded-lg overflow-hidden flex-shrink-0 border border-border/50 relative">
                      {item.product.node.images?.edges?.[0]?.node && (
                        <img
                          src={item.product.node.images.edges[0].node.url}
                          alt={item.product.node.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {couponEligible && isItemEligible(item.product?.node?.handle) && (
                        <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-bl-lg">
                          <BadgePercent className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold truncate text-[13px] leading-tight uppercase tracking-tight">{item.product.node.title}</h4>
                        {item.selectedOptions.length > 0 && (
                          <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                            {item.selectedOptions.map(option => option.value).join(' • ')}
                          </p>
                        )}
                        {couponEligible && (
                          isItemEligible(item.product?.node?.handle) ? (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/50 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                                <BadgePercent className="w-3 h-3" />
                                -{appliedCoupon!.discount_percent}% COM {appliedCoupon!.code}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-full">
                              <Ban className="w-3 h-3" />
                              Não elegível
                            </span>
                          )
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col">
                          {couponEligible && isItemEligible(item.product?.node?.handle) && (
                            <span className="text-[10px] text-muted-foreground line-through decoration-red-500/50">
                              {formatPrice(parseFloat(item.price.amount) * item.quantity, item.price.currencyCode)}
                            </span>
                          )}
                          <p className={`font-black text-sm sm:text-base tracking-tight ${couponEligible && isItemEligible(item.product?.node?.handle) ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
                            {formatPrice(
                              (parseFloat(item.price.amount) * (couponEligible && isItemEligible(item.product?.node?.handle) ? (1 - appliedCoupon!.discount_percent / 100) : 1)) * item.quantity, 
                              item.price.currencyCode
                            )}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0 bg-background/50 rounded-full p-0.5 border border-border/50">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-secondary"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={isLoading}
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1) {
                                updateQuantity(item.variantId, val);
                              }
                            }}
                            className="w-8 text-center text-xs font-bold bg-transparent border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            disabled={isLoading}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-secondary"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={isLoading}
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <div className="w-px h-4 bg-border mx-0.5" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.variantId)}
                            disabled={isLoading}
                            aria-label="Remover produto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon eligibility summary */}
              {couponEligible && (
                <div className="mt-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-4 transition-all duration-300 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                        <BadgePercent className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
                          Cupom {appliedCoupon!.code} Aplicado!
                        </span>
                        <span className="text-[11px] text-green-600/80 dark:text-green-400/80">
                          {items.length - ineligibleCount} de {items.length} itens elegíveis
                        </span>
                      </div>
                    </div>
                    {ineligibleCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 uppercase">
                        {ineligibleCount} restritos
                      </span>
                    )}
                  </div>
                  {ineligibleCount > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-3 italic leading-relaxed">
                      * O desconto incide somente sobre os produtos da coleção selecionada pela loja.
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex-shrink-0 space-y-4 pt-4 border-t bg-background mt-4">
                {/* Minimum order progress indicator for atacado - only show when settings loaded */}
                {useWholesaleFlow && items.length > 0 && !settingsLoading && (
                  <div className={`rounded-xl p-4 space-y-3 ${
                    isBelowMinimum 
                      ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800' 
                      : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                  }`}>
                    {/* Progress header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isBelowMinimum ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          isBelowMinimum 
                            ? 'text-amber-800 dark:text-amber-400' 
                            : 'text-green-800 dark:text-green-400'
                        }`}>
                          {isBelowMinimum ? 'Pedido mínimo' : 'Pedido mínimo atingido! ✓'}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${
                        isBelowMinimum 
                          ? 'text-amber-700 dark:text-amber-500' 
                          : 'text-green-700 dark:text-green-500'
                      }`}>
                        {formatPrice(totalPrice)} / {formatPrice(minimumOrder)}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="relative">
                      <div className={`h-3 rounded-full overflow-hidden ${
                        isBelowMinimum 
                          ? 'bg-amber-200 dark:bg-amber-900/50' 
                          : 'bg-green-200 dark:bg-green-900/50'
                      }`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            isBelowMinimum 
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                              : 'bg-gradient-to-r from-green-500 to-green-400'
                          }`}
                          style={{ width: `${Math.min((totalPrice / minimumOrder) * 100, 100)}%` }}
                        />
                      </div>
                      {/* Percentage label */}
                      <div className="flex justify-end mt-1">
                        <span className={`text-xs font-medium ${
                          isBelowMinimum 
                            ? 'text-amber-600 dark:text-amber-500' 
                            : 'text-green-600 dark:text-green-500'
                        }`}>
                          {Math.min(Math.round((totalPrice / minimumOrder) * 100), 100)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Remaining amount or success message */}
                    {isBelowMinimum ? (
                      <>
                        <p className="text-xs text-amber-700 dark:text-amber-500 text-center">
                          Faltam <strong>{formatPrice(remainingForMinimum)}</strong> para liberar o checkout
                        </p>
                        
                        <div className="border-t border-amber-200 dark:border-amber-800 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Store className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                              Prefere comprar em menor quantidade?
                            </p>
                          </div>
                          <Link 
                            to="/varejo" 
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900 rounded-lg transition-colors"
                          >
                            <Store className="w-4 h-4" />
                            Ir para loja Varejo
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-green-700 dark:text-green-500 text-center font-medium">
                        🎉 Você pode finalizar sua compra!
                      </p>
                    )}
                  </div>
                )}

                {/* Free shipping indicator */}
                {totalPrice >= 1500 && (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                      <p className="text-sm font-medium text-green-800 dark:text-green-400">
                        Parabéns! Você ganhou frete grátis 🎉
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Summary */}
                <div className="space-y-2 py-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal ({totalItems} {totalItems !== 1 ? 'itens' : 'item'})</span>
                    <span>{formatPrice(totalPrice, items[0]?.price.currencyCode || 'BRL')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Frete</span>
                    <span>{totalPrice >= 1500 ? 'Grátis' : 'Calculado no checkout'}</span>
                  </div>
                  {couponEligible && (
                    <div className="flex justify-between text-sm text-green-700 dark:text-green-500 font-bold uppercase tracking-tight">
                      <span className="flex items-center gap-1.5">
                        <BadgePercent className="w-4 h-4" />
                        Desconto ({appliedCoupon!.code} • {appliedCoupon!.discount_percent}%)
                      </span>
                      <span>- {formatPrice(discountAmount, items[0]?.price.currencyCode || 'BRL')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(finalPrice, items[0]?.price.currencyCode || 'BRL')}
                    </span>
                  </div>
                </div>

                {/* Coupon input - only for varejo Shopify checkout */}
                {!useWholesaleFlow && (
                  <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 space-y-2">
                    {couponEligible ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                            <Tag className="w-4 h-4 text-green-700 dark:text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-green-800 dark:text-green-400 truncate">{appliedCoupon!.code}</p>
                            <p className="text-xs text-muted-foreground">{appliedCoupon!.discount_percent}% de desconto aplicado</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => { removeCoupon(); toast.success("Cupom removido"); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Tem um cupom?</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                            placeholder="DIGITE O CÓDIGO"
                            className="flex-1 h-9 px-3 text-sm rounded-md border border-border bg-background uppercase placeholder:normal-case font-mono"
                            disabled={isValidatingCoupon}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleApplyCoupon}
                            disabled={isValidatingCoupon || !couponInput.trim()}
                            className="h-9"
                          >
                            {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full h-12 text-base font-semibold" 
                  size="lg"
                  variant={isBelowMinimum ? "outline" : "default"}
                  disabled={items.length === 0 || isLoading || isSyncing || isBelowMinimum}
                >
                  {isLoading || isSyncing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : isBelowMinimum ? (
                    <>
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Adicione mais itens
                    </>
                  ) : useWholesaleFlow ? (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Solicitar Pedido Atacado
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Finalizar Compra
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  {useWholesaleFlow ? "Nosso time entrará em contato em até 48h úteis 📋" : "Pagamento seguro via Shopify 🔒"}
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;