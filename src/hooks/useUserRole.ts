import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "moderator" | "user";

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchedUserId = useRef<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      if (!user) {
        setRoles([]);
        setIsAdmin(false);
        setLoading(false);
        fetchedUserId.current = null;
        return;
      }

      // Skip if we already fetched for this user
      if (fetchedUserId.current === user.id) {
        return;
      }

      setLoading(true);
      
      try {
        console.log("Fetching roles for user:", user.id);
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching roles:", error);
          setRoles([]);
          setIsAdmin(false);
        } else {
          const userRoles = data?.map((r) => r.role as AppRole) || [];
          console.log("User roles fetched:", userRoles);
          setRoles(userRoles);
          setIsAdmin(userRoles.includes("admin"));
          fetchedUserId.current = user.id;
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoles([]);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user, authLoading]);

  return { roles, isAdmin, loading };
};
