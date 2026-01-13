import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  expires_at: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setLoading(false);
        setHasPaid(false);
        return;
      }

      try {
        // Check for active subscription
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (subData) {
          // Check if subscription is still valid (not expired)
          const isValid = !subData.expires_at || new Date(subData.expires_at) > new Date();
          setSubscription(subData);
          setHasPaid(isValid);
        } else {
          setSubscription(null);
          setHasPaid(false);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        setHasPaid(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  return { subscription, loading, hasPaid };
};
