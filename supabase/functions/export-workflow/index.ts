import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Plan limits
const PLAN_LIMITS: Record<string, number> = {
  basic: 20,
  pro: 100,
  agency: 300,
  lifetime: 100,
  admin: 999999,
};

// Rate limiting: max 10 exports per minute per user
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email || "unknown";

    // Rate limit
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { automationId } = await req.json();
    if (!automationId) {
      return new Response(JSON.stringify({ error: "automationId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if admin
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    // Get user's subscription plan
    let planType = "basic";
    if (isAdmin) {
      planType = "admin";
    } else {
      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("plan, status, expires_at")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (sub) {
        const isValid = !sub.expires_at || new Date(sub.expires_at) > new Date();
        if (isValid) planType = sub.plan?.toLowerCase() || "basic";
      }

      // Check free access
      if (planType === "basic") {
        const { data: freeAccess } = await supabase
          .from("user_free_access")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        if (freeAccess) planType = "basic"; // free access = basic limits
      }
    }

    const monthlyLimit = PLAN_LIMITS[planType] || PLAN_LIMITS.basic;

    // Get or create export limit record
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

    let { data: limitRecord } = await supabase
      .from("user_export_limits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!limitRecord) {
      const { data: newRecord } = await supabase
        .from("user_export_limits")
        .insert({ user_id: userId, exports_this_month: 0, last_reset_date: currentMonth })
        .select()
        .single();
      limitRecord = newRecord;
    } else {
      // Reset if new month
      const lastReset = new Date(limitRecord.last_reset_date);
      if (lastReset.getMonth() !== today.getMonth() || lastReset.getFullYear() !== today.getFullYear()) {
        const { data: updated } = await supabase
          .from("user_export_limits")
          .update({ exports_this_month: 0, last_reset_date: currentMonth })
          .eq("user_id", userId)
          .select()
          .single();
        limitRecord = updated;
      }
    }

    // Check limit
    if (limitRecord && limitRecord.exports_this_month >= monthlyLimit) {
      return new Response(
        JSON.stringify({
          error: "Monthly export limit reached",
          limit: monthlyLimit,
          used: limitRecord.exports_this_month,
          plan: planType,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the automation
    const { data: automation, error: autoErr } = await supabase
      .from("automations")
      .select("id, title, description, preview_json, icon")
      .eq("id", automationId)
      .eq("is_active", true)
      .maybeSingle();

    if (autoErr || !automation) {
      return new Response(JSON.stringify({ error: "Workflow not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate license token
    const licenseToken = crypto.randomUUID();

    // Add watermark metadata to the JSON
    const workflowJson = typeof automation.preview_json === "string"
      ? JSON.parse(automation.preview_json)
      : automation.preview_json || {};

    const watermarkedJson = {
      ...workflowJson,
      _license: {
        licensed_to: userEmail,
        user_id: userId,
        license_id: licenseToken,
        exported_at: new Date().toISOString(),
        workflow_title: automation.title,
        source: "AutoFlow AI - Licensed Export",
      },
    };

    // Record the export
    await supabase.from("workflow_exports").insert({
      user_id: userId,
      automation_id: automationId,
      user_email: userEmail,
      license_token: licenseToken,
    });

    // Increment counter
    await supabase
      .from("user_export_limits")
      .update({ exports_this_month: (limitRecord?.exports_this_month || 0) + 1 })
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        workflow: watermarkedJson,
        export_info: {
          license_id: licenseToken,
          exports_used: (limitRecord?.exports_this_month || 0) + 1,
          exports_limit: monthlyLimit,
          plan: planType,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Export error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
