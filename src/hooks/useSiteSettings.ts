import { useState, useEffect, useCallback } from "react";
import { getSiteSetting, HeroSettings, StoreSelectorSettings, FeaturesSettings, LayoutSettings, ProductSectionsSettings, InstagramSettings, VideosSettings, PromoBannerSettings, ContactSettings, AnnouncementSettings, CountdownBannerSettings, invalidateSettingsCache } from "@/lib/site-settings";

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

export function useVideosSettings() {
  const [settings, setSettings] = useState<VideosSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    invalidateSettingsCache('videos_settings');
    const data = await getSiteSetting<VideosSettings>('videos_settings');
    setSettings(data || { videos: [] });
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}

export function usePromoBannerSettings() {
  const [settings, setSettings] = useState<PromoBannerSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    invalidateSettingsCache('promo_banner_settings');
    const data = await getSiteSetting<PromoBannerSettings>('promo_banner_settings');
    setSettings(data || {
      enabled: true,
      tag: "Oferta Especial",
      title: "COMPRE 3 E GANHE 20% OFF",
      description: "Promoção por tempo limitado. Não perca!",
      button_text: "Aproveitar",
      button_link: "/#produtos"
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}

export function useContactSettings() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    invalidateSettingsCache('contact_settings');
    const data = await getSiteSetting<ContactSettings>('contact_settings');
    setSettings(data || {
      whatsapp_number: '',
      email: '',
      address: '',
      instagram: ''
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}

export function useAnnouncementSettings() {
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    invalidateSettingsCache('announcement_settings');
    const data = await getSiteSetting<AnnouncementSettings>('announcement_settings');
    setSettings(data || {
      enabled: true,
      messages: [
        "FRETE GRÁTIS ACIMA DE R$299",
        "GRADE ABERTA - QUALQUER QUANTIDADE",
        "ATÉ 6X SEM JUROS"
      ],
      interval: 4000
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}

export function useCountdownBannerSettings() {
  const [settings, setSettings] = useState<CountdownBannerSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    invalidateSettingsCache('countdown_banner_settings');
    const data = await getSiteSetting<CountdownBannerSettings>('countdown_banner_settings');
    setSettings(data || {
      enabled: false,
      promo_text: "PROMO - FRETE EXPRESSO POR 14,90 PARA TODO O BRASIL!",
      button_text: "APROVEITAR AGORA",
      button_link: "/#produtos",
      end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { settings, loading, refetch };
}
