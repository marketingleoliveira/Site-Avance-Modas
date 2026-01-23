-- Create table for SAC (customer service) tickets
CREATE TABLE public.sac_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  order_number TEXT,
  ticket_type TEXT NOT NULL DEFAULT 'reclamacao',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sac_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit tickets
CREATE POLICY "Anyone can create SAC tickets"
  ON public.sac_tickets FOR INSERT
  WITH CHECK (true);

-- Only admins can view tickets
CREATE POLICY "Admins can view all tickets"
  ON public.sac_tickets FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update tickets
CREATE POLICY "Admins can update tickets"
  ON public.sac_tickets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete tickets
CREATE POLICY "Admins can delete tickets"
  ON public.sac_tickets FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_sac_tickets_updated_at
  BEFORE UPDATE ON public.sac_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_sac_tickets_status ON public.sac_tickets(status);
CREATE INDEX idx_sac_tickets_created_at ON public.sac_tickets(created_at DESC);