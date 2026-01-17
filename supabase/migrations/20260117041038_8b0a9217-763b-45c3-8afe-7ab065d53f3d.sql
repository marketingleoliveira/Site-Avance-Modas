-- Add unique constraint on setting_key for upsert to work
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_setting_key_key;
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);

-- Create policy for admins to insert user_roles (for creating new admins)
CREATE POLICY "Admins can create user roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for admins to view all user roles
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Drop the old select policy if it exists (to replace with new one)
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Insert default instagram settings if not exists
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES (
  'instagram_settings',
  '{"username": "avancemodasoficial", "curator_feed_id": "abf84bdb-32da-4a02-b55e-4116eef0cf19", "show_section": true, "button_text": "Ver nosso Instagram", "subtitle_text": "Siga-nos no Instagram"}'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;