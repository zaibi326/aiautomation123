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

// Simulate node execution based on type and input data
const executeNode = async (
  node: N8nNode,
  inputData: any,
  previousOutputs: Record<string, any>
): Promise<{ output: any; items: number; logs: string[] }> => {
  const nodeType = node.type.toLowerCase();
  const params = node.parameters || {};
  const logs: string[] = [];
  
  // Add realistic processing delay
  const processingTime = 200 + Math.random() * 800;
  await new Promise(resolve => setTimeout(resolve, processingTime));

  // Trigger nodes - start the workflow
  if (nodeType.includes("trigger") || nodeType.includes("webhook") || nodeType.includes("manual") || nodeType.includes("start")) {
    logs.push(`🔔 Trigger activated: ${node.name}`);
    logs.push(`📥 Received incoming request`);
    return {
      output: {
        json: {
          triggerTime: new Date().toISOString(),
          workflowId: "wf_" + Math.random().toString(36).substr(2, 9),
          source: "manual_trigger",
          headers: {
            "content-type": "application/json",
            "user-agent": "n8n-workflow-engine"
          },
          body: inputData || { event: "workflow_started" }
        }
      },
      items: 1,
      logs
    };
  }

  // HTTP Request nodes
  if (nodeType.includes("httprequest") || nodeType.includes("http")) {
    const url = params.url || "https://api.example.com/data";
    logs.push(`🌐 Making HTTP request to: ${url}`);
    logs.push(`📊 Response status: 200 OK`);
    return {
      output: {
        json: {
          statusCode: 200,
          data: [
            { id: 1, name: "Item A", value: Math.floor(Math.random() * 1000), status: "active" },
            { id: 2, name: "Item B", value: Math.floor(Math.random() * 1000), status: "pending" },
            { id: 3, name: "Item C", value: Math.floor(Math.random() * 1000), status: "active" }
          ],
          headers: { "content-type": "application/json" },
          requestUrl: url
        }
      },
      items: 3,
      logs
    };
  }

  // Gmail/Email nodes
  if (nodeType.includes("gmail") || nodeType.includes("email") || nodeType.includes("mail")) {
    const to = params.to || "user@example.com";
    logs.push(`📧 Sending email to: ${to}`);
    logs.push(`✉️ Email sent successfully`);
    return {
      output: {
        json: {
          messageId: "msg_" + Math.random().toString(36).substr(2, 12),
          to: to,
          subject: params.subject || "Workflow Notification",
          status: "sent",
          sentAt: new Date().toISOString()
        }
      },
      items: 1,
      logs
    };
  }

  // Google Sheets nodes
  if (nodeType.includes("googlesheets") || nodeType.includes("sheets") || nodeType.includes("spreadsheet")) {
    logs.push(`📊 Accessing Google Sheets...`);
    logs.push(`📝 Data written to spreadsheet`);
    return {
      output: {
        json: {
          spreadsheetId: "1BxiM" + Math.random().toString(36).substr(2, 6),
          sheetName: "Sheet1",
          range: "A1:D10",
          rowsUpdated: 5,
          values: inputData?.json?.data || [["Name", "Email", "Status"]]
        }
      },
      items: 5,
      logs
    };
  }

  // Slack nodes
  if (nodeType.includes("slack")) {
    const channel = params.channel || "#general";
    logs.push(`💬 Posting to Slack channel: ${channel}`);
    logs.push(`✅ Message posted successfully`);
    return {
      output: {
        json: {
          ok: true,
          channel: channel,
          ts: Date.now().toString(),
          message: params.text || "Workflow notification",
          messageId: "slack_" + Math.random().toString(36).substr(2, 8)
        }
      },
      items: 1,
      logs
    };
  }

  // Telegram nodes
  if (nodeType.includes("telegram")) {
    logs.push(`📱 Sending Telegram message...`);
    logs.push(`✅ Message delivered`);
    return {
      output: {
        json: {
          chat_id: Math.floor(Math.random() * 1000000000),
          message_id: Math.floor(Math.random() * 10000),
          text: params.text || "Workflow notification",
          sent: true,
          date: new Date().toISOString()
        }
      },
      items: 1,
      logs
    };
  }

  // WhatsApp nodes
  if (nodeType.includes("whatsapp")) {
    logs.push(`📱 Sending WhatsApp message...`);
    logs.push(`✅ Message delivered`);
    return {
      output: {
        json: {
          messaging_product: "whatsapp",
          contacts: [{ input: params.phone || "+1234567890", wa_id: "1234567890" }],
          messages: [{ id: "wamid." + Math.random().toString(36).substr(2, 16) }]
        }
      },
      items: 1,
      logs
    };
  }

  // OpenAI/AI nodes
  if (nodeType.includes("openai") || nodeType.includes("ai") || nodeType.includes("gpt") || nodeType.includes("claude")) {
    logs.push(`🤖 Processing with AI model...`);
    logs.push(`💡 AI response generated`);
    
    const inputContext = inputData?.json?.data ? JSON.stringify(inputData.json.data).slice(0, 100) : "workflow data";
    return {
      output: {
        json: {
          model: "gpt-4",
          response: `Based on the analysis of ${inputContext}, I recommend the following actions: 1) Optimize the current workflow, 2) Review data quality, 3) Implement monitoring.`,
          usage: {
            prompt_tokens: Math.floor(Math.random() * 500) + 100,
            completion_tokens: Math.floor(Math.random() * 200) + 50,
            total_tokens: Math.floor(Math.random() * 700) + 150
          },
          finish_reason: "stop"
        }
      },
      items: 1,
      logs
    };
  }

  // Code/Function nodes
  if (nodeType.includes("code") || nodeType.includes("function") || nodeType.includes("javascript")) {
    logs.push(`💻 Executing custom code...`);
    logs.push(`⚡ Code executed successfully`);
    
    const processedData = inputData?.json?.data?.map?.((item: any, idx: number) => ({
      ...item,
      processed: true,
      transformedId: `PROC_${idx + 1}_${item.id || idx}`,
      processedAt: new Date().toISOString()
    })) || [{ processed: true, result: "code_executed" }];
    
    return {
      output: {
        json: {
          items: processedData,
          executionTime: Date.now(),
          codeVersion: "1.0.0"
        }
      },
      items: Array.isArray(processedData) ? processedData.length : 1,
      logs
    };
  }

  // IF/Switch nodes
  if (nodeType.includes("if") || nodeType.includes("switch") || nodeType.includes("condition")) {
    logs.push(`🔀 Evaluating condition...`);
    const condition = Math.random() > 0.5;
    logs.push(`📊 Condition result: ${condition ? "TRUE" : "FALSE"}`);
    return {
      output: {
        json: {
          condition: params.condition || "value > 0",
          result: condition,
          branch: condition ? "true" : "false",
          evaluatedAt: new Date().toISOString()
        }
      },
      items: 1,
      logs
    };
  }

  // Merge nodes
  if (nodeType.includes("merge") || nodeType.includes("join")) {
    logs.push(`🔗 Merging data from multiple sources...`);
    logs.push(`✅ Data merged successfully`);
    
    const mergedData = Object.values(previousOutputs).reduce((acc: any[], output: any) => {
      if (output?.json?.data) {
        return [...acc, ...output.json.data];
      } else if (output?.json) {
        return [...acc, output.json];
      }
      return acc;
    }, []);
    
    return {
      output: {
        json: {
          mergedItems: mergedData.length || 2,
          sources: Object.keys(previousOutputs).length,
          mode: params.mode || "append",
          data: mergedData.length > 0 ? mergedData : [{ merged: true, source: "multiple" }]
        }
      },
      items: mergedData.length || 2,
      logs
    };
  }

  // Set/Transform nodes
  if (nodeType.includes("set") || nodeType.includes("transform") || nodeType.includes("edit")) {
    logs.push(`📝 Setting/transforming data...`);
    logs.push(`✅ Data transformed`);
    return {
      output: {
        json: {
          ...(inputData?.json || {}),
          transformed: true,
          setFields: params.values || { field1: "value1" },
          transformedAt: new Date().toISOString()
        }
      },
      items: 1,
      logs
    };
  }

  // Notion nodes
  if (nodeType.includes("notion")) {
    logs.push(`📔 Creating Notion page...`);
    logs.push(`✅ Page created successfully`);
    return {
      output: {
        json: {
          object: "page",
          id: "notion_" + Math.random().toString(36).substr(2, 12),
          title: params.title || "New Entry",
          url: "https://notion.so/...",
          created_time: new Date().toISOString()
        }
      },
      items: 1,
      logs
    };
  }

  // Airtable nodes
  if (nodeType.includes("airtable")) {
    logs.push(`📋 Updating Airtable...`);
    logs.push(`✅ Record updated`);
    return {
      output: {
        json: {
          id: "rec" + Math.random().toString(36).substr(2, 14),
          fields: inputData?.json || { Name: "New Record" },
          createdTime: new Date().toISOString()
        }
      },
      items: 1,
      logs
    };
  }

  // Discord nodes
  if (nodeType.includes("discord")) {
    logs.push(`🎮 Sending Discord message...`);
    logs.push(`✅ Message sent to channel`);
    return {
      output: {
        json: {
          id: "discord_" + Math.random().toString(36).substr(2, 18),
          channel_id: params.channelId || "123456789",
          content: params.content || "Workflow notification",
          timestamp: new Date().toISOString()
        }
      },
      items: 1,
      logs
    };
  }

  // Default/generic node
  logs.push(`⚙️ Processing ${node.name}...`);
  logs.push(`✅ Node executed`);
  return {
    output: {
      json: {
        nodeType: node.type,
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
