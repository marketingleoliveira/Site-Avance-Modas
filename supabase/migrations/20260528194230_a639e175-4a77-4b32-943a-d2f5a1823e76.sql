CREATE SEQUENCE IF NOT EXISTS public.wholesale_order_number_seq START 129;

ALTER TABLE public.wholesale_orders ADD COLUMN IF NOT EXISTS order_number text UNIQUE;

CREATE OR REPLACE FUNCTION public.set_wholesale_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := LPAD(nextval('public.wholesale_order_number_seq')::text, 5, '0') || 'A';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_wholesale_order_number_trg ON public.wholesale_orders;
CREATE TRIGGER set_wholesale_order_number_trg
BEFORE INSERT ON public.wholesale_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_wholesale_order_number();

-- Backfill existing rows without firing validation triggers
ALTER TABLE public.wholesale_orders DISABLE TRIGGER validate_wholesale_order_trg;
ALTER TABLE public.wholesale_orders DISABLE TRIGGER validate_wholesale_order_trigger;

DO $$
DECLARE
  r RECORD;
  i INT := 1;
BEGIN
  FOR r IN SELECT id FROM public.wholesale_orders WHERE order_number IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.wholesale_orders SET order_number = LPAD(i::text, 5, '0') || 'L' WHERE id = r.id;
    i := i + 1;
  END LOOP;
END $$;

ALTER TABLE public.wholesale_orders ENABLE TRIGGER validate_wholesale_order_trg;
ALTER TABLE public.wholesale_orders ENABLE TRIGGER validate_wholesale_order_trigger;

DROP POLICY IF EXISTS "Admins can delete wholesale orders" ON public.wholesale_orders;
