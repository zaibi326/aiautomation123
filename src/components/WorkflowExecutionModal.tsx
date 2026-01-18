import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Play, X, Clock, Zap, Code, FileJson, Copy, Check, Download, BookOpen, ExternalLink, ArrowRight, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface N8nNode {
  id?: string;
  name: string;
  type: string;
  position: [number, number];
  parameters?: Record<string, any>;
}

interface N8nWorkflow {
  nodes?: N8nNode[];
  connections?: Record<string, { main?: { node: string; type: string; index: number }[][] }>;
}

interface WorkflowExecutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowJson: any;
  workflowTitle: string;
  onComplete?: () => void;
}

// Get node style based on type
const getNodeStyle = (type: string): { bg: string; border: string; activeBg: string; icon: string } => {
  const typeMap: Record<string, { bg: string; border: string; activeBg: string; icon: string }> = {
    webhook: { bg: "bg-purple-500/20", border: "border-purple-500", activeBg: "bg-purple-500", icon: "🔗" },
    httpRequest: { bg: "bg-blue-500/20", border: "border-blue-500", activeBg: "bg-blue-500", icon: "🌐" },
    gmail: { bg: "bg-red-500/20", border: "border-red-500", activeBg: "bg-red-500", icon: "📧" },
    googleSheets: { bg: "bg-green-500/20", border: "border-green-500", activeBg: "bg-green-500", icon: "📊" },
    slack: { bg: "bg-violet-500/20", border: "border-violet-500", activeBg: "bg-violet-500", icon: "💬" },
    telegram: { bg: "bg-sky-500/20", border: "border-sky-500", activeBg: "bg-sky-500", icon: "✈️" },
    discord: { bg: "bg-indigo-500/20", border: "border-indigo-500", activeBg: "bg-indigo-500", icon: "🎮" },
    openAi: { bg: "bg-emerald-500/20", border: "border-emerald-500", activeBg: "bg-emerald-500", icon: "🤖" },
    code: { bg: "bg-yellow-500/20", border: "border-yellow-500", activeBg: "bg-yellow-500", icon: "💻" },
    function: { bg: "bg-orange-500/20", border: "border-orange-500", activeBg: "bg-orange-500", icon: "⚡" },
    if: { bg: "bg-amber-500/20", border: "border-amber-500", activeBg: "bg-amber-500", icon: "🔀" },
    switch: { bg: "bg-amber-500/20", border: "border-amber-500", activeBg: "bg-amber-500", icon: "🔀" },
    merge: { bg: "bg-teal-500/20", border: "border-teal-500", activeBg: "bg-teal-500", icon: "🔗" },
    set: { bg: "bg-cyan-500/20", border: "border-cyan-500", activeBg: "bg-cyan-500", icon: "📝" },
    start: { bg: "bg-green-500/20", border: "border-green-500", activeBg: "bg-green-500", icon: "▶️" },
    cron: { bg: "bg-pink-500/20", border: "border-pink-500", activeBg: "bg-pink-500", icon: "⏰" },
    scheduleTrigger: { bg: "bg-pink-500/20", border: "border-pink-500", activeBg: "bg-pink-500", icon: "⏰" },
    manualTrigger: { bg: "bg-green-500/20", border: "border-green-500", activeBg: "bg-green-500", icon: "👆" },
    whatsapp: { bg: "bg-green-600/20", border: "border-green-600", activeBg: "bg-green-600", icon: "📱" },
    notion: { bg: "bg-neutral-500/20", border: "border-neutral-500", activeBg: "bg-neutral-500", icon: "📔" },
    airtable: { bg: "bg-blue-600/20", border: "border-blue-600", activeBg: "bg-blue-600", icon: "📋" },
  };

  const lowerType = type.toLowerCase();
  for (const [key, value] of Object.entries(typeMap)) {
    if (lowerType.includes(key.toLowerCase())) {
      return value;
    }
  }

  return { bg: "bg-primary/20", border: "border-primary", activeBg: "bg-primary", icon: "⚙️" };
};

// Get short name from node type
const getShortType = (type: string): string => {
  const parts = type.split(".");
  const name = parts[parts.length - 1] || type;
  return name.replace(/([A-Z])/g, " $1").trim();
};

type NodeStatus = "pending" | "running" | "completed" | "error";

