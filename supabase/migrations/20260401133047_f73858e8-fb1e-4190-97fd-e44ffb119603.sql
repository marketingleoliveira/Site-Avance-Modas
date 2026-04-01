
CREATE TABLE public.product_size_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_handle TEXT NOT NULL UNIQUE,
  product_title TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_size_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view size charts"
ON public.product_size_charts FOR SELECT
USING (true);

CREATE POLICY "Admins can insert size charts"
ON public.product_size_charts FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update size charts"
ON public.product_size_charts FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete size charts"
ON public.product_size_charts FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_size_charts_updated_at
BEFORE UPDATE ON public.product_size_charts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
