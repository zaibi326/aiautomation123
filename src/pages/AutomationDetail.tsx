import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Zap, Clock, Users, Star, Play, Settings } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const AutomationDetail = () => {
  const { id } = useParams();

  // Mock automation data
  const automation = {
    id,
    title: "Email Marketing Automation",
    category: "Marketing",
    description: "Automate your email campaigns with AI-powered personalization. This workflow handles everything from subscriber segmentation to send-time optimization, ensuring your emails reach the right people at the right time.",
    uses: "2.5k",
    rating: 4.9,
    reviews: 128,
    setupTime: "5 min",
    integrations: ["Gmail", "Mailchimp", "HubSpot", "Salesforce", "Slack"],
    features: [
      "AI-powered subject line optimization",
      "Smart subscriber segmentation",
      "Automated A/B testing",
      "Send-time optimization",
      "Performance analytics dashboard",
      "Custom trigger conditions",
    ],
    steps: [
      { title: "Connect your email provider", description: "Link Gmail, Mailchimp, or any other email service." },
      { title: "Import your contacts", description: "Sync your subscriber list from your CRM or upload a CSV." },
      { title: "Configure automation rules", description: "Set up triggers, conditions, and actions for your workflow." },
      { title: "Activate and monitor", description: "Launch your automation and track performance in real-time." },
    ],
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Link */}
            <Link
              to="/automations"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Automations
            </Link>

            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Header */}
                <div className="mb-8">
                  <span className="text-sm font-medium text-primary mb-2 block">
                    {automation.category}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                    {automation.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {automation.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-10 pb-10 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{automation.uses} uses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <span className="text-sm text-muted-foreground">{automation.rating} ({automation.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{automation.setupTime} setup</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    What's Included
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {automation.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How It Works */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    How It Works
                  </h2>
                  <div className="space-y-6">
                    {automation.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integrations */}
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Integrations
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {automation.integrations.map((integration) => (
                      <div
                        key={integration}
                        className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
                      >
                        {integration}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 p-6 rounded-2xl bg-card border border-border glow-card">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Ready to Automate?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get started with this automation in minutes.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Link to="/signup">
                      <Button variant="hero" size="lg" className="w-full">
                        <Play className="w-4 h-4" />
                        Activate Automation
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="w-full">
                      <Settings className="w-4 h-4" />
                      Preview Setup
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      Free plan includes 100 runs/month
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default AutomationDetail;
