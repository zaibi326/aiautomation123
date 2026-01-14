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

  // Smart import - auto-create categories/subcategories
  const processAutomationsData = async (automationsData: any[]) => {
    // Get current categories and subcategories
    const { data: currentCategories } = await supabase.from("automation_categories").select("*");
    const { data: currentSubcategories } = await supabase.from("automation_subcategories").select("*");
    
    const categoryMap = new Map(currentCategories?.map(c => [c.name.toLowerCase(), c.id]) || []);
    const subcategoryMap = new Map(currentSubcategories?.map(s => [`${s.name.toLowerCase()}_${s.category_id}`, s.id]) || []);

    let created = { categories: 0, subcategories: 0, automations: 0 };

    for (const auto of automationsData) {
      if (!auto.title) continue;

      const categoryName = auto.category || "General";
      const subcategoryName = auto.subcategory || "Default";
      
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
        title: auto.title,
        description: auto.description || "",
        icon: auto.icon || "zap",
        subcategory_id: subcategoryId,
        download_url: auto.download_url || auto.link || auto.url || "",
        uses_count: parseInt(auto.uses_count) || 0,
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
              Upload Excel/JSON file or import from URL. Categories & subcategories are auto-created!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Format Info */}
            <div className="p-4 rounded-xl bg-muted/50 text-sm">
              <p className="font-medium mb-2">📋 Simple Format (Auto-match):</p>
              <p className="text-muted-foreground mb-2">
                Just list automations - categories/subcategories auto-create if missing:
              </p>
              <code className="block p-2 rounded bg-background text-xs">
                title, category, subcategory, description, download_url
              </code>
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Upload File:</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Excel (.xlsx, .xls)</p>
                  <Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} disabled={isLoading} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">JSON (.json)</p>
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
