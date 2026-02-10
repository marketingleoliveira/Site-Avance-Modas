
-- Create table for support ticket notes/comments with author tracking
CREATE TABLE public.support_ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  action_taken TEXT, -- optional: status change description
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_ticket_notes ENABLE ROW LEVEL SECURITY;

-- Only admins can read notes
CREATE POLICY "Admins can view ticket notes"
ON public.support_ticket_notes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can create notes
CREATE POLICY "Admins can create ticket notes"
ON public.support_ticket_notes
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete notes
CREATE POLICY "Admins can delete ticket notes"
ON public.support_ticket_notes
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_ticket_notes;
