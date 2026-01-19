import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber } = await req.json();

    if (!orderNumber) {
      return new Response(
        JSON.stringify({ error: "Número do pedido é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    const shopifyStoreDomain = "avancemodas-xzj71.myshopify.com";

    if (!shopifyAccessToken) {
      console.error("SHOPIFY_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Configuração do Shopify não encontrada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Search for orders using the Admin API
    const searchQuery = orderNumber.replace(/^#/, ""); // Remove # if present
    const ordersUrl = `https://${shopifyStoreDomain}/admin/api/2025-07/orders.json?name=${encodeURIComponent(searchQuery)}&status=any`;

    console.log("Searching for order:", searchQuery);

    const ordersResponse = await fetch(ordersUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": shopifyAccessToken,
        "Content-Type": "application/json",
      },
    });

    if (!ordersResponse.ok) {
      const errorText = await ordersResponse.text();
      console.error("Shopify API error:", ordersResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar pedido no Shopify" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ordersData = await ordersResponse.json();
    const orders = ordersData.orders || [];

    // Find the exact order by number
    const order = orders.find((o: any) => 
      o.name === searchQuery || 
      o.name === `#${searchQuery}` ||
      o.order_number?.toString() === searchQuery
    );

    if (!order) {
      return new Response(
        JSON.stringify({ 
          found: false, 
          message: "Pedido não encontrado. Verifique o número e tente novamente." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get fulfillments (tracking info)
    const fulfillments = order.fulfillments || [];
    
    // Extract tracking information
    const trackingInfo = fulfillments.map((f: any) => ({
      status: f.status,
      trackingNumber: f.tracking_number,
      trackingUrl: f.tracking_url,
      trackingCompany: f.tracking_company,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    })).filter((t: any) => t.trackingNumber);

    // Build response with order info
    const response = {
      found: true,
      order: {
        number: order.name,
        createdAt: order.created_at,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status || "unfulfilled",
        totalPrice: order.total_price,
        currency: order.currency,
        customerEmail: order.email ? order.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : null,
      },
      tracking: trackingInfo,
      hasTracking: trackingInfo.length > 0,
    };

    console.log("Order found:", order.name, "Tracking items:", trackingInfo.length);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in get-order-tracking:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
