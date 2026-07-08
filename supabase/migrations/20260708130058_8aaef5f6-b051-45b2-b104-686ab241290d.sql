UPDATE public.site_settings
SET setting_value = jsonb_set(setting_value, '{whatsapp_number}', '"5511932105187"'::jsonb)
WHERE setting_key IN ('contact_settings','social_settings');