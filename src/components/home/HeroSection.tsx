import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="hero-gradient min-h-screen flex items-center pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm hero-text-muted">
              15,000+ AI Workflows Available
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold hero-text mb-6 animate-fade-up delay-100">
            Build AI Automations{" "}
            <span className="gradient-text">Faster Than Ever</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl hero-text-muted max-w-2xl mx-auto mb-10 animate-fade-up delay-200">
            Access 15,000+ ready-made AI workflows to automate your business instantly. 
            Save hundreds of hours and scale your operations effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Link to="/signup">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/automations">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                <Play className="w-5 h-5" />
                Browse Automations
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-16 border-t border-hero-text/10 animate-fade-up delay-400">
            <p className="text-sm hero-text-muted mb-6">
              Trusted by 10,000+ businesses worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {["Google", "Microsoft", "Shopify", "Slack", "Notion", "Zapier"].map((brand) => (
                <div
                  key={brand}
                  className="text-lg font-bold hero-text tracking-wide"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow-secondary/20 rounded-full blur-3xl" />
      </div>
    </section>
  );
};

export default HeroSection;
