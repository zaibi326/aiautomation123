import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  ArrowRight,
  Database,
  Code,
  Settings,
  Zap,
  FileJson,
  List
} from "lucide-react";

interface NodeData {
  items: number;
  data: any;
}

interface NodeExecutionPanelProps {
  nodeName: string;
  nodeType: string;
  nodeParams?: Record<string, any>;
  inputData?: NodeData;
  outputData?: NodeData;
  executionTime?: number;
  status: "pending" | "running" | "completed" | "error";
}

// Render value in table cell
const renderCellValue = (value: any): React.ReactNode => {
  if (value === null) return <span className="text-slate-500 italic">null</span>;
  if (value === undefined) return <span className="text-slate-500 italic">undefined</span>;
  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"} className="text-[10px]">
        {value ? "true" : "false"}
      </Badge>
    );
  }
  if (typeof value === "object") {
    return (
      <span className="text-cyan-400 font-mono text-[10px]">
        {Array.isArray(value) ? `[${value.length} items]` : "{...}"}
      </span>
    );
  }
  if (typeof value === "number") {
    return <span className="text-orange-400 font-mono">{value}</span>;
  }
  const strValue = String(value);
  if (strValue.length > 50) {
    return <span title={strValue}>{strValue.substring(0, 50)}...</span>;
  }
  return <span className="text-green-400">{strValue}</span>;
};

