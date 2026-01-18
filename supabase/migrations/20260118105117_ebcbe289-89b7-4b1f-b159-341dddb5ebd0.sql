-- Now delete empty/junk subcategories and categories that are not in our main list

-- First, delete subcategories that have no automations and belong to junk categories
DELETE FROM automation_subcategories 
WHERE category_id IN (
  SELECT id FROM automation_categories 
  WHERE name NOT IN (
    'AI & Chatbots', 'Email Automation', 'CRM & Sales', 'Social Media Management',
    'WhatsApp Automation', 'Telegram Automation', 'Document & Files', 'Project Management',
    'E-commerce', 'Web Scraping & Data', 'Developer Tools', 'API & Webhooks',
    'Communication', 'Calendar & Scheduling', 'Marketing Automation', 'Finance & Accounting',
    'Analytics', 'Data Integration', 'HR & Recruitment', 'Productivity', 'General Automation'
  )
)
AND id NOT IN (SELECT subcategory_id FROM automations);

-- Delete junk categories that have no subcategories
DELETE FROM automation_categories 
WHERE name NOT IN (
  'AI & Chatbots', 'Email Automation', 'CRM & Sales', 'Social Media Management',
  'WhatsApp Automation', 'Telegram Automation', 'Document & Files', 'Project Management',
  'E-commerce', 'Web Scraping & Data', 'Developer Tools', 'API & Webhooks',
  'Communication', 'Calendar & Scheduling', 'Marketing Automation', 'Finance & Accounting',
  'Analytics', 'Data Integration', 'HR & Recruitment', 'Productivity', 'General Automation'
)
AND id NOT IN (SELECT category_id FROM automation_subcategories);

-- Also delete empty subcategories from main categories (that have no automations)
DELETE FROM automation_subcategories 
WHERE id NOT IN (SELECT DISTINCT subcategory_id FROM automations);

SELECT 'Cleaned up junk categories' as status;