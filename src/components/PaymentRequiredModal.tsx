import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock, Crown, Zap, Check } from "lucide-react";

interface PaymentRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentRequiredModal = ({ open, onOpenChange }: PaymentRequiredModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Premium Feature
          </DialogTitle>
          <DialogDescription className="text-center">
            Download کرنے کے لیے paid plan لینا ضروری ہے
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Plans Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-semibold">Basic</span>
              </div>
              <p className="text-2xl font-bold text-foreground">$20</p>
              <p className="text-xs text-muted-foreground">One Month</p>
            </div>
            <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 relative">
              <div className="absolute -top-2 right-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                  Popular
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-primary" />
                <span className="font-semibold">Pro</span>
              </div>
              <p className="text-2xl font-bold text-primary">$50</p>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">آپ کو ملے گا:</p>
            <ul className="space-y-1.5">
              {[
                "15,000+ Automation Templates",
                "Step-by-Step Video Guides",
                "Lifetime Updates (Pro)",
                "Email & Chat Support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <Link to="/pricing" className="w-full">
            <Button variant="hero" size="lg" className="w-full">
              View Plans & Pay
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentRequiredModal;
