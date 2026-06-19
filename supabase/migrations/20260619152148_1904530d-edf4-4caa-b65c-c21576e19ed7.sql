
-- Tighten SAC attachments INSERT policy: require 'tickets/' path prefix
DROP POLICY IF EXISTS "Anyone can upload SAC attachments" ON storage.objects;
CREATE POLICY "Anyone can upload SAC attachments to tickets folder"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'sac-attachments'
  AND (storage.foldername(name))[1] = 'tickets'
);

-- Remove broad SELECT policy on public site-images bucket (prevents listing; CDN public URLs still work)
DROP POLICY IF EXISTS "Anyone can view site images" ON storage.objects;

-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.auto_assign_admin_role() FROM PUBLIC, anon, authenticated;
