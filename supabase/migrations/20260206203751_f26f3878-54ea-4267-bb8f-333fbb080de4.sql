-- Create real-time support tickets table
CREATE TABLE public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Customer info
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_whatsapp TEXT,
    
    -- Ticket details
    product_handle TEXT,
    product_title TEXT,
    issue_type TEXT NOT NULL DEFAULT 'compra',
    description TEXT NOT NULL,
    
    -- Status management
    status TEXT NOT NULL DEFAULT 'aberto',
    admin_response TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Session tracking
    session_id TEXT
);

-- Enable Row Level Security
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Anyone can create support tickets
CREATE POLICY "Anyone can create support tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all tickets
CREATE POLICY "Admins can view all support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update tickets
CREATE POLICY "Admins can update support tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete tickets
CREATE POLICY "Admins can delete support tickets" 
ON public.support_tickets 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;