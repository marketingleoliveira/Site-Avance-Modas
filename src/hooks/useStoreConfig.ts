import { useState, useEffect } from 'react';
import { getSiteSetting } from '@/lib/site-settings';
import type { 
  ShopifyConfigSettings, 
  BrandSettings, 
  ShippingSettings, 
  SocialSettings, 
  LegalSettings 
} from '@/components/admin/StoreConfigEditor';

// Default values (fallback to hardcoded config if no DB settings)
const DEFAULT_SHOPIFY_CONFIG: ShopifyConfigSettings = {
  store_domain: '',
  storefront_token: '',
  api_version: '2025-07'
};

const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  brand_name: 'Avance Modas',
  logo_url: '',
  favicon_url: '',
  primary_color: '#6b7280',
  secondary_color: '#f3f4f6',
  accent_color: '#10b981'
};

const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  free_shipping_minimum: 299,
  free_shipping_enabled: true,
  shipping_notice: 'Frete grátis para compras acima de R$299',
  exchange_policy: 'Primeira troca grátis em até 30 dias',
  return_days: 30
};

const DEFAULT_SOCIAL_SETTINGS: SocialSettings = {
  whatsapp_number: '5511999999999',
  whatsapp_message: 'Olá! Vim pelo site e gostaria de mais informações.',
  instagram_url: 'https://instagram.com/avancemodasoficial',
  facebook_url: '',
  tiktok_url: '',
  email: 'contato@avancemodas.com.br',
  address: ''
};

const DEFAULT_LEGAL_SETTINGS: LegalSettings = {
  company_name: 'Avance Modas',
  cnpj: '61.705.129/0001-90',
  privacy_policy: '',
  terms_of_use: '',
  wholesale_policy: '',
  exchange_atacado_text: 'Trocas somente em casos de defeito de fabricação. Prazo de 7 dias após o recebimento.',
  exchange_atacado_conditions: 'O produto deve estar sem uso, com etiquetas originais e na embalagem.',
  exchange_atacado_days: 7,
  exchange_varejo_text: 'Aceitamos trocas em até 7 dias após o recebimento.',
  exchange_varejo_conditions: 'O produto deve estar sem uso, com etiquetas originais e na embalagem.',
  exchange_varejo_days: 7
};

interface StoreConfig {
  shopify: ShopifyConfigSettings;
  brand: BrandSettings;
  shipping: ShippingSettings;
  social: SocialSettings;
  legal: LegalSettings;
  isLoading: boolean;
}

// Cache for the store config
let configCache: StoreConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 1 minute

export function useStoreConfig() {
  const [config, setConfig] = useState<StoreConfig>({
    shopify: DEFAULT_SHOPIFY_CONFIG,
    brand: DEFAULT_BRAND_SETTINGS,
    shipping: DEFAULT_SHIPPING_SETTINGS,
    social: DEFAULT_SOCIAL_SETTINGS,
    legal: DEFAULT_LEGAL_SETTINGS,
    isLoading: true
  });

  useEffect(() => {
    const loadConfig = async () => {
      // Check cache first
      if (configCache && Date.now() - cacheTimestamp < CACHE_TTL) {
        setConfig({ ...configCache, isLoading: false });
        return;
      }

      try {
        const [shopify, brand, shipping, social, legal] = await Promise.all([
          getSiteSetting<ShopifyConfigSettings>('shopify_config'),
          getSiteSetting<BrandSettings>('brand_settings'),
          getSiteSetting<ShippingSettings>('shipping_settings'),
          getSiteSetting<SocialSettings>('social_settings'),
          getSiteSetting<LegalSettings>('legal_settings'),
        ]);

        const newConfig = {
          shopify: shopify || DEFAULT_SHOPIFY_CONFIG,
          brand: brand || DEFAULT_BRAND_SETTINGS,
          shipping: shipping || DEFAULT_SHIPPING_SETTINGS,
          social: social || DEFAULT_SOCIAL_SETTINGS,
          legal: legal || DEFAULT_LEGAL_SETTINGS,
          isLoading: false
        };

        // Update cache
        configCache = newConfig;
        cacheTimestamp = Date.now();

        setConfig(newConfig);
      } catch (error) {
        console.error('Error loading store config:', error);
        setConfig(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadConfig();
  }, []);

  const invalidateCache = () => {
    configCache = null;
    cacheTimestamp = 0;
  };

  return { ...config, invalidateCache };
}

// Sync function to get Shopify config (for use in shopify-api.ts)
export async function getShopifyConfig(): Promise<ShopifyConfigSettings> {
  try {
    const config = await getSiteSetting<ShopifyConfigSettings>('shopify_config');
    return config || DEFAULT_SHOPIFY_CONFIG;
  } catch (error) {
    console.error('Error getting Shopify config:', error);
    return DEFAULT_SHOPIFY_CONFIG;
  }
}

// Get the Storefront URL
export function getStorefrontUrl(config: ShopifyConfigSettings): string {
  return `https://${config.store_domain}/api/${config.api_version}/graphql.json`;
}
