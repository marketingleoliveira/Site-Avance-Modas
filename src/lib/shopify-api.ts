import { toast } from "sonner";
import { 
  SHOPIFY_STOREFRONT_URL, 
  SHOPIFY_STOREFRONT_TOKEN 
} from "./shopify-config";

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

// Storefront API helper function
export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
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
    // Fetch all products and filter by title containing the type
    const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query: null });
    if (!data) return [];
    
    const allProducts: ShopifyProduct[] = data.data.products.edges;
    
    // Filter products that have the type in title OR don't have either type (shared products)
    return allProducts.filter(product => {
      const title = product.node.title.toUpperCase();
      const hasAtacado = title.includes('ATACADO');
      const hasVarejo = title.includes('VAREJO');
      
      // If product has neither type, show in both stores
      if (!hasAtacado && !hasVarejo) {
        return true;
      }
      
      // Otherwise, only show if matches the requested type
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
    return data.data.productByHandle;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
