import { useCallback, useEffect, useState } from 'react';
import { ShopifyProduct } from '@/lib/shopify-api';

const STORAGE_KEY = 'recently-viewed-products';
const MAX_ITEMS = 10;

interface RecentlyViewedStore {
  products: ShopifyProduct[];
  lastUpdated: number;
}

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<ShopifyProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: RecentlyViewedStore = JSON.parse(stored);
        setRecentProducts(parsed.products || []);
      }
    } catch (error) {
      console.error('Error loading recently viewed products:', error);
    }
  }, []);

  // Add a product to recently viewed
  const addToRecentlyViewed = useCallback((product: ShopifyProduct) => {
    setRecentProducts(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.node.id !== product.node.id);
      // Add to beginning
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      
      // Save to localStorage
      try {
        const store: RecentlyViewedStore = {
          products: updated,
          lastUpdated: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (error) {
        console.error('Error saving recently viewed products:', error);
      }
      
      return updated;
    });
  }, []);

  // Get a product from cache by handle
  const getFromCache = useCallback((handle: string): ShopifyProduct | null => {
    const found = recentProducts.find(p => p.node.handle === handle);
    return found || null;
  }, [recentProducts]);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    setRecentProducts([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed products:', error);
    }
  }, []);

  return {
    recentProducts,
    addToRecentlyViewed,
    getFromCache,
    clearRecentlyViewed
  };
}

// Singleton cache for product data (in-memory)
const productCache = new Map<string, { product: ShopifyProduct; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedProduct(handle: string): ShopifyProduct | null {
  const cached = productCache.get(handle);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.product;
  }
  return null;
}

export function setCachedProduct(handle: string, product: ShopifyProduct): void {
  productCache.set(handle, { product, timestamp: Date.now() });
}

export function clearProductCache(): void {
  productCache.clear();
}
