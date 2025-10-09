-- Create table to store sent tickets
CREATE TABLE public.tickets_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_value DECIMAL(10,2) NOT NULL,
  delivery_rate DECIMAL(5,2) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  link_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for system configuration
CREATE TABLE public.system_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  interval_minutes INTEGER NOT NULL DEFAULT 20,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default config
INSERT INTO public.system_config (is_active, interval_minutes) 
VALUES (false, 20);

-- Enable Row Level Security
ALTER TABLE public.tickets_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an automated system)
CREATE POLICY "Allow public read access to tickets_sent" 
ON public.tickets_sent 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to tickets_sent" 
ON public.tickets_sent 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access to system_config" 
ON public.system_config 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public update to system_config" 
ON public.system_config 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_tickets_sent_date ON public.tickets_sent(sent_at DESC);
CREATE INDEX idx_tickets_sent_value ON public.tickets_sent(ticket_value);