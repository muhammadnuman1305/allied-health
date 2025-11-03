"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  ClipboardList,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import { getAll$ as getAHAPatients$ } from "@/lib/api/aha/_request";
import { AHAPatient } from "@/lib/api/aha/_model";
import { getSummary$ } from "@/lib/api/admin/patients/_request";
import { PatientSummary } from "@/lib/api/admin/patients/_model";

// Helper to format date as readable date string
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const ITEMS_PER_PAGE = 10;

export default function AllPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<AHAPatient[]>([]);
  const [summary, setSummary] = useState<PatientSummary>({
    totalPatients: 0,
    newPatients: 0,
    activeTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
          getAHAPatients$("Active"), // Fetch from AHA API - only show active patients
          getSummary$(), // Keep summary from original endpoint
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
  const columns: Column<AHAPatient>[] = [
    {
      key: "fullName",
      label: "Name",
      width: "w-[200px]",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (patient) => (
        <span className="text-left font-medium">{patient.fullName}</span>
      ),
    },
    {
      key: "mrn",
      label: "MRN",
      width: "w-[140px]",
      sortable: true,
      filterable: true,
      filterType: "text",
      render: (patient) => patient.mrn || "—",
    },
    {
      key: "age",
      label: "Age",
      width: "w-[80px]",
      sortable: true,
      render: (patient) => patient.age ?? "—",
    },
    {
      key: "gender",
      label: "Gender",
      width: "w-[100px]",
      sortable: true,
      render: (patient) => patient.gender || "—",
    },
    {
      key: "primaryPhone",
      label: "Phone",
      width: "w-[150px]",
      render: (patient) => patient.primaryPhone || "—",
    },
    {
      key: "activeTasks",
      label: "Active Tasks",
      width: "w-[120px]",
      sortable: true,
      render: (patient) => (patient.activeTasks ?? 0).toString(),
    },
    // {
    //   key: "lastUpdated",
    //   label: "Last Updated",
    //   width: "w-[140px]",
    //   sortable: true,
    //   render: (patient) =>
    //     patient.lastUpdated ? (
    //       <span title={new Date(patient.lastUpdated).toLocaleString()}>
    //         {formatRelativeTime(patient.lastUpdated)}
    //       </span>
    //     ) : (
    //       <span>—</span>
    //     ),
    // },
    {
      key: "lastActivityDate",
      label: "Last Activity Date",
      width: "w-[160px]",
      sortable: true,
      render: (patient) =>
        patient.lastActivityDate ? (
          <span>{formatDate(patient.lastActivityDate)}</span>
        ) : (
          <span>—</span>
        ),
    },
  ];

  // Handle patient actions
  const handlePatientAction = (action: string, patientId: string) => {
    switch (action) {
      case "view":
        router.push(`/user/all-patients/${patientId}`);
        break;
      case "tasks":
        router.push(`/user/my-tasks?patientId=${patientId}`);
        break;
      case "referrals":
        router.push(`/user/my-referrals?patientId=${patientId}`);
        break;
    }
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
            View and manage your assigned patients
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
            View and manage your assigned patients
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
          View and manage your assigned patients
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
            // actions={(patient) => (
            //   <DropdownMenu>
            //     <DropdownMenuTrigger asChild>
            //       <Button variant="ghost" size="sm">
            //         <Settings className="h-4 w-4" />
            //       </Button>
            //     </DropdownMenuTrigger>
            //     <DropdownMenuContent align="end">
            //       <DropdownMenuItem
            //         onClick={() => handlePatientAction("view", patient.id)}
            //       >
            //         <Eye className="mr-2 h-4 w-4" />
            //         View
            //       </DropdownMenuItem>
            //       <DropdownMenuItem
            //         onClick={() => handlePatientAction("tasks", patient.id)}
            //       >
            //         <ClipboardList className="mr-2 h-4 w-4" />
            //         Tasks
            //       </DropdownMenuItem>
            //       <DropdownMenuItem
            //         onClick={() => handlePatientAction("referrals", patient.id)}
            //       >
            //         <ArrowRight className="mr-2 h-4 w-4" />
            //         Referrals
            //       </DropdownMenuItem>
            //     </DropdownMenuContent>
            //   </DropdownMenu>
            // )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
