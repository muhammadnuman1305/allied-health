"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  User, 
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MessageSquare,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

// Referral interface
interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  fromDepartment: string;
  toDepartment: string;
  reason: string;
  date: string;
  // status: "pending" | "accepted" | "completed" | "rejected";
  status: string;
  notes: string;
  assignedTo: string;
  // priority: "low" | "medium" | "high";
  priority: string;
  feedback: string[];
}

// Mock data
const mockReferrals: Referral[] = [
  {
    id: "R001",
    patientId: "P001",
    patientName: "John Smith",
    fromDepartment: "Primary Care",
    toDepartment: "Cardiology",
    reason: "Elevated blood pressure readings over the past 3 months",
    date: "2024-01-05",
    status: "completed",
    notes: "Patient shows signs of hypertension. BP readings consistently above 140/90.",
    assignedTo: "Dr. Sarah Johnson",
    priority: "high",
    feedback: [
      "Patient referred for cardiac evaluation",
      "Recommend lifestyle changes including diet and exercise",
      "Follow-up appointment scheduled for next month"
    ]
  },
  {
    id: "R002",
    patientId: "P002",
    patientName: "Maria Garcia",
    fromDepartment: "Primary Care",
    toDepartment: "Endocrinology",
    reason: "Elevated blood glucose levels and symptoms of diabetes",
    date: "2024-01-02",
    status: "completed",
    notes: "Fasting glucose levels consistently above 126 mg/dL. Patient reports increased thirst and frequent urination.",
    assignedTo: "Dr. Michael Chen",
    priority: "high",
    feedback: [
      "Patient referred for diabetes management",
      "Initial assessment completed",
      "Medication prescribed and monitoring plan established"
    ]
  },
  {
    id: "R003",
    patientId: "P003",
    patientName: "Robert Wilson",
    fromDepartment: "Orthopedics",
    toDepartment: "Physical Therapy",
    reason: "Post-knee surgery rehabilitation",
    date: "2023-12-20",
    status: "completed",
    notes: "Patient underwent ACL reconstruction surgery. Requires physical therapy for rehabilitation.",
    assignedTo: "Dr. Emily Davis",
    priority: "medium",
    feedback: [
      "Patient referred for physical therapy after knee surgery",
      "Initial assessment completed",
      "Rehabilitation plan established with 12-week program"
    ]
  },
  {
    id: "R004",
    patientId: "P004",
    patientName: "Lisa Brown",
    fromDepartment: "Primary Care",
    toDepartment: "Nutrition",
    reason: "Weight management consultation",
    date: "2024-01-08",
    status: "accepted",
    notes: "Patient seeking assistance with weight loss. BMI indicates overweight category.",
    assignedTo: "Dr. David Miller",
    priority: "medium",
    feedback: [
      "Patient referred for nutritional counseling",
      "Initial consultation scheduled"
    ]
  },
  {
    id: "R005",
    patientId: "P005",
    patientName: "David Lee",
    fromDepartment: "Cardiology",
    toDepartment: "Neurology",
    reason: "Recurring headaches and dizziness",
    date: "2024-01-12",
    status: "pending",
    notes: "Patient experiencing severe headaches and dizziness. Cardiac evaluation normal.",
    assignedTo: "Dr. Jennifer Wilson",
    priority: "high",
    feedback: []
  }
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: AlertCircle }
};

const priorityConfig = {
  low: { label: "Low", color: "bg-green-100 text-green-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-red-100 text-red-800" }
};

