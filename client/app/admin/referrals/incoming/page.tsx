"use client";

import { useState, useEffect, useMemo } from "react";
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
  ArrowDown,
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
import { toast } from "@/hooks/use-toast";
import { formatTableDate } from "@/lib/utils";

// Priority badge variants (using High/Medium/Low like rest of app)
const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case "High":
      return "destructive";
    case "Medium":
      return "default";
    case "Low":
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

export default function IncomingReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    referralId: string;
    patientName: string;
    action: "accept" | "reject" | "redirect";
  }>({
    isOpen: false,
    referralId: "",
    patientName: "",
    action: "accept",
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    referralId: string;
    patientName: string;
  }>({
    isOpen: false,
    referralId: "",
    patientName: "",
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

  // Fetch incoming referrals data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const referralsResponse = await getAll$("incoming");
        setReferrals(referralsResponse.data);
      } catch (err) {
        setError("Failed to fetch incoming referrals. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Define table columns
  const columns: Column<Referral>[] = useMemo(
    () => [
      {
        key: "patient",
        label: "Patient",
        width: "w-[180px]",
        sortable: true,
        render: (referral) => (
          <button
            onClick={() => router.push(`/admin/patients/${referral.patientId}`)}
            className="text-primary hover:underline text-left font-medium"
          >
            {referral.patientName}
          </button>
        ),
      },
      {
        key: "originDeptName",
        label: "Origin",
        width: "w-[150px]",
        sortable: true,
        render: (referral) => (
          <button
            onClick={() =>
              router.push(`/admin/setup/departments/${referral.originDeptId}`)
            }
            className="text-primary hover:underline text-left"
          >
            {referral.originDeptName}
          </button>
        ),
      },
      {
        key: "destinationDeptName",
        label: "Destination",
        width: "w-[150px]",
        sortable: true,
        render: (referral) => (
          <button
            onClick={() =>
              router.push(
                `/admin/setup/departments/${referral.destinationDeptId}`
              )
            }
            className="text-primary hover:underline text-left"
          >
            {referral.destinationDeptName}
          </button>
        ),
      },
      {
        key: "therapistName",
        label: "Therapist",
        width: "w-[150px]",
        sortable: true,
        render: (referral) =>
          referral.therapistId && referral.therapistName ? (
            <button
              onClick={() =>
                router.push(`/admin/users/${referral.therapistId}`)
              }
              className="text-primary hover:underline text-left"
            >
              {referral.therapistName}
            </button>
          ) : (
            "—"
          ),
      },
      {
        key: "priority",
        label: "Priority",
        width: "w-[100px]",
        sortable: true,
        render: (referral) => (
          <Badge variant={getPriorityBadgeVariant(referral.priorityDisplay)}>
            {referral.priorityDisplay}
          </Badge>
        ),
      },
      {
        key: "referralDate",
        label: "Referral Date",
        width: "w-[120px]",
        sortable: true,
        render: (referral) => formatTableDate(referral.referralDate),
      },
    ],
    [router]
  );

  // Handle referral actions
  const handleReferralAction = (action: string, referralId: string) => {
    switch (action) {
      case "edit":
        router.push(`/admin/referrals/${referralId}`);
        break;
      case "delete":
        const referralToDelete = referrals.find((r) => r.id === referralId);
        if (referralToDelete) {
          setDeleteDialog({
            isOpen: true,
            referralId: referralId,
            patientName: referralToDelete.patientName,
          });
        }
        break;
      case "accept":
      case "reject":
      case "redirect":
        const referral = referrals.find((r) => r.id === referralId);
        if (referral) {
          setActionDialog({
            isOpen: true,
            referralId: referralId,
            patientName: referral.patientName,
            action: action as "accept" | "reject" | "redirect",
          });
        }
        break;
    }
  };

  // Handle delete referral
  const handleDeleteReferral = async (referralId: string) => {
    try {
      await toggleActive$(referralId);
      // Update local state - remove the referral
      setReferrals((prev) =>
        prev.filter((referral) => referral.id !== referralId)
      );
      toast({
        title: "Success",
        description: "Referral deleted successfully.",
      });
    } catch (err) {
      setError("Failed to delete referral. Please try again.");
      console.error("Error deleting referral:", err);
    }
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    const { referralId, action } = actionDialog;

    try {
      if (action === "accept") {
        // Navigate to task creation form with refId parameter
        router.push(`/admin/tasks/0?refId=${referralId}`);
      } else {
        // For reject/redirect, call API endpoint
        // Here you would call the appropriate API endpoint for reject/redirect
        console.log(`${action} referral ${referralId}`);
        // Update local state to reflect the change
        setReferrals((prev) =>
          prev.filter((referral) => referral.id !== referralId)
        );
      }
    } catch (err) {
      setError(`Failed to ${action} referral. Please try again.`);
      console.error(`Error ${action}ing referral:`, err);
    }

    setActionDialog({
      isOpen: false,
      referralId: "",
      patientName: "",
      action: "accept",
    });
  };

  // Handle confirmed delete
  const handleConfirmedDelete = async () => {
    const { referralId } = deleteDialog;
    await handleDeleteReferral(referralId);
    setDeleteDialog({
      isOpen: false,
      referralId: "",
      patientName: "",
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
          <h1 className="text-3xl font-bold">Incoming Referrals</h1>
          <p className="text-muted-foreground">
            Referrals awaiting triage decisions
          </p>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading incoming referrals...
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
          <h1 className="text-3xl font-bold">Incoming Referrals</h1>
          <p className="text-muted-foreground">
            Referrals awaiting triage decisions
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
        <h1 className="text-3xl font-bold">Incoming Referrals</h1>
        <p className="text-muted-foreground">
          Referrals awaiting triage decisions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Triage"
          value={referrals.length}
          description="Awaiting triage"
          icon={ClipboardList}
        />
        <StatsCard
          title="High Priority"
          value={referrals.filter((r) => r.priorityDisplay === "High").length}
          description="High priority referrals"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Today"
          value={
            referrals.filter(
              (r) =>
                new Date(r.referralDate).toDateString() ===
                new Date().toDateString()
            ).length
          }
          description="Received today"
          icon={Calendar}
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
          description="Received this week"
          icon={Clock}
        />
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowDown className="h-5 w-5" />
                Incoming Referrals
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Referrals sent to your department that require triage
              </p>
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
                    onClick={() => handleReferralAction("accept", referral.id)}
                    className="text-green-600"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept Referral
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleReferralAction("reject", referral.id)}
                    className="text-destructive"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reject Referral
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleReferralAction("redirect", referral.id)
                    }
                    disabled
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Redirect Referral
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
              action: "accept",
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "accept"
                ? "Accept Referral"
                : actionDialog.action === "reject"
                ? "Reject Referral"
                : "Redirect Referral"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "accept"
                ? `Are you sure you want to accept the referral for "${actionDialog.patientName}"? This will make the referral active and available for treatment.`
                : actionDialog.action === "reject"
                ? `Are you sure you want to reject the referral for "${actionDialog.patientName}"? This will decline the referral and notify the origin department.`
                : `Are you sure you want to redirect the referral for "${actionDialog.patientName}"? This will send the referral to a different department.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedAction}
              className={
                actionDialog.action === "accept"
                  ? "bg-green-600 hover:bg-green-700"
                  : actionDialog.action === "reject"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {actionDialog.action === "accept"
                ? "Accept Referral"
                : actionDialog.action === "reject"
                ? "Reject Referral"
                : "Redirect Referral"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({
              isOpen: false,
              referralId: "",
              patientName: "",
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Referral</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the referral for "
              {deleteDialog.patientName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Referral
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
