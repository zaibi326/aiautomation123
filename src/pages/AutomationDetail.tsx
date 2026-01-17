import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Zap, Clock, Users, Star, Download, Settings, Loader2, Eye, Lock, ExternalLink, Maximize2, X, Code, FileJson, Workflow, Copy, CheckCheck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useUserRole } from "@/hooks/useUserRole";
import { useFreeAccess } from "@/hooks/useFreeAccess";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import N8nWorkflowPreview from "@/components/N8nWorkflowPreview";

interface AutomationData {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  uses_count: number;
  download_url: string | null;
  preview_json: any | null;
  subcategory?: {
    name: string;
    category?: {
      name: string;
    };
  };
}

const AutomationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { hasPaid, loading: subscriptionLoading } = useSubscription();
  const { settings: appSettings, loading: settingsLoading } = useAppSettings();
  const { hasFreeAccess, loading: freeAccessLoading } = useFreeAccess();
  const [downloading, setDownloading] = useState(false);
  const [automation, setAutomation] = useState<AutomationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyJson = async () => {
    if (!automation?.preview_json) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(automation.preview_json, null, 2));
      setCopied(true);
      toast.success("JSON copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy JSON");
    }
  };

  // Check if user can download (admin, paid, or has free access)
  const canDownload = isAdmin || hasPaid || hasFreeAccess;

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
      toast.info("Please signup first to download");
      navigate("/signup");
      return;
    }

    // Admin or users with free access can always download - skip payment checks
    if (!isAdmin && !hasFreeAccess) {
      // Check if downloads are enabled by admin
      if (!appSettings.allow_user_downloads) {
        toast.error("Downloads are currently disabled by admin");
        return;
      }

      if (!hasPaid) {
        navigate("/pricing");
        return;
      }
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
                      disabled={subscriptionLoading || settingsLoading || freeAccessLoading || downloading || (!canDownload && !appSettings.allow_user_downloads)}
                    >
                      {downloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (!canDownload && !appSettings.allow_user_downloads) ? (
                        <>
                          <Download className="w-4 h-4" />
                          Downloads Disabled
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Automation
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Visual Workflow Preview Section - Only for paid/admin/free access users */}
                  {canDownload && automation?.preview_json && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Workflow className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-semibold text-foreground">Workflow Preview</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullscreenPreview(true)}
                          className="h-7 px-2"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div 
                        className="rounded-lg border border-border overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setShowFullscreenPreview(true)}
                      >
                        <N8nWorkflowPreview 
                          json={automation.preview_json} 
                          className="h-48" 
                          compact={true}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-background/50 transition-opacity">
                          <div className="flex items-center gap-2 text-sm text-foreground bg-card px-3 py-1.5 rounded-lg shadow-lg">
                            <Maximize2 className="w-4 h-4" />
                            Click to expand
                          </div>
                        </div>
                      </div>
                      {automation.download_url && (
                        <a 
                          href={automation.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 mt-3 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open in Google Drive
                        </a>
                      )}
                    </div>
                  )}

                  {/* No Preview Available - show download link only */}
                  {canDownload && !automation?.preview_json && automation?.download_url && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">Preview</h4>
                      </div>
                      <div className="rounded-lg border border-border overflow-hidden bg-muted/30 p-4 text-center">
                        <Code className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Preview not available yet
                        </p>
                        <a 
                          href={automation.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="w-3.5 h-3.5" />
                            View on Google Drive
                          </Button>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Locked Preview for non-paid users */}
                  {!canDownload && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <h4 className="text-sm font-semibold text-foreground">Preview</h4>
                      </div>
                      <div className="rounded-lg border border-border overflow-hidden bg-muted/30 aspect-video flex items-center justify-center">
                        <div className="text-center p-4">
                          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Preview is available for Premium users
                          </p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => navigate("/pricing")}
                            className="mt-2"
                          >
                            Upgrade to Premium
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-border">
                    {isAdmin ? (
                      <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                        👑 Admin Access - Free Downloads
                      </p>
                    ) : hasFreeAccess ? (
                      <p className="text-xs text-green-600 dark:text-green-400 text-center">
                        🎁 Free Access Granted - Unlimited Downloads
                      </p>
                    ) : !appSettings.allow_user_downloads ? (
                      <p className="text-xs text-red-600 dark:text-red-400 text-center">
                        ⚠️ Downloads temporarily disabled
                      </p>
                    ) : hasPaid ? (
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

        {/* Fullscreen Preview Modal */}
        <Dialog open={showFullscreenPreview} onOpenChange={setShowFullscreenPreview}>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden">
            <div className="relative w-full h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Workflow className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{automation?.title}</h3>
                    <p className="text-xs text-muted-foreground">n8n Workflow Preview</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {automation?.download_url && (
                    <a 
                      href={automation.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Open in Google Drive
                      </Button>
                    </a>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowFullscreenPreview(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Tabbed Content - Visual & JSON */}
              {automation?.preview_json ? (
                <Tabs defaultValue="visual" className="flex-1 flex flex-col">
                  <div className="border-b border-border bg-muted/30 px-4">
                    <TabsList className="h-10 bg-transparent">
                      <TabsTrigger value="visual" className="gap-2 data-[state=active]:bg-background">
                        <Workflow className="w-4 h-4" />
                        Visual
                      </TabsTrigger>
                      <TabsTrigger value="json" className="gap-2 data-[state=active]:bg-background">
                        <FileJson className="w-4 h-4" />
                        JSON
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="visual" className="flex-1 m-0 overflow-hidden">
                    <div className="h-full bg-gradient-to-br from-muted/20 via-background to-muted/30">
                      <N8nWorkflowPreview 
                        json={automation.preview_json} 
                        className="h-full" 
                        compact={false}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="json" className="flex-1 m-0 overflow-hidden relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyJson}
                      className="absolute top-4 right-4 z-10 gap-2 bg-background shadow-md border-border"
                    >
                      {copied ? (
                        <>
                          <CheckCheck className="w-4 h-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                    <ScrollArea className="h-full bg-muted/30">
                      <pre className="p-6 text-sm text-foreground font-mono">
                        <code>{JSON.stringify(automation.preview_json, null, 2)}</code>
                      </pre>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
                  <div className="text-center">
                    <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Preview not available for this automation
                    </p>
                    {automation?.download_url && (
                      <a 
                        href={automation.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block"
                      >
                        <Button variant="outline" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          View on Google Drive
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default AutomationDetail;