interface NodeOutput {
  items: number;
  data: any;
}

// Generate realistic sample output based on node type
const generateNodeOutput = (nodeType: string, nodeName: string): NodeOutput => {
  const lowerType = nodeType.toLowerCase();
  
  if (lowerType.includes("webhook") || lowerType.includes("trigger") || lowerType.includes("manual")) {
    return {
      items: 1,
      data: {
        body: { user_id: "usr_12345", action: "workflow_triggered", timestamp: new Date().toISOString() },
        headers: { "content-type": "application/json" }
      }
    };
  }
  
  if (lowerType.includes("httprequest") || lowerType.includes("http")) {
    return {
      items: 3,
      data: [
        { id: 1, name: "Product A", price: 299, status: "active" },
        { id: 2, name: "Product B", price: 499, status: "active" },
        { id: 3, name: "Product C", price: 199, status: "pending" }
      ]
    };
  }
  
  if (lowerType.includes("gmail") || lowerType.includes("email")) {
    return {
      items: 1,
      data: { 
        messageId: "msg_abc123", 
        to: "customer@example.com", 
        subject: "Your order confirmation",
        status: "sent",
        timestamp: new Date().toISOString()
      }
    };
  }
  
  if (lowerType.includes("googlesheets") || lowerType.includes("sheets")) {
    return {
      items: 5,
      data: {
        spreadsheetId: "1BxiM...kYJO",
        range: "Sheet1!A1:D5",
        rowsUpdated: 5,
        values: [["Name", "Email", "Status", "Date"]]
      }
    };
  }
  
  if (lowerType.includes("slack")) {
    return {
      items: 1,
      data: {
        channel: "#notifications",
        message: "✅ Workflow completed successfully!",
        ts: "1234567890.123456",
        ok: true
      }
    };
  }
  
  if (lowerType.includes("telegram") || lowerType.includes("whatsapp")) {
    return {
      items: 1,
      data: {
        chat_id: 123456789,
        message_id: 4567,
        text: "Your request has been processed.",
        sent: true
      }
    };
  }
  
  if (lowerType.includes("openai") || lowerType.includes("ai")) {
    return {
      items: 1,
      data: {
        model: "gpt-4",
        response: "Based on the data analysis, I recommend focusing on Product A which shows the highest engagement rate of 78%.",
        tokens: { prompt: 150, completion: 85, total: 235 }
      }
    };
  }
  
  if (lowerType.includes("code") || lowerType.includes("function")) {
    return {
      items: 2,
      data: [
        { processed: true, originalId: 1, transformedValue: "PRODUCT_A_299" },
        { processed: true, originalId: 2, transformedValue: "PRODUCT_B_499" }
      ]
    };
  }
  
  if (lowerType.includes("if") || lowerType.includes("switch")) {
    return {
      items: 1,
      data: { condition: "price > 200", result: true, branch: "true" }
    };
  }
  
  if (lowerType.includes("merge")) {
    return {
      items: 4,
      data: {
        mergedItems: 4,
        sources: ["API Response", "AI Processing"],
        mode: "append"
      }
    };
  }
  
  if (lowerType.includes("notion")) {
    return {
      items: 1,
      data: {
        pageId: "abc-123-def",
        title: "New Entry Created",
        url: "https://notion.so/...",
        created: true
      }
    };
  }
  
  if (lowerType.includes("airtable")) {
    return {
      items: 2,
      data: {
        records: [
          { id: "rec123", fields: { Name: "Task 1", Status: "Done" } },
          { id: "rec456", fields: { Name: "Task 2", Status: "In Progress" } }
        ]
      }
    };
  }
  
  if (lowerType.includes("set")) {
    return {
      items: 1,
      data: { key: "processedData", value: { status: "ready", count: 10 } }
    };
  }
  
  // Default output
  return {
    items: 1,
    data: { executed: true, nodeName, timestamp: new Date().toISOString() }
  };
};

