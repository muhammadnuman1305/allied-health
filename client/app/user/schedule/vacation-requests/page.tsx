"use client";

import { useState, useEffect } from "react";
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
  Filter,
  CalendarDays,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// Vacation request interface
interface VacationRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: "vacation" | "sick" | "personal" | "other";
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

// Mock data
const mockVacationRequests: VacationRequest[] = [
  {
    id: "V001",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
    type: "vacation",
    reason: "Family vacation to celebrate anniversary",
    status: "approved",
    submittedDate: "2024-01-10",
    reviewedBy: "Dr. Sarah Johnson",
    reviewedDate: "2024-01-12",
  },
  {
    id: "V002",
    startDate: "2024-03-10",
    endDate: "2024-03-12",
    type: "sick",
    reason: "Medical appointment for routine checkup",
    status: "pending",
    submittedDate: "2024-01-15",
  },
  {
    id: "V003",
    startDate: "2024-04-05",
    endDate: "2024-04-08",
    type: "personal",
    reason: "Personal matters requiring attention",
    status: "pending",
    submittedDate: "2024-01-18",
  },
  {
    id: "V004",
    startDate: "2024-01-25",
    endDate: "2024-01-26",
    type: "sick",
    reason: "Emergency medical appointment",
    status: "rejected",
    submittedDate: "2024-01-20",
    reviewedBy: "Dr. Sarah Johnson",
    reviewedDate: "2024-01-21",
    rejectionReason:
      "Insufficient notice period. Please resubmit with at least 2 weeks notice.",
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

const typeConfig = {
  vacation: { label: "Vacation", color: "bg-blue-100 text-blue-800" },
  sick: { label: "Sick Leave", color: "bg-red-100 text-red-800" },
  personal: { label: "Personal", color: "bg-purple-100 text-purple-800" },
  other: { label: "Other", color: "bg-gray-100 text-gray-800" },
};

export default function VacationRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] =
    useState<VacationRequest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    // In real app, fetch requests where userId === user.id
    setRequests(mockVacationRequests);
  }, [user]);

  // Filter requests
  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.startDate.includes(searchTerm) ||
      item.endDate.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get request counts
  const requestCounts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const handleCreateRequest = (requestData: Partial<VacationRequest>) => {
    const newRequest: VacationRequest = {
      id: `V${Date.now()}`,
      startDate: requestData.startDate || "",
      endDate: requestData.endDate || "",
      type: (requestData.type || "vacation") as VacationRequest["type"],
      reason: requestData.reason || "",
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0],
    };
    setRequests([newRequest, ...requests]);
    setIsCreateDialogOpen(false);
    toast.success("Vacation request submitted successfully");
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vacation Requests</h1>
          <p className="text-muted-foreground mt-1">
            Request and manage your vacation and leave requests
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Vacation or Leave</DialogTitle>
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
          icon={CalendarDays}
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="vacation">Vacation</SelectItem>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="h-16 w-16 text-muted-foreground/50 mb-4" />
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
            const type = typeConfig[request.type];
            const StatusIcon = status.icon;
            const days = calculateDays(request.startDate, request.endDate);

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
                            <Badge variant="secondary" className="text-xs">
                              {type.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(request.submittedDate)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold leading-tight">
                              {formatDate(request.startDate)} -{" "}
                              {formatDate(request.endDate)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {days} {days === 1 ? "day" : "days"}
                            </p>
                          </div>
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
                              <RequestDetailView request={selectedRequest} />
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* Reason */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {request.reason}
                      </p>
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
  onSubmit: (data: Partial<VacationRequest>) => void;
}) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    type: "vacation" as VacationRequest["type"],
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    if (new Date(formData.startDate) < new Date()) {
      toast.error("Start date cannot be in the past");
      return;
    }

    onSubmit(formData);
    setFormData({
      startDate: "",
      endDate: "",
      type: "vacation",
      reason: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            required
            min={formData.startDate || new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="type">Leave Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as VacationRequest["type"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vacation">Vacation</SelectItem>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="personal">Personal Leave</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reason">Reason *</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Please provide a reason for your leave request..."
          required
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Provide details about why you need this leave
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Submit Request
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Dialog will close via onOpenChange
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Request Detail View Component
function RequestDetailView({ request }: { request: VacationRequest }) {
  const status = statusConfig[request.status as keyof typeof statusConfig];
  const type = typeConfig[request.type];
  const StatusIcon = status.icon;
  const days = (() => {
    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  })();

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <Badge className={`${status.color} border`} variant="outline">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
          <Badge variant="secondary">{type.label}</Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          Submitted: {formatDate(request.submittedDate)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">
            Start Date
          </Label>
          <p className="text-base font-semibold">
            {formatDate(request.startDate)}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-sm font-medium text-muted-foreground">
            End Date
          </Label>
          <p className="text-base font-semibold">
            {formatDate(request.endDate)}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-muted-foreground">
          Duration
        </Label>
        <p className="text-base">
          {days} {days === 1 ? "day" : "days"}
        </p>
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
    </div>
  );
}
