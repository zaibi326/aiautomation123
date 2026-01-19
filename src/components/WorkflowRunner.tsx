import { useState, useEffect, useRef } from "react";
import { Play, FileJson, Terminal, ChevronDown, Loader2, CheckCircle, AlertCircle, Clock, Zap, Copy, Check, RotateCcw } from "lucide-react";
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
  WorkflowEngine,
  WorkflowJSON,
  ExecutionLog,
  ExecutionState,
  loadWorkflowFromFile,
  listAvailableWorkflows
} from "@/lib/WorkflowEngine";

export const WorkflowRunner = () => {
  const [workflows] = useState(listAvailableWorkflows());
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [workflow, setWorkflow] = useState<WorkflowJSON | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Load workflow when selection changes
  useEffect(() => {
    if (!selectedWorkflowId) return;
    
    const loadWorkflow = async () => {
      setIsLoading(true);
      try {
        const wf = workflows.find(w => w.id === selectedWorkflowId);
        if (wf) {
          const loaded = await loadWorkflowFromFile(wf.path);
          setWorkflow(loaded);
          setLogs([]);
          setExecutionState(null);
        }
      } catch (error) {
        console.error("Failed to load workflow:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWorkflow();
  }, [selectedWorkflowId, workflows]);

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

  const selectedWf = workflows.find(w => w.id === selectedWorkflowId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left Panel - Workflow Selection & Info */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary" />
            Workflow Runner
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {/* Workflow Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Workflow</label>
            <Select value={selectedWorkflowId} onValueChange={setSelectedWorkflowId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a workflow..." />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((wf) => (
                  <SelectItem key={wf.id} value={wf.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{wf.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Workflow Info */}
          {selectedWf && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h3 className="font-semibold">{selectedWf.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedWf.description}</p>
              
              {workflow && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Version: {workflow.version || "1.0.0"}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {workflow.nodes.map((node, i) => (
                      <Badge key={node.id} variant="secondary" className="text-xs">
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
