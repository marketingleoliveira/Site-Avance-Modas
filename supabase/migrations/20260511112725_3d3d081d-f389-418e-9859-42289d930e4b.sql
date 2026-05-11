
-- 1. Make sac-attachments bucket PRIVATE and remove public read
UPDATE storage.buckets SET public = false WHERE id = 'sac-attachments';

DROP POLICY IF EXISTS "Anyone can view SAC attachments" ON storage.objects;

CREATE POLICY "Admins can view SAC attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'sac-attachments'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Realtime channel authorization: restrict realtime.messages to admins
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can receive realtime messages" ON realtime.messages;
CREATE POLICY "Admins can receive realtime messages"
ON realtime.messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Wholesale orders: add lightweight server-side validation to prevent garbage submissions
CREATE OR REPLACE FUNCTION public.validate_wholesale_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF length(coalesce(NEW.customer_name, '')) < 2 OR length(NEW.customer_name) > 200 THEN
    RAISE EXCEPTION 'Invalid customer_name';
  END IF;
  IF NEW.customer_email !~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid customer_email';
  END IF;
  IF length(regexp_replace(coalesce(NEW.customer_whatsapp, ''), '\D', '', 'g')) < 8 THEN
    RAISE EXCEPTION 'Invalid customer_whatsapp';
  END IF;
  IF jsonb_typeof(NEW.cart_items) <> 'array' OR jsonb_array_length(NEW.cart_items) = 0 THEN
    RAISE EXCEPTION 'cart_items must be a non-empty array';
  END IF;
  IF jsonb_array_length(NEW.cart_items) > 500 THEN
    RAISE EXCEPTION 'cart_items too large';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_wholesale_order_trigger ON public.wholesale_orders;
CREATE TRIGGER validate_wholesale_order_trigger
BEFORE INSERT OR UPDATE ON public.wholesale_orders
FOR EACH ROW EXECUTE FUNCTION public.validate_wholesale_order();
