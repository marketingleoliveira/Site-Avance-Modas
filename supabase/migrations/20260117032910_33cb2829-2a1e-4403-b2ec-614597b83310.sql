
-- Add contact settings to site_settings defaults
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('contact_settings', '{"whatsapp_number": "5511999999999", "email": "contato@avancemodas.com.br", "address": "Endereço da loja", "instagram": "@avancemodas"}')
ON CONFLICT (setting_key) DO NOTHING;
