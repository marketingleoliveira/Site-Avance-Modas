-- Add layout settings and product sections configuration
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES 
  ('layout_settings', '{
    "features_gap": "6",
    "features_columns_mobile": "2",
    "features_columns_desktop": "5",
    "products_gap": "6",
    "products_columns_mobile": "2",
    "products_columns_desktop": "4"
  }'),
  ('product_sections_atacado', '{
    "sections": [
      {
        "id": "main",
        "title": "Produtos Atacado",
        "subtitle": "Conheça nossa linha exclusiva para revendedores.",
        "tag_filter": "",
        "limit": 8,
        "order": 1
      }
    ]
  }'),
  ('product_sections_varejo', '{
    "sections": [
      {
        "id": "main",
        "title": "Produtos Varejo",
        "subtitle": "As melhores peças fitness para você.",
        "tag_filter": "",
        "limit": 8,
        "order": 1
      }
    ]
  }')
ON CONFLICT (setting_key) DO NOTHING;