CREATE TABLE public.restock_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id text NOT NULL,
  product_title text NOT NULL,
  handle text NOT NULL,
  variant_title text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('restock','soldout')),
  quantity integer,
  previous_quantity integer,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_restock_events_occurred_at ON public.restock_events (occurred_at DESC);
CREATE INDEX idx_restock_events_variant ON public.restock_events (variant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.restock_events TO authenticated;
GRANT ALL ON public.restock_events TO service_role;
ALTER TABLE public.restock_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view restock events" ON public.restock_events FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert restock events" ON public.restock_events FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete restock events" ON public.restock_events FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.restock_snapshots (
  variant_id text PRIMARY KEY,
  product_title text NOT NULL DEFAULT '',
  handle text NOT NULL DEFAULT '',
  variant_title text NOT NULL DEFAULT '',
  available boolean NOT NULL DEFAULT false,
  quantity integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.restock_snapshots TO authenticated;
GRANT ALL ON public.restock_snapshots TO service_role;
ALTER TABLE public.restock_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view restock snapshots" ON public.restock_snapshots FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can upsert restock snapshots" ON public.restock_snapshots FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update restock snapshots" ON public.restock_snapshots FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete restock snapshots" ON public.restock_snapshots FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.restock_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restock_events;