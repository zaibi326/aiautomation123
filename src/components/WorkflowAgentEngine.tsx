import { useState, useCallback } from "react";

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

interface ExecutionResult {
  success: boolean;
  nodeName: string;
  nodeType: string;
  executionTime: number;
  inputData: any;
  outputData: any;
  itemCount: number;
  logs: string[];
}

interface WorkflowExecutionState {
  status: "idle" | "running" | "completed" | "error";
  currentNode: string | null;
  nodeStatuses: Record<string, "pending" | "running" | "completed" | "error">;
  nodeOutputs: Record<string, any>;
  nodeExecutionTimes: Record<string, number>;
  executionResults: ExecutionResult[];
  totalTime: number;
  finalOutput: any;
}

// Realistic data generators
const generateRandomEmail = () => {
  const names = ["john.doe", "sarah.smith", "mike.wilson", "emma.brown", "alex.johnson", "lisa.chen"];
  const domains = ["gmail.com", "outlook.com", "company.io", "enterprise.com"];
  return `${names[Math.floor(Math.random() * names.length)]}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateRandomName = () => {
  const firstNames = ["John", "Sarah", "Michael", "Emma", "Alex", "Lisa", "David", "Anna", "Chris", "Maria"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateRealisticProducts = (count: number) => {
  const products = ["Premium Widget", "Enterprise Suite", "Basic Package", "Pro License", "Starter Kit"];
  const statuses = ["active", "pending", "shipped", "processing", "completed"];
  return Array.from({ length: count }, (_, i) => ({
    id: `PROD_${Date.now()}_${i + 1}`,
    name: products[Math.floor(Math.random() * products.length)],
    price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
    quantity: Math.floor(Math.random() * 10) + 1,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
  }));
};

const generateRealisticUsers = (count: number) => {
  const roles = ["admin", "user", "manager", "viewer"];
  const departments = ["Engineering", "Marketing", "Sales", "Support", "HR"];
  return Array.from({ length: count }, (_, i) => ({
    id: `USR_${Math.random().toString(36).substr(2, 8)}`,
    name: generateRandomName(),
    email: generateRandomEmail(),
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    lastActive: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    isVerified: Math.random() > 0.2
  }));
};

const simulateTypingLogs = async (logs: string[], message: string, onLog?: (msg: string) => void, delay = 50) => {
  logs.push(message);
  if (onLog) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

// Simulate node execution based on type and input data
const executeNode = async (
  node: N8nNode,
  inputData: any,
  previousOutputs: Record<string, any>,
  onLog?: (message: string) => void
): Promise<{ output: any; items: number; logs: string[] }> => {
  const nodeType = node.type.toLowerCase();
  const params = node.parameters || {};
  const logs: string[] = [];
  
  // Realistic processing delays based on node type
  const getProcessingDelay = () => {
    if (nodeType.includes("ai") || nodeType.includes("openai") || nodeType.includes("gpt")) return 2500 + Math.random() * 2000;
    if (nodeType.includes("http") || nodeType.includes("api")) return 800 + Math.random() * 1500;
    if (nodeType.includes("email") || nodeType.includes("gmail")) return 1200 + Math.random() * 800;
    if (nodeType.includes("sheets") || nodeType.includes("database")) return 1000 + Math.random() * 1000;
    if (nodeType.includes("code") || nodeType.includes("function")) return 600 + Math.random() * 800;
    return 400 + Math.random() * 600;
  };

  // Trigger nodes - start the workflow
  if (nodeType.includes("trigger") || nodeType.includes("webhook") || nodeType.includes("manual") || nodeType.includes("start")) {
    logs.push(`🔔 Trigger activated: ${node.name}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`📥 Receiving incoming webhook request...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`🔐 Validating request headers and authentication...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`✅ Request validated successfully`);
    
    const initialData = generateRealisticUsers(3);
    return {
      output: {
        json: {
          triggerTime: new Date().toISOString(),
          workflowId: "wf_" + Math.random().toString(36).substr(2, 9),
          executionId: `exec_${Date.now()}`,
          source: params.source || "webhook_trigger",
          headers: {
            "content-type": "application/json",
            "x-request-id": `req_${Math.random().toString(36).substr(2, 16)}`,
            "user-agent": "n8n-workflow-engine/2.0"
          },
          body: inputData || { event: "workflow_started", timestamp: Date.now() },
          initialData: initialData
        }
      },
      items: 1,
      logs
    };
  }

  // HTTP Request nodes
  if (nodeType.includes("httprequest") || nodeType.includes("http")) {
    const url = params.url || "https://api.example.com/data";
    logs.push(`🌐 Initiating HTTP request...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`📡 Connecting to: ${url}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    logs.push(`🔄 Sending request with headers...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`⏳ Waiting for server response...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const responseData = generateRealisticProducts(5);
    const responseSize = JSON.stringify(responseData).length;
    
    logs.push(`📊 Response received: 200 OK (${responseSize} bytes)`);
    await new Promise(resolve => setTimeout(resolve, 200));
    logs.push(`✅ Parsed ${responseData.length} items from response`);
    
    return {
      output: {
        json: {
          statusCode: 200,
          responseTime: Math.floor(Math.random() * 200) + 150,
          data: responseData,
          pagination: {
            page: 1,
            perPage: 10,
            total: responseData.length,
            hasMore: false
          },
          headers: { 
            "content-type": "application/json",
            "x-ratelimit-remaining": Math.floor(Math.random() * 900) + 100
          },
          requestUrl: url
        }
      },
      items: responseData.length,
      logs
    };
  }

  // Gmail/Email nodes
  if (nodeType.includes("gmail") || nodeType.includes("email") || nodeType.includes("mail")) {
    const to = params.to || generateRandomEmail();
    logs.push(`📧 Preparing email message...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`🔐 Authenticating with mail server...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    logs.push(`📤 Sending email to: ${to}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    logs.push(`✅ Email delivered successfully`);
    await new Promise(resolve => setTimeout(resolve, 200));
    logs.push(`📬 Delivery confirmation received`);
    
    return {
      output: {
        json: {
          messageId: `<${Math.random().toString(36).substr(2, 12)}@mail.workflow.io>`,
          to: to,
          from: "workflow@automation.io",
          subject: params.subject || `Workflow Update - ${new Date().toLocaleDateString()}`,
          status: "delivered",
          sentAt: new Date().toISOString(),
          deliveryTime: Math.floor(Math.random() * 500) + 200,
          attachments: [],
          trackingId: `track_${Math.random().toString(36).substr(2, 10)}`
        }
      },
      items: 1,
      logs
    };
  }

  // Google Sheets nodes
  if (nodeType.includes("googlesheets") || nodeType.includes("sheets") || nodeType.includes("spreadsheet")) {
    logs.push(`📊 Connecting to Google Sheets API...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    logs.push(`🔐 Authenticating with service account...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`📂 Opening spreadsheet...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const inputItems = inputData?.json?.data || inputData?.json?.initialData || generateRealisticProducts(3);
    const rowCount = Array.isArray(inputItems) ? inputItems.length : 1;
    
    logs.push(`📝 Writing ${rowCount} rows to Sheet1...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    logs.push(`✅ Data synchronized successfully`);
    await new Promise(resolve => setTimeout(resolve, 200));
    logs.push(`🔄 Sheet cache updated`);
    
    return {
      output: {
        json: {
          spreadsheetId: "1BxiM" + Math.random().toString(36).substr(2, 6),
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/1BxiM${Math.random().toString(36).substr(2, 6)}`,
          sheetName: "Sheet1",
          range: `A1:E${rowCount + 1}`,
          rowsUpdated: rowCount,
          operation: params.operation || "append",
          data: inputItems,
          updatedAt: new Date().toISOString()
        }
      },
      items: rowCount,
      logs
    };
  }

  // Slack nodes
  if (nodeType.includes("slack")) {
    const channel = params.channel || "#automation-alerts";
    logs.push(`💬 Connecting to Slack workspace...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`🔐 Validating bot permissions...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`📤 Posting message to ${channel}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    logs.push(`✅ Message posted successfully`);
    
    const inputSummary = inputData?.json?.data ? `Processed ${inputData.json.data.length} items` : "Workflow update";
    
    return {
      output: {
        json: {
          ok: true,
          channel: channel,
          ts: (Date.now() / 1000).toFixed(6),
          message: {
            text: params.text || `🤖 ${inputSummary}`,
            blocks: [
              { type: "section", text: { type: "mrkdwn", text: `*Workflow Notification*\n${inputSummary}` } }
            ]
          },
          messageId: "slack_" + Math.random().toString(36).substr(2, 10),
          team: "T" + Math.random().toString(36).substr(2, 8).toUpperCase()
        }
      },
      items: 1,
      logs
    };
  }

  // Telegram nodes
  if (nodeType.includes("telegram")) {
    logs.push(`📱 Connecting to Telegram Bot API...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`🔐 Authenticating bot token...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`📤 Sending message...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    logs.push(`✅ Message delivered`);
    
    return {
      output: {
        json: {
          ok: true,
          result: {
            message_id: Math.floor(Math.random() * 100000),
            from: { id: 123456789, is_bot: true, first_name: "WorkflowBot" },
            chat: { id: Math.floor(Math.random() * 1000000000), type: "private" },
            date: Math.floor(Date.now() / 1000),
            text: params.text || "Workflow notification"
          }
        }
      },
      items: 1,
      logs
    };
  }

  // WhatsApp nodes
  if (nodeType.includes("whatsapp")) {
    logs.push(`📱 Connecting to WhatsApp Business API...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    logs.push(`🔐 Verifying phone number...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`📤 Sending message via template...`);
    await new Promise(resolve => setTimeout(resolve, 700));
    logs.push(`✅ Message delivered successfully`);
    
    return {
      output: {
        json: {
          messaging_product: "whatsapp",
          contacts: [{ input: params.phone || "+1234567890", wa_id: "1234567890" }],
          messages: [{ 
            id: "wamid." + Math.random().toString(36).substr(2, 22),
            message_status: "sent" 
          }]
        }
      },
      items: 1,
      logs
    };
  }

  // OpenAI/AI nodes - longer processing
  if (nodeType.includes("openai") || nodeType.includes("ai") || nodeType.includes("gpt") || nodeType.includes("claude") || nodeType.includes("langchain")) {
    logs.push(`🤖 Initializing AI model connection...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    logs.push(`📊 Preparing input context and tokens...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const inputContext = inputData?.json?.data || inputData?.json?.initialData;
    const contextSize = inputContext ? JSON.stringify(inputContext).length : 100;
    
    logs.push(`🧠 Processing ${contextSize} characters of context...`);
    await new Promise(resolve => setTimeout(resolve, 1200));
    logs.push(`⚡ Running inference with GPT-4...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    logs.push(`📝 Generating response...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    logs.push(`✅ AI processing complete`);
    
    const analysisResult = inputContext && Array.isArray(inputContext) ? {
      summary: `Analyzed ${inputContext.length} records from the input data.`,
      insights: [
        `Found ${inputContext.filter((i: any) => i.status === "active").length || 0} active items`,
        `Average value: $${(inputContext.reduce((sum: number, i: any) => sum + (i.price || i.value || 0), 0) / inputContext.length).toFixed(2) || "N/A"}`,
        `Data quality score: ${Math.floor(Math.random() * 20) + 80}%`
      ],
      recommendations: [
        "Consider automating follow-up for pending items",
        "Data patterns suggest peak activity between 9 AM - 2 PM",
        "Recommend implementing batch processing for efficiency"
      ],
      processedItems: inputContext.map((item: any, idx: number) => ({
        ...item,
        aiScore: Math.floor(Math.random() * 40) + 60,
        classification: ["high-priority", "medium-priority", "low-priority"][Math.floor(Math.random() * 3)],
        sentiment: ["positive", "neutral", "needs-attention"][Math.floor(Math.random() * 3)]
      }))
    } : {
      summary: "AI analysis completed successfully",
      insights: ["No specific data patterns detected"],
      recommendations: ["Provide structured input for detailed analysis"]
    };
    
    return {
      output: {
        json: {
          model: "gpt-4-turbo",
          analysis: analysisResult,
          usage: {
            prompt_tokens: Math.floor(contextSize / 4) + 50,
            completion_tokens: Math.floor(Math.random() * 300) + 100,
            total_tokens: Math.floor(contextSize / 4) + Math.floor(Math.random() * 300) + 150
          },
          processingTime: Math.floor(Math.random() * 2000) + 1500,
          finish_reason: "stop"
        }
      },
      items: 1,
      logs
    };
  }

  // Code/Function nodes - data transformation
  if (nodeType.includes("code") || nodeType.includes("function") || nodeType.includes("javascript")) {
    logs.push(`💻 Initializing JavaScript runtime...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`📥 Loading input data...`);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const inputItems = inputData?.json?.data || inputData?.json?.initialData || inputData?.json?.analysis?.processedItems;
    
    if (Array.isArray(inputItems) && inputItems.length > 0) {
      logs.push(`🔄 Processing ${inputItems.length} items...`);
      await new Promise(resolve => setTimeout(resolve, 400));
      logs.push(`📊 Applying transformations...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const transformedData = inputItems.map((item: any, idx: number) => ({
        ...item,
        processed: true,
        transformedId: `PROC_${(idx + 1).toString().padStart(4, '0')}`,
        hash: Math.random().toString(36).substr(2, 8),
        processedAt: new Date().toISOString(),
        computedValue: typeof item.price === 'number' ? item.price * (item.quantity || 1) : null,
        tags: ["automated", "validated", idx % 2 === 0 ? "even-batch" : "odd-batch"]
      }));
      
      logs.push(`✅ Transformed ${transformedData.length} items successfully`);
      
      return {
        output: {
          json: {
            items: transformedData,
            stats: {
              totalProcessed: transformedData.length,
              successRate: 100,
              transformations: ["addId", "computeValue", "addTags"]
            },
            executionTime: Date.now(),
            codeVersion: "2.1.0"
          }
        },
        items: transformedData.length,
        logs
      };
    }
    
    logs.push(`⚙️ Executing custom logic...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`✅ Code executed successfully`);
    
    return {
      output: {
        json: {
          items: [{ processed: true, result: "code_executed", timestamp: Date.now() }],
          executionTime: Date.now(),
          codeVersion: "2.1.0"
        }
      },
      items: 1,
      logs
    };
  }

  // IF/Switch nodes
  if (nodeType.includes("if") || nodeType.includes("switch") || nodeType.includes("condition")) {
    logs.push(`🔀 Evaluating conditional logic...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const inputItems = inputData?.json?.data || inputData?.json?.items || [];
    const activeCount = Array.isArray(inputItems) ? inputItems.filter((i: any) => i.status === "active").length : 0;
    const condition = activeCount > 0 || Math.random() > 0.3;
    
    logs.push(`📊 Condition: ${params.condition || "hasActiveItems"}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    logs.push(`✅ Result: ${condition ? "TRUE → taking main branch" : "FALSE → taking fallback branch"}`);
    
    return {
      output: {
        json: {
          condition: params.condition || "hasActiveItems",
          result: condition,
          branch: condition ? "true" : "false",
          evaluatedValue: activeCount,
          evaluatedAt: new Date().toISOString(),
          passedData: inputData?.json || {}
        }
      },
      items: 1,
      logs
    };
  }

  // Merge nodes
  if (nodeType.includes("merge") || nodeType.includes("join")) {
    logs.push(`🔗 Collecting data from input branches...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const mergedData = Object.values(previousOutputs).reduce((acc: any[], output: any) => {
      if (output?.json?.items) return [...acc, ...output.json.items];
      if (output?.json?.data) return [...acc, ...output.json.data];
      if (output?.json) return [...acc, output.json];
      return acc;
    }, []);
    
    logs.push(`📊 Found ${Object.keys(previousOutputs).length} input sources`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`🔄 Merging ${mergedData.length} total items...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`✅ Merge complete`);
    
    return {
      output: {
        json: {
          mergedItems: mergedData.length,
          sources: Object.keys(previousOutputs),
          mode: params.mode || "append",
          data: mergedData.length > 0 ? mergedData : [{ merged: true, source: "multiple" }]
        }
      },
      items: mergedData.length || 1,
      logs
    };
  }

  // Set/Transform nodes
  if (nodeType.includes("set") || nodeType.includes("transform") || nodeType.includes("edit")) {
    logs.push(`📝 Setting field values...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`🔄 Applying transformations...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`✅ Data transformed`);
    
    return {
      output: {
        json: {
          ...(inputData?.json || {}),
          transformed: true,
          setFields: params.values || { status: "updated", processedBy: "n8n" },
          transformedAt: new Date().toISOString()
        }
      },
      items: 1,
      logs
    };
  }

  // Notion nodes
  if (nodeType.includes("notion")) {
    logs.push(`📔 Connecting to Notion API...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    logs.push(`🔐 Authenticating integration...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`📄 Creating new page...`);
    await new Promise(resolve => setTimeout(resolve, 600));
    logs.push(`✅ Page created successfully`);
    
    return {
      output: {
        json: {
          object: "page",
          id: Math.random().toString(36).substr(2, 8) + "-" + Math.random().toString(36).substr(2, 4),
          title: params.title || "Workflow Entry",
          url: `https://notion.so/${Math.random().toString(36).substr(2, 16)}`,
          created_time: new Date().toISOString(),
          parent: { type: "database_id", database_id: "db_" + Math.random().toString(36).substr(2, 8) }
        }
      },
      items: 1,
      logs
    };
  }

  // Airtable nodes
  if (nodeType.includes("airtable")) {
    logs.push(`📋 Connecting to Airtable base...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`🔐 Validating API credentials...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`📝 Creating/updating records...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    logs.push(`✅ Records synchronized`);
    
    return {
      output: {
        json: {
          id: "rec" + Math.random().toString(36).substr(2, 14),
          fields: inputData?.json || { Name: "New Record", Status: "Active" },
          createdTime: new Date().toISOString()
        }
      },
      items: 1,
      logs
    };
  }

  // Discord nodes
  if (nodeType.includes("discord")) {
    logs.push(`🎮 Connecting to Discord gateway...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    logs.push(`🔐 Authenticating bot...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`📤 Sending message...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    logs.push(`✅ Message delivered to channel`);
    
    return {
      output: {
        json: {
          id: Math.random().toString().substr(2, 18),
          channel_id: params.channelId || "123456789012345678",
          content: params.content || "Workflow notification",
          timestamp: new Date().toISOString(),
          author: { id: "bot", username: "WorkflowBot", bot: true }
        }
      },
      items: 1,
      logs
    };
  }

  // Database nodes
  if (nodeType.includes("postgres") || nodeType.includes("mysql") || nodeType.includes("database") || nodeType.includes("supabase")) {
    logs.push(`🗄️ Connecting to database...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    logs.push(`🔐 Authenticating connection...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    logs.push(`📊 Executing query...`);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const records = generateRealisticUsers(4);
    logs.push(`✅ Query returned ${records.length} rows`);
    
    return {
      output: {
        json: {
          data: records,
          rowCount: records.length,
          query: params.query || "SELECT * FROM records LIMIT 10",
          executionTime: Math.floor(Math.random() * 100) + 50
        }
      },
      items: records.length,
      logs
    };
  }

  // Filter nodes
  if (nodeType.includes("filter") || nodeType.includes("remove")) {
    logs.push(`🔍 Applying filter conditions...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const inputItems = inputData?.json?.data || inputData?.json?.items || [];
    const filteredItems = Array.isArray(inputItems) 
      ? inputItems.filter((_: any, idx: number) => idx % 2 === 0 || Math.random() > 0.3)
      : inputItems;
    
    logs.push(`📊 Filtered: ${inputItems.length} → ${Array.isArray(filteredItems) ? filteredItems.length : 1} items`);
    await new Promise(resolve => setTimeout(resolve, 200));
    logs.push(`✅ Filter applied successfully`);
    
    return {
      output: {
        json: {
          data: filteredItems,
          originalCount: Array.isArray(inputItems) ? inputItems.length : 1,
          filteredCount: Array.isArray(filteredItems) ? filteredItems.length : 1,
          filterCondition: params.condition || "status != 'inactive'"
        }
      },
      items: Array.isArray(filteredItems) ? filteredItems.length : 1,
      logs
    };
  }

  // Wait/Delay nodes
  if (nodeType.includes("wait") || nodeType.includes("delay") || nodeType.includes("sleep")) {
    const waitTime = params.seconds || 2;
    logs.push(`⏳ Waiting for ${waitTime} seconds...`);
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    logs.push(`✅ Wait complete, continuing workflow`);
    
    return {
      output: {
        json: {
          waited: waitTime,
          resumedAt: new Date().toISOString(),
          passedData: inputData?.json || {}
        }
      },
      items: 1,
      logs
    };
  }

  // Default/generic node
  logs.push(`⚙️ Initializing ${node.name}...`);
  await new Promise(resolve => setTimeout(resolve, 400));
  logs.push(`🔄 Processing node logic...`);
  await new Promise(resolve => setTimeout(resolve, 500));
  logs.push(`✅ Node executed successfully`);
  
  return {
    output: {
      json: {
        nodeType: node.type,
        nodeName: node.name,
        processedInput: inputData?.json || null,
        result: "success",
        timestamp: new Date().toISOString()
      }
    },
    items: 1,
    logs
  };
};

export const useWorkflowAgentEngine = (workflow: N8nWorkflow | null) => {
  const [state, setState] = useState<WorkflowExecutionState>({
    status: "idle",
    currentNode: null,
    nodeStatuses: {},
    nodeOutputs: {},
    nodeExecutionTimes: {},
    executionResults: [],
    totalTime: 0,
    finalOutput: null
  });

  const resetExecution = useCallback(() => {
    setState({
      status: "idle",
      currentNode: null,
      nodeStatuses: {},
      nodeOutputs: {},
      nodeExecutionTimes: {},
      executionResults: [],
      totalTime: 0,
      finalOutput: null
    });
  }, []);

  const executeWorkflow = useCallback(async (
    onNodeStart?: (nodeName: string) => void,
    onNodeComplete?: (nodeName: string, result: ExecutionResult) => void,
    onLog?: (message: string) => void
  ) => {
    if (!workflow?.nodes?.length) {
      return;
    }

    const nodes = workflow.nodes;
    const connections = workflow.connections || {};
    
    // Build execution order
    const hasIncoming = new Set<string>();
    Object.values(connections).forEach(targets => {
      targets.main?.forEach(mainConns => {
        mainConns.forEach(conn => {
          hasIncoming.add(conn.node);
        });
      });
    });
    
    const nodeNames = nodes.map(n => n.name);
    const startNodes = nodeNames.filter(name => !hasIncoming.has(name));
    const visited = new Set<string>();
    const executionOrder: string[] = [];
    
    const visit = (nodeName: string) => {
      if (visited.has(nodeName)) return;
      visited.add(nodeName);
      executionOrder.push(nodeName);
      const nodeConnections = connections[nodeName]?.main?.[0] || [];
      nodeConnections.forEach(conn => visit(conn.node));
    };
    
    startNodes.forEach(visit);
    nodeNames.forEach(name => {
      if (!visited.has(name)) executionOrder.push(name);
    });

    // Initialize
    const initialStatuses: Record<string, "pending" | "running" | "completed" | "error"> = {};
    nodes.forEach(node => {
      initialStatuses[node.name] = "pending";
    });

    setState(prev => ({
      ...prev,
      status: "running",
      nodeStatuses: initialStatuses,
      nodeOutputs: {},
      nodeExecutionTimes: {},
      executionResults: [],
      totalTime: 0,
      finalOutput: null
    }));

    onLog?.("🚀 Starting workflow agent execution...");
    onLog?.(`📋 Workflow: ${executionOrder.length} nodes to execute`);
    onLog?.(`🔗 Execution order: ${executionOrder.join(" → ")}`);
    onLog?.("");

    const startTime = Date.now();
    const nodeOutputs: Record<string, any> = {};
    const nodeExecutionTimes: Record<string, number> = {};
    const executionResults: ExecutionResult[] = [];
    let lastOutput: any = null;

    for (const nodeName of executionOrder) {
      const node = nodes.find(n => n.name === nodeName);
      if (!node) continue;

      // Find input data from connected nodes
      let inputData: any = null;
      for (const [fromNode, targets] of Object.entries(connections)) {
        const isConnected = targets.main?.some(mainConns => 
          mainConns.some(conn => conn.node === nodeName)
        );
        if (isConnected && nodeOutputs[fromNode]) {
          inputData = nodeOutputs[fromNode];
          break;
        }
      }

      // Update state - node running
      setState(prev => ({
        ...prev,
        currentNode: nodeName,
        nodeStatuses: { ...prev.nodeStatuses, [nodeName]: "running" }
      }));

      onNodeStart?.(nodeName);
      onLog?.(`⏳ Executing: ${nodeName} (${node.type.split('.').pop()})`);

      const nodeStartTime = Date.now();
      
      try {
        const result = await executeNode(node, inputData, nodeOutputs);
        const executionTime = Date.now() - nodeStartTime;
        
        nodeOutputs[nodeName] = result.output;
        nodeExecutionTimes[nodeName] = executionTime;
        lastOutput = result.output;

        const execResult: ExecutionResult = {
          success: true,
          nodeName,
          nodeType: node.type,
          executionTime,
          inputData,
          outputData: result.output,
          itemCount: result.items,
          logs: result.logs
        };
        executionResults.push(execResult);

        // Log node execution details
        result.logs.forEach(log => onLog?.(`   ${log}`));
        onLog?.(`✅ Completed: ${nodeName} → ${result.items} item(s) in ${executionTime}ms`);
        onLog?.("");

        // Update state - node completed
        setState(prev => ({
          ...prev,
          nodeStatuses: { ...prev.nodeStatuses, [nodeName]: "completed" },
          nodeOutputs: { ...nodeOutputs },
          nodeExecutionTimes: { ...nodeExecutionTimes },
          executionResults: [...executionResults],
          totalTime: Date.now() - startTime
        }));

        onNodeComplete?.(nodeName, execResult);

      } catch (error) {
        onLog?.(`❌ Error in ${nodeName}: ${error}`);
        setState(prev => ({
          ...prev,
          status: "error",
          nodeStatuses: { ...prev.nodeStatuses, [nodeName]: "error" }
        }));
        return;
      }
    }

    const totalTime = Date.now() - startTime;
    
    onLog?.("═".repeat(50));
    onLog?.(`🎉 Workflow completed successfully!`);
    onLog?.(`⏱️ Total execution time: ${(totalTime / 1000).toFixed(2)}s`);
    onLog?.(`📊 Nodes executed: ${executionOrder.length}`);
    onLog?.(`📦 Final output items: ${lastOutput?.json ? 1 : 0}`);

    setState(prev => ({
      ...prev,
      status: "completed",
      currentNode: null,
      totalTime,
      finalOutput: lastOutput
    }));

  }, [workflow]);

  return {
    state,
    executeWorkflow,
    resetExecution
  };
};

export type { ExecutionResult, WorkflowExecutionState, N8nNode, N8nWorkflow };
