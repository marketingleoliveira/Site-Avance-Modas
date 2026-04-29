import { TicketPercent } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ActiveCoupon } from "@/hooks/useActiveCoupons";

interface CouponBadgeProps {
  coupon: ActiveCoupon;
  variant?: "ribbon" | "inline" | "compact";
}

/**
 * Visual indicator that a product accepts an active coupon.
 * Always informs that coupons are NOT cumulative.
 */
const CouponBadge = ({ coupon, variant = "ribbon" }: CouponBadgeProps) => {
  const tooltipText = `Cupom ${coupon.code}: ${coupon.discount_percent}% OFF aplicável neste produto. Cupons não são acumulativos com outras promoções ou cupons.`;

  if (variant === "compact") {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-sm cursor-help"
              onClick={(e) => e.preventDefault()}
            >
              <TicketPercent className="w-3 h-3" />
              CUPOM {coupon.discount_percent}%
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px] text-xs">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "inline") {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold cursor-help"
              onClick={(e) => e.preventDefault()}
            >
              <TicketPercent className="w-4 h-4" />
              <span>
                Cupom <strong>{coupon.code}</strong> · {coupon.discount_percent}% OFF
              </span>
              <span className="ml-auto text-[10px] font-normal text-emerald-700/80">
                não acumulativo
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[260px] text-xs">
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // ribbon (default) — for product cards
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="absolute right-2 bottom-2 z-20 pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide shadow-lg ring-2 ring-white/60 cursor-help animate-[pulse_2.5s_ease-in-out_infinite]">
              <TicketPercent className="w-3 h-3" />
              <span>CUPOM {coupon.discount_percent}%</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-xs">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CouponBadge;