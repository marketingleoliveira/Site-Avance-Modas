import { useState, useEffect } from "react";
import { getSiteSetting, AtacadoSettings } from "@/lib/site-settings";

const DEFAULT_SETTINGS: AtacadoSettings = {
  minimum_order: 200,
  show_minimum_order_notice: true,
  minimum_order_message: "O pedido mínimo é de R$ 200,00"
};

export function useAtacadoSettings() {
  const [settings, setSettings] = useState<AtacadoSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSetting<AtacadoSettings>('atacado_settings');
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading atacado settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading };
}
