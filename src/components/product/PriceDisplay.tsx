import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PriceDisplayProps {
  amount: string | number;
  compareAtAmount?: string | number | null;
  currencyCode?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  className?: string;
  /**
   * Quando true, exibe o selo "Desconto no Pix 3%" acima do preço e aplica
   * o desconto Pix na linha "ou R$ X no Pix". Use somente em Varejo.
   */
  showPixBadge?: boolean;
}

const formatBRL = (n: number, currency = "BRL") =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(n);

/** Logotipo oficial do Pix (BCB) — SVG inline, sem dependências externas. */
const PixLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Pix"
    role="img"
  >
    <path
      fill="#32BCAD"
      d="M392.6 311.6 311.7 392.5c-30.7 30.7-80.6 30.7-111.4 0L119.3 311.6c-7.1-7.1-7.1-18.7 0-25.8 7.1-7.1 18.7-7.1 25.8 0l80.9 80.9c19.4 19.4 50.9 19.4 70.3 0l80.9-80.9c7.1-7.1 18.7-7.1 25.8 0 7.1 7.1 7.1 18.7 0 25.8zM119.3 200.4l80.9-80.9c30.7-30.7 80.6-30.7 111.4 0l80.9 80.9c7.1 7.1 7.1 18.7 0 25.8-7.1 7.1-18.7 7.1-25.8 0l-80.9-80.9c-19.4-19.4-50.9-19.4-70.3 0l-80.9 80.9c-7.1 7.1-18.7 7.1-25.8 0-7.1-7.1-7.1-18.7 0-25.8z"
    />
    <path
      fill="#32BCAD"
      d="M256 213.3c11.3 0 22.5 4.3 31.1 12.9L329 268.1l-41.9 41.9c-17.2 17.2-45 17.2-62.2 0L183 268.1l41.9-41.9c8.6-8.6 19.8-12.9 31.1-12.9z"
    />
  </svg>
);

/**
 * Mostra preço com:
 * - "De: R$ X" riscado (quando há preço original) + "Economize N%"
 * - "R$ Y" em destaque (preço cheio)
 * - "ou R$ Z no Pix [logo Pix] (3% off)"
 * - "até Nx de R$ W sem juros" (até 4x, parcela mínima R$10)
 */
const PriceDisplay = ({
  amount,
  compareAtAmount,
  currencyCode = "BRL",
  size = "md",
  align = "left",
  className,
  showPixBadge = false,
}: PriceDisplayProps) => {
  const price = typeof amount === "string" ? parseFloat(amount) : amount;
  const compareAt = compareAtAmount
    ? typeof compareAtAmount === "string"
      ? parseFloat(compareAtAmount)
      : compareAtAmount
    : null;

  if (!price || isNaN(price)) return null;

  const hasDiscount = compareAt && compareAt > price;
  const discountPct = hasDiscount
    ? Math.round(((compareAt! - price) / compareAt!) * 100)
    : 0;
  const pixPrice = price * 0.97; // 3% off no Pix

  // Até 4x sem juros, parcela mínima R$10
  const maxInstallments = 4;
  const minInstallment = 10;
  let installments = maxInstallments;
  while (installments > 1 && price / installments < minInstallment) {
    installments -= 1;
  }
  const installmentValue = price / installments;

  const sizes = {
    sm: { from: "text-[10px]", main: "text-base", pix: "text-[10px]", sub: "text-[10px]", logo: "h-3 w-3" },
    md: { from: "text-xs", main: "text-lg sm:text-xl", pix: "text-[11px] sm:text-xs", sub: "text-[10px] sm:text-xs", logo: "h-3.5 w-3.5 sm:h-4 sm:w-4" },
    lg: { from: "text-sm", main: "text-3xl sm:text-4xl", pix: "text-sm", sub: "text-xs sm:text-sm", logo: "h-5 w-5" },
  }[size];

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {showPixBadge && (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold uppercase tracking-wide text-emerald-700 shadow-sm cursor-help",
                  size === "lg" ? "text-[11px]" : "text-[9px] sm:text-[10px]"
                )}
                aria-label="Desconto no Pix 3%"
              >
                <PixLogo className={size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"} />
                Desconto no Pix 3%
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs">
              Pagando via Pix você ganha <strong>3% de desconto</strong> sobre o
              valor total da compra. Aplicado automaticamente no checkout.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {hasDiscount && (
        <span className={cn("text-muted-foreground line-through leading-none", sizes.from)}>
          {formatBRL(compareAt!, currencyCode)}
        </span>
      )}

      <span className={cn("font-black text-accent tracking-tight leading-none", sizes.main)}>
        {formatBRL(price, currencyCode)}
      </span>

      {hasDiscount && (
        <span className={cn("font-semibold text-emerald-600 leading-none", sizes.sub)}>
          Economize {discountPct}%
        </span>
      )}

      <span
        className={cn(
          "inline-flex items-center gap-1 font-semibold text-foreground leading-none flex-wrap",
          align === "center" ? "justify-center" : "justify-start",
          sizes.pix
        )}
      >
        {showPixBadge ? "ou" : "à vista"} {formatBRL(pixPrice, currencyCode)} no
        <PixLogo className={sizes.logo} />
        {showPixBadge && (
          <span className="text-emerald-600 font-bold">(3% off)</span>
        )}
      </span>

      <span className={cn("text-muted-foreground leading-none", sizes.sub)}>
        até {installments}x de {formatBRL(installmentValue, currencyCode)} sem juros
      </span>
    </div>
  );
};

export default PriceDisplay;