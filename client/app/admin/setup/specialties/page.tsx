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
  Activity,
  Plus,
  Settings,
  Edit,
  Trash2,
  Building2,
  Filter,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import {
  getAll$,
  getSummary$,
  toggleActive$,
} from "@/lib/api/admin/specialties/_request";
import {
  Specialty,
  SpecialtySummary,
} from "@/lib/api/admin/specialties/_model";
import { formatLastUpdated } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function AdminSpecialtiesSetupPage() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [summary, setSummary] = useState<SpecialtySummary>({
    totalSpecialties: 0,
    activeSpecialties: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Hidden">(
    "All"
  );
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    description: "",
    sortField: null,
    sortDirection: null,
  });
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    specialtyId: string;
    specialtyName: string;
    action: "delete" | "restore";
    isHidden: boolean;
  }>({
    isOpen: false,
    specialtyId: "",
    specialtyName: "",
    action: "delete",
    isHidden: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [listRes, summaryRes] = await Promise.all([
          getAll$(statusFilter),
          getSummary$(),
        ]);
        setSpecialties(listRes.data);
        setSummary(summaryRes.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to fetch specialties."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter]);

  const columns: Column<Specialty>[] = [
    {
      key: "name",
      label: "Name",
      width: "w-[220px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "description",
      label: "Description",
      width: "w-[400px]",
      sortable: false,
      filterable: true,
      filterType: "text",
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      width: "w-[140px]",
      sortable: true,
      render: (row) => {
        const text = formatLastUpdated(row.lastUpdated as any);
        return text === "Never" ? (
          <span className="text-muted-foreground">Never</span>
        ) : (
          text
        );
      },
    },
  ];

  const hasActiveFilters = Boolean(
    filters.name || (filters as any).description || filters.sortField
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Specialties</h1>
          <p className="text-muted-foreground">
            Create and manage clinical specialties
          </p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading specialties...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Specialties</h1>
          <p className="text-muted-foreground">
            Create and manage clinical specialties
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

  const handleAction = (action: string, id: string) => {
    const sp = specialties.find((s) => s.id === id);
    if (!sp) return;
    if (action === "edit") {
      router.push(`/admin/setup/specialties/${id}`);
      return;
    }
    setActionDialog({
      isOpen: true,
      specialtyId: id,
      specialtyName: sp.name,
      action: sp.hidden ? "restore" : "delete",
      isHidden: sp.hidden,
    });
  };

  const confirmAction = async () => {
    try {
      await toggleActive$(actionDialog.specialtyId);
      const [listRes, summaryRes] = await Promise.all([
        getAll$(statusFilter),
        getSummary$(),
      ]);
      setSpecialties(listRes.data);
      setSummary(summaryRes.data);
    } catch (e: any) {
      console.error("Error toggling specialty:", e);
    } finally {
      setActionDialog({
        isOpen: false,
        specialtyId: "",
        specialtyName: "",
        action: "delete",
        isHidden: false,
      });
    }
  };

  const clearAllFilters = () => {
    setFilters({
      name: "",
      description: "",
      sortField: null,
      sortDirection: null,
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Specialties</h1>
        <p className="text-muted-foreground">
          Create and manage clinical specialties
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Specialties"
          value={summary.totalSpecialties}
          description="All specialties"
          icon={Building2}
        />
        <StatsCard
          title="Active Specialties"
          value={summary.activeSpecialties}
          description="Currently active"
          icon={Activity}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Specialties</CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
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
                onClick={() => router.push("/admin/setup/specialties/0")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Specialty
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={specialties}
            columns={columns}
            filters={filters}
            onFiltersChange={setFilters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            loading={loading}
            getRowClassName={(row) =>
              row.hidden ? "opacity-50 bg-muted/30 line-through" : ""
            }
            actions={(row) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleAction("edit", row.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Specialty
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAction("toggle", row.id)}
                    className={
                      row.hidden ? "text-green-600" : "text-destructive"
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {row.hidden ? "Restore Specialty" : "Delete Specialty"}
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
              specialtyId: "",
              specialtyName: "",
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
                ? "Restore Specialty"
                : "Delete Specialty"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "restore"
                ? `Are you sure you want to restore "${actionDialog.specialtyName}"? This will make the specialty visible again.`
                : `Are you sure you want to delete "${actionDialog.specialtyName}"? This action will hide the specialty.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionDialog.action === "restore"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {actionDialog.action === "restore"
                ? "Restore Specialty"
                : "Hide Specialty"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
