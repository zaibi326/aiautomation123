import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "100 automation runs/month",
      "5 active automations",
      "Basic templates",
      "Community support",
      "Standard integrations",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    description: "For growing businesses",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "10,000 automation runs/month",
      "Unlimited active automations",
      "All templates included",
      "Priority email support",
      "Premium integrations",
      "Custom workflows",
      "Analytics dashboard",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Business",
    description: "For teams and enterprises",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "Unlimited automation runs",
      "Unlimited everything",
      "Custom template builder",
      "24/7 priority support",
      "All integrations + API",
      "Team collaboration",
      "Advanced analytics",
      "SSO & security",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Choose the plan that's right for you. All plans include a 14-day free trial.
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
                <span className="ml-2 text-xs text-primary">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border ${
                  plan.popular
                    ? "bg-card border-primary shadow-lg shadow-primary/10"
                    : "bg-card border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">
                    /{isYearly ? "year" : "month"}
                  </span>
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
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
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

          {/* FAQ teaser */}
          <div className="text-center mt-16">
            <p className="text-muted-foreground">
              Have questions?{" "}
              <a href="#" className="text-primary hover:underline">
                Check our FAQ
              </a>{" "}
              or{" "}
              <a href="#" className="text-primary hover:underline">
                contact sales
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
