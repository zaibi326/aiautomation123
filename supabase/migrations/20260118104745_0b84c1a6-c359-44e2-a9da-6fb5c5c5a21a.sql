-- Step 1: Create a comprehensive mapping from any category name pattern to main categories
-- First, let's define the main categories we want to keep

-- Create mapping table for consolidation
CREATE TEMP TABLE category_mapping (
  pattern TEXT,
  target_category TEXT,
  target_subcategory TEXT
);

-- Insert mapping rules
INSERT INTO category_mapping VALUES
-- AI & Chatbots mappings
('AI', 'AI & Chatbots', 'AI Automation'),
('Chatbot', 'AI & Chatbots', 'Chatbots'),
('OpenAI', 'AI & Chatbots', 'AI Automation'),
('LLM', 'AI & Chatbots', 'AI Automation'),
('GPT', 'AI & Chatbots', 'AI Automation'),
('Machine Learning', 'AI & Chatbots', 'AI Automation'),
('RAG', 'AI & Chatbots', 'RAG & Embeddings'),

-- Email mappings
('Email', 'Email Automation', 'Email Workflows'),
('Gmail', 'Email Automation', 'Email Workflows'),
('Outlook', 'Email Automation', 'Email Workflows'),
('IMAP', 'Email Automation', 'Email Workflows'),
('SMTP', 'Email Automation', 'Email Workflows'),
('Mailchimp', 'Email Automation', 'Email Marketing'),

-- CRM & Sales mappings
('CRM', 'CRM & Sales', 'Lead Management'),
('Sales', 'CRM & Sales', 'Sales Automation'),
('Lead', 'CRM & Sales', 'Lead Management'),
('Pipeline', 'CRM & Sales', 'Deal Tracking'),
('HubSpot', 'CRM & Sales', 'Lead Management'),
('Salesforce', 'CRM & Sales', 'Lead Management'),
('Pipedrive', 'CRM & Sales', 'Deal Tracking'),

-- Social Media mappings
('Social', 'Social Media Management', 'Social Automation'),
('Facebook', 'Social Media Management', 'Social Automation'),
('Instagram', 'Social Media Management', 'Social Automation'),
('Twitter', 'Social Media Management', 'Social Automation'),
('LinkedIn', 'Social Media Management', 'Social Automation'),
('TikTok', 'Social Media Management', 'Social Automation'),
('YouTube', 'Social Media Management', 'Video Content'),

-- WhatsApp mappings
('WhatsApp', 'WhatsApp Automation', 'WhatsApp Workflows'),

-- Telegram mappings
('Telegram', 'Telegram Automation', 'Telegram Workflows'),

-- Document & Files mappings
('Document', 'Document & Files', 'File Automation'),
('PDF', 'Document & Files', 'PDF Processing'),
('File', 'Document & Files', 'File Automation'),
('Excel', 'Document & Files', 'File Automation'),
('Google Drive', 'Document & Files', 'File Storage'),
('Dropbox', 'Document & Files', 'File Storage'),
('Storage', 'Document & Files', 'File Storage'),

-- Project Management mappings
('Project', 'Project Management', 'Task Management'),
('Task', 'Project Management', 'Task Management'),
('Notion', 'Project Management', 'Task Management'),
('Trello', 'Project Management', 'Task Management'),
('Asana', 'Project Management', 'Task Management'),
('Jira', 'Project Management', 'Task Management'),
('Monday', 'Project Management', 'Task Management'),
('ClickUp', 'Project Management', 'Task Management'),

-- E-commerce mappings
('Commerce', 'E-commerce', 'E-commerce Automation'),
('Shop', 'E-commerce', 'E-commerce Automation'),
('Shopify', 'E-commerce', 'E-commerce Automation'),
('WooCommerce', 'E-commerce', 'E-commerce Automation'),
('Order', 'E-commerce', 'Order Management'),
('Product', 'E-commerce', 'E-commerce Automation'),
('Retail', 'E-commerce', 'E-commerce Automation'),

