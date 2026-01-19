// ============================================
// GENERIC JSON-BASED WORKFLOW AUTOMATION ENGINE
// Similar to n8n - executes workflow JSON files as programs
// ============================================

export interface WorkflowNode {
  id: string;
  type: "manual_trigger" | "data_node" | "transform_node" | "condition_node" | "output_node";
  name: string;
  config: Record<string, any>;
}

export interface WorkflowJSON {
  id: string;
  name: string;
  description?: string;
  version?: string;
  nodes: WorkflowNode[];
}

export interface ExecutionLog {
  timestamp: Date;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: "started" | "processing" | "completed" | "error" | "skipped";
  message: string;
  data?: any;
}

export interface ExecutionState {
  workflowId: string;
  status: "idle" | "running" | "completed" | "error";
  currentNodeIndex: number;
  sharedState: Record<string, any>;
  logs: ExecutionLog[];
  startTime?: Date;
  endTime?: Date;
  finalOutput: any;
}

// ============ DATA GENERATORS ============

const generateUUID = () => `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;

const generateName = () => {
  const firstNames = ["John", "Sarah", "Mike", "Emma", "Alex", "Lisa", "David", "Anna"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Miller"];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateEmail = (name?: string) => {
  const base = name ? name.toLowerCase().replace(" ", ".") : `user${Math.floor(Math.random() * 1000)}`;
  const domains = ["gmail.com", "company.io", "work.org", "mail.com"];
  return `${base}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateCompany = () => {
  const names = ["TechCorp", "GlobalInc", "StartupXYZ", "Enterprise Co", "Innovate Ltd", "DataSystems"];
  return names[Math.floor(Math.random() * names.length)];
};

const parseNumberRange = (range: string): number => {
  const match = range.match(/number:(\d+)-(\d+)/);
  if (match) {
    const min = parseInt(match[1]);
    const max = parseInt(match[2]);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return Math.floor(Math.random() * 100);
};

const generateDataFromSchema = (schema: Record<string, any>): Record<string, any> => {
  const item: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(schema)) {
    if (Array.isArray(value)) {
      item[key] = value[Math.floor(Math.random() * value.length)];
    } else if (typeof value === "string") {
      if (value === "uuid") item[key] = generateUUID();
      else if (value === "string") item[key] = key === "name" ? generateName() : key === "company" ? generateCompany() : `${key}_${Math.random().toString(36).substr(2, 6)}`;
      else if (value === "email") item[key] = generateEmail();
      else if (value.startsWith("number:")) item[key] = parseNumberRange(value);
      else item[key] = value;
    } else {
      item[key] = value;
    }
  }
  
  return item;
};

const generateSampleData = (dataType: string, count: number, schema?: Record<string, any>): any[] => {
  if (schema) {
    return Array.from({ length: count }, () => generateDataFromSchema(schema));
  }
  
  const generators: Record<string, () => any> = {
    users: () => ({
      id: generateUUID(),
      name: generateName(),
      email: generateEmail(),
      status: ["active", "pending", "inactive"][Math.floor(Math.random() * 3)],
      score: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString()
    }),
    orders: () => ({
      orderId: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      customer: generateName(),
      amount: Math.floor(Math.random() * 450 + 50),
      status: ["pending", "shipped", "delivered"][Math.floor(Math.random() * 3)],
      priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      createdAt: new Date().toISOString()
    }),
    leads: () => ({
      id: generateUUID(),
      company: generateCompany(),
      email: generateEmail(),
      source: ["website", "referral", "ads", "organic"][Math.floor(Math.random() * 4)],
      visits: Math.floor(Math.random() * 50 + 1),
      downloads: Math.floor(Math.random() * 10),
      createdAt: new Date().toISOString()
    })
  };
  
  const generator = generators[dataType] || generators.users;
  return Array.from({ length: count }, generator);
};

// ============ NODE EXECUTORS ============

type NodeExecutor = (
  node: WorkflowNode,
  state: ExecutionState,
  addLog: (log: Omit<ExecutionLog, "timestamp">) => void
) => Promise<void>;

