import { GuidePageLayout, StepCard, InfoCard } from "@/components/GuidePageLayout";
import { DollarSign, TrendingUp, Briefcase, ShoppingCart, Mail, Bot, BarChart3, Layers } from "lucide-react";

const AutomationMoneyMaking = () => (
  <GuidePageLayout
    title="Automation Money-Making"
    subtitle="Proven strategies to monetize AI automation skills and build passive income"
    icon={<DollarSign className="w-7 h-7 text-white" />}
    gradient="bg-gradient-to-br from-amber-900 via-orange-900 to-red-900"
  >
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <InfoCard icon={<Briefcase className="w-6 h-6 text-primary" />} title="Freelancing" description="Earn $2K-10K/month building automations for businesses on Upwork and Fiverr." />
      <InfoCard icon={<ShoppingCart className="w-6 h-6 text-primary" />} title="Sell Templates" description="Create and sell n8n/Make workflow templates as digital products." />
      <InfoCard icon={<Bot className="w-6 h-6 text-primary" />} title="AI SaaS" description="Build micro-SaaS products powered by AI automation workflows." />
      <InfoCard icon={<TrendingUp className="w-6 h-6 text-primary" />} title="Consulting" description="Charge $150-500/hr for AI automation strategy consulting." />
    </div>

    <h2 className="text-2xl font-bold text-foreground mb-8">Money-Making Strategies</h2>
    <div className="space-y-0">
      <StepCard step={1} title="Freelance Automation Services" description="Start on platforms like Upwork, Fiverr, and Contra. Build automations for clients who need lead generation, data processing, or AI-powered workflows." tips={["Create a killer profile showcasing 3-5 portfolio projects", "Start at $50-100/hr and raise prices as you get reviews", "Focus on recurring automation maintenance contracts", "Target e-commerce, real estate, and marketing agencies"]} icon={<Briefcase className="w-5 h-5 text-primary" />} />
      <StepCard step={2} title="Sell Workflow Templates" description="Package your best automations as templates and sell them on Gumroad, your website, or automation marketplaces. Each template can generate passive income." tips={["Price templates at $29-199 depending on complexity", "Create bundles of related templates for higher AOV", "Add video tutorials to increase perceived value", "Update templates regularly to maintain sales"]} icon={<ShoppingCart className="w-5 h-5 text-primary" />} />
      <StepCard step={3} title="Build AI Micro-SaaS" description="Use automation tools to build small SaaS products that solve specific problems. Examples: AI email writer, social media scheduler, lead scorer." tips={["Validate the idea before building—talk to 20+ potential users", "Use n8n + Supabase to build the backend", "Charge $29-99/month per user", "Focus on one niche problem, not a feature-packed product"]} icon={<Bot className="w-5 h-5 text-primary" />} />
      <StepCard step={4} title="Content & Affiliate Income" description="Create YouTube tutorials, blog posts, and courses about AI automation. Monetize through ads, sponsorships, and affiliate commissions." tips={["Review AI tools and include affiliate links", "Create 'How I automated X' style content", "Build an email list for product launches", "Offer paid workshops and cohort courses"]} icon={<Mail className="w-5 h-5 text-primary" />} />
      <StepCard step={5} title="Agency Retainers" description="The most lucrative model: charge businesses $1,000-5,000/month to manage and optimize their automation stack on a retainer basis." tips={["Offer a free audit to get your foot in the door", "Bundle: setup ($2K-5K one-time) + maintenance ($500-2K/mo)", "Upsell new automations to existing retainer clients", "Document everything to delegate delivery over time"]} icon={<BarChart3 className="w-5 h-5 text-primary" />} />
      <StepCard step={6} title="Stack Multiple Income Streams" description="The real secret: combine 2-3 of these strategies. Freelance to learn, build templates from client work, and create content from your experience." tips={["Week 1-4: Land first freelance client", "Month 2-3: Package 5 templates from client work", "Month 4-6: Start YouTube channel documenting your journey", "Month 6-12: Launch micro-SaaS based on market gaps you've discovered"]} icon={<Layers className="w-5 h-5 text-primary" />} />
    </div>
  </GuidePageLayout>
);

export default AutomationMoneyMaking;
