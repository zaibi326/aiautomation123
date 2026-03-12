import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Crown } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserRole } from "@/hooks/useUserRole";
import { useFreeAccess } from "@/hooks/useFreeAccess";

interface GuidePageLayoutProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  gradient: string;
  children: ReactNode;
}

export const GuidePageLayout = ({ title, subtitle, icon, gradient, children }: GuidePageLayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPaid } = useSubscription();
  const { isAdmin } = useUserRole();
  const { hasFreeAccess } = useFreeAccess();

  const hasAccess = hasPaid || isAdmin || hasFreeAccess;

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access this guide.</p>
            <Link to="/login"><Button variant="hero">Sign In</Button></Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!hasAccess) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <Crown className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Pro Feature</h2>
            <p className="text-muted-foreground mb-6">Upgrade to Pro to unlock "{title}" and all premium guides.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
              <Link to="/pricing"><Button variant="hero">Upgrade Now</Button></Link>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className={`relative overflow-hidden ${gradient} py-16 px-6`}>
          <div className="max-w-5xl mx-auto relative z-10">
            <Button variant="ghost" className="text-white/70 hover:text-white mb-6 -ml-2" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
                <p className="text-white/70 mt-1">{subtitle}</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          {children}
        </div>
      </div>
    </PageTransition>
  );
};

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  tips?: string[];
  icon?: ReactNode;
}

export const StepCard = ({ step, title, description, tips, icon }: StepCardProps) => (
  <div className="relative pl-12 pb-10 border-l-2 border-border last:border-l-0 last:pb-0">
    <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
      {step}
    </div>
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
      {tips && tips.length > 0 && (
        <ul className="mt-4 space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-0.5">✦</span> {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

interface InfoCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export const InfoCard = ({ title, description, icon }: InfoCardProps) => (
  <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);
