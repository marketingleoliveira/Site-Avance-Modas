import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOP_DOMAIN = "avancemodas-xzj71.myshopify.com";
const ADMIN_API_VERSION = "2025-07";

/**
 * Retorna o inventário exato (quantidades) de todas as variantes.
 *
 * A Storefront API só expõe `quantityAvailable` quando o escopo
 * `unauthenticated_read_product_inventory` está liberado no app — o que não é
 * garantido. Para exibir quantidades exatas de forma confiável usamos a Admin
 * API a partir desta função (o token administrativo nunca vai para o browser).
 *
 * Acesso restrito a administradores autenticados.
 */

interface AdminVariantNode {
  id: string;
  title: string;
  inventoryQuantity: number | null;
  availableForSale: boolean;
  inventoryPolicy: string;
  product: { title: string; handle: string } | null;
}

const VARIANTS_QUERY = `
  query InventoryVariants($first: Int!, $after: String) {
    productVariants(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        inventoryQuantity
        availableForSale
        inventoryPolicy
        product { title handle }
      }
    }
  }
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Autenticação + autorização (admin) ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Acesso restrito a administradores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Consulta ao inventário via Admin API ---
    const shopifyToken =
      Deno.env.get("SHOPIFY_ADMIN_API_TOKEN") || Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!shopifyToken) {
      return new Response(JSON.stringify({ error: "Token administrativo do Shopify não configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endpoint = `https://${SHOP_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
    const variants: Array<{
      variantId: string;
      variantTitle: string;
      productTitle: string;
      handle: string;
      available: boolean;
      quantity: number | null;
    }> = [];

    let after: string | null = null;
    // Limite defensivo: até 10 páginas de 250 variantes (2.500 variantes).
    for (let page = 0; page < 10; page++) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": shopifyToken,
        },
        body: JSON.stringify({ query: VARIANTS_QUERY, variables: { first: 250, after } }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error("Shopify Admin API error", response.status, body.slice(0, 500));
        return new Response(
          JSON.stringify({ error: `Falha ao consultar o Shopify (${response.status})` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const payload = await response.json();
      if (payload.errors) {
        console.error("Shopify Admin GraphQL errors", JSON.stringify(payload.errors).slice(0, 500));
        return new Response(
          JSON.stringify({ error: "Erro na consulta de inventário do Shopify" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const connection = payload?.data?.productVariants;
      if (!connection) break;

      for (const node of (connection.nodes ?? []) as AdminVariantNode[]) {
        const quantity = typeof node.inventoryQuantity === "number" ? node.inventoryQuantity : null;
        variants.push({
          variantId: node.id,
          variantTitle: node.title ?? "",
          productTitle: node.product?.title ?? "",
          handle: node.product?.handle ?? "",
          available:
            node.availableForSale ??
            (quantity !== null ? quantity > 0 : String(node.inventoryPolicy) === "CONTINUE"),
          quantity,
        });
      }

      if (!connection.pageInfo?.hasNextPage) break;
      after = connection.pageInfo.endCursor;
    }

    return new Response(JSON.stringify({ variants, syncedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("shopify-inventory error", error);
    return new Response(JSON.stringify({ error: "Erro interno ao consultar o inventário" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});