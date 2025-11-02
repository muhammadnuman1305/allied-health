"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
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
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Eye,
  Edit,
  FileText,
  ExternalLink,
  ArrowRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";

// Intervention status types
type InterventionStatus =
  | "Seen"
  | "Attempted"
  | "Declined"
  | "Unseen"
  | "Handover";
type InterventionStatusCode = "S" | "A" | "D" | "U" | "X";

// Intervention interface
interface TaskIntervention {
  id: string;
  interventionId: string;
  interventionName: string;
  assignedToUserId: string;
  assignedToUserName: string;
  status: InterventionStatus; // Default: Unseen
  statusCode: InterventionStatusCode;
  outcome?: string;
  outcomeDate?: string;
  startDate: string;
  endDate: string;
  wardId?: string;
  wardName?: string;
}

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  patientId: string;
  patientName: string;
  patientMrn?: string;
  startDate: string;
  endDate: string;
  priority: "High" | "Medium" | "Low";
  departmentName?: string;
  status: "Not Assigned" | "Assigned" | "In Progress" | "Completed";
  interventions: TaskIntervention[];
}

// Helper to get current date and future dates
const getToday = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const getDateRange = (daysFromNow: number, duration: number = 7) => {
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);
  const end = new Date(start);
  end.setDate(end.getDate() + duration);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
};

// Mock data with interventions - using current dates
const mockTasks: Task[] = [
  (() => {
    const dateRange = getDateRange(-3, 7);
    return {
      id: "T001",
      title: "Initial Assessment - John Smith",
      description:
        "Complete initial health assessment for new patient John Smith",
      patientId: "P001",
      patientName: "John Smith",
      patientMrn: "MRN00001",
      startDate: dateRange.start,
      endDate: dateRange.end,
      priority: "High",
      departmentName: "Cardiology",
      status: "Assigned",
      interventions: [
        {
          id: "I001",
          interventionId: "INT001",
          interventionName: "Physical Therapy Assessment",
          assignedToUserId: "CURRENT_USER",
          assignedToUserName: "You",
          status: "Unseen",
          statusCode: "U",
          startDate: dateRange.start,
          endDate: dateRange.end,
          wardId: "W001",
          wardName: "General Ward",
        },
        {
          id: "I002",
          interventionId: "INT002",
          interventionName: "Nutrition Consultation",
          assignedToUserId: "CURRENT_USER",
          assignedToUserName: "You",
          status: "Seen",
          statusCode: "S",
          outcome:
            "Patient assessed. Diet plan created and discussed with patient.",
          outcomeDate: getDateRange(-2).start,
          startDate: dateRange.start,
          endDate: dateRange.end,
          wardId: "W001",
          wardName: "General Ward",
        },
      ],
    };
  })(),
  (() => {
    const dateRange = getDateRange(-5, 10);
    return {
      id: "T002",
      title: "Follow-up Consultation - Maria Garcia",
      description: "Follow-up consultation for diabetes management",
      patientId: "P002",
      patientName: "Maria Garcia",
      patientMrn: "MRN00002",
      startDate: dateRange.start,
      endDate: dateRange.end,
      priority: "Medium",
      departmentName: "Endocrinology",
      status: "In Progress",
      interventions: [
        {
          id: "I003",
          interventionId: "INT003",
          interventionName: "Blood Glucose Monitoring",
          assignedToUserId: "CURRENT_USER",
          assignedToUserName: "You",
          status: "Attempted",
          statusCode: "A",
          startDate: dateRange.start,
          endDate: dateRange.end,
          wardId: "W002",
          wardName: "Endocrinology Ward",
        },
      ],
    };
  })(),
  (() => {
    const dateRange = getDateRange(-7, 7);
    return {
      id: "T003",
      title: "Physical Therapy Session - Robert Wilson",
      description: "Post-surgery physical therapy session",
      patientId: "P003",
      patientName: "Robert Wilson",
      patientMrn: "MRN00003",
      startDate: dateRange.start,
      endDate: dateRange.end,
      priority: "Low",
      departmentName: "Physical Therapy",
      status: "Completed",
      interventions: [
        {
          id: "I004",
          interventionId: "INT004",
          interventionName: "Mobility Training",
          assignedToUserId: "CURRENT_USER",
          assignedToUserName: "You",
          status: "Seen",
          statusCode: "S",
          outcome:
            "Patient completed mobility training session. Progress noted in patient record.",
          outcomeDate: getDateRange(-2).start,
          startDate: dateRange.start,
          endDate: dateRange.end,
          wardId: "W003",
          wardName: "Orthopedic Ward",
        },
      ],
    };
  })(),
];

