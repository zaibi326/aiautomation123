import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  Zap,
  Activity,
  Settings,
  Download,
  LayoutDashboard,
  UserPlus,
  Trash2,
  Gift,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useFreeAccess } from "@/hooks/useFreeAccess";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import AutomationManager from "@/components/admin/AutomationManager";

interface PaymentSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  plan_selected: string;
  payment_method: string;
  transaction_id: string | null;
  amount: string;
  receipt_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface LoginAttempt {
  id: string;
  email: string;
  user_id: string | null;
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  login_type: string;
  failure_reason: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: <Clock className="w-3 h-3" /> },
  approved: { label: "Approved", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle className="w-3 h-3" /> },
};

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<PaymentSubmission[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [filteredLoginAttempts, setFilteredLoginAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { settings, updateSetting, loading: settingsLoading } = useAppSettings();
  const { freeAccessUsers, fetchFreeAccessUsers, grantFreeAccess, revokeFreeAccess } = useFreeAccess();
  const [updatingDownloadSetting, setUpdatingDownloadSetting] = useState(false);
  const [newFreeAccessEmail, setNewFreeAccessEmail] = useState("");
  const [newFreeAccessNotes, setNewFreeAccessNotes] = useState("");
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [loadingFreeAccess, setLoadingFreeAccess] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching submissions:", error);
        toast.error("Failed to load submissions");
      } else {
        setSubmissions(data || []);
        setFilteredSubmissions(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginAttempts = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from("login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching login attempts:", error);
        toast.error("Failed to load login logs");
      } else {
        setLoginAttempts(data || []);
        setFilteredLoginAttempts(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load login logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadFreeAccessUsers = async () => {
    setLoadingFreeAccess(true);
    await fetchFreeAccessUsers();
    setLoadingFreeAccess(false);
  };

  useEffect(() => {
    fetchSubmissions();
    fetchLoginAttempts();
    loadFreeAccessUsers();
  }, []);

  const handleGrantFreeAccess = async () => {
    if (!newFreeAccessEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setGrantingAccess(true);
    const result = await grantFreeAccess(newFreeAccessEmail.trim(), newFreeAccessNotes.trim() || undefined);
    
    if (result.success) {
      toast.success("Free access granted successfully!");
      setNewFreeAccessEmail("");
      setNewFreeAccessNotes("");
    } else {
      toast.error(result.error || "Failed to grant access");
    }
    setGrantingAccess(false);
  };

  const handleRevokeFreeAccess = async (accessId: string, userEmail: string) => {
    const result = await revokeFreeAccess(accessId);
    if (result.success) {
      toast.success(`Access revoked for ${userEmail}`);
    } else {
      toast.error(result.error || "Failed to revoke access");
    }
  };

  useEffect(() => {
    let filtered = submissions;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.transaction_id?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [searchQuery, statusFilter, submissions]);

  useEffect(() => {
    let filtered = loginAttempts;

    // Apply search filter
    if (logSearchQuery) {
      const query = logSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) => l.email.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (logTypeFilter !== "all") {
      if (logTypeFilter === "success") {
        filtered = filtered.filter((l) => l.success);
      } else if (logTypeFilter === "failed") {
        filtered = filtered.filter((l) => !l.success);
      } else {
        filtered = filtered.filter((l) => l.login_type === logTypeFilter);
      }
    }

    setFilteredLoginAttempts(filtered);
  }, [logSearchQuery, logTypeFilter, loginAttempts]);

  const updateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("payment_submissions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update status");
      } else {
        toast.success(`Status updated to ${newStatus}`);
        // Update local state
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
        if (selectedSubmission?.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    totalAmount: submissions
      .filter((s) => s.status === "approved")
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0),
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Control Panel
                </h1>
              </div>
            </div>

            {/* Admin Tabs */}
            <Tabs defaultValue="payments" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="automations" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Automations
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Security Logs
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="payments">
                <div className="flex justify-end mb-6">
                  <Button onClick={fetchSubmissions} variant="outline" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">${stats.totalAmount}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">No submissions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((submission) => {
                        const status = statusConfig[submission.status] || statusConfig.pending;
                        return (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{submission.name}</p>
                                <p className="text-sm text-muted-foreground">{submission.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {submission.plan_selected}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">${submission.amount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground capitalize">
                              {submission.payment_method.replace(/_/g, " ")}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${status.color} border gap-1`}>
                                {status.icon}
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(submission.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
              </TabsContent>

              <TabsContent value="automations">
                <AutomationManager />
              </TabsContent>

              <TabsContent value="security">
                <div className="flex justify-end mb-6">
                  <Button onClick={fetchLoginAttempts} variant="outline" disabled={loadingLogs}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingLogs ? "animate-spin" : ""}`} />
                    Refresh Logs
                  </Button>
                </div>

                {/* Security Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{loginAttempts.length}</p>
                    <p className="text-sm text-muted-foreground">Total Attempts</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {loginAttempts.filter((l) => l.success).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Successful</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {loginAttempts.filter((l) => !l.success).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {loginAttempts.filter((l) => l.login_type === "admin").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Admin Attempts</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email..."
                      value={logSearchQuery}
                      onChange={(e) => setLogSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">All Attempts</SelectItem>
                      <SelectItem value="success">Successful</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="user">User Login</SelectItem>
                      <SelectItem value="admin">Admin Login</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  {loadingLogs ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : filteredLoginAttempts.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-muted-foreground">No login attempts found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Failure Reason</TableHead>
                            <TableHead>Date/Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLoginAttempts.map((attempt) => (
                            <TableRow key={attempt.id}>
                              <TableCell>
                                <p className="font-medium text-foreground">{attempt.email}</p>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={attempt.login_type === "admin" 
                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20" 
                                    : ""}
                                >
                                  {attempt.login_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={attempt.success 
                                    ? "bg-green-500/10 text-green-600 border-green-500/20 border gap-1" 
                                    : "bg-red-500/10 text-red-600 border-red-500/20 border gap-1"}
                                >
                                  {attempt.success ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Success
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3" />
                                      Failed
                                    </>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                {attempt.failure_reason || "-"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {format(new Date(attempt.created_at), "MMM d, yyyy h:mm a")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5" />
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/automations">
                        <Button variant="outline" className="gap-2">
                          <Zap className="w-4 h-4" />
                          View User Interface
                        </Button>
                      </Link>
                      <Link to="/dashboard">
                        <Button variant="outline" className="gap-2">
                          <Users className="w-4 h-4" />
                          View User Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* User Permissions */}
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      User Permissions
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">Allow User Downloads</p>
                          <p className="text-sm text-muted-foreground">
                            Enable or disable automation downloads for all users
                          </p>
                        </div>
                        <Switch
                          checked={settings.allow_user_downloads}
                          disabled={settingsLoading || updatingDownloadSetting}
                          onCheckedChange={async (checked) => {
                            setUpdatingDownloadSetting(true);
                            const success = await updateSetting("allow_user_downloads", checked ? "true" : "false");
                            if (success) {
                              toast.success(checked ? "User downloads enabled" : "User downloads disabled");
                            } else {
                              toast.error("Failed to update setting");
                            }
                            setUpdatingDownloadSetting(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grant Free Access */}
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Grant Free Download Access
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Grant download access to specific users without requiring payment
                    </p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="freeAccessEmail">User Email</Label>
                        <Input
                          id="freeAccessEmail"
                          type="email"
                          placeholder="user@example.com"
                          value={newFreeAccessEmail}
                          onChange={(e) => setNewFreeAccessEmail(e.target.value)}
                          disabled={grantingAccess}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freeAccessNotes">Notes (Optional)</Label>
                        <Textarea
                          id="freeAccessNotes"
                          placeholder="Reason for granting access..."
                          value={newFreeAccessNotes}
                          onChange={(e) => setNewFreeAccessNotes(e.target.value)}
                          disabled={grantingAccess}
                          rows={2}
                        />
                      </div>
                      <Button 
                        onClick={handleGrantFreeAccess}
                        disabled={grantingAccess || !newFreeAccessEmail.trim()}
                        className="gap-2"
                      >
                        {grantingAccess ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Granting...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Grant Free Access
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Users with Free Access */}
                  <div className="p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Users with Free Access
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadFreeAccessUsers}
                        disabled={loadingFreeAccess}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loadingFreeAccess ? "animate-spin" : ""}`} />
                        Refresh
                      </Button>
                    </div>
                    
                    {loadingFreeAccess ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : freeAccessUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No users have been granted free access yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {freeAccessUsers.map((access) => (
                          <div 
                            key={access.id} 
                            className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                          >
                            <div>
                              <p className="font-medium text-foreground">{access.user_email}</p>
                              <p className="text-xs text-muted-foreground">
                                Granted on {format(new Date(access.created_at), "MMM d, yyyy")}
                              </p>
                              {access.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{access.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeFreeAccess(access.id, access.user_email)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Submission Details</DialogTitle>
              <DialogDescription>
                Review and manage this payment submission
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Name</p>
                    <p className="font-medium text-foreground">{selectedSubmission.name}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="font-medium text-foreground">{selectedSubmission.email}</p>
                  </div>
                  {selectedSubmission.phone && (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <p className="font-medium text-foreground">{selectedSubmission.phone}</p>
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(selectedSubmission.created_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Plan</p>
                    <p className="font-medium text-foreground capitalize">{selectedSubmission.plan_selected}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="font-medium text-foreground">${selectedSubmission.amount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-medium text-foreground capitalize">
                      {selectedSubmission.payment_method.replace(/_/g, " ")}
                    </p>
                  </div>
                  {selectedSubmission.transaction_id && (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                      <p className="font-medium text-foreground">{selectedSubmission.transaction_id}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedSubmission.notes && (
                  <div className="p-4 rounded-xl bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-foreground">{selectedSubmission.notes}</p>
                  </div>
                )}

                {/* Receipt */}
                {selectedSubmission.receipt_url && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Receipt</p>
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img
                        src={selectedSubmission.receipt_url}
                        alt="Payment receipt"
                        className="w-full max-h-64 object-contain bg-muted"
                      />
                      <a
                        href={selectedSubmission.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-muted/50 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Image
                      </a>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-3">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedSubmission.status === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(selectedSubmission.id, "pending")}
                      disabled={isUpdating || selectedSubmission.status === "pending"}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Pending
                    </Button>
                    <Button
                      variant={selectedSubmission.status === "approved" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(selectedSubmission.id, "approved")}
                      disabled={isUpdating || selectedSubmission.status === "approved"}
                      className={selectedSubmission.status !== "approved" ? "hover:bg-green-500 hover:text-white" : "bg-green-500"}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant={selectedSubmission.status === "rejected" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(selectedSubmission.id, "rejected")}
                      disabled={isUpdating || selectedSubmission.status === "rejected"}
                      className={selectedSubmission.status !== "rejected" ? "hover:bg-red-500 hover:text-white" : "bg-red-500"}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
