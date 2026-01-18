-- Move remaining automations from social media specific categories to Social Media Management
DO $$
DECLARE
  social_subcat_id UUID;
BEGIN
  SELECT s.id INTO social_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Social Media Management' LIMIT 1;
  
  -- Move Instagram, Facebook, Twitter, YouTube automations to Social Media Management
  UPDATE automations a SET subcategory_id = social_subcat_id
  WHERE social_subcat_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM automation_subcategories s
    JOIN automation_categories c ON s.category_id = c.id
    WHERE s.id = a.subcategory_id
    AND c.name IN ('Instagram Automation', 'Facebook Automation', 'Twitter/X Automation', 'YouTube Automation', 'LinkedIn Automation', 'TikTok Automation')
  );
END $$;

-- Move n8n Templates to General Automation
DO $$
DECLARE
  general_subcat_id UUID;
BEGIN
  SELECT s.id INTO general_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'General Automation' LIMIT 1;
  
  UPDATE automations a SET subcategory_id = general_subcat_id
  WHERE general_subcat_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM automation_subcategories s
    JOIN automation_categories c ON s.category_id = c.id
    WHERE s.id = a.subcategory_id
    AND c.name IN ('n8n Templates', 'Make.com Templates', 'Misc', 'Manual', 'Automation')
  );
END $$;

-- Delete subcategories with no automations again
DELETE FROM automation_subcategories 
WHERE id NOT IN (SELECT DISTINCT subcategory_id FROM automations);

-- Delete empty categories
DELETE FROM automation_categories 
WHERE id NOT IN (SELECT DISTINCT category_id FROM automation_subcategories);

SELECT 'Final cleanup done' as status;