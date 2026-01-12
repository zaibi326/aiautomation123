import { useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PageTransition } from "@/components/PageTransition";
import { 
  Upload, 
  CheckCircle2, 
  Image as ImageIcon, 
  X, 
  ArrowLeft,
  Loader2,
  Building2,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const paymentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  phone: z.string().trim().optional(),
  plan_selected: z.string().min(1, "Please select a plan"),
  payment_method: z.string().min(1, "Please select payment method"),
  transaction_id: z.string().trim().max(100, "Transaction ID too long").optional(),
  amount: z.string().min(1, "Please enter amount"),
  notes: z.string().trim().max(500, "Notes too long").optional(),
});

const PaymentConfirmation = () => {
  const [searchParams] = useSearchParams();
  const defaultPlan = searchParams.get("plan") || "";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    plan_selected: defaultPlan,
    payment_method: "",
    transaction_id: "",
    amount: defaultPlan === "basic" ? "20" : defaultPlan === "pro" ? "50" : "",
    notes: "",
  });
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Auto-set amount based on plan
    if (field === "plan_selected") {
      if (value === "basic") {
        setFormData(prev => ({ ...prev, plan_selected: value, amount: "20" }));
      } else if (value === "pro") {
        setFormData(prev => ({ ...prev, plan_selected: value, amount: "50" }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form data
    const result = paymentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      let receiptUrl = null;

      // Upload receipt if provided
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-receipts')
          .upload(fileName, receiptFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Failed to upload receipt. Please try again.");
          setIsSubmitting(false);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('payment-receipts')
          .getPublicUrl(fileName);
        
        receiptUrl = publicUrl;
      }

      // Submit payment data
      const { error: insertError } = await supabase
        .from('payment_submissions')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || null,
          plan_selected: formData.plan_selected,
          payment_method: formData.payment_method,
          transaction_id: formData.transaction_id?.trim() || null,
          amount: formData.amount,
          receipt_url: receiptUrl,
          notes: formData.notes?.trim() || null,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        toast.error("Failed to submit payment. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      toast.success("Payment submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="pt-32 pb-16">
            <div className="container mx-auto px-4 max-w-lg">
              <div className="text-center p-10 rounded-3xl bg-card border border-border">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Payment Submitted!
                </h1>
                <p className="text-muted-foreground mb-8">
                  Thank you for your payment. We'll verify your payment and activate your account within 24 hours. 
                  You'll receive a confirmation email at <strong>{formData.email}</strong>.
                </p>
                <div className="space-y-3">
                  <Link to="/pricing">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Pricing
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="hero" className="w-full">
                      Go to Homepage
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            {/* Back Button */}
            <Link 
              to="/pricing" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Pricing
            </Link>

            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <CreditCard className="w-4 h-4" />
                Payment Confirmation
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                Confirm Your Payment
              </h1>
              <p className="text-muted-foreground">
                Fill in your details and upload your payment receipt
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-3xl bg-card border border-border">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</div>
                  Personal Details
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone / WhatsApp (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</div>
                  Plan Selection
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Plan *</Label>
                    <Select 
                      value={formData.plan_selected} 
                      onValueChange={(value) => handleInputChange("plan_selected", value)}
                    >
                      <SelectTrigger className={errors.plan_selected ? "border-destructive" : ""}>
                        <SelectValue placeholder="Choose a plan" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="basic">Basic Plan - $20 (One Month)</SelectItem>
                        <SelectItem value="pro">Pro Plan - $50 (Lifetime)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.plan_selected && <p className="text-xs text-destructive">{errors.plan_selected}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD) *</Label>
                    <Input
                      id="amount"
                      placeholder="50"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      className={errors.amount ? "border-destructive" : ""}
                    />
                    {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</div>
                  Payment Details
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Payment Method *</Label>
                    <Select 
                      value={formData.payment_method} 
                      onValueChange={(value) => handleInputChange("payment_method", value)}
                    >
                      <SelectTrigger className={errors.payment_method ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="bank_transfer_local">Bank Transfer (Local - PKR)</SelectItem>
                        <SelectItem value="bank_transfer_international">Bank Transfer (International - SWIFT)</SelectItem>
                        <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                        <SelectItem value="jazzcash">JazzCash</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.payment_method && <p className="text-xs text-destructive">{errors.payment_method}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transaction_id">Transaction ID / Reference</Label>
                    <Input
                      id="transaction_id"
                      placeholder="Transaction reference number"
                      value={formData.transaction_id}
                      onChange={(e) => handleInputChange("transaction_id", e.target.value)}
                    />
                  </div>
                </div>

                {/* Receipt Upload */}
                <div className="space-y-2">
                  <Label>Payment Receipt (Screenshot)</Label>
                  
                  {!receiptPreview ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                    >
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-primary" />
                      </div>
                      <p className="text-foreground font-medium mb-1">Click to upload receipt</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-border">
                      <img 
                        src={receiptPreview} 
                        alt="Receipt preview" 
                        className="w-full max-h-64 object-contain bg-muted"
                      />
                      <button
                        type="button"
                        onClick={removeReceipt}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="p-3 bg-muted/50 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground truncate">{receiptFile?.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Bank Details Reminder */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">UBL Bank Details</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Account: <strong>Zohaib Anwar</strong> | IBAN: <strong>PK52UNIL0109000318793263</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Submit Payment Confirmation
                  </>
                )}
              </Button>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default PaymentConfirmation;