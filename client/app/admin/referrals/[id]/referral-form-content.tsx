"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  FileText,
  Calendar,
  Stethoscope,
  Users,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getById$, create$, update$ } from "@/lib/api/admin/referrals/_request";
import { getAll$ as getPatients$ } from "@/lib/api/admin/patients/_request";
import { getAll$ as getDepartments$ } from "@/lib/api/admin/departments/_request";
import {
  getSpecialties$,
  getInterventions$,
} from "@/lib/api/admin/tasks/_request";
import { getUser } from "@/lib/auth-utils";
import { ReferralFormData, Referral } from "@/lib/api/admin/referrals/_model";
import { Patient } from "@/lib/api/admin/patients/_model";
import { Department } from "@/lib/api/admin/departments/_model";
import {
  TaskSpecialty,
  TaskIntervention,
} from "@/lib/api/admin/tasks/_request";
import { toast } from "@/hooks/use-toast";

// Form validation schema for referral data
const createReferralFormSchema = () =>
  z.object({
    id: z.string().nullable().optional(),
    patientId: z.string().min(1, "Patient selection is required"),
    referringTherapist: z
      .string()
      .min(1, "Referring therapist is required")
      .max(100, "Therapist name must be less than 100 characters"),
    referralDate: z.string().min(1, "Referral date is required"),
    priority: z.enum(["P1", "P2", "P3"], {
      required_error: "Please select a priority",
    }),
    interventions: z
      .array(z.string())
      .min(1, "At least one intervention is required"),
    // Department workflow fields
    originDepartment: z.string().min(1, "Origin department is required"),
    destinationDepartment: z
      .string()
      .min(1, "Destination department is required"),
    triageStatus: z
      .enum(["pending", "accepted", "rejected", "redirected"])
      .optional(),
    triageNotes: z.string().optional(),
    triagedBy: z.string().optional(),
    triagedAt: z.string().optional(),
    redirectToDepartment: z.string().optional(),
    // New fields replacing notes
    diagnosis: z.string().optional(),
    goals: z.string().optional(),
    clinicalInstructions: z.string().optional(),
    // Original fields (kept for backward compatibility)
    outcomeNotes: z.string().optional(),
    completedDate: z.string().optional(),
    // Ward-specific fields
    dementiaNotes: z.string().optional(),
    limbWeakness: z.string().optional(),
    communicationChallenges: z.string().optional(),
    weightBearingTolerance: z.string().optional(),
  });

type FormData = z.infer<ReturnType<typeof createReferralFormSchema>>;

