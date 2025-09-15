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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Calendar,
  AlertTriangle,
  Stethoscope,
  ClipboardList,
  CheckCircle,
  Settings,
  Edit,
  Trash2,
  RotateCcw,
  Plus,
  Clock,
  Users,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable, Column, FilterState } from "@/components/ui/data-table";
import {
  getAll$,
  toggleActive$,
  getSummary$,
  completeReferral$,
} from "@/lib/api/admin/referrals/_request";
import {
  Referral,
  ReferralSummary,
  STATUS_DESCRIPTIONS,
} from "@/lib/api/admin/referrals/_model";

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

export default function AdminReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [summary, setSummary] = useState<ReferralSummary>({
    totalReferrals: 0,
    referralsToday: 0,
    priorityBreakdown: { P1: 0, P2: 0, P3: 0 },
    disciplineBreakdown: {
      physiotherapy: 0,
      occupationalTherapy: 0,
      speechTherapy: 0,
      dietetics: 0,
    },
    statusBreakdown: {
      active: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
    },
    pendingOutcomes: 0,
    completedReferrals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    referralId: string;
    patientName: string;
    action: "activate" | "cancel";
  }>({
    isOpen: false,
    referralId: "",
    patientName: "",
    action: "cancel",
  });
  const [completeDialog, setCompleteDialog] = useState<{
    isOpen: boolean;
    referralId: string;
    patientName: string;
    outcomeNotes: string;
  }>({
    isOpen: false,
    referralId: "",
    patientName: "",
    outcomeNotes: "",
  });
  const [filters, setFilters] = useState<FilterState>({
    patientUmrn: "",
    patientName: "",
    ward: "all",
    priority: "all",
    status: "all",
    sortField: null,
    sortDirection: null,
  });

  // Fetch referrals and summary data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both referrals and summary data in parallel
        const [referralsResponse, summaryResponse] = await Promise.all([
          getAll$(),
          getSummary$(),
        ]);

        setReferrals(referralsResponse.data);
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
  const columns: Column<Referral>[] = [
    {
      key: "patientUmrn",
      label: "Patient UMRN",
      width: "w-[120px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "patientName",
      label: "Patient Name",
      width: "w-[180px]",
      sortable: true,
      filterable: true,
      filterType: "text",
    },
    {
      key: "age",
      label: "Age / Gender",
      width: "w-[100px]",
      render: (referral) =>
        `${referral.patientAge} / ${referral.patientGender}`,
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
      render: (referral) => (
        <div className="truncate max-w-[200px]" title={referral.diagnosis}>
          {referral.diagnosis}
        </div>
      ),
    },
    {
      key: "referringTherapist",
      label: "Therapist",
      width: "w-[150px]",
    },
    {
      key: "referralDate",
      label: "Referral Date",
      width: "w-[120px]",
      sortable: true,
      render: (referral) =>
        new Date(referral.referralDate).toLocaleDateString(),
    },
    {
      key: "priority",
      label: "Priority",
      width: "w-[80px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "P1", label: "P1" },
        { value: "P2", label: "P2" },
        { value: "P3", label: "P3" },
      ],
      render: (referral) => (
        <Badge variant={getPriorityBadgeVariant(referral.priority)}>
          {referral.priority}
        </Badge>
      ),
    },
    {
      key: "interventions",
      label: "Interventions",
      width: "w-[200px]",
      render: (referral) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {referral.interventions.slice(0, 2).map((intervention, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {intervention}
            </Badge>
          ))}
          {referral.interventions.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{referral.interventions.length - 2}
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
        { value: "S", label: "Success" },
        { value: "A", label: "Active" },
        { value: "D", label: "Discharged" },
        { value: "U", label: "Unavailable" },
        { value: "X", label: "Cancelled" },
      ],
      render: (referral) => (
        <Badge
          variant={getStatusBadgeVariant(referral.status)}
          title={STATUS_DESCRIPTIONS[referral.status]}
        >
          {referral.status}
        </Badge>
      ),
    },
  ];

  // Handle referral actions
  const handleReferralAction = (action: string, referralId: string) => {
    switch (action) {
      case "edit":
        router.push(`/admin/referrals/${referralId}`);
        break;
      case "view-notes":
        console.log(`View notes for referral ${referralId}`);
        // Here you would open a notes dialog or navigate to notes page
        break;
      case "complete":
        const referral = referrals.find((r) => r.id === referralId);
        if (referral) {
          setCompleteDialog({
            isOpen: true,
            referralId: referralId,
            patientName: referral.patientName,
            outcomeNotes: "",
          });
        }
        break;
      case "cancel":
      case "activate":
        const ref = referrals.find((r) => r.id === referralId);
        if (ref) {
          setActionDialog({
            isOpen: true,
            referralId: referralId,
            patientName: ref.patientName,
            action: ref.status === "X" ? "activate" : "cancel",
          });
        }
        break;
    }
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    const { referralId } = actionDialog;

    try {
      await toggleActive$(referralId);

      // Update local state to reflect the change
      setReferrals((prev) =>
        prev.map((referral) =>
          referral.id === referralId
            ? { ...referral, status: referral.status === "X" ? "A" : "X" }
            : referral
        )
      );
    } catch (err) {
      setError("Failed to update referral status. Please try again.");
      console.error("Error toggling referral status:", err);
    }

    setActionDialog({
      isOpen: false,
      referralId: "",
      patientName: "",
      action: "cancel",
    });
  };

  // Handle complete referral
  const handleCompleteReferral = async () => {
    const { referralId, outcomeNotes } = completeDialog;

    try {
      await completeReferral$(referralId, outcomeNotes);

      // Update local state to reflect the change
      setReferrals((prev) =>
        prev.map((referral) =>
          referral.id === referralId
            ? {
                ...referral,
                status: "S",
                outcomeNotes: outcomeNotes,
                completedDate: new Date().toISOString().split("T")[0],
              }
            : referral
        )
      );
    } catch (err) {
      setError("Failed to complete referral. Please try again.");
      console.error("Error completing referral:", err);
    }

    setCompleteDialog({
      isOpen: false,
      referralId: "",
      patientName: "",
      outcomeNotes: "",
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      patientUmrn: "",
      patientName: "",
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
    filters.patientUmrn ||
    filters.patientName ||
    filters.ward !== "all" ||
    filters.priority !== "all" ||
    filters.status !== "all" ||
    filters.sortField;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Referral Management</h1>
          <p className="text-muted-foreground">
            Manage patient referrals and track progress
          </p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading referrals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Referral Management</h1>
          <p className="text-muted-foreground">
            Manage patient referrals and track progress
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
        <h1 className="text-3xl font-bold">Referral Management</h1>
        <p className="text-muted-foreground">
          Manage patient referrals and track progress
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Referrals"
          value={summary.totalReferrals}
          description="All referrals"
          icon={FileText}
        />
        <StatsCard
          title="Referrals Today"
          value={summary.referralsToday}
          description="New referrals"
          icon={Calendar}
          variant="primary"
        />
        <StatsCard
          title="Priority P1"
          value={summary.priorityBreakdown.P1}
          description="High priority"
          icon={AlertTriangle}
          variant="destructive"
        />
        <StatsCard
          title="Active Referrals"
          value={summary.statusBreakdown.active}
          description="In progress"
          icon={Clock}
          variant="secondary"
        />
        <StatsCard
          title="Pending Outcomes"
          value={summary.pendingOutcomes}
          description="Awaiting completion"
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

      {/* Discipline Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Physiotherapy"
          value={summary.disciplineBreakdown.physiotherapy}
          description="Active referrals"
          icon={Stethoscope}
        />
        <StatsCard
          title="Occupational Therapy"
          value={summary.disciplineBreakdown.occupationalTherapy}
          description="Active referrals"
          icon={Stethoscope}
        />
        <StatsCard
          title="Speech Therapy"
          value={summary.disciplineBreakdown.speechTherapy}
          description="Active referrals"
          icon={Stethoscope}
        />
        <StatsCard
          title="Dietetics"
          value={summary.disciplineBreakdown.dietetics}
          description="Active referrals"
          icon={Stethoscope}
        />
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Referrals</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Button
                onClick={() => router.push("/admin/referrals/0")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Referral
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={referrals}
            columns={columns}
            filters={filters}
            onFiltersChange={setFilters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            loading={loading}
            actions={(referral) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleReferralAction("edit", referral.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Referral
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleReferralAction("view-notes", referral.id)
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Notes
                  </DropdownMenuItem>
                  {referral.status === "A" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleReferralAction("complete", referral.id)
                        }
                        className="text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Referral
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      handleReferralAction(
                        referral.status === "X" ? "activate" : "cancel",
                        referral.id
                      )
                    }
                    className={
                      referral.status === "X"
                        ? "text-green-600"
                        : "text-destructive"
                    }
                  >
                    {referral.status === "X" ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Activate Referral
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancel Referral
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
              referralId: "",
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
                ? "Activate Referral"
                : "Cancel Referral"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "activate"
                ? `Are you sure you want to activate the referral for "${actionDialog.patientName}"? This will make the referral active again and available for treatment.`
                : `Are you sure you want to cancel the referral for "${actionDialog.patientName}"? This will mark the referral as cancelled and it will no longer be available for treatment.`}
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
                ? "Activate Referral"
                : "Cancel Referral"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Referral Dialog */}
      <Dialog
        open={completeDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteDialog({
              isOpen: false,
              referralId: "",
              patientName: "",
              outcomeNotes: "",
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Referral</DialogTitle>
            <DialogDescription>
              Complete the referral for "{completeDialog.patientName}" and add
              outcome notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outcomeNotes">Outcome Notes *</Label>
              <Textarea
                id="outcomeNotes"
                placeholder="Enter outcome notes and treatment results..."
                value={completeDialog.outcomeNotes}
                onChange={(e) =>
                  setCompleteDialog((prev) => ({
                    ...prev,
                    outcomeNotes: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setCompleteDialog({
                  isOpen: false,
                  referralId: "",
                  patientName: "",
                  outcomeNotes: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteReferral}
              disabled={!completeDialog.outcomeNotes.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



