import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface HeroSettings {
  image_url: string;
  title: string;
  subtitle: string;
  promo_text: string;
  promo_subtitle: string;
  button_text: string;
  [key: string]: string; // Index signature
}

export interface StoreSelectorSettings {
  atacado_image: string;
  varejo_image: string;
  background_image: string;
  [key: string]: string; // Index signature
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesSettings {
  items: FeatureItem[];
  [key: string]: FeatureItem[] | string; // Index signature
}

export interface ContactSettings {
  whatsapp_number: string;
  email: string;
  address: string;
  instagram: string;
  [key: string]: string;
}

export async function getSiteSetting<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', key)
    .maybeSingle();

  if (error) {
    console.error('Error fetching setting:', error);
    return null;
  }

  return data?.setting_value as T | null;
}

export async function updateSiteSetting<T>(key: string, value: T): Promise<boolean> {
  const { error } = await supabase
    .from('site_settings')
    .update({ setting_value: value as unknown as Json })
    .eq('setting_key', key);

  if (error) {
    console.error('Error updating setting:', error);
    return false;
  }

  return true;
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
