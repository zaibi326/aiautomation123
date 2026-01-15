-- Create app_settings table for admin controls
CREATE TABLE public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Anyone can read settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default setting for download permission
INSERT INTO public.app_settings (key, value, description)
VALUES ('allow_user_downloads', 'true', 'Whether users can download automations');

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();