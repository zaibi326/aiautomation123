import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Zap, Home, Grid, Settings, CreditCard, LogOut, 
  Plus, ArrowUpRight, BarChart3, Clock, CheckCircle, AlertCircle, Shield,
  Play, Loader2, Lock, ChevronLeft, ChevronRight, Search, X,
  Map, Globe, DollarSign, Wrench, Rocket, TrendingUp, BookOpen, Crown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAutomations, Automation } from "@/hooks/useAutomations";
import { useSubscription } from "@/hooks/useSubscription";
import { useFreeAccess } from "@/hooks/useFreeAccess";
import { N8nWorkflowPreview } from "@/components/N8nWorkflowPreview";
import { WorkflowExecutionModal } from "@/components/WorkflowExecutionModal";
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
  const { hasPaid, subscription, isPlusUser } = useSubscription();
  const { hasFreeAccess } = useFreeAccess();
  const [activeTab, setActiveTab] = useState<"overview" | "automations">("overview");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 12;

  // Plus plan does NOT give full access
  const hasAccess = hasPaid || hasFreeAccess || isAdmin;

  const handleRunAutomation = (e: React.MouseEvent, automation: Automation) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasAccess) {
      toast({
        title: "🔒 Premium Feature",
        description: "Upgrade to run automations",
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }
    
    setSelectedAutomation(automation);
    setExecutionModalOpen(true);
  };

  const handleExecutionComplete = () => {
    toast({
      title: "✅ Workflow Executed Successfully",
      description: `"${selectedAutomation?.title}" completed`,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  // Get automations with preview_json
  const automationsWithPreview = automations.filter(a => a.preview_json);
  
  // Filter by search query
  const filteredAutomations = automationsWithPreview.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Pagination for automations tab
  const totalPages = Math.ceil(filteredAutomations.length / itemsPerPage);
  const paginatedAutomations = filteredAutomations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

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
            
            {/* Guides Section */}
            <div className="mt-6 mb-2 px-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                AI Growth Kit
                {!hasAccess && <Lock className="w-3 h-3 text-amber-500" />}
              </span>
            </div>
            {[
              { to: "/guides/ai-agency-roadmap", icon: Map, label: "AI Agency Roadmap" },
              { to: "/guides/build-free-ai-agency-website", icon: Globe, label: "Build Free Website" },
              { to: "/guides/automation-money-making", icon: DollarSign, label: "Money Making" },
              { to: "/guides/best-ai-automation-tools", icon: Wrench, label: "Best AI Tools" },
              { to: "/guides/launch-your-ai-agency", icon: Rocket, label: "Launch AI Agency" },
              { to: "/guides/ai-automation-roadmap", icon: TrendingUp, label: "AI Automation Roadmap" },
            ].map((guide) => (
              <Link
                key={guide.to}
                to={guide.to}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-sm"
              >
                <guide.icon className="w-4 h-4" />
                <span className="truncate">{guide.label}</span>
                {!hasAccess && <Crown className="w-3 h-3 text-amber-500 ml-auto flex-shrink-0" />}
              </Link>
            ))}

            <div className="mt-4" />
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

              {/* Plan Status Banner */}
              {/* Plus Plan Banner - separate from full access */}
              {isPlusUser && !isAdmin && (
                <div className="mb-8 p-5 rounded-2xl border bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-cyan-500/10 border-blue-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">Plus Plan Active</h3>
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 border">
                          💎 Pay Per Workflow
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Access Pro-level workflows without full unlock. Pay separately for each workflow you need.
                      </p>
                      <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 hover:underline">
                        Upgrade to Pro for unlimited access <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {hasAccess && !isAdmin && !isPlusUser && (
                <div className={`mb-8 p-5 rounded-2xl border ${
                  subscription?.plan === 'starter' 
                    ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-500/20'
                    : 'bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      subscription?.plan === 'starter' ? 'bg-amber-500/20' : 'bg-primary/20'
                    }`}>
                      <Crown className={`w-6 h-6 ${subscription?.plan === 'starter' ? 'text-amber-500' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">
                          {subscription?.plan === 'starter' ? 'Starter Plan Active' : 'Pro Plan Active'}
                        </h3>
                        <Badge className={`border ${
                          subscription?.plan === 'starter'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {subscription?.plan === 'starter' ? '📦 Yearly Access' : '✅ Lifetime Access'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {subscription?.plan === 'starter' 
                          ? 'Starter plan active — You have access to 5,000 workflow downloads, 2,000 uploads, and selected features.'
                          : 'Payment confirmed — You have unlimited access to all automations, guides, and premium features forever!'
                        }
                      </p>
                      {subscription?.plan === 'starter' && (
                        <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 hover:underline">
                          Upgrade to Pro for unlimited access <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!hasPaid && !hasFreeAccess && !isAdmin && !isPlusUser && (
                <div className="mb-8 p-5 rounded-2xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">Free Plan</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upgrade to Pro for unlimited access to all automations and guides.
                      </p>
                    </div>
                    <Link to="/pricing">
                      <Button variant="hero" size="sm" className="gap-2">
                        <Crown className="w-4 h-4" />
                        Upgrade Now
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
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

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search automations..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10 bg-card border-border"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Results count */}
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  Found {filteredAutomations.length} automation{filteredAutomations.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </p>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredAutomations.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedAutomations.map((automation) => (
                      <Link
                        key={automation.id}
                        to={`/automations/${automation.id}`}
                        className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                        onMouseEnter={() => setHoveredCard(automation.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        {/* Workflow Preview */}
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
                              variant={hasAccess ? "default" : "outline"}
                              size="sm"
                              className={`gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                                !hasAccess ? "border-amber-500/50 text-amber-600 hover:bg-amber-500/10" : ""
                              }`}
                              onClick={(e) => handleRunAutomation(e, automation)}
                            >
                              {hasAccess ? (
                                <>
                                  <Play className="w-3 h-3" />
                                  Run Now
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3" />
                                  Upgrade
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
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

      {/* Workflow Execution Modal */}
      {selectedAutomation && (
        <WorkflowExecutionModal
          open={executionModalOpen}
          onOpenChange={setExecutionModalOpen}
          workflowJson={selectedAutomation.preview_json}
          workflowTitle={selectedAutomation.title}
          onComplete={handleExecutionComplete}
        />
      )}
    </PageTransition>
  );
};

export default Dashboard;