import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-md w-[95vw] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        {/* Top success banner */}
        <div className="relative bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-6 pt-8 pb-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200 ring-4 ring-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-emerald-700 tracking-tight">
            Produto adicionado ao seu carrinho!
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            O que você deseja fazer a seguir?
          </p>
        </div>

        {/* Product preview */}
        {(productTitle || productImage) && (
          <div className="flex items-center gap-3 border-y bg-muted/30 px-5 py-3">
            {productImage && (
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border bg-white">
                <img
                  src={productImage}
                  alt={productTitle ?? "Produto"}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide">
                {productTitle}
              </p>
              <p className="text-[11px] text-muted-foreground">Quantidade: {quantity}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-5">
          <Button
            variant="outline"
            className="flex-1 h-11 text-xs sm:text-sm font-semibold uppercase tracking-wide gap-2"
            onClick={onContinueShopping}
          >
            <ShoppingBag className="h-4 w-4" />
            Continuar comprando
          </Button>
          <Button
            className="flex-1 h-11 text-xs sm:text-sm font-bold uppercase tracking-wide gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
            onClick={onCheckout}
          >
            Finalizar compra
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddedToCartDialog;