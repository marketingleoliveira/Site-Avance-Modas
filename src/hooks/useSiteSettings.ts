import { useState, useEffect, useCallback } from "react";
import { getSiteSetting, HeroSettings, StoreSelectorSettings, FeaturesSettings, LayoutSettings, ProductSectionsSettings, InstagramSettings, invalidateSettingsCache } from "@/lib/site-settings";

export function useHeroSettings(type: 'ATACADO' | 'VAREJO') {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const key = type === 'ATACADO' ? 'hero_atacado' : 'hero_varejo';
    invalidateSettingsCache(key);
    const data = await getSiteSetting<HeroSettings>(key);
    setSettings(data);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}

export function useStoreSelectorSettings() {
  const [settings, setSettings] = useState<StoreSelectorSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    invalidateSettingsCache('store_selector');
    const data = await getSiteSetting<StoreSelectorSettings>('store_selector');
    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}

export function useFeaturesSettings() {
  const [settings, setSettings] = useState<FeaturesSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    invalidateSettingsCache('features');
    const data = await getSiteSetting<FeaturesSettings>('features');
    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}

export function useLayoutSettings() {
  const [settings, setSettings] = useState<LayoutSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    invalidateSettingsCache('layout_settings');
    const data = await getSiteSetting<LayoutSettings>('layout_settings');
    setSettings(data || {
      features_gap: "6",
      features_columns_mobile: "2",
      features_columns_desktop: "5",
      products_gap: "6",
      products_columns_mobile: "2",
      products_columns_desktop: "4"
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}

export function useProductSections(type: 'ATACADO' | 'VAREJO') {
  const [settings, setSettings] = useState<ProductSectionsSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const key = type === 'ATACADO' ? 'product_sections_atacado' : 'product_sections_varejo';
    invalidateSettingsCache(key);
    const data = await getSiteSetting<ProductSectionsSettings>(key);
    setSettings(data);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}

export function useInstagramSettings() {
  const [settings, setSettings] = useState<InstagramSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    invalidateSettingsCache('instagram_settings');
    const data = await getSiteSetting<InstagramSettings>('instagram_settings');
    setSettings(data || {
      username: 'avancemodasoficial',
      curator_feed_id: 'abf84bdb-32da-4a02-b55e-4116eef0cf19',
      show_section: true,
      button_text: 'Ver nosso Instagram',
      subtitle_text: 'Siga-nos no Instagram'
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}
