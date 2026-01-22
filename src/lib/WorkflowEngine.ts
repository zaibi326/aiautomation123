// ============================================
// GENERIC JSON-BASED WORKFLOW AUTOMATION ENGINE
// Supports both custom and n8n workflow formats
// ============================================

export interface WorkflowNode {
  id: string;
  type: string; // Support any node type
  name: string;
  config?: Record<string, any>;
  parameters?: Record<string, any>; // n8n format
  position?: [number, number]; // n8n format
}

export interface WorkflowJSON {
  id?: string;
  name: string;
  description?: string;
  version?: string;
  nodes: WorkflowNode[];
  connections?: Record<string, any>; // n8n connections
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
  const firstNames = ["John", "Sarah", "Mike", "Emma", "Alex", "Lisa", "David", "Anna", "James", "Maria"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Davis", "Miller", "Wilson", "Garcia"];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateEmail = (name?: string) => {
  const base = name ? name.toLowerCase().replace(" ", ".") : `user${Math.floor(Math.random() * 1000)}`;
  const domains = ["gmail.com", "company.io", "work.org", "mail.com", "outlook.com"];
  return `${base}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateCompany = () => {
  const names = ["TechCorp", "GlobalInc", "StartupXYZ", "Enterprise Co", "Innovate Ltd", "DataSystems", "CloudFirst", "AI Solutions"];
  return names[Math.floor(Math.random() * names.length)];
};

const generatePhone = () => {
  return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
};

const generateSampleData = (dataType: string, count: number): any[] => {
  const generators: Record<string, () => any> = {
    users: () => ({
      id: generateUUID(),
      name: generateName(),
      email: generateEmail(),
      phone: generatePhone(),
      status: ["active", "pending", "inactive"][Math.floor(Math.random() * 3)],
      role: ["admin", "user", "manager", "viewer"][Math.floor(Math.random() * 4)],
      score: Math.floor(Math.random() * 100),
      lastLogin: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      createdAt: new Date().toISOString()
    }),
    orders: () => ({
      orderId: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      customer: generateName(),
      email: generateEmail(),
      product: ["Widget Pro", "Super Suite", "Basic Pack", "Enterprise License"][Math.floor(Math.random() * 4)],
      amount: Math.floor(Math.random() * 450 + 50),
      quantity: Math.floor(Math.random() * 10) + 1,
      status: ["pending", "processing", "shipped", "delivered"][Math.floor(Math.random() * 4)],
      priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      createdAt: new Date().toISOString()
    }),
    leads: () => ({
      id: generateUUID(),
      company: generateCompany(),
      contactName: generateName(),
      email: generateEmail(),
      phone: generatePhone(),
      source: ["website", "referral", "ads", "organic", "social"][Math.floor(Math.random() * 5)],
      value: Math.floor(Math.random() * 50000 + 1000),
      stage: ["new", "contacted", "qualified", "proposal", "closed"][Math.floor(Math.random() * 5)],
      visits: Math.floor(Math.random() * 50 + 1),
      downloads: Math.floor(Math.random() * 10),
      createdAt: new Date().toISOString()
    }),
    products: () => ({
      id: generateUUID(),
      name: ["Widget", "Gadget", "Tool", "Service"][Math.floor(Math.random() * 4)] + " " + Math.floor(Math.random() * 1000),
      sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      stock: Math.floor(Math.random() * 100),
      category: ["Electronics", "Software", "Services", "Hardware"][Math.floor(Math.random() * 4)],
      createdAt: new Date().toISOString()
    }),
    ads: () => ({
      id: generateUUID(),
      campaignName: `Campaign ${Math.floor(Math.random() * 100)}`,
      adSetName: `AdSet ${Math.floor(Math.random() * 50)}`,
      headline: ["Save Big Today!", "Limited Offer", "Don't Miss Out", "Exclusive Deal"][Math.floor(Math.random() * 4)],
      primaryText: "Discover amazing products and services tailored just for you.",
      ctaType: ["LEARN_MORE", "SHOP_NOW", "SIGN_UP", "GET_OFFER"][Math.floor(Math.random() * 4)],
      targetAudience: ["18-25", "25-35", "35-45", "45+"][Math.floor(Math.random() * 4)],
      budget: Math.floor(Math.random() * 1000 + 100),
      status: ["active", "paused", "pending_review"][Math.floor(Math.random() * 3)],
      impressions: Math.floor(Math.random() * 10000),
      clicks: Math.floor(Math.random() * 500),
      conversions: Math.floor(Math.random() * 50),
      createdAt: new Date().toISOString()
    })
  };
  
  const generator = generators[dataType] || generators.users;
  return Array.from({ length: count }, generator);
};

// ============ N8N NODE TYPE MAPPING ============

const getN8nNodeCategory = (nodeType: string): string => {
  const type = nodeType.toLowerCase();
  
  // Triggers
  if (type.includes("trigger") || type.includes("webhook") || type.includes("manual") || type.includes("start") || type.includes("schedule")) {
    return "trigger";
  }
  
  // HTTP/API
  if (type.includes("httprequest") || type.includes("http") || type.includes("api") || type.includes("graphapi") || type.includes("facebookgraphapi")) {
    return "http";
  }
  
  // AI/LLM
  if (type.includes("openai") || type.includes("llm") || type.includes("langchain") || type.includes("gemini") || type.includes("claude") || type.includes("ai") || type.includes("chat")) {
    return "ai";
  }
  
  // Code execution
  if (type.includes("code") || type.includes("function") || type.includes("javascript")) {
    return "code";
  }
  
  // Conditionals
  if (type.includes("if") || type.includes("switch") || type.includes("condition")) {
    return "condition";
  }
  
  // Data transformation
  if (type.includes("set") || type.includes("edit") || type.includes("transform") || type.includes("merge") || type.includes("split")) {
    return "transform";
  }
  
  // Database/Storage
  if (type.includes("airtable") || type.includes("google") || type.includes("sheets") || type.includes("notion") || type.includes("database") || type.includes("postgres") || type.includes("mysql")) {
    return "database";
  }
  
  // Communication
  if (type.includes("email") || type.includes("gmail") || type.includes("slack") || type.includes("telegram") || type.includes("whatsapp") || type.includes("sendgrid") || type.includes("discord")) {
    return "communication";
  }
  
  // Wait/Delay
  if (type.includes("wait") || type.includes("delay") || type.includes("sleep")) {
    return "wait";
  }
  
  // Parser/Output
  if (type.includes("parser") || type.includes("output") || type.includes("structured")) {
    return "parser";
  }
  
  // Sticky notes (skip)
  if (type.includes("sticky") || type.includes("note")) {
    return "skip";
  }
  
  // Respond to webhook
  if (type.includes("respondtowebhook") || type.includes("respond")) {
    return "respond";
  }
  
  return "generic";
};

// ============ NODE EXECUTORS ============

type NodeExecutor = (
  node: WorkflowNode,
  state: ExecutionState,
  addLog: (log: Omit<ExecutionLog, "timestamp">) => void
) => Promise<void>;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const executeTriggerNode: NodeExecutor = async (node, state, addLog) => {
  const params = node.parameters || node.config || {};
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: "🔔 Trigger node activated"
  });
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📋 Initializing workflow execution...`
  });
  
  // Generate initial data
  const initialData = generateSampleData("users", 5);
  
  state.sharedState.triggerTime = new Date().toISOString();
  state.sharedState.executionId = `exec_${Date.now()}`;
  state.sharedState.items = initialData;
  state.sharedState.itemCount = initialData.length;
  
  await delay(300);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📦 Generated ${initialData.length} sample records`
  });
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Trigger activated - ${initialData.length} items ready`,
    data: { executionId: state.sharedState.executionId, itemCount: initialData.length }
  });
};

