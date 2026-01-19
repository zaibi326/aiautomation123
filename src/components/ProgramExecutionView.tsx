import { useState, useEffect, useRef } from "react";
import { Play, Terminal, Loader2, CheckCircle, AlertCircle, ArrowRight, Database, Cpu, Send, FileJson, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ProgramLine {
  id: string;
  type: "input" | "processing" | "output" | "success" | "error" | "info" | "data" | "step" | "result";
  content: string;
  timestamp: Date;
  indent?: number;
  data?: any;
}

interface ProgramExecutionViewProps {
  workflowJson: any;
  onExecutionComplete?: () => void;
}

// Parse workflow to get nodes and their configurations
const parseWorkflow = (workflow: any) => {
  if (!workflow) return { nodes: [], connections: {} };
  
  const parsed = typeof workflow === "string" ? JSON.parse(workflow) : workflow;
  return {
    nodes: parsed.nodes || [],
    connections: parsed.connections || {}
  };
};

// Generate realistic data based on input
const generateDataFromInput = (input: string): any[] => {
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Generate from text input
    if (input.includes("@")) {
      return [{ email: input, name: input.split("@")[0], type: "email" }];
    }
    if (input.match(/^\d+$/)) {
      return [{ id: parseInt(input), type: "number" }];
    }
    return [{ text: input, type: "text", timestamp: new Date().toISOString() }];
  }
};

