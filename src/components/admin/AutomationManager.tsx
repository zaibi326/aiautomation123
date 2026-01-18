import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  FolderOpen,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAutomations, AutomationCategory, AutomationSubcategory, Automation } from "@/hooks/useAutomations";
import * as XLSX from "xlsx";
import JSZip from "jszip";

// GitHub raw URL base for workflow templates
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/n8n-io/n8n/master/packages/%40n8n/n8n-nodes-base/nodes";

const AutomationManager = () => {
  const { categories, subcategories, automations, loading, refetch } = useAutomations();
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [subcategoryDialog, setSubcategoryDialog] = useState(false);
  const [automationDialog, setAutomationDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);

  // Form states
  const [editingCategory, setEditingCategory] = useState<AutomationCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<AutomationSubcategory | null>(null);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", icon: "folder" });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: "", description: "", icon: "file", category_id: "" });
  const [automationForm, setAutomationForm] = useState({ 
    title: "", 
    description: "", 
    icon: "zap", 
    subcategory_id: "", 
    download_url: "",
    uses_count: 0,
    preview_json: ""
  });

  // Category CRUD
  const handleSaveCategory = async () => {
    setIsLoading(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("automation_categories")
          .update(categoryForm)
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast.success("Category updated");
      } else {
        const { error } = await supabase
          .from("automation_categories")
          .insert(categoryForm);
        if (error) throw error;
        toast.success("Category created");
      }
      setCategoryDialog(false);
      setCategoryForm({ name: "", description: "", icon: "folder" });
      setEditingCategory(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category and all its subcategories and automations?")) return;
    try {
      const { error } = await supabase.from("automation_categories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Category deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  // Subcategory CRUD
  const handleSaveSubcategory = async () => {
    setIsLoading(true);
    try {
      if (editingSubcategory) {
        const { error } = await supabase
          .from("automation_subcategories")
          .update(subcategoryForm)
          .eq("id", editingSubcategory.id);
        if (error) throw error;
        toast.success("Subcategory updated");
      } else {
        const { error } = await supabase
          .from("automation_subcategories")
          .insert(subcategoryForm);
        if (error) throw error;
        toast.success("Subcategory created");
      }
      setSubcategoryDialog(false);
      setSubcategoryForm({ name: "", description: "", icon: "file", category_id: "" });
      setEditingSubcategory(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save subcategory");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("Delete this subcategory and all its automations?")) return;
    try {
      const { error } = await supabase.from("automation_subcategories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Subcategory deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  // Automation CRUD
  const handleSaveAutomation = async () => {
    setIsLoading(true);
    try {
      // Parse preview_json if provided
      let parsedPreviewJson = null;
      if (automationForm.preview_json.trim()) {
        try {
          parsedPreviewJson = JSON.parse(automationForm.preview_json);
        } catch (e) {
          toast.error("Invalid JSON format in Preview JSON field");
          setIsLoading(false);
          return;
        }
      }

      const dataToSave = {
        title: automationForm.title,
        description: automationForm.description,
        icon: automationForm.icon,
        subcategory_id: automationForm.subcategory_id,
        download_url: automationForm.download_url,
        uses_count: automationForm.uses_count,
        preview_json: parsedPreviewJson
      };

      if (editingAutomation) {
        const { error } = await supabase
          .from("automations")
          .update(dataToSave)
          .eq("id", editingAutomation.id);
        if (error) throw error;
        toast.success("Automation updated");
      } else {
        const { error } = await supabase
          .from("automations")
          .insert(dataToSave);
        if (error) throw error;
        toast.success("Automation created");
      }
      setAutomationDialog(false);
      setAutomationForm({ title: "", description: "", icon: "zap", subcategory_id: "", download_url: "", uses_count: 0, preview_json: "" });
      setEditingAutomation(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save automation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    if (!confirm("Delete this automation?")) return;
    try {
      const { error } = await supabase.from("automations").delete().eq("id", id);
      if (error) throw error;
      toast.success("Automation deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const [jsonUrl, setJsonUrl] = useState("");

  // Smart category detection based on keywords
  const detectCategory = (title: string, description: string): { category: string; subcategory: string } => {
    const text = `${title} ${description}`.toLowerCase();
    
    // Category detection rules with subcategories - ENHANCED with more keywords
    const categoryRules = [
      { 
        keywords: ['whatsapp', 'wa ', 'wa-', 'whats app', 'wapp', 'whatsapp business', 'waba', 'twilio whatsapp'],
        category: 'WhatsApp Automation',
        subcategoryRules: [
          { keywords: ['message', 'send', 'bulk', 'broadcast'], subcategory: 'Message Sending' },
          { keywords: ['bot', 'chatbot', 'auto reply', 'autorespond'], subcategory: 'WhatsApp Bots' },
          { keywords: ['group', 'community'], subcategory: 'Group Management' },
          { keywords: ['catalog', 'product', 'shop'], subcategory: 'WhatsApp Business' },
          { keywords: ['notification', 'alert', 'remind'], subcategory: 'Notifications' },
        ],
        defaultSubcategory: 'WhatsApp Workflows'
      },
      { 
        keywords: ['telegram', 'tg bot', 'telegram bot', 'telegrambotapi'],
        category: 'Telegram Automation',
        subcategoryRules: [
          { keywords: ['bot', 'chatbot'], subcategory: 'Telegram Bots' },
          { keywords: ['channel', 'broadcast'], subcategory: 'Channel Management' },
          { keywords: ['group', 'admin'], subcategory: 'Group Automation' },
          { keywords: ['sticker', 'media', 'file'], subcategory: 'Media Handling' },
        ],
        defaultSubcategory: 'Telegram Workflows'
      },
      { 
        keywords: ['instagram', 'ig ', 'ig-', 'insta', 'reels', 'instagram story', 'instagram post'],
        category: 'Instagram Automation',
        subcategoryRules: [
          { keywords: ['post', 'publish', 'schedule', 'content', 'feed'], subcategory: 'Content Publishing' },
          { keywords: ['story', 'stories', 'reel'], subcategory: 'Stories & Reels' },
          { keywords: ['dm', 'message', 'inbox'], subcategory: 'Direct Messages' },
          { keywords: ['follower', 'follow', 'unfollow'], subcategory: 'Follower Management' },
          { keywords: ['comment', 'engage', 'like'], subcategory: 'Engagement' },
          { keywords: ['analytics', 'insight', 'stats'], subcategory: 'Analytics' },
        ],
        defaultSubcategory: 'Instagram Workflows'
      },
      { 
        keywords: ['facebook', 'fb ', 'fb-', 'meta', 'facebook page', 'facebook group', 'fb ads', 'facebook ads'],
        category: 'Facebook Automation',
        subcategoryRules: [
          { keywords: ['post', 'publish', 'page'], subcategory: 'Page Management' },
          { keywords: ['group', 'community'], subcategory: 'Group Automation' },
          { keywords: ['ads', 'advertising', 'campaign', 'pixel'], subcategory: 'Facebook Ads' },
          { keywords: ['messenger', 'chat', 'inbox'], subcategory: 'Messenger' },
          { keywords: ['lead', 'form'], subcategory: 'Lead Generation' },
        ],
        defaultSubcategory: 'Facebook Workflows'
      },
      { 
        keywords: ['twitter', 'x.com', 'tweet', 'x api', 'twitter api', 'tweetdeck'],
        category: 'Twitter/X Automation',
        subcategoryRules: [
          { keywords: ['tweet', 'post', 'thread'], subcategory: 'Tweet Publishing' },
          { keywords: ['follow', 'unfollow', 'follower'], subcategory: 'Follower Management' },
          { keywords: ['dm', 'message', 'direct'], subcategory: 'Direct Messages' },
          { keywords: ['analytics', 'stats', 'insight'], subcategory: 'Analytics' },
        ],
        defaultSubcategory: 'Twitter Workflows'
      },
      { 
        keywords: ['linkedin', 'li ', 'linkedin post', 'linkedin message', 'linkedin connection'],
        category: 'LinkedIn Automation',
        subcategoryRules: [
          { keywords: ['post', 'article', 'publish'], subcategory: 'Content Publishing' },
          { keywords: ['connect', 'connection', 'network'], subcategory: 'Networking' },
          { keywords: ['message', 'inmail', 'outreach'], subcategory: 'Messaging' },
          { keywords: ['lead', 'sales', 'prospect'], subcategory: 'Lead Generation' },
          { keywords: ['job', 'recruit', 'hire'], subcategory: 'Recruiting' },
        ],
        defaultSubcategory: 'LinkedIn Workflows'
      },
      { 
        keywords: ['tiktok', 'tik tok', 'tiktok video'],
        category: 'TikTok Automation',
        subcategoryRules: [
          { keywords: ['video', 'upload', 'post'], subcategory: 'Video Publishing' },
          { keywords: ['analytics', 'stats'], subcategory: 'Analytics' },
          { keywords: ['trend', 'hashtag'], subcategory: 'Trends' },
        ],
        defaultSubcategory: 'TikTok Workflows'
      },
      { 
        keywords: ['youtube', 'yt ', 'youtube video', 'youtube channel', 'youtube api'],
        category: 'YouTube Automation',
        subcategoryRules: [
          { keywords: ['upload', 'video', 'publish'], subcategory: 'Video Publishing' },
          { keywords: ['comment', 'moderate'], subcategory: 'Comment Management' },
          { keywords: ['analytics', 'stats', 'subscriber'], subcategory: 'Analytics' },
          { keywords: ['playlist', 'organize'], subcategory: 'Playlist Management' },
          { keywords: ['thumbnail', 'title', 'seo'], subcategory: 'Optimization' },
        ],
        defaultSubcategory: 'YouTube Workflows'
      },
      { 
        keywords: ['n8n', 'n8n.io', 'n8n workflow', 'n8n template', 'n8n automation'],
        category: 'n8n Templates',
        subcategoryRules: [
          { keywords: ['trigger', 'webhook', 'schedule'], subcategory: 'Triggers' },
          { keywords: ['integrate', 'connect', 'sync'], subcategory: 'Integrations' },
          { keywords: ['transform', 'process', 'data'], subcategory: 'Data Processing' },
          { keywords: ['api', 'http', 'request'], subcategory: 'API Workflows' },
        ],
        defaultSubcategory: 'n8n Workflows'
      },
      { 
        keywords: ['zapier', 'zap', 'zapier integration', 'zapier automation'],
        category: 'Zapier Templates',
        subcategoryRules: [
          { keywords: ['trigger', 'action'], subcategory: 'Zap Templates' },
          { keywords: ['multi', 'path'], subcategory: 'Multi-Step Zaps' },
        ],
        defaultSubcategory: 'Zapier Workflows'
      },
      { 
        keywords: ['make', 'make.com', 'integromat', 'scenario'],
        category: 'Make.com Templates',
        subcategoryRules: [
          { keywords: ['scenario', 'template'], subcategory: 'Scenarios' },
          { keywords: ['module', 'connect'], subcategory: 'Integrations' },
        ],
        defaultSubcategory: 'Make Workflows'
      },
      { 
        keywords: ['ai', 'gpt', 'openai', 'chatgpt', 'gemini', 'claude', 'llm', 'langchain', 'chatbot', 'assistant', 'anthropic', 'mistral', 'llama', 'perplexity', 'copilot', 'bard', 'ai agent', 'machine learning', 'ml ', 'neural', 'deep learning'],
        category: 'AI & Chatbots',
        subcategoryRules: [
          { keywords: ['chat', 'assistant', 'bot', 'conversation', 'support'], subcategory: 'Chatbots' },
          { keywords: ['generate', 'create', 'write', 'content', 'copy'], subcategory: 'Content Generation' },
          { keywords: ['analyze', 'summary', 'extract', 'summarize'], subcategory: 'AI Analysis' },
          { keywords: ['image', 'dall', 'vision', 'photo', 'midjourney', 'stable diffusion'], subcategory: 'AI Image' },
          { keywords: ['voice', 'speech', 'transcri', 'audio', 'whisper', 'elevenlabs', 'tts'], subcategory: 'AI Voice' },
          { keywords: ['agent', 'autonomous', 'crew', 'autogpt'], subcategory: 'AI Agents' },
          { keywords: ['embed', 'vector', 'rag', 'retrieval'], subcategory: 'RAG & Embeddings' },
        ],
        defaultSubcategory: 'AI Automation'
      },
      { 
        keywords: ['email', 'gmail', 'outlook', 'mailchimp', 'newsletter', 'smtp', 'imap', 'sendgrid', 'mailgun', 'ses', 'postmark', 'resend', 'brevo', 'sendinblue', 'convertkit', 'drip', 'activecampaign'],
        category: 'Email Automation',
        subcategoryRules: [
          { keywords: ['campaign', 'marketing', 'newsletter', 'broadcast'], subcategory: 'Email Marketing' },
          { keywords: ['autorespond', 'reply', 'response', 'auto-reply'], subcategory: 'Auto-Response' },
          { keywords: ['filter', 'sort', 'organize', 'archive', 'label'], subcategory: 'Email Management' },
          { keywords: ['sequence', 'drip', 'nurture'], subcategory: 'Email Sequences' },
          { keywords: ['transactional', 'notification', 'alert'], subcategory: 'Transactional Email' },
        ],
        defaultSubcategory: 'Email Workflows'
      },
      { 
        keywords: ['crm', 'hubspot', 'salesforce', 'pipedrive', 'zoho', 'lead', 'deal', 'contact', 'sales', 'freshsales', 'close.com', 'copper', 'insightly', 'nutshell', 'keap', 'infusionsoft', 'agile crm', 'monday sales'],
        category: 'CRM & Sales',
        subcategoryRules: [
          { keywords: ['lead', 'prospect', 'qualify', 'capture'], subcategory: 'Lead Management' },
          { keywords: ['deal', 'pipeline', 'opportunity', 'stage'], subcategory: 'Deal Tracking' },
          { keywords: ['contact', 'enrich', 'update', 'sync'], subcategory: 'Contact Management' },
          { keywords: ['quote', 'proposal', 'invoice'], subcategory: 'Quotes & Proposals' },
          { keywords: ['outreach', 'sequence', 'cold'], subcategory: 'Sales Outreach' },
        ],
        defaultSubcategory: 'Sales Automation'
      },
      { 
        keywords: ['slack', 'slack bot', 'slack notification', 'slack channel', 'slackbot'],
        category: 'Slack Automation',
        subcategoryRules: [
          { keywords: ['notification', 'alert', 'notify'], subcategory: 'Notifications' },
          { keywords: ['bot', 'command', 'slash'], subcategory: 'Slack Bots' },
          { keywords: ['channel', 'message', 'post'], subcategory: 'Channel Management' },
          { keywords: ['workflow', 'approve', 'form'], subcategory: 'Slack Workflows' },
        ],
        defaultSubcategory: 'Slack Integrations'
      },
      { 
        keywords: ['discord', 'discord bot', 'discord server', 'discord webhook'],
        category: 'Discord Automation',
        subcategoryRules: [
          { keywords: ['bot', 'command'], subcategory: 'Discord Bots' },
          { keywords: ['moderate', 'mod', 'ban', 'kick'], subcategory: 'Moderation' },
          { keywords: ['role', 'permission'], subcategory: 'Role Management' },
          { keywords: ['webhook', 'notification'], subcategory: 'Notifications' },
        ],
        defaultSubcategory: 'Discord Workflows'
      },
      { 
        keywords: ['teams', 'microsoft teams', 'ms teams', 'teams bot', 'teams channel'],
        category: 'Microsoft Teams',
        subcategoryRules: [
          { keywords: ['message', 'chat', 'channel'], subcategory: 'Messaging' },
          { keywords: ['meeting', 'call'], subcategory: 'Meetings' },
          { keywords: ['notification', 'alert'], subcategory: 'Notifications' },
        ],
        defaultSubcategory: 'Teams Workflows'
      },
      { 
        keywords: ['shopify', 'woocommerce', 'ecommerce', 'e-commerce', 'order', 'inventory', 'product', 'stripe', 'payment', 'bigcommerce', 'magento', 'prestashop', 'opencart', 'square', 'paypal', 'razorpay', 'cart', 'checkout'],
        category: 'E-commerce',
        subcategoryRules: [
          { keywords: ['order', 'fulfillment', 'ship', 'tracking'], subcategory: 'Order Management' },
          { keywords: ['inventory', 'stock', 'warehouse'], subcategory: 'Inventory' },
          { keywords: ['payment', 'stripe', 'invoice', 'refund'], subcategory: 'Payments' },
          { keywords: ['product', 'catalog', 'listing'], subcategory: 'Product Management' },
          { keywords: ['customer', 'review', 'feedback'], subcategory: 'Customer Management' },
          { keywords: ['abandon', 'cart', 'recover'], subcategory: 'Cart Recovery' },
        ],
        defaultSubcategory: 'E-commerce Automation'
      },
      { 
        keywords: ['notion', 'airtable', 'google sheet', 'spreadsheet', 'database', 'trello', 'asana', 'clickup', 'project', 'task', 'monday', 'jira', 'linear', 'basecamp', 'wrike', 'smartsheet', 'todoist', 'things', 'omnifocus'],
        category: 'Project Management',
        subcategoryRules: [
          { keywords: ['task', 'todo', 'assign', 'checklist'], subcategory: 'Task Management' },
          { keywords: ['sync', 'integrate', 'connect', 'mirror'], subcategory: 'Data Sync' },
          { keywords: ['report', 'status', 'update', 'standup'], subcategory: 'Reporting' },
          { keywords: ['board', 'kanban', 'sprint', 'agile'], subcategory: 'Agile Workflows' },
          { keywords: ['database', 'table', 'view'], subcategory: 'Database Management' },
        ],
        defaultSubcategory: 'Productivity'
      },
      { 
        keywords: ['scrape', 'crawl', 'extract', 'web data', 'scraping', 'puppeteer', 'playwright', 'selenium', 'beautifulsoup', 'cheerio', 'apify', 'bright data', 'octoparse'],
        category: 'Web Scraping & Data',
        subcategoryRules: [
          { keywords: ['scrape', 'crawl', 'extract', 'parse'], subcategory: 'Web Scraping' },
          { keywords: ['enrich', 'lookup', 'append'], subcategory: 'Data Enrichment' },
          { keywords: ['monitor', 'track', 'watch', 'change'], subcategory: 'Web Monitoring' },
          { keywords: ['price', 'competitor'], subcategory: 'Price Monitoring' },
        ],
        defaultSubcategory: 'Data Extraction'
      },
      { 
        keywords: ['calendar', 'meeting', 'schedule', 'appointment', 'booking', 'calendly', 'cal.com', 'google calendar', 'outlook calendar', 'acuity', 'doodle', 'timely'],
        category: 'Calendar & Scheduling',
        subcategoryRules: [
          { keywords: ['meeting', 'appointment', 'book'], subcategory: 'Meeting Management' },
          { keywords: ['schedule', 'slot', 'availability'], subcategory: 'Scheduling' },
          { keywords: ['remind', 'notification', 'alert'], subcategory: 'Reminders' },
          { keywords: ['sync', 'integrate'], subcategory: 'Calendar Sync' },
        ],
        defaultSubcategory: 'Calendar Automation'
      },
      { 
        keywords: ['github', 'gitlab', 'bitbucket', 'deploy', 'ci/cd', 'devops', 'code review', 'jenkins', 'vercel', 'netlify', 'heroku', 'aws', 'azure', 'docker', 'kubernetes', 'terraform'],
        category: 'Developer Tools',
        subcategoryRules: [
          { keywords: ['github', 'gitlab', 'repo', 'commit', 'pull request', 'pr '], subcategory: 'Git Automation' },
          { keywords: ['deploy', 'ci', 'cd', 'build', 'release'], subcategory: 'CI/CD' },
          { keywords: ['issue', 'bug', 'ticket'], subcategory: 'Issue Tracking' },
          { keywords: ['monitor', 'alert', 'log', 'error'], subcategory: 'Monitoring' },
          { keywords: ['docker', 'container', 'kubernetes'], subcategory: 'Container Ops' },
        ],
        defaultSubcategory: 'Dev Automation'
      },
      { 
        keywords: ['seo', 'keyword', 'ranking', 'backlink', 'search engine', 'marketing', 'ads', 'google ads', 'facebook ads', 'campaign', 'ppc', 'affiliate', 'utm', 'analytics', 'tracking'],
        category: 'Marketing Automation',
        subcategoryRules: [
          { keywords: ['seo', 'keyword', 'ranking', 'backlink'], subcategory: 'SEO' },
          { keywords: ['campaign', 'ads', 'ppc', 'advertising'], subcategory: 'Paid Advertising' },
          { keywords: ['analytics', 'tracking', 'report', 'utm'], subcategory: 'Analytics' },
          { keywords: ['social', 'content', 'schedule'], subcategory: 'Content Marketing' },
          { keywords: ['affiliate', 'referral', 'partner'], subcategory: 'Affiliate Marketing' },
        ],
        defaultSubcategory: 'Marketing'
      },
      { 
        keywords: ['pdf', 'document', 'file', 'convert', 'google drive', 'dropbox', 'onedrive', 'box', 's3', 'storage', 'upload', 'download', 'docx', 'excel', 'csv', 'xml', 'json'],
        category: 'Document & Files',
        subcategoryRules: [
          { keywords: ['pdf', 'convert', 'merge', 'split'], subcategory: 'PDF Processing' },
          { keywords: ['drive', 'dropbox', 'storage', 'cloud', 's3'], subcategory: 'File Storage' },
          { keywords: ['upload', 'download', 'transfer'], subcategory: 'File Transfer' },
          { keywords: ['ocr', 'extract', 'parse', 'read'], subcategory: 'Document Parsing' },
          { keywords: ['sign', 'signature', 'docusign'], subcategory: 'E-Signatures' },
        ],
        defaultSubcategory: 'File Automation'
      },
      { 
        keywords: ['form', 'survey', 'typeform', 'google form', 'jotform', 'tally', 'airtable form', 'cognito', 'formstack', 'wufoo', 'gravity form'],
        category: 'Forms & Surveys',
        subcategoryRules: [
          { keywords: ['submit', 'response', 'entry'], subcategory: 'Form Processing' },
          { keywords: ['survey', 'feedback', 'poll'], subcategory: 'Surveys' },
          { keywords: ['lead', 'capture', 'contact'], subcategory: 'Lead Capture' },
        ],
        defaultSubcategory: 'Form Automation'
      },
      { 
        keywords: ['sms', 'text message', 'twilio', 'vonage', 'messagebird', 'plivo', 'nexmo', 'textlocal', 'clicksend'],
        category: 'SMS Automation',
        subcategoryRules: [
          { keywords: ['send', 'bulk', 'broadcast'], subcategory: 'SMS Sending' },
          { keywords: ['notification', 'alert', 'otp'], subcategory: 'SMS Notifications' },
          { keywords: ['two-way', 'reply', 'receive'], subcategory: 'Two-Way SMS' },
        ],
        defaultSubcategory: 'SMS Workflows'
      },
      { 
        keywords: ['webhook', 'api', 'http', 'rest', 'graphql', 'endpoint', 'request', 'response', 'integration', 'oauth'],
        category: 'API & Webhooks',
        subcategoryRules: [
          { keywords: ['webhook', 'hook', 'trigger'], subcategory: 'Webhooks' },
          { keywords: ['api', 'rest', 'graphql', 'request'], subcategory: 'API Calls' },
          { keywords: ['oauth', 'auth', 'token'], subcategory: 'Authentication' },
          { keywords: ['transform', 'map', 'convert'], subcategory: 'Data Transformation' },
        ],
        defaultSubcategory: 'API Workflows'
      },
      { 
        keywords: ['hr', 'employee', 'onboard', 'offboard', 'recruit', 'hire', 'bamboohr', 'workday', 'gusto', 'rippling', 'personio', 'lever', 'greenhouse', 'applicant'],
        category: 'HR & Recruiting',
        subcategoryRules: [
          { keywords: ['recruit', 'hire', 'applicant', 'candidate'], subcategory: 'Recruiting' },
          { keywords: ['onboard', 'welcome', 'new hire'], subcategory: 'Onboarding' },
          { keywords: ['offboard', 'exit', 'departure'], subcategory: 'Offboarding' },
          { keywords: ['leave', 'time off', 'vacation', 'pto'], subcategory: 'Leave Management' },
        ],
        defaultSubcategory: 'HR Automation'
      },
      { 
        keywords: ['accounting', 'invoice', 'quickbooks', 'xero', 'freshbooks', 'wave', 'zoho books', 'expense', 'receipt', 'billing', 'finance'],
        category: 'Finance & Accounting',
        subcategoryRules: [
          { keywords: ['invoice', 'billing', 'payment'], subcategory: 'Invoicing' },
          { keywords: ['expense', 'receipt', 'reimburse'], subcategory: 'Expense Management' },
          { keywords: ['report', 'reconcile', 'sync'], subcategory: 'Financial Reporting' },
        ],
        defaultSubcategory: 'Finance Automation'
      },
      { 
        keywords: ['support', 'ticket', 'helpdesk', 'zendesk', 'freshdesk', 'intercom', 'crisp', 'help scout', 'front', 'customer service', 'live chat'],
        category: 'Customer Support',
        subcategoryRules: [
          { keywords: ['ticket', 'issue', 'request'], subcategory: 'Ticket Management' },
          { keywords: ['chat', 'live', 'conversation'], subcategory: 'Live Chat' },
          { keywords: ['knowledge', 'faq', 'article'], subcategory: 'Knowledge Base' },
          { keywords: ['feedback', 'nps', 'csat', 'survey'], subcategory: 'Customer Feedback' },
        ],
        defaultSubcategory: 'Support Automation'
      },
      { 
        keywords: ['pinterest', 'threads', 'bluesky', 'mastodon', 'reddit', 'quora', 'medium', 'tumblr', 'snapchat'],
        category: 'Other Social Platforms',
        subcategoryRules: [
          { keywords: ['pinterest', 'pin'], subcategory: 'Pinterest' },
          { keywords: ['reddit', 'subreddit'], subcategory: 'Reddit' },
          { keywords: ['medium', 'blog', 'article'], subcategory: 'Blogging' },
        ],
        defaultSubcategory: 'Social Workflows'
      },
    ];

    for (const rule of categoryRules) {
      if (rule.keywords.some(kw => text.includes(kw))) {
        let subcategory = rule.defaultSubcategory;
        for (const subRule of rule.subcategoryRules) {
          if (subRule.keywords.some(kw => text.includes(kw))) {
            subcategory = subRule.subcategory;
            break;
          }
        }
        return { category: rule.category, subcategory };
      }
    }

    return { category: 'General Automation', subcategory: 'Miscellaneous' };
  };

  // Smart import - auto-create categories/subcategories with BATCH processing & DUPLICATE DETECTION
  const processAutomationsData = async (automationsData: any[]) => {
    // Get current categories, subcategories, and existing automations for duplicate detection
    const { data: currentCategories } = await supabase.from("automation_categories").select("*");
    const { data: currentSubcategories } = await supabase.from("automation_subcategories").select("*");
    const { data: existingAutomations } = await supabase.from("automations").select("title");
    
    const categoryMap = new Map(currentCategories?.map(c => [c.name.toLowerCase(), c.id]) || []);
    const subcategoryMap = new Map(currentSubcategories?.map(s => [`${s.name.toLowerCase()}_${s.category_id}`, s.id]) || []);
    
    // Create a Set of existing automation titles (lowercase for case-insensitive comparison)
    const existingTitles = new Set(existingAutomations?.map(a => a.title.toLowerCase().trim()) || []);

    let created = { categories: 0, subcategories: 0, automations: 0, skippedDuplicates: 0 };

    // First pass: collect all unique categories and subcategories needed
    const neededCategories = new Set<string>();
    const neededSubcategories = new Map<string, string>(); // subcategoryName -> categoryName

    for (const auto of automationsData) {
      const automationTitle = auto.title || auto.name || auto.Name || auto.Title;
      const automationDescription = auto.description || auto.Description || "";
      if (!automationTitle) continue;

      const detected = detectCategory(automationTitle, automationDescription);
      const categoryName = auto.category || auto.Category || detected.category;
      const subcategoryName = auto.subcategory || auto.Subcategory || detected.subcategory;
      
      if (!categoryMap.has(categoryName.toLowerCase())) {
        neededCategories.add(categoryName);
      }
      neededSubcategories.set(`${subcategoryName}|||${categoryName}`, categoryName);
    }

    // Batch create missing categories
    if (neededCategories.size > 0) {
      const categoriesToInsert = Array.from(neededCategories).map(name => ({
        name, description: "", icon: "folder"
      }));
      const { data: newCats } = await supabase
        .from("automation_categories")
        .insert(categoriesToInsert)
        .select();
      
      if (newCats) {
        newCats.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id));
        created.categories = newCats.length;
      }
    }

    // Batch create missing subcategories
    const subcatsToInsert: any[] = [];
    for (const [key] of neededSubcategories) {
      const [subName, catName] = key.split("|||");
      const categoryId = categoryMap.get(catName.toLowerCase());
      const subKey = `${subName.toLowerCase()}_${categoryId}`;
      
      if (categoryId && !subcategoryMap.has(subKey)) {
        subcatsToInsert.push({
          name: subName,
          description: "",
          icon: "file",
          category_id: categoryId
        });
      }
    }

    if (subcatsToInsert.length > 0) {
      const { data: newSubs } = await supabase
        .from("automation_subcategories")
        .insert(subcatsToInsert)
        .select();
      
      if (newSubs) {
        newSubs.forEach(s => subcategoryMap.set(`${s.name.toLowerCase()}_${s.category_id}`, s.id));
        created.subcategories = newSubs.length;
      }
    }

    // Prepare all automations for batch insert (with duplicate detection)
    const automationsToInsert: any[] = [];
    const seenTitles = new Set<string>(); // Track titles within this import batch

    for (const auto of automationsData) {
      const automationTitle = auto.title || auto.name || auto.Name || auto.Title;
      const automationUrl = auto.download_url || auto.url || auto.link || auto.URL || auto.Link || auto.Url || "";
      const automationDescription = auto.description || auto.Description || "";
      
      if (!automationTitle) continue;

      const titleKey = automationTitle.toLowerCase().trim();
      
      // Skip if already exists in database OR already seen in this batch
      if (existingTitles.has(titleKey) || seenTitles.has(titleKey)) {
        created.skippedDuplicates++;
        continue;
      }
      
      // Mark as seen in this batch
      seenTitles.add(titleKey);

      const detected = detectCategory(automationTitle, automationDescription);
      const categoryName = auto.category || auto.Category || detected.category;
      const subcategoryName = auto.subcategory || auto.Subcategory || detected.subcategory;
      
      const categoryId = categoryMap.get(categoryName.toLowerCase());
      if (!categoryId) continue;
      
      const subKey = `${subcategoryName.toLowerCase()}_${categoryId}`;
      const subcategoryId = subcategoryMap.get(subKey);
      if (!subcategoryId) continue;

      automationsToInsert.push({
        title: automationTitle,
        description: automationDescription,
        icon: auto.icon || "zap",
        subcategory_id: subcategoryId,
        download_url: automationUrl,
        uses_count: parseInt(auto.uses_count || auto.score || "0") || 0,
      });
    }

    // Batch insert automations in chunks of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < automationsToInsert.length; i += BATCH_SIZE) {
      const batch = automationsToInsert.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase.from("automations").insert(batch).select();
      if (!error && data) {
        created.automations += data.length;
      }
    }

    return created;
  };

  // Excel Upload with smart matching
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          // Check for simple format (single "Automations" sheet with category/subcategory columns)
          const automationsSheet = workbook.Sheets["Automations"] || workbook.Sheets[workbook.SheetNames[0]];
          
          if (automationsSheet) {
            const automationsData = XLSX.utils.sheet_to_json<any>(automationsSheet);
            const created = await processAutomationsData(automationsData);
            
            const duplicateMsg = created.skippedDuplicates > 0 ? ` (${created.skippedDuplicates} duplicates skipped)` : '';
            toast.success(
              `Imported: ${created.automations} automations, ${created.categories} categories, ${created.subcategories} subcategories${duplicateMsg}`
            );
          }

          refetch();
          setUploadDialog(false);
        } catch (err: any) {
          toast.error("Failed to process file: " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast.error("Failed to read file");
      setIsLoading(false);
    }
  };

  // JSON file upload
  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      const automationsArray = Array.isArray(jsonData) ? jsonData : jsonData.automations || [jsonData];
      
      const created = await processAutomationsData(automationsArray);
      toast.success(
        `Imported: ${created.automations} automations, ${created.categories} categories, ${created.subcategories} subcategories`
      );
      refetch();
      setUploadDialog(false);
    } catch (error: any) {
      toast.error("Failed to parse JSON: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Import from server files (pre-uploaded Excel files)
  const handleServerFileImport = async (filePath: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const automationsData = XLSX.utils.sheet_to_json<any>(sheet);
      
      // Map different column formats
      const normalizedData = automationsData.map((item: any) => ({
        title: item.name || item.Name || item.title || item.Title,
        description: item.description || item.Description || "",
        download_url: item.url || item.URL || item.template_url || item.download_url || item.Link || "",
        creator: item.creator || item.Creator || "",
        youtube_url: item.youtube_url || item.Youtube_url || "",
      }));
      
      const created = await processAutomationsData(normalizedData);
      const duplicateMsg = created.skippedDuplicates > 0 ? ` (${created.skippedDuplicates} duplicates skipped)` : '';
      toast.success(
        `Imported: ${created.automations} automations, ${created.categories} categories, ${created.subcategories} subcategories${duplicateMsg}`
      );
      refetch();
      setUploadDialog(false);
    } catch (error: any) {
      toast.error("Failed to import from server file: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Import ZIP from server files
  const handleServerZipImport = async (filePath: string, fileName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const automationsData: any[] = [];
      
      // Parse ZIP structure: look for workflow.json files
      const entries = Object.entries(zip.files);
      
      for (const [path, zipEntry] of entries) {
        // Skip directories and non-workflow/non-json files
        if (zipEntry.dir) continue;
        
        // Check for workflow.json or any .json file
        if (path.endsWith('workflow.json') || path.endsWith('.json')) {
          try {
            const content = await zipEntry.async('text');
            const jsonData = JSON.parse(content);
            
            // Parse path for category info
            const parts = path.split('/');
            const category = parts.length >= 2 ? parts[parts.length - 2] : 'Imported';
            const folderName = parts.length >= 2 ? parts[parts.length - 2] : path.replace('.json', '');
            
            // Extract title
            const title = jsonData.name || jsonData.title || 
              folderName.replace(/^\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            
            automationsData.push({
              title,
              category: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
              subcategory: 'Workflows',
              description: jsonData.description || '',
              download_url: filePath,
              preview_json: jsonData,
              icon: 'zap',
              uses_count: 0,
            });
          } catch (e) {
            // Skip invalid JSON files
          }
        }
      }
      
      if (automationsData.length === 0) {
        toast.error("No valid JSON/workflow files found in ZIP");
        setIsLoading(false);
        return;
      }
      
      const created = await processAutomationsData(automationsData);
      const duplicateMsg = created.skippedDuplicates > 0 ? ` (${created.skippedDuplicates} duplicates skipped)` : '';
      toast.success(
        `Imported from ${fileName}: ${created.automations} automations, ${created.categories} categories, ${created.subcategories} subcategories${duplicateMsg}`
      );
      refetch();
      setUploadDialog(false);
    } catch (error: any) {
      toast.error("Failed to import ZIP: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Import from URL (Google Drive, etc.)
  const handleUrlImport = async () => {
    if (!jsonUrl.trim()) return;

    setIsLoading(true);
    try {
      // Convert Google Drive link to direct download
      let fetchUrl = jsonUrl;
      if (jsonUrl.includes("drive.google.com")) {
        const fileId = jsonUrl.match(/\/d\/([^/]+)/)?.[1] || jsonUrl.match(/id=([^&]+)/)?.[1];
        if (fileId) {
          fetchUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      }

      const response = await fetch(fetchUrl);
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("json") || jsonUrl.endsWith(".json")) {
        const jsonData = await response.json();
        const automationsArray = Array.isArray(jsonData) ? jsonData : jsonData.automations || [jsonData];
        const created = await processAutomationsData(automationsArray);
        toast.success(
          `Imported: ${created.automations} automations, ${created.categories} categories, ${created.subcategories} subcategories`
        );
      } else {
        // Try as Excel
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets["Automations"] || workbook.Sheets[workbook.SheetNames[0]];
        const automationsData = XLSX.utils.sheet_to_json<any>(sheet);
        const created = await processAutomationsData(automationsData);
        toast.success(
          `Imported: ${created.automations} automations, ${created.categories} categories, ${created.subcategories} subcategories`
        );
      }

      refetch();
      setUploadDialog(false);
      setJsonUrl("");
    } catch (error: any) {
      toast.error("Failed to import from URL: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk recategorize all existing automations using the new detection rules
  const handleBulkRecategorize = async () => {
    if (!confirm("This will recategorize ALL automations based on the new detection rules. Continue?")) return;
    
    setIsLoading(true);
    try {
      // Fetch all automations with their current data
      let allAutomations: any[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data, error } = await supabase
          .from("automations")
          .select("id, title, description")
          .range(from, from + batchSize - 1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          allAutomations = [...allAutomations, ...data];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }
      
      if (allAutomations.length === 0) {
        toast.info("No automations found to recategorize");
        setIsLoading(false);
        return;
      }

      // Fetch current categories and subcategories
      const { data: currentCategories } = await supabase.from("automation_categories").select("*");
      const { data: currentSubcategories } = await supabase.from("automation_subcategories").select("*");
      
      const categoryMap = new Map(currentCategories?.map(c => [c.name.toLowerCase(), c.id]) || []);
      const subcategoryMap = new Map(currentSubcategories?.map(s => [`${s.name.toLowerCase()}_${s.category_id}`, s.id]) || []);

      // First pass: collect all unique categories and subcategories needed
      const neededCategories = new Set<string>();
      const neededSubcategories = new Map<string, string>();

      for (const auto of allAutomations) {
        const detected = detectCategory(auto.title || "", auto.description || "");
        
        if (!categoryMap.has(detected.category.toLowerCase())) {
          neededCategories.add(detected.category);
        }
        neededSubcategories.set(`${detected.subcategory}|||${detected.category}`, detected.category);
      }

      let createdCategories = 0;
      let createdSubcategories = 0;

      // Batch create missing categories
      if (neededCategories.size > 0) {
        const categoriesToInsert = Array.from(neededCategories).map(name => ({
          name, description: "", icon: "folder"
        }));
        const { data: newCats } = await supabase
          .from("automation_categories")
          .insert(categoriesToInsert)
          .select();
        
        if (newCats) {
          newCats.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id));
          createdCategories = newCats.length;
        }
      }

      // Batch create missing subcategories
      const subcatsToInsert: any[] = [];
      for (const [key] of neededSubcategories) {
        const [subName, catName] = key.split("|||");
        const categoryId = categoryMap.get(catName.toLowerCase());
        const subKey = `${subName.toLowerCase()}_${categoryId}`;
        
        if (categoryId && !subcategoryMap.has(subKey)) {
          subcatsToInsert.push({
            name: subName,
            description: "",
            icon: "file",
            category_id: categoryId
          });
        }
      }

      if (subcatsToInsert.length > 0) {
        const { data: newSubs } = await supabase
          .from("automation_subcategories")
          .insert(subcatsToInsert)
          .select();
        
        if (newSubs) {
          newSubs.forEach(s => subcategoryMap.set(`${s.name.toLowerCase()}_${s.category_id}`, s.id));
          createdSubcategories = newSubs.length;
        }
      }

      // Now update each automation with its new subcategory
      let updatedCount = 0;
      const updateBatchSize = 100;
      
      for (let i = 0; i < allAutomations.length; i += updateBatchSize) {
        const batch = allAutomations.slice(i, i + updateBatchSize);
        
        for (const auto of batch) {
          const detected = detectCategory(auto.title || "", auto.description || "");
          const categoryId = categoryMap.get(detected.category.toLowerCase());
          
          if (!categoryId) continue;
          
          const subKey = `${detected.subcategory.toLowerCase()}_${categoryId}`;
          const subcategoryId = subcategoryMap.get(subKey);
          
          if (!subcategoryId) continue;
          
          const { error } = await supabase
            .from("automations")
            .update({ subcategory_id: subcategoryId })
            .eq("id", auto.id);
          
          if (!error) updatedCount++;
        }
      }

      toast.success(
        `Recategorized ${updatedCount} automations! Created ${createdCategories} new categories and ${createdSubcategories} new subcategories.`
      );
      refetch();
    } catch (error: any) {
      toast.error("Failed to recategorize: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ZIP file upload - extract workflow templates
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const automationsData: any[] = [];
      
      // Parse ZIP structure - support multiple formats:
      // 1. workflow.json files anywhere
      // 2. Any .json files that look like n8n workflows
      const entries = Object.entries(zip.files);
      
      for (const [path, zipEntry] of entries) {
        // Skip directories
        if (zipEntry.dir) continue;
        
        // Accept workflow.json OR any .json file
        if (!path.endsWith('.json')) continue;
        
        try {
          const content = await zipEntry.async('text');
          const jsonData = JSON.parse(content);
          
          // Validate it looks like an n8n workflow (has nodes or name)
          const isWorkflow = jsonData.nodes || jsonData.name || jsonData.workflow || jsonData.id;
          if (!isWorkflow) continue;
          
          // Parse path for category info
          const parts = path.split('/').filter(p => p); // Remove empty parts
          const fileName = parts[parts.length - 1].replace('.json', '');
          
          // Try to extract category from path structure
          let category = 'Imported';
          let folderName = fileName;
          
          if (parts.length >= 3) {
            // Structure: root/category/id-name/workflow.json
            category = parts[1];
            folderName = parts[parts.length - 2];
          } else if (parts.length === 2) {
            // Structure: category/workflow.json or folder/workflow.json
            category = parts[0];
            folderName = parts[1].replace('.json', '');
          } else if (parts.length === 1) {
            // Just workflow.json at root - use filename
            folderName = fileName;
          }
          
          // Extract title from folder/file name (remove ID prefix if exists)
          const titleMatch = folderName.match(/^\d+-(.+)$/);
          let title = jsonData.name || jsonData.title || (titleMatch 
            ? titleMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
            : folderName.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()));
          
          // Get description from JSON or README
          let description = jsonData.description || '';
          if (!description && parts.length >= 2) {
            const readmePath = `${parts.slice(0, -1).join('/')}/README.md`;
            try {
              const readmeFile = zip.file(readmePath);
              if (readmeFile) {
                const readmeContent = await readmeFile.async('text');
                const lines = readmeContent.split('\n').filter(l => l.trim() && !l.startsWith('#'));
                description = lines[0]?.substring(0, 500) || '';
              }
            } catch (e) {
              // Ignore README parsing errors
            }
          }
          
          // Use detectCategory for better categorization
          const detected = detectCategory(title, description);
          
          automationsData.push({
            title,
            category: detected.category,
            subcategory: detected.subcategory,
            description,
            download_url: null, // Will be stored inline with preview_json
            preview_json: jsonData,
            icon: 'zap',
            uses_count: 0,
          });
        } catch (e) {
          // Skip invalid JSON files
          console.log(`Skipping invalid JSON: ${path}`);
        }
      }
      
      if (automationsData.length === 0) {
        toast.error("No valid workflow JSON files found in ZIP. Make sure the ZIP contains .json files with n8n workflow structure.");
        setIsLoading(false);
        return;
      }
      
      const created = await processAutomationsData(automationsData);
      const duplicateMsg = created.skippedDuplicates > 0 ? ` (${created.skippedDuplicates} duplicates skipped)` : '';
      toast.success(
        `Imported from ZIP: ${created.automations} automations, ${created.categories} categories, ${created.subcategories} subcategories${duplicateMsg}`
      );
      refetch();
      setUploadDialog(false);
    } catch (error: any) {
      toast.error("Failed to process ZIP: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "Unknown";
  };

  const getSubcategoryName = (subcategoryId: string) => {
    return subcategories.find(s => s.id === subcategoryId)?.name || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Automation Management</h2>
        <div className="flex gap-2">
          <Button onClick={handleBulkRecategorize} variant="outline" className="gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Recategorize All
          </Button>
          <Button onClick={() => setUploadDialog(true)} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="subcategories" className="gap-2">
            <FileText className="w-4 h-4" />
            Subcategories ({subcategories.length})
          </TabsTrigger>
          <TabsTrigger value="automations" className="gap-2">
            <Zap className="w-4 h-4" />
            Automations ({automations.length})
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: "", description: "", icon: "folder" }); setCategoryDialog(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">{cat.description || "-"}</TableCell>
                    <TableCell><Badge variant="outline">{cat.icon}</Badge></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || "", icon: cat.icon }); setCategoryDialog(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Subcategories Tab */}
        <TabsContent value="subcategories">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingSubcategory(null); setSubcategoryForm({ name: "", description: "", icon: "file", category_id: "" }); setSubcategoryDialog(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Subcategory
            </Button>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell><Badge variant="secondary">{getCategoryName(sub.category_id)}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{sub.description || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingSubcategory(sub); setSubcategoryForm({ name: sub.name, description: sub.description || "", icon: sub.icon, category_id: sub.category_id }); setSubcategoryDialog(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSubcategory(sub.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingAutomation(null); setAutomationForm({ title: "", description: "", icon: "zap", subcategory_id: "", download_url: "", uses_count: 0, preview_json: "" }); setAutomationDialog(true); }} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Automation
            </Button>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((auto) => (
                  <TableRow key={auto.id}>
                    <TableCell className="font-medium">{auto.title}</TableCell>
                    <TableCell><Badge variant="secondary">{getSubcategoryName(auto.subcategory_id)}</Badge></TableCell>
                    <TableCell>{auto.uses_count}</TableCell>
                    <TableCell>
                      <Badge variant={auto.is_active ? "default" : "outline"}>
                        {auto.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { 
                        setEditingAutomation(auto); 
                        setAutomationForm({ 
                          title: auto.title, 
                          description: auto.description || "", 
                          icon: auto.icon, 
                          subcategory_id: auto.subcategory_id, 
                          download_url: auto.download_url || "",
                          uses_count: auto.uses_count,
                          preview_json: auto.preview_json ? JSON.stringify(auto.preview_json, null, 2) : ""
                        }); 
                        setAutomationDialog(true);
                      }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAutomation(auto.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>Manage automation categories</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            <Textarea placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            <Input placeholder="Icon (e.g., folder, mail, zap)" value={categoryForm.icon} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subcategoryDialog} onOpenChange={setSubcategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
            <DialogDescription>Manage automation subcategories</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={subcategoryForm.category_id} onValueChange={(v) => setSubcategoryForm({ ...subcategoryForm, category_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent className="bg-popover">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Name" value={subcategoryForm.name} onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })} />
            <Textarea placeholder="Description" value={subcategoryForm.description} onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })} />
            <Input placeholder="Icon" value={subcategoryForm.icon} onChange={(e) => setSubcategoryForm({ ...subcategoryForm, icon: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSubcategory} disabled={isLoading || !subcategoryForm.category_id}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Automation Dialog */}
      <Dialog open={automationDialog} onOpenChange={setAutomationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAutomation ? "Edit Automation" : "Add Automation"}</DialogTitle>
            <DialogDescription>Manage automations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={automationForm.subcategory_id} onValueChange={(v) => setAutomationForm({ ...automationForm, subcategory_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select Subcategory" /></SelectTrigger>
              <SelectContent className="bg-popover">
                {subcategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>{sub.name} ({getCategoryName(sub.category_id)})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Title" value={automationForm.title} onChange={(e) => setAutomationForm({ ...automationForm, title: e.target.value })} />
            <Textarea placeholder="Description" value={automationForm.description} onChange={(e) => setAutomationForm({ ...automationForm, description: e.target.value })} />
            <Input placeholder="Download URL (Google Drive link)" value={automationForm.download_url} onChange={(e) => setAutomationForm({ ...automationForm, download_url: e.target.value })} />
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Preview JSON (paste n8n/Make workflow JSON)</label>
              <Textarea 
                placeholder='{"nodes": [...], "connections": {...}}' 
                value={automationForm.preview_json} 
                onChange={(e) => setAutomationForm({ ...automationForm, preview_json: e.target.value })} 
                className="min-h-[120px] font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">Paste the JSON content of the automation for preview. This will be shown to paid users.</p>
            </div>
            <Input placeholder="Icon" value={automationForm.icon} onChange={(e) => setAutomationForm({ ...automationForm, icon: e.target.value })} />
            <Input type="number" placeholder="Uses Count" value={automationForm.uses_count} onChange={(e) => setAutomationForm({ ...automationForm, uses_count: parseInt(e.target.value) || 0 })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAutomationDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAutomation} disabled={isLoading || !automationForm.subcategory_id}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Automations</DialogTitle>
            <DialogDescription>
              Upload ZIP/Excel/JSON file or import from URL. Categories & subcategories are auto-created!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Format Info */}
            <div className="p-4 rounded-xl bg-muted/50 text-sm">
              <p className="font-medium mb-2">📦 Supported Formats:</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• <strong>ZIP:</strong> GitHub workflow templates (auto-extracts categories from folder structure)</li>
                <li>• <strong>Excel/JSON:</strong> title, category, subcategory, description, download_url</li>
              </ul>
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Upload File:</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ZIP (Workflows)</p>
                  <Input type="file" accept=".zip" onChange={handleZipUpload} disabled={isLoading} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Excel (.xlsx)</p>
                  <Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} disabled={isLoading} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">JSON</p>
                  <Input type="file" accept=".json" onChange={handleJsonUpload} disabled={isLoading} />
                </div>
              </div>
            </div>

            {/* Server Files Import Section */}
            <div className="space-y-3">
              <p className="text-sm font-medium">📁 Import from Server Files:</p>
              <p className="text-xs text-muted-foreground">
                Click to import pre-uploaded files from your server
              </p>
              
              {/* Excel Files */}
              <p className="text-xs font-medium text-muted-foreground mt-2">📊 Excel Files:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleServerFileImport('/uploads/n8n-templates-2000.xlsx')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  📊 2000 Templates
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleServerFileImport('/uploads/professional-templates-200.xlsx')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  📊 200 Professional
                </Button>
              </div>

              {/* ZIP Files */}
              <p className="text-xs font-medium text-muted-foreground mt-3">📦 ZIP Files:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleServerZipImport('/uploads/2182-workflows.zip', '2182 Workflows')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  📂 2,182 Workflows
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleServerZipImport('/uploads/2200-templates.zip', '2200 Templates')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  🌍 2,200 Templates
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleServerZipImport('/uploads/2k-templates.zip', '2K Templates')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  🎯 2,000 Templates
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleServerZipImport('/uploads/3k-templates.zip', '3K Templates')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  📊 3,000 Templates
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleServerZipImport('/uploads/500-n8n-templates.zip', '500 n8n')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  🚀 500 n8n Templates
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleServerZipImport('/uploads/300-whatsapp-templates.zip', '300 WhatsApp')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  💬 300 WhatsApp
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleServerZipImport('/uploads/business-templates-35.zip', '35 Business')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  💼 35 Business
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleServerZipImport('/uploads/workflow-templates.zip', 'Workflow Templates')}
                  disabled={isLoading}
                  className="text-xs h-auto py-2"
                >
                  ⚡ Workflow Templates
                </Button>
              </div>
            </div>

            {/* URL Import Section */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Or Import from URL:</p>
              <p className="text-xs text-muted-foreground">
                Google Drive link, direct Excel/JSON URL
              </p>
              <div className="flex gap-2">
                <Input 
                  placeholder="https://drive.google.com/... or direct URL"
                  value={jsonUrl}
                  onChange={(e) => setJsonUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={handleUrlImport} disabled={isLoading || !jsonUrl.trim()}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Import
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Processing... This may take a moment</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadDialog(false); setJsonUrl(""); }} disabled={isLoading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutomationManager;