// Data Table View
const DataTableView = ({ data, title }: { data: any; title: string }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  // Normalize data to array
  const items = Array.isArray(data) ? data : data ? [data] : [];
  
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        No data
      </div>
    );
  }

  // Get all unique keys from all items
  const allKeys = new Set<string>();
  items.forEach(item => {
    if (item && typeof item === "object") {
      Object.keys(item).forEach(key => allKeys.add(key));
    }
  });
  const columns = Array.from(allKeys).filter(k => !k.startsWith("_"));

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRow = (idx: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white">{title}</span>
          <Badge variant="outline" className="text-[10px]">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          Copy
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50">
        <ScrollArea className="max-h-[250px]">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="w-8 text-slate-400 text-[10px]">#</TableHead>
                {columns.slice(0, 6).map((col) => (
                  <TableHead key={col} className="text-slate-400 text-[10px] font-medium">
                    {col}
                  </TableHead>
                ))}
                {columns.length > 6 && (
                  <TableHead className="text-slate-500 text-[10px]">
                    +{columns.length - 6} more
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <React.Fragment key={idx}>
                  <TableRow 
                    className="border-slate-700/50 hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => toggleRow(idx)}
                  >
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        {expandedRows.has(idx) ? (
                          <ChevronDown className="w-3 h-3 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                        )}
                        <span className="text-slate-500 text-[10px]">{idx + 1}</span>
                      </div>
                    </TableCell>
                    {columns.slice(0, 6).map((col) => (
                      <TableCell key={col} className="py-2 text-xs">
                        {renderCellValue(item?.[col])}
                      </TableCell>
                    ))}
                    {columns.length > 6 && (
                      <TableCell className="py-2 text-xs text-slate-500">...</TableCell>
                    )}
                  </TableRow>
                  {expandedRows.has(idx) && (
                    <TableRow className="bg-slate-800/30 border-slate-700/50">
                      <TableCell colSpan={columns.length + 2} className="py-2">
                        <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto p-2 bg-slate-900 rounded">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

// JSON View
const JsonView = ({ data }: { data: any }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-white">JSON</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          Copy
        </Button>
      </div>
      <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50">
        <ScrollArea className="max-h-[250px]">
          <pre className="text-[11px] text-green-400 font-mono p-3">
            {JSON.stringify(data, null, 2)}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
};

// Parameters/Settings View
const SettingsView = ({ params }: { params: Record<string, any> }) => {
  if (!params || Object.keys(params).length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        No parameters configured
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-2">
        <Settings className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-white">Node Parameters</span>
      </div>
      <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50">
        <ScrollArea className="max-h-[250px]">
          <div className="p-3 space-y-2">
            {Object.entries(params).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 py-1 border-b border-slate-800 last:border-0">
                <span className="text-slate-400 text-xs font-medium min-w-[120px]">{key}:</span>
                <span className="text-green-400 text-xs font-mono flex-1 break-all">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export const NodeExecutionPanel = ({
  nodeName,
  nodeType,
  nodeParams,
  inputData,
  outputData,
  executionTime,
  status,
}: NodeExecutionPanelProps) => {
  const [activeView, setActiveView] = useState<"table" | "json">("table");

  return (
    <div className="bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">
      {/* Node Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{nodeName}</h3>
              <p className="text-xs text-slate-400">{nodeType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {executionTime && (
              <Badge variant="outline" className="text-[10px] text-green-400 border-green-500/30">
                {executionTime}ms
              </Badge>
            )}
            <Badge 
              variant={status === "completed" ? "default" : status === "running" ? "secondary" : "outline"}
              className={`text-[10px] ${
                status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                status === "running" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                "text-slate-400"
              }`}
            >
              {status}
            </Badge>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="px-4 py-2 border-b border-slate-700 bg-slate-900/50 flex items-center gap-2">
        <Button
          variant={activeView === "table" ? "default" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setActiveView("table")}
        >
          <List className="w-3 h-3" />
          Table
        </Button>
        <Button
          variant={activeView === "json" ? "default" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setActiveView("json")}
        >
          <Code className="w-3 h-3" />
          JSON
        </Button>
      </div>

      {/* Content */}
      <Tabs defaultValue="output" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-slate-700 bg-slate-900/30 h-10 px-2">
          <TabsTrigger value="input" className="text-xs data-[state=active]:bg-slate-700">
            📥 Input
            {inputData && (
              <Badge variant="outline" className="ml-1 text-[9px] h-4">
                {inputData.items}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="output" className="text-xs data-[state=active]:bg-slate-700">
            📤 Output
            {outputData && (
              <Badge variant="outline" className="ml-1 text-[9px] h-4">
                {outputData.items}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs data-[state=active]:bg-slate-700">
            ⚙️ Settings
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="input" className="m-0">
            {activeView === "table" ? (
              <DataTableView data={inputData?.data} title="Input Data" />
            ) : (
              <JsonView data={inputData?.data} />
            )}
          </TabsContent>

          <TabsContent value="output" className="m-0">
            {activeView === "table" ? (
              <DataTableView data={outputData?.data} title="Output Data" />
            ) : (
              <JsonView data={outputData?.data} />
            )}
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <SettingsView params={nodeParams || {}} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Execution Flow Panel - Shows data flowing between nodes
export const ExecutionFlowPanel = ({
  nodes,
  nodeOutputs,
  nodeStatuses,
  executionOrder,
}: {
  nodes: { name: string; type: string; parameters?: Record<string, any> }[];
  nodeOutputs: Record<string, { items: number; data: any }>;
  nodeStatuses: Record<string, string>;
  executionOrder: string[];
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Get previous node's output as current node's input
  const getInputForNode = (nodeName: string) => {
    const nodeIndex = executionOrder.indexOf(nodeName);
    if (nodeIndex <= 0) return undefined;
    const prevNodeName = executionOrder[nodeIndex - 1];
    return nodeOutputs[prevNodeName];
  };

  const selectedNodeData = nodes.find(n => n.name === selectedNode);

  return (
    <div className="space-y-4">
      {/* Execution Flow */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1">
        {executionOrder.map((nodeName, idx) => {
          const node = nodes.find(n => n.name === nodeName);
          const status = nodeStatuses[nodeName];
          const output = nodeOutputs[nodeName];
          const isSelected = selectedNode === nodeName;

          return (
            <div key={nodeName} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedNode(isSelected ? null : nodeName)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-primary/20 border-primary"
                    : status === "completed"
                    ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                    : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  status === "completed" ? "bg-green-500" :
                  status === "running" ? "bg-yellow-500 animate-pulse" :
                  "bg-slate-500"
                }`} />
                <span className="text-xs font-medium text-white">{nodeName}</span>
                {output && (
                  <Badge variant="outline" className="text-[9px] text-green-400 border-green-500/30">
                    {output.items}
                  </Badge>
                )}
              </button>
              {idx < executionOrder.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Details */}
      {selectedNode && selectedNodeData && (
        <NodeExecutionPanel
          nodeName={selectedNode}
          nodeType={selectedNodeData.type}
          nodeParams={selectedNodeData.parameters}
          inputData={getInputForNode(selectedNode)}
          outputData={nodeOutputs[selectedNode]}
          status={nodeStatuses[selectedNode] as any || "pending"}
        />
      )}
    </div>
  );
};