export default function ReferralFormContent({
  referralId,
}: {
  referralId: string;
}) {
  const router = useRouter();
  const isNewReferral = referralId === "0";

  // Get patientId from URL params if creating a new referral from patient page
  const searchParams = new URLSearchParams(window.location.search);
  const preSelectedPatientId = searchParams.get("patientId");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReferral, setIsLoadingReferral] = useState(!isNewReferral);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingInterventions, setIsLoadingInterventions] = useState(true);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<TaskSpecialty[]>([]);
  const [interventions, setInterventions] = useState<TaskIntervention[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isOriginDepartmentDisabled, setIsOriginDepartmentDisabled] =
    useState(false);

  // Get current user info
  const user = getUser();
  const userFullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createReferralFormSchema()),
    defaultValues: {
      id: isNewReferral ? null : referralId,
      patientId: preSelectedPatientId || "",
      referringTherapist: userFullName,
      referralDate: new Date().toISOString().split("T")[0],
      priority: "P2",
      interventions: [],
      // Department workflow fields
      originDepartment: user?.departmentId || "",
      destinationDepartment: "",
      triageStatus: "pending",
      triageNotes: "",
      triagedBy: "",
      triagedAt: "",
      redirectToDepartment: "",
      // New fields replacing notes
      diagnosis: "",
      goals: "",
      clinicalInstructions: "",
      // Original fields
      outcomeNotes: "",
      completedDate: "",
      dementiaNotes: "",
      limbWeakness: "",
      communicationChallenges: "",
      weightBearingTolerance: "",
    },
  });

  const watchedPatientId = watch("patientId");
  const watchedInterventions = watch("interventions");

  // Load patients list
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setIsLoadingPatients(true);
        const response = await getPatients$();
        setPatients(response.data);
      } catch (error) {
        console.error("Error loading patients:", error);
        toast({
          title: "Error",
          description: "Failed to load patients list. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPatients(false);
      }
    };

    loadPatients();
  }, []);

  // Load departments list
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const response = await getDepartments$("Active");
        setDepartments(response.data);

        // Pre-select origin department if user has departmentId
        if (user?.departmentId) {
          const departmentExists = response.data.some(
            (dept: Department) => dept.id === user.departmentId
          );
          if (departmentExists) {
            setValue("originDepartment", user.departmentId);
            setIsOriginDepartmentDisabled(true);
          } else {
            setIsOriginDepartmentDisabled(false);
          }
        } else {
          setIsOriginDepartmentDisabled(false);
        }
      } catch (error) {
        console.error("Error loading departments:", error);
        toast({
          title: "Error",
          description: "Failed to load departments list. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [user?.departmentId, setValue]);

  // Load specialties and interventions
  useEffect(() => {
    const loadInterventionsData = async () => {
      try {
        setIsLoadingInterventions(true);
        const [specialtiesResponse, interventionsResponse] = await Promise.all([
          getSpecialties$(),
          getInterventions$(),
        ]);

        const specialtiesData = specialtiesResponse?.data || [];
        const interventionsData = interventionsResponse?.data || [];

        setSpecialties(Array.isArray(specialtiesData) ? specialtiesData : []);
        setInterventions(
          Array.isArray(interventionsData) ? interventionsData : []
        );
      } catch (error) {
        console.error("Error loading interventions:", error);
        toast({
          title: "Error",
          description: "Failed to load interventions. Please try again.",
          variant: "destructive",
        });
        setSpecialties([]);
        setInterventions([]);
      } finally {
        setIsLoadingInterventions(false);
      }
    };

    loadInterventionsData();
  }, []);

  // Load referral data for editing
  useEffect(() => {
    const loadReferral = async () => {
      if (!isNewReferral) {
        try {
          setIsLoadingReferral(true);
          const response = await getById$(referralId);
          const referralData = response.data;
          setReferral(referralData);

          // Populate form with referral data
          setValue("id", referralData.id);
          setValue("patientId", referralData.patientId);
          setValue("referringTherapist", referralData.referringTherapist);
          setValue("referralDate", referralData.referralDate);
          setValue("priority", referralData.priority);
          setValue("interventions", referralData.interventions);
          // Department workflow fields
          setValue("originDepartment", referralData.originDepartment || "");
          setValue(
            "destinationDepartment",
            referralData.destinationDepartment || ""
          );
          setValue("triageStatus", referralData.triageStatus || "pending");
          setValue("triageNotes", referralData.triageNotes || "");
          setValue("triagedBy", referralData.triagedBy || "");
          setValue("triagedAt", referralData.triagedAt || "");
          setValue(
            "redirectToDepartment",
            referralData.redirectToDepartment || ""
          );
          // New fields (check if they exist, otherwise use legacy notes field)
          setValue("diagnosis", referralData.diagnosis || "");
          setValue("goals", (referralData as any).goals || "");
          setValue(
            "clinicalInstructions",
            (referralData as any).clinicalInstructions ||
              referralData.notes ||
              ""
          );
          // Original fields
          setValue("outcomeNotes", referralData.outcomeNotes || "");
          setValue("completedDate", referralData.completedDate || "");

          // Check if origin department should be disabled for existing referral
          if (
            user?.departmentId &&
            referralData.originDepartment === user.departmentId
          ) {
            setIsOriginDepartmentDisabled(true);
          }
          setValue("dementiaNotes", referralData.dementiaNotes || "");
          setValue("limbWeakness", referralData.limbWeakness || "");
          setValue(
            "communicationChallenges",
            referralData.communicationChallenges || ""
          );
          setValue(
            "weightBearingTolerance",
            referralData.weightBearingTolerance || ""
          );
        } catch (error) {
          console.error("Error loading referral:", error);
          toast({
            title: "Error",
            description: "Failed to load referral data. Please try again.",
            variant: "destructive",
          });
          router.push("/admin/referrals");
        } finally {
          setIsLoadingReferral(false);
        }
      }
    };

    loadReferral();
  }, [referralId, isNewReferral, setValue, router]);

  // Update selected patient when patientId changes
  useEffect(() => {
    if (watchedPatientId && patients.length > 0) {
      const patient = patients.find((p) => p.id === watchedPatientId);
      setSelectedPatient(patient || null);
    }
  }, [watchedPatientId, patients]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Prepare payload according to backend model
      // Combine diagnosis, goals, and clinicalInstructions into notes for backend
      const combinedNotes = [
        data.diagnosis && `Diagnosis: ${data.diagnosis}`,
        data.goals && `Goals: ${data.goals}`,
        data.clinicalInstructions &&
          `Clinical Instructions: ${data.clinicalInstructions}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const payload: ReferralFormData = {
        id: isNewReferral ? null : data.id || referralId,
        patientId: data.patientId,
        referringTherapist: data.referringTherapist,
        referralDate: data.referralDate,
        priority: data.priority,
        interventions: data.interventions,
        status: "A", // Default to Active since status field is removed
        // Department workflow fields
        originDepartment: data.originDepartment,
        destinationDepartment: data.destinationDepartment,
        triageStatus: data.triageStatus,
        triageNotes: data.triageNotes,
        triagedBy: data.triagedBy,
        triagedAt: data.triagedAt,
        redirectToDepartment: data.redirectToDepartment,
        // Original fields (combining new fields into notes for backend)
        notes: combinedNotes || undefined,
        outcomeNotes: data.outcomeNotes,
        completedDate: data.completedDate,
        dementiaNotes: data.dementiaNotes,
        limbWeakness: data.limbWeakness,
        communicationChallenges: data.communicationChallenges,
        weightBearingTolerance: data.weightBearingTolerance,
      };

      if (isNewReferral) {
        await create$(payload);
        toast({
          title: "Success",
          description: "Referral created successfully.",
        });
      } else {
        await update$(payload);
        toast({
          title: "Success",
          description: "Referral updated successfully.",
        });
      }

      // Navigate back to referrals list
      router.push("/admin/referrals");
    } catch (error: any) {
      console.error("Error saving referral:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save referral. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching data
  if (
    isLoadingReferral ||
    isLoadingPatients ||
    isLoadingDepartments ||
    isLoadingInterventions
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Group interventions by specialty
  const interventionsBySpecialty = specialties.reduce(
    (acc, specialty) => {
      const specialtyInterventions = interventions.filter(
        (intervention) => intervention.specialtyId === specialty.id
      );
      if (specialtyInterventions.length > 0) {
        acc[specialty.id] = {
          specialty,
          interventions: specialtyInterventions,
        };
      }
      return acc;
    },
    {} as Record<
      string,
      {
        specialty: TaskSpecialty;
        interventions: TaskIntervention[];
      }
    >
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isNewReferral ? "Add New Referral" : "Edit Referral"}
          </h1>
          <p className="text-muted-foreground">
            {isNewReferral
              ? "Create a new referral for a patient"
              : "Update referral details and status"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Referral Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Referral Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient *</Label>
                <Controller
                  name="patientId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.patientId && (
                  <p className="text-sm text-destructive">
                    {errors.patientId.message}
                  </p>
                )}
              </div>

              {/* Origin Department */}
              <div className="space-y-2">
                <Label htmlFor="originDepartment">Origin Department *</Label>
                <Controller
                  name="originDepartment"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isOriginDepartmentDisabled}
                    >
                      <SelectTrigger disabled={isOriginDepartmentDisabled}>
                        <SelectValue placeholder="Select origin department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.originDepartment && (
                  <p className="text-sm text-destructive">
                    {errors.originDepartment.message}
                  </p>
                )}
              </div>

              {/* Destination Department */}
              <div className="space-y-2">
                <Label htmlFor="destinationDepartment">
                  Destination Department *
                </Label>
                <Controller
                  name="destinationDepartment"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.destinationDepartment && (
                  <p className="text-sm text-destructive">
                    {errors.destinationDepartment.message}
                  </p>
                )}
              </div>
              {/* Referring Therapist */}
              <div className="space-y-2">
                <Label htmlFor="referringTherapist">
                  Referring Therapist *
                </Label>
                <Input
                  id="referringTherapist"
                  {...register("referringTherapist")}
                  placeholder="Enter therapist name"
                  disabled
                />
                {errors.referringTherapist && (
                  <p className="text-sm text-destructive">
                    {errors.referringTherapist.message}
                  </p>
                )}
              </div>

              {/* Referral Date */}
              <div className="space-y-2">
                <Label htmlFor="referralDate">Referral Date *</Label>
                <Input
                  id="referralDate"
                  type="date"
                  {...register("referralDate")}
                />
                {errors.referralDate && (
                  <p className="text-sm text-destructive">
                    {errors.referralDate.message}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P1">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">High</Badge>
                            <span className="text-xs text-muted-foreground">
                              - Urgent, immediate attention
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="P2">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Medium</Badge>
                            <span className="text-xs text-muted-foreground">
                              - Standard priority
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="P3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Low</Badge>
                            <span className="text-xs text-muted-foreground">
                              - Non-urgent, can be scheduled
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.priority && (
                  <p className="text-sm text-destructive">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              {/* Diagnosis */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  {...register("diagnosis")}
                  placeholder="Enter patient diagnosis"
                  rows={3}
                />
              </div>

              {/* Goals */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="goals">Goals</Label>
                <Textarea
                  id="goals"
                  {...register("goals")}
                  placeholder="Enter treatment goals"
                  rows={3}
                />
              </div>

              {/* Clinical Instructions / Description */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="clinicalInstructions">
                  Clinical Instructions / Description
                </Label>
                <Textarea
                  id="clinicalInstructions"
                  {...register("clinicalInstructions")}
                  placeholder="Enter clinical instructions and description"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interventions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Intervention Selection */}
              <div className="space-y-4">
                {!isLoadingInterventions ? (
                  Object.keys(interventionsBySpecialty).length > 0 ? (
                    Object.values(interventionsBySpecialty).map(
                      ({
                        specialty,
                        interventions: specialtyInterventions,
                      }) => (
                        <div key={specialty.id} className="space-y-2">
                          <h4 className="font-medium">{specialty.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {specialtyInterventions.map((intervention) => (
                              <div
                                key={intervention.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={intervention.id}
                                  checked={watchedInterventions.includes(
                                    intervention.id
                                  )}
                                  onCheckedChange={(checked) => {
                                    const current = watchedInterventions;
                                    if (checked) {
                                      setValue("interventions", [
                                        ...current,
                                        intervention.id,
                                      ]);
                                    } else {
                                      setValue(
                                        "interventions",
                                        current.filter(
                                          (i) => i !== intervention.id
                                        )
                                      );
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={intervention.id}
                                  className="text-sm"
                                >
                                  {intervention.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No interventions available
                    </div>
                  )
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading interventions...
                  </div>
                )}
                {errors.interventions && (
                  <p className="text-sm text-destructive">
                    {errors.interventions.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isNewReferral ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isNewReferral ? "Create Referral" : "Update Referral"}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/referrals")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
