import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 hero-gradient relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm hero-text-muted">
              Start Free Today
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold hero-text mb-6">
            Ready to Automate Your Business?
          </h2>
          <p className="text-lg hero-text-muted mb-10 max-w-2xl mx-auto">
            Join 10,000+ businesses already using AutoFlow AI to save time, reduce costs, and scale faster.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="heroOutline" size="xl">
                View Pricing
              </Button>
            </Link>
          </div>

          <p className="text-sm hero-text-muted mt-6">
            No credit card required • Free forever plan available
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-glow-secondary/20 rounded-full blur-3xl" />
      </div>
    </section>
  );
};

export default CTASection;
