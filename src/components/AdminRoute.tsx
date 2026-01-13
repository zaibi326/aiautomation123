import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  // Wait for both auth and role to finish loading
  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only check auth after loading is complete
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Only check admin after loading is complete
  if (!isAdmin) {
    console.log("User is not admin, redirecting to admin login");
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};
