"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  ClipboardList,
  CheckCircle,
  Settings,
  Eye,
  ArrowRight,
  Search,
  Filter,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  User,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { getAll$ as getAHAPatients$ } from "@/lib/api/aha/_request";
import { AHAPatient } from "@/lib/api/aha/_model";
import { getSummary$ } from "@/lib/api/admin/patients/_request";
import { PatientSummary } from "@/lib/api/admin/patients/_model";
import { useAuth } from "@/hooks/use-auth";

// Helper to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function MyPatientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<AHAPatient[]>([]);
  const [summary, setSummary] = useState<PatientSummary>({
    totalPatients: 0,
    newPatients: 0,
    activeTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameSearch, setNameSearch] = useState("");
  const [mrnSearch, setMrnSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch patients and summary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [patientsResponse, summaryResponse] = await Promise.all([
          getAHAPatients$("Active", "mine"), // Fetch from AHA API with viewMode="mine"
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

  // Filter and sort patients
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Name search filter
    if (nameSearch) {
      const query = nameSearch.toLowerCase();
      filtered = filtered.filter((p) =>
        p.fullName.toLowerCase().includes(query)
      );
    }

    // MRN search filter
    if (mrnSearch) {
      const query = mrnSearch.toLowerCase();
      filtered = filtered.filter((p) => p.mrn?.toLowerCase().includes(query));
    }

    // Status filter (by task status)
    if (statusFilter === "with-tasks") {
      filtered = filtered.filter((p) => (p.activeTasks ?? 0) > 0);
    } else if (statusFilter === "no-tasks") {
      filtered = filtered.filter((p) => (p.activeTasks ?? 0) === 0);
    }

    // Sort by last activity date (most recent first)
    return filtered.sort((a, b) => {
      if (!a.lastActivityDate && !b.lastActivityDate) return 0;
      if (!a.lastActivityDate) return 1;
      if (!b.lastActivityDate) return -1;
      return (
        new Date(b.lastActivityDate).getTime() -
        new Date(a.lastActivityDate).getTime()
      );
    });
  }, [patients, nameSearch, mrnSearch, statusFilter]);

  // Handle patient actions
  const handlePatientAction = (action: string, patientId: string) => {
    switch (action) {
      case "view":
        router.push(
          `/user/my-patients/${patientId}?returnTo=${encodeURIComponent(
            "/user/my-patients"
          )}`
        );
        break;
      case "tasks":
        router.push(`/user/my-tasks?patientId=${patientId}`);
        break;
    }
  };

  // Get display name for current user
  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Current User";

  // Calculate counts
  const myPatientCounts = useMemo(() => {
    const withTasks = patients.filter((p) => (p.activeTasks ?? 0) > 0).length;
    const recent = patients.filter((p) => {
      if (!p.lastActivityDate) return false;
      const lastUpdate = new Date(p.lastActivityDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastUpdate >= weekAgo;
    }).length;
    const urgent = patients.filter((p) => (p.activeTasks ?? 0) > 3).length;

    return {
      total: patients.length,
      withTasks,
      recent,
      urgent,
    };
  }, [patients]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Patients</h1>
          <p className="text-muted-foreground">
            Patients you are currently working with
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
          <h1 className="text-3xl font-bold">My Patients</h1>
          <p className="text-muted-foreground">
            Patients you are currently working with
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Patients</h1>
        <p className="text-muted-foreground">
          Patients you are currently working with • {displayName}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="My Patients"
          value={myPatientCounts.total}
          description="Total patients"
          icon={Users}
        />
        <StatsCard
          title="Active Tasks"
          value={summary.activeTasks}
          description="Tasks in progress"
          icon={ClipboardList}
        />
        <StatsCard
          title="With Tasks"
          value={myPatientCounts.withTasks}
          description="Need attention"
          icon={AlertCircle}
        />
        <StatsCard
          title="Recent Updates"
          value={myPatientCounts.recent}
          description="This week"
          icon={Clock}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by MRN..."
                  value={mrnSearch}
                  onChange={(e) => setMrnSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="with-tasks">With Active Tasks</SelectItem>
                  <SelectItem value="no-tasks">No Active Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No patients found</p>
              <p className="text-sm text-muted-foreground">
                {nameSearch || mrnSearch || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You don't have any assigned patients yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const hasActiveTasks = (patient.activeTasks ?? 0) > 0;
            const taskCount = patient.activeTasks ?? 0;

            return (
              <Card key={patient.id} className="transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {patient.fullName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {patient.mrn || "—"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePatientAction("view", patient.id);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePatientAction("tasks", patient.id);
                          }}
                        >
                          <ClipboardList className="mr-2 h-4 w-4" />
                          View Tasks
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="font-medium">
                        {patient.age ?? "—"} {patient.age ? "years" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="font-medium">{patient.gender || "—"}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {patient.primaryPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">
                        {patient.primaryPhone}
                      </span>
                    </div>
                  )}

                  {/* Active Tasks Badge */}
                  {hasActiveTasks && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={taskCount > 3 ? "destructive" : "secondary"}
                        className="w-fit"
                      >
                        <ClipboardList className="h-3 w-3 mr-1" />
                        {taskCount} {taskCount === 1 ? "task" : "tasks"}
                      </Badge>
                      {taskCount > 3 && (
                        <span className="text-xs text-muted-foreground">
                          Needs attention
                        </span>
                      )}
                    </div>
                  )}

                  {/* Last Activity Date */}
                  {patient.lastActivityDate && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <Clock className="h-3 w-3" />
                      <span>
                        Updated {formatRelativeTime(patient.lastActivityDate)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
