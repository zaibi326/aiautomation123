import { Zap, Shield, Clock, Puzzle, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Setup",
    description: "Deploy AI automations in minutes, not hours. Pre-built templates get you started instantly.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption. Your data stays secure and private.",
  },
  {
    icon: Clock,
    title: "Save 100+ Hours",
    description: "Automate repetitive tasks and free up your team to focus on what matters most.",
  },
  {
    icon: Puzzle,
    title: "500+ Integrations",
    description: "Connect with your favorite tools including Slack, Gmail, Sheets, and more.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track performance, monitor runs, and optimize your automations with detailed insights.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share automations, manage permissions, and work together seamlessly.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Automate
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to help you build, deploy, and scale your AI automations effortlessly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card glow-card border border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
