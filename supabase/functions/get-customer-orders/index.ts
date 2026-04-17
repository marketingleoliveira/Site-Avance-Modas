import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SHOPIFY_API_VERSION = "2025-07";
const LEGACY_SHOPIFY_DOMAIN = "r3ha52-nj.myshopify.com";
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

interface OrderItem {
  title: string;
  variant_title: string | null;
  quantity: number;
  image: string | null;
}

interface OrderResponse {
  id: string;
  order_number: string;
  created_at: string;
  customer_name: string;
  total: string;
  currency: string;
  items: OrderItem[];
  within_7_days: boolean;
}

interface SiteSettingRow {
  setting_value?: {
    store_domain?: unknown;
  };
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });

async function getConfiguredShopDomain(): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return LEGACY_SHOPIFY_DOMAIN;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?setting_key=eq.shopify_config&select=setting_value&limit=1`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to load shopify_config:", response.status, await response.text());
      return LEGACY_SHOPIFY_DOMAIN;
    }

    const rows = (await response.json()) as SiteSettingRow[];
    const storeDomain = rows[0]?.setting_value?.store_domain;

    return typeof storeDomain === "string" && storeDomain.trim().length > 0
      ? storeDomain
      : LEGACY_SHOPIFY_DOMAIN;
  } catch (error) {
    console.error("Error loading shopify_config:", error);
    return LEGACY_SHOPIFY_DOMAIN;
  }
}

async function fetchOrdersFromShopify(
  domain: string,
  token: string,
  email: string,
  cleanOrderNumber: string
) {
  const url = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&email=${encodeURIComponent(
    email
  )}&name=${encodeURIComponent("#" + cleanOrderNumber)}`;

  return fetch(url, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, order_number } = await req.json();

    if (!email || !order_number) {
      return jsonResponse({ error: "Email e número do pedido são obrigatórios" }, 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOrderNumber = String(order_number).replace(/[#\s]/g, "");
    const shopDomain = await getConfiguredShopDomain();
    const tokens = Array.from(
      new Set(
        [Deno.env.get("SHOPIFY_ADMIN_API_TOKEN"), Deno.env.get("SHOPIFY_ACCESS_TOKEN")].filter(
          (token): token is string => Boolean(token)
        )
      )
    );

    if (tokens.length === 0) {
      return jsonResponse({ error: "Configuração da loja indisponível" }, 500);
    }

    let data: { orders?: any[] } | null = null;
    let lastError: { status: number; text: string } | null = null;

    for (const token of tokens) {
      const shopifyRes = await fetchOrdersFromShopify(shopDomain, token, cleanEmail, cleanOrderNumber);

      if (shopifyRes.ok) {
        data = await shopifyRes.json();
        break;
      }

      const errText = await shopifyRes.text();
      console.error(`Shopify error (${shopDomain}):`, shopifyRes.status, errText);
      lastError = { status: shopifyRes.status, text: errText };

      if (![401, 402, 403].includes(shopifyRes.status)) {
        return jsonResponse({ error: "Não foi possível consultar os pedidos no momento." }, 502);
      }
    }

    if (!data) {
      const errorMessage =
        lastError?.status === 402
          ? "A loja configurada para a Troca Rápida não corresponde ao token Shopify salvo."
          : "Configuração Shopify inválida para consultar pedidos.";

      return jsonResponse({ error: errorMessage }, 502);
    }

    const orders = data.orders || [];

    if (orders.length === 0) {
      return jsonResponse({
        orders: [],
        message: "Nenhum pedido encontrado com esse e-mail e número.",
      });
    }

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const result: OrderResponse[] = orders.map((o: any) => {
      const createdAt = new Date(o.created_at).getTime();
      return {
        id: String(o.id),
        order_number: o.name,
        created_at: o.created_at,
        customer_name:
          `${o.customer?.first_name || ""} ${o.customer?.last_name || ""}`.trim() ||
          o.shipping_address?.name ||
          "Cliente",
        total: o.total_price,
        currency: o.currency,
        within_7_days: createdAt >= sevenDaysAgo,
        items: (o.line_items || []).map((li: any) => ({
          title: li.title,
          variant_title: li.variant_title,
          quantity: li.quantity,
          image: null,
        })),
      };
    });

    return jsonResponse({ orders: result });
  } catch (err) {
    console.error("Error:", err);
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return jsonResponse({ error: msg }, 500);
  }
});