const departments = [
  "Primary Care",
  "Cardiology",
  "Endocrinology",
  "Orthopedics",
  "Physical Therapy",
  "Nutrition",
  "Neurology",
  "Dermatology",
  "Psychiatry",
  "Radiology"
];

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  // Filter referrals based on search and filters
  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = referral.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.fromDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.toDepartment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || referral.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || referral.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get referral counts
  const referralCounts = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === "pending").length,
    accepted: referrals.filter(r => r.status === "accepted").length,
    completed: referrals.filter(r => r.status === "completed").length,
    rejected: referrals.filter(r => r.status === "rejected").length,
  };

  const handleCreateReferral = (referralData: Partial<Referral>) => {
    const newReferral: Referral = {
      id: `R${Date.now()}`,
      patientId: referralData.patientId || "",
      patientName: referralData.patientName || "",
      fromDepartment: referralData.fromDepartment || "",
      toDepartment: referralData.toDepartment || "",
      reason: referralData.reason || "",
      date: new Date().toISOString().split('T')[0],
      status: "pending",
      notes: referralData.notes || "",
      assignedTo: referralData.assignedTo || "",
      priority: referralData.priority || "medium",
      feedback: []
    };
    setReferrals([...referrals, newReferral]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateReferral = (referralId: string, updates: Partial<Referral>) => {
    setReferrals(referrals.map(referral => 
      referral.id === referralId ? { ...referral, ...updates } : referral
    ));
    setIsEditDialogOpen(false);
  };

  const handleDeleteReferral = (referralId: string) => {
    setReferrals(referrals.filter(referral => referral.id !== referralId));
  };

  const handleStatusChange = (referralId: string, newStatus: Referral["status"]) => {
    setReferrals(referrals.map(referral => 
      referral.id === referralId ? { ...referral, status: newStatus } : referral
    ));
  };

  const handleAddFeedback = (referralId: string, feedback: string) => {
    setReferrals(referrals.map(referral => 
      referral.id === referralId 
        ? { ...referral, feedback: [...referral.feedback, feedback] }
        : referral
    ));
    setIsFeedbackDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Referral Management</h1>
          <p className="text-muted-foreground">Manage patient referrals between departments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Referral
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Referral</DialogTitle>
            </DialogHeader>
            <CreateReferralForm onSubmit={handleCreateReferral} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Referral Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCounts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCounts.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCounts.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCounts.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCounts.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search referrals by patient, reason, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral List */}
      <Card>
        <CardHeader>
          <CardTitle>Referrals ({filteredReferrals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReferrals.map((referral) => {
              const status = statusConfig[referral.status as keyof typeof statusConfig];
              const priority = priorityConfig[referral.priority as keyof typeof priorityConfig];
              const StatusIcon = status.icon;
              
              return (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{referral.patientName}</h3>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                      <Badge className={priority.color}>
                        {priority.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">ID: {referral.id}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{referral.fromDepartment}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{referral.toDepartment}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{referral.reason}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {referral.assignedTo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {referral.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {referral.feedback.length} feedback
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReferral(referral)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Referral Details</DialogTitle>
                        </DialogHeader>
                        {selectedReferral && <ReferralDetailView referral={selectedReferral} />}
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReferral(referral)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Feedback</DialogTitle>
                        </DialogHeader>
                        {selectedReferral && (
                          <AddFeedbackForm 
                            referral={selectedReferral}
                            onSubmit={(feedback) => handleAddFeedback(selectedReferral.id, feedback)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReferral(referral)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Referral</DialogTitle>
                        </DialogHeader>
                        {selectedReferral && (
                          <EditReferralForm 
                            referral={selectedReferral} 
                            onSubmit={(updates) => handleUpdateReferral(selectedReferral.id, updates)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReferral(referral.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <Select 
                      value={referral.status} 
                      onValueChange={(value) => handleStatusChange(referral.id, value as Referral["status"])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Create Referral Form Component
function CreateReferralForm({ onSubmit }: { onSubmit: (data: Partial<Referral>) => void }) {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    fromDepartment: "",
    toDepartment: "",
    reason: "",
    notes: "",
    assignedTo: "",
    priority: "medium" as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientId">Patient ID</Label>
          <Input
            id="patientId"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fromDepartment">From Department</Label>
          <Select 
            value={formData.fromDepartment} 
            onValueChange={(value) => setFormData({ ...formData, fromDepartment: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="toDepartment">To Department</Label>
          <Select 
            value={formData.toDepartment} 
            onValueChange={(value) => setFormData({ ...formData, toDepartment: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="reason">Reason for Referral</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assignedTo">Assign To</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit" className="w-full">Create Referral</Button>
    </form>
  );
}

// Edit Referral Form Component
function EditReferralForm({ referral, onSubmit }: { referral: Referral; onSubmit: (updates: Partial<Referral>) => void }) {
  const [formData, setFormData] = useState({
    patientId: referral.patientId,
    patientName: referral.patientName,
    fromDepartment: referral.fromDepartment,
    toDepartment: referral.toDepartment,
    reason: referral.reason,
    notes: referral.notes,
    assignedTo: referral.assignedTo,
    priority: referral.priority,
    status: referral.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-patientId">Patient ID</Label>
          <Input
            id="edit-patientId"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-patientName">Patient Name</Label>
          <Input
            id="edit-patientName"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-fromDepartment">From Department</Label>
          <Select 
            value={formData.fromDepartment} 
            onValueChange={(value) => setFormData({ ...formData, fromDepartment: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-toDepartment">To Department</Label>
          <Select 
            value={formData.toDepartment} 
            onValueChange={(value) => setFormData({ ...formData, toDepartment: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-reason">Reason for Referral</Label>
        <Textarea
          id="edit-reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="edit-notes">Additional Notes</Label>
        <Textarea
          id="edit-notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="edit-assignedTo">Assign To</Label>
          <Input
            id="edit-assignedTo"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData({ ...formData, priority: value as "low" | "medium" | "high" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => setFormData({ ...formData, status: value as Referral["status"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button type="submit" className="w-full">Update Referral</Button>
    </form>
  );
}

// Add Feedback Form Component
function AddFeedbackForm({ referral, onSubmit }: { referral: Referral; onSubmit: (feedback: string) => void }) {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmit(feedback);
      setFeedback("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="feedback">Feedback/Notes</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Add feedback or notes about this referral..."
          required
        />
      </div>
      <Button type="submit" className="w-full">Add Feedback</Button>
    </form>
  );
}

// Referral Detail View Component
function ReferralDetailView({ referral }: { referral: Referral }) {
  const status = statusConfig[referral.status as keyof typeof statusConfig];
  const priority = priorityConfig[referral.priority as keyof typeof priorityConfig];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <Badge className={status.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        <div>
          <Label className="text-sm font-medium">Priority</Label>
          <Badge className={priority.color}>
            {priority.label}
          </Badge>
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium">Patient</Label>
        <p className="text-sm">{referral.patientName} ({referral.patientId})</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">From Department</Label>
          <p className="text-sm">{referral.fromDepartment}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">To Department</Label>
          <p className="text-sm">{referral.toDepartment}</p>
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium">Reason</Label>
        <p className="text-sm">{referral.reason}</p>
      </div>
      
      {referral.notes && (
        <div>
          <Label className="text-sm font-medium">Notes</Label>
          <p className="text-sm">{referral.notes}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Assigned To</Label>
          <p className="text-sm">{referral.assignedTo}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Date</Label>
          <p className="text-sm">{referral.date}</p>
        </div>
      </div>
      
      {referral.feedback.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Feedback & Notes</Label>
          <div className="space-y-2 mt-2">
            {referral.feedback.map((note, index) => (
              <div key={index} className="p-3 bg-muted rounded-md">
                <p className="text-sm">{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
