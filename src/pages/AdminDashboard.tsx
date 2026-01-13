import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
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

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: <Clock className="w-3 h-3" /> },
  approved: { label: "Approved", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle className="w-3 h-3" /> },
};

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  useEffect(() => {
    fetchSubmissions();
  }, []);

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
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Submissions
                </TabsTrigger>
                <TabsTrigger value="automations" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Automations
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