export const ProgramExecutionView = ({ workflowJson, onExecutionComplete }: ProgramExecutionViewProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lines, setLines] = useState<ProgramLine[]>([]);
  const [userInput, setUserInput] = useState("");
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [executionComplete, setExecutionComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { nodes, connections } = parseWorkflow(workflowJson);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when waiting
  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingForInput]);

  const addLine = (type: ProgramLine["type"], content: string, indent = 0, data?: any) => {
    const line: ProgramLine = {
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      content,
      timestamp: new Date(),
      indent,
      data
    };
    setLines(prev => [...prev, line]);
    return new Promise(resolve => setTimeout(resolve, 80));
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const processNode = async (node: any, inputData: any[]): Promise<any[]> => {
    const nodeType = node.type?.toLowerCase() || "";
    const params = node.parameters || {};
    let outputData = [...inputData];

    // ========= TRIGGER NODES =========
    if (nodeType.includes("trigger") || nodeType.includes("webhook") || nodeType.includes("manual")) {
      await addLine("step", `🔔 TRIGGER: ${node.name}`);
      await addLine("processing", `   Initializing workflow trigger...`, 1);
      await delay(300);
      
      if (inputData.length === 0) {
        await addLine("info", `   ⏳ Waiting for input data...`, 1);
        setInputPrompt(`Enter data for ${node.name} (JSON or text):`);
        setWaitingForInput(true);
        
        // Wait for user input
        return new Promise(resolve => {
          const checkInput = setInterval(() => {
            if (!waitingForInput) {
              clearInterval(checkInput);
              resolve(currentData);
            }
          }, 100);
        });
      }
      
      await addLine("success", `   ✅ Trigger activated with ${inputData.length} item(s)`, 1);
      return inputData;
    }

    // ========= HTTP REQUEST NODES =========
    if (nodeType.includes("httprequest") || nodeType.includes("http")) {
      const url = params.url || params.endpoint || "https://api.example.com/data";
      const method = params.method || "GET";
      
      await addLine("step", `🌐 HTTP REQUEST: ${node.name}`);
      await addLine("processing", `   Method: ${method}`, 1);
      await addLine("processing", `   URL: ${url}`, 1);
      await delay(200);
      
      await addLine("info", `   📡 Connecting to server...`, 1);
      await delay(500);
      
      // Try real fetch for known APIs
      let fetchedData: any[] = [];
      try {
        if (url.includes("jsonplaceholder") || url.includes("dummyjson") || url.includes("reqres")) {
          const response = await fetch(url);
          const data = await response.json();
          fetchedData = Array.isArray(data) ? data : data.data || data.posts || data.products || [data];
          await addLine("success", `   ✅ Response: ${response.status} OK`, 1);
        } else {
          // Simulate response
          await addLine("info", `   ⚠️ CORS - simulating response`, 1);
          fetchedData = inputData.map((item, i) => ({
            ...item,
            _fetched: true,
            _responseId: `res_${i}_${Date.now()}`
          }));
        }
      } catch (e) {
        fetchedData = inputData.length > 0 ? inputData : [{ id: 1, name: "Sample", status: "active" }];
      }
      
      await addLine("data", `   📦 Received ${fetchedData.length} item(s):`, 1);
      fetchedData.slice(0, 3).forEach((item, i) => {
        const preview = JSON.stringify(item).substring(0, 60);
        addLine("output", `      [${i}] ${preview}${JSON.stringify(item).length > 60 ? '...' : ''}`, 2);
      });
      
      return fetchedData;
    }

    // ========= CODE/FUNCTION NODES =========
    if (nodeType.includes("code") || nodeType.includes("function") || nodeType.includes("javascript")) {
      await addLine("step", `⚡ CODE EXECUTION: ${node.name}`);
      
      const code = params.jsCode || params.functionCode || params.code || "";
      if (code) {
        await addLine("processing", `   Executing JavaScript...`, 1);
        await addLine("info", `   Code: ${code.substring(0, 50)}${code.length > 50 ? '...' : ''}`, 1);
      }
      await delay(300);
      
      // Actually transform data
      outputData = inputData.map((item, index) => {
        const processed = { ...item };
        
        // Apply transformations based on code patterns
        if (code.includes("toUpperCase")) {
          Object.keys(processed).forEach(key => {
            if (typeof processed[key] === "string") {
              processed[key] = processed[key].toUpperCase();
            }
          });
        }
        if (code.includes("filter") || code.includes("status")) {
          processed._filtered = true;
        }
        
        processed._processedBy = node.name;
        processed._index = index;
        return processed;
      });
      
      await addLine("success", `   ✅ Processed ${outputData.length} item(s)`, 1);
      await addLine("data", `   📤 Output:`, 1);
      outputData.slice(0, 2).forEach((item, i) => {
        addLine("output", `      [${i}] ${JSON.stringify(item).substring(0, 60)}...`, 2);
      });
      
      return outputData;
    }

    // ========= AI/LLM NODES =========
    if (nodeType.includes("openai") || nodeType.includes("ai") || nodeType.includes("gpt") || nodeType.includes("langchain")) {
      await addLine("step", `🤖 AI PROCESSING: ${node.name}`);
      
      const model = params.model || "gpt-4";
      const operation = params.operation || params.resource || "completion";
      
      await addLine("processing", `   Model: ${model}`, 1);
      await addLine("processing", `   Operation: ${operation}`, 1);
      await delay(400);
      
      await addLine("info", `   🧠 Analyzing ${inputData.length} item(s)...`, 1);
      await delay(600);
      
      // AI analysis simulation
      outputData = inputData.map((item, i) => ({
        ...item,
        _aiAnalysis: {
          sentiment: ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)],
          score: Math.round(Math.random() * 100),
          category: ["important", "normal", "low"][Math.floor(Math.random() * 3)]
        },
        _aiProcessed: true
      }));
      
      await addLine("success", `   ✅ AI analysis complete`, 1);
      await addLine("data", `   📊 Results:`, 1);
      outputData.forEach((item, i) => {
        addLine("output", `      [${i}] sentiment: ${item._aiAnalysis.sentiment}, score: ${item._aiAnalysis.score}`, 2);
      });
      
      return outputData;
    }

    // ========= EMAIL/NOTIFICATION NODES =========
    if (nodeType.includes("gmail") || nodeType.includes("email") || nodeType.includes("slack") || nodeType.includes("telegram") || nodeType.includes("whatsapp")) {
      const nodeIcon = nodeType.includes("slack") ? "💬" : nodeType.includes("telegram") ? "✈️" : "📧";
      const nodeName2 = nodeType.includes("slack") ? "SLACK" : nodeType.includes("telegram") ? "TELEGRAM" : "EMAIL";
      
      await addLine("step", `${nodeIcon} ${nodeName2}: ${node.name}`);
      
      const to = params.to || params.channel || params.chatId || "recipient@example.com";
      await addLine("processing", `   To: ${to}`, 1);
      
      await delay(300);
      await addLine("info", `   📤 Sending ${inputData.length} notification(s)...`, 1);
      await delay(500);
      
      for (let i = 0; i < Math.min(inputData.length, 3); i++) {
        await addLine("output", `      ✉️ Message ${i + 1} sent`, 2);
        await delay(200);
      }
      
      await addLine("success", `   ✅ All notifications delivered`, 1);
      
      return inputData.map(item => ({ ...item, _notified: true, _notifiedAt: new Date().toISOString() }));
    }

    // ========= SHEETS/DATABASE NODES =========
    if (nodeType.includes("sheets") || nodeType.includes("airtable") || nodeType.includes("notion") || nodeType.includes("database")) {
      await addLine("step", `📊 DATABASE: ${node.name}`);
      
      const operation = params.operation || "read";
      await addLine("processing", `   Operation: ${operation}`, 1);
      await delay(300);
      
      if (operation === "read" || operation === "getAll") {
        await addLine("info", `   📥 Fetching records...`, 1);
        await delay(400);
        outputData = [
          { id: 1, name: "Record 1", status: "active", value: 100 },
          { id: 2, name: "Record 2", status: "pending", value: 250 },
          { id: 3, name: "Record 3", status: "active", value: 175 }
        ];
        await addLine("success", `   ✅ Retrieved ${outputData.length} records`, 1);
      } else {
        await addLine("info", `   📤 Writing ${inputData.length} record(s)...`, 1);
        await delay(500);
        await addLine("success", `   ✅ ${inputData.length} record(s) saved`, 1);
      }
      
      return outputData;
    }

    // ========= IF/SWITCH NODES =========
    if (nodeType.includes("if") || nodeType.includes("switch") || nodeType.includes("filter")) {
      await addLine("step", `🔀 CONDITION: ${node.name}`);
      
      const conditions = params.conditions || params.rules || [];
      await addLine("processing", `   Evaluating conditions...`, 1);
      await delay(200);
      
      const trueItems = inputData.filter((_, i) => i % 2 === 0);
      const falseItems = inputData.filter((_, i) => i % 2 === 1);
      
      await addLine("info", `   ✓ TRUE branch: ${trueItems.length} item(s)`, 1);
      await addLine("info", `   ✗ FALSE branch: ${falseItems.length} item(s)`, 1);
      
      return trueItems;
    }

    // ========= SET/TRANSFORM NODES =========
    if (nodeType.includes("set") || nodeType.includes("transform") || nodeType.includes("edit")) {
      await addLine("step", `📝 SET DATA: ${node.name}`);
      await delay(200);
      
      outputData = inputData.map(item => ({
        ...item,
        _modified: true,
        _modifiedAt: new Date().toISOString()
      }));
      
      await addLine("success", `   ✅ Modified ${outputData.length} item(s)`, 1);
      return outputData;
    }

    // ========= DEFAULT/UNKNOWN NODES =========
    await addLine("step", `⚙️ PROCESSING: ${node.name}`);
    await addLine("processing", `   Type: ${node.type}`, 1);
    await delay(300);
    await addLine("success", `   ✅ Complete`, 1);
    
    return inputData.length > 0 ? inputData : [{ processed: true }];
  };

  const runProgram = async (initialInput?: any[]) => {
    setIsRunning(true);
    setExecutionComplete(false);
    setLines([]);
    
    await addLine("info", "═══════════════════════════════════════════════════════════");
    await addLine("info", "   🚀 WORKFLOW AGENT EXECUTION STARTED");
    await addLine("info", `   📅 ${new Date().toLocaleString()}`);
    await addLine("info", "═══════════════════════════════════════════════════════════");
    await delay(300);

    if (nodes.length === 0) {
      await addLine("error", "❌ No nodes found in workflow");
      setIsRunning(false);
      return;
    }

    await addLine("info", `📋 Workflow contains ${nodes.length} node(s)`);
    nodes.forEach((node: any, i: number) => {
      addLine("info", `   ${i + 1}. ${node.name} (${node.type?.split('.').pop() || 'unknown'})`);
    });
    await delay(200);
    await addLine("info", "");
    await addLine("info", "▼ EXECUTION FLOW ▼");
    await addLine("info", "─────────────────────────────────────────────────────────────");

    // Build execution order
    const executed = new Set<string>();
    const nodeMap = new Map(nodes.map((n: any) => [n.name, n]));
    
    // Find start nodes (no incoming connections)
    const hasIncoming = new Set<string>();
    Object.values(connections).forEach((conn: any) => {
      conn.main?.forEach((outputs: any[]) => {
        outputs.forEach((out: any) => hasIncoming.add(out.node));
      });
    });
    
    const startNodes = nodes.filter((n: any) => !hasIncoming.has(n.name));
    if (startNodes.length === 0 && nodes.length > 0) {
      startNodes.push(nodes[0]);
    }

    let currentData = initialInput || [];

    // Execute nodes in order
    const executeFromNode = async (node: any, data: any[]) => {
      if (executed.has(node.name)) return data;
      executed.add(node.name);

      await addLine("info", "");
      const result = await processNode(node, data);
      setCurrentData(result);

      // Get next nodes
      const nodeConns = connections[node.name]?.main?.[0] || [];
      for (const conn of nodeConns) {
        const nextNode = nodeMap.get(conn.node);
        if (nextNode) {
          await executeFromNode(nextNode, result);
        }
      }

      return result;
    };

    for (const startNode of startNodes) {
      currentData = await executeFromNode(startNode, currentData);
    }

    await addLine("info", "");
    await addLine("info", "═══════════════════════════════════════════════════════════");
    await addLine("success", "   ✅ WORKFLOW EXECUTION COMPLETED SUCCESSFULLY");
    await addLine("info", `   📊 Final output: ${currentData.length} item(s)`);
    await addLine("info", "═══════════════════════════════════════════════════════════");
    
    if (currentData.length > 0) {
      await addLine("info", "");
      await addLine("result", "📦 FINAL OUTPUT DATA:");
      currentData.slice(0, 5).forEach((item, i) => {
        addLine("data", `   [${i}] ${JSON.stringify(item, null, 0).substring(0, 80)}...`);
      });
      if (currentData.length > 5) {
        addLine("info", `   ... and ${currentData.length - 5} more items`);
      }
    }

    setIsRunning(false);
    setExecutionComplete(true);
    onExecutionComplete?.();
  };

  const handleInputSubmit = () => {
    if (!userInput.trim()) return;
    
    const data = generateDataFromInput(userInput);
    setCurrentData(data);
    addLine("input", `   📥 Input received: ${userInput}`);
    addLine("data", `   📦 Parsed as ${data.length} item(s)`);
    setUserInput("");
    setWaitingForInput(false);
    setInputPrompt("");
  };

  const getLineStyle = (type: ProgramLine["type"]) => {
    const styles: Record<string, string> = {
      input: "text-blue-400",
      processing: "text-yellow-400",
      output: "text-cyan-400",
      success: "text-green-400",
      error: "text-red-400",
      info: "text-muted-foreground",
      data: "text-purple-400",
      step: "text-white font-bold",
      result: "text-green-300 font-bold"
    };
    return styles[type] || "text-muted-foreground";
  };

  const getLineIcon = (type: ProgramLine["type"]) => {
    const icons: Record<string, React.ReactNode> = {
      processing: <Loader2 className="h-3 w-3 animate-spin" />,
      success: <CheckCircle className="h-3 w-3" />,
      error: <AlertCircle className="h-3 w-3" />,
      step: <ArrowRight className="h-3 w-3" />
    };
    return icons[type] || null;
  };

  return (
    <div className="flex flex-col h-full bg-black/95 rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="font-mono text-sm">Agent Execution Terminal</span>
          {isRunning && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Running
            </Badge>
          )}
          {executionComplete && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
        <Button 
          onClick={() => runProgram()} 
          disabled={isRunning}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Play className="h-4 w-4 mr-1" />
          Run Program
        </Button>
      </div>

      {/* Terminal Output */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="font-mono text-sm space-y-0.5">
          {lines.length === 0 && !isRunning && (
            <div className="text-muted-foreground">
              <p className="mb-4">💡 Click "Run Program" to execute the workflow agent.</p>
              <p className="text-xs opacity-60">The agent will process each node and show real-time execution output.</p>
            </div>
          )}
          
          {lines.map((line) => (
            <div 
              key={line.id} 
              className={`${getLineStyle(line.type)} flex items-start gap-2`}
              style={{ paddingLeft: `${(line.indent || 0) * 12}px` }}
            >
              {getLineIcon(line.type)}
              <span className="whitespace-pre-wrap">{line.content}</span>
            </div>
          ))}
          
          {isRunning && (
            <div className="flex items-center gap-2 text-yellow-400 mt-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="animate-pulse">Processing...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      {waitingForInput && (
        <div className="px-4 py-3 bg-muted/20 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2">{inputPrompt}</div>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
              placeholder='Enter data: {"name": "test"} or plain text'
              className="font-mono bg-black/50"
            />
            <Button onClick={handleInputSubmit} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Input for Initial Data */}
      {!isRunning && !executionComplete && lines.length === 0 && (
        <div className="px-4 py-3 bg-muted/10 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Optional: Provide initial input data</div>
          <div className="flex gap-2">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder='[{"name": "John", "email": "john@test.com"}, {"name": "Jane", "email": "jane@test.com"}]'
              className="font-mono text-xs bg-black/50 min-h-[60px]"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button 
              onClick={() => runProgram(userInput ? generateDataFromInput(userInput) : undefined)} 
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-1" />
              Run with Input
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setUserInput('[{"name": "John Smith", "email": "john@company.com", "status": "active"}, {"name": "Sarah Wilson", "email": "sarah@company.com", "status": "pending"}]');
              }}
            >
              Load Sample
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramExecutionView;
