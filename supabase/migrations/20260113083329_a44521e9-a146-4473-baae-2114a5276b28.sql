-- Add user_id column to payment_submissions to link payments to authenticated users
ALTER TABLE public.payment_submissions 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX idx_payment_submissions_user_id ON public.payment_submissions(user_id);

-- Update RLS policy to allow users to view their own payments
CREATE POLICY "Users can view their own payments" 
ON public.payment_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a user_subscriptions table for tracking active subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  payment_id uuid REFERENCES public.payment_submissions(id),
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for user lookups
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);