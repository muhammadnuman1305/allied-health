// /patients/page.tsx

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
  Users,
  Calendar,
  ClipboardList,
  CheckCircle,
  Settings,
  Edit,
  FileText,
  Trash2,
  RotateCcw,
  Plus,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import {
  getAll$,
  toggleActive$,
  getSummary$,
} from "@/lib/api/admin/patients/_request";
import {
  GENDER_OPTIONS,
  Patient,
  PatientSummary,
  getGenderLabel,
} from "@/lib/api/admin/patients/_model";

// Helper to format patient ID as MRN
const formatMRN = (id: string): string => {
  // Parse the ID as number and format with leading zeros
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return id;
  return `MRN${numId.toString().padStart(5, "0")}`;
};

import { formatRelativeTime } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function AdminPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [summary, setSummary] = useState<PatientSummary>({
    totalPatients: 0,
    newPatients: 0,
    activeTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hiddenFilter, setHiddenFilter] = useState<"All" | "Hidden" | "Active">(
    "All"
  );
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    patientId: string;
    patientName: string;
    action: "delete" | "restore";
    isHidden: boolean;
  }>({
    isOpen: false,
    patientId: "",
    patientName: "",
    action: "delete",
    isHidden: false,
  });
  const [filters, setFilters] = useState<FilterState>({
    mrn: "",
    name: "",
    sortField: null,
    sortDirection: null,
  });

  // Fetch patients and summary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both patients and summary data in parallel
        const [patientsResponse, summaryResponse] = await Promise.all([
          getAll$(hiddenFilter),
          getSummary$(),
        ]);

        setPatients(patientsResponse.data);
        setSummary(summaryResponse.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hiddenFilter]);

  // Define table columns
  const columns: Column<Patient>[] = [
    {
      key: "fullName",
      label: "Name",
      width: "w-[200px]",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (patient) => (
        <button
          onClick={() => router.push(`/admin/patients/${patient.id}`)}
          className="text-primary hover:underline text-left font-medium"
        >
          {patient.fullName}
        </button>
      ),
    },
    {
      key: "mrn",
      label: "MRN",
      width: "w-[140px]",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (patient) => formatMRN(patient.id),
    },
    {
      key: "age",
      label: "Age",
      width: "w-[80px]",
      sortable: true,
      render: (patient) => patient.age,
    },
    {
      key: "gender",
      label: "Gender",
      width: "w-[80px]",
      sortable: true,
      render: (patient) => {
        // Display gender label from numeric value
        return getGenderLabel(patient.gender);
      },
    },
    // {
    //   key: "activeTasks",
    //   label: "Active Tasks",
    //   width: "w-[120px]",
    //   sortable: true,
    //   render: (patient) => patient.activeTasks.toString(),
    // },
    {
      key: "lastUpdated",
      label: "Last Updated",
      width: "w-[140px]",
      sortable: true,
      render: (patient) => (
        <span title={new Date(patient.lastUpdated).toLocaleString()}>
          {formatRelativeTime(patient.lastUpdated)}
        </span>
      ),
    },
  ];

  // Handle patient actions
  const handlePatientAction = (action: string, patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);

    switch (action) {
      case "edit":
        router.push(`/admin/patients/${patientId}`);
        break;
      case "newTask":
        router.push(`/admin/tasks/0?patientId=${patientId}`);
        break;
      case "refer":
        // TODO: Open ReferralModal (select target department + note)
        router.push(`/admin/referrals/0?patientId=${patientId}`);
        break;
      case "delete":
        if (patient) {
          setActionDialog({
            isOpen: true,
            patientId: patientId,
            patientName: patient.fullName,
            action: patient.hidden ? "restore" : "delete",
            isHidden: patient.hidden,
          });
        }
        break;
    }
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    const { patientId } = actionDialog;

    try {
      await toggleActive$(patientId);

      // Refresh the patient list
      const response = await getAll$(hiddenFilter);
      setPatients(response.data);
    } catch (err) {
      setError(
        actionDialog.action === "restore"
          ? "Failed to restore patient. Please try again."
          : "Failed to hide patient. Please try again."
      );
      console.error(
        `Error ${
          actionDialog.action === "restore" ? "restoring" : "hiding"
        } patient:`,
        err
      );
    }

    setActionDialog({
      isOpen: false,
      patientId: "",
      patientName: "",
      action: "delete",
      isHidden: false,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      mrn: "",
      name: "",
      sortField: null,
      sortDirection: null,
    });
    setCurrentPage(1);
  };

  // Check if filters are active
  const hasActiveFilters = filters.mrn || filters.name || filters.sortField;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage patient referrals and interventions
          </p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage patient referrals and interventions
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
        <h1 className="text-3xl font-bold">Patient Management</h1>
        <p className="text-muted-foreground">
          Manage patient referrals and interventions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Patients"
          value={summary.totalPatients}
          description="Registered patients"
          icon={Users}
        />
        <StatsCard
          title="New Patients"
          value={summary.newPatients}
          description="Added today"
          icon={Calendar}
        />
        <StatsCard
          title="Active Tasks"
          value={summary.activeTasks}
          description="In progress"
          icon={ClipboardList}
        />
        <StatsCard
          title="Completed Tasks"
          value={summary.completedTasks}
          description="Successfully completed"
          icon={CheckCircle}
        />
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patients Table</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Select
                value={hiddenFilter}
                onValueChange={(value) =>
                  setHiddenFilter(value as "All" | "Hidden" | "Active")
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
                onClick={() => router.push("/admin/patients/0")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={patients}
            columns={columns}
            filters={filters}
            onFiltersChange={setFilters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            loading={loading}
            getRowClassName={(patient) =>
              patient.hidden ? "opacity-50 bg-muted/30 line-through" : ""
            }
            actions={(patient) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handlePatientAction("edit", patient.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Patient
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePatientAction("newTask", patient.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handlePatientAction("refer", patient.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Create Referral
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handlePatientAction("delete", patient.id)}
                    className={
                      patient.hidden ? "text-green-600" : "text-destructive"
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {patient.hidden ? "Restore Patient" : "Delete Patient"}
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
              patientId: "",
              patientName: "",
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
                ? "Restore Patient"
                : "Delete Patient"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "restore"
                ? `Are you sure you want to restore "${actionDialog.patientName}"? This will make the patient visible again.`
                : `Are you sure you want to delete "${actionDialog.patientName}"? This action will hide the patient.`}
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
                ? "Restore Patient"
                : "Hide Patient"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
