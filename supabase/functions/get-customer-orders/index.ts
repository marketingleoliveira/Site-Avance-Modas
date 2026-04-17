import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SHOPIFY_API_VERSION = "2025-07";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, order_number } = await req.json();

    if (!email || !order_number) {
      return new Response(
        JSON.stringify({ error: "Email e número do pedido são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SHOPIFY_DOMAIN = "avancemodas-xzj71.myshopify.com";
    const ADMIN_TOKEN = Deno.env.get("SHOPIFY_ADMIN_API_TOKEN") || Deno.env.get("SHOPIFY_ACCESS_TOKEN");

    if (!ADMIN_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Configuração da loja indisponível" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normaliza o número do pedido (remove # e espaços)
    const cleanOrderNumber = String(order_number).replace(/[#\s]/g, "");

    // Shopify Admin API: busca pedidos por email + nome (name = #1234)
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&email=${encodeURIComponent(
      email
    )}&name=${encodeURIComponent("#" + cleanOrderNumber)}`;

    const shopifyRes = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": ADMIN_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!shopifyRes.ok) {
      const errText = await shopifyRes.text();
      console.error("Shopify error:", shopifyRes.status, errText);
      return new Response(
        JSON.stringify({ error: "Não foi possível consultar os pedidos no momento." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await shopifyRes.json();
    const orders = data.orders || [];

    if (orders.length === 0) {
      return new Response(
        JSON.stringify({
          orders: [],
          message: "Nenhum pedido encontrado com esse e-mail e número.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    return new Response(JSON.stringify({ orders: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
