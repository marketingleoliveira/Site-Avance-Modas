UPDATE public.site_settings 
SET setting_value = jsonb_set(
  setting_value, 
  '{slides,0,image_url}', 
  '"/__l5e/assets-v1/027db158-c8c9-4d54-be63-c1f888c50a22/hero-varejo-new.png"'
) 
WHERE setting_key = 'hero_varejo';