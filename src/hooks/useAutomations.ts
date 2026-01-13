import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AutomationCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  created_at: string;
}

export interface AutomationSubcategory {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  icon: string;
  created_at: string;
}

export interface Automation {
  id: string;
  subcategory_id: string;
  title: string;
  description: string | null;
  icon: string;
  uses_count: number;
  download_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AutomationWithCategory extends Automation {
  subcategory?: AutomationSubcategory & { category?: AutomationCategory };
}

export const useAutomations = () => {
  const [categories, setCategories] = useState<AutomationCategory[]>([]);
  const [subcategories, setSubcategories] = useState<AutomationSubcategory[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("automation_categories")
      .select("*")
      .order("name");
    
    if (!error && data) {
      setCategories(data);
    }
    return data || [];
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase
      .from("automation_subcategories")
      .select("*")
      .order("name");
    
    if (!error && data) {
      setSubcategories(data);
    }
    return data || [];
  };

  const fetchAutomations = async () => {
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .order("title");
    
    if (!error && data) {
      setAutomations(data);
    }
    return data || [];
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchSubcategories(), fetchAutomations()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    categories,
    subcategories,
    automations,
    loading,
    refetch: fetchAll,
    fetchCategories,
    fetchSubcategories,
    fetchAutomations,
  };
};
