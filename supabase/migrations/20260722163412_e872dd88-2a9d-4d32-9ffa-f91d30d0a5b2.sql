UPDATE public.site_settings 
SET setting_value = jsonb_set(
  setting_value, 
  '{slides,0,image_url}', 
  '"/__l5e/assets-v1/2a29f0c4-169e-4237-a072-efcdf6078dfb/hero-varejo-new.png"'
)
WHERE setting_key = 'hero_varejo';