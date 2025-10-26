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
import {
  getById$,
  create$,
  update$,
} from "@/lib/api/admin/departments/_request";
import {
  Department,
  DepartmentFormData,
  SERVICE_LINES,
  TASK_PRIORITIES,
} from "@/lib/api/admin/departments/_model";

// Form validation schema
const departmentFormSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z
    .string()
    .min(1, "Department code is required")
    .max(10, "Code must be 10 characters or less"),
  description: z.string().min(1, "Description is required"),
  serviceLine: z.enum([
    "Physiotherapy",
    "Occupational Therapy",
    "Speech Therapy",
    "Dietetics",
  ]),
  headAHP: z.string().min(1, "Head AHP is required"),
  status: z.enum(["A", "X"]),
  defaultTaskPriority: z.enum(["Low", "Medium", "High", "Urgent"]),
  coverageWards: z.array(z.string()),
  contactNumber: z.string().min(1, "Contact number is required"),
  email: z.string().email("Invalid email address"),
  notes: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

interface DepartmentFormContentProps {
  departmentId: string;
  isEdit?: boolean;
}

export default function DepartmentFormContent({
  departmentId,
  isEdit = false,
}: DepartmentFormContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState<Department | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      serviceLine: "Physiotherapy",
      headAHP: "",
      status: "A",
      defaultTaskPriority: "Medium",
      coverageWards: [],
      contactNumber: "",
      email: "",
      notes: "",
    },
  });

  // Load department data for editing
  useEffect(() => {
    if (isEdit && departmentId !== "0") {
      const fetchDepartment = async () => {
        try {
          setInitialLoading(true);
          const response = await getById$(departmentId);
          const dept = response.data;
          setDepartment(dept);

          // Populate form with existing data
          form.reset({
            name: dept.name,
            code: dept.code,
            description: dept.description,
            serviceLine: dept.serviceLine,
            headAHP: dept.headAHP,
            status: dept.status,
            defaultTaskPriority: dept.defaultTaskPriority,
            coverageWards: dept.coverageWards,
            contactNumber: dept.contactNumber,
            email: dept.email,
            notes: dept.notes || "",
          });
        } catch (error) {
          console.error("Error fetching department:", error);
          toast({
            title: "Error",
            description: "Failed to load department data",
            variant: "destructive",
          });
        } finally {
          setInitialLoading(false);
        }
      };

      fetchDepartment();
    }
  }, [departmentId, isEdit, form]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      setLoading(true);

      const formData: DepartmentFormData = {
        id: isEdit ? departmentId : undefined,
        name: data.name,
        code: data.code,
        description: data.description,
        serviceLine: data.serviceLine,
        headAHP: data.headAHP,
        status: data.status,
        defaultTaskPriority: data.defaultTaskPriority,
        coverageWards: data.coverageWards,
        contactNumber: data.contactNumber,
        email: data.email,
        notes: data.notes,
      };

      if (isEdit) {
        await update$(departmentId, formData);
        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      } else {
        await create$(formData);
        toast({
          title: "Success",
          description: "Department created successfully",
        });
      }

      router.push("/admin/setup/departments");
    } catch (error) {
      console.error("Error saving department:", error);
      toast({
        title: "Error",
        description: "Failed to save department. Please try again.",
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
          <p className="text-muted-foreground">Loading department data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Department" : "Create New Department"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit
            ? "Update department information and settings"
            : "Set up a new clinical department for task management and referrals"}
        </p>
      </div>

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

                <FormField
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
                          {SERVICE_LINES.map((serviceLine) => (
                            <SelectItem key={serviceLine} value={serviceLine}>
                              {serviceLine}
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select head AHP" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user-1">
                            Dr. Sarah Mitchell
                          </SelectItem>
                          <SelectItem value="user-2">
                            Ms. Jennifer Thompson
                          </SelectItem>
                          <SelectItem value="user-3">
                            Dr. Michael Rodriguez
                          </SelectItem>
                          <SelectItem value="user-4">Ms. Lisa Chen</SelectItem>
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A">Active</SelectItem>
                          <SelectItem value="X">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card>
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
          </Card>

          {/* Notes */}
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
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/setup/departments")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Department"
                : "Create Department"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