const executeHttpNode: NodeExecutor = async (node, state, addLog) => {
  const params = node.parameters || node.config || {};
  const url = params.url || params.endpoint || "https://api.example.com/data";
  const method = params.method || params.requestMethod || "GET";
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `🌐 HTTP ${method} Request`
  });
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📍 URL: ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`
  });
  
  await delay(400);
  
  // Simulate API response
  const responseData = state.sharedState.items || generateSampleData("orders", 5);
  const responseTime = Math.floor(Math.random() * 300 + 100);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   ⏱️ Response time: ${responseTime}ms`
  });
  
  state.sharedState.httpResponse = {
    statusCode: 200,
    data: responseData
  };
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ HTTP request completed - ${Array.isArray(responseData) ? responseData.length : 1} items`,
    data: { statusCode: 200, itemCount: Array.isArray(responseData) ? responseData.length : 1 }
  });
};

const executeAINode: NodeExecutor = async (node, state, addLog) => {
  const params = node.parameters || node.config || {};
  const model = params.model || "gpt-4";
  const prompt = params.prompt || params.text || "Analyze the data";
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `🤖 AI/LLM Processing`
  });
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   🧠 Model: ${model}`
  });
  
  await delay(300);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📝 Processing prompt...`
  });
  
  await delay(600);
  
  // Simulate AI response based on input data
  const items = state.sharedState.items || [];
  const aiAnalysis = {
    summary: `Analyzed ${items.length} items`,
    insights: [
      "Data quality is good",
      "Recommended actions identified",
      `${items.length} records processed successfully`
    ],
    processedItems: items.map((item: any) => ({
      ...item,
      aiScore: Math.floor(Math.random() * 100),
      aiCategory: ["high_priority", "medium_priority", "low_priority"][Math.floor(Math.random() * 3)]
    }))
  };
  
  state.sharedState.aiAnalysis = aiAnalysis;
  state.sharedState.items = aiAnalysis.processedItems;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ AI processing complete - ${items.length} items analyzed`,
    data: { summary: aiAnalysis.summary }
  });
};

