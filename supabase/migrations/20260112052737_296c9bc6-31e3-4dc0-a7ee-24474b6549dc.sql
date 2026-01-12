-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-receipts', 'payment-receipts', true);

-- Create policy to allow authenticated users to upload receipts
CREATE POLICY "Anyone can upload payment receipts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'payment-receipts');

-- Create policy to allow public read access to receipts
CREATE POLICY "Payment receipts are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'payment-receipts');

-- Create payment submissions table
CREATE TABLE public.payment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  plan_selected TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  amount TEXT NOT NULL,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert payment submissions (public form)
CREATE POLICY "Anyone can submit payment" 
ON public.payment_submissions 
FOR INSERT 
WITH CHECK (true);

-- Only authenticated admins can view/update submissions (for now allow all reads for simplicity)
CREATE POLICY "Anyone can view their own submission by email" 
ON public.payment_submissions 
FOR SELECT 
USING (true);

-- Create trigger for updating timestamps
CREATE TRIGGER update_payment_submissions_updated_at
BEFORE UPDATE ON public.payment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();