import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Mail, MessageSquare, FileText, BarChart, Users, ShoppingCart, Database, Zap, Calendar, Globe } from "lucide-react";

const categories = [
  "All",
  "Marketing",
  "Sales",
  "Support",
  "Operations",
  "E-commerce",
  "HR",
  "Finance",
];

const automations = [
  { id: 1, icon: Mail, title: "Email Marketing Automation", category: "Marketing", uses: "2.5k", description: "Automate your email campaigns with AI-powered personalization and scheduling." },
  { id: 2, icon: MessageSquare, title: "Customer Support Bot", category: "Support", uses: "3.2k", description: "24/7 AI chatbot that handles customer inquiries and routes complex issues." },
  { id: 3, icon: FileText, title: "Document Processing", category: "Operations", uses: "1.8k", description: "Extract and process data from documents automatically using OCR and AI." },
  { id: 4, icon: BarChart, title: "Sales Analytics Pipeline", category: "Sales", uses: "2.1k", description: "Track and analyze your sales data with AI-powered insights and predictions." },
  { id: 5, icon: Users, title: "Lead Qualification", category: "Sales", uses: "4.1k", description: "Score and qualify leads automatically using AI and behavioral data." },
  { id: 6, icon: ShoppingCart, title: "E-commerce Sync", category: "E-commerce", uses: "1.9k", description: "Sync inventory, orders, and customer data across all your platforms." },
  { id: 7, icon: Database, title: "Data Enrichment", category: "Operations", uses: "1.4k", description: "Automatically enrich your CRM data with external information sources." },
  { id: 8, icon: Zap, title: "Workflow Orchestration", category: "Operations", uses: "2.8k", description: "Connect and automate complex multi-step business workflows." },
  { id: 9, icon: Calendar, title: "Meeting Scheduler", category: "Sales", uses: "3.5k", description: "AI-powered meeting scheduling with smart availability detection." },
  { id: 10, icon: Globe, title: "Social Media Manager", category: "Marketing", uses: "2.2k", description: "Schedule, post, and analyze social media content automatically." },
  { id: 11, icon: FileText, title: "Invoice Processing", category: "Finance", uses: "1.6k", description: "Automatically extract, validate, and process invoices with AI." },
  { id: 12, icon: Users, title: "Employee Onboarding", category: "HR", uses: "1.3k", description: "Streamline new hire onboarding with automated workflows and reminders." },
];

const Automations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch = automation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || automation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              AI Automation Library
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse our collection of 15,000+ ready-to-use AI workflows. Find the perfect automation for your needs.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search automations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" className="h-12 gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredAutomations.length} automations
          </p>

          {/* Automations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAutomations.map((automation) => (
              <Link
                key={automation.id}
                to={`/automations/${automation.id}`}
                className="group p-6 rounded-2xl bg-card glow-card border border-border/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <automation.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {automation.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {automation.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {automation.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  {automation.uses} uses
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Automations;
