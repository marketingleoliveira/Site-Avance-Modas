import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type StoreType = 'atacado' | 'varejo' | null;

interface StoreContextState {
  storeType: StoreType;
  setStoreType: (type: StoreType) => void;
  isAtacado: () => boolean;
  isVarejo: () => boolean;
}

export const useStoreContext = create<StoreContextState>()(
  persist(
    (set, get) => ({
      storeType: null,
      
      setStoreType: (type: StoreType) => {
        set({ storeType: type });
      },
      
      isAtacado: () => get().storeType === 'atacado',
      
      isVarejo: () => get().storeType === 'varejo',
    }),
    {
      name: 'avance-store-context',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
