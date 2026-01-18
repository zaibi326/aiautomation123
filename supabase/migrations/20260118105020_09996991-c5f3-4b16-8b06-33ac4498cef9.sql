-- Now let's consolidate: Move all automations from junk categories to proper main categories
-- based on keyword matching in their titles

-- Step 1: Get the default subcategory ID for "General Automation" -> "General"
DO $$
DECLARE
  general_subcat_id UUID;
  ai_subcat_id UUID;
  email_subcat_id UUID;
  crm_subcat_id UUID;
  social_subcat_id UUID;
  whatsapp_subcat_id UUID;
  telegram_subcat_id UUID;
  doc_subcat_id UUID;
  project_subcat_id UUID;
  ecom_subcat_id UUID;
  scraping_subcat_id UUID;
  dev_subcat_id UUID;
  api_subcat_id UUID;
  comm_subcat_id UUID;
  calendar_subcat_id UUID;
  marketing_subcat_id UUID;
  finance_subcat_id UUID;
  analytics_subcat_id UUID;
  data_subcat_id UUID;
BEGIN
  -- Get subcategory IDs for main categories
  SELECT s.id INTO general_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'General Automation' AND s.name = 'General' LIMIT 1;
    
  SELECT s.id INTO ai_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'AI & Chatbots' LIMIT 1;
    
  SELECT s.id INTO email_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Email Automation' LIMIT 1;
    
  SELECT s.id INTO crm_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'CRM & Sales' LIMIT 1;
    
  SELECT s.id INTO social_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Social Media Management' LIMIT 1;
    
  SELECT s.id INTO whatsapp_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'WhatsApp Automation' LIMIT 1;
    
  SELECT s.id INTO telegram_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Telegram Automation' LIMIT 1;
    
  SELECT s.id INTO doc_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Document & Files' LIMIT 1;
    
  SELECT s.id INTO project_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Project Management' LIMIT 1;
    
  SELECT s.id INTO ecom_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'E-commerce' LIMIT 1;
    
  SELECT s.id INTO scraping_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Web Scraping & Data' LIMIT 1;
    
  SELECT s.id INTO dev_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Developer Tools' LIMIT 1;
    
  SELECT s.id INTO api_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'API & Webhooks' LIMIT 1;
    
  SELECT s.id INTO comm_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Communication' LIMIT 1;
    
  SELECT s.id INTO calendar_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Calendar & Scheduling' LIMIT 1;
    
  SELECT s.id INTO marketing_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Marketing Automation' LIMIT 1;
    
  SELECT s.id INTO data_subcat_id FROM automation_subcategories s 
    JOIN automation_categories c ON s.category_id = c.id 
    WHERE c.name = 'Data Integration' LIMIT 1;

  -- Update automations based on title keywords
  -- AI & Chatbots
  UPDATE automations SET subcategory_id = ai_subcat_id
  WHERE (LOWER(title) LIKE '%ai %' OR LOWER(title) LIKE '%openai%' OR LOWER(title) LIKE '%gpt%' 
    OR LOWER(title) LIKE '%chatbot%' OR LOWER(title) LIKE '%llm%' OR LOWER(title) LIKE '%claude%'
    OR LOWER(title) LIKE '%gemini%' OR LOWER(title) LIKE '%agent%' OR LOWER(title) LIKE '%rag%')
  AND ai_subcat_id IS NOT NULL;
  
  -- WhatsApp (before general messaging)
  UPDATE automations SET subcategory_id = whatsapp_subcat_id
  WHERE LOWER(title) LIKE '%whatsapp%'
  AND whatsapp_subcat_id IS NOT NULL;
  
  -- Telegram (before general messaging)
  UPDATE automations SET subcategory_id = telegram_subcat_id
  WHERE LOWER(title) LIKE '%telegram%'
  AND telegram_subcat_id IS NOT NULL;
  
  -- Email
  UPDATE automations SET subcategory_id = email_subcat_id
  WHERE (LOWER(title) LIKE '%email%' OR LOWER(title) LIKE '%gmail%' OR LOWER(title) LIKE '%outlook%' 
    OR LOWER(title) LIKE '%mailchimp%' OR LOWER(title) LIKE '%sendgrid%' OR LOWER(title) LIKE '%smtp%')
  AND email_subcat_id IS NOT NULL;
  
  -- CRM & Sales
  UPDATE automations SET subcategory_id = crm_subcat_id
  WHERE (LOWER(title) LIKE '%crm%' OR LOWER(title) LIKE '%hubspot%' OR LOWER(title) LIKE '%salesforce%' 
    OR LOWER(title) LIKE '%pipedrive%' OR LOWER(title) LIKE '%lead%' OR LOWER(title) LIKE '%sales%')
  AND crm_subcat_id IS NOT NULL;
  
  -- Social Media
  UPDATE automations SET subcategory_id = social_subcat_id
  WHERE (LOWER(title) LIKE '%facebook%' OR LOWER(title) LIKE '%instagram%' OR LOWER(title) LIKE '%twitter%' 
    OR LOWER(title) LIKE '%linkedin%' OR LOWER(title) LIKE '%tiktok%' OR LOWER(title) LIKE '%youtube%'
    OR LOWER(title) LIKE '%social%')
  AND social_subcat_id IS NOT NULL;
  
  -- Document & Files
  UPDATE automations SET subcategory_id = doc_subcat_id
  WHERE (LOWER(title) LIKE '%pdf%' OR LOWER(title) LIKE '%document%' OR LOWER(title) LIKE '%file%' 
    OR LOWER(title) LIKE '%google drive%' OR LOWER(title) LIKE '%dropbox%' OR LOWER(title) LIKE '%excel%'
    OR LOWER(title) LIKE '%spreadsheet%')
  AND doc_subcat_id IS NOT NULL;
  
  -- Project Management
  UPDATE automations SET subcategory_id = project_subcat_id
  WHERE (LOWER(title) LIKE '%notion%' OR LOWER(title) LIKE '%trello%' OR LOWER(title) LIKE '%asana%' 
    OR LOWER(title) LIKE '%jira%' OR LOWER(title) LIKE '%monday%' OR LOWER(title) LIKE '%clickup%'
    OR LOWER(title) LIKE '%project%' OR LOWER(title) LIKE '%task%')
  AND project_subcat_id IS NOT NULL;
  
  -- E-commerce
  UPDATE automations SET subcategory_id = ecom_subcat_id
  WHERE (LOWER(title) LIKE '%shopify%' OR LOWER(title) LIKE '%woocommerce%' OR LOWER(title) LIKE '%ecommerce%' 
    OR LOWER(title) LIKE '%e-commerce%' OR LOWER(title) LIKE '%order%' OR LOWER(title) LIKE '%product%'
    OR LOWER(title) LIKE '%shop%' OR LOWER(title) LIKE '%store%')
  AND ecom_subcat_id IS NOT NULL;
  
  -- Web Scraping
  UPDATE automations SET subcategory_id = scraping_subcat_id
  WHERE (LOWER(title) LIKE '%scrape%' OR LOWER(title) LIKE '%scraping%' OR LOWER(title) LIKE '%extract%' 
    OR LOWER(title) LIKE '%crawl%')
  AND scraping_subcat_id IS NOT NULL;
  
  -- Developer Tools
  UPDATE automations SET subcategory_id = dev_subcat_id
  WHERE (LOWER(title) LIKE '%github%' OR LOWER(title) LIKE '%gitlab%' OR LOWER(title) LIKE '%code%' 
    OR LOWER(title) LIKE '%deploy%' OR LOWER(title) LIKE '%cicd%' OR LOWER(title) LIKE '%ci/cd%'
    OR LOWER(title) LIKE '%docker%' OR LOWER(title) LIKE '%developer%')
  AND dev_subcat_id IS NOT NULL;
  
  -- API & Webhooks
  UPDATE automations SET subcategory_id = api_subcat_id
  WHERE (LOWER(title) LIKE '%webhook%' OR LOWER(title) LIKE '%api%' OR LOWER(title) LIKE '%http%' 
    OR LOWER(title) LIKE '%rest%' OR LOWER(title) LIKE '%endpoint%')
  AND api_subcat_id IS NOT NULL;
  
  -- Communication (Slack, Discord, etc.)
  UPDATE automations SET subcategory_id = comm_subcat_id
  WHERE (LOWER(title) LIKE '%slack%' OR LOWER(title) LIKE '%discord%' OR LOWER(title) LIKE '%teams%' 
    OR LOWER(title) LIKE '%chat%' OR LOWER(title) LIKE '%message%' OR LOWER(title) LIKE '%notification%')
  AND comm_subcat_id IS NOT NULL;
  
  -- Calendar & Scheduling
  UPDATE automations SET subcategory_id = calendar_subcat_id
  WHERE (LOWER(title) LIKE '%calendar%' OR LOWER(title) LIKE '%schedule%' OR LOWER(title) LIKE '%meeting%' 
    OR LOWER(title) LIKE '%appointment%' OR LOWER(title) LIKE '%booking%')
  AND calendar_subcat_id IS NOT NULL;
  
  -- Data Integration
  UPDATE automations SET subcategory_id = data_subcat_id
  WHERE (LOWER(title) LIKE '%database%' OR LOWER(title) LIKE '%postgres%' OR LOWER(title) LIKE '%mysql%' 
    OR LOWER(title) LIKE '%supabase%' OR LOWER(title) LIKE '%airtable%' OR LOWER(title) LIKE '%sync%'
    OR LOWER(title) LIKE '%integration%' OR LOWER(title) LIKE '%data%')
  AND data_subcat_id IS NOT NULL;
  
  -- Finally, move any remaining automations (in junk categories) to General Automation
  UPDATE automations a SET subcategory_id = general_subcat_id
  WHERE general_subcat_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM automation_subcategories s
    JOIN automation_categories c ON s.category_id = c.id
    WHERE s.id = a.subcategory_id
    AND c.name NOT IN (
      'AI & Chatbots', 'Email Automation', 'CRM & Sales', 'Social Media Management',
      'WhatsApp Automation', 'Telegram Automation', 'Document & Files', 'Project Management',
      'E-commerce', 'Web Scraping & Data', 'Developer Tools', 'API & Webhooks',
      'Communication', 'Calendar & Scheduling', 'Marketing Automation', 'Finance & Accounting',
      'Analytics', 'Data Integration', 'HR & Recruitment', 'Productivity', 'General Automation'
    )
  );
  
END $$;

SELECT 'Moved automations to proper categories' as status;