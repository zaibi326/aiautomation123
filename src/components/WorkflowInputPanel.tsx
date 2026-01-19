import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Play, 
  FileJson, 
  Table, 
  Upload,
  Copy,
  Check,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InputField {
  key: string;
  value: string;
  type: "text" | "number" | "email" | "json";
}

interface WorkflowInputPanelProps {
  onExecute: (inputData: any) => void;
  isRunning: boolean;
  workflowNodes?: { name: string; type: string }[];
}

// Sample data templates
const SAMPLE_TEMPLATES = {
  webhook: {
    body: {
      user_id: "usr_12345",
      action: "process_data",
      timestamp: new Date().toISOString()
    },
    headers: {
      "content-type": "application/json",
      "x-api-key": "demo_key_xxx"
    }
  },
  order: [
    { id: 1, product: "Widget Pro", price: 299.99, quantity: 2, status: "pending" },
    { id: 2, product: "Super Suite", price: 499.99, quantity: 1, status: "shipped" },
    { id: 3, product: "Basic Pack", price: 99.99, quantity: 5, status: "delivered" }
  ],
  users: [
    { id: 1, name: "John Smith", email: "john@example.com", role: "admin", active: true },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", role: "user", active: true },
    { id: 3, name: "Mike Chen", email: "mike@example.com", role: "manager", active: false }
  ],
  leads: [
    { company: "Tech Corp", contact: "CEO", email: "ceo@techcorp.com", value: 25000, stage: "qualified" },
    { company: "StartupXYZ", contact: "CTO", email: "cto@startup.xyz", value: 15000, stage: "proposal" }
  ],
  message: {
    from: "user@example.com",
    to: "support@company.com",
    subject: "Test Message",
    body: "This is a test message for the workflow.",
    timestamp: new Date().toISOString()
  }
};

