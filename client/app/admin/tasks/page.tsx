"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ClipboardList,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  Settings,
  Edit,
  Trash2,
  RotateCcw,
  Plus,
  PlayCircle,
  Users,
  FileText,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import {
  getAll$,
  getSummary$,
  deleteTask$,
  updateStatus$,
} from "@/lib/api/admin/tasks/_request";
import {
  Task,
  TaskSummary,
  getPriorityBadgeVariant,
  getStatusBadgeVariant,
  isTaskOverdue,
} from "@/lib/api/admin/tasks/_model";

// Helper to format date (DateOnly format)
const formatDate = (date: string | undefined): string => {
  if (!date) return "N/A";
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Helper to format relative time
const formatRelativeTime = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const ITEMS_PER_PAGE = 10;

export default function AdminTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<TaskSummary>({
    totalTasks: 0,
    overdueTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    highPriority: 0,
    midPriority: 0,
    lowPriority: 0,
    deptWiseSummary: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Hidden">(
    "All"
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    taskId: string;
    taskTitle: string;
    isHidden: boolean;
  }>({
    isOpen: false,
    taskId: "",
    taskTitle: "",
    isHidden: false,
  });
  const [completeDialog, setCompleteDialog] = useState<{
    isOpen: boolean;
    taskId: string;
    taskTitle: string;
    outcomeNotes: string;
  }>({
    isOpen: false,
    taskId: "",
    taskTitle: "",
    outcomeNotes: "",
  });
  const [filters, setFilters] = useState<FilterState>({
    patientMrn: "",
    patientName: "",
    status: "all",
    priority: "all",
    departmentName: "all",
    assignedToDepartment: "all", // Keep for backward compatibility
    sortField: null,
    sortDirection: null,
  });

  // Fetch tasks and summary data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both tasks and summary data in parallel
      const [tasksResponse, summaryResponse] = await Promise.all([
        getAll$(statusFilter),
        getSummary$(),
      ]);

      setTasks(tasksResponse.data);

      // Map summary data from backend DTO
      const summaryData = summaryResponse.data || {};
      setSummary({
        totalTasks: summaryData.totalTasks || 0,
        overdueTasks: summaryData.overdueTasks || 0,
        activeTasks: summaryData.activeTasks || 0,
        completedTasks: summaryData.completedTasks || 0,
        highPriority: summaryData.highPriority || 0,
        midPriority: summaryData.midPriority || 0,
        lowPriority: summaryData.lowPriority || 0,
        deptWiseSummary: summaryData.deptWiseSummary || [],
      });
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Fetch tasks and summary data on component mount and when statusFilter changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Define table columns
  const columns: Column<Task>[] = [
    {
      key: "title",
      label: "Task",
      width: "w-[200px]",
      sortable: true,
      render: (task) => (
        <div>
          <div className="font-medium">{task.title}</div>
          {task.taskType && (
            <div className="text-xs text-muted-foreground">{task.taskType}</div>
          )}
        </div>
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
        <div>
          <button
            onClick={() => router.push(`/admin/patients/${task.patientId}`)}
            className="text-primary hover:underline text-left font-medium"
          >
            {task.patientName}
          </button>
          {task.patientMrn && (
            <div className="text-xs text-muted-foreground">
              {task.patientMrn}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "departmentName",
      label: "Department",
      width: "w-[180px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Physiotherapy", label: "Physiotherapy" },
        { value: "Occupational Therapy", label: "Occupational Therapy" },
        { value: "Speech Therapy", label: "Speech Therapy" },
        { value: "Dietetics", label: "Dietetics" },
      ],
      render: (task) => {
        const departmentName = task.departmentName || task.assignedToDepartment;
        const departmentId = task.departmentId;

        if (!departmentName) {
          return <Badge variant="outline">Unassigned</Badge>;
        }

        return (
          <button
            onClick={() => {
              if (departmentId) {
                router.push(`/admin/setup/departments/${departmentId}`);
              }
            }}
            className={`text-left ${
              departmentId ? "text-primary hover:underline font-medium" : ""
            }`}
          >
            {departmentName}
          </button>
        );
      },
    },
    {
      key: "priority",
      label: "Priority",
      width: "w-[100px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
      ],
      render: (task) => (
        <Badge variant={getPriorityBadgeVariant(task.priority)}>
          {task.priority}
        </Badge>
      ),
    },
    {
      key: "startDate",
      label: "Start",
      width: "w-[140px]",
      sortable: true,
      render: (task) => <div>{formatDate(task.startDate)}</div>,
    },
    {
      key: "endDate",
      label: "End",
      width: "w-[140px]",
      sortable: true,
      render: (task) => (
        <div
          className={isTaskOverdue(task) ? "text-destructive font-medium" : ""}
        >
          {formatDate(task.endDate)}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "w-[130px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Assigned", label: "Assigned" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
      ],
      render: (task) => (
        <Badge variant={getStatusBadgeVariant(task.status)}>
          {task.status}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      width: "w-[140px]",
      sortable: true,
      render: (task) => {
        const lastUpdated = task.lastUpdated || task.updatedAt;
        if (!lastUpdated) return <span>N/A</span>;
        return (
          <span title={new Date(lastUpdated).toLocaleString()}>
            {formatRelativeTime(lastUpdated)}
          </span>
        );
      },
    },
  ];

  // Handle task actions
  const handleTaskAction = (action: string, taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);

    switch (action) {
      case "edit":
        router.push(`/admin/tasks/${taskId}`);
        break;
      case "view-patient":
        if (task) {
          router.push(`/admin/patients/${task.patientId}`);
        }
        break;
      case "start":
        if (task) {
          handleStatusUpdate(taskId, "In Progress");
        }
        break;
      case "complete":
        if (task) {
          setCompleteDialog({
            isOpen: true,
            taskId: taskId,
            taskTitle: task.title,
            outcomeNotes: "",
          });
        }
        break;
      case "delete":
        if (task) {
          setDeleteDialog({
            isOpen: true,
            taskId: taskId,
            taskTitle: task.title,
            isHidden: task.hidden || false,
          });
        }
        break;
    }
  };

  // Handle status update
  const handleStatusUpdate = async (taskId: string, status: Task["status"]) => {
    try {
      await updateStatus$(taskId, status);

      // Refetch tasks and summary to ensure data is in sync
      await fetchData();
    } catch (err) {
      setError("Failed to update task status. Please try again.");
      console.error("Error updating task status:", err);
    }
  };

  // Handle task completion
  const handleCompleteTask = async () => {
    const { taskId, outcomeNotes } = completeDialog;

    try {
      await updateStatus$(taskId, "Completed", outcomeNotes);

      // Refetch tasks and summary to ensure data is in sync
      await fetchData();
    } catch (err) {
      setError("Failed to complete task. Please try again.");
      console.error("Error completing task:", err);
    }

    setCompleteDialog({
      isOpen: false,
      taskId: "",
      taskTitle: "",
      outcomeNotes: "",
    });
  };

  // Handle task deletion/restoration
  const handleDeleteTask = async () => {
    const { taskId } = deleteDialog;

    try {
      await deleteTask$(taskId);

      // Refetch tasks and summary to ensure data is in sync
      await fetchData();
    } catch (err) {
      setError("Failed to delete/restore task. Please try again.");
      console.error("Error deleting/restoring task:", err);
    }

    setDeleteDialog({
      isOpen: false,
      taskId: "",
      taskTitle: "",
      isHidden: false,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      patientMrn: "",
      patientName: "",
      status: "all",
      priority: "all",
      departmentName: "all",
      assignedToDepartment: "all", // Keep for backward compatibility
      sortField: null,
      sortDirection: null,
    });
    setCurrentPage(1);
  };

  // Check if filters are active
  const hasActiveFilters =
    filters.patientMrn ||
    filters.patientName ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    (filters.departmentName && filters.departmentName !== "all") ||
    (filters.assignedToDepartment && filters.assignedToDepartment !== "all") ||
    filters.sortField;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Create, assign, and track patient tasks
          </p>
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
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Create, assign, and track patient tasks
          </p>
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
      <div>
        <h1 className="text-3xl font-bold">Task Management</h1>
        <p className="text-muted-foreground">
          Create, assign, and track patient tasks
        </p>
      </div>

      {/* Statistics Cards - Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={summary.totalTasks}
          description="All tasks"
          icon={ClipboardList}
        />
        <StatsCard
          title="Overdue"
          value={summary.overdueTasks}
          description="Requires attention"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Active"
          value={summary.activeTasks}
          description="Being worked on"
          icon={Clock}
        />
        <StatsCard
          title="Completed"
          value={summary.completedTasks}
          description="Successfully done"
          icon={CheckCircle}
        />
      </div>

      {/* Task Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Task Overview</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 divide-y lg:divide-y-0 lg:divide-x">
            {/* Priority */}
            <div className="space-y-3 pb-4 lg:pb-0 lg:pr-5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h3 className="font-semibold text-sm">Priority Distribution</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted transition-colors">
                  <div className="text-2xl font-bold mb-0.5">
                    {summary.highPriority}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    High
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted transition-colors">
                  <div className="text-2xl font-bold mb-0.5">
                    {summary.midPriority}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Medium
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted transition-colors">
                  <div className="text-2xl font-bold mb-0.5">
                    {summary.lowPriority}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Low
                  </div>
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-3 pt-4 lg:pt-0 lg:pl-5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-primary rounded-full" />
                <h3 className="font-semibold text-sm">
                  Department Distribution
                </h3>
              </div>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {summary.deptWiseSummary.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">
                    No department assignments
                  </div>
                ) : (
                  <>
                    {summary.deptWiseSummary.map((dept) => (
                      <div
                        key={dept.name}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm truncate pr-2">
                          {dept.name || "Unassigned"}
                        </span>
                        <span className="text-base font-bold flex-shrink-0">
                          {dept.count}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "All" | "Active" | "Hidden")
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => router.push("/admin/tasks/0")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
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
            getRowClassName={(task) =>
              task.hidden ? "opacity-50 bg-muted/30 line-through" : ""
            }
            actions={(task) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleTaskAction("edit", task.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleTaskAction("view-patient", task.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Patient
                  </DropdownMenuItem>
                  {task.status !== "Completed" &&
                    task.status !== "In Progress" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleTaskAction("start", task.id)}
                          className="text-blue-600"
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Start Task
                        </DropdownMenuItem>
                      </>
                    )}
                  {(task.status === "In Progress" ||
                    task.status === "Assigned") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleTaskAction("complete", task.id)}
                        className="text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Task
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleTaskAction("delete", task.id)}
                    className={
                      task.hidden ? "text-green-600" : "text-destructive"
                    }
                  >
                    {task.hidden ? (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    {task.hidden ? "Restore Task" : "Delete Task"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({
              isOpen: false,
              taskId: "",
              taskTitle: "",
              isHidden: false,
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.isHidden ? "Restore Task" : "Delete Task"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.isHidden
                ? `Are you sure you want to restore "${deleteDialog.taskTitle}"? This will make the task visible again.`
                : `Are you sure you want to delete "${deleteDialog.taskTitle}"? This action will hide the task.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className={
                deleteDialog.isHidden
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {deleteDialog.isHidden ? "Restore Task" : "Delete Task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Task Dialog */}
      <Dialog
        open={completeDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteDialog({
              isOpen: false,
              taskId: "",
              taskTitle: "",
              outcomeNotes: "",
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Mark "{completeDialog.taskTitle}" as completed and add outcome
              notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outcomeNotes">Outcome Notes *</Label>
              <Textarea
                id="outcomeNotes"
                placeholder="Enter outcome notes and results..."
                value={completeDialog.outcomeNotes}
                onChange={(e) =>
                  setCompleteDialog((prev) => ({
                    ...prev,
                    outcomeNotes: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setCompleteDialog({
                  isOpen: false,
                  taskId: "",
                  taskTitle: "",
                  outcomeNotes: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteTask}
              disabled={!completeDialog.outcomeNotes.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
