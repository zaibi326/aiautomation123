import { Globe, Clock, Shield, AlertCircle, CheckCircle2, Info } from "lucide-react";

const InternationalPaymentGuide = () => {
  const countries = [
    { flag: "🇺🇸", name: "USA", method: "SWIFT Transfer", time: "2-3 business days", fee: "$15-25" },
    { flag: "🇬🇧", name: "UK", method: "SWIFT Transfer", time: "2-3 business days", fee: "£10-20" },
    { flag: "🇪🇺", name: "Europe", method: "SWIFT/SEPA", time: "1-3 business days", fee: "€10-20" },
    { flag: "🇦🇪", name: "UAE", method: "SWIFT Transfer", time: "1-2 business days", fee: "AED 50-100" },
    { flag: "🇸🇦", name: "Saudi Arabia", method: "SWIFT Transfer", time: "1-2 business days", fee: "SAR 50-75" },
    { flag: "🇮🇳", name: "India", method: "SWIFT Transfer", time: "2-4 business days", fee: "₹500-1000" },
    { flag: "🇨🇦", name: "Canada", method: "SWIFT Transfer", time: "2-3 business days", fee: "CAD 15-30" },
    { flag: "🇦🇺", name: "Australia", method: "SWIFT Transfer", time: "2-3 business days", fee: "AUD 20-35" },
  ];

  const steps = [
    {
      icon: Globe,
      title: "Visit Your Bank",
      description: "Go to your bank branch or use online banking for international transfers",
    },
    {
      icon: Info,
      title: "Select Wire Transfer",
      description: "Choose 'International Wire Transfer' or 'SWIFT Transfer' option",
    },
    {
      icon: Shield,
      title: "Enter Details",
      description: "Use our IBAN and SWIFT code. Double-check all information",
    },
    {
      icon: CheckCircle2,
      title: "Confirm & Send",
      description: "Review the amount, fees, and submit your transfer",
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <Globe className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">International Payment Guide</h3>
          <p className="text-sm text-muted-foreground">Step-by-step instructions for your country</p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div
              key={index}
              className="relative p-4 rounded-xl bg-muted/30 border border-border"
            >
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <IconComponent className="w-5 h-5 text-primary mb-2" />
              <h4 className="font-semibold text-foreground text-sm mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          );
        })}
      </div>

      {/* Country-wise info */}
      <div className="mb-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Transfer Times & Fees by Country
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {countries.map((country) => (
            <div
              key={country.name}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-2xl">{country.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{country.name}</p>
                <p className="text-xs text-muted-foreground">{country.method}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">{country.time}</p>
                <p className="text-xs text-muted-foreground">~{country.fee}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-2">Important Notes</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Bank fees vary by institution. Contact your bank for exact fees.</li>
              <li>• Always use our SWIFT code: <span className="font-mono font-semibold text-foreground">UNILPKKAXXX</span></li>
              <li>• Include your email in payment reference for faster verification.</li>
              <li>• Transfer in USD for best exchange rates.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalPaymentGuide;
