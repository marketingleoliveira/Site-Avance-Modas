-- Tabela de cupons gerenciados no admin (espelho local dos códigos do Shopify)
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  description text,
  discount_percent numeric NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  is_active boolean NOT NULL DEFAULT true,
  applies_to text NOT NULL DEFAULT 'varejo' CHECK (applies_to IN ('varejo','atacado','all')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Normalizar código para uppercase
CREATE OR REPLACE FUNCTION public.normalize_coupon_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.code = UPPER(TRIM(NEW.code));
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normalize_coupon_code
BEFORE INSERT OR UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION public.normalize_coupon_code();

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler cupons ativos (para validar no carrinho)
CREATE POLICY "Anyone can view active coupons"
ON public.coupons FOR SELECT
USING (is_active = true);

-- Admins podem ver/gerenciar tudo
CREATE POLICY "Admins can view all coupons"
ON public.coupons FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert coupons"
ON public.coupons FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update coupons"
ON public.coupons FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete coupons"
ON public.coupons FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Inserir o cupom inicial AVANCE8
INSERT INTO public.coupons (code, description, discount_percent, applies_to)
VALUES ('AVANCE8', '8% de desconto em todos os produtos do varejo', 8, 'varejo');