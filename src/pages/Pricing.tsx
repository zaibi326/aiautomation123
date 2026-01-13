import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Zap, Building2, Copy, Globe } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";
import CurrencyConverter from "@/components/pricing/CurrencyConverter";
import InternationalPaymentGuide from "@/components/pricing/InternationalPaymentGuide";
import PaymentStatusTracker from "@/components/pricing/PaymentStatusTracker";

const plans = [
  {
    name: "Basic Plan",
    price: "$20",
    period: "One Month",
    description: "Perfect for getting started with AI automation",
    features: [
      "AI Automation Courses",
      "AI Automation Roadmap",
      "AI Agency Roadmap",
      "15K+ Workflow Automation Templates",
      "250+ Templates with Step-by-Step Video Guides 🎥",
      "40+ Marketing Automations with Setup Video Guides 🎥",
      "Build Free AI Agency Website",
      "Best AI Automation Tools",
      "Automation Money-Making",
      "Launch Your AI Agency",
      "Email Support & Live Chat Support",
    ],
    cta: "Get Started",
    popular: false,
    icon: Zap,
  },
  {
    name: "Pro Plan",
    price: "$50",
    period: "Lifetime",
    description: "Complete AI automation mastery package",
    features: [
      "AI Automation Courses",
      "AI Automation Roadmap",
      "AI Agency Roadmap",
      "15K+ Workflow Automation Templates",
      "250+ Templates with Step-by-Step Video Guides 🎥",
      "40+ Marketing Automations with Setup Video Guides 🎥",
      "Build Free AI Agency Website",
      "Best AI Automation Tools",
      "Automation Money-Making",
      "Launch Your AI Agency",
      "1-on-1 Consultation",
      "Email Support & Live Chat Support",
      "Lifetime Updates",
    ],
    cta: "Get Started",
    popular: true,
    icon: Crown,
  },
];

const Pricing = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <Sparkles className="w-4 h-4" />
                Limited Time Offer
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
                Choose Your Plan
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Unlock the power of AI automation and start building your successful AI agency today
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <div
                    key={plan.name}
                    className={`relative p-8 lg:p-10 rounded-3xl border-2 transition-all duration-500 group ${
                      plan.popular
                        ? "bg-gradient-to-b from-primary/10 via-primary/5 to-background border-primary shadow-2xl shadow-primary/20 scale-105"
                        : "bg-card border-border hover:border-primary/50 hover:shadow-xl"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/30">
                          <Sparkles className="w-4 h-4" />
                          Most Popular
                        </div>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      plan.popular 
                        ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/30" 
                        : "bg-primary/10 text-primary"
                    }`}>
                      <IconComponent className="w-7 h-7" />
                    </div>

                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-8 pb-8 border-b border-border">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl lg:text-6xl font-bold ${
                          plan.popular ? "text-primary" : "text-foreground"
                        }`}>
                          {plan.price}
                        </span>
                        <span className="text-lg text-muted-foreground font-medium">
                          {plan.period}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.popular 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-primary/10 text-primary"
                          }`}>
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                          <span className="text-foreground/80 text-sm lg:text-base">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Link to="/signup" className="block">
                      <Button
                        variant={plan.popular ? "hero" : "outline"}
                        size="lg"
                        className={`w-full text-base py-6 font-semibold ${
                          plan.popular 
                            ? "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40" 
                            : "hover:bg-primary hover:text-primary-foreground"
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Trust Badges */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Bank Transfer Payment Section */}
            <div className="mt-20 max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-4 border border-green-500/20">
                  <Building2 className="w-4 h-4" />
                  Bank Transfer Payment
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  Pay via Bank Transfer
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Transfer your payment directly to our UBL bank account. Send screenshot of payment receipt via WhatsApp for instant access.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Local Transfer */}
                <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Local Transfer</h3>
                      <p className="text-sm text-muted-foreground">Pakistan (PKR)</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Bank Name</p>
                      <p className="font-semibold text-foreground">United Bank Limited (UBL)</p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Account Title</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">Zohaib Anwar</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("Zohaib Anwar");
                            toast.success("Copied to clipboard!");
                          }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">IBAN</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground text-sm">PK52UNIL0109000318793263</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("PK52UNIL0109000318793263");
                            toast.success("Copied to clipboard!");
                          }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Branch</p>
                      <p className="font-semibold text-foreground text-sm">Sadiq Abad Gallah Mandi Branch</p>
                    </div>
                  </div>
                </div>

                {/* International Transfer */}
                <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">International Transfer</h3>
                      <p className="text-sm text-muted-foreground">SWIFT/Wire Transfer (USD)</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">SWIFT/BIC Code</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">UNILPKKAXXX</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("UNILPKKAXXX");
                            toast.success("Copied to clipboard!");
                          }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Account Title</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">Zohaib Anwar</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("Zohaib Anwar");
                            toast.success("Copied to clipboard!");
                          }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">IBAN</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground text-sm">PK52UNIL0109000318793263</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("PK52UNIL0109000318793263");
                            toast.success("Copied to clipboard!");
                          }}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Bank Address</p>
                      <p className="font-semibold text-foreground text-sm">UBL, Sadiq Abad Gallah Mandi Branch, Pakistan</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  After Payment
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    Take a screenshot of your payment receipt
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    Fill out the payment confirmation form below
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    Get instant access within 24 hours
                  </li>
                </ol>
                <Link to="/payment-confirmation">
                  <Button variant="hero" size="lg" className="w-full">
                    Submit Payment Confirmation
                  </Button>
                </Link>
              </div>

              {/* Currency Converter & Payment Tools */}
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <CurrencyConverter />
                <PaymentStatusTracker />
              </div>

              {/* International Payment Guide */}
              <div className="mt-8">
                <InternationalPaymentGuide />
              </div>
            </div>

            {/* FAQ teaser */}
            <div className="text-center mt-12 p-8 rounded-2xl bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 max-w-2xl mx-auto">
              <p className="text-muted-foreground">
                Have questions?{" "}
                <a href="#" className="text-primary hover:underline font-semibold">
                  Check our FAQ
                </a>{" "}
                or{" "}
                <a href="#" className="text-primary hover:underline font-semibold">
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
