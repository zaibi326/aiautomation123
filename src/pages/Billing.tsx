import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Zap, Home, Grid, Settings, CreditCard, LogOut,
  Check, ArrowRight
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";

const Billing = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <CreditCard className="w-5 h-5" />
              Billing
            </Link>
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
          <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-foreground mb-2">Billing</h1>
            <p className="text-muted-foreground mb-8">Manage your subscription and billing information.</p>

            {/* Current Plan */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Current Plan</h2>
                  <p className="text-muted-foreground">You are currently on the <span className="font-medium text-foreground">Free</span> plan.</p>
                </div>
                <Link to="/pricing">
                  <Button variant="hero" className="gap-2">
                    Upgrade Plan
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/50">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Runs Used</div>
                  <div className="text-2xl font-bold text-foreground">47 / 100</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Active Automations</div>
                  <div className="text-2xl font-bold text-foreground">3 / 5</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Billing Cycle</div>
                  <div className="text-2xl font-bold text-foreground">Monthly</div>
                </div>
              </div>
            </div>

            {/* Upgrade Options */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Pro</h3>
                  <span className="text-2xl font-bold text-foreground">$29<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                </div>
                <ul className="space-y-3 mb-6">
                  {["10,000 runs/month", "Unlimited automations", "Priority support"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="hero" className="w-full">Upgrade to Pro</Button>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Business</h3>
                  <span className="text-2xl font-bold text-foreground">$99<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                </div>
                <ul className="space-y-3 mb-6">
                  {["Unlimited runs", "Team collaboration", "24/7 support"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
              <p className="text-muted-foreground mb-4">No payment method on file.</p>
              <Button variant="outline">Add Payment Method</Button>
            </div>

            {/* Billing History */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Billing History</h2>
              <p className="text-muted-foreground">No billing history available.</p>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Billing;
