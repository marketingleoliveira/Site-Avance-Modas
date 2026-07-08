import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { whatsapp, email, source } = await req.json();

    const digits = typeof whatsapp === "string" ? whatsapp.replace(/\D/g, "") : "";
    if (digits.length < 10 || digits.length > 11) {
      return new Response(
        JSON.stringify({ error: "WhatsApp inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const hasEmail = cleanEmail.length > 0;
    if (hasEmail && !emailRegex.test(cleanEmail)) {
      return new Response(
        JSON.stringify({ error: "E-mail inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert subscriber (email optional)
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        whatsapp: digits,
        email: hasEmail ? cleanEmail : null,
        source: source || "website",
      });

    let alreadySubscribed = false;
    if (dbError) {
      if (dbError.code === "23505") {
        alreadySubscribed = true;
      } else {
        console.error("DB insert error:", dbError);
        return new Response(
          JSON.stringify({ error: "Erro ao salvar inscrição" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sync to Shopify only if email provided
    let shopifyStatus: "skipped" | "created" | "exists" | "error" = "skipped";
    if (hasEmail) {
      const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
      if (!shopifyAccessToken) {
        console.warn("SHOPIFY_ACCESS_TOKEN not configured — skipping Shopify sync");
        shopifyStatus = "error";
      } else {
        const { data: configData } = await supabase
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "shopify_config")
          .maybeSingle();
        const shopifyConfig = configData?.setting_value as { storeDomain?: string } | null;
        const shopDomain = shopifyConfig?.storeDomain || "r3ha52-nj.myshopify.com";

        const phoneE164 = digits.length === 11 ? `+55${digits}` : `+55${digits}`;
        const customerPayload = {
          customer: {
            email: cleanEmail,
            phone: phoneE164,
            accepts_marketing: true,
            email_marketing_consent: {
              state: "subscribed",
              opt_in_level: "single_opt_in",
              consent_updated_at: new Date().toISOString(),
            },
            tags: `newsletter,${source || "website"}`,
          },
        };

        try {
          const resp = await fetch(
            `https://${shopDomain}/admin/api/2025-07/customers.json`,
            {
              method: "POST",
              headers: {
                "X-Shopify-Access-Token": shopifyAccessToken,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(customerPayload),
            }
          );

          if (resp.ok) {
            shopifyStatus = "created";
          } else {
            const body = await resp.text();
            console.error("Shopify customer create error:", resp.status, body);
            // 422 typically = already exists (email taken). Treat as success.
            if (resp.status === 422 && body.includes("has already been taken")) {
              shopifyStatus = "exists";
            } else {
              shopifyStatus = "error";
            }
          }
        } catch (e) {
          console.error("Shopify sync exception:", e);
          shopifyStatus = "error";
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alreadySubscribed,
        shopifyStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("newsletter-subscribe error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});