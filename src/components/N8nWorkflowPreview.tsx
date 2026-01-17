import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface N8nNode {
  id?: string;
  name: string;
  type: string;
  position: [number, number];
  parameters?: Record<string, any>;
}

interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

interface N8nWorkflow {
  nodes?: N8nNode[];
  connections?: Record<string, { main?: N8nConnection[][] }>;
}

interface N8nWorkflowPreviewProps {
  json: any;
  className?: string;
  compact?: boolean;
  highlighted?: boolean;
}

// Map n8n node types to colors and icons
const getNodeStyle = (type: string): { bg: string; border: string; icon: string } => {
  const typeMap: Record<string, { bg: string; border: string; icon: string }> = {
    "n8n-nodes-base.webhook": { bg: "bg-purple-500/20", border: "border-purple-500", icon: "🔗" },
    "n8n-nodes-base.httpRequest": { bg: "bg-blue-500/20", border: "border-blue-500", icon: "🌐" },
    "n8n-nodes-base.gmail": { bg: "bg-red-500/20", border: "border-red-500", icon: "📧" },
    "n8n-nodes-base.googleSheets": { bg: "bg-green-500/20", border: "border-green-500", icon: "📊" },
    "n8n-nodes-base.slack": { bg: "bg-violet-500/20", border: "border-violet-500", icon: "💬" },
    "n8n-nodes-base.telegram": { bg: "bg-sky-500/20", border: "border-sky-500", icon: "✈️" },
    "n8n-nodes-base.discord": { bg: "bg-indigo-500/20", border: "border-indigo-500", icon: "🎮" },
    "n8n-nodes-base.openAi": { bg: "bg-emerald-500/20", border: "border-emerald-500", icon: "🤖" },
    "n8n-nodes-base.code": { bg: "bg-yellow-500/20", border: "border-yellow-500", icon: "💻" },
    "n8n-nodes-base.function": { bg: "bg-orange-500/20", border: "border-orange-500", icon: "⚡" },
    "n8n-nodes-base.if": { bg: "bg-amber-500/20", border: "border-amber-500", icon: "🔀" },
    "n8n-nodes-base.switch": { bg: "bg-amber-500/20", border: "border-amber-500", icon: "🔀" },
    "n8n-nodes-base.merge": { bg: "bg-teal-500/20", border: "border-teal-500", icon: "🔗" },
    "n8n-nodes-base.set": { bg: "bg-cyan-500/20", border: "border-cyan-500", icon: "📝" },
    "n8n-nodes-base.noOp": { bg: "bg-gray-500/20", border: "border-gray-500", icon: "⏸️" },
    "n8n-nodes-base.start": { bg: "bg-green-500/20", border: "border-green-500", icon: "▶️" },
    "n8n-nodes-base.cron": { bg: "bg-pink-500/20", border: "border-pink-500", icon: "⏰" },
    "n8n-nodes-base.scheduleTrigger": { bg: "bg-pink-500/20", border: "border-pink-500", icon: "⏰" },
    "n8n-nodes-base.manualTrigger": { bg: "bg-green-500/20", border: "border-green-500", icon: "👆" },
    "n8n-nodes-base.whatsapp": { bg: "bg-green-600/20", border: "border-green-600", icon: "📱" },
    "n8n-nodes-base.notion": { bg: "bg-neutral-500/20", border: "border-neutral-500", icon: "📔" },
    "n8n-nodes-base.airtable": { bg: "bg-blue-600/20", border: "border-blue-600", icon: "📋" },
    "n8n-nodes-base.mysql": { bg: "bg-blue-700/20", border: "border-blue-700", icon: "🗄️" },
    "n8n-nodes-base.postgres": { bg: "bg-blue-800/20", border: "border-blue-800", icon: "🗄️" },
    "n8n-nodes-base.mongodb": { bg: "bg-green-700/20", border: "border-green-700", icon: "🍃" },
  };

  // Check for partial matches
  const lowerType = type.toLowerCase();
  for (const [key, value] of Object.entries(typeMap)) {
    if (lowerType.includes(key.split(".")[1]?.toLowerCase() || "")) {
      return value;
    }
  }

  return typeMap[type] || { bg: "bg-primary/20", border: "border-primary", icon: "⚙️" };
};