const statusConfig = {
  "Not Assigned": {
    label: "Not Assigned",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
  Assigned: {
    label: "Assigned",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  "In Progress": {
    label: "In Progress",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  Completed: {
    label: "Completed",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
};

const priorityConfig = {
  Low: {
    label: "Low",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  Medium: {
    label: "Medium",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  High: {
    label: "High",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const interventionStatusConfig = {
  Seen: {
    label: "Seen",
    code: "S" as InterventionStatusCode,
    color:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    description: "Patient seen by AHA",
  },
  Attempted: {
    label: "Attempted",
    code: "A" as InterventionStatusCode,
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    description: "Attempt made but no intervention took place",
  },
  Declined: {
    label: "Declined",
    code: "D" as InterventionStatusCode,
    color:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    description: "Patient declined intervention",
  },
  Unseen: {
    label: "Unseen",
    code: "U" as InterventionStatusCode,
    color:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    description: "Patient not seen by AHA",
  },
  Handover: {
    label: "Handover",
    code: "X" as InterventionStatusCode,
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Refer to additional note or handover",
  },
};

export default function MyTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedIntervention, setSelectedIntervention] =
    useState<TaskIntervention | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [outcomeText, setOutcomeText] = useState("");

  useEffect(() => {
    if (user) {
      // Filter tasks to show only those with interventions assigned to current user
      const userTasks = mockTasks.filter((task) =>
        task.interventions.some(
          (intervention) => intervention.assignedToUserId === "CURRENT_USER"
        )
      );
      setTasks(userTasks);
    }
  }, [user]);

  // Get interventions assigned to current user
  const getUserInterventions = (): TaskIntervention[] => {
    const interventions: TaskIntervention[] = [];
    tasks.forEach((task) => {
      task.interventions.forEach((intervention) => {
        if (intervention.assignedToUserId === "CURRENT_USER") {
          interventions.push({
            ...intervention,
            id: `${task.id}-${intervention.id}`,
          });
        }
      });
    });
    return interventions;
  };

  const allInterventions = getUserInterventions();

  // Filter tasks/interventions
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.interventions.some((intervention) =>
        intervention.interventionName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get task/intervention counts
  const taskCounts = {
    total: tasks.length,
    assigned: tasks.filter((t) => t.status === "Assigned").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  const interventionCounts = {
    total: allInterventions.length,
    unseen: allInterventions.filter((i) => i.status === "Unseen").length,
    seen: allInterventions.filter((i) => i.status === "Seen").length,
    attempted: allInterventions.filter((i) => i.status === "Attempted").length,
    declined: allInterventions.filter((i) => i.status === "Declined").length,
    handover: allInterventions.filter((i) => i.status === "Handover").length,
  };

  // Check if date is within task range
  const isDateInTaskRange = (task: Task, date: Date = new Date()): boolean => {
    const today = date.toISOString().split("T")[0];
    return today >= task.startDate && today <= task.endDate;
  };

  const handleStatusChange = (
    taskId: string,
    interventionId: string,
    newStatus: InterventionStatus
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!isDateInTaskRange(task)) {
      toast.error(
        "Status can only be changed within the task's start and end date range"
      );
      setIsStatusDialogOpen(false);
      return;
    }

    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            interventions: t.interventions.map((intervention) => {
              if (intervention.id === interventionId) {
                const statusConfig =
                  interventionStatusConfig[
                    newStatus as keyof typeof interventionStatusConfig
                  ];
                return {
                  ...intervention,
                  status: newStatus,
                  statusCode: statusConfig.code,
                };
              }
              return intervention;
            }),
          };
        }
        return t;
      })
    );
    setIsStatusDialogOpen(false);
    setSelectedIntervention(null);
    setSelectedTask(null);
    toast.success("Intervention status updated successfully");
  };

  const handleSaveOutcome = (
    taskId: string,
    interventionId: string,
    outcome: string
  ) => {
    if (!outcome.trim()) {
      toast.error("Outcome text is required");
      return;
    }

    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            interventions: task.interventions.map((intervention) => {
              if (intervention.id === interventionId) {
                return {
                  ...intervention,
                  outcome: outcome,
                  outcomeDate: new Date().toISOString().split("T")[0],
                };
              }
              return intervention;
            }),
          };
        }
        return task;
      })
    );
    setOutcomeText("");
    setIsOutcomeDialogOpen(false);
    setSelectedIntervention(null);
    setSelectedTask(null);
    toast.success("Outcome saved successfully");
  };

  const handleNavigateToPatient = (patientId: string) => {
    router.push(`/user/all-patients/${patientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your assigned interventions and tasks
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={taskCounts.total}
          icon={FileText}
        />
        <StatsCard
          title="My Interventions"
          value={interventionCounts.total}
          icon={AlertCircle}
        />
        <StatsCard
          title="Unseen"
          value={interventionCounts.unseen}
          icon={Clock}
        />
        <StatsCard
          title="Seen"
          value={interventionCounts.seen}
          icon={CheckCircle}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, patients, interventions..."
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
            <SelectItem value="Not Assigned">Not Assigned</SelectItem>
            <SelectItem value="Assigned">Assigned</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">No tasks found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const status =
              statusConfig[task.status as keyof typeof statusConfig];
            const priority =
              priorityConfig[task.priority as keyof typeof priorityConfig];
            const userInterventions = task.interventions.filter(
              (intervention) => intervention.assignedToUserId === "CURRENT_USER"
            );
            const isWithinDateRange = isDateInTaskRange(task);

            return (
              <Card
                key={task.id}
                className="border-l-4 border-l-primary/20 shadow-sm transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className={priority.color}>
                          {priority.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(task.startDate).toLocaleDateString()} -{" "}
                          {new Date(task.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          <span className="font-medium">Patient:</span>{" "}
                          {task.patientName}
                          {task.patientMrn && (
                            <span className="text-muted-foreground/70">
                              ({task.patientMrn})
                            </span>
                          )}
                        </span>
                        {task.departmentName && (
                          <span className="flex items-center gap-1.5">
                            <span className="font-medium">Dept:</span>{" "}
                            {task.departmentName}
                          </span>
                        )}
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
                          onClick={() => setSelectedTask(task)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Task Details</DialogTitle>
                        </DialogHeader>
                        {selectedTask && (
                          <TaskDetailView
                            task={selectedTask}
                            onNavigateToPatient={handleNavigateToPatient}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-foreground">
                        My Interventions ({userInterventions.length})
                      </h4>
                      {userInterventions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No interventions assigned to you
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {userInterventions.map((intervention) => {
                            const interventionStatus =
                              interventionStatusConfig[
                                intervention.status as keyof typeof interventionStatusConfig
                              ];

                            return (
                              <Card
                                key={intervention.id}
                                className="border bg-card hover:shadow-sm transition-shadow"
                              >
                                <CardContent className="p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h5 className="font-semibold text-base">
                                          {intervention.interventionName}
                                        </h5>
                                        <Badge
                                          className={`${interventionStatus.color} border`}
                                          variant="outline"
                                        >
                                          {interventionStatus.label}
                                        </Badge>
                                        {intervention.wardName && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs font-medium"
                                          >
                                            {intervention.wardName}
                                          </Badge>
                                        )}
                                      </div>

                                      {intervention.outcome && (
                                        <div className="p-3 bg-muted/50 rounded-md border">
                                          <div className="flex items-center gap-2 mb-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                              Outcome
                                            </Label>
                                            {intervention.outcomeDate && (
                                              <span className="text-xs text-muted-foreground">
                                                (
                                                {new Date(
                                                  intervention.outcomeDate
                                                ).toLocaleDateString()}
                                                )
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm leading-relaxed text-foreground">
                                            {intervention.outcome}
                                          </p>
                                        </div>
                                      )}

                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                          {new Date(
                                            intervention.startDate
                                          ).toLocaleDateString()}{" "}
                                          -{" "}
                                          {new Date(
                                            intervention.endDate
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {isWithinDateRange && (
                                        <>
                                          <Dialog
                                            open={
                                              isStatusDialogOpen &&
                                              selectedIntervention?.id ===
                                                intervention.id &&
                                              selectedTask?.id === task.id
                                            }
                                            onOpenChange={(open) => {
                                              setIsStatusDialogOpen(open);
                                              if (open) {
                                                setSelectedIntervention(
                                                  intervention
                                                );
                                                setSelectedTask(task);
                                              } else {
                                                setSelectedIntervention(null);
                                                setSelectedTask(null);
                                              }
                                            }}
                                          >
                                            <DialogTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  setSelectedIntervention(
                                                    intervention
                                                  );
                                                  setSelectedTask(task);
                                                  setIsStatusDialogOpen(true);
                                                }}
                                                className="text-xs gap-1.5 whitespace-nowrap"
                                              >
                                                <Edit className="h-3.5 w-3.5" />
                                                Status
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>
                                                  Update Status
                                                </DialogTitle>
                                              </DialogHeader>
                                              {selectedIntervention &&
                                                selectedTask && (
                                                  <UpdateStatusForm
                                                    intervention={
                                                      selectedIntervention
                                                    }
                                                    task={selectedTask}
                                                    currentStatus={
                                                      selectedIntervention.status
                                                    }
                                                    onStatusChange={(
                                                      newStatus
                                                    ) =>
                                                      handleStatusChange(
                                                        selectedTask.id,
                                                        selectedIntervention.id,
                                                        newStatus
                                                      )
                                                    }
                                                    onCancel={() => {
                                                      setIsStatusDialogOpen(
                                                        false
                                                      );
                                                      setSelectedIntervention(
                                                        null
                                                      );
                                                      setSelectedTask(null);
                                                    }}
                                                  />
                                                )}
                                            </DialogContent>
                                          </Dialog>

                                          <Dialog
                                            open={
                                              isOutcomeDialogOpen &&
                                              selectedIntervention?.id ===
                                                intervention.id &&
                                              selectedTask?.id === task.id
                                            }
                                            onOpenChange={(open) => {
                                              setIsOutcomeDialogOpen(open);
                                              if (open) {
                                                setSelectedIntervention(
                                                  intervention
                                                );
                                                setSelectedTask(task);
                                                setOutcomeText(
                                                  intervention.outcome || ""
                                                );
                                              } else {
                                                setSelectedIntervention(null);
                                                setSelectedTask(null);
                                                setOutcomeText("");
                                              }
                                            }}
                                          >
                                            <DialogTrigger asChild>
                                              <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => {
                                                  setSelectedIntervention(
                                                    intervention
                                                  );
                                                  setSelectedTask(task);
                                                  setOutcomeText(
                                                    intervention.outcome || ""
                                                  );
                                                  setIsOutcomeDialogOpen(true);
                                                }}
                                                className="text-xs gap-1.5 whitespace-nowrap"
                                              >
                                                <FileText className="h-3.5 w-3.5" />
                                                {intervention.outcome
                                                  ? "Edit"
                                                  : "Add"}{" "}
                                                Outcome
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                              <DialogHeader>
                                                <DialogTitle>
                                                  {intervention.outcome
                                                    ? "Edit Outcome"
                                                    : "Add Outcome"}
                                                </DialogTitle>
                                              </DialogHeader>
                                              {selectedIntervention &&
                                                selectedTask && (
                                                  <OutcomeForm
                                                    intervention={
                                                      selectedIntervention
                                                    }
                                                    initialOutcome={
                                                      selectedIntervention.outcome ||
                                                      ""
                                                    }
                                                    onSave={(outcome) =>
                                                      handleSaveOutcome(
                                                        selectedTask.id,
                                                        selectedIntervention.id,
                                                        outcome
                                                      )
                                                    }
                                                    onCancel={() => {
                                                      setIsOutcomeDialogOpen(
                                                        false
                                                      );
                                                      setSelectedIntervention(
                                                        null
                                                      );
                                                      setSelectedTask(null);
                                                      setOutcomeText("");
                                                    }}
                                                  />
                                                )}
                                            </DialogContent>
                                          </Dialog>
                                        </>
                                      )}
                                      {!isWithinDateRange && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-muted/50"
                                        >
                                          Outside date range
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
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

// Update Status Form Component
function UpdateStatusForm({
  intervention,
  task,
  currentStatus,
  onStatusChange,
  onCancel,
}: {
  intervention: TaskIntervention;
  task: Task;
  currentStatus: InterventionStatus;
  onStatusChange: (status: InterventionStatus) => void;
  onCancel: () => void;
}) {
  const [selectedStatus, setSelectedStatus] =
    useState<InterventionStatus>(currentStatus);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStatusChange(selectedStatus);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Intervention</Label>
        <p className="text-sm font-normal mt-1">
          {intervention.interventionName}
        </p>
      </div>
      <div>
        <Label className="mb-2 block">Current Status</Label>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={`${interventionStatusConfig[currentStatus].color} border`}
            variant="outline"
          >
            {currentStatus}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {interventionStatusConfig[currentStatus].description}
          </p>
        </div>
      </div>
      <div>
        <Label htmlFor="new-status">New Status *</Label>
        <div className="mt-1">
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(value as InterventionStatus)
            }
          >
            <SelectTrigger id="new-status">
              <SelectValue placeholder="Select status">
                {selectedStatus &&
                  interventionStatusConfig[selectedStatus]?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(
                Object.keys(interventionStatusConfig) as InterventionStatus[]
              ).map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex flex-col">
                    <span>{interventionStatusConfig[status].label}</span>
                    <span className="text-xs text-muted-foreground">
                      {interventionStatusConfig[status].description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
        <Info className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Task date range: {new Date(task.startDate).toLocaleDateString()} -{" "}
          {new Date(task.endDate).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Update Status
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Outcome Form Component
function OutcomeForm({
  intervention,
  initialOutcome,
  onSave,
  onCancel,
}: {
  intervention: TaskIntervention;
  initialOutcome: string;
  onSave: (outcome: string) => void;
  onCancel: () => void;
}) {
  const [outcome, setOutcome] = useState(initialOutcome);

  useEffect(() => {
    setOutcome(initialOutcome);
  }, [initialOutcome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome.trim()) {
      return;
    }
    onSave(outcome);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Intervention</Label>
        <p className="text-sm font-normal mt-1">
          {intervention.interventionName}
        </p>
      </div>
      <div>
        <Label htmlFor="outcome">Outcome *</Label>
        <Textarea
          id="outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="Enter the outcome of this intervention..."
          required
          rows={6}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Describe what happened during this intervention, results,
          observations, and any follow-up needed.
        </p>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {initialOutcome ? "Update Outcome" : "Save Outcome"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Task Detail View Component
function TaskDetailView({
  task,
  onNavigateToPatient,
}: {
  task: Task;
  onNavigateToPatient: (patientId: string) => void;
}) {
  const status = statusConfig[task.status as keyof typeof statusConfig];
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
  const userInterventions = task.interventions.filter(
    (intervention) => intervention.assignedToUserId === "CURRENT_USER"
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Status
          </Label>
          <div className="mt-1">
            <Badge variant="outline" className={status.color}>
              {status.label}
            </Badge>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Priority
          </Label>
          <div className="mt-1">
            <Badge variant="outline" className={priority.color}>
              {priority.label}
            </Badge>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-muted-foreground">
          Task
        </Label>
        <p className="text-base font-semibold mt-1">{task.title}</p>
      </div>

      <div>
        <Label className="text-sm font-medium text-muted-foreground">
          Description
        </Label>
        <p className="text-sm mt-1">{task.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Patient
          </Label>
          <p className="text-base mt-1">
            {task.patientName}
            {task.patientMrn && (
              <span className="text-sm text-muted-foreground ml-2">
                ({task.patientMrn})
              </span>
            )}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Department
          </Label>
          <p className="text-sm mt-1">{task.departmentName || "—"}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-muted-foreground">
          Date Range
        </Label>
        <p className="text-sm mt-1">
          {new Date(task.startDate).toLocaleDateString()} -{" "}
          {new Date(task.endDate).toLocaleDateString()}
        </p>
      </div>

      {userInterventions.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">
            Your Interventions
          </Label>
          <div className="space-y-3">
            {userInterventions.map((intervention) => {
              const interventionStatus =
                interventionStatusConfig[
                  intervention.status as keyof typeof interventionStatusConfig
                ];
              return (
                <div key={intervention.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">
                      {intervention.interventionName}
                    </span>
                    <Badge
                      className={`${interventionStatus.color} border`}
                      variant="outline"
                    >
                      {interventionStatus.label}
                    </Badge>
                  </div>
                  {intervention.outcome && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md border">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Outcome
                      </Label>
                      <p className="text-sm mt-1">{intervention.outcome}</p>
                      {intervention.outcomeDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(
                            intervention.outcomeDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  {intervention.wardName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Ward: {intervention.wardName}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => onNavigateToPatient(task.patientId)}
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Patient
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
