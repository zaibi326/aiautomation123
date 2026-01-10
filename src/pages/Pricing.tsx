import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started with AI automation",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Access to 100+ free templates",
      "Basic automation workflows",
      "Community support",
      "Email notifications",
      "1 active automation",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    description: "For professionals scaling their automation",
    monthlyPrice: 49,
    yearlyPrice: 468,
    features: [
      "Access to 15,000+ premium templates",
      "Unlimited automation workflows",
      "Priority email support",
      "Advanced integrations",
      "Unlimited active automations",
      "Custom workflow builder",
      "Analytics & reporting",
      "API access",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For teams and organizations",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "SSO & advanced security",
      "Team collaboration tools",
      "White-label options",
      "SLA guarantee",
      "On-premise deployment",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Simple Pricing
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Choose Your Plan
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Start free and scale as you grow. All plans include a 14-day money-back guarantee.
              </p>

              {/* Toggle */}
              <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-secondary">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    !isYearly
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    isYearly
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs text-primary font-semibold">Save 20%</span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? "bg-gradient-to-b from-primary/5 to-background border-primary shadow-xl shadow-primary/20"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        ${isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {isYearly && plan.yearlyPrice > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed ${plan.yearlyPrice}/year
                      </p>
                    )}
                  </div>

                  <Link to="/signup">
                    <Button
                      variant={plan.popular ? "hero" : "outline"}
                      size="lg"
                      className="w-full mb-6"
                    >
                      {plan.cta}
                    </Button>
                  </Link>

                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.popular ? "bg-primary/20" : "bg-primary/10"
                        }`}>
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Need a custom solution?
              </h3>
              <p className="text-muted-foreground mb-6">
                Contact us for custom pricing, volume discounts, or enterprise features.
              </p>
              <Button variant="outline" size="lg">
                Contact Sales
              </Button>
            </div>

            {/* FAQ teaser */}
            <div className="text-center mt-12">
              <p className="text-muted-foreground">
                Have questions?{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  Check our FAQ
                </a>{" "}
                or{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  chat with support
                </a>
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Pricing;
