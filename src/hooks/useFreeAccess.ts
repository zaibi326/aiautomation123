import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FreeAccessUser {
  id: string;
  user_id: string;
  user_email: string;
  granted_by: string;
  notes: string | null;
  created_at: string;
}

export const useFreeAccess = () => {
  const { user } = useAuth();
  const [hasFreeAccess, setHasFreeAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [freeAccessUsers, setFreeAccessUsers] = useState<FreeAccessUser[]>([]);

  // Check if current user has free access
  useEffect(() => {
    const checkFreeAccess = async () => {
      if (!user) {
        setHasFreeAccess(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_free_access")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking free access:", error);
          setHasFreeAccess(false);
        } else {
          setHasFreeAccess(!!data);
        }
      } catch (error) {
        console.error("Error:", error);
        setHasFreeAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkFreeAccess();
  }, [user]);

  // Fetch all users with free access (for admin)
  const fetchFreeAccessUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_free_access")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching free access users:", error);
        return [];
      }
      setFreeAccessUsers(data || []);
      return data || [];
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  // Grant free access to a user
  const grantFreeAccess = async (userEmail: string, notes?: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      // Check if user already has free access
      const { data: existingAccess } = await supabase
        .from("user_free_access")
        .select("*")
        .eq("user_email", userEmail.toLowerCase())
        .maybeSingle();

      if (existingAccess) {
        return { success: false, error: "User already has free access" };
      }

      // Find the user_id from login_attempts (users who have logged in)
      const { data: loginData } = await supabase
        .from("login_attempts")
        .select("user_id")
        .eq("email", userEmail.toLowerCase())
        .eq("success", true)
        .not("user_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const userId = loginData?.user_id;
      
      if (!userId) {
        return { success: false, error: "User not found. Make sure they have logged in at least once." };
      }

      const { error } = await supabase.from("user_free_access").insert({
        user_id: userId,
        user_email: userEmail,
        granted_by: user.id,
        notes: notes || null,
      });

      if (error) {
        console.error("Error granting free access:", error);
        return { success: false, error: error.message };
      }

      await fetchFreeAccessUsers();
      return { success: true };
    } catch (error: any) {
      console.error("Error:", error);
      return { success: false, error: error.message };
    }
  };

  // Revoke free access from a user
  const revokeFreeAccess = async (accessId: string) => {
    try {
      const { error } = await supabase
        .from("user_free_access")
        .delete()
        .eq("id", accessId);

      if (error) {
        console.error("Error revoking free access:", error);
        return { success: false, error: error.message };
      }

      await fetchFreeAccessUsers();
      return { success: true };
    } catch (error: any) {
      console.error("Error:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    hasFreeAccess,
    loading,
    freeAccessUsers,
    fetchFreeAccessUsers,
    grantFreeAccess,
    revokeFreeAccess,
  };
};