const executeManualTrigger: NodeExecutor = async (node, state, addLog) => {
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: "🔔 Manual trigger activated"
  });
  
  await delay(200);
  
  state.sharedState.triggerTime = new Date().toISOString();
  state.sharedState.executionId = `exec_${Date.now()}`;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Workflow triggered at ${state.sharedState.triggerTime}`,
    data: { executionId: state.sharedState.executionId }
  });
};

const executeDataNode: NodeExecutor = async (node, state, addLog) => {
  const { dataType = "users", count = 5, schema } = node.config;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `📦 Generating ${count} ${dataType} records...`
  });
  
  await delay(300);
  
  const data = generateSampleData(dataType, count, schema);
  state.sharedState.items = data;
  state.sharedState.itemCount = data.length;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   Generated ${data.length} items with schema: ${Object.keys(schema || {}).join(", ") || "default"}`,
    data: data.slice(0, 2)
  });
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Data node complete: ${data.length} items in state`,
    data: { itemCount: data.length }
  });
};

const executeTransformNode: NodeExecutor = async (node, state, addLog) => {
  const { operation = "map", condition, transform, aiAssist } = node.config;
  const items = state.sharedState.items || [];
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `🔄 Transform operation: ${operation}`
  });
  
  await delay(200);
  
  let result: any[] = [...items];
  
  if (operation === "filter" && condition) {
    addLog({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      status: "processing",
      message: `   Filtering: ${condition.field} ${condition.operator} "${condition.value}"`
    });
    
    await delay(300);
    
    result = items.filter((item: any) => {
      const fieldValue = item[condition.field];
      switch (condition.operator) {
        case "equals": return fieldValue === condition.value;
        case "notEquals": return fieldValue !== condition.value;
        case "contains": return String(fieldValue).includes(condition.value);
        case "greaterThan": return Number(fieldValue) > Number(condition.value);
        case "lessThan": return Number(fieldValue) < Number(condition.value);
        default: return true;
      }
    });
    
    addLog({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      status: "processing",
      message: `   Filtered: ${items.length} → ${result.length} items`
    });
  }
  
  if (operation === "map" && transform) {
    if (aiAssist) {
      addLog({
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        status: "processing",
        message: `   🤖 AI-assisted transformation active`
      });
      await delay(400);
    }
    
    addLog({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      status: "processing",
      message: `   Applying transformations: ${Object.keys(transform).join(", ")}`
    });
    
    await delay(300);
    
    result = result.map((item: any) => {
      const newItem = { ...item };
      
      for (const [key, expr] of Object.entries(transform)) {
        if (typeof expr === "string") {
          if (expr === "$now") {
            newItem[key] = new Date().toISOString();
          } else if (expr === "$tomorrow") {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            newItem[key] = tomorrow.toISOString().split("T")[0];
          } else if (expr.startsWith("$item.")) {
            const field = expr.replace("$item.", "");
            newItem[key] = item[field];
          } else if (expr.includes("$item.")) {
            // Simple expression evaluation
            try {
              const evalExpr = expr.replace(/\$item\.(\w+)/g, (_, field) => JSON.stringify(item[field]));
              // Basic math expression
              if (/^[\d\s+\-*/><=?:']+$/.test(evalExpr.replace(/"/g, ""))) {
                newItem[key] = eval(evalExpr);
              } else {
                newItem[key] = expr;
              }
            } catch {
              newItem[key] = expr;
            }
          } else {
            newItem[key] = expr;
          }
        } else {
          newItem[key] = expr;
        }
      }
      
      return newItem;
    });
  }
  
  state.sharedState.items = result;
  state.sharedState.itemCount = result.length;
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Transform complete: ${result.length} items processed`,
    data: result.slice(0, 2)
  });
};

