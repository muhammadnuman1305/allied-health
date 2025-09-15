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
  User,
  Users,
  Calendar,
  Stethoscope,
  FileText,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getById$, create$, update$ } from "@/lib/api/admin/patients/_request";
import {
  PatientFormData,
  Patient,
  INTERVENTIONS,
  WARDS,
} from "@/lib/api/admin/patients/_model";
import { toast } from "@/hooks/use-toast";

// Form validation schema for patient data
const createPatientFormSchema = () =>
  z.object({
    id: z.string().nullable().optional(),
    umrn: z
      .string()
      .min(1, "UMRN is required")
      .max(20, "UMRN must be less than 20 characters"),
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    age: z
      .number()
      .min(1, "Age must be at least 1")
      .max(150, "Age must be less than 150"),
    gender: z.enum(["M", "F", "Other"], {
      required_error: "Please select a gender",
    }),
    ward: z.string().min(1, "Ward is required"),
    bedNumber: z
      .string()
      .min(1, "Bed number is required")
      .max(10, "Bed number must be less than 10 characters"),
    admissionDate: z.string().min(1, "Admission date is required"),
    diagnosis: z
      .string()
      .min(1, "Diagnosis is required")
      .max(500, "Diagnosis must be less than 500 characters"),
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
    // Ward-specific fields
    dementiaNotes: z.string().optional(),
    limbWeakness: z.string().optional(),
    communicationChallenges: z.string().optional(),
    weightBearingTolerance: z.string().optional(),
  });

type FormData = z.infer<ReturnType<typeof createPatientFormSchema>>;

