import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ExportInfo {
  license_id: string;
  exports_used: number;
  exports_limit: number;
  plan: string;
}

export const useWorkflowExport = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [lastExportInfo, setLastExportInfo] = useState<ExportInfo | null>(null);

  const exportWorkflow = async (automationId: string, title: string) => {
    if (!user) {
      toast.error("Please login to export workflows");
      return null;
    }

    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-workflow", {
        body: { automationId },
      });

      if (error) throw error;

      if (data.error) {
        if (data.limit) {
          toast.error(`Monthly limit reached (${data.used}/${data.limit}). Upgrade your plan!`);
        } else {
          toast.error(data.error);
        }
        return null;
      }

      setLastExportInfo(data.export_info);

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data.workflow, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, "-")}-licensed.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        `Exported! (${data.export_info.exports_used}/${data.export_info.exports_limit} this month)`
      );
      return data;
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error("Export failed. Please try again.");
      return null;
    } finally {
      setExporting(false);
    }
  };

  return { exportWorkflow, exporting, lastExportInfo };
};
