import { useState, useEffect, useCallback } from "react";
import { getSiteSetting, AtacadoSettings, invalidateSettingsCache } from "@/lib/site-settings";

const DEFAULT_SETTINGS: AtacadoSettings = {
  minimum_order: 200,
  show_minimum_order_notice: true,
  minimum_order_message: "O pedido mínimo é de R$ 200,00"
};

export function useAtacadoSettings() {
  const [settings, setSettings] = useState<AtacadoSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      // Invalidate cache to get fresh data
      invalidateSettingsCache('atacado_settings');
      const data = await getSiteSetting<AtacadoSettings>('atacado_settings');
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading atacado settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    
    // Reload settings when visibility changes (user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSettings();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadSettings]);

  // Function to manually refresh settings
  const refreshSettings = useCallback(() => {
    setLoading(true);
    loadSettings();
  }, [loadSettings]);

  return { settings, loading, refreshSettings };
}