export const WorkflowInputPanel: React.FC<WorkflowInputPanelProps> = ({
  onExecute,
  isRunning,
  workflowNodes = []
}) => {
  const [inputMode, setInputMode] = useState<"form" | "json" | "template">("form");
  const [formFields, setFormFields] = useState<InputField[]>([
    { key: "name", value: "Test User", type: "text" },
    { key: "email", value: "test@example.com", type: "email" },
    { key: "amount", value: "100", type: "number" }
  ]);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SAMPLE_TEMPLATES.order, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Add new field
  const addField = useCallback(() => {
    setFormFields(prev => [...prev, { key: "", value: "", type: "text" }]);
  }, []);

  // Remove field
  const removeField = useCallback((index: number) => {
    setFormFields(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update field
  const updateField = useCallback((index: number, updates: Partial<InputField>) => {
    setFormFields(prev => prev.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
  }, []);

  // Build input data from form
  const buildFormData = useCallback(() => {
    const data: Record<string, any> = {};
    formFields.forEach(field => {
      if (field.key) {
        let value: any = field.value;
        if (field.type === "number") {
          value = parseFloat(field.value) || 0;
        } else if (field.type === "json") {
          try {
            value = JSON.parse(field.value);
          } catch {
            value = field.value;
          }
        }
        data[field.key] = value;
      }
    });
    return [data]; // Return as array for consistency
  }, [formFields]);

  // Parse JSON input
  const parseJsonInput = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonError(null);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e: any) {
      setJsonError(e.message);
      return null;
    }
  }, [jsonInput]);

  // Apply template
  const applyTemplate = useCallback((templateKey: string) => {
    const template = SAMPLE_TEMPLATES[templateKey as keyof typeof SAMPLE_TEMPLATES];
    if (template) {
      setJsonInput(JSON.stringify(template, null, 2));
      setSelectedTemplate(templateKey);
      setJsonError(null);
    }
  }, []);

  // Execute with input
  const handleExecute = useCallback(() => {
    let inputData;
    
    if (inputMode === "form") {
      inputData = buildFormData();
    } else {
      inputData = parseJsonInput();
      if (!inputData) return; // Don't execute if JSON is invalid
    }

    onExecute(inputData);
  }, [inputMode, buildFormData, parseJsonInput, onExecute]);

  // Copy current input to clipboard
  const copyInput = useCallback(() => {
    const data = inputMode === "form" ? buildFormData() : parseJsonInput();
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [inputMode, buildFormData, parseJsonInput]);

  // Detect first node type for smart suggestions
  const firstNodeType = workflowNodes[0]?.type?.toLowerCase() || "";
  const suggestedTemplate = 
    firstNodeType.includes("webhook") ? "webhook" :
    firstNodeType.includes("email") || firstNodeType.includes("gmail") ? "message" :
    firstNodeType.includes("crm") || firstNodeType.includes("lead") ? "leads" :
    firstNodeType.includes("user") ? "users" : "order";

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Input Data</h3>
              <p className="text-xs text-slate-400">اپنا data دیں اور result دیکھیں</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={copyInput}
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              Copy
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
              onClick={handleExecute}
              disabled={isRunning}
            >
              <Play className="w-4 h-4" />
              {isRunning ? "Running..." : "Run with Input"}
            </Button>
          </div>
        </div>
      </div>

      {/* Input Mode Tabs */}
      <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as any)} className="w-full">
        <div className="px-4 pt-3 border-b border-slate-700/50">
          <TabsList className="h-8 bg-slate-800/50">
            <TabsTrigger value="form" className="text-xs gap-1 data-[state=active]:bg-slate-700">
              <Table className="w-3 h-3" />
              Form
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs gap-1 data-[state=active]:bg-slate-700">
              <FileJson className="w-3 h-3" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="template" className="text-xs gap-1 data-[state=active]:bg-slate-700">
              <Upload className="w-3 h-3" />
              Templates
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Form Input */}
        <TabsContent value="form" className="m-0">
          <ScrollArea className="max-h-[250px]">
            <div className="p-4 space-y-3">
              {formFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) => updateField(idx, { key: e.target.value })}
                    className="w-28 h-8 text-xs bg-slate-800 border-slate-600"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(idx, { type: e.target.value as any })}
                    className="h-8 px-2 text-xs bg-slate-800 border border-slate-600 rounded-md text-white"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="json">JSON</option>
                  </select>
                  <Input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => updateField(idx, { value: e.target.value })}
                    type={field.type === "number" ? "number" : "text"}
                    className="flex-1 h-8 text-xs bg-slate-800 border-slate-600"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                    onClick={() => removeField(idx)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1 border-dashed border-slate-600 hover:border-slate-500"
                onClick={addField}
              >
                <Plus className="w-3 h-3" />
                Add Field
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* JSON Input */}
        <TabsContent value="json" className="m-0">
          <div className="p-4 space-y-2">
            {jsonError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{jsonError}</AlertDescription>
              </Alert>
            )}
            <Textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setJsonError(null);
              }}
              placeholder='[{"key": "value"}]'
              className="min-h-[200px] font-mono text-xs bg-slate-900 border-slate-700 text-green-400"
            />
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs text-slate-500">Quick insert:</span>
              {Object.keys(SAMPLE_TEMPLATES).map(key => (
                <Badge
                  key={key}
                  variant="outline"
                  className="text-[10px] cursor-pointer hover:bg-slate-700 capitalize"
                  onClick={() => applyTemplate(key)}
                >
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Template Selection */}
        <TabsContent value="template" className="m-0">
          <div className="p-4 space-y-3">
            {/* Smart Suggestion */}
            {suggestedTemplate && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Suggested for this workflow</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  onClick={() => {
                    applyTemplate(suggestedTemplate);
                    setInputMode("json");
                  }}
                >
                  Use {suggestedTemplate.charAt(0).toUpperCase() + suggestedTemplate.slice(1)} Template
                </Button>
              </div>
            )}

            {/* All Templates */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SAMPLE_TEMPLATES).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => {
                    applyTemplate(key);
                    setInputMode("json");
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedTemplate === key
                      ? "bg-primary/20 border-primary"
                      : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-medium text-white text-sm capitalize">{key}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {Array.isArray(data) 
                      ? `${data.length} items with ${Object.keys(data[0] || {}).length} fields`
                      : `Object with ${Object.keys(data).length} fields`
                    }
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