export default function PatientFormContent({
  patientId,
}: {
  patientId: string;
}) {
  const router = useRouter();
  const isNewPatient = patientId === "0";

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(!isNewPatient);
  const [patient, setPatient] = useState<Patient | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createPatientFormSchema()),
    defaultValues: {
      id: isNewPatient ? null : patientId,
      umrn: "",
      firstName: "",
      lastName: "",
      age: 0,
      gender: "M",
      ward: "",
      bedNumber: "",
      admissionDate: "",
      diagnosis: "",
      referringTherapist: "",
      referralDate: new Date().toISOString().split("T")[0],
      priority: "P2",
      interventions: [],
      status: "A",
      notes: "",
      dementiaNotes: "",
      limbWeakness: "",
      communicationChallenges: "",
      weightBearingTolerance: "",
    },
  });

  const watchedWard = watch("ward");
  const watchedInterventions = watch("interventions");

  // Load patient data for editing
  useEffect(() => {
    const loadPatient = async () => {
      if (!isNewPatient) {
        try {
          setIsLoadingPatient(true);
          const response = await getById$(patientId);
          const patientData = response.data;
          setPatient(patientData);

          // Populate form with patient data
          setValue("id", patientData.id);
          setValue("umrn", patientData.umrn);
          setValue("firstName", patientData.firstName);
          setValue("lastName", patientData.lastName);
          setValue("age", patientData.age);
          setValue("gender", patientData.gender);
          setValue("ward", patientData.ward);
          setValue("bedNumber", patientData.bedNumber);
          setValue("admissionDate", patientData.admissionDate);
          setValue("diagnosis", patientData.diagnosis);
          setValue("referringTherapist", patientData.referringTherapist);
          setValue("referralDate", patientData.referralDate);
          setValue("priority", patientData.priority);
          setValue("interventions", patientData.interventions);
          setValue("status", patientData.status);
          setValue("notes", patientData.notes || "");
          setValue("dementiaNotes", patientData.dementiaNotes || "");
          setValue("limbWeakness", patientData.limbWeakness || "");
          setValue(
            "communicationChallenges",
            patientData.communicationChallenges || ""
          );
          setValue(
            "weightBearingTolerance",
            patientData.weightBearingTolerance || ""
          );
        } catch (error) {
          console.error("Error loading patient:", error);
          toast({
            title: "Error",
            description: "Failed to load patient data. Please try again.",
            variant: "destructive",
          });
          router.push("/admin/patients");
        } finally {
          setIsLoadingPatient(false);
        }
      }
    };

    loadPatient();
  }, [patientId, isNewPatient, setValue, router]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Prepare payload according to backend model
      const payload: PatientFormData = {
        id: isNewPatient ? null : data.id || patientId,
        umrn: data.umrn,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
        ward: data.ward,
        bedNumber: data.bedNumber,
        admissionDate: data.admissionDate,
        diagnosis: data.diagnosis,
        referringTherapist: data.referringTherapist,
        referralDate: data.referralDate,
        priority: data.priority,
        interventions: data.interventions,
        status: data.status,
        notes: data.notes,
        dementiaNotes: data.dementiaNotes,
        limbWeakness: data.limbWeakness,
        communicationChallenges: data.communicationChallenges,
        weightBearingTolerance: data.weightBearingTolerance,
      };

      if (isNewPatient) {
        await create$(payload);
        toast({
          title: "Success",
          description: "Patient created successfully.",
        });
      } else {
        await update$(payload);
        toast({
          title: "Success",
          description: "Patient updated successfully.",
        });
      }

      // Navigate back to patients list
      router.push("/admin/patients");
    } catch (error: any) {
      console.error("Error saving patient:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to save patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching patient data
  if (isLoadingPatient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading patient data...</span>
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
            {isNewPatient ? "Add New Patient" : "Edit Patient"}
          </h1>
          <p className="text-muted-foreground">
            {isNewPatient
              ? "Create a new patient record and referral"
              : "Update patient information and referral details"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* UMRN */}
              <div className="space-y-2">
                <Label htmlFor="umrn">UMRN *</Label>
                <Input
                  id="umrn"
                  {...register("umrn")}
                  placeholder="Enter UMRN"
                />
                {errors.umrn && (
                  <p className="text-sm text-destructive">
                    {errors.umrn.message}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  {...register("age", { valueAsNumber: true })}
                  placeholder="Enter age"
                />
                {errors.age && (
                  <p className="text-sm text-destructive">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-sm text-destructive">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* Ward */}
              <div className="space-y-2">
                <Label htmlFor="ward">Ward *</Label>
                <Controller
                  name="ward"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {WARDS.map((ward) => (
                          <SelectItem key={ward} value={ward}>
                            {ward}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.ward && (
                  <p className="text-sm text-destructive">
                    {errors.ward.message}
                  </p>
                )}
              </div>

              {/* Bed Number */}
              <div className="space-y-2">
                <Label htmlFor="bedNumber">Bed Number *</Label>
                <Input
                  id="bedNumber"
                  {...register("bedNumber")}
                  placeholder="Enter bed number"
                />
                {errors.bedNumber && (
                  <p className="text-sm text-destructive">
                    {errors.bedNumber.message}
                  </p>
                )}
              </div>

              {/* Admission Date */}
              <div className="space-y-2">
                <Label htmlFor="admissionDate">Admission Date *</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  {...register("admissionDate")}
                />
                {errors.admissionDate && (
                  <p className="text-sm text-destructive">
                    {errors.admissionDate.message}
                  </p>
                )}
              </div>

              {/* Diagnosis */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="diagnosis">
                  Diagnosis / Admission Reason *
                </Label>
                <Textarea
                  id="diagnosis"
                  {...register("diagnosis")}
                  placeholder="Enter diagnosis or admission reason"
                  rows={3}
                />
                {errors.diagnosis && (
                  <p className="text-sm text-destructive">
                    {errors.diagnosis.message}
                  </p>
                )}
              </div>
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
        {watchedWard && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ward-Specific Information ({watchedWard})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {watchedWard === "Geriatrics" && (
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

                {watchedWard === "Stroke" && (
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

                {watchedWard === "Orthopaedic" && (
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
                {isNewPatient ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isNewPatient ? "Create Patient" : "Update Patient"}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/patients")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