const executeConditionNode: NodeExecutor = async (node, state, addLog) => {
  const { condition, trueLabel = "True", falseLabel = "False" } = node.config;
  const items = state.sharedState.items || [];
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `🔀 Evaluating condition: ${condition?.field} ${condition?.operator} ${condition?.value}`
  });
  
  await delay(300);
  
  const trueItems: any[] = [];
  const falseItems: any[] = [];
  
  items.forEach((item: any) => {
    const fieldValue = item[condition?.field];
    let passes = false;
    
    switch (condition?.operator) {
      case "equals": passes = fieldValue === condition.value; break;
      case "notEquals": passes = fieldValue !== condition.value; break;
      case "greaterThan": passes = Number(fieldValue) > Number(condition.value); break;
      case "lessThan": passes = Number(fieldValue) < Number(condition.value); break;
      case "contains": passes = String(fieldValue).includes(condition.value); break;
      default: passes = Boolean(fieldValue);
    }
    
    if (passes) trueItems.push(item);
    else falseItems.push(item);
  });
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   ✓ ${trueLabel}: ${trueItems.length} items`
  });
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   ✗ ${falseLabel}: ${falseItems.length} items`
  });
  
  // Continue with true branch items
  state.sharedState.items = trueItems;
  state.sharedState.itemCount = trueItems.length;
  state.sharedState.conditionResults = { trueItems, falseItems };
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Condition evaluated: continuing with ${trueItems.length} items (true branch)`,
    data: { trueCount: trueItems.length, falseCount: falseItems.length }
  });
};

const executeOutputNode: NodeExecutor = async (node, state, addLog) => {
  const { format = "json", includeMetadata, includeStats } = node.config;
  const items = state.sharedState.items || [];
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `📤 Preparing output in ${format} format...`
  });
  
  await delay(200);
  
  const output: any = {
    success: true,
    itemCount: items.length,
    data: items
  };
  
  if (includeMetadata) {
    output.metadata = {
      executionId: state.sharedState.executionId,
      startTime: state.startTime?.toISOString(),
      processedAt: new Date().toISOString(),
      workflowId: state.workflowId
    };
  }
  
  if (includeStats) {
    output.stats = {
      totalItems: items.length,
      processedNodes: state.logs.filter(l => l.status === "completed").length
    };
  }
  
  state.finalOutput = output;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   Output format: ${format}, items: ${items.length}`,
    data: output
  });
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Output ready: ${items.length} items`,
    data: output
  });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============ MAIN ENGINE CLASS ============

export class WorkflowEngine {
  private workflow: WorkflowJSON;
  private state: ExecutionState;
  private onLogUpdate?: (logs: ExecutionLog[]) => void;
  private onStateUpdate?: (state: ExecutionState) => void;

  constructor(workflow: WorkflowJSON) {
    this.workflow = workflow;
    this.state = this.createInitialState();
  }

  private createInitialState(): ExecutionState {
    return {
      workflowId: this.workflow.id,
      status: "idle",
      currentNodeIndex: -1,
      sharedState: {},
      logs: [],
      finalOutput: null
    };
  }

  setLogCallback(callback: (logs: ExecutionLog[]) => void) {
    this.onLogUpdate = callback;
  }

  setStateCallback(callback: (state: ExecutionState) => void) {
    this.onStateUpdate = callback;
  }

  private addLog(log: Omit<ExecutionLog, "timestamp">) {
    const fullLog: ExecutionLog = { ...log, timestamp: new Date() };
    this.state.logs.push(fullLog);
    this.onLogUpdate?.(this.state.logs);
    this.onStateUpdate?.(this.state);
  }

  private async executeNode(node: WorkflowNode): Promise<void> {
    const executors: Record<string, NodeExecutor> = {
      manual_trigger: executeManualTrigger,
      data_node: executeDataNode,
      transform_node: executeTransformNode,
      condition_node: executeConditionNode,
      output_node: executeOutputNode
    };

    const executor = executors[node.type];
    
    if (!executor) {
      this.addLog({
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        status: "error",
        message: `❌ Unknown node type: ${node.type}`
      });
      return;
    }

    await executor(node, this.state, this.addLog.bind(this));
  }

  async run(): Promise<ExecutionState> {
    // Reset state
    this.state = this.createInitialState();
    this.state.status = "running";
    this.state.startTime = new Date();
    
    this.addLog({
      nodeId: "engine",
      nodeName: "Workflow Engine",
      nodeType: "system",
      status: "started",
      message: "═══════════════════════════════════════════════════════════"
    });
    
    this.addLog({
      nodeId: "engine",
      nodeName: "Workflow Engine",
      nodeType: "system",
      status: "started",
      message: `🚀 STARTING WORKFLOW: ${this.workflow.name}`
    });
    
    this.addLog({
      nodeId: "engine",
      nodeName: "Workflow Engine",
      nodeType: "system",
      status: "started",
      message: `📋 Nodes to execute: ${this.workflow.nodes.length}`
    });
    
    this.addLog({
      nodeId: "engine",
      nodeName: "Workflow Engine",
      nodeType: "system",
      status: "started",
      message: "═══════════════════════════════════════════════════════════"
    });

    try {
      // Execute nodes sequentially
      for (let i = 0; i < this.workflow.nodes.length; i++) {
        this.state.currentNodeIndex = i;
        const node = this.workflow.nodes[i];
        
        this.addLog({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          status: "started",
          message: `───────────────────────────────────────────────────────────`
        });
        
        this.addLog({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          status: "started",
          message: `📍 Node ${i + 1}/${this.workflow.nodes.length}: ${node.name} (${node.type})`
        });
        
        await this.executeNode(node);
        
        await delay(100);
      }

      this.state.status = "completed";
      this.state.endTime = new Date();
      
      const duration = this.state.endTime.getTime() - this.state.startTime!.getTime();
      
      this.addLog({
        nodeId: "engine",
        nodeName: "Workflow Engine",
        nodeType: "system",
        status: "completed",
        message: "═══════════════════════════════════════════════════════════"
      });
      
      this.addLog({
        nodeId: "engine",
        nodeName: "Workflow Engine",
        nodeType: "system",
        status: "completed",
        message: `✅ WORKFLOW COMPLETED SUCCESSFULLY`
      });
      
      this.addLog({
        nodeId: "engine",
        nodeName: "Workflow Engine",
        nodeType: "system",
        status: "completed",
        message: `⏱️ Total execution time: ${duration}ms`
      });
      
      this.addLog({
        nodeId: "engine",
        nodeName: "Workflow Engine",
        nodeType: "system",
        status: "completed",
        message: `📊 Final output: ${this.state.sharedState.itemCount || 0} items`
      });
      
      this.addLog({
        nodeId: "engine",
        nodeName: "Workflow Engine",
        nodeType: "system",
        status: "completed",
        message: "═══════════════════════════════════════════════════════════"
      });
      
    } catch (error: any) {
      this.state.status = "error";
      this.state.endTime = new Date();
      
      this.addLog({
        nodeId: "engine",
        nodeName: "Workflow Engine",
        nodeType: "system",
        status: "error",
        message: `❌ WORKFLOW FAILED: ${error.message}`
      });
    }

    this.onStateUpdate?.(this.state);
    return this.state;
  }

  getState(): ExecutionState {
    return this.state;
  }

  getOutput(): any {
    return this.state.finalOutput;
  }
}

// ============ WORKFLOW LOADER ============

export const loadWorkflowFromFile = async (path: string): Promise<WorkflowJSON> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load workflow: ${path}`);
  }
  return response.json();
};

export const listAvailableWorkflows = (): { id: string; name: string; path: string; description: string }[] => {
  return [
    {
      id: "sample-data-transform",
      name: "Data Transform Pipeline",
      path: "/workflows/sample-data-transform.json",
      description: "Fetches user data, transforms it, and outputs the result"
    },
    {
      id: "conditional-routing",
      name: "Conditional Order Processing",
      path: "/workflows/conditional-routing.json",
      description: "Routes orders based on value and status conditions"
    },
    {
      id: "lead-scoring",
      name: "Lead Scoring Pipeline",
      path: "/workflows/lead-scoring.json",
      description: "Scores leads based on engagement and assigns sales reps"
    }
  ];
};
