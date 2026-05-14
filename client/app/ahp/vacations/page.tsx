"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  VacationRequest,
} from "@/lib/api/admin/vacations/_model";
import {
  getAllVacationRequests$,
  reviewVacationRequest$,
} from "@/lib/api/admin/vacations/_request";

const statusConfig = {
  1: {
    label: "Pending",
    color:
      "bg-signature-yellow/30 text-foreground border-signature-mustard",
    icon: Clock,
  },
  2: {
    label: "Approved",
    color:
      "bg-success/10 text-success border-success-border",
    icon: CheckCircle,
  },
  3: {
    label: "Rejected",
    color:
      "bg-destructive/10 text-destructive border-destructive/30",
    icon: XCircle,
  },
};

export default function AHPVacationsPage() {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<VacationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const { data } = await getAllVacationRequests$();
      setRequests(data);
    } catch {
      toast.error("Failed to load vacation requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      item.ahaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.startDate.includes(searchTerm) ||
      item.endDate.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || item.status === Number(statusFilter);
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 1).length,
    approved: requests.filter((r) => r.status === 2).length,
    rejected: requests.filter((r) => r.status === 3).length,
  };

  const handleApprove = async (req: VacationRequest) => {
    setSubmitting(true);
    try {
      await reviewVacationRequest$({ id: req.id, approve: true });
      toast.success(`Approved vacation request for ${req.ahaName}`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data || "Failed to approve request");
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectDialog = (req: VacationRequest) => {
    setRejectTarget(req);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setSubmitting(true);
    try {
      await reviewVacationRequest$({
        id: rejectTarget.id,
        approve: false,
        rejectionReason,
      });
      toast.success(`Rejected vacation request for ${rejectTarget.ahaName}`);
      setIsRejectDialogOpen(false);
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data || "Failed to reject request");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDays = (start: string, end: string) => {
    const diff = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-normal">Vacation Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage assistant vacation requests
        </p>
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
            placeholder="Search by assistant name, reason..."
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

      {/* Requests table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assistant</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
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
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-8 rounded-sm" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => {
                  const cfg = statusConfig[request.status as keyof typeof statusConfig];
                  const StatusIcon = cfg.icon;
                  const days = calculateDays(request.startDate, request.endDate);

                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {request.ahaName}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(request.startDate)} – {formatDate(request.endDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {days} {days === 1 ? "day" : "days"}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm text-muted-foreground">
                          {request.reason}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${cfg.color} border`} variant="outline">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(request.submittedDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {request.reviewedByName ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>

                              {request.status === 1 && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(request)}
                                    disabled={submitting}
                                    className="text-success focus:text-success"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openRejectDialog(request)}
                                    disabled={submitting}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <RequestDetailView
              request={selectedRequest}
              onApprove={() => {
                setIsViewDialogOpen(false);
                handleApprove(selectedRequest);
              }}
              onReject={() => {
                setIsViewDialogOpen(false);
                openRejectDialog(selectedRequest);
              }}
              submitting={submitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reject Vacation Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {rejectTarget && (
              <p className="text-sm text-muted-foreground">
                Rejecting vacation request from <strong>{rejectTarget.ahaName}</strong> for{" "}
                {new Date(rejectTarget.startDate).toLocaleDateString()} –{" "}
                {new Date(rejectTarget.endDate).toLocaleDateString()}
              </p>
            )}
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection (optional)..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={submitting}
                className="flex-1"
              >
                Confirm Reject
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestDetailView({
  request,
  onApprove,
  onReject,
  submitting,
}: {
  request: VacationRequest;
  onApprove: () => void;
  onReject: () => void;
  submitting: boolean;
}) {
  const cfg = statusConfig[request.status as keyof typeof statusConfig];
  const StatusIcon = cfg.icon;

  const calculateDays = (start: string, end: string) => {
    const diff = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const days = calculateDays(request.startDate, request.endDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Badge className={`${cfg.color} border`} variant="outline">
            <StatusIcon className="h-3 w-3 mr-1" />
            {cfg.label}
          </Badge>
          <span className="text-sm font-medium flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {request.ahaName}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          Submitted: {formatDate(request.submittedDate)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
          <p className="text-base font-medium">{formatDate(request.startDate)}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
          <p className="text-base font-medium">{formatDate(request.endDate)}</p>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
        <p className="text-base">{days} {days === 1 ? "day" : "days"}</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
        <div className="bg-muted/50 rounded-lg p-4 border">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.reason}</p>
        </div>
      </div>

      {request.reviewedByName && (
        <div className="space-y-2 pt-4 border-t">
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
            <div className="space-y-1 mt-4">
              <Label className="text-sm font-medium text-muted-foreground">Rejection Reason</Label>
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {request.rejectionReason}
              </p>
            </div>
          )}
        </div>
      )}

      {request.status === 1 && (
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            className="flex-1 text-success border-success-border hover:bg-success/10"
            onClick={onApprove}
            disabled={submitting}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={onReject}
            disabled={submitting}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
