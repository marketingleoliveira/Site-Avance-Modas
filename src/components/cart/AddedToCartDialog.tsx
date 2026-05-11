import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";

interface AddedToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle?: string;
  productImage?: string;
  quantity?: number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

/**
 * Modal de confirmação após adicionar produto ao carrinho (Varejo).
 * Totalmente responsivo. Mostra o produto adicionado e oferece duas ações:
 * "Continuar comprando" ou "Finalizar compra".
 */
const AddedToCartDialog = ({
  open,
  onOpenChange,
  productTitle,
  productImage,
  quantity = 1,
  onContinueShopping,
  onCheckout,
}: AddedToCartDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:w-full p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>Produto adicionado ao carrinho</DialogTitle>
          <DialogDescription>Escolha entre continuar comprando ou finalizar a compra.</DialogDescription>
        </VisuallyHidden>
        {/* Top success banner */}
        <div className="relative bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200 ring-4 ring-emerald-100">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="px-2 sm:px-6 text-sm sm:text-base font-bold text-emerald-700 tracking-tight leading-snug">
            Produto adicionado ao seu carrinho!
          </h2>
          <p className="mt-1 text-[11px] sm:text-sm text-muted-foreground leading-snug">
            O que você deseja fazer a seguir?
          </p>
        </div>

        {/* Product preview */}
        {(productTitle || productImage) && (
          <div className="flex items-center gap-3 border-y bg-muted/30 px-4 sm:px-5 py-3">
            {productImage && (
              <div className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-lg border bg-white">
                <img
                  src={productImage}
                  alt={productTitle ?? "Produto"}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[11px] sm:text-sm font-semibold text-foreground uppercase tracking-wide leading-snug">
                {productTitle}
              </p>
              <p className="mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground">Quantidade: {quantity}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-3 sm:p-5">
          <Button
            variant="outline"
            className="flex-1 h-11 text-[10px] sm:text-xs font-semibold uppercase tracking-wide gap-1.5 sm:gap-2 px-2 whitespace-nowrap"
            onClick={onContinueShopping}
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Continuar comprando</span>
          </Button>
          <Button
            className="flex-1 h-11 text-[10px] sm:text-xs font-bold uppercase tracking-wide gap-1.5 sm:gap-2 px-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
            onClick={onCheckout}
          >
            <span className="truncate">Finalizar compra</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddedToCartDialog;