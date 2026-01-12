-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update payment_submissions policies for admin access
DROP POLICY IF EXISTS "Anyone can view their own submission by email" ON public.payment_submissions;

-- Admins can view all payment submissions
CREATE POLICY "Admins can view all payment submissions"
ON public.payment_submissions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update payment submissions
CREATE POLICY "Admins can update payment submissions"
ON public.payment_submissions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete payment submissions
CREATE POLICY "Admins can delete payment submissions"
ON public.payment_submissions
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));