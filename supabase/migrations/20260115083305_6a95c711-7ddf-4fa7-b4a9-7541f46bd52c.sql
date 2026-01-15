-- Create a table to track users who have been granted free access by admin
CREATE TABLE public.user_free_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    user_email TEXT NOT NULL,
    granted_by UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_free_access ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage free access
CREATE POLICY "Admins can manage free access"
ON public.user_free_access
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Policy: Users can check their own free access status
CREATE POLICY "Users can check own free access"
ON public.user_free_access
FOR SELECT
USING (auth.uid() = user_id);