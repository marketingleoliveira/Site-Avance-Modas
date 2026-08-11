/* Para habilitar a permissão de leitura de inventário no Shopify:
1. No Admin do Shopify, vá em "Configurações" > "Apps e canais de vendas".
2. Selecione seu App de Storefront e clique em "Desenvolver app".
3. Em "Configuração", clique em "Editar" na seção "Escopos da Storefront API".
4. Procure por "Inventário" (Inventory) e marque "unauthenticated_read_product_inventory".
5. Clique em "Salvar" no topo da página.
*/
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface HeroSlide {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  promo_text: string;
  promo_subtitle: string;
  button_text: string;
  button_link: string;
  button_enabled?: boolean;
}

export interface HeroSettings {
  image_url?: string;
  title?: string;
  subtitle?: string;
  promo_text?: string;
  promo_subtitle?: string;
  button_text?: string;
  button_link?: string;
  slides?: HeroSlide[];
  autoplay?: boolean;
  autoplay_interval?: number;
  [key: string]: string | boolean | number | HeroSlide[] | undefined;
}

export interface StoreSelectorSettings {
  atacado_image: string;
  varejo_image: string;
  background_image: string;
  header_banner_image?: string;
  header_banner_enabled?: boolean;
  homepage_enabled?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesSettings {
  items: FeatureItem[];
  [key: string]: FeatureItem[] | string;
}

export interface ContactSettings {
  whatsapp_number: string;
  email: string;
  address: string;
  instagram: string;
  [key: string]: string;
}

export interface LayoutSettings {
  features_gap: string;
  features_columns_mobile: string;
  features_columns_desktop: string;
  products_gap: string;
  products_columns_mobile: string;
  products_columns_desktop: string;
  [key: string]: string;
}

export interface ProductSection {
  id: string;
  title: string;
  subtitle: string;
  tag_filter: string;
  limit: number;
  order: number;
}

export interface ProductSectionsSettings {
  sections: ProductSection[];
}

export interface InstagramSettings {
  username: string;
  curator_feed_id: string;
  show_section: boolean;
  button_text: string;
  subtitle_text: string;
}

export interface AtacadoSettings {
  minimum_order: number;
  show_minimum_order_notice: boolean;
  minimum_order_message: string;
}

export interface VideoItem {
  id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
}

export interface VideosSettings {
  videos: VideoItem[];
}

export interface PromoBannerSettings {
  enabled: boolean;
  tag: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  messages: string[];
  interval: number;
}

export interface CountdownBannerSettings {
  enabled: boolean;
  promo_text: string;
  button_text: string;
  button_link: string;
  end_time: string;
}

// Cache for settings to reduce DB calls
const settingsCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export async function getSiteSetting<T>(key: string): Promise<T | null> {
  // Check cache first
  const cached = settingsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .maybeSingle();

  if (error) {
    console.error('Error fetching setting:', error);
    return null;
  }

  const result = data?.setting_value as T | null;
  
  // Update cache
  if (result !== null) {
    settingsCache.set(key, { data: result, timestamp: Date.now() });
  }

  return result;
}

export async function updateSiteSetting<T>(key: string, value: T): Promise<boolean> {
  // Use upsert for better reliability
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { 
        setting_key: key, 
        setting_value: value as unknown as Json,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'setting_key' }
    );

  if (error) {
    console.error('Error updating setting:', error);
    return false;
  }

  // Invalidate cache
  settingsCache.delete(key);

  return true;
}

export function invalidateSettingsCache(key?: string) {
  if (key) {
    settingsCache.delete(key);
  } else {
    settingsCache.clear();
  }
}

async function getUploadErrorMessage(error: unknown): Promise<string> {
  if (!error || typeof error !== 'object') {
    return 'Falha no upload';
  }

  const possibleContext = 'context' in error ? error.context : undefined;
  if (possibleContext instanceof Response) {
    try {
      const payload = await possibleContext.clone().json() as { error?: string };
      if (payload.error) return payload.error;
    } catch {
      // Keep the default error message below.
    }
  }

  return error instanceof Error ? error.message : 'Falha no upload';
}

export async function uploadSiteImage(file: File, path: string, isHero: boolean = false): Promise<string | null> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo inválido. Envie uma imagem.');
  }

  // Recommended dimensions for Hero
  const HERO_MIN_WIDTH = 1920;
  const HERO_MIN_HEIGHT = 800;

  if (isHero) {
    const checkImage = (): Promise<{ width: number, height: number }> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
          URL.revokeObjectURL(img.src);
        };
      });
    };

    const dimensions = await checkImage();
    if (dimensions.width < HERO_MIN_WIDTH || dimensions.height < HERO_MIN_HEIGHT) {
      const confirmed = window.confirm(
        `A imagem enviada (${dimensions.width}x${dimensions.height}) é menor que o recomendado para o Hero (${HERO_MIN_WIDTH}x${HERO_MIN_HEIGHT}).\n\nIsso pode causar perda de nitidez em telas grandes. Deseja continuar mesmo assim?`
      );
      if (!confirmed) return null;
    }
  }


  // Sanitize path: remove spaces and non-ascii chars that break the S3 key
  const safePath = path
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._/-]/g, '_');

  // Guard against huge files (Supabase default limit ~50MB, but browsers stall well before)
  const MAX_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    const msg = `Imagem muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 10MB.`;
    console.error(msg);
    throw new Error(msg);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', safePath);

  const uploadPromise = supabase.functions.invoke<{ url?: string; error?: string }>('upload-site-image', {
    body: formData,
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error('O upload demorou demais. Verifique sua conexão e tente novamente.'));
    }, 45000);
  });

  const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error(await getUploadErrorMessage(error));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.url) {
    throw new Error('Upload concluído sem retornar URL da imagem.');
  }

  return data.url;
}

// Admin user management
export async function createAdminUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/login`
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Erro ao criar usuário' };
    }

    // Add admin role - this will be handled by the trigger or edge function
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'admin' as const
      });

    if (roleError) {
      console.error('Error adding role:', roleError);
      // User was created but role wasn't added - still return success
      return { success: true, error: 'Usuário criado, mas role pode precisar ser adicionada manualmente' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, error: 'Erro inesperado ao criar administrador' };
  }
}

export async function listAdminUsers(): Promise<{ id: string; email: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, created_at')
    .eq('role', 'admin');

  if (error || !data) {
    console.error('Error listing admins:', error);
    return [];
  }

  // Get user emails from auth - we need to do this via edge function or store emails
  // For now, return what we have
  return data.map(row => ({
    id: row.user_id,
    email: '', // Will be filled by auth context
    created_at: row.created_at
  }));
}
