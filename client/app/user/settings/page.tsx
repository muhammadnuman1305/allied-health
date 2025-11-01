"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Bell,
  Shield,
  User,
  Calendar,
  Clock,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">User Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>
              Manage your personal and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value="Dr. John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value="johndoe@hospital.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value="+92 300 1234567" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Professional Details</CardTitle>
            </div>
            <CardDescription>
              Manage your qualifications and specialization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select defaultValue="cardiology">
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="general">General Physician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input id="qualification" value="MBBS, FCPS" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" type="number" value="10" />
            </div>
            <Button>Update Professional Info</Button>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Availability & Notifications</CardTitle>
            </div>
            <CardDescription>
              Set your availability and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="availableDays">Available Days</Label>
              <Input
                id="availableDays"
                placeholder="e.g. Mon, Wed, Fri"
                value="Mon, Wed, Fri"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableTime">Available Time</Label>
              <Input
                id="availableTime"
                placeholder="e.g. 9:00 AM - 1:00 PM"
                value="9:00 AM - 1:00 PM"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Appointment Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a patient books or cancels an appointment
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Admin Announcements</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important hospital announcements
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button>Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Vacation & Leave Requests */}
        <VacationLeaveCard />
      </div>

      {/* Reschedule Requests */}
      <RescheduleRequestsCard />
    </div>
  );
}

// Vacation & Leave Requests Component
function VacationLeaveCard() {
  const [vacations, setVacations] = useState([
    {
      id: "1",
      startDate: "2024-02-15",
      endDate: "2024-02-20",
      type: "vacation",
      reason: "Family vacation",
      status: "approved",
    },
    {
      id: "2",
      startDate: "2024-03-10",
      endDate: "2024-03-12",
      type: "sick",
      reason: "Medical appointment",
      status: "pending",
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    type: "vacation",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVacation = {
      id: Date.now().toString(),
      ...formData,
      status: "pending" as const,
    };
    setVacations([...vacations, newVacation]);
    setIsDialogOpen(false);
    setFormData({ startDate: "", endDate: "", type: "vacation", reason: "" });
    toast.success("Vacation request submitted successfully");
  };

  const statusConfig = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Vacation & Leave Requests</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Vacation or Leave</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
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
                  <Label>Reason *</Label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Please provide a reason for your leave request..."
                    required
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Submit Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Request and manage your vacation and leave requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {vacations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No leave requests yet
            </p>
          ) : (
            vacations.map((vacation) => {
              const status = statusConfig[vacation.status];
              return (
                <div
                  key={vacation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={status.className}>{status.label}</Badge>
                      <Badge variant="outline">{vacation.type}</Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {vacation.startDate} to {vacation.endDate}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vacation.reason}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Reschedule Requests Component
function RescheduleRequestsCard() {
  const [reschedules, setReschedules] = useState([
    {
      id: "1",
      taskId: "T001",
      taskTitle: "Nutrition Assessment - John Smith",
      originalDate: "2024-01-20",
      requestedDate: "2024-01-22",
      reason: "Conflicting appointment",
      status: "pending",
    },
    {
      id: "2",
      taskId: "T002",
      taskTitle: "Follow-up Consultation - Maria Garcia",
      originalDate: "2024-01-25",
      requestedDate: "2024-01-26",
      reason: "Family emergency",
      status: "approved",
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    taskId: "",
    taskTitle: "",
    originalDate: "",
    requestedDate: "",
    reason: "",
  });

  // Mock tasks for dropdown
  const availableTasks = [
    {
      id: "T001",
      title: "Nutrition Assessment - John Smith",
      date: "2024-01-20",
    },
    {
      id: "T002",
      title: "Follow-up Consultation - Maria Garcia",
      date: "2024-01-25",
    },
    {
      id: "T003",
      title: "Physical Therapy Session - Robert Wilson",
      date: "2024-01-28",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task = availableTasks.find((t) => t.id === formData.taskId);
    const newReschedule = {
      id: Date.now().toString(),
      taskId: formData.taskId,
      taskTitle: task?.title || formData.taskTitle,
      originalDate: task?.date || formData.originalDate,
      requestedDate: formData.requestedDate,
      reason: formData.reason,
      status: "pending" as const,
    };
    setReschedules([...reschedules, newReschedule]);
    setIsDialogOpen(false);
    setFormData({
      taskId: "",
      taskTitle: "",
      originalDate: "",
      requestedDate: "",
      reason: "",
    });
    toast.success("Reschedule request submitted successfully");
  };

  const handleTaskSelect = (taskId: string) => {
    const task = availableTasks.find((t) => t.id === taskId);
    if (task) {
      setFormData({
        ...formData,
        taskId: task.id,
        taskTitle: task.title,
        originalDate: task.date,
      });
    }
  };

  const statusConfig = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Reschedule Requests</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Request Reschedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Reschedule</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Select Task *</Label>
                  <Select
                    value={formData.taskId}
                    onValueChange={handleTaskSelect}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task to reschedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title} ({task.date})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.taskId && (
                  <>
                    <div>
                      <Label>Original Date</Label>
                      <Input value={formData.originalDate} disabled />
                    </div>
                    <div>
                      <Label>Requested Date *</Label>
                      <Input
                        type="date"
                        value={formData.requestedDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requestedDate: e.target.value,
                          })
                        }
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <Label>Reason *</Label>
                      <Textarea
                        value={formData.reason}
                        onChange={(e) =>
                          setFormData({ ...formData, reason: e.target.value })
                        }
                        placeholder="Please provide a reason for rescheduling..."
                        required
                        rows={3}
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      !formData.taskId ||
                      !formData.requestedDate ||
                      !formData.reason
                    }
                  >
                    Submit Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Request to reschedule assigned tasks and appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reschedules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No reschedule requests yet
            </p>
          ) : (
            reschedules.map((reschedule) => {
              const status = statusConfig[reschedule.status];
              return (
                <div
                  key={reschedule.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {reschedule.taskTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Original: {reschedule.originalDate} → Requested:{" "}
                      {reschedule.requestedDate}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason: {reschedule.reason}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
