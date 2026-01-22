import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Play, 
  FileJson, 
  Terminal, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap, 
  Copy, 
  Check, 
  RotateCcw,
  Upload,
  Trash2,
  FolderUp,
  X,
  FileUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  WorkflowEngine,
  WorkflowJSON,
  ExecutionLog,
  ExecutionState,
  loadWorkflowFromFile,
  listAvailableWorkflows
} from "@/lib/WorkflowEngine";

interface CustomWorkflow {
  id: string;
  name: string;
  description: string;
  workflow: WorkflowJSON;
  isBuiltIn: boolean;
}

const STORAGE_KEY = "custom_workflows";

export const WorkflowRunner = () => {
  const [builtInWorkflows] = useState(listAvailableWorkflows());
  const [customWorkflows, setCustomWorkflows] = useState<CustomWorkflow[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [allWorkflows, setAllWorkflows] = useState<CustomWorkflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [workflow, setWorkflow] = useState<WorkflowJSON | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Save custom workflows to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customWorkflows));
  }, [customWorkflows]);

  // Combine built-in and custom workflows
  useEffect(() => {
    const loadBuiltInWorkflows = async () => {
      const loaded: CustomWorkflow[] = [];
      for (const wf of builtInWorkflows) {
        try {
          const workflowData = await loadWorkflowFromFile(wf.path);
          loaded.push({
            id: wf.id,
            name: wf.name,
            description: wf.description,
            workflow: workflowData,
            isBuiltIn: true
          });
        } catch (error) {
          console.error(`Failed to load built-in workflow: ${wf.name}`, error);
        }
      }
      setAllWorkflows([...loaded, ...customWorkflows]);
    };
    loadBuiltInWorkflows();
  }, [builtInWorkflows, customWorkflows]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Load workflow when selection changes
  useEffect(() => {
    if (!selectedWorkflowId) {
      setWorkflow(null);
      return;
    }
    
    const selected = allWorkflows.find(w => w.id === selectedWorkflowId);
    if (selected) {
      setWorkflow(selected.workflow);
      setLogs([]);
      setExecutionState(null);
    }
  }, [selectedWorkflowId, allWorkflows]);

  const validateWorkflowJSON = (data: any): data is WorkflowJSON => {
    if (!data || typeof data !== "object") return false;
    
    // Support both custom format and n8n format
    // n8n format may not have id at root level
    if (!data.name && !data.nodes) return false;
    if (!Array.isArray(data.nodes)) return false;
    
    // Validate nodes have minimum required fields
    for (const node of data.nodes) {
      // n8n nodes have type and name, may not have id
      if (!node.type || !node.name) return false;
    }
    
    return true;
  };

  const processUploadedFile = async (file: File): Promise<CustomWorkflow | null> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!validateWorkflowJSON(data)) {
        throw new Error("Invalid workflow JSON structure");
      }
      
      // Generate unique ID to avoid conflicts
      const uniqueId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Ensure all nodes have IDs (n8n format may not have them)
      const nodesWithIds = data.nodes.map((node: any, index: number) => ({
        ...node,
        id: node.id || `node_${index}_${Math.random().toString(36).substr(2, 6)}`
      }));
      
      // Get workflow name from data or file name
      const workflowName = data.name || file.name.replace(".json", "");
      
      return {
        id: uniqueId,
        name: workflowName,
        description: data.description || `Uploaded from ${file.name} (${nodesWithIds.length} nodes)`,
        workflow: { 
          ...data, 
          id: uniqueId, 
          name: workflowName,
          nodes: nodesWithIds 
        },
        isBuiltIn: false
      };
    } catch (error) {
      console.error(`Failed to parse ${file.name}:`, error);
      return null;
    }
  };

  const handleSingleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const customWf = await processUploadedFile(file);
      
      if (customWf) {
        setCustomWorkflows(prev => [...prev, customWf]);
        setSelectedWorkflowId(customWf.id);
        toast({
          title: "✅ Workflow Uploaded",
          description: `"${customWf.name}" added successfully`,
        });
      } else {
        toast({
          title: "❌ Invalid Workflow",
          description: "The file does not contain a valid workflow JSON",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Upload Failed",
        description: "Failed to read the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const uploaded: CustomWorkflow[] = [];
    const failed: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        if (!file.name.endsWith(".json")) {
          failed.push(file.name);
          continue;
        }
        
        const customWf = await processUploadedFile(file);
        if (customWf) {
          uploaded.push(customWf);
        } else {
          failed.push(file.name);
        }
      }
      
      if (uploaded.length > 0) {
        setCustomWorkflows(prev => [...prev, ...uploaded]);
        setSelectedWorkflowId(uploaded[0].id);
        toast({
          title: "✅ Bulk Upload Complete",
          description: `${uploaded.length} workflow(s) added${failed.length > 0 ? `, ${failed.length} failed` : ""}`,
        });
      } else {
        toast({
          title: "❌ No Valid Workflows",
          description: "None of the files contained valid workflow JSON",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Upload Failed",
        description: "An error occurred during bulk upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    const wf = allWorkflows.find(w => w.id === workflowId);
    if (!wf || wf.isBuiltIn) return;
    
    setCustomWorkflows(prev => prev.filter(w => w.id !== workflowId));
    
    if (selectedWorkflowId === workflowId) {
      setSelectedWorkflowId("");
      setWorkflow(null);
    }
    
    toast({
      title: "🗑️ Workflow Deleted",
      description: `"${wf.name}" has been removed`,
    });
  };

  const handleDeleteAllCustom = () => {
    setCustomWorkflows([]);
    
    const selectedWf = allWorkflows.find(w => w.id === selectedWorkflowId);
    if (selectedWf && !selectedWf.isBuiltIn) {
      setSelectedWorkflowId("");
      setWorkflow(null);
    }
    
    toast({
      title: "🗑️ All Custom Workflows Deleted",
      description: "All uploaded workflows have been removed",
    });
  };

  const runWorkflow = async () => {
    if (!workflow) return;
    
    setIsRunning(true);
    setLogs([]);
    setExecutionState(null);
    
    const engine = new WorkflowEngine(workflow);
    
    engine.setLogCallback((newLogs) => {
      setLogs([...newLogs]);
    });
    
    engine.setStateCallback((state) => {
      setExecutionState({ ...state });
    });
    
    await engine.run();
    setIsRunning(false);
  };

  const copyOutput = () => {
    if (executionState?.finalOutput) {
      navigator.clipboard.writeText(JSON.stringify(executionState.finalOutput, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetExecution = () => {
    setLogs([]);
    setExecutionState(null);
  };

  const getLogIcon = (status: ExecutionLog["status"]) => {
    switch (status) {
      case "started": return <Zap className="w-3 h-3 text-blue-400" />;
      case "processing": return <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />;
      case "completed": return <CheckCircle className="w-3 h-3 text-green-400" />;
      case "error": return <AlertCircle className="w-3 h-3 text-red-400" />;
      case "skipped": return <Clock className="w-3 h-3 text-muted-foreground" />;
      default: return null;
    }
  };

  const getLogColor = (status: ExecutionLog["status"]) => {
    switch (status) {
      case "started": return "text-blue-400";
      case "processing": return "text-yellow-400";
      case "completed": return "text-green-400";
      case "error": return "text-red-400";
      case "skipped": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  const selectedWf = allWorkflows.find(w => w.id === selectedWorkflowId);
  const customCount = customWorkflows.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSingleUpload}
        accept=".json"
        className="hidden"
      />
      <input
        type="file"
        ref={bulkFileInputRef}
        onChange={handleBulkUpload}
        accept=".json"
        multiple
        className="hidden"
      />

      {/* Left Panel - Workflow Selection & Info */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary" />
            Workflow Runner
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 overflow-auto">
          {/* Upload Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Workflows</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Single
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => bulkFileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FolderUp className="w-4 h-4" />
                )}
                Bulk
              </Button>
            </div>
          </div>

          {/* Workflow Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Select Workflow</label>
              {customCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {customCount} custom
                </Badge>
              )}
            </div>
            <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a workflow..." />
              </SelectTrigger>
              <SelectContent>
                {/* Built-in workflows */}
                {allWorkflows.filter(w => w.isBuiltIn).length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Built-in Workflows
                    </div>
                    {allWorkflows.filter(w => w.isBuiltIn).map((wf) => (
                      <SelectItem key={wf.id} value={wf.id}>
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-primary" />
                          <span>{wf.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                
                {/* Custom workflows */}
                {customWorkflows.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                      Your Workflows
                    </div>
                    {customWorkflows.map((wf) => (
                      <SelectItem key={wf.id} value={wf.id}>
                        <div className="flex items-center gap-2">
                          <FileUp className="w-3 h-3 text-green-500" />
                          <span>{wf.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Workflow Info */}
          {selectedWf && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{selectedWf.name}</h3>
                {!selectedWf.isBuiltIn && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{selectedWf.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteWorkflow(selectedWf.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{selectedWf.description}</p>
              
              {workflow && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedWf.isBuiltIn ? "secondary" : "default"} className="text-xs">
                      {selectedWf.isBuiltIn ? "Built-in" : "Custom"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      v{workflow.version || "1.0.0"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {workflow.nodes.map((node, i) => (
                      <Badge key={node.id} variant="outline" className="text-xs">
                        {i + 1}. {node.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Run Button */}
          <div className="flex gap-2">
            <Button
              onClick={runWorkflow}
              disabled={!workflow || isRunning || isLoading}
              className="flex-1"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Workflow
                </>
              )}
            </Button>
            
            {logs.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={resetExecution}
                disabled={isRunning}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Delete All Custom Button */}
          {customCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-destructive hover:text-destructive gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete All Custom Workflows ({customCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Custom Workflows?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {customCount} uploaded workflow(s). This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllCustom}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Execution Status */}
          {executionState && (
            <div className="p-4 rounded-lg border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={
                  executionState.status === "completed" ? "default" :
                  executionState.status === "error" ? "destructive" :
                  executionState.status === "running" ? "secondary" : "outline"
                }>
                  {executionState.status.toUpperCase()}
                </Badge>
              </div>
              
              {executionState.startTime && executionState.endTime && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span>
                    {executionState.endTime.getTime() - executionState.startTime.getTime()}ms
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Items Processed</span>
                <span>{executionState.sharedState.itemCount || 0}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Execution Logs & Output */}
      <Card className="lg:col-span-2 flex flex-col">
        <Tabs defaultValue="logs" className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="logs" className="gap-2">
                  <Terminal className="w-4 h-4" />
                  Execution Log
                </TabsTrigger>
                <TabsTrigger value="output" className="gap-2">
                  <FileJson className="w-4 h-4" />
                  JSON Output
                </TabsTrigger>
                <TabsTrigger value="workflow" className="gap-2">
                  <FileJson className="w-4 h-4" />
                  Workflow JSON
                </TabsTrigger>
              </TabsList>
              
              {executionState?.finalOutput && (
                <Button variant="ghost" size="sm" onClick={copyOutput}>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            {/* Execution Logs */}
            <TabsContent value="logs" className="h-full m-0 p-4">
              <ScrollArea className="h-[calc(100vh-350px)] rounded-lg bg-slate-950 p-4 font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <Terminal className="w-12 h-12 mb-4 opacity-50" />
                    <p>Select a workflow and click "Run Workflow"</p>
                    <p className="text-xs mt-2">Execution logs will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className={`flex items-start gap-2 ${getLogColor(log.status)}`}>
                        <span className="text-muted-foreground text-xs w-20 flex-shrink-0">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className="flex-shrink-0 mt-0.5">{getLogIcon(log.status)}</span>
                        <span className="break-all">{log.message}</span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* JSON Output */}
            <TabsContent value="output" className="h-full m-0 p-4">
              <ScrollArea className="h-[calc(100vh-350px)] rounded-lg bg-slate-950 p-4">
                {executionState?.finalOutput ? (
                  <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                    {JSON.stringify(executionState.finalOutput, null, 2)}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <FileJson className="w-12 h-12 mb-4 opacity-50" />
                    <p>No output yet</p>
                    <p className="text-xs mt-2">Run a workflow to see the JSON output</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Workflow JSON */}
            <TabsContent value="workflow" className="h-full m-0 p-4">
              <ScrollArea className="h-[calc(100vh-350px)] rounded-lg bg-slate-950 p-4">
                {workflow ? (
                  <pre className="text-sm font-mono text-cyan-400 whitespace-pre-wrap">
                    {JSON.stringify(workflow, null, 2)}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <FileJson className="w-12 h-12 mb-4 opacity-50" />
                    <p>No workflow selected</p>
                    <p className="text-xs mt-2">Select a workflow to view its JSON</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};