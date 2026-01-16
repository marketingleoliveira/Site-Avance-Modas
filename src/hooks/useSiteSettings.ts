import { useState, useEffect } from "react";
import { getSiteSetting, HeroSettings, StoreSelectorSettings, FeaturesSettings } from "@/lib/site-settings";

export function useHeroSettings(type: 'ATACADO' | 'VAREJO') {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const key = type === 'ATACADO' ? 'hero_atacado' : 'hero_varejo';
      const data = await getSiteSetting<HeroSettings>(key);
      setSettings(data);
      setLoading(false);
    };
    loadSettings();
  }, [type]);

  return { settings, loading };
}

export function useStoreSelectorSettings() {
  const [settings, setSettings] = useState<StoreSelectorSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const data = await getSiteSetting<StoreSelectorSettings>('store_selector');
      setSettings(data);
      setLoading(false);
    };
    loadSettings();
  }, []);

  return { settings, loading };
}

export function useFeaturesSettings() {
  const [settings, setSettings] = useState<FeaturesSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const data = await getSiteSetting<FeaturesSettings>('features');
      setSettings(data);
      setLoading(false);
    };
    loadSettings();
  }, []);

  return { settings, loading };
}
