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
  Users,
  Calendar,
  AlertTriangle,
  Stethoscope,
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
  Patient,
  PatientSummary,
  STATUS_DESCRIPTIONS,
} from "@/lib/api/admin/patients/_model";

// Priority badge variants
const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case "P1":
      return "destructive";
    case "P2":
      return "default";
    case "P3":
      return "secondary";
    default:
      return "outline";
  }
};

// Status badge variants
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "S":
      return "default"; // Success - green
    case "A":
      return "secondary"; // Active - blue
    case "D":
      return "outline"; // Discharged - gray
    case "U":
      return "secondary"; // Unavailable - yellow
    case "X":
      return "destructive"; // Cancelled - red
    default:
      return "outline";
  }
};

const ITEMS_PER_PAGE = 10;

export default function AdminPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [summary, setSummary] = useState<PatientSummary>({
    totalPatients: 0,
    referralsToday: 0,
    priorityBreakdown: { P1: 0, P2: 0, P3: 0 },
    disciplineBreakdown: {
      physiotherapy: 0,
      occupationalTherapy: 0,
      speechTherapy: 0,
      dietetics: 0,
    },
    pendingOutcomes: 0,
    completedReferrals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    patientId: string;
    patientName: string;
    action: "activate" | "cancel";
  }>({
    isOpen: false,
    patientId: "",
    patientName: "",
    action: "cancel",
  });
  const [filters, setFilters] = useState<FilterState>({
    umrn: "",
    name: "",
    ward: "all",
    priority: "all",
    status: "all",
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
          getAll$(),
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
  }, []);

  // Define table columns
  const columns: Column<Patient>[] = [
    {
      key: "umrn",
      label: "UMRN",
      width: "w-[120px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "name",
      label: "Name",
      width: "w-[180px]",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (patient) => `${patient.firstName} ${patient.lastName}`,
    },
    {
      key: "age",
      label: "Age / Gender",
      width: "w-[100px]",
      render: (patient) => `${patient.age} / ${patient.gender}`,
    },
    {
      key: "ward",
      label: "Ward",
      width: "w-[120px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Geriatrics", label: "Geriatrics" },
        { value: "Stroke", label: "Stroke" },
        { value: "Orthopaedic", label: "Orthopaedic" },
        { value: "Cardiology", label: "Cardiology" },
        { value: "Respiratory", label: "Respiratory" },
      ],
    },
    {
      key: "bedNumber",
      label: "Bed No.",
      width: "w-[80px]",
    },
    {
      key: "diagnosis",
      label: "Diagnosis",
      width: "w-[200px]",
      render: (patient) => (
        <div className="truncate max-w-[200px]" title={patient.diagnosis}>
          {patient.diagnosis}
        </div>
      ),
    },
    {
      key: "admissionDate",
      label: "Admission Date",
      width: "w-[120px]",
      sortable: true,
      render: (patient) => new Date(patient.admissionDate).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      width: "w-[100px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "S", label: "Success" },
        { value: "A", label: "Active" },
        { value: "D", label: "Discharged" },
        { value: "U", label: "Unavailable" },
        { value: "X", label: "Cancelled" },
      ],
      render: (patient) => (
        <Badge
          variant={getStatusBadgeVariant(patient.status)}
          title={STATUS_DESCRIPTIONS[patient.status]}
        >
          {patient.status}
        </Badge>
      ),
    },
  ];

  // Handle patient actions
  const handlePatientAction = (action: string, patientId: string) => {
    switch (action) {
      case "edit":
        router.push(`/admin/patients/${patientId}`);
        break;
      case "view-notes":
        console.log(`View notes for patient ${patientId}`);
        // Here you would open a notes dialog or navigate to notes page
        break;
      case "cancel":
      case "activate":
        const patient = patients.find((p) => p.id === patientId);
        if (patient) {
          setActionDialog({
            isOpen: true,
            patientId: patientId,
            patientName: `${patient.firstName} ${patient.lastName}`,
            action: patient.status === "X" ? "activate" : "cancel",
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

      // Update local state to reflect the change
      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === patientId
            ? { ...patient, status: patient.status === "X" ? "A" : "X" }
            : patient
        )
      );
    } catch (err) {
      setError("Failed to update patient status. Please try again.");
      console.error("Error toggling patient status:", err);
    }

    setActionDialog({
      isOpen: false,
      patientId: "",
      patientName: "",
      action: "cancel",
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      umrn: "",
      name: "",
      ward: "all",
      priority: "all",
      status: "all",
      sortField: null,
      sortDirection: null,
    });
    setCurrentPage(1);
  };

  // Check if filters are active
  const hasActiveFilters =
    filters.umrn ||
    filters.name ||
    filters.ward !== "all" ||
    filters.priority !== "all" ||
    filters.status !== "all" ||
    filters.sortField;

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
          description="Active patients"
          icon={Users}
        />
        <StatsCard
          title="New Admissions"
          value={summary.referralsToday}
          description="Today"
          icon={Calendar}
          variant="primary"
        />
        <StatsCard
          title="Active Referrals"
          value={summary.pendingOutcomes}
          description="In progress"
          icon={ClipboardList}
          variant="secondary"
        />
        <StatsCard
          title="Completed"
          value={summary.completedReferrals}
          description="Successful outcomes"
          icon={CheckCircle}
        />
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Patients</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
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
                    onClick={() =>
                      handlePatientAction("view-notes", patient.id)
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Notes
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/admin/referrals/0?patientId=${patient.id}`)
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Referral
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handlePatientAction(
                        patient.status === "X" ? "activate" : "cancel",
                        patient.id
                      )
                    }
                    className={
                      patient.status === "X"
                        ? "text-green-600"
                        : "text-destructive"
                    }
                  >
                    {patient.status === "X" ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Activate Patient
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deactivate Patient
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
              patientId: "",
              patientName: "",
              action: "cancel",
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "activate"
                ? "Activate Patient"
                : "Deactivate Patient"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "activate"
                ? `Are you sure you want to activate "${actionDialog.patientName}"? This will make the patient record active again and available for new referrals.`
                : `Are you sure you want to deactivate "${actionDialog.patientName}"? This will mark the patient as inactive and prevent new referrals.`}
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
                ? "Activate Patient"
                : "Deactivate Patient"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
