
-- Create workflow_exports tracking table
CREATE TABLE public.workflow_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  automation_id uuid NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  license_token uuid NOT NULL DEFAULT gen_random_uuid(),
  exported_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_export_limits table to track monthly usage
CREATE TABLE public.user_export_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  exports_this_month integer NOT NULL DEFAULT 0,
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_export_limits ENABLE ROW LEVEL SECURITY;

-- RLS for workflow_exports
CREATE POLICY "Users can view own exports" ON public.workflow_exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all exports" ON public.workflow_exports
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert exports" ON public.workflow_exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for user_export_limits
CREATE POLICY "Users can view own limits" ON public.user_export_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own limits" ON public.user_export_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own limits" ON public.user_export_limits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all limits" ON public.user_export_limits
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all limits" ON public.user_export_limits
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
