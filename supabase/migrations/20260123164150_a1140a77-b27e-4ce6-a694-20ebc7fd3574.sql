-- Create storage bucket for SAC attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('sac-attachments', 'sac-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to sac-attachments bucket
CREATE POLICY "Anyone can upload SAC attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'sac-attachments');

-- Allow anyone to view SAC attachments (public bucket)
CREATE POLICY "Anyone can view SAC attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'sac-attachments');

-- Allow admins to delete SAC attachments
CREATE POLICY "Admins can delete SAC attachments"
ON storage.objects
FOR DELETE
USING (bucket_id = 'sac-attachments' AND EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
));

-- Add attachments column to sac_tickets table
ALTER TABLE public.sac_tickets
ADD COLUMN IF NOT EXISTS attachments text[] DEFAULT '{}';