import { useState, useEffect } from "react";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExchangeRates {
  [key: string]: number;
}

const CurrencyConverter = () => {
  const [amount, setAmount] = useState<number>(20);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PKR");
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Static exchange rates (fallback)
  const staticRates: ExchangeRates = {
    USD: 1,
    PKR: 278.50,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.67,
    SAR: 3.75,
    CAD: 1.36,
    AUD: 1.53,
    INR: 83.12,
  };

  const [rates, setRates] = useState<ExchangeRates>(staticRates);

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
    { code: "PKR", name: "Pakistani Rupee", symbol: "Rs", flag: "🇵🇰" },
    { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
    { code: "CAD", name: "Canadian Dollar", symbol: "$", flag: "🇨🇦" },
    { code: "AUD", name: "Australian Dollar", symbol: "$", flag: "🇦🇺" },
    { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  ];

  const fetchRates = async () => {
    setLoading(true);
    try {
      // Using a free API for exchange rates
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      if (response.ok) {
        const data = await response.json();
        setRates(data.rates);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.log("Using static rates as fallback");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (rates[fromCurrency] && rates[toCurrency]) {
      const fromRate = rates[fromCurrency];
      const toRate = rates[toCurrency];
      const converted = (amount / fromRate) * toRate;
      setConvertedAmount(converted);
    }
  }, [amount, fromCurrency, toCurrency, rates]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencyInfo = (code: string) => 
    currencies.find((c) => c.code === code);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Currency Converter</h3>
            <p className="text-xs text-muted-foreground">
              Check payment amount in your currency
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRates}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {getCurrencyInfo(fromCurrency)?.symbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-semibold"
                min="0"
              />
            </div>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-foreground"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={swapCurrencies}
            className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors mt-4"
          >
            <ArrowRightLeft className="w-4 h-4 text-primary" />
          </button>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Converted</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {getCurrencyInfo(toCurrency)?.symbol}
              </span>
              <div className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-foreground text-lg font-bold">
                {formatNumber(convertedAmount)}
              </div>
            </div>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm text-foreground"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground mr-2">Quick select:</span>
          {[20, 50].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => {
                setAmount(quickAmount);
                setFromCurrency("USD");
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                amount === quickAmount && fromCurrency === "USD"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              ${quickAmount} {quickAmount === 20 ? "(Basic)" : "(Pro)"}
            </button>
          ))}
        </div>

        {lastUpdated && (
          <p className="text-xs text-muted-foreground text-center">
            Rates updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
