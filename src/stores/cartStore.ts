import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, storefrontApiRequest } from '@/lib/shopify-api';

export interface CartItem {
  lineId: string | null; // Shopify cart line ID, null until synced
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: (options?: { validateMinimum?: boolean; minimumOrder?: number; isAtacado?: boolean }) => string | null;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// GraphQL Mutations
const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) {
      id
      totalQuantity
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Helper functions
function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: Array<{ field: string[] | null; message: string }>): boolean {
  return userErrors.some(e => 
    e.message.toLowerCase().includes('cart not found') || 
    e.message.toLowerCase().includes('does not exist')
  );
}

async function createShopifyCart(item: Omit<CartItem, 'lineId'>): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });

  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error('Cart creation failed:', data.data.cartCreate.userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;

  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

async function addLineToShopifyCart(cartId: string, item: Omit<CartItem, 'lineId'>): Promise<{ success: boolean; lineId?: string; checkoutUrl?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });

  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Add line failed:', userErrors);
    return { success: false };
  }

  const cart = data?.data?.cartLinesAdd?.cart;
  const lines = cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => 
    l.node.merchandise.id === item.variantId
  );
  
  return { 
    success: true, 
    lineId: newLine?.node?.id,
    checkoutUrl: cart?.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : undefined
  };
}

async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Update line failed:', userErrors);
    return { success: false };
  }
  return { success: true };
}

async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Remove line failed:', userErrors);
    return { success: false };
  }
  return { success: true };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,

      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find(i => i.variantId === item.variantId);
        
        // Check if this is an atacado product (skip Shopify cart for wholesale)
        const isAtacadoProduct = item.product.node.title?.toUpperCase().includes('ATACADO');
        
        if (isAtacadoProduct) {
          // For atacado: store locally only, no Shopify cart
          if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            set({ items: items.map(i => i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i) });
          } else {
            set({ items: [...items, { ...item, lineId: 'local-' + Date.now() }] });
          }
          return;
        }
        
        set({ isLoading: true });
        try {
          if (!cartId) {
            // Create new cart with first item
            const result = await createShopifyCart(item);
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [{ ...item, lineId: result.lineId }]
              });
            }
          } else if (existingItem) {
            // Update existing item quantity
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) {
              console.error('Cannot update quantity for item without lineId:', existingItem);
              return;
            }
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const currentItems = get().items;
              set({ items: currentItems.map(i => i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i) });
            } else if (result.cartNotFound) {
              clearCart();
              // Retry with new cart
              const newResult = await createShopifyCart(item);
              if (newResult) {
                set({
                  cartId: newResult.cartId,
                  checkoutUrl: newResult.checkoutUrl,
                  items: [{ ...item, lineId: newResult.lineId }]
                });
              }
            }
          } else {
            // Add new item to existing cart
            const result = await addLineToShopifyCart(cartId, item);
            if (result.success) {
              const currentItems = get().items;
              set({ 
                items: [...currentItems, { ...item, lineId: result.lineId ?? null }],
                checkoutUrl: result.checkoutUrl || get().checkoutUrl
              });
            } else if (result.cartNotFound) {
              clearCart();
              // Retry with new cart
              const newResult = await createShopifyCart(item);
              if (newResult) {
                set({
                  cartId: newResult.cartId,
                  checkoutUrl: newResult.checkoutUrl,
                  items: [{ ...item, lineId: newResult.lineId }]
                });
              }
            }
          }
        } catch (error) {
          console.error('Failed to add item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }
        
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item) return;
        
        // Local-only item (atacado) - update locally
        if (item.lineId?.startsWith('local-')) {
          set({ items: items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
          return;
        }
        
        if (!item.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({ items: currentItems.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error('Failed to update quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        
        // Local-only item (atacado) - remove locally
        if (!item?.lineId || item.lineId.startsWith('local-') || !cartId) {
          const newItems = items.filter(i => i.variantId !== variantId);
          set({ items: newItems });
          return;
        }

        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter(i => i.variantId !== variantId);
            newItems.length === 0 ? clearCart() : set({ items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error('Failed to remove item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      
      // Validate minimum order before returning checkout URL for atacado
      getCheckoutUrl: (options) => {
        const { validateMinimum = false, minimumOrder = 0, isAtacado = false } = options || {};
        const totalPrice = get().getTotalPrice();
        
        // Block checkout URL for atacado if below minimum order
        if (validateMinimum && isAtacado && totalPrice < minimumOrder) {
          console.warn(`Checkout blocked: Total ${totalPrice} is below minimum ${minimumOrder} for atacado`);
          return null;
        }
        
        return get().checkoutUrl;
      },

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;

        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
          if (!data) return;
          
          const cart = data?.data?.cart;
          if (!cart || cart.totalQuantity === 0) {
            clearCart();
          }
        } catch (error) {
          console.error('Failed to sync cart with Shopify:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
      },
    }),
    {
      name: 'avance-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items, 
        cartId: state.cartId, 
        checkoutUrl: state.checkoutUrl 
      }),
    }
  )
);