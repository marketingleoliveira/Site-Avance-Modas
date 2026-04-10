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
  [key: string]: string;
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

export async function uploadSiteImage(file: File, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('site-images')
    .upload(path, file, { upsert: true });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('site-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
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