const executeCodeNode: NodeExecutor = async (node, state, addLog) => {
  const params = node.parameters || node.config || {};
  const code = params.jsCode || params.code || params.functionCode || "return items;";
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `💻 Code Execution`
  });
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📜 Executing JavaScript...`
  });
  
  await delay(300);
  
  // Simulate code execution
  const items = state.sharedState.items || [];
  const processedItems = items.map((item: any, index: number) => ({
    ...item,
    _processedAt: new Date().toISOString(),
    _index: index
  }));
  
  state.sharedState.items = processedItems;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Code executed - ${processedItems.length} items processed`,
    data: { itemCount: processedItems.length }
  });
};

const executeConditionNode: NodeExecutor = async (node, state, addLog) => {
  const params = node.parameters || node.config || {};
  const condition = params.conditions || params.condition;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `🔀 Conditional Logic`
  });
  
  await delay(200);
  
  const items = state.sharedState.items || [];
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📊 Evaluating ${items.length} items...`
  });
  
  await delay(300);
  
  // Simulate condition evaluation - split items
  const trueItems = items.filter(() => Math.random() > 0.4);
  const falseItems = items.filter((item: any) => !trueItems.includes(item));
  
  state.sharedState.conditionResults = { trueItems, falseItems };
  state.sharedState.items = trueItems;
  state.sharedState.itemCount = trueItems.length;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   ✓ True branch: ${trueItems.length} items`
  });
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   ✗ False branch: ${falseItems.length} items`
  });
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Condition evaluated - continuing with ${trueItems.length} items`,
    data: { trueCount: trueItems.length, falseCount: falseItems.length }
  });
};

const executeTransformNode: NodeExecutor = async (node, state, addLog) => {
  const params = node.parameters || node.config || {};
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `🔄 Data Transformation`
  });
  
  await delay(200);
  
  const items = state.sharedState.items || [];
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📝 Transforming ${items.length} items...`
  });
  
  await delay(300);
  
  // Apply transformations based on params
  const fields = params.fields || params.values || params.assignments || [];
  
  const transformedItems = items.map((item: any) => {
    const newItem = { ...item };
    
    if (Array.isArray(fields)) {
      fields.forEach((field: any) => {
        if (field.name && field.value !== undefined) {
          newItem[field.name] = field.value;
        }
      });
    }
    
    newItem._transformedAt = new Date().toISOString();
    return newItem;
  });
  
  state.sharedState.items = transformedItems;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Transformation complete - ${transformedItems.length} items`,
    data: { itemCount: transformedItems.length }
  });
};

const executeDatabaseNode: NodeExecutor = async (node, state, addLog) => {
  const params = node.parameters || node.config || {};
  const operation = params.operation || "read";
  const resource = params.resource || "record";
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `🗄️ Database Operation: ${operation}`
  });
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📊 ${operation} ${resource}...`
  });
  
  await delay(400);
  
  const items = state.sharedState.items || [];
  
  // Simulate database operation
  if (operation === "read" || operation === "getMany" || operation === "search") {
    const newData = generateSampleData("leads", 5);
    state.sharedState.items = newData;
    state.sharedState.itemCount = newData.length;
    
    addLog({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      status: "completed",
      message: `✅ Retrieved ${newData.length} records`,
      data: { operation, recordCount: newData.length }
    });
  } else {
    addLog({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      status: "completed",
      message: `✅ ${operation} completed - ${items.length} records affected`,
      data: { operation, recordCount: items.length }
    });
  }
};

const executeCommunicationNode: NodeExecutor = async (node, state, addLog) => {
  const params = node.parameters || node.config || {};
  const to = params.to || params.sendTo || params.toEmail || params.chatId || "recipient@example.com";
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `📧 Sending Message`
  });
  
  await delay(200);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📤 To: ${to}`
  });
  
  await delay(500);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Message sent successfully`,
    data: { to, messageId: `msg_${Date.now()}` }
  });
};

const executeWaitNode: NodeExecutor = async (node, state, addLog) => {
  const params = node.parameters || node.config || {};
  const waitTime = params.amount || params.seconds || 1;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `⏳ Wait Node`
  });
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   ⏱️ Waiting ${waitTime}s...`
  });
  
  await delay(Math.min(waitTime * 100, 500)); // Simulate shorter wait
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Wait complete`
  });
};

const executeParserNode: NodeExecutor = async (node, state, addLog) => {
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `📋 Output Parser`
  });
  
  await delay(200);
  
  const items = state.sharedState.items || [];
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📊 Parsing ${items.length} items...`
  });
  
  await delay(300);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Parsed ${items.length} items`,
    data: { itemCount: items.length }
  });
};

const executeRespondNode: NodeExecutor = async (node, state, addLog) => {
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `📤 Respond to Webhook`
  });
  
  await delay(200);
  
  const items = state.sharedState.items || [];
  
  state.finalOutput = {
    success: true,
    itemCount: items.length,
    data: items,
    executionId: state.sharedState.executionId,
    completedAt: new Date().toISOString()
  };
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Response prepared - ${items.length} items`,
    data: state.finalOutput
  });
};

