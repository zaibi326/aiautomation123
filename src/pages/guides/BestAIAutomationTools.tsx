import { GuidePageLayout, InfoCard } from "@/components/GuidePageLayout";
import { Wrench, Zap, Brain, Database, MessageSquare, Image, Code, BarChart3, Globe, Mail, Bot, Layers } from "lucide-react";

const tools = [
  { icon: <Zap className="w-6 h-6 text-primary" />, title: "n8n", description: "Open-source workflow automation. Self-hostable, 400+ integrations, perfect for complex multi-step automations. The backbone of most AI agencies." },
  { icon: <Layers className="w-6 h-6 text-primary" />, title: "Make.com (Integromat)", description: "Visual automation builder with excellent UI. Great for beginners and mid-level automations. Generous free tier for testing." },
  { icon: <Bot className="w-6 h-6 text-primary" />, title: "Zapier", description: "The most popular automation tool. 6,000+ app integrations. Best for simple trigger-action automations. Easy to use but can get expensive." },
  { icon: <Brain className="w-6 h-6 text-primary" />, title: "OpenAI API", description: "GPT-4, GPT-4o, DALL-E, Whisper. Essential for text generation, analysis, image creation, and speech-to-text in your automations." },
  { icon: <Brain className="w-6 h-6 text-primary" />, title: "Claude API (Anthropic)", description: "Excellent for long-form content, analysis, and coding tasks. 200K context window makes it ideal for document processing." },
  { icon: <Brain className="w-6 h-6 text-primary" />, title: "Google Gemini", description: "Multimodal AI that handles text, images, video, and code. Great free tier. Ideal for vision-based automations." },
  { icon: <Database className="w-6 h-6 text-primary" />, title: "Supabase", description: "Open-source Firebase alternative. Postgres database, auth, storage, and edge functions. Perfect backend for AI-powered apps." },
  { icon: <Database className="w-6 h-6 text-primary" />, title: "Airtable", description: "Spreadsheet-database hybrid. Great for managing client data, CRM, and as a backend for automations. Excellent API." },
  { icon: <MessageSquare className="w-6 h-6 text-primary" />, title: "Voiceflow / Botpress", description: "Build AI chatbots and voice assistants. Integrate with your automation workflows for customer support and lead capture." },
  { icon: <Image className="w-6 h-6 text-primary" />, title: "Midjourney / DALL-E", description: "AI image generation tools. Automate social media graphics, ad creatives, and product images for clients." },
  { icon: <Code className="w-6 h-6 text-primary" />, title: "Relevance AI", description: "Build AI agents and chains without code. Connect to your existing tools and data. Great for complex AI workflows." },
  { icon: <Mail className="w-6 h-6 text-primary" />, title: "Instantly / Lemlist", description: "AI-powered cold email tools. Automate personalized outreach at scale. Essential for agency lead generation." },
  { icon: <Globe className="w-6 h-6 text-primary" />, title: "Apify / Bright Data", description: "Web scraping and data extraction platforms. Feed real-time web data into your AI automations." },
  { icon: <BarChart3 className="w-6 h-6 text-primary" />, title: "Phantom Buster", description: "LinkedIn and social media automation. Extract leads, automate connections, and scrape profiles for outreach campaigns." },
  { icon: <Wrench className="w-6 h-6 text-primary" />, title: "Flowise AI", description: "Open-source low-code tool to build LLM apps. Drag-and-drop interface for creating AI agents and RAG pipelines." },
  { icon: <Wrench className="w-6 h-6 text-primary" />, title: "Langflow", description: "Visual framework for building multi-agent RAG applications. Great companion to n8n for complex AI systems." },
];

const BestAIAutomationTools = () => (
  <GuidePageLayout
    title="Best AI Automation Tools"
    subtitle="The definitive guide to every tool you need to build and scale AI automations"
    icon={<Wrench className="w-7 h-7 text-white" />}
    gradient="bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900"
  >
    <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
      These are the tools that top AI automation agencies use daily. Master these and you'll be able to build virtually any automation your clients need.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <InfoCard key={tool.title} icon={tool.icon} title={tool.title} description={tool.description} />
      ))}
    </div>

    <div className="mt-12 bg-card border border-border rounded-2xl p-8">
      <h2 className="text-xl font-bold text-foreground mb-4">🎯 Recommended Starter Stack</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <p className="text-muted-foreground"><span className="text-primary font-medium">Automation:</span> n8n (self-hosted) + Make.com (backup)</p>
          <p className="text-muted-foreground"><span className="text-primary font-medium">AI Models:</span> OpenAI GPT-4o + Claude for long content</p>
          <p className="text-muted-foreground"><span className="text-primary font-medium">Database:</span> Supabase + Airtable for client-facing</p>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground"><span className="text-primary font-medium">Chatbots:</span> Voiceflow or Botpress</p>
          <p className="text-muted-foreground"><span className="text-primary font-medium">Outreach:</span> Instantly + PhantomBuster</p>
          <p className="text-muted-foreground"><span className="text-primary font-medium">Scraping:</span> Apify for data extraction</p>
        </div>
      </div>
    </div>
  </GuidePageLayout>
);

export default BestAIAutomationTools;
