import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export interface AppliedCoupon {
  code: string;
  discount_percent: number;
  description: string | null;
  applies_to: 'varejo' | 'atacado' | 'all';
}

interface CouponStore {
  applied: AppliedCoupon | null;
  isValidating: boolean;
  apply: (code: string, context: 'varejo' | 'atacado') => Promise<{ ok: boolean; message: string }>;
  remove: () => void;
}

export const useCouponStore = create<CouponStore>()(
  persist(
    (set) => ({
      applied: null,
      isValidating: false,
      apply: async (rawCode, context) => {
        const code = rawCode.trim().toUpperCase();
        if (!code) return { ok: false, message: 'Digite um cupom' };
        set({ isValidating: true });
        try {
          const { data, error } = await supabase
            .from('coupons')
            .select('code, discount_percent, description, applies_to, is_active')
            .eq('code', code)
            .eq('is_active', true)
            .maybeSingle();
          if (error || !data) {
            return { ok: false, message: 'Cupom inválido ou expirado' };
          }
          if (data.applies_to !== 'all' && data.applies_to !== context) {
            return { ok: false, message: `Este cupom é exclusivo para ${data.applies_to}` };
          }
          set({
            applied: {
              code: data.code,
              discount_percent: Number(data.discount_percent),
              description: data.description,
              applies_to: data.applies_to as 'varejo' | 'atacado' | 'all',
            },
          });
          return { ok: true, message: `Cupom aplicado: ${data.discount_percent}% de desconto` };
        } finally {
          set({ isValidating: false });
        }
      },
      remove: () => set({ applied: null }),
    }),
    {
      name: 'avance-coupon',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ applied: state.applied }),
    }
  )
);