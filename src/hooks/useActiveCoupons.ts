import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveCoupon {
  code: string;
  discount_percent: number;
  description: string | null;
  applies_to: 'varejo' | 'atacado' | 'all';
  product_handles: string[];
}

let cache: { data: ActiveCoupon[]; ts: number } | null = null;
const TTL = 60_000; // 1 min

export function useActiveCoupons(context: 'varejo' | 'atacado') {
  const [coupons, setCoupons] = useState<ActiveCoupon[]>(cache?.data ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (cache && Date.now() - cache.ts < TTL) {
        setCoupons(cache.data);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('coupons')
        .select('code, discount_percent, description, applies_to, product_handles')
        .eq('is_active', true);
      if (!mounted) return;
      const list = (data ?? []) as ActiveCoupon[];
      cache = { data: list, ts: Date.now() };
      setCoupons(list);
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Filter by context
  const contextCoupons = coupons.filter(
    (c) => c.applies_to === 'all' || c.applies_to === context
  );

  /**
   * Returns the best (highest %) coupon that applies to a given product handle,
   * or null if no coupon applies.
   */
  const getCouponForProduct = (handle?: string): ActiveCoupon | null => {
    if (!handle) return null;
    const eligible = contextCoupons.filter((c) => {
      if (!c.product_handles || c.product_handles.length === 0) return true; // applies to all
      return c.product_handles.includes(handle);
    });
    if (eligible.length === 0) return null;
    return eligible.reduce((best, cur) =>
      cur.discount_percent > best.discount_percent ? cur : best
    );
  };

  return { coupons: contextCoupons, loading, getCouponForProduct };
}