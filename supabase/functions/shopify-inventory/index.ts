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

    const { data: roleRow, error: roleError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError || !roleRow) {
      return new Response(JSON.stringify({ error: "Acesso restrito a administradores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Consulta ao inventário via Admin API ---
    // Alguns projetos têm apenas um dos dois segredos válido para a Admin API,
    // portanto tentamos ambos antes de desistir.
    const candidateTokens = [
      Deno.env.get("SHOPIFY_ADMIN_API_TOKEN"),
      Deno.env.get("SHOPIFY_ACCESS_TOKEN"),
    ].filter((t): t is string => !!t);

    if (candidateTokens.length === 0) {
      // Sem token: o cliente cai para a Storefront API.
      return new Response(
        JSON.stringify({
          variants: [],
          unavailable: true,
          reason: "Token administrativo do Shopify não configurado",
          syncedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    let shopifyToken = candidateTokens[0];

    const endpoint = `https://${SHOP_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
    const variants: Array<{
      variantId: string;
      variantTitle: string;
      productTitle: string;
      handle: string;
      available: boolean;
      quantity: number | null;
    }> = [];

    // Descobre qual token é aceito pela Admin API (401/403 = credencial inválida).
    let authorized = false;
    for (const token of candidateTokens) {
      const probe = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
        body: JSON.stringify({ query: VARIANTS_QUERY, variables: { first: 1, after: null } }),
      });
      if (probe.ok) {
        await probe.text();
        shopifyToken = token;
        authorized = true;
        break;
      }
      console.error("Shopify Admin API auth falhou", probe.status, (await probe.text()).slice(0, 200));
    }

    if (!authorized) {
      // Nenhuma credencial válida para a Admin API: devolvemos 200 com sinalização
      // para que o painel use a Storefront API em vez de quebrar a tela.
      return new Response(
        JSON.stringify({
          variants: [],
          unavailable: true,
          reason:
            "Credencial da Admin API do Shopify inválida ou sem escopo de leitura de inventário",
          syncedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
          JSON.stringify({
            variants,
            unavailable: variants.length === 0,
            reason: `Falha ao consultar o Shopify (${response.status})`,
            syncedAt: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const payload = await response.json();
      if (payload.errors) {
        console.error("Shopify Admin GraphQL errors", JSON.stringify(payload.errors).slice(0, 500));
        return new Response(
          JSON.stringify({
            variants,
            unavailable: variants.length === 0,
            reason: "Erro na consulta de inventário do Shopify",
            syncedAt: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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