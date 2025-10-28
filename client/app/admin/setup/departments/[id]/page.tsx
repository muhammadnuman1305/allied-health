"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Settings,
  Edit,
  Plus,
  ArrowLeft,
  Clock,
  AlertTriangle,
  UserCheck,
  UserPlus,
  ClipboardList,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import {
  getById$,
  update$,
  create$,
  getDepartmentHeads$,
} from "@/lib/api/admin/departments/_request";
import {
  Department,
  DepartmentFormData,
  DepartmentHead,
  TASK_PRIORITIES,
  PRIORITY_TO_ID,
} from "@/lib/api/admin/departments/_model";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";

// Form validation schema
const departmentFormSchema = z
  .object({
    name: z.string().min(1, "Department name is required"),
    code: z
      .string()
      .min(1, "Department code is required")
      .max(10, "Code must be 10 characters or less"),
    purpose: z
      .string()
      .min(1, "Purpose is required")
      .max(100, "Purpose must be 100 characters or less"),
    description: z.string().min(1, "Description is required"),
    // serviceLine: z.string().min(1, "Service line is required"),
    headAHP: z.string().min(1, "Head AHP is required"),
    defaultTaskPriority: z.enum(["Low", "Medium", "High", "Urgent"]),
    coverageWards: z.array(z.string()),
    contactNumber: z.string().min(1, "Contact number is required"),
    email: z.string().email("Invalid email address"),
    operatingFrom: z.string().min(1, "Operating From is required"),
    operatingTo: z.string().min(1, "Operating To is required"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.operatingFrom && data.operatingTo) {
        const fromTime = new Date(`2000-01-01T${data.operatingFrom}`);
        const toTime = new Date(`2000-01-01T${data.operatingTo}`);
        return toTime > fromTime;
      }
      return true;
    },
    {
      message: "To hour must be after From hour",
      path: ["operatingTo"],
    }
  );

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export default function DepartmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [departmentHeads, setDepartmentHeads] = useState<DepartmentHead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isNewDepartment, setIsNewDepartment] = useState(false);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      code: "",
      purpose: "",
      description: "",
      // serviceLine: "",
      headAHP: "",
      defaultTaskPriority: "Medium",
      coverageWards: [],
      contactNumber: "",
      email: "",
      operatingFrom: "08:00",
      operatingTo: "18:00",
      notes: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch department heads first
        try {
          const headsResponse = await getDepartmentHeads$();
          console.log("Department heads fetched:", headsResponse.data);
          console.log("First head structure:", headsResponse.data[0]);
          setDepartmentHeads(headsResponse.data);
        } catch (headsError) {
          console.error("Error fetching department heads:", headsError);
          // Set empty array as fallback
          setDepartmentHeads([]);
        }

        // Check if this is a new department creation
        if (departmentId === "0") {
          setIsNewDepartment(true);
          setDepartment(null);
          setLoading(false);
          return;
        }

        setIsNewDepartment(false);
        const response = await getById$(departmentId);
        const dept = response.data;
        setDepartment(dept);

        // Populate form with existing data
        form.reset({
          name: dept.name,
          code: dept.code,
          purpose: dept.purpose || "",
          description: dept.description,
          // serviceLine: dept.serviceLine,
          headAHP: dept.deptHeadId, // Map deptHeadId to headAHP
          defaultTaskPriority: dept.defaultTaskPriority,
          coverageWards: dept.coverageWards || [],
          contactNumber: dept.contactNumber,
          email: dept.email,
          operatingFrom: dept.operatingFrom || "08:00",
          operatingTo: dept.operatingTo || "18:00",
          notes: dept.notes || "",
        });
      } catch (err: any) {
        console.error("Error fetching data:", err);

        // Handle specific error messages from API
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch data. Please try again.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId, form]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      setSaving(true);

      const formData: DepartmentFormData = {
        id: isNewDepartment ? undefined : departmentId,
        name: data.name,
        code: data.code,
        purpose: data.purpose,
        description: data.description,
        // serviceLine: data.serviceLine as any,
        deptHeadId: data.headAHP,
        defaultTaskPriority: PRIORITY_TO_ID[data.defaultTaskPriority],
        contactNumber: data.contactNumber,
        email: data.email,
        operatingFrom: data.operatingFrom,
        operatingTo: data.operatingTo,
      };

      if (isNewDepartment) {
        // Create new department
        const newDept = await create$(formData);
        setDepartment(newDept.data);

        toast({
          title: "Success",
          description: "Department created successfully",
        });

        // Redirect to departments list page
        router.push("/admin/setup/departments");
      } else {
        // Update existing department
        const updatedDept = await update$(departmentId, formData);
        setDepartment(updatedDept.data);

        toast({
          title: "Success",
          description: "Department updated successfully",
        });

        // Redirect to departments list page
        router.push("/admin/setup/departments");
      }
    } catch (error: any) {
      console.error("Error saving department:", error);

      // Handle specific error messages from API
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        (isNewDepartment
          ? "Failed to create department. Please try again."
          : "Failed to update department. Please try again.");

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loading Department...</h1>
            <p className="text-muted-foreground">
              Please wait while we fetch the details
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading department details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!department && !isNewDepartment)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Department Not Found</h1>
            <p className="text-muted-foreground">
              The requested department could not be found
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error || "Department not found"}
            </p>
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
                {isNewDepartment ? "New Department" : department?.name || ""}
              </h1>
              {!isNewDepartment && department && (
                <Badge variant="outline" className="text-sm">
                  {department.code}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {isNewDepartment
                ? "Create a new clinical department"
                : form.watch("purpose") || department?.purpose || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Only show for existing departments */}
      {!isNewDepartment && department && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Open Tasks"
            value={department.openTasks}
            description="Currently assigned"
            icon={ClipboardList}
          />
          <StatsCard
            title="Overdue Tasks"
            value={department.overdueTasks}
            description="Requiring attention"
            icon={AlertTriangle}
          />
          <StatsCard
            title="Incoming Referrals Today"
            value={department.incomingReferralsToday}
            description="New referrals received"
            icon={ArrowDown}
          />
          <StatsCard
            title="Active Staff"
            value={department.activeAHPs + department.activeAHAs}
            description={`${department.activeAHPs} AHPs, ${department.activeAHAs} AHAs`}
            icon={Users}
          />
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {!isNewDepartment && (
            <>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Details Tab - Editable Form */}
        <TabsContent value="details" className="space-y-6">
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
                          <FormLabel>Department Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Physiotherapy Department"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Restoring mobility and strength"
                              {...field}
                            />
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
                          <FormLabel>Department Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., PT" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      control={form.control}
                      name="serviceLine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Line *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service line" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Physiotherapy">
                                Physiotherapy
                              </SelectItem>
                              <SelectItem value="Occupational Therapy">
                                Occupational Therapy
                              </SelectItem>
                              <SelectItem value="Speech Therapy">
                                Speech Pathology
                              </SelectItem>
                              <SelectItem value="Dietetics">
                                Dietitians
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., +1-555-0201" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., physio@alliedhealth.com"
                              {...field}
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the department's purpose and services"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Staff & Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Staff & Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="headAHP"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Head AHP *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select head AHP" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departmentHeads.length === 0 ? (
                                <SelectItem value="" disabled>
                                  {loading
                                    ? "Loading department heads..."
                                    : "No department heads available"}
                                </SelectItem>
                              ) : (
                                departmentHeads.map((head) => (
                                  <SelectItem key={head.id} value={head.id}>
                                    {head.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="defaultTaskPriority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Task Priority</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select default priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TASK_PRIORITIES.map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {priority}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="operatingFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operating From</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="operatingTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operating To</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., +1-555-0201" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., physio@alliedhealth.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card> */}

              {/* Notes
            <Card>
              <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes about this department"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
              </Card> */}
              {/* Form Actions */}
              <div className="flex items-center justify-start gap-4 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? isNewDepartment
                      ? "Creating..."
                      : "Saving..."
                    : isNewDepartment
                    ? "Create Department"
                    : "Update Department"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/setup/departments")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        {/* Staff Tab - Only for existing departments */}
        {!isNewDepartment && (
          <TabsContent value="staff" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Department Staff</h3>
                <p className="text-muted-foreground">
                  Manage AHPs and AHAs assigned to this department
                </p>
              </div>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AHPs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Allied Health Professionals ({department?.activeAHPs || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No AHPs assigned yet</p>
                </CardContent>
              </Card>

              {/* AHAs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Allied Health Assistants ({department?.activeAHAs || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No AHAs assigned yet</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Tasks Tab - Only for existing departments */}
        {!isNewDepartment && (
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Department Tasks</h3>
                <p className="text-muted-foreground">
                  Read-only snapshot of tasks assigned to this department
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
                    Kanban View Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Tasks will be displayed in a Kanban board filtered to this
                    department
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Referrals Tab - Only for existing departments */}
        {!isNewDepartment && (
          <TabsContent value="referrals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Department Referrals</h3>
                <p className="text-muted-foreground">
                  Manage incoming and outgoing referrals for this department
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Refer Patient
              </Button>
            </div>

            <Tabs defaultValue="incoming" className="space-y-4">
              <TabsList>
                <TabsTrigger
                  value="incoming"
                  className="flex items-center gap-2"
                >
                  <ArrowDown className="h-4 w-4" />
                  Incoming ({department?.incomingReferralsToday || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="outgoing"
                  className="flex items-center gap-2"
                >
                  <ArrowUp className="h-4 w-4" />
                  Outgoing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="incoming">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <ArrowDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Incoming Referrals
                      </h3>
                      <p className="text-muted-foreground">
                        Incoming referrals will be displayed here with
                        acknowledge/accept/decline actions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outgoing">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <ArrowUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Outgoing Referrals
                      </h3>
                      <p className="text-muted-foreground">
                        Outgoing referrals will be displayed here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}

        {/* Settings Tab - Only for existing departments */}
        {!isNewDepartment && (
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Department Settings</h3>
              <p className="text-muted-foreground">
                Manage department configuration and coverage
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
                    Edit Department Details
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage Coverage Wards
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Set Default Task Priority
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
                    Deactivate Department
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Merge with Another Department
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
