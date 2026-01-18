-- Create a stored procedure to consolidate categories
-- This will move all automations to proper main categories and delete junk categories

-- First, let's define main categories we want to keep (18 main categories)
DO $$
DECLARE
  main_cats TEXT[] := ARRAY[
    'AI & Chatbots', 'Email Automation', 'CRM & Sales', 'Social Media Management',
    'WhatsApp Automation', 'Telegram Automation', 'Document & Files', 'Project Management',
    'E-commerce', 'Web Scraping & Data', 'Developer Tools', 'API & Webhooks',
    'Communication', 'Calendar & Scheduling', 'Marketing Automation', 'Finance & Accounting',
    'Analytics', 'Data Integration', 'HR & Recruitment', 'Productivity', 'General Automation'
  ];
  cat TEXT;
  cat_id UUID;
  default_subcat_id UUID;
BEGIN
  -- Ensure all main categories exist
  FOREACH cat IN ARRAY main_cats LOOP
    INSERT INTO automation_categories (name, description, icon)
    VALUES (cat, cat || ' workflows', 'Workflow')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Create a "General" subcategory for each main category if it doesn't exist
INSERT INTO automation_subcategories (category_id, name, description, icon)
SELECT c.id, 'General', 'General ' || c.name, 'Folder'
FROM automation_categories c
WHERE c.name IN (
  'AI & Chatbots', 'Email Automation', 'CRM & Sales', 'Social Media Management',
  'WhatsApp Automation', 'Telegram Automation', 'Document & Files', 'Project Management',
  'E-commerce', 'Web Scraping & Data', 'Developer Tools', 'API & Webhooks',
  'Communication', 'Calendar & Scheduling', 'Marketing Automation', 'Finance & Accounting',
  'Analytics', 'Data Integration', 'HR & Recruitment', 'Productivity', 'General Automation'
)
AND NOT EXISTS (
  SELECT 1 FROM automation_subcategories s WHERE s.category_id = c.id AND s.name = 'General'
)
ON CONFLICT DO NOTHING;

-- Get the default subcategory ID for General Automation
-- We'll move orphaned workflows here
SELECT 'Created main categories and default subcategories' as status;