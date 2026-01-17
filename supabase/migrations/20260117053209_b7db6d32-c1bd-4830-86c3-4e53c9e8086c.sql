-- Add preview_json column to store automation template preview data
ALTER TABLE public.automations 
ADD COLUMN preview_json JSONB DEFAULT NULL;

-- Add a comment to explain the column
COMMENT ON COLUMN public.automations.preview_json IS 'Stores JSON preview data for the automation template';