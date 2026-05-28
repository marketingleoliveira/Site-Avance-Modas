import {
  fetchProductsByType,
  storefrontApiRequest,
  type ShopifyProduct,
} from "./shopify-api";
import {
  DEFAULT_ITEM_WEIGHT_KG,
  calculateShipping,
  toKilograms,
  type ShippingQuote,
} from "./shipping-loggi";

export interface QuoteCartItem {
  productTitle: string; // título ATACADO original
  variantId: string;
  selectedOptions: Array<{ name: string; value: string }>;
  quantity: number;
  weight?: number;
  weightUnit?: string;
}

export interface QuoteAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
}

export interface RealShippingQuote extends ShippingQuote {
  source: "shopify" | "estimated" | "mixed";
  matchedItems: number;
  totalItems: number;
  serviceName?: string;
}

// ----- Cache dos produtos VAREJO (1 fetch por sessão) -----
let varejoCache: ShopifyProduct[] | null = null;
let varejoCachePromise: Promise<ShopifyProduct[]> | null = null;

async function getVarejoProducts(): Promise<ShopifyProduct[]> {
  if (varejoCache) return varejoCache;
  if (!varejoCachePromise) {
    varejoCachePromise = fetchProductsByType("VAREJO", 250).then((list) => {
      varejoCache = list;
      return list;
    });
  }
  return varejoCachePromise;
}

const normalize = (s: string) =>
  (s || "")
    .toUpperCase()
    .replace(/ATACADO/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Tenta encontrar a variante VAREJO equivalente a uma variante ATACADO,
 * comparando título sem "ATACADO" e selectedOptions (tamanho/cor).
 */
function findVarejoVariantId(
  item: QuoteCartItem,
  varejoList: ShopifyProduct[]
): string | null {
  const target = normalize(item.productTitle);
  const product = varejoList.find((p) => normalize(p.node.title) === target);
  if (!product) return null;

  const optsMatch = (a: Array<{ name: string; value: string }>) =>
    item.selectedOptions.every((opt) =>
      a.some(
        (x) =>
          x.name.toUpperCase() === opt.name.toUpperCase() &&
          x.value.toUpperCase() === opt.value.toUpperCase()
      )
    );

  const variant = product.node.variants.edges.find((v) =>
    optsMatch(v.node.selectedOptions)
  );
  return variant?.node.id ?? null;
}

const CART_CREATE_WITH_DELIVERY = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        deliveryGroups(first: 10) {
          edges {
            node {
              deliveryOptions {
                handle
                title
                estimatedCost { amount currencyCode }
                deliveryMethodType
                description
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

async function fetchShopifyDeliveryQuote(
  variantLines: Array<{ merchandiseId: string; quantity: number }>,
  address: QuoteAddress
): Promise<{ cost: number; title: string } | null> {
  if (variantLines.length === 0) return null;

  const input = {
    lines: variantLines,
    buyerIdentity: {
      countryCode: "BR",
      deliveryAddressPreferences: [
        {
          deliveryAddress: {
            address1: `${address.street}, ${address.number}`,
            address2: address.complement || "",
            city: address.city,
            country: "Brazil",
            province: address.state.toUpperCase(),
            zip: address.cep.replace(/\D/g, ""),
            firstName: "Cotacao",
            lastName: "Atacado",
          },
        },
      ],
    },
  };

  try {
    const data = await storefrontApiRequest(CART_CREATE_WITH_DELIVERY, { input });
    if (!data) return null;

    const result = data?.data?.cartCreate;
    if (!result?.cart) {
      if (result?.userErrors?.length) {
        console.warn("[shipping-quote] cartCreate userErrors", result.userErrors);
      }
      return null;
    }

    const groups = result.cart.deliveryGroups?.edges || [];
    let cheapest: { cost: number; title: string } | null = null;

    for (const g of groups) {
      for (const opt of g.node?.deliveryOptions || []) {
        const amount = parseFloat(opt.estimatedCost?.amount || "0");
        if (!Number.isFinite(amount)) continue;
        if (!cheapest || amount < cheapest.cost) {
          cheapest = { cost: amount, title: opt.title || "Frete" };
        }
      }
    }

    return cheapest;
  } catch (err) {
    console.error("[shipping-quote] erro ao cotar com Shopify:", err);
    return null;
  }
}

/**
 * Cota o frete REAL via Shopify (igual ao checkout) mapeando cada item
 * ATACADO para sua variante VAREJO equivalente. Itens sem equivalente
 * caem na tabela de peso local (300g padrão).
 */
export async function getRealShippingQuote(
  items: QuoteCartItem[],
  address: QuoteAddress
): Promise<RealShippingQuote | null> {
  if (items.length === 0) return null;

  const varejoList = await getVarejoProducts();

  const matched: Array<{ merchandiseId: string; quantity: number }> = [];
  const unmatched: QuoteCartItem[] = [];

  for (const item of items) {
    const varejoVariantId = findVarejoVariantId(item, varejoList);
    if (varejoVariantId) {
      matched.push({ merchandiseId: varejoVariantId, quantity: item.quantity });
    } else {
      unmatched.push(item);
    }
  }

  const shopifyQuote = await fetchShopifyDeliveryQuote(matched, address);

  // Fallback estimado para itens não mapeados (peso default).
  let estimatedExtra = 0;
  let estimatedWeightKg = 0;
  if (unmatched.length > 0) {
    for (const it of unmatched) {
      const kg =
        toKilograms(it.weight, it.weightUnit) || DEFAULT_ITEM_WEIGHT_KG;
      estimatedWeightKg += kg * it.quantity;
    }
    const estQuote = calculateShipping(address.cep, estimatedWeightKg);
    estimatedExtra = estQuote?.cost ?? 0;
  }

  if (!shopifyQuote && matched.length === 0) {
    // Tudo desmapeado — usa cálculo 100% estimado.
    const totalWeight = items.reduce((sum, it) => {
      const kg =
        toKilograms(it.weight, it.weightUnit) || DEFAULT_ITEM_WEIGHT_KG;
      return sum + kg * it.quantity;
    }, 0);
    const fallback = calculateShipping(address.cep, totalWeight);
    if (!fallback) return null;
    return {
      ...fallback,
      source: "estimated",
      matchedItems: 0,
      totalItems: items.length,
    };
  }

  if (!shopifyQuote) return null;

  const totalWeightKg = items.reduce((sum, it) => {
    const kg = toKilograms(it.weight, it.weightUnit) || DEFAULT_ITEM_WEIGHT_KG;
    return sum + kg * it.quantity;
  }, 0);

  const source: RealShippingQuote["source"] =
    unmatched.length === 0 ? "shopify" : "mixed";

  return {
    region: "Cotação Loggi (Shopify)",
    cost: Math.round((shopifyQuote.cost + estimatedExtra) * 100) / 100,
    estimatedDays: "Conforme transportadora",
    weightKg: Math.round(totalWeightKg * 10) / 10,
    source,
    matchedItems: matched.length,
    totalItems: items.length,
    serviceName: shopifyQuote.title,
  };
}

/** Limpa o cache de produtos VAREJO (uso em testes/admin). */
export function clearShippingQuoteCache() {
  varejoCache = null;
  varejoCachePromise = null;
}