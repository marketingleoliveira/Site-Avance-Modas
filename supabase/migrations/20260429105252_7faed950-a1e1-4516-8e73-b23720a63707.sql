ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS product_handles text[] NOT NULL DEFAULT '{}'::text[];

COMMENT ON COLUMN public.coupons.product_handles IS 'Lista de handles de produtos do Shopify elegíveis ao cupom. Se vazio, vale para todos os produtos do escopo applies_to.';