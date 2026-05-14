"use client";

import { useEffect, useState } from "react";
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
  Stethoscope,
  Filter,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import {
  getAll$,
  getSummary$,
  toggleActive$,
} from "@/lib/api/admin/interventions/_request";
import {
  Intervention,
  InterventionSummary,
} from "@/lib/api/admin/interventions/_model";
import { formatLastUpdated } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function AdminInterventionsSetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = useState<Intervention[]>([]);
  const [summary, setSummary] = useState<InterventionSummary>({
    totalInterventions: 0,
    activeInterventions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Hidden">(
    "All"
  );
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    specialty: "all",
    sortField: null,
    sortDirection: null,
  });
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    action: "delete" | "restore";
    isHidden: boolean;
  }>({ isOpen: false, id: "", name: "", action: "delete", isHidden: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [listRes, summaryRes] = await Promise.all([
          getAll$(statusFilter),
          getSummary$(),
        ]);
        setRows(listRes.data);
        setSummary(summaryRes.data);
      } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: e?.response?.data?.message || e?.message || "Failed to fetch interventions." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [statusFilter]);

  const columns: Column<Intervention>[] = [
    {
      key: "name",
      label: "Name",
      width: "w-[220px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "specialty",
      label: "Specialty",
      width: "w-[200px]",
      sortable: true,
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      width: "w-[140px]",
      sortable: true,
      render: (r) => formatLastUpdated(r.lastUpdated),
    },
  ];

  const hasActiveFilters = Boolean(filters.name || filters.sortField);

  const handleAction = (action: string, id: string) => {
    const it = rows.find((r) => r.id === id);
    if (!it) return;
    if (action === "edit") {
      router.push(`/ahp/setup/interventions/${id}`);
      return;
    }
    setActionDialog({
      isOpen: true,
      id,
      name: it.name,
      action: it.hidden ? "restore" : "delete",
      isHidden: it.hidden,
    });
  };

  const confirmAction = async () => {
    try {
      await toggleActive$(actionDialog.id);
      const [listRes, summaryRes] = await Promise.all([
        getAll$(statusFilter),
        getSummary$(),
      ]);
      setRows(listRes.data);
      setSummary(summaryRes.data);
    } catch (e: any) {
      console.error("Error toggling intervention:", e);
    } finally {
      setActionDialog({
        isOpen: false,
        id: "",
        name: "",
        action: "delete",
        isHidden: false,
      });
    }
  };

  const clearAllFilters = () => {
    setFilters({
      name: "",
      specialty: "all",
      sortField: null,
      sortDirection: null,
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-normal">Interventions</h1>
        <p className="text-muted-foreground">
          Create and manage clinical interventions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Interventions"
          value={summary.totalInterventions}
          description="All interventions"
          icon={Stethoscope}
          loading={loading}
        />
        <StatsCard
          title="Active Interventions"
          value={summary.activeInterventions}
          description="Currently active"
          icon={Activity}
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Interventions Table</CardTitle>
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
                onClick={() => router.push("/ahp/setup/interventions/0")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Intervention
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rows}
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
                    onClick={() =>
                      router.push(`/ahp/setup/interventions/${row.id}`)
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAction("toggle", row.id)}
                    className={
                      row.hidden ? "text-success" : "text-destructive"
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                    {row.hidden ? "Restore" : "Delete"}
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
              id: "",
              name: "",
              action: "delete",
              isHidden: false,
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "restore" ? "Restore" : "Delete"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "restore"
                ? `Are you sure you want to restore "${actionDialog.name}"? This will make the intervention visible again.`
                : `Are you sure you want to delete "${actionDialog.name}"? This action will hide the intervention.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionDialog.action === "restore"
                  ? "bg-success hover:bg-success/90"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {actionDialog.action === "restore" ? "Restore" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
