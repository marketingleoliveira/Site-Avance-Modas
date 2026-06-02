ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE public.newsletter_subscribers ALTER COLUMN email DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_newsletter_whatsapp ON public.newsletter_subscribers (whatsapp);