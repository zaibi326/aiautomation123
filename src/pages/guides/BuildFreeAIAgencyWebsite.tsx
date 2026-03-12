import { GuidePageLayout, StepCard, InfoCard } from "@/components/GuidePageLayout";
import { Globe, Layout, Palette, Code, Search, Smartphone, Zap, FileText } from "lucide-react";

const BuildFreeAIAgencyWebsite = () => (
  <GuidePageLayout
    title="Build Free AI Agency Website"
    subtitle="Create a professional AI agency website without spending a dime"
    icon={<Globe className="w-7 h-7 text-white" />}
    gradient="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900"
  >
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <InfoCard icon={<Layout className="w-6 h-6 text-primary" />} title="Landing Page" description="High-converting hero section with clear value proposition and CTA." />
      <InfoCard icon={<Palette className="w-6 h-6 text-primary" />} title="Portfolio" description="Showcase your best automation workflows with visual demos." />
      <InfoCard icon={<FileText className="w-6 h-6 text-primary" />} title="Case Studies" description="Real results and ROI metrics from client projects." />
      <InfoCard icon={<Search className="w-6 h-6 text-primary" />} title="SEO Optimized" description="Rank for AI automation keywords and attract organic leads." />
    </div>

    <h2 className="text-2xl font-bold text-foreground mb-8">Step-by-Step Guide</h2>
    <div className="space-y-0">
      <StepCard step={1} title="Choose Your Free Platform" description="Use Lovable, Carrd, Framer, or WordPress.com to build your site for free. Each platform has pros and cons for an AI agency website." tips={["Lovable: Best for custom interactive sites with full control", "Carrd: Simple single-page sites, free tier available", "WordPress.com: Most flexible, huge plugin ecosystem"]} icon={<Code className="w-5 h-5 text-primary" />} />
      <StepCard step={2} title="Design Your Brand Identity" description="Pick a color scheme, logo, and typography that conveys trust and technical expertise. Keep it clean and modern." tips={["Use dark themes to convey tech sophistication", "Create a simple logo with Canva or AI tools", "Stick to 2-3 colors maximum"]} icon={<Palette className="w-5 h-5 text-primary" />} />
      <StepCard step={3} title="Build Core Pages" description="Create essential pages: Home, Services, About, Portfolio/Case Studies, and Contact. Each page should guide visitors toward booking a call." tips={["Home: Hero + services overview + social proof + CTA", "Services: Detail each automation service with pricing hints", "Portfolio: Show workflow screenshots and results"]} icon={<Layout className="w-5 h-5 text-primary" />} />
      <StepCard step={4} title="Add Lead Capture" description="Set up contact forms, calendar booking (Calendly free tier), and email capture to convert visitors into leads." tips={["Add Calendly embed for free discovery calls", "Use Tally.so for free professional forms", "Add a lead magnet: free AI audit checklist"]} icon={<Zap className="w-5 h-5 text-primary" />} />
      <StepCard step={5} title="Optimize for Mobile" description="Over 60% of visitors will view your site on mobile. Ensure everything looks perfect on small screens." tips={["Test on multiple device sizes", "Ensure buttons are large enough for mobile taps", "Keep text readable without zooming"]} icon={<Smartphone className="w-5 h-5 text-primary" />} />
      <StepCard step={6} title="Launch & Promote" description="Connect your domain, set up Google Analytics, and start driving traffic through social media and content marketing." tips={["Buy a .com domain ($10-15/year is your only cost)", "Share your site link everywhere: LinkedIn, Twitter, email signature", "Create a blog section for SEO traffic"]} icon={<Search className="w-5 h-5 text-primary" />} />
    </div>
  </GuidePageLayout>
);

export default BuildFreeAIAgencyWebsite;
