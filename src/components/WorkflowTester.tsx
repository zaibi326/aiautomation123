import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  FileJson,
  Zap,
  Info
} from "lucide-react";
import { toast } from "sonner";
import N8nWorkflowPreview from "./N8nWorkflowPreview";
import { useWorkflowAgentEngine } from "./WorkflowAgentEngine";
import { ScrollArea } from "./ui/scroll-area";

interface WorkflowTesterProps {
  hasAccess: boolean;
  isAdmin: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  nodeCount: number;
  nodeTypes: string[];
  hasWebhook: boolean;
  hasTrigger: boolean;
  connections: number;
}

export const WorkflowTester = ({ hasAccess, isAdmin }: WorkflowTesterProps) => {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [parsedWorkflow, setParsedWorkflow] = useState<any>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const canTest = hasAccess || isAdmin;

  const validateWorkflow = (json: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let nodeTypes: string[] = [];
    let hasWebhook = false;
    let hasTrigger = false;
    let connections = 0;

    // Basic structure validation
    if (!json) {
      errors.push("Invalid JSON structure");
      return { isValid: false, errors, warnings, nodeCount: 0, nodeTypes, hasWebhook, hasTrigger, connections };
    }

    // Check for nodes
    const nodes = json.nodes || [];
    if (nodes.length === 0) {
      errors.push("Workflow has no nodes");
    }

    // Analyze nodes
    for (const node of nodes) {
      const nodeType = node.type || node.name || "Unknown";
      nodeTypes.push(nodeType);

      // Check for triggers
      if (nodeType.toLowerCase().includes("webhook") || nodeType.toLowerCase().includes("trigger")) {
        hasTrigger = true;
        if (nodeType.toLowerCase().includes("webhook")) {
          hasWebhook = true;
        }
      }

      // Check node configuration
      if (!node.name && !node.type) {
        warnings.push(`Node at position ${nodes.indexOf(node)} has no name or type`);
      }

      // Check for required parameters
      if (node.parameters) {
        const params = node.parameters;
        if (params.url === "" || params.url === undefined) {
          if (nodeType.toLowerCase().includes("http") || nodeType.toLowerCase().includes("request")) {
            warnings.push(`HTTP node "${node.name || nodeType}" may need a URL configured`);
          }
        }
      }
    }

    // Check for connections
    const connectionsData = json.connections || {};
    connections = Object.keys(connectionsData).length;

    if (nodes.length > 1 && connections === 0) {
      warnings.push("Multiple nodes but no connections defined");
    }

    if (!hasTrigger) {
      warnings.push("No trigger node found - workflow may not start automatically");
    }

    // Get unique node types
    nodeTypes = [...new Set(nodeTypes)];

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      nodeCount: nodes.length,
      nodeTypes,
      hasWebhook,
      hasTrigger,
      connections
    };
  };

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      toast.error("Please paste a workflow JSON");
      return;
    }

    setValidating(true);
    setValidationResult(null);
    setParsedWorkflow(null);
    setShowSimulation(false);
    setSimulationLogs([]);
    setSimulationComplete(false);

    try {
      // Simulate validation delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));

      const json = JSON.parse(jsonInput);
      const result = validateWorkflow(json);
      
      setValidationResult(result);
      if (result.isValid) {
        setParsedWorkflow(json);
        toast.success("Workflow JSON is valid!");
      } else {
        toast.error("Workflow has validation errors");
      }
    } catch (e: any) {
      setValidationResult({
        isValid: false,
        errors: [`JSON Parse Error: ${e.message}`],
        warnings: [],
        nodeCount: 0,
        nodeTypes: [],
        hasWebhook: false,
        hasTrigger: false,
        connections: 0
      });
      toast.error("Invalid JSON format");
    } finally {
      setValidating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      toast.success(`Loaded: ${file.name}`);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleRunSimulation = () => {
    setShowSimulation(true);
    setSimulationComplete(false);
    setSimulationLogs([]);
  };

  const handleSimulationComplete = () => {
    setSimulationComplete(true);
    toast.success("Workflow simulation completed successfully!");
  };

  const handleSimulationLog = (log: string) => {
    setSimulationLogs(prev => [...prev, log]);
  };

  const resetTester = () => {
    setJsonInput("");
    setValidationResult(null);
    setParsedWorkflow(null);
    setShowSimulation(false);
    setSimulationLogs([]);
    setSimulationComplete(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-primary/30 hover:border-primary/50"
        >
          <FileJson className="w-4 h-4" />
          Test Your Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Workflow Tester
          </DialogTitle>
          <DialogDescription>
            Upload or paste your n8n workflow JSON to validate and simulate it
          </DialogDescription>
        </DialogHeader>

        {!canTest ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to test your own workflow JSON files
            </p>
            <Badge variant="outline" className="text-amber-600 border-amber-500/50">
              Basic or Pro Plan Required
            </Badge>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Input Section */}
            {!showSimulation && (
              <>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                        Upload JSON File
                      </span>
                    </Button>
                  </label>
                  <Button variant="ghost" onClick={resetTester} className="text-muted-foreground">
                    Clear
                  </Button>
                </div>

                <Textarea
                  placeholder='Paste your n8n workflow JSON here... (e.g., {"nodes": [...], "connections": {...}})'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="min-h-[200px] font-mono text-xs"
                />

                <Button 
                  onClick={handleValidate} 
                  disabled={validating || !jsonInput.trim()}
                  className="w-full gap-2"
                >
                  {validating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Validate Workflow
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Validation Results */}
            {validationResult && !showSimulation && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-destructive" />
                  )}
                  <div>
                    <h4 className="font-semibold">
                      {validationResult.isValid ? "Workflow Valid ✓" : "Validation Failed"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {validationResult.nodeCount} nodes, {validationResult.connections} connections
                    </p>
                  </div>
                </div>

                {/* Node Types */}
                {validationResult.nodeTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {validationResult.nodeTypes.slice(0, 10).map((type, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {validationResult.nodeTypes.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{validationResult.nodeTypes.length - 10} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Errors */}
                {validationResult.errors.length > 0 && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <h5 className="font-medium text-destructive flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4" />
                      Errors ({validationResult.errors.length})
                    </h5>
                    <ul className="text-sm space-y-1">
                      {validationResult.errors.map((error, i) => (
                        <li key={i} className="text-destructive/80">• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {validationResult.warnings.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <h5 className="font-medium text-amber-600 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      Warnings ({validationResult.warnings.length})
                    </h5>
                    <ul className="text-sm space-y-1">
                      {validationResult.warnings.map((warning, i) => (
                        <li key={i} className="text-amber-600/80">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Info badges */}
                <div className="flex gap-2">
                  <Badge variant={validationResult.hasTrigger ? "default" : "secondary"}>
                    {validationResult.hasTrigger ? "✓ Has Trigger" : "No Trigger"}
                  </Badge>
                  <Badge variant={validationResult.hasWebhook ? "default" : "secondary"}>
                    {validationResult.hasWebhook ? "✓ Webhook" : "No Webhook"}
                  </Badge>
                </div>

                {/* Preview */}
                {parsedWorkflow && (
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Workflow Preview
                    </h5>
                    <div className="h-48 rounded-lg overflow-hidden border bg-muted/30">
                      <N8nWorkflowPreview 
                        json={JSON.stringify(parsedWorkflow)}
                        compact={true}
                        highlighted={true}
                      />
                    </div>
                  </div>
                )}

                {/* Run Simulation Button */}
                {validationResult.isValid && (
                  <Button 
                    onClick={handleRunSimulation}
                    variant="hero"
                    className="w-full gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </Button>
                )}
              </div>
            )}

            {/* Simulation View */}
            {showSimulation && parsedWorkflow && (
              <SimulationView 
                workflow={parsedWorkflow}
                onComplete={handleSimulationComplete}
                onLog={handleSimulationLog}
                simulationComplete={simulationComplete}
                simulationLogs={simulationLogs}
                onBack={() => setShowSimulation(false)}
                onRunAgain={handleRunSimulation}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Separate simulation view component
interface SimulationViewProps {
  workflow: any;
  onComplete: () => void;
  onLog: (log: string) => void;
  simulationComplete: boolean;
  simulationLogs: string[];
  onBack: () => void;
  onRunAgain: () => void;
}

const SimulationView = ({ 
  workflow, 
  onComplete, 
  onLog, 
  simulationComplete, 
  simulationLogs,
  onBack,
  onRunAgain
}: SimulationViewProps) => {
  const { state, executeWorkflow, resetExecution } = useWorkflowAgentEngine(workflow);

  // Auto-execute when mounted
  useEffect(() => {
    executeWorkflow(
      undefined,
      undefined,
      onLog
    );
  }, []);

  const handleRunAgain = () => {
    resetExecution();
    onRunAgain();
    setTimeout(() => {
      executeWorkflow(undefined, undefined, onLog);
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Zap className={`w-5 h-5 text-primary ${state.status === 'running' ? 'animate-pulse' : ''}`} />
          Workflow Simulation
        </h4>
        {state.status === 'completed' && (
          <Badge className="bg-green-500">Completed ✓</Badge>
        )}
        {state.status === 'running' && (
          <Badge variant="outline" className="animate-pulse">Running...</Badge>
        )}
      </div>

      {/* Progress */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Status:</span>
          <span className="ml-2 font-medium capitalize">{state.status}</span>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <span className="text-muted-foreground">Time:</span>
          <span className="ml-2 font-medium">{(state.totalTime / 1000).toFixed(2)}s</span>
        </div>
      </div>

      {/* Node Status */}
      {Object.keys(state.nodeStatuses).length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-sm">Node Execution:</h5>
          <div className="flex flex-wrap gap-2">
            {Object.entries(state.nodeStatuses).map(([nodeName, status]) => (
              <Badge 
                key={nodeName}
                variant={status === 'completed' ? 'default' : status === 'running' ? 'outline' : 'secondary'}
                className={status === 'running' ? 'animate-pulse' : ''}
              >
                {status === 'completed' && '✓ '}
                {status === 'running' && '⏳ '}
                {nodeName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Execution Logs */}
      <div className="border rounded-lg">
        <div className="p-2 border-b bg-muted/30">
          <span className="text-sm font-medium">Execution Logs</span>
        </div>
        <ScrollArea className="h-48 p-3">
          <div className="font-mono text-xs space-y-1">
            {simulationLogs.map((log, i) => (
              <div key={i} className="text-muted-foreground">
                {log}
              </div>
            ))}
            {state.status === 'running' && (
              <div className="text-primary animate-pulse">Processing...</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Execution Results */}
      {state.executionResults.length > 0 && (
        <div className="border rounded-lg p-3">
          <h5 className="font-medium text-sm mb-2">Results Summary:</h5>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="p-2 bg-green-500/10 rounded">
              <div className="text-green-600 font-semibold">
                {state.executionResults.filter(r => r.success).length}
              </div>
              <div className="text-xs text-muted-foreground">Succeeded</div>
            </div>
            <div className="p-2 bg-destructive/10 rounded">
              <div className="text-destructive font-semibold">
                {state.executionResults.filter(r => !r.success).length}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="p-2 bg-primary/10 rounded">
              <div className="text-primary font-semibold">
                {state.executionResults.reduce((acc, r) => acc + r.itemCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Items</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(state.status === 'completed' || state.status === 'error') && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
          >
            Back to Validation
          </Button>
          <Button 
            onClick={handleRunAgain}
            className="flex-1 gap-2"
          >
            <Play className="w-4 h-4" />
            Run Again
          </Button>
        </div>
      )}
    </div>
  );
};