import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Zap, Clock, Users, Star, Download, Settings, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import PaymentRequiredModal from "@/components/PaymentRequiredModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AutomationData {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  uses_count: number;
  download_url: string | null;
  subcategory?: {
    name: string;
    category?: {
      name: string;
    };
  };
}

const AutomationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { hasPaid, loading: subscriptionLoading } = useSubscription();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [automation, setAutomation] = useState<AutomationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAutomation = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("automations")
        .select(`
          *,
          subcategory:automation_subcategories(
            name,
            category:automation_categories(name)
          )
        `)
        .eq("id", id)
        .single();

      if (!error && data) {
        setAutomation({
          ...data,
          subcategory: data.subcategory as any
        });
      }
      setLoading(false);
    };

    fetchAutomation();
  }, [id]);

  const handleDownload = async () => {
    if (!user) {
      toast.error("Please login first to download");
      return;
    }

    if (!hasPaid) {
      setShowPaymentModal(true);
      return;
    }
    
    if (!automation?.download_url) {
      toast.error("Download link not available");
      return;
    }

    setDownloading(true);
    
    try {
      // Increment uses count
      await supabase
        .from("automations")
        .update({ uses_count: (automation.uses_count || 0) + 1 })
        .eq("id", automation.id);

      // Open download link
      window.open(automation.download_url, "_blank");
      toast.success("Download started!");
    } catch (error) {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!automation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Automation not found</p>
          <Link to="/automations">
            <Button>Back to Automations</Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = automation.subcategory?.category?.name || "Uncategorized";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Link */}
            <Link
              to="/automations"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Automations
            </Link>

            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Header */}
                <div className="mb-8">
                  <span className="text-sm font-medium text-primary mb-2 block">
                    {categoryName}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                    {automation.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {automation.description || "No description available"}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-10 pb-10 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {automation.uses_count > 1000 
                        ? `${(automation.uses_count / 1000).toFixed(1)}k` 
                        : automation.uses_count} uses
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Quick setup</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    What's Included
                  </h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">Ready-to-use automation workflow</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">Step-by-step setup guide</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">Lifetime access with updates</span>
                    </li>
                  </ul>
                </div>

                {/* How It Works */}
                <div className="mb-10">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    How It Works
                  </h2>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Download the automation</h3>
                        <p className="text-sm text-muted-foreground">Get the file from your dashboard</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Import to your tool</h3>
                        <p className="text-sm text-muted-foreground">Load it in Make, Zapier, or n8n</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Configure & activate</h3>
                        <p className="text-sm text-muted-foreground">Set up your accounts and start automating</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 p-6 rounded-2xl bg-card border border-border glow-card">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Ready to Automate?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get started with this automation in minutes.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                      onClick={handleDownload}
                      disabled={subscriptionLoading || downloading}
                    >
                      {downloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Automation
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="lg" className="w-full">
                      <Settings className="w-4 h-4" />
                      Preview Setup
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    {hasPaid ? (
                      <p className="text-xs text-green-600 dark:text-green-400 text-center">
                        ✓ Premium Access - Unlimited Downloads
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center">
                        Download کے لیے Premium Plan ضروری ہے
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
        
        <PaymentRequiredModal 
          open={showPaymentModal} 
          onOpenChange={setShowPaymentModal} 
        />
      </div>
    </PageTransition>
  );
};

export default AutomationDetail;
