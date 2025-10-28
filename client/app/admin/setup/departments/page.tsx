"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Activity,
  Settings,
  Plus,
  Download,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import {
  getAll$,
  getSummary$,
  toggleActive$,
} from "@/lib/api/admin/departments/_request";
import {
  Department,
  DepartmentSummary,
} from "@/lib/api/admin/departments/_model";
import { toast } from "@/hooks/use-toast";
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

const ITEMS_PER_PAGE = 10;

export default function AdminDepartmentsSetupPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [summary, setSummary] = useState<DepartmentSummary>({
    totalDepartments: 0,
    activeDepartments: 0,
    openTasks: 0,
    overdueTasks: 0,
    incomingReferrals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Hidden">(
    "All"
  );
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    departmentId: string;
    departmentName: string;
    action: "delete" | "restore";
    isHidden: boolean;
  }>({
    isOpen: false,
    departmentId: "",
    departmentName: "",
    action: "delete",
    isHidden: false,
  });
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    headAHP: "all",
    hasOverdueTasks: "all",
    ward: "all",
    sortField: null,
    sortDirection: null,
  });

  // Fetch departments and summary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both departments and summary data in parallel
        const [departmentsResponse, summaryResponse] = await Promise.all([
          getAll$(statusFilter),
          getSummary$(),
        ]);

        setDepartments(departmentsResponse.data);
        setSummary(summaryResponse.data);
      } catch (err: any) {
        console.error("Error fetching data:", err);

        // Handle specific error messages from API
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch data. Please try again.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter]);

  // Define table columns
  const columns: Column<Department>[] = [
    {
      key: "name",
      label: "Name",
      width: "w-[200px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "code",
      label: "Code",
      width: "w-[80px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    // {
    //   key: "serviceLine",
    //   label: "Service Line",
    //   width: "w-[160px]",
    //   sortable: true,
    //   filterable: true,
    //   filterType: "select",
    //   filterOptions: [
    //     { value: "Physiotherapy", label: "Physiotherapy" },
    //     { value: "Occupational Therapy", label: "Occupational Therapy" },
    //     { value: "Speech Therapy", label: "Speech Pathology" },
    //     { value: "Dietetics", label: "Dietitians" },
    //   ],
    //   render: (department) => (
    //     <div className="flex items-center gap-2">
    //       <Stethoscope className="h-4 w-4 text-muted-foreground" />
    //       {getServiceLineDisplayName(department.serviceLine)}
    //     </div>
    //   ),
    // },
    {
      key: "deptHeadName",
      label: "Dept Head",
      width: "w-[160px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "activeAssistants",
      label: "Active Assistants",
      width: "w-[120px]",
      sortable: true,
      render: (department) => department.activeAssistants,
    },
    {
      key: "openTasks",
      label: "Open Tasks",
      width: "w-[120px]",
      sortable: true,
      render: (department) => department.openTasks,
    },
    {
      key: "overdueTasks",
      label: "Overdue Tasks",
      width: "w-[120px]",
      sortable: true,
      render: (department) => department.overdueTasks,
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      width: "w-[140px]",
      sortable: true,
      render: (department) => {
        if (!department.lastUpdated) {
          return <span className="text-muted-foreground">Never</span>;
        }
        const date = new Date(department.lastUpdated);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
  ];

  // Handle department actions
  const handleDepartmentAction = (action: string, departmentId: string) => {
    const department = departments.find((d) => d.id === departmentId);

    switch (action) {
      case "edit":
        router.push(`/admin/setup/departments/${departmentId}`);
        break;
      case "toggle":
        if (department) {
          setActionDialog({
            isOpen: true,
            departmentId: departmentId,
            departmentName: department.name,
            action: department.hidden ? "restore" : "delete",
            isHidden: department.hidden,
          });
        }
        break;
    }
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    const { departmentId } = actionDialog;

    try {
      await toggleActive$(departmentId);

      // Refresh the department list
      const response = await getAll$(statusFilter);
      setDepartments(response.data);
    } catch (err) {
      setError(
        actionDialog.action === "restore"
          ? "Failed to restore department. Please try again."
          : "Failed to hide department. Please try again."
      );
      console.error(
        `Error ${
          actionDialog.action === "restore" ? "restoring" : "hiding"
        } department:`,
        err
      );
    }

    setActionDialog({
      isOpen: false,
      departmentId: "",
      departmentName: "",
      action: "delete",
      isHidden: false,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      name: "",
      headAHP: "all",
      hasOverdueTasks: "all",
      ward: "all",
      sortField: null,
      sortDirection: null,
    });
    setCurrentPage(1);
  };

  // Check if filters are active
  const hasActiveFilters =
    filters.name ||
    filters.headAHP !== "all" ||
    filters.hasOverdueTasks !== "all" ||
    filters.ward !== "all" ||
    filters.sortField;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-muted-foreground">
            Create and manage clinical departments that own tasks and
            receive/send referrals
          </p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading departments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-muted-foreground">
            Create and manage clinical departments that own tasks and
            receive/send referrals
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
        <h1 className="text-3xl font-bold">Departments</h1>
        <p className="text-muted-foreground">
          Create and manage clinical departments that own tasks and receive/send
          referrals
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Departments"
          value={summary.totalDepartments}
          description="All departments"
          icon={Building2}
        />
        <StatsCard
          title="Active Departments"
          value={summary.activeDepartments}
          description="Currently operational"
          icon={Activity}
        />
        <StatsCard
          title="Open Tasks"
          value={summary.openTasks}
          description="Departments with pending tasks"
          icon={Settings}
        />
        <StatsCard
          title="Overdue Tasks"
          value={summary.overdueTasks}
          description="Requires immediate attention"
          icon={Activity}
        />
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Departments</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <Filter className="h-4 w-4 mr-2" />
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
                onClick={() => router.push("/admin/setup/departments/0")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Department
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={departments}
            columns={columns}
            filters={filters}
            onFiltersChange={setFilters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            loading={loading}
            getRowClassName={(department) =>
              department.hidden ? "opacity-50 bg-muted/30 line-through" : ""
            }
            actions={(department) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      handleDepartmentAction("edit", department.id)
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Department
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleDepartmentAction("toggle", department.id)
                    }
                    className={
                      department.hidden ? "text-green-600" : "text-destructive"
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {department.hidden
                      ? "Restore Department"
                      : "Delete Department"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <AlertDialog
        open={actionDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setActionDialog({
              isOpen: false,
              departmentId: "",
              departmentName: "",
              action: "delete",
              isHidden: false,
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "restore"
                ? "Restore Department"
                : "Delete Department"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "restore"
                ? `Are you sure you want to restore "${actionDialog.departmentName}"? This will make the department visible again.`
                : `Are you sure you want to delete "${actionDialog.departmentName}"? This action will hide the department.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedAction}
              className={
                actionDialog.action === "restore"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {actionDialog.action === "restore"
                ? "Restore Department"
                : "Hide Department"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
