UPDATE public.site_settings 
SET setting_value = jsonb_set(
  setting_value, 
  '{slides,0,image_url}', 
  '"/__l5e/assets-v1/d1cfe4c6-f8ce-46ad-a573-5eea3909d195/hero-varejo-frete-gratis-final.jpg"'::jsonb
),
updated_at = now()
WHERE setting_key = 'hero_varejo';