// Extract short name from node type
const getShortType = (type: string): string => {
  const parts = type.split(".");
  const name = parts[parts.length - 1] || type;
  return name.replace(/([A-Z])/g, " $1").trim();
};

export const N8nWorkflowPreview = ({ json, className = "", compact = false, highlighted = false }: N8nWorkflowPreviewProps) => {
  const workflow = useMemo<N8nWorkflow | null>(() => {
    try {
      if (typeof json === "string") {
        return JSON.parse(json);
      }
      return json;
    } catch {
      return null;
    }
  }, [json]);

  if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
    return (
      <div className={`flex items-center justify-center p-4 text-muted-foreground text-sm ${className}`}>
        No workflow nodes found
      </div>
    );
  }

  const nodes = workflow.nodes;
  const connections = workflow.connections || {};

  // Calculate bounds
  const positions = nodes.map(n => n.position || [0, 0]);
  const minX = Math.min(...positions.map(p => p[0]));
  const minY = Math.min(...positions.map(p => p[1]));
  const maxX = Math.max(...positions.map(p => p[0]));
  const maxY = Math.max(...positions.map(p => p[1]));

  // Normalize positions
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
  const connectionLines: { from: string; to: string }[] = [];
  Object.entries(connections).forEach(([fromNode, targets]) => {
    targets.main?.forEach(mainConnections => {
      mainConnections.forEach(conn => {
        connectionLines.push({ from: fromNode, to: conn.node });
      });
    });
  });

  // Get node position by name
  const getNodePos = (name: string) => {
    const node = normalizedNodes.find(n => n.name === name);
    return node ? { x: node.x, y: node.y } : null;
  };

  const nodeWidth = compact ? 140 : 180;
  const nodeHeight = compact ? 50 : 60;

  return (
    <ScrollArea className={`${className}`}>
      <div 
        className="relative p-4"
        style={{ 
          minWidth: Math.max(width + 50, 300),
          minHeight: Math.max(height + 50, 200)
        }}
      >
        {/* SVG for connection lines */}
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

            // Bezier curve
            const midX = (startX + endX) / 2;

            return (
              <path
                key={idx}
                d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={highlighted ? "3" : "2"}
                strokeOpacity={highlighted ? "0.9" : "0.5"}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {normalizedNodes.map((node) => {
          const style = getNodeStyle(node.type);
          const shortType = getShortType(node.type);

          return (
            <div
              key={node.idx}
              className={`absolute rounded-lg border-2 ${style.bg} ${style.border} shadow-sm transition-all duration-300 ${
                highlighted ? "scale-105 shadow-lg border-opacity-100" : "hover:shadow-md"
              }`}
              style={{
                left: node.x + 20,
                top: node.y + 20,
                width: nodeWidth,
                height: nodeHeight,
              }}
            >
              <div className="flex items-center gap-2 p-2 h-full">
                <span className={`text-${compact ? "base" : "lg"}`}>{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-foreground truncate ${compact ? "text-[10px]" : "text-xs"}`}>
                    {node.name}
                  </p>
                  <p className={`text-muted-foreground truncate ${compact ? "text-[8px]" : "text-[10px]"}`}>
                    {shortType}
                  </p>
                </div>
              </div>
              {/* Connection points */}
              <div 
                className="absolute w-3 h-3 rounded-full bg-muted-foreground/30 border-2 border-background -left-1.5"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              />
              <div 
                className="absolute w-3 h-3 rounded-full bg-primary/50 border-2 border-background -right-1.5"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default N8nWorkflowPreview;
