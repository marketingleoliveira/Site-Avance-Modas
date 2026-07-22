UPDATE public.site_settings 
SET setting_value = jsonb_set(
  setting_value, 
  '{slides,0,image_url}', 
  '"/__l5e/assets-v1/7679be06-eb5d-4912-b14a-9392ecbd0274/hero-varejo-frete-gratis.png"'::jsonb
),
updated_at = now()
WHERE setting_key = 'hero_varejo';