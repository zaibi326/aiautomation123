import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Package, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useFreeAccess } from "@/hooks/useFreeAccess";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PaymentRequiredModal from "@/components/PaymentRequiredModal";

const templateBundles = [
  {
    id: "bundle-1",
    emoji: "🚀",
    title: "200 Professional Templates",
    subtitle: "with 🎥 Video Support",
    tags: ["Business Automation", "Content Creation", "Lead Generation"],
    downloadUrl: "/uploads/professional-templates-200.xlsx",
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "bundle-2",
    emoji: "🔥",
    title: "2,000+ Ready-to-Use Templates",
    subtitle: "for Every Need",
    tags: ["Lead Generation", "Email Marketing", "Data Analytics"],
    downloadUrl: "/uploads/n8n-templates-2000.xlsx",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "bundle-3",
    emoji: "📊",
    title: "3,000+ Ready-to-Use Templates",
    subtitle: "for Every Workflow",
    tags: ["Content Creation", "Marketing", "Sales"],
    downloadUrl: "/uploads/3k-templates.zip",
    color: "from-green-500 to-teal-600",
  },
  {
    id: "bundle-4",
    emoji: "🎯",
    title: "2,000+ Powerful Templates",
    subtitle: "to Boost Productivity",
    tags: ["AI Workflows", "Generative", "Digital Agent"],
    downloadUrl: "/uploads/2k-templates.zip",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "bundle-5",
    emoji: "🌍",
    title: "2,200+ Templates",
    subtitle: "for Marketing, Sales & More",
    tags: ["Marketing", "Sales", "More"],
    downloadUrl: "/uploads/2200-templates.zip",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "bundle-6",
    emoji: "🌟",
    title: "300+ Templates",
    subtitle: "for WhatsApp Bots, Chatbots & Beyond! 🤖💬",
    tags: ["WhatsApp Chatbot", "Chatbots"],
    downloadUrl: "/uploads/300-whatsapp-templates.zip",
    color: "from-green-400 to-emerald-600",
  },
  {
    id: "bundle-7",
    emoji: "🚀",
    title: "500+ n8n Templates",
    subtitle: "Automate & scale faster.",
    tags: ["Lead Generation", "Email Marketing", "Sales"],
    downloadUrl: "/uploads/500-n8n-templates.zip",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "bundle-8",
    emoji: "📂",
    title: "2,182 Workflows",
    subtitle: "Covering all industries.",
    tags: ["AI Workflows", "Chatbots"],
    downloadUrl: "/uploads/2182-workflows.zip",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "bundle-9",
    emoji: "💼",
    title: "35+ Business Templates",
    subtitle: "Ready for your needs.",
    tags: ["Business Automation", "Workflow Automation", "Process Optimization"],
    downloadUrl: "/uploads/business-templates-35.zip",
    isExternalLink: false,
    color: "from-slate-500 to-gray-700",
  },
];

const BulkDownloadSection = () => {
  const { user } = useAuth();
  const { hasPaid, loading: subscriptionLoading } = useSubscription();
  const { hasFreeAccess, loading: freeAccessLoading } = useFreeAccess();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const canDownload = isAdmin || hasPaid || hasFreeAccess;
  const isLoading = subscriptionLoading || freeAccessLoading;

  const handleDownload = async (bundle: typeof templateBundles[0]) => {
    if (!user) {
      toast.info("Please signup to download templates");
      navigate("/signup");
      return;
    }

    if (!canDownload) {
      navigate("/pricing");
      return;
    }

    // Handle external links (like Google Drive) - use link element to bypass iframe restrictions
    if (bundle.isExternalLink) {
      const a = document.createElement("a");
      a.href = bundle.downloadUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Opening external link...");
      return;
    }

    setDownloadingId(bundle.id);

    try {
      const response = await fetch(bundle.downloadUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get file extension from URL
      const fileExtension = bundle.downloadUrl.split('.').pop() || 'zip';
      a.download = `${bundle.title.replace(/[^a-zA-Z0-9]/g, "-")}.${fileExtension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Download started!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Package className="w-4 h-4" />
            Bulk Downloads
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Download Templates in Bulk
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant access to thousands of professional automation templates.
            Download entire collections and accelerate your workflow automation journey.
          </p>
        </div>

        {/* Access Status Banner */}
        {!isLoading && (
          <div className="mb-8 text-center">
            {isAdmin ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium">
                👑 Admin Access - Unlimited Downloads
              </div>
            ) : hasFreeAccess ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                🎁 Free Access Granted - Download All Templates
              </div>
            ) : hasPaid ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                ✓ Premium Member - Download All Templates
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium">
                <Lock className="w-4 h-4" />
                Subscribe to unlock all downloads
              </div>
            )}
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateBundles.map((bundle) => (
            <div
              key={bundle.id}
              className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Gradient accent */}
              <div
                className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${bundle.color}`}
              />

              {/* Content */}
              <div className="pt-2">
                <div className="text-4xl mb-4">{bundle.emoji}</div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {bundle.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {bundle.subtitle}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {bundle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Download Button */}
                <Button
                  onClick={() => handleDownload(bundle)}
                  disabled={isLoading || downloadingId === bundle.id}
                  className={`w-full bg-gradient-to-r ${bundle.color} hover:opacity-90 text-white border-0`}
                >
                  {downloadingId === bundle.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : !user ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Signup to Download
                    </>
                  ) : !canDownload && !isLoading ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Subscribe to Download
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA for non-subscribers */}
        {!canDownload && !isLoading && user && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Unlock all template bundles with a premium subscription
            </p>
            <Button
              onClick={() => navigate("/pricing")}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              View Pricing Plans
            </Button>
          </div>
        )}
      </div>
      
      {/* Payment Modal for non-paid users */}
      <PaymentRequiredModal 
        open={showPaymentModal} 
        onOpenChange={setShowPaymentModal} 
      />
    </section>
  );
};

export default BulkDownloadSection;
