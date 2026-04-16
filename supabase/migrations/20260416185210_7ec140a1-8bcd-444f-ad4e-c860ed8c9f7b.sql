CREATE TABLE public.return_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  order_number TEXT NOT NULL,
  shopify_order_id TEXT,
  order_date TIMESTAMPTZ,
  item_title TEXT NOT NULL,
  item_variant TEXT,
  item_quantity INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  admin_notes TEXT
);

ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create return requests"
  ON public.return_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view return requests"
  ON public.return_requests FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update return requests"
  ON public.return_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete return requests"
  ON public.return_requests FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_return_requests_updated_at
  BEFORE UPDATE ON public.return_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();