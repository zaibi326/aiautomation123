import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Zap, Home, Grid, Settings, CreditCard, LogOut, 
  Plus, ArrowUpRight, BarChart3, Clock, CheckCircle, AlertCircle, Shield,
  Play, Loader2
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAutomations } from "@/hooks/useAutomations";
import { N8nWorkflowPreview } from "@/components/N8nWorkflowPreview";
import { toast } from "@/hooks/use-toast";

const stats = [
  { label: "Total Runs", value: "1,247", change: "+12%", icon: BarChart3 },
  { label: "Active Automations", value: "8", change: "+2", icon: Zap },
  { label: "Time Saved", value: "48h", change: "+6h", icon: Clock },
  { label: "Success Rate", value: "99.2%", change: "+0.3%", icon: CheckCircle },
];

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const { automations, loading } = useAutomations();
  const [activeTab, setActiveTab] = useState<"overview" | "automations">("overview");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [runningAutomation, setRunningAutomation] = useState<string | null>(null);

  const handleRunAutomation = async (e: React.MouseEvent, automationId: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRunningAutomation(automationId);
    
    // Simulate workflow execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setRunningAutomation(null);
    
    toast({
      title: "✅ Workflow Executed Successfully",
      description: `"${title}" completed in 2.1s`,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  // Get automations with preview_json
  const automationsWithPreview = automations.filter(a => a.preview_json);

  return (
    <PageTransition>
      <div className="min-h-screen bg-surface-muted flex">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar border-r border-sidebar-border hidden lg:block">
          <div className="p-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">AutoFlow</span>
            </Link>
          </div>

          <nav className="px-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
                activeTab === "overview" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("automations")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
                activeTab === "automations" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Grid className="w-5 h-5" />
              Automations
            </button>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
            <Link
              to="/billing"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              Billing
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-sidebar-border">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {activeTab === "overview" ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back, {displayName}! Here's your automation overview.</p>
                </div>
                <Button variant="hero" className="gap-2" onClick={() => setActiveTab("automations")}>
                  <Plus className="w-4 h-4" />
                  New Automation
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="p-6 rounded-2xl bg-card border border-border glow-card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-primary flex items-center gap-1">
                        {stat.change}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Automations with Preview */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Recent Automations</h2>
                  <button 
                    onClick={() => setActiveTab("automations")}
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : automationsWithPreview.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {automationsWithPreview.slice(0, 6).map((automation) => (
                      <Link
                        key={automation.id}
                        to={`/automations/${automation.id}`}
                        className="block p-4 rounded-xl border border-border hover:border-primary/50 transition-all bg-muted/20 hover:bg-muted/40"
                        onMouseEnter={() => setHoveredCard(automation.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div className="h-32 mb-3 rounded-lg overflow-hidden bg-background border border-border/50">
                          <N8nWorkflowPreview 
                            json={automation.preview_json} 
                            compact 
                            highlighted={hoveredCard === automation.id}
                            className="h-full"
                          />
                        </div>
                        <h3 className="font-medium text-foreground truncate">{automation.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{automation.uses_count} uses</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No automations with previews yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("automations")}
                    >
                      Browse Automations
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Automations Tab */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Automations</h1>
                  <p className="text-muted-foreground">Browse and run your automation workflows</p>
                </div>
                <Link to="/automations">
                  <Button variant="outline" className="gap-2">
                    View All Templates
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : automationsWithPreview.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {automationsWithPreview.map((automation) => (
                    <Link
                      key={automation.id}
                      to={`/automations/${automation.id}`}
                      className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                      onMouseEnter={() => setHoveredCard(automation.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Workflow Preview - Auto Runs */}
                      <div className="h-48 bg-muted/30 border-b border-border overflow-hidden">
                        <N8nWorkflowPreview 
                          json={automation.preview_json} 
                          compact={false}
                          highlighted={hoveredCard === automation.id}
                          className="h-full w-full"
                        />
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-5">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {automation.title}
                        </h3>
                        {automation.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {automation.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-muted-foreground">
                            {automation.uses_count} uses
                          </span>
                          <Button
                            variant="default"
                            size="sm"
                            className={`gap-2 transition-all duration-300 ${
                              runningAutomation === automation.id 
                                ? "bg-primary/80 animate-pulse" 
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                            onClick={(e) => handleRunAutomation(e, automation.id, automation.title)}
                            disabled={runningAutomation !== null}
                          >
                            {runningAutomation === automation.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Running...
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" />
                                Run Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-card rounded-2xl border border-border">
                  <Grid className="w-16 h-16 mx-auto mb-6 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No automations yet</h3>
                  <p className="text-muted-foreground mb-6">Start by browsing our template library</p>
                  <Link to="/automations">
                    <Button variant="hero" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Browse Templates
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;