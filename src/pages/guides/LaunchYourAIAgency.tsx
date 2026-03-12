import { GuidePageLayout, StepCard, InfoCard } from "@/components/GuidePageLayout";
import { Rocket, FileText, Users, DollarSign, Target, Shield, MessageSquare, BarChart3 } from "lucide-react";

const LaunchYourAIAgency = () => (
  <GuidePageLayout
    title="Launch Your AI Agency"
    subtitle="Everything you need to go from idea to your first paying client in 30 days"
    icon={<Rocket className="w-7 h-7 text-white" />}
    gradient="bg-gradient-to-br from-rose-900 via-pink-900 to-fuchsia-900"
  >
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <InfoCard icon={<FileText className="w-6 h-6 text-primary" />} title="Business Setup" description="Legal structure, contracts, and invoicing—the unsexy but essential stuff." />
      <InfoCard icon={<Target className="w-6 h-6 text-primary" />} title="Positioning" description="Craft an irresistible offer that makes prospects say 'take my money'." />
      <InfoCard icon={<MessageSquare className="w-6 h-6 text-primary" />} title="Sales System" description="Scripts, templates, and frameworks to close deals consistently." />
      <InfoCard icon={<BarChart3 className="w-6 h-6 text-primary" />} title="Delivery System" description="SOPs and frameworks to deliver 5-star results every time." />
    </div>

    <h2 className="text-2xl font-bold text-foreground mb-8">30-Day Launch Plan</h2>
    <div className="space-y-0">
      <StepCard step={1} title="Week 1: Foundation & Positioning" description="Define your niche, ideal client avatar, and core service offering. Set up your business entity, basic contracts, and invoicing system." tips={["Pick ONE niche: e-commerce, real estate, SaaS, marketing agencies", "Write your positioning statement: 'I help [niche] do [outcome] using AI automation'", "Set up LLC/sole proprietorship + business bank account", "Create a simple contract template (use Bonsai or PandaDoc)"]} icon={<Shield className="w-5 h-5 text-primary" />} />
      <StepCard step={2} title="Week 2: Build Your Arsenal" description="Create 3-5 demo automations that solve real problems in your niche. Record Loom videos demonstrating each workflow." tips={["Build a lead generation automation for your niche", "Create a customer onboarding automation", "Build an AI content generation workflow", "Record 2-3 minute Loom demos of each"]} icon={<Target className="w-5 h-5 text-primary" />} />
      <StepCard step={3} title="Week 3: Outreach Blitz" description="Launch an aggressive outreach campaign. Send 50+ personalized messages per day across LinkedIn, email, and Twitter." tips={["Use LinkedIn Sales Navigator to find decision makers", "Send personalized Loom videos showing their specific pain points", "Offer a free AI automation audit (30 min call)", "Follow up 3-5 times—most deals close after the 3rd touchpoint"]} icon={<Users className="w-5 h-5 text-primary" />} />
      <StepCard step={4} title="Week 4: Close & Deliver" description="Convert audit calls into paying projects. Deliver exceptional results on your first project—this client becomes your case study and referral source." tips={["Price your first project at $1,500-3,000 to reduce friction", "Over-deliver: include bonus automations and documentation", "Ask for a testimonial and case study permission", "Upsell a monthly maintenance retainer ($500-1,500/mo)"]} icon={<DollarSign className="w-5 h-5 text-primary" />} />
    </div>

    <div className="mt-12 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8">
      <h3 className="text-xl font-bold text-foreground mb-3">💡 Pro Tip: The Referral Flywheel</h3>
      <p className="text-muted-foreground leading-relaxed">
        After delivering great results for your first client, ask them to refer you to 2-3 other business owners. 
        Offer a referral bonus (10% of the first project value). This creates a compounding growth loop that can 
        take you from 1 client to 10+ within 90 days without spending a dime on advertising.
      </p>
    </div>
  </GuidePageLayout>
);

export default LaunchYourAIAgency;
