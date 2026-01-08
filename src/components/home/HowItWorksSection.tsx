import { Search, MousePointer, Settings, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse Templates",
    description: "Explore our library of 15,000+ pre-built AI automation workflows.",
  },
  {
    icon: MousePointer,
    step: "02",
    title: "Select & Customize",
    description: "Choose a template and customize it to fit your specific needs.",
  },
  {
    icon: Settings,
    step: "03",
    title: "Connect Your Tools",
    description: "Integrate with your existing apps in just a few clicks.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Launch & Automate",
    description: "Activate your automation and watch it work its magic.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started with AI automation in four simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <div className="relative z-10 inline-flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl stats-gradient flex items-center justify-center mb-6 border border-primary/20">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-2">
                  STEP {step.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
