import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, Home, Grid, Settings as SettingsIcon, CreditCard, LogOut,
  User, Bell, Shield, Key
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.user_metadata?.display_name || "";
  const [firstName, lastName] = displayName.split(" ");

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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <SettingsIcon className="w-5 h-5" />
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
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">Manage your account settings and preferences.</p>

            {/* Profile Section */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Profile</h2>
              </div>

              <div className="grid gap-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" defaultValue={firstName || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" defaultValue={lastName || ""} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                </div>
                <Button variant="hero" className="w-fit">Save Changes</Button>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Email notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates about your automations</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Automation alerts</div>
                    <div className="text-sm text-muted-foreground">Get notified when automations fail</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Weekly reports</div>
                    <div className="text-sm text-muted-foreground">Receive a weekly summary of your activity</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Security</h2>
              </div>

              <div className="space-y-4">
                <Button variant="outline" className="gap-2">
                  <Key className="w-4 h-4" />
                  Change Password
                </Button>
                <p className="text-sm text-muted-foreground">
                  Last password change: 30 days ago
                </p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card rounded-2xl border border-destructive/20 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data.
              </p>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Settings;
