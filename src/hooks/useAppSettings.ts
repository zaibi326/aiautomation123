import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppSettings {
  allow_user_downloads: boolean;
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    allow_user_downloads: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .select("key, value");

      if (!error && data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((item: { key: string; value: string }) => {
          settingsMap[item.key] = item.value;
        });

        setSettings({
          allow_user_downloads: settingsMap.allow_user_downloads !== "false",
        });
      }
    } catch (error) {
      console.error("Error fetching app settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from("app_settings")
        .update({ value })
        .eq("key", key);

      if (error) {
        console.error("Error updating setting:", error);
        return false;
      }

      await fetchSettings();
      return true;
    } catch (error) {
      console.error("Error updating setting:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, updateSetting, refetch: fetchSettings };
};
