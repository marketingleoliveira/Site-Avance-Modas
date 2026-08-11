import { toast } from "sonner";
import { getSiteSetting } from "./site-settings";

// Default config (fallback - empty to force configuration)
const DEFAULT_CONFIG = {
  store_domain: '',
  storefront_token: '',
  api_version: '2025-07'
};

// Cache for the config
let cachedConfig: typeof DEFAULT_CONFIG | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds - reduced for faster config updates

async function getShopifyConfig() {
  if (cachedConfig && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedConfig;
  }
  
  try {
    const config = await getSiteSetting<typeof DEFAULT_CONFIG>('shopify_config');
    if (config && config.store_domain && config.storefront_token) {
      cachedConfig = config;
      cacheTimestamp = Date.now();
      return config;
    }
  } catch (error) {
    console.error('Error loading Shopify config:', error);
  }
  
  return DEFAULT_CONFIG;
}

// Function to invalidate the config cache (call after saving new config)
export function invalidateShopifyConfigCache() {
  cachedConfig = null;
  cacheTimestamp = 0;
}

function getStorefrontUrl(config: typeof DEFAULT_CONFIG): string {
  return `https://${config.store_domain}/api/${config.api_version}/graphql.json`;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    tags: string[];
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
      maxVariantPrice?: {
        amount: string;
        currencyCode: string;
      };
    };
    compareAtPriceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          compareAtPrice: {
            amount: string;
            currencyCode: string;
          } | null;
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
          weight?: number;
          weightUnit?: 'GRAMS' | 'KILOGRAMS' | 'OUNCES' | 'POUNDS';
          sku?: string | null;
          inventoryQuantity: number;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

// Storefront API helper function - now async to get config
export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const config = await getShopifyConfig();
  const url = getStorefrontUrl(config);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefront_token
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    // Always request fresh data from Shopify so inventory/availability
    // is consistent across devices and sessions (avoids stale CDN/browser caches).
    cache: 'no-store',
  });

  if (response.status === 402) {
    toast.error("Shopify: Pagamento necessário", {
      description: "O acesso à API do Shopify requer um plano de faturamento ativo.",
    });
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 30) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                inventoryItem {
                  inventoryLevels(first: 1) {
                    edges {
                      node {
                        quantities(names: ["available"]) {
                          name
                          quantity
                        }
                      }
                    }
                  }
                }
                selectedOptions {
                  name
                  value
                }
                weight
                weightUnit
                sku
                quantityAvailable
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      maxVariantPrice {
        amount
        currencyCode
      }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 50) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            quantityAvailable
            inventoryItem {
              inventoryLevels(first: 1) {
                edges {
                  node {
                    quantities(names: ["available"]) {
                      name
                      quantity
                    }
                  }
                }
              }
            }
            selectedOptions {
              name
              value
            }
            weight
            weightUnit
                sku
                quantityAvailable
              }
            }
          }
      options {
        name
        values
      }
    }
  }
`;

export async function fetchProducts(first: number = 20, query?: string): Promise<ShopifyProduct[]> {
  try {
    const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query });
    if (!data) return [];
    const products: ShopifyProduct[] = data.data.products.edges;
    // Map quantityAvailable to inventoryQuantity
    products.forEach(p => {
      p.node.variants.edges.forEach(v => {
        (v.node as any).inventoryQuantity = (v.node as any).quantityAvailable || 0;
      });
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductsByTag(tag: string, first: number = 50): Promise<ShopifyProduct[]> {
  try {
    const query = `tag:${tag}`;
    const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query });
    if (!data) return [];
    const products: ShopifyProduct[] = data.data.products.edges;
    products.forEach(p => {
      p.node.variants.edges.forEach(v => {
        (v.node as any).inventoryQuantity = (v.node as any).quantityAvailable || 0;
      });
    });
    return products;
  } catch (error) {
    console.error('Error fetching products by tag:', error);
    return [];
  }
}

export async function fetchProductsByType(type: 'ATACADO' | 'VAREJO', first: number = 100): Promise<ShopifyProduct[]> {
  try {
    // Fetch all products and filter by title containing the type
    const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query: null });
    if (!data) return [];
    
    const allProducts: ShopifyProduct[] = data.data.products.edges;
    
    // Filter products that have the exact type in title (ATACADO or VAREJO)
    // Products must explicitly contain ATACADO or VAREJO - no shared products
    return allProducts.filter(product => {
      const title = product.node.title.toUpperCase();
      return title.includes(type);
    });
  } catch (error) {
    console.error(`Error fetching ${type} products:`, error);
    return [];
  }
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct['node'] | null> {
  try {
    const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
    if (!data) return null;
    const product = data.data.productByHandle;
    if (product) {
      product.variants.edges.forEach((v: any) => {
        v.node.inventoryQuantity = v.node.quantityAvailable || 0;
      });
    }
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Paginated fetch — returns one page plus cursor info for "load more" UIs
const STOREFRONT_QUERY_PAGED = `
  query GetProductsPaged($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      pageInfo { hasNextPage endCursor }
      edges {
        cursor
        node {
          id
          title
          description
          handle
          tags
          priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
          variants(first: 1) {
            edges { node {
              id title
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              availableForSale
              quantityAvailable
              inventoryItem {
                inventoryLevels(first: 1) {
                  edges {
                    node {
                      quantities(names: ["available"]) {
                        name
                        quantity
                      }
                    }
                  }
                }
              }
              selectedOptions { name value }
              quantityAvailable
            } }
          }
          options { name values }
        }
      }
    }
  }
`;

export interface ProductsPage {
  edges: ShopifyProduct[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export async function fetchProductsPaged(
  first: number = 20,
  after: string | null = null,
  query?: string
): Promise<ProductsPage> {
  try {
    const data = await storefrontApiRequest(STOREFRONT_QUERY_PAGED, { first, after, query: query || null });
    if (!data) return { edges: [], hasNextPage: false, endCursor: null };
    const products = data.data.products;
    const edges = products.edges as ShopifyProduct[];
    edges.forEach(p => {
      p.node.variants.edges.forEach(v => {
        (v.node as any).inventoryQuantity = (v.node as any).quantityAvailable || 0;
      });
    });
    return {
      edges,
      hasNextPage: !!products.pageInfo?.hasNextPage,
      endCursor: products.pageInfo?.endCursor ?? null,
    };
  } catch (error) {
    console.error('Error fetching paged products:', error);
    return { edges: [], hasNextPage: false, endCursor: null };
  }
}

// Export for cart store to use
export { getShopifyConfig, getStorefrontUrl };
