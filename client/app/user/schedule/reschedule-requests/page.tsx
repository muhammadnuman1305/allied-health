"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Clock,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  FileText,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// Reschedule request interface
interface RescheduleRequest {
  id: string;
  taskId: string;
  taskTitle: string;
  patientId?: string;
  patientName?: string;
  originalDate: string;
  originalTime?: string;
  requestedDate: string;
  requestedTime?: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

// Mock data
const mockRescheduleRequests: RescheduleRequest[] = [
  {
    id: "R001",
    taskId: "T001",
    taskTitle: "Nutrition Assessment - John Smith",
    patientId: "P001",
    patientName: "John Smith",
    originalDate: "2024-01-20",
    originalTime: "10:00",
    requestedDate: "2024-01-22",
    requestedTime: "14:00",
    reason: "Conflicting appointment with another patient",
    status: "pending",
    submittedDate: "2024-01-15",
  },
  {
    id: "R002",
    taskId: "T002",
    taskTitle: "Physical Therapy Session - Maria Garcia",
    patientId: "P002",
    patientName: "Maria Garcia",
    originalDate: "2024-01-25",
    originalTime: "09:00",
    requestedDate: "2024-01-26",
    requestedTime: "11:00",
    reason:
      "Patient requested different time due to transportation availability",
    status: "approved",
    submittedDate: "2024-01-18",
    reviewedBy: "Dr. Sarah Johnson",
    reviewedDate: "2024-01-19",
  },
  {
    id: "R003",
    taskId: "T003",
    taskTitle: "Follow-up Consultation - Robert Wilson",
    patientId: "P003",
    patientName: "Robert Wilson",
    originalDate: "2024-02-01",
    originalTime: "15:00",
    requestedDate: "2024-02-02",
    requestedTime: "10:00",
    reason: "Personal emergency requires schedule adjustment",
    status: "rejected",
    submittedDate: "2024-01-20",
    reviewedBy: "Dr. Sarah Johnson",
    reviewedDate: "2024-01-21",
    rejectionReason:
      "Requested time slot is already booked. Please choose an alternative time.",
  },
  {
    id: "R004",
    taskId: "T004",
    taskTitle: "Diabetes Management Session",
    originalDate: "2024-02-05",
    originalTime: "13:00",
    requestedDate: "2024-02-06",
    requestedTime: "13:00",
    reason: "Need to attend mandatory training session",
    status: "pending",
    submittedDate: "2024-01-22",
  },
];

const statusConfig = {
  pending: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: XCircle,
  },
};

