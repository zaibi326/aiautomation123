-- Create login_attempts table for security auditing
CREATE TABLE public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id UUID,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  login_type TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view all login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow insert for logging (service role or authenticated)
CREATE POLICY "Allow insert for logging"
ON public.login_attempts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow anonymous insert for failed attempts before auth
CREATE POLICY "Allow anonymous insert for logging"
ON public.login_attempts
FOR INSERT
TO anon
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at DESC);