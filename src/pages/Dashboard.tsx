import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Zap, Home, Grid, Settings, CreditCard, LogOut, 
  Plus, ArrowUpRight, BarChart3, Clock, CheckCircle, AlertCircle 
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const stats = [
  { label: "Total Runs", value: "1,247", change: "+12%", icon: BarChart3 },
  { label: "Active Automations", value: "8", change: "+2", icon: Zap },
  { label: "Time Saved", value: "48h", change: "+6h", icon: Clock },
  { label: "Success Rate", value: "99.2%", change: "+0.3%", icon: CheckCircle },
];

const recentAutomations = [
  { id: 1, name: "Email Marketing Automation", status: "active", runs: 324, lastRun: "2 min ago" },
  { id: 2, name: "Lead Qualification", status: "active", runs: 156, lastRun: "15 min ago" },
  { id: 3, name: "Customer Support Bot", status: "paused", runs: 89, lastRun: "1 hour ago" },
  { id: 4, name: "Invoice Processing", status: "active", runs: 45, lastRun: "3 hours ago" },
];

const Dashboard = () => {
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
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/automations"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Grid className="w-5 h-5" />
              Automations
            </Link>
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
          </nav>

          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-sidebar-border">
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's your automation overview.</p>
            </div>
            <Link to="/automations">
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                New Automation
              </Button>
            </Link>
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

          {/* Recent Automations */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Automations</h2>
              <Link to="/automations" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total Runs</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Run</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAutomations.map((automation) => (
                    <tr key={automation.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <Link
                          to={`/automations/${automation.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {automation.name}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-sm ${
                          automation.status === "active" ? "text-green-600" : "text-yellow-600"
                        }`}>
                          {automation.status === "active" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {automation.runs}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {automation.lastRun}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link to={`/automations/${automation.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
