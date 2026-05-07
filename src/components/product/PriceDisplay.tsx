import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: string | number;
  compareAtAmount?: string | number | null;
  currencyCode?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  className?: string;
}

const formatBRL = (n: number, currency = "BRL") =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(n);

/**
 * Mostra preço com:
 * - "De: R$ X" riscado (quando há preço original)
 * - "Por: R$ Y no Pix" (3% de desconto sobre o total)
 * - "Nx de R$ Z" (até 4x, parcela mínima R$10)
 */
const PriceDisplay = ({
  amount,
  compareAtAmount,
  currencyCode = "BRL",
  size = "md",
  align = "left",
  className,
}: PriceDisplayProps) => {
  const price = typeof amount === "string" ? parseFloat(amount) : amount;
  const compareAt = compareAtAmount
    ? typeof compareAtAmount === "string"
      ? parseFloat(compareAtAmount)
      : compareAtAmount
    : null;

  if (!price || isNaN(price)) return null;

  const hasDiscount = compareAt && compareAt > price;
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
    sm: { from: "text-[10px]", main: "text-sm", sub: "text-[10px]" },
    md: { from: "text-xs", main: "text-base sm:text-lg", sub: "text-xs" },
    lg: { from: "text-sm", main: "text-2xl sm:text-3xl", sub: "text-sm" },
  }[size];

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {hasDiscount && (
        <span className={cn("text-muted-foreground line-through", sizes.from)}>
          De: {formatBRL(compareAt!, currencyCode)}
        </span>
      )}
      <span className={cn("font-black text-accent tracking-tight flex items-center gap-1", sizes.main)}>
        <span className="text-accent" aria-hidden>◆</span>
        Por: {formatBRL(pixPrice, currencyCode)} <span className="font-bold">no Pix</span>
      </span>
      <span className={cn("text-muted-foreground", sizes.sub)}>
        {installments}x de {formatBRL(installmentValue, currencyCode)} sem juros
      </span>
    </div>
  );
};

export default PriceDisplay;