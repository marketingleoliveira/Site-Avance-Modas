CREATE TABLE public.marketing_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL,
  requester_name TEXT,
  purpose TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  min_time TEXT NOT NULL DEFAULT '',
  max_time TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','retirado','devolvido','atrasado','cancelado')),
  withdrawal_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  signatures JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX marketing_requests_request_number_key ON public.marketing_requests (request_number);
CREATE INDEX marketing_requests_created_at_idx ON public.marketing_requests (created_at DESC);
CREATE INDEX marketing_requests_status_idx ON public.marketing_requests (status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_requests TO authenticated;
GRANT ALL ON public.marketing_requests TO service_role;

ALTER TABLE public.marketing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view marketing requests"
ON public.marketing_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert marketing requests"
ON public.marketing_requests FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update marketing requests"
ON public.marketing_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete marketing requests"
ON public.marketing_requests FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_marketing_requests_updated_at
BEFORE UPDATE ON public.marketing_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();