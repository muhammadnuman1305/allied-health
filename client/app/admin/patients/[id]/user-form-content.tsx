// /patients/[id]/user-form-content.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  User,
  ClipboardList,
  GitBranch,
  MessageSquare,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getById$,
  create$,
  update$,
  getPatientTasks$,
  getPatientReferrals$,
  getPatientFeedback$,
} from "@/lib/api/admin/patients/_request";
import {
  PatientFormData,
  Patient,
  PatientTask,
  PatientReferral,
  PatientFeedback,
  GENDER_OPTIONS,
  TASK_STATUS_OPTIONS,
  REFERRAL_STATUS_OPTIONS,
} from "@/lib/api/admin/patients/_model";
import { toast } from "@/hooks/use-toast";

// Form validation schema for patient data
const createPatientFormSchema = () =>
  z.object({
    id: z.string().nullable().optional(),
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Full name must be less than 100 characters"),
    mrn: z
      .string()
      .min(3, "MRN must be at least 3 characters")
      .max(20, "MRN must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9-]+$/,
        "MRN can only contain letters, numbers, and hyphens"
      ),
    dateOfBirth: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true; // Optional field
        const date = new Date(val);
        return date <= new Date();
      }, "Date of birth must be in the past"),
    gender: z.enum(["Female", "Male", "Other", "PreferNotSay"], {
      required_error: "Please select a gender",
    }),
    primaryPhone: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true; // Optional field
        return /^\+[1-9]\d{1,14}$/.test(val);
      }, "Phone must be in E.164 format (e.g., +447700900123)"),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true; // Optional field
        return /^\+[1-9]\d{1,14}$/.test(val);
      }, "Phone must be in E.164 format (e.g., +447700900123)"),
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
  const [tasks, setTasks] = useState<PatientTask[]>([]);
  const [referrals, setReferrals] = useState<PatientReferral[]>([]);
  const [feedback, setFeedback] = useState<PatientFeedback[]>([]);
  const [activeTab, setActiveTab] = useState("details");

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
      fullName: "",
      mrn: "",
      dateOfBirth: "",
      gender: "Male",
      primaryPhone: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  // Load patient data for editing
  useEffect(() => {
    const loadPatient = async () => {
      if (!isNewPatient) {
        try {
          setIsLoadingPatient(true);
          const [
            patientResponse,
            tasksResponse,
            referralsResponse,
            feedbackResponse,
          ] = await Promise.all([
            getById$(patientId),
            getPatientTasks$(patientId),
            getPatientReferrals$(patientId),
            getPatientFeedback$(patientId),
          ]);

          const patientData = patientResponse.data;
          setPatient(patientData);
          setTasks(tasksResponse.data);
          setReferrals(referralsResponse.data);
          setFeedback(feedbackResponse.data);

          // Populate form with patient data
          setValue("id", patientData.id);
          setValue("fullName", patientData.fullName);
          setValue("mrn", patientData.mrn);
          setValue("dateOfBirth", patientData.dateOfBirth || "");
          setValue("gender", patientData.gender);
          setValue("primaryPhone", patientData.primaryPhone || "");
          setValue(
            "emergencyContactName",
            patientData.emergencyContactName || ""
          );
          setValue(
            "emergencyContactPhone",
            patientData.emergencyContactPhone || ""
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
        fullName: data.fullName,
        mrn: data.mrn,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
        primaryPhone: data.primaryPhone || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
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

  // Helper to format status badge
  const getTaskStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      NotAssigned: "outline",
      Assigned: "secondary",
      InProgress: "default",
      Completed: "default",
      Cancelled: "destructive",
    };
    return variants[status] || "outline";
  };

  const getReferralStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Pending: "outline",
      Accepted: "default",
      Declined: "destructive",
      Completed: "default",
    };
    return variants[status] || "outline";
  };

  const getFeedbackTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      Positive: "default",
      Concern: "destructive",
      Neutral: "secondary",
    };
    return variants[type] || "outline";
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
              ? "Create a new patient master identity record"
              : "Update patient information and view history"}
          </p>
        </div>
      </div>

      {isNewPatient ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* MRN */}
                <div className="space-y-2">
                  <Label htmlFor="mrn">Medical Record Number (MRN) *</Label>
                  <Input
                    id="mrn"
                    {...register("mrn")}
                    placeholder="e.g., MRN001234"
                  />
                  {errors.mrn && (
                    <p className="text-sm text-destructive">
                      {errors.mrn.message}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Optional but recommended for age calculation
                  </p>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
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

                {/* Primary Phone */}
                <div className="space-y-2">
                  <Label htmlFor="primaryPhone">Primary Phone</Label>
                  <Input
                    id="primaryPhone"
                    {...register("primaryPhone")}
                    placeholder="+447700900123"
                  />
                  {errors.primaryPhone && (
                    <p className="text-sm text-destructive">
                      {errors.primaryPhone.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    E.164 format (e.g., +447700900123)
                  </p>
                </div>

                {/* Emergency Contact Name */}
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergencyContactName"
                    {...register("emergencyContactName")}
                    placeholder="Enter contact name"
                  />
                </div>

                {/* Emergency Contact Phone */}
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">
                    Emergency Contact Phone
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    {...register("emergencyContactPhone")}
                    placeholder="+447700900123"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-sm text-destructive">
                      {errors.emergencyContactPhone.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    E.164 format (e.g., +447700900123)
                  </p>
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Patient
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
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 w-full h-full"
        >
          <TabsList>
            <TabsTrigger value="details">
              <User className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ClipboardList className="h-4 w-4 mr-2" />
              Task History
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <GitBranch className="h-4 w-4 mr-2" />
              Referral History
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback Summary
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        {...register("fullName")}
                        placeholder="Enter full name"
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* MRN */}
                    <div className="space-y-2">
                      <Label htmlFor="mrn">Medical Record Number (MRN) *</Label>
                      <Input
                        id="mrn"
                        {...register("mrn")}
                        placeholder="e.g., MRN001234"
                      />
                      {errors.mrn && (
                        <p className="text-sm text-destructive">
                          {errors.mrn.message}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...register("dateOfBirth")}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-sm text-destructive">
                          {errors.dateOfBirth.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Optional but recommended for age calculation
                      </p>
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              {GENDER_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.label}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
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

                    {/* Primary Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="primaryPhone">Primary Phone</Label>
                      <Input
                        id="primaryPhone"
                        {...register("primaryPhone")}
                        placeholder="+447700900123"
                      />
                      {errors.primaryPhone && (
                        <p className="text-sm text-destructive">
                          {errors.primaryPhone.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        E.164 format (e.g., +447700900123)
                      </p>
                    </div>

                    {/* Emergency Contact Name */}
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">
                        Emergency Contact Name
                      </Label>
                      <Input
                        id="emergencyContactName"
                        {...register("emergencyContactName")}
                        placeholder="Enter contact name"
                      />
                    </div>

                    {/* Emergency Contact Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">
                        Emergency Contact Phone
                      </Label>
                      <Input
                        id="emergencyContactPhone"
                        {...register("emergencyContactPhone")}
                        placeholder="+447700900123"
                      />
                      {errors.emergencyContactPhone && (
                        <p className="text-sm text-destructive">
                          {errors.emergencyContactPhone.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        E.164 format (e.g., +447700900123)
                      </p>
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Patient
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
          </TabsContent>

          {/* Task History Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Task History</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks found for this patient
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>AHA(s)</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            {task.taskName}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getTaskStatusBadge(task.status)}>
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{task.assignedTo.join(", ")}</TableCell>
                          <TableCell>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(task.lastActivity).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral History Tab */}
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No referrals found for this patient
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From Department</TableHead>
                        <TableHead>To Department</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell>{referral.fromDepartment}</TableCell>
                          <TableCell>{referral.toDepartment}</TableCell>
                          <TableCell>
                            {new Date(referral.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {referral.notes}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getReferralStatusBadge(referral.status)}
                            >
                              {referral.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Summary Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No feedback found for this patient
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>AHA</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feedback.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {new Date(item.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{item.taskName}</TableCell>
                          <TableCell>{item.ahp}</TableCell>
                          <TableCell>
                            <Badge variant={getFeedbackTypeBadge(item.type)}>
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate" title={item.fullComment}>
                              {item.commentPreview}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