-- Web Scraping mappings
('Scraping', 'Web Scraping & Data', 'Web Scraping'),
('Scrape', 'Web Scraping & Data', 'Web Scraping'),
('Extract', 'Web Scraping & Data', 'Data Extraction'),
('Data', 'Data Integration', 'Data Sync'),

-- Developer Tools mappings
('Developer', 'Developer Tools', 'Dev Automation'),
('Code', 'Developer Tools', 'Dev Automation'),
('GitHub', 'Developer Tools', 'Git Automation'),
('GitLab', 'Developer Tools', 'Git Automation'),
('Git', 'Developer Tools', 'Git Automation'),
('CI/CD', 'Developer Tools', 'CI/CD'),
('DevOps', 'Developer Tools', 'CI/CD'),
('API', 'API & Webhooks', 'Webhooks'),
('Webhook', 'API & Webhooks', 'Webhooks'),

-- Communication mappings
('Slack', 'Communication', 'Team Messaging'),
('Discord', 'Communication', 'Team Messaging'),
('Teams', 'Communication', 'Team Messaging'),
('Chat', 'Communication', 'Team Messaging'),
('Message', 'Communication', 'Team Messaging'),

-- Calendar mappings
('Calendar', 'Calendar & Scheduling', 'Scheduling'),
('Schedule', 'Calendar & Scheduling', 'Scheduling'),
('Meeting', 'Calendar & Scheduling', 'Meeting Management'),
('Appointment', 'Calendar & Scheduling', 'Scheduling'),

-- Marketing mappings
('Marketing', 'Marketing Automation', 'Marketing Campaigns'),
('Campaign', 'Marketing Automation', 'Marketing Campaigns'),
('SEO', 'Marketing Automation', 'SEO'),
('Ads', 'Marketing Automation', 'Paid Advertising'),

-- Finance mappings
('Finance', 'Finance & Accounting', 'Finance Workflows'),
('Accounting', 'Finance & Accounting', 'Finance Workflows'),
('Invoice', 'Finance & Accounting', 'Finance Workflows'),
('Payment', 'Finance & Accounting', 'Payments'),

-- HR mappings
('HR', 'HR & Recruitment', 'HR Workflows'),
('Recruit', 'HR & Recruitment', 'Recruitment'),
('Employee', 'HR & Recruitment', 'HR Workflows'),

-- Analytics mappings
('Analytics', 'Analytics', 'Reporting'),
('Report', 'Analytics', 'Reporting'),
('Dashboard', 'Analytics', 'Reporting'),

-- Productivity mappings  
('Productivity', 'Productivity', 'Workflows'),
('Automation', 'General Automation', 'Workflows'),
('Workflow', 'General Automation', 'Workflows'),
('Integration', 'Data Integration', 'Data Sync'),

-- Misc categories to consolidate
('Misc', 'General Automation', 'Workflows'),
('General', 'General Automation', 'Workflows'),
('Manual', 'General Automation', 'Workflows'),
('Other', 'General Automation', 'Workflows'),
('Template', 'General Automation', 'Workflows'),
('n8n', 'General Automation', 'Workflows'),

-- Industry specific to General
('Healthcare', 'General Automation', 'Industry Workflows'),
('Real Estate', 'General Automation', 'Industry Workflows'),
('Education', 'General Automation', 'Industry Workflows'),
('Legal', 'General Automation', 'Industry Workflows'),
('Travel', 'General Automation', 'Industry Workflows'),
('Gaming', 'General Automation', 'Industry Workflows'),
('IoT', 'Developer Tools', 'Dev Automation'),
('Manufacturing', 'General Automation', 'Industry Workflows'),
('Agriculture', 'General Automation', 'Industry Workflows'),
('Energy', 'General Automation', 'Industry Workflows'),
('Automotive', 'General Automation', 'Industry Workflows'),
('Government', 'General Automation', 'Industry Workflows'),
('Media', 'Social Media Management', 'Content Publishing'),
('Creative', 'General Automation', 'Workflows');

-- Now let's see what we have
SELECT * FROM category_mapping LIMIT 10;