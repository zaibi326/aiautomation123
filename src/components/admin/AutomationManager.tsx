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
    uses_count: 0 
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
      if (editingAutomation) {
        const { error } = await supabase
          .from("automations")
          .update(automationForm)
          .eq("id", editingAutomation.id);
        if (error) throw error;
        toast.success("Automation updated");
      } else {
        const { error } = await supabase
          .from("automations")
          .insert(automationForm);
        if (error) throw error;
        toast.success("Automation created");
      }
      setAutomationDialog(false);
      setAutomationForm({ title: "", description: "", icon: "zap", subcategory_id: "", download_url: "", uses_count: 0 });
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
    
    // Category detection rules with subcategories
    const categoryRules = [
      { 
        keywords: ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'social media', 'social post', 'threads', 'bluesky', 'pinterest'],
        category: 'Social Media Management',
        subcategoryRules: [
          { keywords: ['post', 'publish', 'schedule', 'content'], subcategory: 'Content Publishing' },
          { keywords: ['analytics', 'insight', 'report', 'stats'], subcategory: 'Analytics' },
          { keywords: ['video', 'reel', 'short'], subcategory: 'Video Content' },
          { keywords: ['comment', 'engage', 'reply'], subcategory: 'Engagement' },
        ],
        defaultSubcategory: 'Social Automation'
      },
      { 
        keywords: ['email', 'gmail', 'outlook', 'mailchimp', 'newsletter', 'smtp', 'imap'],
        category: 'Email Automation',
        subcategoryRules: [
          { keywords: ['campaign', 'marketing', 'newsletter'], subcategory: 'Email Marketing' },
          { keywords: ['autorespond', 'reply', 'response'], subcategory: 'Auto-Response' },
          { keywords: ['filter', 'sort', 'organize', 'archive'], subcategory: 'Email Management' },
        ],
        defaultSubcategory: 'Email Workflows'
      },
      { 
        keywords: ['crm', 'hubspot', 'salesforce', 'pipedrive', 'zoho', 'lead', 'deal', 'contact', 'sales'],
        category: 'CRM & Sales',
        subcategoryRules: [
          { keywords: ['lead', 'prospect', 'qualify'], subcategory: 'Lead Management' },
          { keywords: ['deal', 'pipeline', 'opportunity'], subcategory: 'Deal Tracking' },
          { keywords: ['contact', 'enrich', 'update'], subcategory: 'Contact Management' },
        ],
        defaultSubcategory: 'Sales Automation'
      },
      { 
        keywords: ['ai', 'gpt', 'openai', 'chatgpt', 'gemini', 'claude', 'llm', 'langchain', 'chatbot', 'assistant'],
        category: 'AI & Chatbots',
        subcategoryRules: [
          { keywords: ['chat', 'assistant', 'bot', 'conversation'], subcategory: 'Chatbots' },
          { keywords: ['generate', 'create', 'write', 'content'], subcategory: 'Content Generation' },
          { keywords: ['analyze', 'summary', 'extract'], subcategory: 'AI Analysis' },
          { keywords: ['image', 'dall', 'vision', 'photo'], subcategory: 'AI Image' },
          { keywords: ['voice', 'speech', 'transcri', 'audio'], subcategory: 'AI Voice' },
        ],
        defaultSubcategory: 'AI Automation'
      },
      { 
        keywords: ['telegram', 'slack', 'discord', 'whatsapp', 'teams', 'mattermost'],
        category: 'Messaging & Chat',
        subcategoryRules: [
          { keywords: ['telegram'], subcategory: 'Telegram Bots' },
          { keywords: ['slack'], subcategory: 'Slack Integrations' },
          { keywords: ['discord'], subcategory: 'Discord Bots' },
          { keywords: ['whatsapp'], subcategory: 'WhatsApp Automation' },
        ],
        defaultSubcategory: 'Chat Automation'
      },
      { 
        keywords: ['shopify', 'woocommerce', 'ecommerce', 'order', 'inventory', 'product', 'stripe', 'payment'],
        category: 'E-commerce',
        subcategoryRules: [
          { keywords: ['order', 'fulfillment'], subcategory: 'Order Management' },
          { keywords: ['inventory', 'stock'], subcategory: 'Inventory' },
          { keywords: ['payment', 'stripe', 'invoice'], subcategory: 'Payments' },
        ],
        defaultSubcategory: 'E-commerce Automation'
      },
      { 
        keywords: ['notion', 'airtable', 'google sheet', 'spreadsheet', 'database', 'trello', 'asana', 'clickup', 'project', 'task'],
        category: 'Project Management',
        subcategoryRules: [
          { keywords: ['task', 'todo', 'assign'], subcategory: 'Task Management' },
          { keywords: ['sync', 'integrate', 'connect'], subcategory: 'Data Sync' },
          { keywords: ['report', 'status', 'update'], subcategory: 'Reporting' },
        ],
        defaultSubcategory: 'Productivity'
      },
      { 
        keywords: ['scrape', 'crawl', 'extract', 'web data', 'scraping'],
        category: 'Web Scraping & Data',
        subcategoryRules: [
          { keywords: ['scrape', 'crawl', 'extract'], subcategory: 'Web Scraping' },
          { keywords: ['enrich', 'lookup'], subcategory: 'Data Enrichment' },
        ],
        defaultSubcategory: 'Data Extraction'
      },
      { 
        keywords: ['calendar', 'meeting', 'schedule', 'appointment', 'booking'],
        category: 'Calendar & Scheduling',
        subcategoryRules: [
          { keywords: ['meeting', 'appointment'], subcategory: 'Meeting Management' },
          { keywords: ['schedule', 'book'], subcategory: 'Scheduling' },
        ],
        defaultSubcategory: 'Calendar Automation'
      },
      { 
        keywords: ['github', 'gitlab', 'bitbucket', 'deploy', 'ci/cd', 'devops', 'code review'],
        category: 'Developer Tools',
        subcategoryRules: [
          { keywords: ['github', 'gitlab', 'repo'], subcategory: 'Git Automation' },
          { keywords: ['deploy', 'ci', 'cd'], subcategory: 'CI/CD' },
        ],
        defaultSubcategory: 'Dev Automation'
      },
      { 
        keywords: ['seo', 'keyword', 'ranking', 'backlink', 'search engine'],
        category: 'Marketing Automation',
        subcategoryRules: [
          { keywords: ['seo', 'keyword', 'ranking'], subcategory: 'SEO' },
          { keywords: ['campaign', 'ads'], subcategory: 'Campaigns' },
        ],
        defaultSubcategory: 'Marketing'
      },
      { 
        keywords: ['pdf', 'document', 'file', 'convert', 'google drive', 'dropbox'],
        category: 'Document & Files',
        subcategoryRules: [
          { keywords: ['pdf', 'convert'], subcategory: 'PDF Processing' },
          { keywords: ['drive', 'dropbox', 'storage'], subcategory: 'File Storage' },
        ],
        defaultSubcategory: 'File Automation'
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

  // Smart import - auto-create categories/subcategories
  const processAutomationsData = async (automationsData: any[]) => {
    // Get current categories and subcategories
    const { data: currentCategories } = await supabase.from("automation_categories").select("*");
    const { data: currentSubcategories } = await supabase.from("automation_subcategories").select("*");
    
    const categoryMap = new Map(currentCategories?.map(c => [c.name.toLowerCase(), c.id]) || []);
    const subcategoryMap = new Map(currentSubcategories?.map(s => [`${s.name.toLowerCase()}_${s.category_id}`, s.id]) || []);

    let created = { categories: 0, subcategories: 0, automations: 0 };

    for (const auto of automationsData) {
      // Support multiple column name formats: name/title, url/download_url/link
      const automationTitle = auto.title || auto.name || auto.Name || auto.Title;
      const automationUrl = auto.download_url || auto.url || auto.link || auto.URL || auto.Link || auto.Url || "";
      const automationDescription = auto.description || auto.Description || "";
      
      if (!automationTitle) continue;

      // Auto-detect category if not provided
      const detected = detectCategory(automationTitle, automationDescription);
      const categoryName = auto.category || auto.Category || detected.category;
      const subcategoryName = auto.subcategory || auto.Subcategory || detected.subcategory;
      
      // Auto-create category if doesn't exist
      let categoryId = categoryMap.get(categoryName.toLowerCase());
      if (!categoryId) {
        const { data: newCat, error } = await supabase
          .from("automation_categories")
          .insert({ name: categoryName, description: "", icon: auto.category_icon || "folder" })
          .select()
          .single();
        
        if (!error && newCat) {
          categoryId = newCat.id;
          categoryMap.set(categoryName.toLowerCase(), categoryId);
          created.categories++;
        }
      }

      if (!categoryId) continue;

      // Auto-create subcategory if doesn't exist
      const subKey = `${subcategoryName.toLowerCase()}_${categoryId}`;
      let subcategoryId = subcategoryMap.get(subKey);
      if (!subcategoryId) {
        const { data: newSub, error } = await supabase
          .from("automation_subcategories")
          .insert({ 
            name: subcategoryName, 
            description: "", 
            icon: auto.subcategory_icon || "file",
            category_id: categoryId 
          })
          .select()
          .single();
        
        if (!error && newSub) {
          subcategoryId = newSub.id;
          subcategoryMap.set(subKey, subcategoryId);
          created.subcategories++;
        }
      }

      if (!subcategoryId) continue;

      // Create automation
      const { error } = await supabase.from("automations").insert({
        title: automationTitle,
        description: automationDescription,
        icon: auto.icon || "zap",
        subcategory_id: subcategoryId,
        download_url: automationUrl,
        uses_count: parseInt(auto.uses_count || auto.score || "0") || 0,
      });

      if (!error) created.automations++;
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
            
            toast.success(
              `Imported: ${created.automations} automations, ${created.categories} categories, ${created.subcategories} subcategories`
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

  // ZIP file upload - extract workflow templates
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const automationsData: any[] = [];
      
      // Parse ZIP structure: root/category/id-name/workflow.json
      const entries = Object.entries(zip.files);
      
      for (const [path, zipEntry] of entries) {
        // Skip directories and non-workflow files
        if (zipEntry.dir || !path.endsWith('workflow.json')) continue;
        
        // Parse path: root/category/id-name/workflow.json
        const parts = path.split('/');
        if (parts.length < 4) continue;
        
        const rootFolder = parts[0]; // e.g., "2182-workflow-templates--main"
        const category = parts[1]; // e.g., "analytics"
        const folderName = parts[2]; // e.g., "1690-markdown-report-generation"
        
        // Extract title from folder name (remove ID prefix)
        const titleMatch = folderName.match(/^\d+-(.+)$/);
        const title = titleMatch 
          ? titleMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          : folderName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        
        // Try to get description from README.md if exists
        const readmePath = `${parts.slice(0, 3).join('/')}/README.md`;
        let description = '';
        try {
          const readmeFile = zip.file(readmePath);
          if (readmeFile) {
            const readmeContent = await readmeFile.async('text');
            // Extract first paragraph after title
            const lines = readmeContent.split('\n').filter(l => l.trim() && !l.startsWith('#'));
            description = lines[0]?.substring(0, 500) || '';
          }
        } catch (e) {
          // Ignore README parsing errors
        }
        
        // Create GitHub download URL
        // Format: https://raw.githubusercontent.com/USER/REPO/BRANCH/path/to/workflow.json
        const downloadUrl = `https://raw.githubusercontent.com/n8n-io/n8n-workflow-templates/main/${category}/${folderName}/workflow.json`;
        
        automationsData.push({
          title,
          category: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
          subcategory: 'Workflows',
          description,
          download_url: downloadUrl,
          icon: 'zap',
          uses_count: 0,
        });
      }
      
      if (automationsData.length === 0) {
        toast.error("No workflow.json files found in ZIP");
        setIsLoading(false);
        return;
      }
      
      const created = await processAutomationsData(automationsData);
      toast.success(
        `Imported from ZIP: ${created.automations} automations, ${created.categories} categories, ${created.subcategories} subcategories`
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
        <Button onClick={() => setUploadDialog(true)} variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Import Excel
        </Button>
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
            <Button onClick={() => { setEditingAutomation(null); setAutomationForm({ title: "", description: "", icon: "zap", subcategory_id: "", download_url: "", uses_count: 0 }); setAutomationDialog(true); }} className="gap-2">
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
                          uses_count: auto.uses_count
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
            <Input placeholder="Download URL" value={automationForm.download_url} onChange={(e) => setAutomationForm({ ...automationForm, download_url: e.target.value })} />
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
