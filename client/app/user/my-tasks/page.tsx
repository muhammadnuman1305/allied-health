"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import {
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
import { getTaskDetailsById$, getMyTasks$ } from "@/lib/api/aha/_request";
import type { AHATaskDetails } from "@/lib/api/aha/_model";
import api from "@/lib/api/axios";

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
  status: "Not Assigned" | "Assigned" | "In Progress" | "Completed" | "Overdue";
  interventions: TaskIntervention[];
}

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
  Overdue: {
    label: "Overdue",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientFilter, setPatientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedIntervention, setSelectedIntervention] =
    useState<TaskIntervention | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetails, setTaskDetails] = useState<AHATaskDetails | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getMyTasks$(user.id);
      setTasks(response.data as Task[]);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again.");
      toast.error("Failed to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Get interventions assigned to current user
  const getUserInterventions = (): TaskIntervention[] => {
    const interventions: TaskIntervention[] = [];
    tasks.forEach((task) => {
      task.interventions.forEach((intervention) => {
        if (user && intervention.assignedToUserId === user.id) {
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

  // Get unique patients from tasks
  const uniquePatients = Array.from(
    new Map(
      tasks.map((task) => [
        task.patientId,
        { id: task.patientId, name: task.patientName, mrn: task.patientMrn },
      ])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Filter tasks/interventions
  const filteredTasks = tasks.filter((task) => {
    const matchesPatient =
      patientFilter === "all" || task.patientId === patientFilter;
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesPatient && matchesStatus && matchesPriority;
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

  // Map intervention status to OutcomeStatus number
  const getOutcomeStatusNumber = (status: InterventionStatus): number => {
    switch (status) {
      case "Seen":
        return 1;
      case "Attempted":
        return 2;
      case "Declined":
        return 3;
      case "Unseen":
        return 4;
      case "Handover":
        return 5;
      default:
        return 4;
    }
  };

  const handleStatusChange = async (
    taskId: string,
    interventionId: string,
    newStatus: InterventionStatus,
    outcome?: string
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

    try {
      // Call API to update intervention status
      const response = await api.put("/api/aha-task", {
        taskInvId: interventionId,
        outcomeStatus: getOutcomeStatusNumber(newStatus),
        outcome: outcome || "",
      });

      // Close dialog first
      setIsStatusDialogOpen(false);
      setSelectedIntervention(null);
      setSelectedTask(null);

      // Re-fetch tasks to get the latest data from the server
      await fetchTasks();

      toast.success("Intervention status updated successfully");
    } catch (err) {
      console.error("Error updating intervention status:", err);
      toast.error("Failed to update intervention status. Please try again.");
    }
  };

  const handleNavigateToPatient = (patientId: string) => {
    router.push(`/user/my-patients/${patientId}`);
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
        <Select value={patientFilter} onValueChange={setPatientFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Patients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            {uniquePatients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name}
                {patient.mrn && ` (${patient.mrn})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive/50 mb-4" />
            <p className="text-destructive text-lg">Error loading tasks</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </CardContent>
        </Card>
      ) : filteredTasks.length === 0 ? (
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
              statusConfig[task.status as keyof typeof statusConfig] ||
              statusConfig["Not Assigned"];
            const priority =
              priorityConfig[task.priority as keyof typeof priorityConfig] ||
              priorityConfig["Medium"];
            const userInterventions = task.interventions.filter(
              (intervention) =>
                user && intervention.assignedToUserId === user.id
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
                      </div>
                      <h3 className="text-xl font-bold mb-2">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          <span className="font-medium">Patient:</span>{" "}
                          <button
                            onClick={() =>
                              handleNavigateToPatient(task.patientId)
                            }
                            className="text-primary hover:underline font-medium"
                          >
                            {task.patientName}
                            {task.patientMrn && (
                              <span className="text-muted-foreground/70">
                                {" "}
                                ({task.patientMrn})
                              </span>
                            )}
                          </button>
                        </span>
                        {task.departmentName && (
                          <span className="flex items-center gap-1.5">
                            <span className="font-medium">Department:</span>{" "}
                            {task.departmentName}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Date Range:</span>{" "}
                          {new Date(task.startDate).toLocaleDateString()} -{" "}
                          {new Date(task.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Dialog
                      open={isViewDialogOpen}
                      onOpenChange={async (open) => {
                        setIsViewDialogOpen(open);
                        if (open) {
                          try {
                            setSelectedTask(task);
                            const response = await getTaskDetailsById$(task.id);
                            setTaskDetails(response.data);
                          } catch (err) {
                            console.error("Error fetching task details:", err);
                            toast.error(
                              "Failed to load task details. Please try again."
                            );
                            setIsViewDialogOpen(false);
                            setSelectedTask(null);
                            setTaskDetails(null);
                          }
                        } else {
                          setSelectedTask(null);
                          setTaskDetails(null);
                        }
                      }}
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
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:h-5 [&>button]:w-5 [&>button>svg]:h-5 [&>button>svg]:w-5 [&>button]:top-[1.625rem]">
                        <DialogHeader className="pb-2">
                          <DialogTitle className="text-xl font-semibold leading-tight">
                            Task Details
                          </DialogTitle>
                        </DialogHeader>
                        <div className="-mx-6 mb-4">
                          <Separator />
                        </div>
                        {selectedTask && taskDetails && (
                          <TaskDetailView
                            task={selectedTask}
                            taskDetails={taskDetails}
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
                          {userInterventions.map((intervention, index) => {
                            const interventionStatus =
                              interventionStatusConfig[
                                intervention.status as keyof typeof interventionStatusConfig
                              ];

                            return (
                              <Card
                                key={`${task.id}-${intervention.id}-${index}`}
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
                                                      newStatus,
                                                      outcome
                                                    ) =>
                                                      handleStatusChange(
                                                        selectedTask.id,
                                                        selectedIntervention.id,
                                                        newStatus,
                                                        outcome
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
  onStatusChange: (status: InterventionStatus, outcome?: string) => void;
  onCancel: () => void;
}) {
  const [selectedStatus, setSelectedStatus] =
    useState<InterventionStatus>(currentStatus);
  const [outcome, setOutcome] = useState(intervention.outcome || "");

  useEffect(() => {
    setSelectedStatus(currentStatus);
    setOutcome(intervention.outcome || "");
  }, [currentStatus, intervention.outcome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStatusChange(
      selectedStatus,
      selectedStatus === "Handover" ? outcome : undefined
    );
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
      {selectedStatus === "Handover" && (
        <div>
          <Label htmlFor="outcome">Outcome *</Label>
          <Textarea
            id="outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Enter the outcome of this intervention..."
            required
            rows={4}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Describe what happened during this intervention, results,
            observations, and any follow-up needed.
          </p>
        </div>
      )}
      <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
        <Info className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Task date range: {new Date(task.startDate).toLocaleDateString()} -{" "}
          {new Date(task.endDate).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={selectedStatus === "Handover" && !outcome.trim()}
        >
          Update Status
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
  taskDetails,
  onNavigateToPatient,
}: {
  task: Task;
  taskDetails: AHATaskDetails;
  onNavigateToPatient: (patientId: string) => void;
}) {
  const status = statusConfig[task.status as keyof typeof statusConfig];
  const priority =
    priorityConfig[taskDetails.priority as keyof typeof priorityConfig];
  // All interventions in task are already assigned to the current user (from my-tasks endpoint)
  const userInterventions = task.interventions;

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
          Title
        </Label>
        <p className="text-sm mt-1">{taskDetails.title}</p>
      </div>

      {taskDetails.description && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Description
          </Label>
          <p className="text-sm mt-1 whitespace-pre-wrap">
            {taskDetails.description}
          </p>
        </div>
      )}

      {taskDetails.diagnosis && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Diagnosis
          </Label>
          <p className="text-sm mt-1 whitespace-pre-wrap">
            {taskDetails.diagnosis}
          </p>
        </div>
      )}

      {taskDetails.goals && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Goals
          </Label>
          <p className="text-sm mt-1 whitespace-pre-wrap">
            {taskDetails.goals}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Patient
          </Label>
          <p className="text-sm mt-1">{taskDetails.patientName}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Department
          </Label>
          <p className="text-sm mt-1">{taskDetails.departmentName || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Start Date
          </Label>
          <p className="text-sm mt-1">
            {taskDetails.startDate
              ? new Date(taskDetails.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            End Date
          </Label>
          <p className="text-sm mt-1">
            {taskDetails.endDate
              ? new Date(taskDetails.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
      </div>

      {userInterventions.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-muted-foreground mb-3 block">
            Your Interventions
          </Label>
          <div className="space-y-3">
            {userInterventions.map((intervention, index) => {
              const interventionStatus =
                interventionStatusConfig[
                  intervention.status as keyof typeof interventionStatusConfig
                ];
              return (
                <div
                  key={`${task.id}-${intervention.id}-${index}`}
                  className="border rounded-lg p-4"
                >
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
