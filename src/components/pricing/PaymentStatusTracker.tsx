import { useState } from "react";
import { Search, Clock, CheckCircle2, XCircle, Loader2, Mail, Bitcoin, Building2, Copy, MessageCircle, Paperclip, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentStatus {
  id: string;
  name: string;
  email: string;
  plan_selected: string;
  amount: string;
  status: string;
  created_at: string;
  transaction_id: string | null;
}

type PaymentOption = "binance" | "bank_transfer" | "show_bank_details" | null;

const WHATSAPP_NUMBER = "923059694651";

const PaymentStatusTracker = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<PaymentStatus[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption>(null);
  const [rejectedPaymentId, setRejectedPaymentId] = useState<string | null>(null);

  const searchPayments = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from("payment_submissions")
        .select("id, name, email, plan_selected, amount, status, created_at, transaction_id")
        .eq("email", email.toLowerCase().trim())
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      
      if (!data || data.length === 0) {
        toast.info("No payment records found for this email");
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
      toast.error("Failed to fetch payment status");
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "pending":
      case "processing":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "rejected":
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "completed":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "pending":
      case "processing":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "rejected":
      case "failed":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const sendWhatsAppNotification = (payment: PaymentStatus) => {
    const message = encodeURIComponent(
      `🔴 Payment Rejected\n\nHi, my payment was rejected.\n\nDetails:\n- Name: ${payment.name}\n- Email: ${payment.email}\n- Plan: ${payment.plan_selected}\n- Amount: ${payment.amount}\n- Date: ${formatDate(payment.created_at)}\n\nI would like to retry payment. Please assist.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const openWhatsAppWithAttachment = (payment: PaymentStatus) => {
    const message = encodeURIComponent(
      `💳 Bank Transfer Payment\n\nHi, I've made a bank transfer payment.\n\nDetails:\n- Name: ${payment.name}\n- Email: ${payment.email}\n- Plan: ${payment.plan_selected}\n- Amount: ${payment.amount}\n\n📎 Please find my payment slip attached.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handlePaymentOptionSelect = (option: PaymentOption, payment: PaymentStatus) => {
    setSelectedPaymentOption(option);
    setRejectedPaymentId(payment.id);
    
    if (option === "binance") {
      // Show Binance option and then WhatsApp
      setTimeout(() => {
        sendWhatsAppNotification(payment);
      }, 500);
    }
    // For bank_transfer, the component will show bank details
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Search className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Track Payment Status</h3>
          <p className="text-sm text-muted-foreground">Check your payment verification status</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchPayments()}
            className="pl-10"
          />
        </div>
        <Button onClick={searchPayments} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Track
        </Button>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No payments found</p>
              <p className="text-sm">
                Make sure you've entered the correct email address
              </p>
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {payment.plan_selected}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusIcon(payment.status)}
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Amount</p>
                    <p className="font-medium text-foreground">{payment.amount}</p>
                  </div>
                  {payment.transaction_id && (
                    <div>
                      <p className="text-muted-foreground text-xs">Transaction ID</p>
                      <p className="font-mono text-foreground text-xs">
                        {payment.transaction_id}
                      </p>
                    </div>
                  )}
                </div>

                {payment.status.toLowerCase() === "pending" && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ⏳ Your payment is being verified. This usually takes 24-48 hours.
                    </p>
                  </div>
                )}

                {payment.status.toLowerCase() === "rejected" && (
                  <div className="mt-3 space-y-3">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                        ❌ Your payment was not approved. Please select a payment method to retry:
                      </p>
                      
                      {/* Payment Options */}
                      {rejectedPaymentId !== payment.id && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                            onClick={() => handlePaymentOptionSelect("binance", payment)}
                          >
                            <Bitcoin className="w-4 h-4" />
                            Binance
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                            onClick={() => handlePaymentOptionSelect("bank_transfer", payment)}
                          >
                            <Building2 className="w-4 h-4" />
                            Bank Transfer
                          </Button>
                        </div>
                      )}

                      {/* Binance Selected */}
                      {rejectedPaymentId === payment.id && selectedPaymentOption === "binance" && (
                        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                            💰 Contact us on WhatsApp for Binance payment details
                          </p>
                          <Button
                            size="sm"
                            className="w-full gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => sendWhatsAppNotification(payment)}
                          >
                            <MessageCircle className="w-4 h-4" />
                            Open WhatsApp
                          </Button>
                        </div>
                      )}

                      {/* Bank Transfer Selected - Show WhatsApp First */}
                      {rejectedPaymentId === payment.id && selectedPaymentOption === "bank_transfer" && (
                        <div className="mt-3 space-y-3">
                          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                              📱 WhatsApp پر آئیں اور payment slip بھیجیں
                            </p>
                            <Button
                              size="sm"
                              className="w-full gap-2 bg-green-600 hover:bg-green-700"
                              onClick={() => openWhatsAppWithAttachment(payment)}
                            >
                              <Paperclip className="w-4 h-4" />
                              WhatsApp پر Slip بھیجیں
                            </Button>
                          </div>
                          
                          <button 
                            className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                            onClick={() => handlePaymentOptionSelect("show_bank_details", payment)}
                          >
                            <ChevronDown className="w-4 h-4" />
                            International Bank Transfer Details دیکھیں
                          </button>
                        </div>
                      )}

                      {/* Show Bank Details for International */}
                      {rejectedPaymentId === payment.id && selectedPaymentOption === "show_bank_details" && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                            🌍 International Bank Transfer Details:
                          </p>
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Bank</p>
                            <p className="text-xs font-medium text-foreground">United Bank Limited (UBL)</p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">Account Title</p>
                                <p className="text-xs font-medium text-foreground">Zohaib Anwar</p>
                              </div>
                              <button onClick={() => copyToClipboard("Zohaib Anwar")} className="p-1 rounded hover:bg-primary/10">
                                <Copy className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">IBAN</p>
                                <p className="text-xs font-medium text-foreground">PK52UNIL0109000318793263</p>
                              </div>
                              <button onClick={() => copyToClipboard("PK52UNIL0109000318793263")} className="p-1 rounded hover:bg-primary/10">
                                <Copy className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">SWIFT/BIC Code</p>
                                <p className="text-xs font-medium text-foreground">UNLORUPKXXX</p>
                              </div>
                              <button onClick={() => copyToClipboard("UNLORUPKXXX")} className="p-1 rounded hover:bg-primary/10">
                                <Copy className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">Branch</p>
                            <p className="text-xs font-medium text-foreground">Sadiq Abad Gallah Mandi Branch, Pakistan</p>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2 gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => openWhatsAppWithAttachment(payment)}
                          >
                            <Paperclip className="w-4 h-4" />
                            WhatsApp پر Slip بھیجیں
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {payment.status.toLowerCase() === "approved" && (
                  <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      ✅ Payment verified! Check your email for access instructions.
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentStatusTracker;
