import { GuidePageLayout, StepCard, InfoCard } from "@/components/GuidePageLayout";
import { Globe, Layout, Palette, Code, Search, Smartphone, Zap, FileText, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

    {/* Hire Developer Section */}
    <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-4">
          Need a Professional Developer?
        </h3>
        <p className="text-muted-foreground mb-6">
          Don't want to build it yourself? Hire an expert developer to create your AI agency website professionally. 
          Get a stunning, high-converting website built with love and expertise.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="https://wa.me/923000000000" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
              <MessageCircle className="w-5 h-5" />
              Hire Me on WhatsApp
            </Button>
          </a>
          <span className="text-muted-foreground text-sm">or</span>
          <a 
            href="https://lovable.dev" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Build Yourself on Lovable
            </Button>
          </a>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span>on</span>
          <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
            Lovable.dev
          </a>
        </div>
      </div>
    </div>
  </GuidePageLayout>
);

export default BuildFreeAIAgencyWebsite;
