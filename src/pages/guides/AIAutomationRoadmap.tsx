import { GuidePageLayout, StepCard, InfoCard } from "@/components/GuidePageLayout";
import { TrendingUp, BookOpen, Code, Cpu, Workflow, Award, Lightbulb, GraduationCap } from "lucide-react";

const AIAutomationRoadmap = () => (
  <GuidePageLayout
    title="AI Automation Roadmap"
    subtitle="Master AI automation from beginner to expert — your complete learning path"
    icon={<TrendingUp className="w-7 h-7 text-white" />}
    gradient="bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <InfoCard icon={<BookOpen className="w-6 h-6 text-primary" />} title="Beginner (0-3 Months)" description="Learn the basics of automation platforms, simple workflows, and AI fundamentals." />
      <InfoCard icon={<Code className="w-6 h-6 text-primary" />} title="Intermediate (3-6 Months)" description="Build complex multi-step automations, integrate AI APIs, and handle errors gracefully." />
      <InfoCard icon={<Award className="w-6 h-6 text-primary" />} title="Expert (6-12 Months)" description="Design enterprise-grade systems, build AI agents, and create scalable automation architectures." />
    </div>

    <h2 className="text-2xl font-bold text-foreground mb-8">Learning Path</h2>
    <div className="space-y-0">
      <StepCard step={1} title="Month 1: Automation Fundamentals" description="Understand what automation is, why it matters, and learn your first platform. Build 10 simple automations to get comfortable." tips={["Complete n8n or Make.com beginner tutorials", "Build: email notification, data sync, simple chatbot", "Understand triggers, actions, and conditions", "Learn basic API concepts: GET, POST, authentication"]} icon={<BookOpen className="w-5 h-5 text-primary" />} />
      <StepCard step={2} title="Month 2-3: AI Integration" description="Learn to integrate AI models (OpenAI, Claude, Gemini) into your automations. Build workflows that generate, analyze, and transform content using AI." tips={["Set up OpenAI API and make your first API call", "Build an AI-powered email responder", "Create a document summarizer workflow", "Learn prompt engineering for consistent AI outputs"]} icon={<Cpu className="w-5 h-5 text-primary" />} />
      <StepCard step={3} title="Month 3-4: Advanced Workflows" description="Master error handling, branching logic, loops, and sub-workflows. Build production-ready automations that handle edge cases." tips={["Implement retry logic and error notifications", "Use variables and expressions for dynamic data", "Build multi-branch conditional workflows", "Learn webhook-based real-time automations"]} icon={<Workflow className="w-5 h-5 text-primary" />} />
      <StepCard step={4} title="Month 4-6: Database & Backend" description="Connect automations to databases (Supabase, Airtable). Build full-stack automation solutions with data persistence and user management." tips={["Learn SQL basics for database queries", "Build a CRM automation with Supabase", "Create API endpoints that trigger automations", "Implement user authentication flows"]} icon={<Code className="w-5 h-5 text-primary" />} />
      <StepCard step={5} title="Month 6-9: AI Agents & RAG" description="Build autonomous AI agents that can reason, use tools, and complete complex tasks. Implement RAG (Retrieval Augmented Generation) for domain-specific AI." tips={["Build a multi-tool AI agent using n8n", "Implement RAG with vector databases (Pinecone, Supabase)", "Create AI agents that interact with external APIs", "Learn about agent architectures and planning"]} icon={<Lightbulb className="w-5 h-5 text-primary" />} />
      <StepCard step={6} title="Month 9-12: Enterprise & Scale" description="Design systems that handle thousands of executions daily. Learn monitoring, observability, and cost optimization for production AI systems." tips={["Implement monitoring and alerting for automations", "Optimize costs: caching, batching, model selection", "Build multi-agent systems for complex workflows", "Create documentation and SOPs for your solutions"]} icon={<GraduationCap className="w-5 h-5 text-primary" />} />
    </div>
  </GuidePageLayout>
);

export default AIAutomationRoadmap;
