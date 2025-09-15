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
import {
  ReferralFormData,
  Referral,
  INTERVENTIONS,
} from "@/lib/api/admin/referrals/_model";
import { Patient } from "@/lib/api/admin/patients/_model";
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
    status: z.enum(["S", "A", "D", "U", "X"], {
      required_error: "Please select a status",
    }),
    notes: z.string().optional(),
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
  const [referral, setReferral] = useState<Referral | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

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
      referringTherapist: "",
      referralDate: new Date().toISOString().split("T")[0],
      priority: "P2",
      interventions: [],
      status: "A",
      notes: "",
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
  const watchedStatus = watch("status");

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
          setValue("status", referralData.status);
          setValue("notes", referralData.notes || "");
          setValue("outcomeNotes", referralData.outcomeNotes || "");
          setValue("completedDate", referralData.completedDate || "");
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
      const payload: ReferralFormData = {
        id: isNewReferral ? null : data.id || referralId,
        patientId: data.patientId,
        referringTherapist: data.referringTherapist,
        referralDate: data.referralDate,
        priority: data.priority,
        interventions: data.interventions,
        status: data.status,
        notes: data.notes,
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
  if (isLoadingReferral || isLoadingPatients) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

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
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {patient.firstName} {patient.lastName} (
                            {patient.umrn})
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

              {/* Patient Details Display */}
              {selectedPatient && (
                <div className="space-y-2">
                  <Label>Patient Details</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">
                      <strong>UMRN:</strong> {selectedPatient.umrn}
                    </p>
                    <p className="text-sm">
                      <strong>Age/Gender:</strong> {selectedPatient.age} /{" "}
                      {selectedPatient.gender}
                    </p>
                    <p className="text-sm">
                      <strong>Ward:</strong> {selectedPatient.ward} - Bed{" "}
                      {selectedPatient.bedNumber}
                    </p>
                    <p className="text-sm">
                      <strong>Diagnosis:</strong> {selectedPatient.diagnosis}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
              {/* Referring Therapist */}
              <div className="space-y-2">
                <Label htmlFor="referringTherapist">
                  Referring Therapist *
                </Label>
                <Input
                  id="referringTherapist"
                  {...register("referringTherapist")}
                  placeholder="Enter therapist name"
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
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P1">P1 - High Priority</SelectItem>
                        <SelectItem value="P2">P2 - Medium Priority</SelectItem>
                        <SelectItem value="P3">P3 - Low Priority</SelectItem>
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

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Active</SelectItem>
                        <SelectItem value="S">Success</SelectItem>
                        <SelectItem value="D">Discharged</SelectItem>
                        <SelectItem value="U">Unavailable</SelectItem>
                        <SelectItem value="X">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Completed Date (only show if status is Success) */}
              {watchedStatus === "S" && (
                <div className="space-y-2">
                  <Label htmlFor="completedDate">Completed Date</Label>
                  <Input
                    id="completedDate"
                    type="date"
                    {...register("completedDate")}
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Enter additional notes"
                  rows={3}
                />
              </div>

              {/* Outcome Notes (only show if status is Success) */}
              {watchedStatus === "S" && (
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label htmlFor="outcomeNotes">Outcome Notes</Label>
                  <Textarea
                    id="outcomeNotes"
                    {...register("outcomeNotes")}
                    placeholder="Enter outcome notes and treatment results"
                    rows={3}
                  />
                </div>
              )}
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
                <Label>Select Interventions *</Label>
                {Object.entries(INTERVENTIONS).map(
                  ([discipline, interventions]) => (
                    <div key={discipline} className="space-y-2">
                      <h4 className="font-medium capitalize">
                        {discipline.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {interventions.map((intervention) => (
                          <div
                            key={intervention}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={intervention}
                              checked={watchedInterventions.includes(
                                intervention
                              )}
                              onCheckedChange={(checked) => {
                                const current = watchedInterventions;
                                if (checked) {
                                  setValue("interventions", [
                                    ...current,
                                    intervention,
                                  ]);
                                } else {
                                  setValue(
                                    "interventions",
                                    current.filter((i) => i !== intervention)
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={intervention} className="text-sm">
                              {intervention}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
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

        {/* Ward-Specific Information */}
        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ward-Specific Information ({selectedPatient.ward})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedPatient.ward === "Geriatrics" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dementiaNotes">Dementia Notes</Label>
                    <Textarea
                      id="dementiaNotes"
                      {...register("dementiaNotes")}
                      placeholder="Enter dementia-related notes"
                      rows={3}
                    />
                  </div>
                )}

                {selectedPatient.ward === "Stroke" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="limbWeakness">Limb Weakness</Label>
                      <Textarea
                        id="limbWeakness"
                        {...register("limbWeakness")}
                        placeholder="Describe limb weakness"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="communicationChallenges">
                        Communication Challenges
                      </Label>
                      <Textarea
                        id="communicationChallenges"
                        {...register("communicationChallenges")}
                        placeholder="Describe communication challenges"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {selectedPatient.ward === "Orthopaedic" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="weightBearingTolerance">
                      Weight Bearing Tolerance
                    </Label>
                    <Textarea
                      id="weightBearingTolerance"
                      {...register("weightBearingTolerance")}
                      placeholder="Describe weight bearing tolerance"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
