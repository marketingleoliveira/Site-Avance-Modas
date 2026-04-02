
CREATE TABLE public.wholesale_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_whatsapp text NOT NULL,
  cart_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  admin_notes text,
  currency_code text NOT NULL DEFAULT 'BRL'
);

ALTER TABLE public.wholesale_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create wholesale orders"
  ON public.wholesale_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view wholesale orders"
  ON public.wholesale_orders FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update wholesale orders"
  ON public.wholesale_orders FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete wholesale orders"
  ON public.wholesale_orders FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_wholesale_orders_updated_at
  BEFORE UPDATE ON public.wholesale_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