export const WorkflowExecutionModal = ({
  open,
  onOpenChange,
  workflowJson,
  workflowTitle,
  onComplete,
}: WorkflowExecutionModalProps) => {
  const [executionStatus, setExecutionStatus] = useState<"idle" | "running" | "completed">("idle");
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});
  const [nodeOutputs, setNodeOutputs] = useState<Record<string, NodeOutput>>({});
  const [nodeExecutionTimes, setNodeExecutionTimes] = useState<Record<string, number>>({});
  const [executionLogs, setExecutionLogs] = useState<Array<{ type: 'log' | 'output'; content: string; nodeName?: string }>>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [selectedNodeOutput, setSelectedNodeOutput] = useState<string | null>(null);
  const [selectedNodeFromPreview, setSelectedNodeFromPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"output" | "workflow" | "guide">("output");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedNodeOutput, setCopiedNodeOutput] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<"n8n" | "make" | "zapier" | null>("n8n");

  const copyNodeOutput = (nodeName: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedNodeOutput(nodeName);
    setTimeout(() => setCopiedNodeOutput(null), 2000);
  };

  // Demo workflow to show when no preview_json is available
  const demoWorkflow: N8nWorkflow = {
    nodes: [
      { name: "Trigger", type: "n8n-nodes-base.manualTrigger", position: [0, 0] },
      { name: "Process Data", type: "n8n-nodes-base.function", position: [250, 0] },
      { name: "API Request", type: "n8n-nodes-base.httpRequest", position: [500, -50] },
      { name: "AI Processing", type: "n8n-nodes-base.openAi", position: [500, 50] },
      { name: "Merge Results", type: "n8n-nodes-base.merge", position: [750, 0] },
      { name: "Send Notification", type: "n8n-nodes-base.slack", position: [1000, 0] },
    ],
    connections: {
      "Trigger": { main: [[{ node: "Process Data", type: "main", index: 0 }]] },
      "Process Data": { main: [[{ node: "API Request", type: "main", index: 0 }, { node: "AI Processing", type: "main", index: 0 }]] },
      "API Request": { main: [[{ node: "Merge Results", type: "main", index: 0 }]] },
      "AI Processing": { main: [[{ node: "Merge Results", type: "main", index: 0 }]] },
      "Merge Results": { main: [[{ node: "Send Notification", type: "main", index: 0 }]] },
    }
  };

  const workflow = useMemo<N8nWorkflow>(() => {
    try {
      if (!workflowJson) {
        return demoWorkflow;
      }
      if (typeof workflowJson === "string") {
        const parsed = JSON.parse(workflowJson);
        return parsed?.nodes?.length > 0 ? parsed : demoWorkflow;
      }
      return workflowJson?.nodes?.length > 0 ? workflowJson : demoWorkflow;
    } catch {
      return demoWorkflow;
    }
  }, [workflowJson]);

  const nodes = workflow?.nodes || [];

  // Build execution order based on connections
  const executionOrder = useMemo(() => {
    if (!workflow?.nodes) return [];
    
    const connections = workflow.connections || {};
    const nodeNames = workflow.nodes.map(n => n.name);
    
    // Find nodes with no incoming connections (start nodes)
    const hasIncoming = new Set<string>();
    Object.values(connections).forEach(targets => {
      targets.main?.forEach(mainConns => {
        mainConns.forEach(conn => {
          hasIncoming.add(conn.node);
        });
      });
    });
    
    // Simple topological sort
    const startNodes = nodeNames.filter(name => !hasIncoming.has(name));
    const visited = new Set<string>();
    const order: string[] = [];
    
    const visit = (nodeName: string) => {
      if (visited.has(nodeName)) return;
      visited.add(nodeName);
      order.push(nodeName);
      
      const nodeConnections = connections[nodeName]?.main?.[0] || [];
      nodeConnections.forEach(conn => visit(conn.node));
    };
    
    startNodes.forEach(visit);
    
    // Add any remaining nodes
    nodeNames.forEach(name => {
      if (!visited.has(name)) {
        order.push(name);
      }
    });
    
    return order;
  }, [workflow]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setExecutionStatus("idle");
      setNodeStatuses({});
      setNodeOutputs({});
      setNodeExecutionTimes({});
      setExecutionLogs([]);
      setTotalTime(0);
      setSelectedNodeOutput(null);
    }
  }, [open]);

  const startExecution = async () => {
    setExecutionStatus("running");
    setExecutionLogs([{ type: 'log', content: "🚀 Starting workflow execution..." }]);
    setNodeOutputs({});
    setNodeExecutionTimes({});
    setSelectedNodeOutput(null);
    setSelectedNodeFromPreview(null);
    
    const startTime = Date.now();
    
    // Initialize all nodes as pending
    const initialStatuses: Record<string, NodeStatus> = {};
    nodes.forEach(node => {
      initialStatuses[node.name] = "pending";
    });
    setNodeStatuses(initialStatuses);

    // Execute nodes in order with animation
    for (let i = 0; i < executionOrder.length; i++) {
      const nodeName = executionOrder[i];
      const node = nodes.find(n => n.name === nodeName);
      
      // Set current node to running
      setNodeStatuses(prev => ({ ...prev, [nodeName]: "running" }));
      setExecutionLogs(prev => [...prev, { type: 'log', content: `⏳ Running: ${nodeName}...` }]);
      
      // Simulate execution time (500-1500ms per node)
      const nodeStartTime = Date.now();
      const executionTime = 500 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, executionTime));
      const nodeEndTime = Date.now();
      const actualNodeTime = nodeEndTime - nodeStartTime;
      
      // Store the execution time for this node
      setNodeExecutionTimes(prev => ({ ...prev, [nodeName]: actualNodeTime }));
      
      // Generate output for this node
      const output = generateNodeOutput(node?.type || '', nodeName);
      setNodeOutputs(prev => ({ ...prev, [nodeName]: output }));
      
      // Set node to completed
      setNodeStatuses(prev => ({ ...prev, [nodeName]: "completed" }));
      setExecutionLogs(prev => [
        ...prev, 
        { type: 'log', content: `✅ Completed: ${nodeName} (${actualNodeTime}ms) → ${output.items} item${output.items !== 1 ? 's' : ''}` },
        { type: 'output', content: JSON.stringify(output.data, null, 2), nodeName }
      ]);
      
      // Update total time
      setTotalTime(Date.now() - startTime);
    }
    
    // Final completion
    const finalTime = (Date.now() - startTime) / 1000;
    setTotalTime(finalTime * 1000);
    setExecutionLogs(prev => [...prev, { type: 'log', content: `\n🎉 Workflow completed successfully in ${finalTime.toFixed(2)}s` }]);
    setExecutionStatus("completed");
    
    onComplete?.();
  };

  // Calculate bounds for workflow preview
  const positions = nodes.map(n => n.position || [0, 0]);
  const minX = Math.min(...positions.map(p => p[0]), 0);
  const minY = Math.min(...positions.map(p => p[1]), 0);
  const maxX = Math.max(...positions.map(p => p[0]), 200);
  const maxY = Math.max(...positions.map(p => p[1]), 100);

  const normalizedNodes = nodes.map((node, idx) => {
    const pos = node.position || [0, 0];
    return {
      ...node,
      x: pos[0] - minX,
      y: pos[1] - minY,
      idx,
    };
  });

  const width = maxX - minX + 250;
  const height = maxY - minY + 100;

  // Create connection lines
  const connections = workflow?.connections || {};
  const connectionLines: { from: string; to: string }[] = [];
  Object.entries(connections).forEach(([fromNode, targets]) => {
    targets.main?.forEach(mainConnections => {
      mainConnections.forEach(conn => {
        connectionLines.push({ from: fromNode, to: conn.node });
      });
    });
  });

  const getNodePos = (name: string) => {
    const node = normalizedNodes.find(n => n.name === name);
    return node ? { x: node.x, y: node.y } : null;
  };

  const nodeWidth = 160;
  const nodeHeight = 55;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {workflowTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          {/* Workflow Visualization */}
          <div className="border border-border rounded-lg bg-muted/30 overflow-hidden">
            <div className="p-3 border-b border-border bg-card flex items-center justify-between">
              <span className="text-sm font-medium">Workflow Preview</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {(totalTime / 1000).toFixed(2)}s
              </div>
            </div>
            <ScrollArea className="h-[300px]">
              <div 
                className="relative p-4"
                style={{ 
                  minWidth: Math.max(width + 50, 300),
                  minHeight: Math.max(height + 50, 200)
                }}
              >
                {/* Connection lines */}
                <svg 
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    width: Math.max(width + 50, 300),
                    height: Math.max(height + 50, 200)
                  }}
                >
                  {connectionLines.map((conn, idx) => {
                    const from = getNodePos(conn.from);
                    const to = getNodePos(conn.to);
                    if (!from || !to) return null;

                    const startX = from.x + nodeWidth + 20;
                    const startY = from.y + nodeHeight / 2 + 20;
                    const endX = to.x + 20;
                    const endY = to.y + nodeHeight / 2 + 20;
                    const midX = (startX + endX) / 2;

                    const fromStatus = nodeStatuses[conn.from];
                    const toStatus = nodeStatuses[conn.to];
                    const isActive = fromStatus === "completed" && (toStatus === "running" || toStatus === "completed");

                    return (
                      <path
                        key={idx}
                        d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                        fill="none"
                        stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                        strokeWidth={isActive ? "3" : "2"}
                        strokeOpacity={isActive ? "1" : "0.3"}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {normalizedNodes.map((node) => {
                  const style = getNodeStyle(node.type);
                  const shortType = getShortType(node.type);
                  const status = nodeStatuses[node.name] || "pending";
                  const hasOutput = nodeOutputs[node.name];
                  const isSelected = selectedNodeFromPreview === node.name;
                  const executionTime = nodeExecutionTimes[node.name];

                  const nodeContent = (
                    <div
                      key={node.idx}
                      className={`absolute rounded-lg border-2 shadow-sm transition-all duration-300 ${
                        hasOutput && !isSelected ? 'cursor-pointer hover:ring-2 hover:ring-primary/50 animate-[glow-pulse_2s_ease-in-out_infinite]' : ''
                      } ${
                        hasOutput && !isSelected ? 'hover:scale-[1.08]' : ''
                      } ${
                        isSelected 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background z-10 cursor-pointer'
                          : ''
                      } ${
                        status === "running" 
                          ? `${style.activeBg} border-white scale-110 shadow-lg animate-pulse` 
                          : status === "completed"
                          ? `${style.bg} ${style.border} scale-105 shadow-md`
                          : `bg-muted/50 border-muted-foreground/30 opacity-60`
                      }`}
                      style={{
                        left: node.x + 20,
                        top: node.y + 20,
                        width: nodeWidth,
                        height: nodeHeight,
                        ...(hasOutput && !isSelected && status === "completed" ? {
                          boxShadow: `0 0 12px 2px hsl(var(--primary) / 0.4)`,
                        } : {}),
                      }}
                      onClick={() => {
                        if (hasOutput) {
                          setSelectedNodeFromPreview(isSelected ? null : node.name);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 p-2 h-full">
                        <span className="text-base">{style.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate text-xs ${
                            status === "running" ? "text-white" : "text-foreground"
                          }`}>
                            {node.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <p className={`truncate text-[10px] ${
                              status === "running" ? "text-white/70" : "text-muted-foreground"
                            }`}>
                              {shortType}
                            </p>
                            {executionTime && status === "completed" && (
                              <span className="text-[9px] bg-primary/20 text-primary px-1 rounded flex items-center gap-0.5">
                                <Clock className="w-2 h-2" />
                                {executionTime}ms
                              </span>
                            )}
                          </div>
                        </div>
                        {status === "running" && (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        )}
                        {status === "completed" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  );

                  // Wrap completed nodes with tooltip
                  if (hasOutput && !isSelected) {
                    return (
                      <TooltipProvider key={node.idx} delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {nodeContent}
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-popover text-popover-foreground">
                            <div className="flex flex-col gap-1">
                              <p className="flex items-center gap-1.5">
                                <Zap className="w-3 h-3" />
                                Click to view output
                              </p>
                              {executionTime && (
                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  Execution time: {executionTime}ms
                                </p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return nodeContent;
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Execution Logs & Output with Tabs */}
          <div className="border border-border rounded-lg bg-card overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "output" | "workflow" | "guide")} className="flex flex-col h-full">
              <div className="p-2 border-b border-border flex items-center justify-between">
                <TabsList className="h-8">
                  <TabsTrigger value="output" className="text-xs h-7 px-3 gap-1.5">
                    <Zap className="w-3 h-3" />
                    Output
                  </TabsTrigger>
                  <TabsTrigger value="workflow" className="text-xs h-7 px-3 gap-1.5">
                    <FileJson className="w-3 h-3" />
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="guide" className="text-xs h-7 px-3 gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    Import Guide
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  {activeTab === "output" && selectedNodeFromPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setSelectedNodeFromPreview(null)}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                  {activeTab === "workflow" && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${workflowTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
                          setCopiedJson(true);
                          setTimeout(() => setCopiedJson(false), 2000);
                        }}
                      >
                        {copiedJson ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copiedJson ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  )}
                  {executionStatus === "completed" && activeTab === "output" && !selectedNodeFromPreview && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Success
                    </span>
                  )}
                </div>
              </div>

              <TabsContent value="output" className="flex-1 m-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1 h-[270px]">
                  <div className="p-3 font-mono text-xs space-y-2">
                    {/* Show selected node output from preview click */}
                    {selectedNodeFromPreview && nodeOutputs[selectedNodeFromPreview] ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-lg">{getNodeStyle(nodes.find(n => n.name === selectedNodeFromPreview)?.type || '').icon}</span>
                            <div>
                              <p className="font-medium text-foreground">{selectedNodeFromPreview}</p>
                              <p className="text-[10px]">{nodeOutputs[selectedNodeFromPreview].items} item{nodeOutputs[selectedNodeFromPreview].items !== 1 ? 's' : ''} returned</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => copyNodeOutput(selectedNodeFromPreview, nodeOutputs[selectedNodeFromPreview].data)}
                          >
                            {copiedNodeOutput === selectedNodeFromPreview ? (
                              <><Check className="w-3 h-3 mr-1 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3 mr-1" /> Copy</>
                            )}
                          </Button>
                        </div>
                        <pre className="text-green-400 bg-muted/50 rounded p-3 overflow-auto max-h-60">
                          {JSON.stringify(nodeOutputs[selectedNodeFromPreview].data, null, 2)}
                        </pre>
                        <p className="text-[10px] text-muted-foreground">
                          💡 Click on other completed nodes in the preview to see their output
                        </p>
                      </div>
                    ) : executionLogs.length === 0 ? (
                      <p className="text-muted-foreground">Click "Run Workflow" to start execution...</p>
                    ) : (
                      executionLogs.map((log, idx) => (
                        <div key={idx}>
                          {log.type === 'log' ? (
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {log.content}
                            </p>
                          ) : (
                            <div className="ml-4 mt-1 mb-2">
                              <div 
                                className="bg-muted/50 border border-border rounded p-2 hover:bg-muted transition-colors"
                              >
                                <div className="flex items-center justify-between text-muted-foreground mb-1">
                                  <span 
                                    className="text-[10px] uppercase tracking-wider cursor-pointer flex-1"
                                    onClick={() => setSelectedNodeOutput(selectedNodeOutput === log.nodeName ? null : log.nodeName || null)}
                                  >
                                    📤 Output: {log.nodeName}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 px-1.5 text-[10px]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (log.nodeName) {
                                          navigator.clipboard.writeText(log.content);
                                          setCopiedNodeOutput(log.nodeName);
                                          setTimeout(() => setCopiedNodeOutput(null), 2000);
                                        }
                                      }}
                                    >
                                      {copiedNodeOutput === log.nodeName ? (
                                        <Check className="w-2.5 h-2.5 text-green-500" />
                                      ) : (
                                        <Copy className="w-2.5 h-2.5" />
                                      )}
                                    </Button>
                                    <span 
                                      className="text-[10px] cursor-pointer"
                                      onClick={() => setSelectedNodeOutput(selectedNodeOutput === log.nodeName ? null : log.nodeName || null)}
                                    >
                                      {selectedNodeOutput === log.nodeName ? '▼' : '▶'}
                                    </span>
                                  </div>
                                </div>
                                {selectedNodeOutput === log.nodeName && (
                                  <pre className="text-[10px] text-green-400 overflow-x-auto max-h-32 overflow-y-auto">
                                    {log.content}
                                  </pre>
                                )}
                                {selectedNodeOutput !== log.nodeName && (
                                  <pre 
                                    className="text-[10px] text-green-400 truncate cursor-pointer"
                                    onClick={() => setSelectedNodeOutput(selectedNodeOutput === log.nodeName ? null : log.nodeName || null)}
                                  >
                                    {log.content.split('\n')[0]}...
                                  </pre>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="workflow" className="flex-1 m-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1 h-[270px]">
                  <div className="p-3 font-mono text-xs">
                    <div className="mb-3 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-primary text-[11px] flex items-center gap-1.5">
                        <Code className="w-3 h-3" />
                        n8n Workflow JSON - Import this file in n8n to recreate the workflow
                      </p>
                    </div>
                    
                    {/* Show nodes with expected output preview */}
                    <div className="mb-4 space-y-2">
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">Expected Node Outputs:</p>
                      {nodes.map((node, idx) => {
                        const status = nodeStatuses[node.name];
                        const style = getNodeStyle(node.type);
                        const expectedOutput = generateNodeOutput(node.type, node.name);
                        const hasActualOutput = nodeOutputs[node.name];
                        const executionTime = nodeExecutionTimes[node.name];
                        return (
                          <div 
                            key={idx}
                            className={`rounded text-[11px] transition-all overflow-hidden border ${
                              status === "running" 
                                ? "border-primary animate-pulse" 
                                : status === "completed"
                                ? "border-green-500/30"
                                : "border-border"
                            }`}
                          >
                            <div className={`flex items-center gap-2 p-2 ${
                              status === "completed" ? "bg-green-500/10" : "bg-muted/30"
                            }`}>
                              <span>{style.icon}</span>
                              <span className="flex-1 font-medium">{node.name}</span>
                              <span className="text-muted-foreground text-[10px]">{getShortType(node.type)}</span>
                              {executionTime && status === "completed" && (
                                <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Clock className="w-2 h-2" />
                                  {executionTime}ms
                                </span>
                              )}
                              {status === "running" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                              {status === "completed" && <CheckCircle className="w-3 h-3 text-green-500" />}
                              {!status && <span className="w-3 h-3 rounded-full bg-muted-foreground/30" />}
                            </div>
                            <div className="p-2 bg-background/50 border-t border-border">
                              <p className="text-[9px] text-muted-foreground mb-1 flex items-center gap-1">
                                {hasActualOutput ? (
                                  <>✅ Actual Output ({hasActualOutput.items} items):</>
                                ) : (
                                  <>📋 Expected Output ({expectedOutput.items} items):</>
                                )}
                              </p>
                              <pre className="text-[9px] text-green-400/80 overflow-x-auto max-h-16 overflow-y-auto bg-muted/30 rounded p-1.5">
                                {JSON.stringify(hasActualOutput?.data || expectedOutput.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-border pt-3">
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-2">Full Workflow JSON:</p>
                      <pre className="text-[10px] bg-muted/50 rounded p-3 overflow-auto text-foreground/80 max-h-[100px]">
                        {JSON.stringify(workflow, null, 2)}
                      </pre>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Import Guide Tab */}
              <TabsContent value="guide" className="flex-1 m-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1 h-[270px]">
                  <div className="p-3 space-y-3">
                    {/* n8n Guide */}
                    <div className={`rounded-lg border overflow-hidden transition-all ${
                      expandedGuide === "n8n" ? "border-orange-500/50" : "border-border"
                    }`}>
                      <button
                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                          expandedGuide === "n8n" ? "bg-orange-500/10" : "bg-muted/30 hover:bg-muted/50"
                        }`}
                        onClick={() => setExpandedGuide(expandedGuide === "n8n" ? null : "n8n")}
                      >
                        <span className="text-xl">🟠</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">n8n</p>
                          <p className="text-[10px] text-muted-foreground">Direct JSON import - Recommended</p>
                        </div>
                        <span className="text-muted-foreground text-xs">{expandedGuide === "n8n" ? "▼" : "▶"}</span>
                      </button>
                      {expandedGuide === "n8n" && (
                        <div className="p-3 border-t border-border bg-background/50 space-y-3">
                          <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-[11px] text-green-600 flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>This JSON file works directly with n8n - just import and run!</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Download the JSON file</p>
                                <p className="text-muted-foreground">Click the "Download" button above</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Open n8n workflow editor</p>
                                <p className="text-muted-foreground">Go to n8n.io or your self-hosted instance</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Import the workflow</p>
                                <p className="text-muted-foreground">Click ⋮ menu → "Import from File" → Select the JSON</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Configure credentials</p>
                                <p className="text-muted-foreground">Add your API keys for connected services (Gmail, Slack, etc.)</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
                              <div className="text-[11px]">
                                <p className="font-medium text-green-600">Execute the workflow!</p>
                                <p className="text-muted-foreground">Click "Execute Workflow" to run</p>
                              </div>
                            </div>
                          </div>

                          <a 
                            href="https://n8n.io" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open n8n.io
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Make Guide */}
                    <div className={`rounded-lg border overflow-hidden transition-all ${
                      expandedGuide === "make" ? "border-purple-500/50" : "border-border"
                    }`}>
                      <button
                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                          expandedGuide === "make" ? "bg-purple-500/10" : "bg-muted/30 hover:bg-muted/50"
                        }`}
                        onClick={() => setExpandedGuide(expandedGuide === "make" ? null : "make")}
                      >
                        <span className="text-xl">🟣</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Make (Integromat)</p>
                          <p className="text-[10px] text-muted-foreground">Manual recreation required</p>
                        </div>
                        <span className="text-muted-foreground text-xs">{expandedGuide === "make" ? "▼" : "▶"}</span>
                      </button>
                      {expandedGuide === "make" && (
                        <div className="p-3 border-t border-border bg-background/50 space-y-3">
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 text-[11px] text-amber-600 flex items-start gap-2">
                            <Info className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>Make uses a different format. Use this JSON as a reference to recreate the workflow.</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Create a new scenario in Make</p>
                                <p className="text-muted-foreground">Go to make.com → Create new scenario</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Add these modules:</p>
                                <div className="mt-1 space-y-1">
                                  {nodes.map((node, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-muted-foreground">
                                      <ArrowRight className="w-2.5 h-2.5" />
                                      <span>{getNodeStyle(node.type).icon} {node.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Connect modules in order</p>
                                <p className="text-muted-foreground">Link modules as shown in the workflow preview</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                              <div className="text-[11px]">
                                <p className="font-medium text-green-600">Configure and run!</p>
                              </div>
                            </div>
                          </div>

                          <a 
                            href="https://make.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-purple-500 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Make.com
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Zapier Guide */}
                    <div className={`rounded-lg border overflow-hidden transition-all ${
                      expandedGuide === "zapier" ? "border-orange-600/50" : "border-border"
                    }`}>
                      <button
                        className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                          expandedGuide === "zapier" ? "bg-orange-600/10" : "bg-muted/30 hover:bg-muted/50"
                        }`}
                        onClick={() => setExpandedGuide(expandedGuide === "zapier" ? null : "zapier")}
                      >
                        <span className="text-xl">⚡</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Zapier</p>
                          <p className="text-[10px] text-muted-foreground">Manual recreation required</p>
                        </div>
                        <span className="text-muted-foreground text-xs">{expandedGuide === "zapier" ? "▼" : "▶"}</span>
                      </button>
                      {expandedGuide === "zapier" && (
                        <div className="p-3 border-t border-border bg-background/50 space-y-3">
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 text-[11px] text-amber-600 flex items-start gap-2">
                            <Info className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>Zapier uses a different format. Use this as a reference to create your Zap.</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Create a new Zap</p>
                                <p className="text-muted-foreground">Go to zapier.com → Create Zap</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Set up trigger:</p>
                                <div className="mt-1 text-muted-foreground">
                                  {nodes[0] && (
                                    <span className="flex items-center gap-1.5">
                                      {getNodeStyle(nodes[0].type).icon} {nodes[0].name} ({getShortType(nodes[0].type)})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                              <div className="text-[11px]">
                                <p className="font-medium">Add actions:</p>
                                <div className="mt-1 space-y-1">
                                  {nodes.slice(1).map((node, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 text-muted-foreground">
                                      <ArrowRight className="w-2.5 h-2.5" />
                                      <span>{getNodeStyle(node.type).icon} {node.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                              <div className="text-[11px]">
                                <p className="font-medium text-green-600">Test and publish your Zap!</p>
                              </div>
                            </div>
                          </div>

                          <a 
                            href="https://zapier.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-orange-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open Zapier.com
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {nodes.length} nodes • {connectionLines.length} connections
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <Button 
              onClick={startExecution} 
              disabled={executionStatus === "running"}
              variant={executionStatus === "completed" ? "outline" : "default"}
            >
              {executionStatus === "running" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : executionStatus === "completed" ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Again
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Workflow
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowExecutionModal;
