"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  Settings,
  Edit,
  Plus,
  ArrowLeft,
  Building2,
  User,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { getById$ } from "@/lib/api/admin/wards/_request";
import { Ward, getWardLocationDisplayName } from "@/lib/api/admin/wards/_model";
import {
  getMatrix$,
  addMapping$,
  removeMapping$,
  validateRemoval$,
} from "@/lib/api/admin/coverage/_request";
import {
  CoverageMatrix,
  CoverageValidation,
} from "@/lib/api/admin/coverage/_model";
import { toast } from "@/hooks/use-toast";
import WardFormContent from "./ward-form-content";

export default function WardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const wardId = params.id as string;

  const [ward, setWard] = useState<Ward | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverageMatrix, setCoverageMatrix] = useState<CoverageMatrix | null>(
    null
  );
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [validationDialog, setValidationDialog] = useState<{
    isOpen: boolean;
    departmentId: string;
    wardId: string;
    validation: CoverageValidation | null;
  }>({
    isOpen: false,
    departmentId: "",
    wardId: "",
    validation: null,
  });

  // Ref to prevent duplicate API calls in React Strict Mode
  const hasFetchedCoverageRef = useRef(false);
  const hasFetchedWardRef = useRef<string | null>(null);

  // Load coverage data
  useEffect(() => {
    if (hasFetchedCoverageRef.current) {
      return;
    }
    hasFetchedCoverageRef.current = true;

    const fetchCoverageData = async () => {
      try {
        setCoverageLoading(true);
        const response = await getMatrix$();
        setCoverageMatrix(response.data);
      } catch (error) {
        console.error("Error fetching coverage data:", error);
        toast({
          title: "Error",
          description: "Failed to load coverage data",
          variant: "destructive",
        });
      } finally {
        setCoverageLoading(false);
      }
    };

    fetchCoverageData();
  }, []);

  useEffect(() => {
    if (wardId === "0") {
      // New ward - show form content
      setLoading(false);
      return;
    }

    // Prevent duplicate calls for the same wardId
    if (hasFetchedWardRef.current === wardId) {
      return;
    }
    hasFetchedWardRef.current = wardId;

    const fetchWard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getById$(wardId);
        setWard(response.data);
      } catch (err) {
        setError("Failed to fetch ward details. Please try again.");
        console.error("Error fetching ward:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWard();
  }, [wardId]);

  // Coverage management functions
  const isCoverageActive = (departmentId: string) => {
    if (!coverageMatrix || wardId === "0") return false;
    return coverageMatrix.mappings.some(
      (mapping) =>
        mapping.departmentId === departmentId && mapping.wardId === wardId
    );
  };

  const handleCoverageToggle = async (departmentId: string) => {
    if (wardId === "0") return; // Can't manage coverage for new wards

    const isActive = isCoverageActive(departmentId);

    if (isActive) {
      // Validate removal
      try {
        const validation = await validateRemoval$(departmentId, wardId);

        if (!validation.data.canRemove) {
          setValidationDialog({
            isOpen: true,
            departmentId,
            wardId,
            validation: validation.data,
          });
          return;
        }

        // Remove coverage
        await removeMapping$(departmentId, wardId);

        // Update local state
        setCoverageMatrix((prev) =>
          prev
            ? {
                ...prev,
                mappings: prev.mappings.filter(
                  (mapping) =>
                    !(
                      mapping.departmentId === departmentId &&
                      mapping.wardId === wardId
                    )
                ),
              }
            : null
        );

        toast({
          title: "Success",
          description: "Coverage removed successfully",
        });
      } catch (error) {
        console.error("Error removing coverage:", error);
        toast({
          title: "Error",
          description: "Failed to remove coverage",
          variant: "destructive",
        });
      }
    } else {
      // Add coverage
      try {
        await addMapping$({ departmentId, wardId });

        // Update local state
        setCoverageMatrix((prev) =>
          prev
            ? {
                ...prev,
                mappings: [
                  ...prev.mappings,
                  {
                    id: `${departmentId}-${wardId}`,
                    departmentId,
                    departmentName:
                      coverageMatrix?.departments.find(
                        (d) => d.id === departmentId
                      )?.name || "",
                    wardId,
                    wardName: ward?.name || "",
                    isDefault: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
              }
            : null
        );

        toast({
          title: "Success",
          description: "Coverage added successfully",
        });
      } catch (error) {
        console.error("Error adding coverage:", error);
        toast({
          title: "Error",
          description: "Failed to add coverage",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loading Ward...</h1>
            <p className="text-muted-foreground">
              Please wait while we fetch the details
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading ward details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!ward && wardId !== "0")) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ward Not Found</h1>
            <p className="text-muted-foreground">
              The requested ward could not be found
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Ward not found"}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {wardId === "0" ? "Create New Ward" : ward?.name || ""}
              </h1>
              {wardId !== "0" && ward && (
                <Badge variant="outline" className="text-sm">
                  {ward.code}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {wardId === "0"
                ? "Set up a new hospital ward for patient management"
                : ward?.location && ward?.bedCount
                ? `${getWardLocationDisplayName(ward.location as any)} • ${
                    ward.bedCount
                  } beds`
                : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Only show for existing wards */}
      {wardId !== "0" && ward && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Current Patients"
            value={ward.currentPatients}
            description={`${Math.round(
              (ward.currentPatients / ward.bedCount) * 100
            )}% occupancy`}
            icon={Users}
          />
          <StatsCard
            title="Open Tasks"
            value={ward.openTasks}
            description="Currently assigned"
            icon={ClipboardList}
          />
          <StatsCard
            title="Overdue Tasks"
            value={ward.overdueTasks}
            description="Requiring attention"
            icon={AlertTriangle}
          />
          <StatsCard
            title="Coverage Departments"
            value={ward.coverageDepartments?.length || 0}
            description="Departments covering this ward"
            icon={Building2}
          />
        </div>
      )}

      {/* Main Content */}
      {wardId === "0" ? (
        // New ward - show form directly without tabs
        <WardFormContent wardId={wardId} isEdit={false} />
      ) : (
        // Existing ward - show tabs
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="tasks">Tasks in Ward</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Details Tab - Form Content */}
          <TabsContent value="details" className="space-y-6">
            <WardFormContent
              wardId={wardId}
              isEdit={true}
              initialWardData={ward}
            />
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Ward Patients</h3>
                <p className="text-muted-foreground">
                  Manage patients currently in this ward
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Patient Management Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Patient table will show: Name | MRN | Age | Condition |
                    Assigned Dept | Active Tasks | Last Updated
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Tasks in Ward</h3>
                <p className="text-muted-foreground">
                  Manage tasks assigned to this ward
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Task Management Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Task table will show: Task | Dept | AHA | Priority | Due |
                    Status | Overdue with bulk actions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Ward Settings</h3>
              <p className="text-muted-foreground">
                Manage ward configuration and coverage
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Ward Details
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Default Department
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Coverage Departments
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advanced Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Deactivate Ward
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Merge with Another Ward
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Validation Dialog */}
      <AlertDialog
        open={validationDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setValidationDialog({
              isOpen: false,
              departmentId: "",
              wardId: "",
              validation: null,
            });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cannot Remove Coverage
            </AlertDialogTitle>
            <AlertDialogDescription>
              {validationDialog.validation?.reason ||
                "This coverage cannot be removed due to existing dependencies."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setValidationDialog({
                  isOpen: false,
                  departmentId: "",
                  wardId: "",
                  validation: null,
                });
              }}
            >
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
