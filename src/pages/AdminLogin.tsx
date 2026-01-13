import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if already logged in user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (!error && data?.some((r) => r.role === "admin")) {
          navigate("/admin", { replace: true });
        }
      }
    };
    checkAdminStatus();
  }, [user, navigate]);

  const logLoginAttempt = async (
    emailUsed: string,
    success: boolean,
    userId?: string,
    failureReason?: string
  ) => {
    try {
      await supabase.from("login_attempts").insert({
        email: emailUsed,
        user_id: userId || null,
        success,
        user_agent: navigator.userAgent,
        login_type: "admin",
        failure_reason: failureReason || null,
      });
    } catch (error) {
      console.error("Failed to log login attempt:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      await logLoginAttempt(email, false, undefined, "Validation failed");
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      let message = "An error occurred during sign in";
      if (error.message.includes("Invalid login credentials")) {
        message = "Invalid email or password";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Please confirm your email before signing in";
      }
      await logLoginAttempt(email, false, undefined, error.message);
      toast({
        title: "Sign In Failed",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if user has admin role
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id);

      if (roleError || !roles?.some((r) => r.role === "admin")) {
        // Not an admin, sign out and show error
        await logLoginAttempt(email, false, currentUser.id, "Not an admin");
        await signOut();
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges. Please use the regular login.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // User is admin, redirect to admin panel
      await logLoginAttempt(email, true, currentUser.id);
      toast({
        title: "Welcome Admin!",
        description: "You have successfully signed in.",
      });
      navigate("/admin");
    }
    
    setIsLoading(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-slate-400">
              Restricted access - Administrators only
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit"
                size="lg" 
                className="w-full bg-red-600 hover:bg-red-700 text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Not an admin?{" "}
              <Link to="/login" className="text-red-400 hover:underline font-medium">
                Go to regular login
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            This portal is for authorized administrators only.
            <br />
            Unauthorized access attempts are logged.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminLogin;