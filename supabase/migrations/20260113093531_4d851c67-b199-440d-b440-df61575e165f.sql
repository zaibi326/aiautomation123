-- Create automation categories table
CREATE TABLE public.automation_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation subcategories table
CREATE TABLE public.automation_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.automation_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'file',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automations table
CREATE TABLE public.automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id UUID NOT NULL REFERENCES public.automation_subcategories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'zap',
  uses_count INTEGER DEFAULT 0,
  download_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Anyone can view categories" ON public.automation_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view subcategories" ON public.automation_subcategories FOR SELECT USING (true);
CREATE POLICY "Anyone can view automations" ON public.automations FOR SELECT USING (is_active = true);

-- Admin write access
CREATE POLICY "Admins can manage categories" ON public.automation_categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage subcategories" ON public.automation_subcategories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage automations" ON public.automations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_subcategories_category ON public.automation_subcategories(category_id);
CREATE INDEX idx_automations_subcategory ON public.automations(subcategory_id);

-- Add triggers for updated_at
CREATE TRIGGER update_automation_categories_updated_at BEFORE UPDATE ON public.automation_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automation_subcategories_updated_at BEFORE UPDATE ON public.automation_subcategories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();