
ALTER TABLE public.wholesale_orders
  ADD COLUMN IF NOT EXISTS customer_document text,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS shipping_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_region text,
  ADD COLUMN IF NOT EXISTS payment_method text;

CREATE OR REPLACE FUNCTION public.validate_wholesale_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  doc_digits text;
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
  doc_digits := regexp_replace(coalesce(NEW.customer_document, ''), '\D', '', 'g');
  IF length(doc_digits) NOT IN (11, 14) THEN
    RAISE EXCEPTION 'Invalid customer_document (CPF or CNPJ required)';
  END IF;
  IF NEW.payment_method IS NULL OR NEW.payment_method NOT IN ('pix','credit_card_3x') THEN
    RAISE EXCEPTION 'Invalid payment_method';
  END IF;
  IF jsonb_typeof(NEW.shipping_address) <> 'object'
     OR coalesce(NEW.shipping_address->>'cep','') = ''
     OR coalesce(NEW.shipping_address->>'street','') = ''
     OR coalesce(NEW.shipping_address->>'number','') = ''
     OR coalesce(NEW.shipping_address->>'city','') = ''
     OR coalesce(NEW.shipping_address->>'state','') = '' THEN
    RAISE EXCEPTION 'Invalid shipping_address';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS validate_wholesale_order_trg ON public.wholesale_orders;
CREATE TRIGGER validate_wholesale_order_trg
BEFORE INSERT OR UPDATE ON public.wholesale_orders
FOR EACH ROW EXECUTE FUNCTION public.validate_wholesale_order();
