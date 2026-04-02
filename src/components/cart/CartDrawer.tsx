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
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2, AlertTriangle, CheckCircle, Package, Store, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { useStoreContext } from "@/stores/storeContextStore";
import { useAtacadoSettings } from "@/hooks/useAtacadoSettings";
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
  
  // Only apply minimum order validation for atacado when settings are loaded
  const minimumOrder = atacadoSettings.minimum_order;
  const isBelowMinimum = isAtacado && !settingsLoading && totalPrice < minimumOrder;
  const remainingForMinimum = Math.max(0, minimumOrder - totalPrice);

  // Sync cart with Shopify when drawer opens
  useEffect(() => {
    if (isOpen) {
      syncCart();
    }
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    // Block checkout if atacado and below minimum order (only if settings loaded)
    if (isAtacado && !settingsLoading && totalPrice < minimumOrder) {
      toast.error("Pedido mínimo não atingido", {
        description: `No atacado, o pedido mínimo é de ${formatPrice(minimumOrder)}. Faltam ${formatPrice(remainingForMinimum)} para finalizar. Considere nossa loja Varejo para compras menores.`,
      });
      return;
    }
    
    // Use validated checkout URL with minimum order check
    const checkoutUrl = getCheckoutUrl({
      validateMinimum: true,
      minimumOrder: minimumOrder,
      isAtacado: isAtacado
    });
    
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
      setIsOpen(false);
      toast.success("Checkout aberto!", {
        description: "Complete seu pedido na nova aba.",
      });
    } else {
      // Double-check: if atacado and below minimum, show specific error
      if (isAtacado && totalPrice < minimumOrder) {
        toast.error("Checkout bloqueado", {
          description: `Valor mínimo de ${formatPrice(minimumOrder)} não atingido para atacado.`,
        });
      } else {
        toast.error("Erro ao abrir checkout", {
          description: "Tente adicionar um produto novamente.",
        });
      }
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
        <button className="p-2 hover:bg-secondary rounded-full transition-colors relative">
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
                    className="flex gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="w-20 h-20 bg-card rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                      {item.product.node.images?.edges?.[0]?.node && (
                        <img
                          src={item.product.node.images.edges[0].node.url}
                          alt={item.product.node.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium truncate text-sm leading-tight">{item.product.node.title}</h4>
                        {item.selectedOptions.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.selectedOptions.map(option => option.value).join(' • ')}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <p className="font-bold text-primary text-sm sm:text-base flex-shrink-0">
                          {formatPrice(parseFloat(item.price.amount) * item.quantity, item.price.currencyCode)}
                        </p>
                        
                        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 sm:h-7 sm:w-7 rounded-full"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={isLoading}
                          >
                            <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                          <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 sm:h-7 sm:w-7 rounded-full"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={isLoading}
                          >
                            <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 sm:h-7 sm:w-7 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 ml-0.5 sm:ml-1"
                            onClick={() => removeItem(item.variantId)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex-shrink-0 space-y-4 pt-4 border-t bg-background mt-4">
                {/* Minimum order progress indicator for atacado - only show when settings loaded */}
                {isAtacado && items.length > 0 && !settingsLoading && (
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
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(totalPrice, items[0]?.price.currencyCode || 'BRL')}
                    </span>
                  </div>
                </div>
                
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
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Finalizar Compra
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Pagamento seguro via Shopify 🔒
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