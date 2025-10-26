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
  Bed,
  Users,
  Activity,
  Settings,
  Edit,
  RotateCcw,
  Plus,
  CheckCircle,
  Eye,
  Download,
  Filter,
  MapPin,
  Building2,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import {
  getAll$,
  toggleActive$,
  getSummary$,
} from "@/lib/api/admin/wards/_request";
import {
  Ward,
  WardSummary,
  WARD_STATUS_DESCRIPTIONS,
  getWardLocationDisplayName,
} from "@/lib/api/admin/wards/_model";

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

export default function AdminWardsSetupPage() {
  const router = useRouter();
  const [wards, setWards] = useState<Ward[]>([]);
  const [summary, setSummary] = useState<WardSummary>({
    totalWards: 0,
    activeWards: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    statusBreakdown: {
      active: 0,
      inactive: 0,
    },
    totalOpenTasks: 0,
    totalOverdueTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    wardId: string;
    wardName: string;
    action: "activate" | "deactivate";
  }>({
    isOpen: false,
    wardId: "",
    wardName: "",
    action: "deactivate",
  });
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    status: "all",
    defaultDepartment: "all",
    coverageDepartment: "all",
    location: "all",
    sortField: null,
    sortDirection: null,
  });

  // Fetch wards and summary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both wards and summary data in parallel
        const [wardsResponse, summaryResponse] = await Promise.all([
          getAll$(),
          getSummary$(),
        ]);

        setWards(wardsResponse.data);
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
  const columns: Column<Ward>[] = [
    {
      key: "name",
      label: "Name",
      width: "w-[180px]",
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
      key: "location",
      label: "Location",
      width: "w-[140px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Ground Floor", label: "Ground Floor" },
        { value: "First Floor", label: "First Floor" },
        { value: "Second Floor", label: "Second Floor" },
        { value: "Third Floor", label: "Third Floor" },
        { value: "ICU", label: "ICU" },
        { value: "Emergency", label: "Emergency" },
        { value: "Surgery", label: "Surgery" },
        { value: "Rehabilitation", label: "Rehabilitation" },
      ],
      render: (ward) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {getWardLocationDisplayName(ward.location as any)}
        </div>
      ),
    },
    {
      key: "bedCount",
      label: "Bed Count",
      width: "w-[100px]",
      sortable: true,
      render: (ward) => (
        <Badge variant="secondary" className="text-xs">
          {ward.bedCount} beds
        </Badge>
      ),
    },
    {
      key: "defaultDepartmentName",
      label: "Default Department",
      width: "w-[160px]",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (ward) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          {ward.defaultDepartmentName || "Not assigned"}
        </div>
      ),
    },
    {
      key: "coverageDepartmentNames",
      label: "Coverage Departments",
      width: "w-[160px]",
      render: (ward) => (
        <div className="flex flex-wrap gap-1">
          {ward.coverageDepartmentNames?.slice(0, 2).map((dept, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {dept}
            </Badge>
          ))}
          {ward.coverageDepartmentNames &&
            ward.coverageDepartmentNames.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{ward.coverageDepartmentNames.length - 2}
              </Badge>
            )}
        </div>
      ),
    },
    {
      key: "currentPatients",
      label: "Current Patients",
      width: "w-[120px]",
      sortable: true,
      render: (ward) => (
        <Badge variant="secondary" className="text-xs">
          {ward.currentPatients}
        </Badge>
      ),
    },
    {
      key: "openTasks",
      label: "Open/Overdue Tasks",
      width: "w-[140px]",
      sortable: true,
      render: (ward) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {ward.openTasks} open
          </Badge>
          {ward.overdueTasks > 0 && (
            <Badge variant="destructive" className="text-xs">
              {ward.overdueTasks} overdue
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
      render: (ward) => (
        <Badge
          variant={getStatusBadgeVariant(ward.status)}
          title={WARD_STATUS_DESCRIPTIONS[ward.status]}
        >
          {ward.status === "A" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  // Handle ward actions
  const handleWardAction = (action: string, wardId: string) => {
    switch (action) {
      case "view":
        router.push(`/admin/setup/wards/${wardId}`);
        break;
      case "edit":
        router.push(`/admin/setup/wards/${wardId}/edit`);
        break;
      case "activate":
      case "deactivate":
        const ward = wards.find((w) => w.id === wardId);
        if (ward) {
          setActionDialog({
            isOpen: true,
            wardId: wardId,
            wardName: ward.name,
            action: action as "activate" | "deactivate",
          });
        }
        break;
    }
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    const { wardId } = actionDialog;

    try {
      await toggleActive$(wardId);

      // Update local state to reflect the change
      setWards((prev) =>
        prev.map((ward) =>
          ward.id === wardId
            ? { ...ward, status: ward.status === "X" ? "A" : "X" }
            : ward
        )
      );

      // Update summary
      const updatedSummary = { ...summary };
      if (actionDialog.action === "activate") {
        updatedSummary.activeWards++;
        updatedSummary.statusBreakdown.active++;
        updatedSummary.statusBreakdown.inactive--;
      } else {
        updatedSummary.activeWards--;
        updatedSummary.statusBreakdown.active--;
        updatedSummary.statusBreakdown.inactive++;
      }
      setSummary(updatedSummary);
    } catch (err) {
      setError("Failed to update ward status. Please try again.");
      console.error("Error toggling ward status:", err);
    }

    setActionDialog({
      isOpen: false,
      wardId: "",
      wardName: "",
      action: "deactivate",
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      name: "",
      status: "all",
      defaultDepartment: "all",
      coverageDepartment: "all",
      location: "all",
      sortField: null,
      sortDirection: null,
    });
    setCurrentPage(1);
  };

  // Check if filters are active
  const hasActiveFilters =
    filters.name ||
    filters.status !== "all" ||
    filters.defaultDepartment !== "all" ||
    filters.coverageDepartment !== "all" ||
    filters.location !== "all" ||
    filters.sortField;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Wards</h1>
          <p className="text-muted-foreground">
            Manage hospital locations where patients reside; multiple
            departments can cover a ward
          </p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wards...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Wards</h1>
          <p className="text-muted-foreground">
            Manage hospital locations where patients reside; multiple
            departments can cover a ward
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
        <h1 className="text-3xl font-bold">Wards</h1>
        <p className="text-muted-foreground">
          Manage hospital locations where patients reside; multiple departments
          can cover a ward
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Wards"
          value={summary.totalWards}
          description="All wards"
          icon={Bed}
        />
        <StatsCard
          title="Active Wards"
          value={summary.activeWards}
          description="Currently operational"
          icon={Activity}
        />
        <StatsCard
          title="Total Beds"
          value={summary.totalBeds}
          description="Available capacity"
          icon={Users}
        />
        <StatsCard
          title="Occupied Beds"
          value={summary.occupiedBeds}
          description={`${Math.round(
            (summary.occupiedBeds / summary.totalBeds) * 100
          )}% occupancy`}
          icon={Users}
        />
      </div>

      {/* Wards Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Wards</CardTitle>
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
                onClick={() => router.push("/admin/setup/wards/0")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Ward
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={wards}
            columns={columns}
            filters={filters}
            onFiltersChange={setFilters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            loading={loading}
            actions={(ward) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleWardAction("view", ward.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleWardAction("edit", ward.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handleWardAction(
                        ward.status === "X" ? "activate" : "deactivate",
                        ward.id
                      )
                    }
                    className={
                      ward.status === "X"
                        ? "text-green-600"
                        : "text-destructive"
                    }
                  >
                    {ward.status === "X" ? (
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
              wardId: "",
              wardName: "",
              action: "deactivate",
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "activate"
                ? "Activate Ward"
                : "Deactivate Ward"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "activate"
                ? `Are you sure you want to activate "${actionDialog.wardName}"? This will make the ward operational and available for patient assignments.`
                : `Are you sure you want to deactivate "${actionDialog.wardName}"? This will mark the ward as inactive and prevent new patient assignments.`}
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
                ? "Activate Ward"
                : "Deactivate Ward"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
