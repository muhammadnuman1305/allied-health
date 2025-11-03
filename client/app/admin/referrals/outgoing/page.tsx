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

  // Fetch outgoing referrals data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const referralsResponse = await getAll$("outgoing");
        setReferrals(referralsResponse.data);
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
      case "complete":
        const completeReferral = referrals.find((r) => r.id === referralId);
        if (completeReferral) {
          setCompleteDialog({
            isOpen: true,
            referralId: referralId,
            patientName: completeReferral.patientName,
            outcomeNotes: "",
          });
        }
        break;
      case "cancel":
      case "activate":
        const actionReferral = referrals.find((r) => r.id === referralId);
        if (actionReferral) {
          setActionDialog({
            isOpen: true,
            referralId: referralId,
            patientName: actionReferral.patientName,
            action: action as "cancel" | "activate",
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
      await toggleActive$(referralId);

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
                    onClick={() => handleReferralAction("edit", referral.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleReferralAction("delete", referral.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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
