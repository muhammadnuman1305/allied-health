"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  CalendarDays,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { VacationRequest } from "@/lib/api/admin/vacations/_model";
import {
  getMyVacationRequests$,
  createVacationRequest$,
  checkVacationOverlap$,
} from "@/lib/api/admin/vacations/_request";

const statusConfig = {
  1: {
    label: "Pending",
    color: "bg-signature-yellow/30 text-foreground border-signature-mustard",
    icon: Clock,
  },
  2: {
    label: "Approved",
    color: "bg-success/10 text-success border-success-border",
    icon: CheckCircle,
  },
  3: {
    label: "Rejected",
    color: "bg-destructive/10 text-destructive border-destructive/30",
    icon: XCircle,
  },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const calculateDays = (start: string, end: string) => {
  const diff = Math.abs(new Date(end).getTime() - new Date(start).getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

export default function VacationRequestsPage() {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data } = await getMyVacationRequests$();
      setRequests(data);
    } catch {
      toast.error("Failed to load vacation requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.startDate.includes(searchTerm) ||
      r.endDate.includes(searchTerm);
    const matchStatus = statusFilter === "all" || r.status === Number(statusFilter);
    return matchSearch && matchStatus;
  });

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 1).length,
    approved: requests.filter((r) => r.status === 2).length,
    rejected: requests.filter((r) => r.status === 3).length,
  };

  const handleCreate = async (payload: { startDate: string; endDate: string; reason: string }) => {
    await createVacationRequest$(payload);
    toast.success("Vacation request submitted");
    setIsCreateDialogOpen(false);
    fetchRequests();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-normal">Vacation Requests</h1>
          <p className="text-muted-foreground mt-1">Request and manage your vacation leave</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Request Leave</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Request Vacation Leave</DialogTitle></DialogHeader>
            <CreateRequestForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Requests"
          value={counts.total}
          icon={CalendarDays}
          loading={loading}
        />
        <StatsCard
          title="Pending"
          value={counts.pending}
          icon={Clock}
          loading={loading}
        />
        <StatsCard
          title="Approved"
          value={counts.approved}
          icon={CheckCircle}
          loading={loading}
        />
        <StatsCard
          title="Rejected"
          value={counts.rejected}
          icon={XCircle}
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="1">Pending</SelectItem>
            <SelectItem value="2">Approved</SelectItem>
            <SelectItem value="3">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Range</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-sm" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No vacation requests found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => {
                  const cfg = statusConfig[r.status as keyof typeof statusConfig];
                  const StatusIcon = cfg.icon;
                  const days = calculateDays(r.startDate, r.endDate);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(r.startDate)} – {formatDate(r.endDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {days} {days === 1 ? "day" : "days"}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm text-muted-foreground">{r.reason}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${cfg.color} border`} variant="outline">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDate(r.submittedDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.reviewedByName ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => { setSelectedRequest(r); setIsViewDialogOpen(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Request Details</DialogTitle></DialogHeader>
          {selectedRequest && <RequestDetailView request={selectedRequest} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateRequestForm({
  onSubmit,
}: {
  onSubmit: (data: { startDate: string; endDate: string; reason: string }) => Promise<void>;
}) {
  const today = new Date().toISOString().split("T")[0];
  const endOfYear = `${new Date().getFullYear()}-12-31`;

  const [formData, setFormData] = useState({ startDate: "", endDate: "", reason: "" });
  const [overlapping, setOverlapping] = useState<VacationRequest[]>([]);
  const [checkingOverlap, setCheckingOverlap] = useState(false);
  const [datesChecked, setDatesChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const runOverlapCheck = useCallback(async (start: string, end: string) => {
    if (!start || !end || start > end) { setOverlapping([]); setDatesChecked(false); return; }
    setCheckingOverlap(true);
    setDatesChecked(false);
    try {
      const { data } = await checkVacationOverlap$(start, end);
      setOverlapping(data);
      setDatesChecked(true);
    } catch {
      setOverlapping([]);
    } finally {
      setCheckingOverlap(false);
    }
  }, []);

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (updated.startDate && updated.endDate) {
      runOverlapCheck(updated.startDate, updated.endDate);
    } else {
      setOverlapping([]);
      setDatesChecked(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error("All fields are required");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      toast.error(err?.response?.data || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const hasOverlap = overlapping.length > 0;
  const canSubmit = !submitting && !checkingOverlap && !hasOverlap;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            required
            min={today}
            max={endOfYear}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
            required
            min={formData.startDate || today}
            max={endOfYear}
          />
        </div>
      </div>

      {/* Overlap feedback */}
      {checkingOverlap && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking for conflicts...
        </div>
      )}

      {!checkingOverlap && hasOverlap && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">
              {overlapping.length} overlapping request{overlapping.length > 1 ? "s" : ""} already exist{overlapping.length === 1 ? "s" : ""}:
            </p>
            <ul className="space-y-1.5">
              {overlapping.map((v) => {
                const cfg = statusConfig[v.status as keyof typeof statusConfig];
                return (
                  <li key={v.id} className="flex items-center gap-2 text-sm">
                    <Badge className={`${cfg.color} border text-xs`} variant="outline">
                      {cfg.label}
                    </Badge>
                    <span>{formatDate(v.startDate)} – {formatDate(v.endDate)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs">Adjust your dates to avoid conflicts before submitting.</p>
          </AlertDescription>
        </Alert>
      )}

      {!checkingOverlap && datesChecked && !hasOverlap && (
        <div className="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle className="h-4 w-4" />
          No conflicts for selected dates
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="reason">Reason *</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Provide a reason for your leave request..."
          required
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Allowed range: today – {endOfYear}
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {submitting
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
          : "Submit Request"}
      </Button>
    </form>
  );
}

function RequestDetailView({ request }: { request: VacationRequest }) {
  const cfg = statusConfig[request.status as keyof typeof statusConfig];
  const StatusIcon = cfg.icon;
  const days = calculateDays(request.startDate, request.endDate);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b">
        <Badge className={`${cfg.color} border`} variant="outline">
          <StatusIcon className="h-3 w-3 mr-1" />{cfg.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Submitted: {formatDate(request.submittedDate)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
          <p className="font-medium">{formatDate(request.startDate)}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
          <p className="font-medium">{formatDate(request.endDate)}</p>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
        <p>{days} {days === 1 ? "day" : "days"}</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
        <div className="bg-muted/50 rounded-lg p-4 border">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.reason}</p>
        </div>
      </div>

      {request.reviewedByName && (
        <div className="space-y-3 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Reviewed By</Label>
              <p className="text-sm">{request.reviewedByName}</p>
            </div>
            {request.reviewedDate && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Review Date</Label>
                <p className="text-sm">{formatDate(request.reviewedDate)}</p>
              </div>
            )}
          </div>
          {request.rejectionReason && (
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Rejection Reason</Label>
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {request.rejectionReason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
