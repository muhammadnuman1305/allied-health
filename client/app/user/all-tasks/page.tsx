"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  ArrowRight,
  User,
} from "lucide-react";
import { getAllTasks$, getTaskDetailsById$ } from "@/lib/api/aha/_request";
import type { AHATask, AHATaskDetails } from "@/lib/api/aha/_model";
import { toast } from "sonner";

// Task interface for all tasks view (using AHATask from API)
type Task = AHATask;

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

const ITEMS_PER_PAGE = 10;

export default function AllTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    title: "",
    patientName: "",
    status: "",
    priority: "",
    sortField: null,
    sortDirection: null,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetails, setTaskDetails] = useState<AHATaskDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllTasks$();
        setTasks(response.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Get task counts
  const taskCounts = {
    total: tasks.length,
    assigned: tasks.filter((t) => t.status === "Assigned").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    myTasks: tasks.filter((t) => t.myInterventionCount > 0).length,
  };

  // Define table columns
  const columns: Column<Task>[] = [
    {
      key: "title",
      label: "Task Title",
      width: "w-[250px]",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (task) => (
        <span className="text-left font-medium">{task.title}</span>
      ),
    },
    {
      key: "patientName",
      label: "Patient",
      width: "w-[180px]",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (task) => (
        <div className="flex flex-col">
          <span className="font-medium">{task.patientName}</span>
          {task.patientMrn && (
            <span className="text-xs text-muted-foreground">
              {task.patientMrn}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "w-[140px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "", label: "All" },
        { value: "Not Assigned", label: "Not Assigned" },
        { value: "Assigned", label: "Assigned" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Overdue", label: "Overdue" },
      ],
      render: (task) => {
        const status = statusConfig[task.status as keyof typeof statusConfig];
        return <Badge className={status.color}>{status.label}</Badge>;
      },
    },
    {
      key: "priority",
      label: "Priority",
      width: "w-[120px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "", label: "All" },
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "High", label: "High" },
      ],
      render: (task) => {
        const priority =
          priorityConfig[task.priority as keyof typeof priorityConfig];
        return <Badge className={priority.color}>{priority.label}</Badge>;
      },
    },
    {
      key: "departmentName",
      label: "Department",
      width: "w-[150px]",
      sortable: true,
      render: (task) => task.departmentName || "—",
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      width: "w-[160px]",
      sortable: true,
      render: (task) => task.assignedTo || "—",
    },
    {
      key: "interventionCount",
      label: "Interventions",
      width: "w-[130px]",
      sortable: true,
      render: (task) => (
        <div className="flex flex-col">
          <span>{task.interventionCount} total</span>
          {task.myInterventionCount > 0 && (
            <span className="text-xs text-primary font-medium">
              {task.myInterventionCount} mine
            </span>
          )}
        </div>
      ),
    },
    {
      key: "endDate",
      label: "Due Date",
      width: "w-[140px]",
      sortable: true,
      render: (task) =>
        new Date(task.endDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  // Handle task actions
  const handleTaskAction = async (action: string, taskId: string) => {
    switch (action) {
      case "view":
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          try {
            setSelectedTask(task);
            const response = await getTaskDetailsById$(taskId);
            setTaskDetails(response.data);
            setIsViewDialogOpen(true);
          } catch (err) {
            console.error("Error fetching task details:", err);
            toast.error("Failed to load task details. Please try again.");
            setSelectedTask(null);
            setTaskDetails(null);
          }
        }
        break;
      case "patient":
        const taskForPatient = tasks.find((t) => t.id === taskId);
        if (taskForPatient && taskForPatient.patientId) {
          router.push(`/user/all-patients/${taskForPatient.patientId}`);
        }
        break;
      case "my-tasks":
        router.push(`/user/my-tasks`);
        break;
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      title: "",
      patientName: "",
      status: "",
      priority: "",
      sortField: null,
      sortDirection: null,
    });
    setCurrentPage(1);
  };

  // Check if filters are active
  const hasActiveFilters =
    filters.title ||
    filters.patientName ||
    filters.status ||
    filters.priority ||
    filters.sortField;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Tasks</h1>
          <p className="text-muted-foreground">View all tasks in the system</p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">All Tasks</h1>
          <p className="text-muted-foreground">View all tasks in the system</p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">All Tasks</h1>
        <p className="text-muted-foreground mt-1">
          View all tasks in the system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Tasks"
          value={taskCounts.total}
          icon={FileText}
        />
        <StatsCard
          title="My Tasks"
          value={taskCounts.myTasks}
          description="With my interventions"
          icon={User}
        />
        <StatsCard
          title="Assigned"
          value={taskCounts.assigned}
          icon={AlertCircle}
        />
        <StatsCard
          title="In Progress"
          value={taskCounts.inProgress}
          icon={Clock}
        />
        <StatsCard
          title="Completed"
          value={taskCounts.completed}
          icon={CheckCircle}
        />
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks Table</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={tasks}
            columns={columns}
            filters={filters}
            onFiltersChange={setFilters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            loading={loading}
            actions={(task) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTaskAction("view", task.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          />
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            // Reset state when dialog closes
            setSelectedTask(null);
            setTaskDetails(null);
          }
        }}
      >
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
              onNavigateToPatient={handleTaskAction}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
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
  onNavigateToPatient: (action: string, taskId: string) => void;
}) {
  const status = statusConfig[task.status as keyof typeof statusConfig];
  const priority =
    priorityConfig[taskDetails.priority as keyof typeof priorityConfig];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Status
          </Label>
          <div className="mt-1">
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Priority
          </Label>
          <div className="mt-1">
            <Badge className={priority.color}>{priority.label}</Badge>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Total Interventions
          </Label>
          <p className="text-sm mt-1">{taskDetails.totalInterventions}</p>
        </div>
        {taskDetails.lastUpdated && (
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Last Updated
            </Label>
            <p className="text-sm mt-1">
              {new Date(taskDetails.lastUpdated).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
      </div>

      {task.myInterventionCount > 0 && (
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onNavigateToPatient("my-tasks", task.id)}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            View My Interventions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
