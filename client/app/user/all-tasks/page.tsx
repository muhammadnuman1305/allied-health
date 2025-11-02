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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import {
  Search,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  Settings,
  User,
  Calendar,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

// Task interface for all tasks view
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
  assignedTo?: string;
  assignedToDepartment?: string;
  interventionCount: number;
  myInterventionCount: number;
}

// Mock data - all tasks
const mockAllTasks: Task[] = [
  {
    id: "T001",
    title: "Initial Assessment - John Smith",
    description:
      "Complete initial health assessment for new patient John Smith",
    patientId: "P001",
    patientName: "John Smith",
    patientMrn: "MRN00001",
    startDate: "2024-01-10",
    endDate: "2024-01-20",
    priority: "High",
    departmentName: "Cardiology",
    status: "Assigned",
    assignedTo: "Dr. Sarah Johnson",
    assignedToDepartment: "Cardiology",
    interventionCount: 3,
    myInterventionCount: 1,
  },
  {
    id: "T002",
    title: "Follow-up Consultation - Maria Garcia",
    description: "Follow-up consultation for diabetes management",
    patientId: "P002",
    patientName: "Maria Garcia",
    patientMrn: "MRN00002",
    startDate: "2024-01-08",
    endDate: "2024-01-15",
    priority: "Medium",
    departmentName: "Endocrinology",
    status: "In Progress",
    assignedTo: "Dr. Michael Chen",
    assignedToDepartment: "Endocrinology",
    interventionCount: 2,
    myInterventionCount: 1,
  },
  {
    id: "T003",
    title: "Physical Therapy Session - Robert Wilson",
    description: "Post-surgery physical therapy session",
    patientId: "P003",
    patientName: "Robert Wilson",
    patientMrn: "MRN00003",
    startDate: "2024-01-05",
    endDate: "2024-01-12",
    priority: "Low",
    departmentName: "Physical Therapy",
    status: "Completed",
    assignedTo: "Dr. Emily Davis",
    assignedToDepartment: "Physical Therapy",
    interventionCount: 1,
    myInterventionCount: 1,
  },
  {
    id: "T004",
    title: "Nutrition Consultation - Lisa Brown",
    description: "Dietary consultation for weight management",
    patientId: "P004",
    patientName: "Lisa Brown",
    patientMrn: "MRN00004",
    startDate: "2024-01-11",
    endDate: "2024-01-18",
    priority: "Medium",
    departmentName: "Nutrition",
    status: "Assigned",
    assignedTo: "Dr. David Miller",
    assignedToDepartment: "Nutrition",
    interventionCount: 2,
    myInterventionCount: 0,
  },
  {
    id: "T005",
    title: "Cardiac Evaluation - Ahmed Ali",
    description: "Complete cardiac evaluation and assessment",
    patientId: "P005",
    patientName: "Ahmed Ali",
    patientMrn: "MRN00005",
    startDate: "2024-01-12",
    endDate: "2024-01-22",
    priority: "High",
    departmentName: "Cardiology",
    status: "In Progress",
    assignedTo: "Dr. Sarah Johnson",
    assignedToDepartment: "Cardiology",
    interventionCount: 4,
    myInterventionCount: 0,
  },
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    // In real app, fetch all tasks
    setTasks(mockAllTasks);
    setLoading(false);
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
  const handleTaskAction = (action: string, taskId: string) => {
    switch (action) {
      case "view":
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          setSelectedTask(task);
          setIsViewDialogOpen(true);
        }
        break;
      case "patient":
        const taskForPatient = tasks.find((t) => t.id === taskId);
        if (taskForPatient) {
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleTaskAction("view", task.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleTaskAction("patient", task.id)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    View Patient
                  </DropdownMenuItem>
                  {task.myInterventionCount > 0 && (
                    <DropdownMenuItem
                      onClick={() => handleTaskAction("my-tasks", task.id)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View My Interventions
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskDetailView
              task={selectedTask}
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
  onNavigateToPatient,
}: {
  task: Task;
  onNavigateToPatient: (action: string, taskId: string) => void;
}) {
  const status = statusConfig[task.status as keyof typeof statusConfig];
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Assigned To
          </Label>
          <p className="text-sm mt-1">{task.assignedTo || "—"}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">
            Interventions
          </Label>
          <p className="text-sm mt-1">
            {task.interventionCount} total
            {task.myInterventionCount > 0 && (
              <span className="text-primary ml-2">
                ({task.myInterventionCount} assigned to you)
              </span>
            )}
          </p>
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

      <div className="pt-4 border-t flex gap-3">
        <Button
          variant="default"
          onClick={() => onNavigateToPatient("patient", task.id)}
          className="flex-1"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Patient
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        {task.myInterventionCount > 0 && (
          <Button
            variant="outline"
            onClick={() => onNavigateToPatient("my-tasks", task.id)}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            View My Interventions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
