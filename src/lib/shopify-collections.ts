import { storefrontApiRequest, ShopifyProduct } from "./shopify-api";

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  image: {
    url: string;
    altText: string | null;
  } | null;
  products: {
    edges: Array<ShopifyProduct>;
  };
}

const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!, $query: String) {
    collections(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          image {
            url
            altText
          }
          products(first: 50) {
            edges {
              node {
                id
                title
                description
                handle
                priceRange {
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
      }
    }
  }
`;

export async function fetchCollections(first: number = 20, query?: string): Promise<ShopifyCollection[]> {
  try {
    const data = await storefrontApiRequest(COLLECTIONS_QUERY, { first, query });
    if (!data) return [];
    return data.data.collections.edges.map((edge: { node: ShopifyCollection }) => edge.node);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function fetchCollectionsByType(type: 'ATACADO' | 'VAREJO'): Promise<ShopifyCollection[]> {
  try {
    const allCollections = await fetchCollections(50);
    
    // Check if any collection has type in title
    const hasTypeInTitles = allCollections.some(collection => 
      collection.title.toUpperCase().includes(type)
    );
    
    // If collections have type labels, filter by type; otherwise return all
    if (hasTypeInTitles) {
      return allCollections.filter(collection => 
        collection.title.toUpperCase().includes(type)
      );
    }
    
    // Return all collections when no type segmentation exists
    return allCollections;
  } catch (error) {
    console.error(`Error fetching ${type} collections:`, error);
    return [];
  }
}

export function getProductsFromCollections(collections: ShopifyCollection[]): ShopifyProduct[] {
  const productsMap = new Map<string, ShopifyProduct>();
  
  collections.forEach(collection => {
    collection.products.edges.forEach(product => {
      if (!productsMap.has(product.node.id)) {
        productsMap.set(product.node.id, product);
      }
    });
  });
  
  return Array.from(productsMap.values());
}
