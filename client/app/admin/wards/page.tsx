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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Bed,
  Users,
  AlertTriangle,
  Activity,
  Settings,
  Edit,
  RotateCcw,
  Plus,
  Wrench,
  UserPlus,
  UserMinus,
  CheckCircle,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import {
  getAll$,
  toggleActive$,
  getSummary$,
  updateOccupancy$,
} from "@/lib/api/admin/wards/_request";
import {
  Ward,
  WardSummary,
  STATUS_DESCRIPTIONS,
  getOccupancyVariant,
  getOccupancyLabel,
} from "@/lib/api/admin/wards/_model";

// Status badge variants
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "A":
      return "default"; // Active - green
    case "M":
      return "secondary"; // Maintenance - yellow
    case "C":
      return "destructive"; // Closed - red
    case "X":
      return "outline"; // Inactive - gray
    default:
      return "outline";
  }
};

const ITEMS_PER_PAGE = 10;

export default function AdminWardsPage() {
  const router = useRouter();
  const [wards, setWards] = useState<Ward[]>([]);
  const [summary, setSummary] = useState<WardSummary>({
    totalWards: 0,
    activeWards: 0,
    totalCapacity: 0,
    totalOccupancy: 0,
    occupancyRate: 0,
    wardTypeBreakdown: {
      generalMedical: 0,
      surgical: 0,
      icu: 0,
      emergency: 0,
      specialized: 0,
    },
    statusBreakdown: {
      active: 0,
      maintenance: 0,
      closed: 0,
      inactive: 0,
    },
    wardsInMaintenance: 0,
    availableBeds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    wardId: string;
    wardName: string;
    action: "activate" | "deactivate" | "maintenance" | "close";
  }>({
    isOpen: false,
    wardId: "",
    wardName: "",
    action: "deactivate",
  });
  const [occupancyDialog, setOccupancyDialog] = useState<{
    isOpen: boolean;
    wardId: string;
    wardName: string;
    currentOccupancy: number;
    capacity: number;
    newOccupancy: string;
  }>({
    isOpen: false,
    wardId: "",
    wardName: "",
    currentOccupancy: 0,
    capacity: 0,
    newOccupancy: "",
  });
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    department: "all",
    wardType: "all",
    status: "all",
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
      label: "Ward Name",
      width: "w-[180px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "department",
      label: "Department",
      width: "w-[150px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Internal Medicine", label: "Internal Medicine" },
        { value: "Surgery", label: "Surgery" },
        { value: "Cardiology", label: "Cardiology" },
        { value: "Neurology", label: "Neurology" },
        { value: "Orthopedics", label: "Orthopedics" },
        { value: "Emergency Medicine", label: "Emergency Medicine" },
        { value: "Critical Care", label: "Critical Care" },
        { value: "Rehabilitation", label: "Rehabilitation" },
      ],
    },
    {
      key: "wardType",
      label: "Ward Type",
      width: "w-[120px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "General Medical", label: "General Medical" },
        { value: "Surgical", label: "Surgical" },
        { value: "ICU", label: "ICU" },
        { value: "Emergency", label: "Emergency" },
        { value: "Specialized", label: "Specialized" },
      ],
    },
    {
      key: "location",
      label: "Location",
      width: "w-[120px]",
    },
    {
      key: "capacity",
      label: "Capacity",
      width: "w-[80px]",
      sortable: true,
      render: (ward) => (
        <div className="text-center font-medium">{ward.capacity}</div>
      ),
    },
    {
      key: "occupancy",
      label: "Occupancy",
      width: "w-[120px]",
      render: (ward) => {
        const occupancyRate = Math.round(
          (ward.currentOccupancy / ward.capacity) * 100
        );
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {ward.currentOccupancy}/{ward.capacity}
            </span>
            <Badge
              variant={getOccupancyVariant(occupancyRate)}
              className="text-xs"
            >
              {occupancyRate}%
            </Badge>
          </div>
        );
      },
    },
    {
      key: "wardManager",
      label: "Manager",
      width: "w-[150px]",
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
        { value: "M", label: "Maintenance" },
        { value: "C", label: "Closed" },
        { value: "X", label: "Inactive" },
      ],
      render: (ward) => (
        <Badge
          variant={getStatusBadgeVariant(ward.status)}
          title={STATUS_DESCRIPTIONS[ward.status]}
        >
          {ward.status}
        </Badge>
      ),
    },
  ];

  // Handle ward actions
  const handleWardAction = (action: string, wardId: string) => {
    switch (action) {
      case "edit":
        router.push(`/admin/wards/${wardId}`);
        break;
      case "update-occupancy":
        const ward = wards.find((w) => w.id === wardId);
        if (ward) {
          setOccupancyDialog({
            isOpen: true,
            wardId: wardId,
            wardName: ward.name,
            currentOccupancy: ward.currentOccupancy,
            capacity: ward.capacity,
            newOccupancy: ward.currentOccupancy.toString(),
          });
        }
        break;
      case "activate":
      case "deactivate":
      case "maintenance":
      case "close":
        const w = wards.find((w) => w.id === wardId);
        if (w) {
          setActionDialog({
            isOpen: true,
            wardId: wardId,
            wardName: w.name,
            action: action as
              | "activate"
              | "deactivate"
              | "maintenance"
              | "close",
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

  // Handle occupancy update
  const handleOccupancyUpdate = async () => {
    const { wardId, newOccupancy, capacity } = occupancyDialog;
    const occupancyNumber = parseInt(newOccupancy);

    if (occupancyNumber < 0 || occupancyNumber > capacity) {
      setError(`Occupancy must be between 0 and ${capacity}`);
      return;
    }

    try {
      await updateOccupancy$(wardId, occupancyNumber);

      // Update local state
      setWards((prev) =>
        prev.map((ward) =>
          ward.id === wardId
            ? { ...ward, currentOccupancy: occupancyNumber }
            : ward
        )
      );

      setOccupancyDialog({
        isOpen: false,
        wardId: "",
        wardName: "",
        currentOccupancy: 0,
        capacity: 0,
        newOccupancy: "",
      });
    } catch (err) {
      setError("Failed to update occupancy. Please try again.");
      console.error("Error updating occupancy:", err);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      name: "",
      department: "all",
      wardType: "all",
      status: "all",
      sortField: null,
      sortDirection: null,
    });
    setCurrentPage(1);
  };

  // Check if filters are active
  const hasActiveFilters =
    filters.name ||
    filters.department !== "all" ||
    filters.wardType !== "all" ||
    filters.status !== "all" ||
    filters.sortField;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Ward Management</h1>
          <p className="text-muted-foreground">
            Manage hospital wards and bed capacity
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
          <h1 className="text-3xl font-bold">Ward Management</h1>
          <p className="text-muted-foreground">
            Manage hospital wards and bed capacity
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
        <h1 className="text-3xl font-bold">Ward Management</h1>
        <p className="text-muted-foreground">
          Manage hospital wards and bed capacity
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Wards"
          value={summary.totalWards}
          description="All wards"
          icon={Building2}
        />
        <StatsCard
          title="Active Wards"
          value={summary.activeWards}
          description="Currently operational"
          icon={Activity}
          variant="primary"
        />
        <StatsCard
          title="Total Beds"
          value={summary.totalCapacity}
          description="Bed capacity"
          icon={Bed}
        />
        <StatsCard
          title="Available Beds"
          value={summary.availableBeds}
          description="Ready for admission"
          icon={Users}
          variant="secondary"
        />
      </div>

      {/* Occupancy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Overall Occupancy"
          value={`${Math.round(summary.occupancyRate)}%`}
          description={`${summary.totalOccupancy} of ${summary.totalCapacity} beds`}
          icon={Users}
          variant={getOccupancyVariant(summary.occupancyRate)}
        />
        <StatsCard
          title="Maintenance"
          value={summary.wardsInMaintenance}
          description="Wards under maintenance"
          icon={Wrench}
          variant="secondary"
        />
        <StatsCard
          title="Occupancy Level"
          value={getOccupancyLabel(summary.occupancyRate)}
          description="Current capacity status"
          icon={AlertTriangle}
          variant={getOccupancyVariant(summary.occupancyRate)}
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
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={() => router.push("/admin/wards/0")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ward
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
                    onClick={() => handleWardAction("edit", ward.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Ward
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleWardAction("update-occupancy", ward.id)
                    }
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Update Occupancy
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
                        Activate Ward
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Deactivate Ward
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
                ? `Are you sure you want to activate "${actionDialog.wardName}"? This will make the ward operational and available for patient admissions.`
                : `Are you sure you want to deactivate "${actionDialog.wardName}"? This will mark the ward as inactive and prevent new patient admissions.`}
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

      {/* Occupancy Update Dialog */}
      <Dialog
        open={occupancyDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setOccupancyDialog({
              isOpen: false,
              wardId: "",
              wardName: "",
              currentOccupancy: 0,
              capacity: 0,
              newOccupancy: "",
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Ward Occupancy</DialogTitle>
            <DialogDescription>
              Update the current occupancy for "{occupancyDialog.wardName}".
              Capacity: {occupancyDialog.capacity} beds.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="occupancy">Current Occupancy</Label>
              <Input
                id="occupancy"
                type="number"
                min="0"
                max={occupancyDialog.capacity}
                value={occupancyDialog.newOccupancy}
                onChange={(e) =>
                  setOccupancyDialog((prev) => ({
                    ...prev,
                    newOccupancy: e.target.value,
                  }))
                }
                placeholder="Enter number of occupied beds"
              />
              <p className="text-xs text-muted-foreground">
                Enter a number between 0 and {occupancyDialog.capacity}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setOccupancyDialog({
                  isOpen: false,
                  wardId: "",
                  wardName: "",
                  currentOccupancy: 0,
                  capacity: 0,
                  newOccupancy: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleOccupancyUpdate}
              disabled={
                !occupancyDialog.newOccupancy ||
                parseInt(occupancyDialog.newOccupancy) < 0 ||
                parseInt(occupancyDialog.newOccupancy) >
                  occupancyDialog.capacity
              }
            >
              <Users className="mr-2 h-4 w-4" />
              Update Occupancy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
