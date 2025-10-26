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
  FileText,
  Calendar,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  Settings,
  Edit,
  Trash2,
  RotateCcw,
  Plus,
  Clock,
  ArrowUp,
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
  TRIAGE_STATUS_DESCRIPTIONS,
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

// Triage status badge variants
const getTriageBadgeVariant = (triageStatus: string) => {
  switch (triageStatus) {
    case "accepted":
      return "default"; // Accepted - green
    case "rejected":
      return "destructive"; // Rejected - red
    case "redirected":
      return "secondary"; // Redirected - blue
    case "pending":
    default:
      return "outline"; // Pending - gray
  }
};

const ITEMS_PER_PAGE = 10;

export default function OutgoingReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    referralId: string;
    patientName: string;
    action: "cancel" | "activate";
  }>({
    isOpen: false,
    referralId: "",
    patientName: "",
    action: "cancel",
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

  // Fetch outgoing referrals data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const referralsResponse = await getAll$();

        // Filter only outgoing referrals (referrals created by current department)
        // For now, we'll show all referrals that are not pending as "outgoing"
        // In real implementation, this would filter by current user's department
        const outgoing = referralsResponse.data.filter(
          (referral) => referral.triageStatus !== "pending"
        );
        setReferrals(outgoing);
      } catch (err) {
        setError("Failed to fetch outgoing referrals. Please try again.");
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
      key: "destinationDepartment",
      label: "To",
      width: "w-[120px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "Physiotherapy", label: "Physiotherapy" },
        { value: "Occupational Therapy", label: "Occupational Therapy" },
        { value: "Speech Therapy", label: "Speech Therapy" },
        { value: "Dietetics", label: "Dietetics" },
        { value: "Podiatry", label: "Podiatry" },
        { value: "Psychology", label: "Psychology" },
        { value: "Social Work", label: "Social Work" },
      ],
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
      key: "triageStatus",
      label: "Triage Status",
      width: "w-[120px]",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { value: "pending", label: "Pending" },
        { value: "accepted", label: "Accepted" },
        { value: "rejected", label: "Rejected" },
        { value: "redirected", label: "Redirected" },
      ],
      render: (referral) => {
        const triageStatus = referral.triageStatus || "pending";
        return (
          <Badge
            variant={getTriageBadgeVariant(triageStatus)}
            title={TRIAGE_STATUS_DESCRIPTIONS[triageStatus]}
          >
            {triageStatus.charAt(0).toUpperCase() + triageStatus.slice(1)}
          </Badge>
        );
      },
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
  ];

  // Handle referral actions
  const handleReferralAction = (action: string, referralId: string) => {
    switch (action) {
      case "view-details":
        router.push(`/admin/referrals/${referralId}`);
        break;
      case "edit":
        router.push(`/admin/referrals/${referralId}`);
        break;
      case "cancel":
      case "activate":
        const referral = referrals.find((r) => r.id === referralId);
        if (referral) {
          setActionDialog({
            isOpen: true,
            referralId: referralId,
            patientName: referral.patientName,
            action: action as "cancel" | "activate",
          });
        }
        break;
    }
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    const { referralId, action } = actionDialog;

    try {
      // Here you would call the appropriate API endpoint
      console.log(`${action} referral ${referralId}`);

      // Update local state to reflect the change
      setReferrals((prev) =>
        prev.map((referral) =>
          referral.id === referralId
            ? { ...referral, status: action === "activate" ? "A" : "X" }
            : referral
        )
      );
    } catch (err) {
      setError(`Failed to ${action} referral. Please try again.`);
      console.error(`Error ${action}ing referral:`, err);
    }

    setActionDialog({
      isOpen: false,
      referralId: "",
      patientName: "",
      action: "cancel",
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
          <h1 className="text-3xl font-bold">Outgoing Referrals</h1>
          <p className="text-muted-foreground">
            Referrals sent to other departments
          </p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading outgoing referrals...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Outgoing Referrals</h1>
          <p className="text-muted-foreground">
            Referrals sent to other departments
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
        <h1 className="text-3xl font-bold">Outgoing Referrals</h1>
        <p className="text-muted-foreground">
          Referrals sent to other departments
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Sent"
          value={referrals.length}
          description="All outgoing referrals"
          icon={ArrowUp}
        />
        <StatsCard
          title="Accepted"
          value={referrals.filter((r) => r.triageStatus === "accepted").length}
          description="Accepted by departments"
          icon={CheckCircle}
          variant="default"
        />
        <StatsCard
          title="Pending"
          value={referrals.filter((r) => r.triageStatus === "pending").length}
          description="Awaiting response"
          icon={Clock}
          variant="secondary"
        />
        <StatsCard
          title="This Week"
          value={
            referrals.filter((r) => {
              const referralDate = new Date(r.referralDate);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return referralDate >= weekAgo;
            }).length
          }
          description="Sent this week"
          icon={Calendar}
          variant="primary"
        />
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5" />
                Outgoing Referrals
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Referrals sent from your department to other departments
              </p>
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
                Create Referral
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
                    onClick={() =>
                      handleReferralAction("view-details", referral.id)
                    }
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleReferralAction("edit", referral.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Referral
                  </DropdownMenuItem>
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
                ? `Are you sure you want to activate the referral for "${actionDialog.patientName}"? This will make the referral active again.`
                : `Are you sure you want to cancel the referral for "${actionDialog.patientName}"? This will mark the referral as cancelled.`}
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
    </div>
  );
}
