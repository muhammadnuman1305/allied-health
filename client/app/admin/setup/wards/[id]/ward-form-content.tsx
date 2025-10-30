"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import {
  getById$,
  create$,
  update$,
  getDefaultDepartmentOptions$,
} from "@/lib/api/admin/wards/_request";
import {
  Ward,
  WardFormData,
  DepartmentOption,
} from "@/lib/api/admin/wards/_model";
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
import { Building2, Plus, Minus, AlertTriangle } from "lucide-react";

// Form validation schema
const wardFormSchema = z.object({
  name: z.string().min(1, "Ward name is required"),
  code: z
    .string()
    .min(1, "Ward code is required")
    .max(10, "Code must be 10 characters or less"),
  location: z.string().min(1, "Location is required"),
  bedCount: z
    .number()
    .min(1, "Bed count must be at least 1")
    .max(1000, "Bed count cannot exceed 1000"),
  description: z.string().optional(),
  defaultDepartment: z.string(),
  notes: z.string().optional(),
});

type WardFormValues = z.infer<typeof wardFormSchema>;

interface WardFormContentProps {
  wardId: string;
  isEdit?: boolean;
  initialWardData?: Ward | null;
}

export default function WardFormContent({
  wardId,
  isEdit = false,
  initialWardData,
}: WardFormContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ward, setWard] = useState<Ward | null>(null);
  const [initialLoading, setInitialLoading] = useState(
    isEdit && wardId !== "0"
  );
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
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<
    DepartmentOption[]
  >([]);
  const [departmentOptionsLoading, setDepartmentOptionsLoading] =
    useState(true);

  // Refs to prevent duplicate API calls in React Strict Mode
  const hasFetchedCoverageRef = useRef(false);
  const hasFetchedWardRef = useRef<string | null>(null);
  const hasFetchedDepartmentsRef = useRef(false);

  const form = useForm<WardFormValues>({
    resolver: zodResolver(wardFormSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "",
      bedCount: 1,
      description: "",
      defaultDepartment: "none",
      notes: "",
    },
  });

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

  // Load ward data for editing
  useEffect(() => {
    if (isEdit && wardId !== "0") {
      // If ward data is passed from parent, use it instead of fetching
      if (initialWardData) {
        setWard(initialWardData);
        // API returns defaultDepartmentId, map it to defaultDepartment
        const defaultDeptId =
          (initialWardData as any).defaultDepartmentId ||
          initialWardData.defaultDepartment ||
          "none";
        form.reset({
          name: initialWardData.name,
          code: initialWardData.code,
          location: initialWardData.location as any,
          bedCount: initialWardData.bedCount,
          description: initialWardData.description || "",
          defaultDepartment: defaultDeptId,
          notes: initialWardData.notes || "",
        });
        // Initialize coverage departments from API response
        const coverageDeptIds =
          (initialWardData as any).departmentCoverages ||
          initialWardData.coverageDepartments ||
          [];
        setSelectedDepartments(coverageDeptIds);
        setInitialLoading(false);
        // Reset the ref so if initialWardData is removed later, we can fetch
        hasFetchedWardRef.current = null;
        return;
      }

      // Prevent duplicate calls for the same wardId
      if (hasFetchedWardRef.current === wardId) {
        return;
      }
      hasFetchedWardRef.current = wardId;

      const fetchWard = async () => {
        try {
          setInitialLoading(true);
          const response = await getById$(wardId);
          const wardData = response.data;
          setWard(wardData);

          // API returns defaultDepartmentId, map it to defaultDepartment
          const defaultDeptId =
            (wardData as any).defaultDepartmentId ||
            wardData.defaultDepartment ||
            "none";

          // Populate form with existing data
          form.reset({
            name: wardData.name,
            code: wardData.code,
            location: wardData.location as any,
            bedCount: wardData.bedCount,
            description: wardData.description || "",
            defaultDepartment: defaultDeptId,
            notes: wardData.notes || "",
          });

          // Initialize coverage departments from API response
          const coverageDeptIds =
            (wardData as any).departmentCoverages ||
            wardData.coverageDepartments ||
            [];
          setSelectedDepartments(coverageDeptIds);
        } catch (error) {
          console.error("Error fetching ward:", error);
          toast({
            title: "Error",
            description: "Failed to load ward data",
            variant: "destructive",
          });
        } finally {
          setInitialLoading(false);
        }
      };

      fetchWard();
    }
  }, [wardId, isEdit, form, initialWardData]);

  // Load department options
  useEffect(() => {
    if (hasFetchedDepartmentsRef.current) {
      return;
    }
    hasFetchedDepartmentsRef.current = true;

    const fetchDepartmentOptions = async () => {
      try {
        setDepartmentOptionsLoading(true);
        const response = await getDefaultDepartmentOptions$();
        setDepartmentOptions(response.data);
      } catch (error) {
        console.error("Error fetching department options:", error);
        toast({
          title: "Error",
          description: "Failed to load department options",
          variant: "destructive",
        });
      } finally {
        setDepartmentOptionsLoading(false);
      }
    };

    fetchDepartmentOptions();
  }, []);

  // Coverage management functions
  const isCoverageActive = (departmentId: string) => {
    // For new wards or when editing, check local selection state first
    if (selectedDepartments.length > 0) {
      return selectedDepartments.includes(departmentId);
    }
    if (wardId === "0") {
      return false;
    }
    // Fallback to coverage matrix if available
    if (!coverageMatrix) return false;
    return coverageMatrix.mappings.some(
      (mapping) =>
        mapping.departmentId === departmentId && mapping.wardId === wardId
    );
  };

  const handleCoverageToggle = async (departmentId: string) => {
    const isActive = isCoverageActive(departmentId);

    if (wardId === "0") {
      // For new wards, just toggle local selection state
      if (isActive) {
        setSelectedDepartments((prev) =>
          prev.filter((id) => id !== departmentId)
        );
      } else {
        setSelectedDepartments((prev) => {
          // Prevent duplicates by checking if departmentId already exists
          if (prev.includes(departmentId)) {
            return prev;
          }
          return [...prev, departmentId];
        });
      }
      return;
    }

    // For existing wards, handle API calls
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

        // Update selectedDepartments to keep in sync
        setSelectedDepartments((prev) =>
          prev.filter((id) => id !== departmentId)
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
                      departmentOptions.find((d) => d.id === departmentId)
                        ?.name || "",
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

        // Update selectedDepartments to keep in sync
        setSelectedDepartments((prev) => {
          if (prev.includes(departmentId)) {
            return prev;
          }
          return [...prev, departmentId];
        });

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

  const onSubmit = async (data: WardFormValues) => {
    try {
      setLoading(true);

      const formData: WardFormData = {
        id: isEdit ? wardId : undefined,
        name: data.name,
        code: data.code,
        location: data.location,
        bedCount: data.bedCount,
        description: data.description,
        defaultDepartment:
          data.defaultDepartment === "none" ? "" : data.defaultDepartment,
        coverageDepartments: Array.from(new Set(selectedDepartments)),
      };

      if (isEdit) {
        await update$(wardId, formData);
        toast({
          title: "Success",
          description: "Ward updated successfully",
        });
      } else {
        await create$(formData);
        toast({
          title: "Success",
          description: "Ward created successfully",
        });
      }

      router.push("/admin/setup/wards");
    } catch (error) {
      console.error("Error saving ward:", error);
      toast({
        title: "Error",
        description: "Failed to save ward. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ward data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ICU Ward" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ICU" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Ground Floor, ICU, Emergency"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bedCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bed Count *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          placeholder="e.g., 20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the ward..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Department Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Department Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="defaultDepartment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select default department (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">
                            No default department
                          </SelectItem>
                          {departmentOptionsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading departments...
                            </SelectItem>
                          ) : (
                            departmentOptions.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Coverage Departments Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Coverage Departments
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {selectedDepartments.length > 0
                        ? selectedDepartments.length
                        : coverageMatrix?.mappings.filter(
                            (m) => m.wardId === wardId
                          ).length || 0}{" "}
                      assigned
                    </Badge>
                  </div>

                  {departmentOptionsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading departments...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {departmentOptions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No departments available
                        </div>
                      ) : (
                        departmentOptions.map((dept) => {
                          const isCovered = isCoverageActive(dept.id);
                          return (
                            <div
                              key={dept.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isCovered
                                  ? "bg-green-50 border-green-200"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="font-medium text-sm">
                                    {dept.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {dept.code} • {dept.purpose}
                                  </div>
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant={isCovered ? "destructive" : "default"}
                                onClick={() => handleCoverageToggle(dept.id)}
                                className="h-8 w-8 p-0"
                              >
                                {isCovered ? (
                                  <Minus className="h-4 w-4" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-start gap-4 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Ward" : "Create Ward"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/setup/wards")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>

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
