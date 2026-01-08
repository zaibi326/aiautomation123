import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, MessageSquare, FileText, BarChart, Users, ShoppingCart } from "lucide-react";

const templates = [
  {
    icon: Mail,
    title: "Email Marketing Automation",
    category: "Marketing",
    uses: "2.5k",
    description: "Automate your email campaigns with AI-powered personalization.",
  },
  {
    icon: MessageSquare,
    title: "Customer Support Bot",
    category: "Support",
    uses: "3.2k",
    description: "24/7 AI chatbot that handles customer inquiries instantly.",
  },
  {
    icon: FileText,
    title: "Document Processing",
    category: "Operations",
    uses: "1.8k",
    description: "Extract and process data from documents automatically.",
  },
  {
    icon: BarChart,
    title: "Sales Analytics Pipeline",
    category: "Sales",
    uses: "2.1k",
    description: "Track and analyze your sales data with AI insights.",
  },
  {
    icon: Users,
    title: "Lead Qualification",
    category: "Sales",
    uses: "4.1k",
    description: "Score and qualify leads automatically using AI.",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Sync",
    category: "E-commerce",
    uses: "1.9k",
    description: "Sync inventory, orders, and customer data across platforms.",
  },
];

const TemplatesPreview = () => {
  return (
    <section className="py-24 surface-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Popular Automations
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started with our most popular AI workflows.
            </p>
          </div>
          <Link to="/automations">
            <Button variant="outline" className="group">
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Link
              key={template.title}
              to="/automations/1"
              className="group p-6 rounded-2xl bg-card glow-card border border-border/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <template.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  {template.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {template.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>
              <div className="text-xs text-muted-foreground">
                {template.uses} uses
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplatesPreview;
