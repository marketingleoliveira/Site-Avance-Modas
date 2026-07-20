import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUCKET_NAME = "site-images";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_PREFIXES = ["hero_atacado/", "hero_varejo/", "store_selector/", "videos/"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Método não permitido" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Faça login novamente no painel antes de enviar imagens." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Upload indisponível: configuração do backend ausente." }, 500);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: "Sessão expirada. Entre novamente no painel." }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Admin role check failed:", roleError);
      return json({ error: "Não foi possível validar seu acesso administrativo." }, 500);
    }

    if (!roleData) {
      return json({ error: "Apenas administradores podem enviar imagens do site." }, 403);
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const rawPath = String(formData.get("path") ?? "");

    if (!(file instanceof File)) {
      return json({ error: "Arquivo de imagem não recebido." }, 400);
    }

    if (!file.type.startsWith("image/")) {
      return json({ error: "Arquivo inválido. Envie uma imagem." }, 400);
    }

    if (file.size > MAX_BYTES) {
      return json(
        { error: `Imagem muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 10MB.` },
        400,
      );
    }

    const safePath = sanitizePath(rawPath);
    if (!safePath || !ALLOWED_PREFIXES.some((prefix) => safePath.startsWith(prefix))) {
      return json({ error: "Caminho de upload inválido." }, 400);
    }

    const { error: uploadError } = await adminClient.storage
      .from(BUCKET_NAME)
      .upload(safePath, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Storage upload failed:", uploadError);
      return json({ error: uploadError.message || "Falha ao enviar imagem." }, 500);
    }

    const { data: urlData } = adminClient.storage.from(BUCKET_NAME).getPublicUrl(safePath);

    return json({ url: urlData.publicUrl, path: safePath });
  } catch (error) {
    console.error("upload-site-image error:", error);
    return json({ error: "Erro interno ao enviar imagem." }, 500);
  }
});

function sanitizePath(path: string): string {
  return path
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._/-]/g, "_")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+/, "")
    .slice(0, 240);
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}