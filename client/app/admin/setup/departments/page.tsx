"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Building2,
  Users,
  Activity,
  Settings,
  Edit,
  RotateCcw,
  Plus,
  CheckCircle,
  Stethoscope,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import {
  getAll$,
  toggleActive$,
  getSummary$,
} from "@/lib/api/admin/departments/_request";
import {
  Department,
  DepartmentSummary,
  STATUS_DESCRIPTIONS,
  getServiceLineDisplayName,
} from "@/lib/api/admin/departments/_model";

// Status badge variants
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "A":
      return "default"; // Active - green
    case "X":
      return "outline"; // Inactive - gray
    default:
      return "outline";
  }
};

const ITEMS_PER_PAGE = 10;

export default function AdminDepartmentsSetupPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [summary, setSummary] = useState<DepartmentSummary>({
    totalDepartments: 0,
    activeDepartments: 0,
    serviceLineBreakdown: {
      physiotherapy: 0,
      occupationalTherapy: 0,
      speechTherapy: 0,
      dietetics: 0,
    },
    statusBreakdown: {
      active: 0,
      inactive: 0,
    },
    totalOpenTasks: 0,
    totalOverdueTasks: 0,
    totalIncomingReferralsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    departmentId: string;
    departmentName: string;
    action: "activate" | "deactivate";
  }>({
    isOpen: false,
    departmentId: "",
    departmentName: "",
    action: "deactivate",
  });
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    serviceLine: "all",
    status: "all",
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
          getAll$(),
          getSummary$(),
        ]);

        setDepartments(departmentsResponse.data);
        setSummary(summaryResponse.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    {
      key: "serviceLine",
      label: "Service Line",
      width: "w-[160px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Physiotherapy", label: "Physiotherapy" },
        { value: "Occupational Therapy", label: "Occupational Therapy" },
        { value: "Speech Therapy", label: "Speech Pathology" },
        { value: "Dietetics", label: "Dietitians" },
      ],
      render: (department) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          {getServiceLineDisplayName(department.serviceLine)}
        </div>
      ),
    },
    {
      key: "headAHPName",
      label: "Head AHP",
      width: "w-[160px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "activeAHPs",
      label: "Active AHPs",
      width: "w-[100px]",
      sortable: true,
      render: (department) => (
        <Badge variant="secondary" className="text-xs">
          {department.activeAHPs}
        </Badge>
      ),
    },
    {
      key: "activeAHAs",
      label: "Active AHAs",
      width: "w-[100px]",
      sortable: true,
      render: (department) => (
        <Badge variant="secondary" className="text-xs">
          {department.activeAHAs}
        </Badge>
      ),
    },
    {
      key: "coverageWardNames",
      label: "Coverage Wards",
      width: "w-[140px]",
      render: (department) => (
        <div className="flex flex-wrap gap-1">
          {department.coverageWardNames?.slice(0, 2).map((ward, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {ward}
            </Badge>
          ))}
          {department.coverageWardNames &&
            department.coverageWardNames.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{department.coverageWardNames.length - 2}
              </Badge>
            )}
        </div>
      ),
    },
    {
      key: "openTasks",
      label: "Open/Overdue Tasks",
      width: "w-[140px]",
      sortable: true,
      render: (department) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {department.openTasks} open
          </Badge>
          {department.overdueTasks > 0 && (
            <Badge variant="destructive" className="text-xs">
              {department.overdueTasks} overdue
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "w-[100px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "A", label: "Active" },
        { value: "X", label: "Inactive" },
      ],
      render: (department) => (
        <Badge
          variant={getStatusBadgeVariant(department.status)}
          title={STATUS_DESCRIPTIONS[department.status]}
        >
          {department.status === "A" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  // Handle department actions
  const handleDepartmentAction = (action: string, departmentId: string) => {
    switch (action) {
      case "view":
        router.push(`/admin/setup/departments/${departmentId}`);
        break;
      case "edit":
        router.push(`/admin/setup/departments/${departmentId}/edit`);
        break;
      case "activate":
      case "deactivate":
        const dept = departments.find((d) => d.id === departmentId);
        if (dept) {
          setActionDialog({
            isOpen: true,
            departmentId: departmentId,
            departmentName: dept.name,
            action: action as "activate" | "deactivate",
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

      // Update local state to reflect the change
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === departmentId
            ? { ...dept, status: dept.status === "X" ? "A" : "X" }
            : dept
        )
      );

      // Update summary
      const updatedSummary = { ...summary };
      if (actionDialog.action === "activate") {
        updatedSummary.activeDepartments++;
        updatedSummary.statusBreakdown.active++;
        updatedSummary.statusBreakdown.inactive--;
      } else {
        updatedSummary.activeDepartments--;
        updatedSummary.statusBreakdown.active--;
        updatedSummary.statusBreakdown.inactive++;
      }
      setSummary(updatedSummary);
    } catch (err) {
      setError("Failed to update department status. Please try again.");
      console.error("Error toggling department status:", err);
    }

    setActionDialog({
      isOpen: false,
      departmentId: "",
      departmentName: "",
      action: "deactivate",
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      name: "",
      serviceLine: "all",
      status: "all",
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
    filters.serviceLine !== "all" ||
    filters.status !== "all" ||
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          title="Physiotherapy"
          value={summary.serviceLineBreakdown.physiotherapy}
          description="Mobility & strength"
          icon={Users}
        />
        <StatsCard
          title="Occupational Therapy"
          value={summary.serviceLineBreakdown.occupationalTherapy}
          description="Function & cognition"
          icon={Users}
        />
        <StatsCard
          title="Speech Pathology"
          value={summary.serviceLineBreakdown.speechTherapy}
          description="Communication & swallowing"
          icon={Users}
        />
        <StatsCard
          title="Dietitians"
          value={summary.serviceLineBreakdown.dietetics}
          description="Nutrition & feeding"
          icon={Users}
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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
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
                      handleDepartmentAction("view", department.id)
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleDepartmentAction("edit", department.id)
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handleDepartmentAction(
                        department.status === "X" ? "activate" : "deactivate",
                        department.id
                      )
                    }
                    className={
                      department.status === "X"
                        ? "text-green-600"
                        : "text-destructive"
                    }
                  >
                    {department.status === "X" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    )}
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
              action: "deactivate",
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "activate"
                ? "Activate Department"
                : "Deactivate Department"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "activate"
                ? `Are you sure you want to activate "${actionDialog.departmentName}"? This will make the department operational and available for referrals.`
                : `Are you sure you want to deactivate "${actionDialog.departmentName}"? This will mark the department as inactive and prevent new referrals.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedAction}
              className={
                actionDialog.action === "activate"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {actionDialog.action === "activate"
                ? "Activate Department"
                : "Deactivate Department"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
