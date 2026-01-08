import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold hero-text">AutoFlow AI</span>
          </Link>
          <h1 className="text-2xl font-bold hero-text mb-2">
            Reset your password
          </h1>
          <p className="hero-text-muted">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl p-8 shadow-2xl">
          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to your email address.
              </p>
              <Link to="/login">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-12"
                    required
                  />
                </div>

                <Button variant="hero" size="lg" className="w-full">
                  Send Reset Link
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