export default function RescheduleRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RescheduleRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] =
    useState<RescheduleRequest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    // In real app, fetch requests where userId === user.id
    setRequests(mockRescheduleRequests);
  }, [user]);

  // Filter requests
  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalDate.includes(searchTerm) ||
      item.requestedDate.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get request counts
  const requestCounts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const handleCreateRequest = (requestData: Partial<RescheduleRequest>) => {
    const newRequest: RescheduleRequest = {
      id: `R${Date.now()}`,
      taskId: requestData.taskId || "",
      taskTitle: requestData.taskTitle || "",
      patientId: requestData.patientId,
      patientName: requestData.patientName,
      originalDate: requestData.originalDate || "",
      originalTime: requestData.originalTime,
      requestedDate: requestData.requestedDate || "",
      requestedTime: requestData.requestedTime,
      reason: requestData.reason || "",
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0],
    };
    setRequests([newRequest, ...requests]);
    setIsCreateDialogOpen(false);
    toast.success("Reschedule request submitted successfully");
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time?: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleNavigateToTask = (taskId: string) => {
    router.push(`/user/my-tasks`);
  };

  const handleNavigateToPatient = (patientId: string) => {
    if (patientId) {
      router.push(`/user/all-patients/${patientId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reschedule Requests</h1>
          <p className="text-muted-foreground mt-1">
            Request to reschedule tasks and appointments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Reschedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Reschedule</DialogTitle>
            </DialogHeader>
            <CreateRequestForm onSubmit={handleCreateRequest} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Requests"
          value={requestCounts.total}
          icon={Clock}
        />
        <StatsCard title="Pending" value={requestCounts.pending} icon={Clock} />
        <StatsCard
          title="Approved"
          value={requestCounts.approved}
          icon={CheckCircle}
        />
        <StatsCard
          title="Rejected"
          value={requestCounts.rejected}
          icon={XCircle}
          variant="destructive"
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">No requests found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const status =
              statusConfig[request.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;

            return (
              <Card key={request.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge
                              className={`${status.color} border`}
                              variant="outline"
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(request.submittedDate)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold leading-tight mb-1">
                            {request.taskTitle}
                          </h3>
                          {request.patientName && (
                            <p className="text-sm text-muted-foreground">
                              Patient: {request.patientName}
                            </p>
                          )}
                        </div>
                        <Dialog
                          open={isViewDialogOpen}
                          onOpenChange={setIsViewDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Request Details</DialogTitle>
                            </DialogHeader>
                            {selectedRequest && (
                              <RequestDetailView
                                request={selectedRequest}
                                onNavigateToTask={handleNavigateToTask}
                                onNavigateToPatient={handleNavigateToPatient}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Date/Time Change */}
                      <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Original Schedule
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(request.originalDate)}
                          </p>
                          {request.originalTime && (
                            <p className="text-xs text-muted-foreground">
                              {formatTime(request.originalTime)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <ArrowRight className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground mb-1">
                            Requested Schedule
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(request.requestedDate)}
                          </p>
                          {request.requestedTime && (
                            <p className="text-xs text-muted-foreground">
                              {formatTime(request.requestedTime)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Reason */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {request.reason}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigateToTask(request.taskId)}
                          className="text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1.5" />
                          View Task
                          <ArrowRight className="h-3 w-3 ml-1.5" />
                        </Button>
                        {request.patientId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleNavigateToPatient(request.patientId!)
                            }
                            className="text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1.5" />
                            View Patient
                            <ArrowRight className="h-3 w-3 ml-1.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Create Request Form Component
function CreateRequestForm({
  onSubmit,
}: {
  onSubmit: (data: Partial<RescheduleRequest>) => void;
}) {
  const [formData, setFormData] = useState({
    taskId: "",
    taskTitle: "",
    patientId: "",
    patientName: "",
    originalDate: "",
    originalTime: "",
    requestedDate: "",
    requestedTime: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    if (new Date(formData.requestedDate) < new Date()) {
      toast.error("Requested date cannot be in the past");
      return;
    }

    if (
      formData.originalDate &&
      new Date(formData.requestedDate) < new Date(formData.originalDate)
    ) {
      toast.error("Requested date must be after original date");
      return;
    }

    onSubmit(formData);
    setFormData({
      taskId: "",
      taskTitle: "",
      patientId: "",
      patientName: "",
      originalDate: "",
      originalTime: "",
      requestedDate: "",
      requestedTime: "",
      reason: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="taskId">Task ID *</Label>
          <Input
            id="taskId"
            value={formData.taskId}
            onChange={(e) =>
              setFormData({ ...formData, taskId: e.target.value })
            }
            placeholder="e.g., T001"
            required
          />
        </div>
        <div>
          <Label htmlFor="taskTitle">Task Title *</Label>
          <Input
            id="taskTitle"
            value={formData.taskTitle}
            onChange={(e) =>
              setFormData({ ...formData, taskTitle: e.target.value })
            }
            placeholder="Task title"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="originalDate">Original Date *</Label>
          <Input
            id="originalDate"
            type="date"
            value={formData.originalDate}
            onChange={(e) =>
              setFormData({ ...formData, originalDate: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="originalTime">Original Time (Optional)</Label>
          <Input
            id="originalTime"
            type="time"
            value={formData.originalTime}
            onChange={(e) =>
              setFormData({ ...formData, originalTime: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="requestedDate">Requested Date *</Label>
          <Input
            id="requestedDate"
            type="date"
            value={formData.requestedDate}
            onChange={(e) =>
              setFormData({ ...formData, requestedDate: e.target.value })
            }
            required
            min={
              formData.originalDate || new Date().toISOString().split("T")[0]
            }
          />
        </div>
        <div>
          <Label htmlFor="requestedTime">Requested Time (Optional)</Label>
          <Input
            id="requestedTime"
            type="time"
            value={formData.requestedTime}
            onChange={(e) =>
              setFormData({ ...formData, requestedTime: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason *</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Please provide a reason for rescheduling..."
          required
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Explain why you need to reschedule this task
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Submit Request
        </Button>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Request Detail View Component
function RequestDetailView({
  request,
  onNavigateToTask,
  onNavigateToPatient,
}: {
  request: RescheduleRequest;
  onNavigateToTask: (taskId: string) => void;
  onNavigateToPatient: (patientId: string) => void;
}) {
  const status = statusConfig[request.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time?: string): string => {
    if (!time) return "Not specified";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Badge className={`${status.color} border`} variant="outline">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          Submitted: {formatDate(request.submittedDate)}
        </span>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-muted-foreground">
          Task
        </Label>
        <p className="text-base font-semibold">{request.taskTitle}</p>
        <p className="text-xs text-muted-foreground">
          Task ID: {request.taskId}
        </p>
      </div>

      {request.patientName && (
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">
            Patient
          </Label>
          <p className="text-base">
            {request.patientName}
            {request.patientId && (
              <span className="text-sm text-muted-foreground ml-2">
                ({request.patientId})
              </span>
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Original Schedule
          </Label>
          <p className="text-base font-semibold mt-1">
            {formatDate(request.originalDate)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatTime(request.originalTime)}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Requested Schedule
          </Label>
          <p className="text-base font-semibold mt-1">
            {formatDate(request.requestedDate)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatTime(request.requestedTime)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">
          Reason
        </Label>
        <div className="bg-muted/50 rounded-lg p-4 border">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {request.reason}
          </p>
        </div>
      </div>

      {request.reviewedBy && (
        <div className="space-y-2 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Reviewed By
              </Label>
              <p className="text-sm">{request.reviewedBy}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                Review Date
              </Label>
              <p className="text-sm">{formatDate(request.reviewedDate!)}</p>
            </div>
          </div>
          {request.rejectionReason && (
            <div className="space-y-1 mt-4">
              <Label className="text-sm font-medium text-muted-foreground">
                Rejection Reason
              </Label>
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {request.rejectionReason}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="pt-4 border-t flex gap-3">
        <Button
          variant="default"
          onClick={() => onNavigateToTask(request.taskId)}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          View Task
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        {request.patientId && (
          <Button
            variant="outline"
            onClick={() => onNavigateToPatient(request.patientId!)}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Patient
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
