// Google Search Console proxy: requires admin role; forwards to the connector gateway.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return json({ error: "missing_auth" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: auth } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) return json({ error: "role_check_failed" }, 500);
    if (!roleData) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const { action, siteUrl, payload } = body as {
      action: string;
      siteUrl?: string;
      payload?: Record<string, unknown>;
    };

    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const gscKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY")!;
    if (!lovableKey || !gscKey) return json({ error: "gateway_not_configured" }, 500);

    const gwHeaders = {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gscKey,
      "Content-Type": "application/json",
    };

    let url = "";
    let init: RequestInit = { headers: gwHeaders };

    switch (action) {
      case "list_sites":
        url = `${GATEWAY}/webmasters/v3/sites`;
        init.method = "GET";
        break;
      case "search_analytics": {
        if (!siteUrl) return json({ error: "siteUrl_required" }, 400);
        url = `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
        init.method = "POST";
        init.body = JSON.stringify(payload ?? {});
        break;
      }
      case "inspect_url": {
        url = `${GATEWAY}/v1/urlInspection/index:inspect`;
        init.method = "POST";
        init.body = JSON.stringify(payload ?? {});
        break;
      }
      case "sitemaps":
        if (!siteUrl) return json({ error: "siteUrl_required" }, 400);
        url = `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`;
        init.method = "GET";
        break;
      default:
        return json({ error: "unknown_action" }, 400);
    }

    const res = await fetch(url, init);
    const text = await res.text();
    let data: unknown = text;
    try { data = JSON.parse(text); } catch { /* keep text */ }

    return new Response(JSON.stringify({ ok: res.ok, status: res.status, data }), {
      status: res.ok ? 200 : res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return json({ error: "internal", message: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}