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
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
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
                selectedOptions {
                  name
                  value
                }
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
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
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
            selectedOptions {
              name
              value
            }
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
    return data.data.products.edges;
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
    return data.data.products.edges;
  } catch (error) {
    console.error('Error fetching products by tag:', error);
    return [];
  }
}

export async function fetchProductsByType(type: 'ATACADO' | 'VAREJO', first: number = 100): Promise<ShopifyProduct[]> {
  try {
    // Fetch all products - type filtering is handled by collections if needed
    // For stores without ATACADO/VAREJO in product titles, return all products
    const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query: null });
    if (!data) return [];
    
    const allProducts: ShopifyProduct[] = data.data.products.edges;
    
    // Check if any product has type in title
    const hasTypeInTitles = allProducts.some(product => 
      product.node.title.toUpperCase().includes(type)
    );
    
    // If products have type labels, filter by type; otherwise return all
    if (hasTypeInTitles) {
      return allProducts.filter(product => 
        product.node.title.toUpperCase().includes(type)
      );
    }
    
    // Return all products when no type segmentation exists
    return allProducts;
  } catch (error) {
    console.error(`Error fetching ${type} products:`, error);
    return [];
  }
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct['node'] | null> {
  try {
    const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
    if (!data) return null;
    return data.data.productByHandle;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Export for cart store to use
export { getShopifyConfig, getStorefrontUrl };