const executeGenericNode: NodeExecutor = async (node, state, addLog) => {
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `⚙️ Processing: ${node.name}`
  });
  
  await delay(200);
  
  const items = state.sharedState.items || [];
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "processing",
    message: `   📊 Processing ${items.length} items...`
  });
  
  await delay(300);
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Node completed - ${items.length} items`,
    data: { itemCount: items.length }
  });
};

// Legacy node executors for backward compatibility
const executeManualTrigger: NodeExecutor = executeTriggerNode;
const executeDataNode: NodeExecutor = async (node, state, addLog) => {
  const config = node.config || {};
  const { dataType = "users", count = 5 } = config;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `📦 Generating ${count} ${dataType} records...`
  });
  
  await delay(300);
  
  const data = generateSampleData(dataType, count);
  state.sharedState.items = data;
  state.sharedState.itemCount = data.length;
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Generated ${data.length} items`,
    data: { itemCount: data.length }
  });
};

const executeOutputNode: NodeExecutor = async (node, state, addLog) => {
  const items = state.sharedState.items || [];
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "started",
    message: `📤 Preparing output...`
  });
  
  await delay(200);
  
  state.finalOutput = {
    success: true,
    itemCount: items.length,
    data: items,
    metadata: {
      executionId: state.sharedState.executionId,
      startTime: state.startTime?.toISOString(),
      processedAt: new Date().toISOString(),
      workflowId: state.workflowId
    }
  };
  
  addLog({
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    status: "completed",
    message: `✅ Output ready: ${items.length} items`,
    data: state.finalOutput
  });
};

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
      workflowId: this.workflow.id || `wf_${Date.now()}`,
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

  private getExecutorForNode(node: WorkflowNode): NodeExecutor {
    const nodeType = node.type.toLowerCase();
    
    // Legacy custom node types
    const legacyExecutors: Record<string, NodeExecutor> = {
      manual_trigger: executeManualTrigger,
      data_node: executeDataNode,
      transform_node: executeTransformNode,
      condition_node: executeConditionNode,
      output_node: executeOutputNode
    };
    
    if (legacyExecutors[node.type]) {
      return legacyExecutors[node.type];
    }
    
    // n8n node types - map by category
    const category = getN8nNodeCategory(nodeType);
    
    const categoryExecutors: Record<string, NodeExecutor> = {
      trigger: executeTriggerNode,
      http: executeHttpNode,
      ai: executeAINode,
      code: executeCodeNode,
      condition: executeConditionNode,
      transform: executeTransformNode,
      database: executeDatabaseNode,
      communication: executeCommunicationNode,
      wait: executeWaitNode,
      parser: executeParserNode,
      respond: executeRespondNode,
      skip: async () => {}, // Skip sticky notes
      generic: executeGenericNode
    };
    
    return categoryExecutors[category] || executeGenericNode;
  }

  private async executeNode(node: WorkflowNode): Promise<void> {
    const category = getN8nNodeCategory(node.type);
    
    // Skip sticky notes
    if (category === "skip") {
      this.addLog({
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        status: "skipped",
        message: `⏭️ Skipped: ${node.name} (annotation)`
      });
      return;
    }
    
    const executor = this.getExecutorForNode(node);
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

      // Prepare final output if not already set
      if (!this.state.finalOutput) {
        this.state.finalOutput = {
          success: true,
          itemCount: this.state.sharedState.itemCount || 0,
          data: this.state.sharedState.items || [],
          executionId: this.state.sharedState.executionId,
          completedAt: new Date().toISOString()
        };
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
        message: `📊 Final output: ${this.state.finalOutput?.itemCount || 0} items`
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
