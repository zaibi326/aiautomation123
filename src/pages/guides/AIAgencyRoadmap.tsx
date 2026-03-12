import { GuidePageLayout, StepCard, InfoCard } from "@/components/GuidePageLayout";
import { Map, Target, Users, Briefcase, TrendingUp, Rocket, Globe, DollarSign } from "lucide-react";

const AIAgencyRoadmap = () => (
  <GuidePageLayout
    title="AI Agency Roadmap"
    subtitle="A complete step-by-step guide to building your AI automation agency from zero"
    icon={<Map className="w-7 h-7 text-white" />}
    gradient="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900"
  >
    {/* Overview Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <InfoCard icon={<Target className="w-6 h-6 text-primary" />} title="Find Your Niche" description="Identify the perfect market segment where AI automation creates the most value for businesses." />
      <InfoCard icon={<Users className="w-6 h-6 text-primary" />} title="Get Clients" description="Proven strategies to land your first 10 clients using outreach, content marketing, and referrals." />
      <InfoCard icon={<TrendingUp className="w-6 h-6 text-primary" />} title="Scale to $10K/mo" description="Systems and processes to scale your agency beyond $10,000 monthly recurring revenue." />
    </div>

    <h2 className="text-2xl font-bold text-foreground mb-8">The Roadmap</h2>
    <div className="space-y-0">
      <StepCard step={1} title="Choose Your Agency Model" description="Decide between done-for-you services, productized services, or a hybrid model. Each has different revenue potential and time requirements." tips={["Done-for-you: Higher revenue per client, more time-intensive", "Productized: Scalable, lower per-client revenue, easier to systematize", "Consider starting productized then adding custom services"]} icon={<Briefcase className="w-5 h-5 text-primary" />} />
      <StepCard step={2} title="Master Core AI Tools" description="Build expertise in n8n, Make.com, Zapier, and AI APIs. Focus on workflows that solve real business problems like lead generation, customer support, and data processing." tips={["Start with n8n for maximum flexibility", "Learn OpenAI, Claude, and Gemini APIs", "Build 5-10 portfolio workflows before reaching out to clients"]} icon={<Rocket className="w-5 h-5 text-primary" />} />
      <StepCard step={3} title="Build Your Online Presence" description="Create a professional website, LinkedIn profile, and social media presence that showcases your AI automation expertise." tips={["Share workflow demos and case studies weekly", "Create educational content about AI automation", "Join AI automation communities and contribute value"]} icon={<Globe className="w-5 h-5 text-primary" />} />
      <StepCard step={4} title="Land Your First Clients" description="Use cold outreach, warm referrals, and content marketing to get your first paying clients. Offer a free audit to get your foot in the door." tips={["Send 20+ personalized outreach messages daily", "Offer a free AI automation audit to prospects", "Focus on industries with high manual work: real estate, e-commerce, marketing"]} icon={<Users className="w-5 h-5 text-primary" />} />
      <StepCard step={5} title="Deliver & Systematize" description="Create SOPs, templates, and repeatable processes so you can deliver results consistently while freeing up your time." tips={["Document every workflow you build", "Create client onboarding templates", "Build a library of reusable automation components"]} icon={<Target className="w-5 h-5 text-primary" />} />
      <StepCard step={6} title="Scale Revenue" description="Raise prices, add team members, upsell existing clients, and build recurring revenue through maintenance retainers." tips={["Charge $1,500-5,000+ per automation project", "Add $300-1,000/mo maintenance retainers", "Hire contractors to handle delivery while you focus on sales"]} icon={<DollarSign className="w-5 h-5 text-primary" />} />
    </div>
  </GuidePageLayout>
);

export default AIAgencyRoadmap;
