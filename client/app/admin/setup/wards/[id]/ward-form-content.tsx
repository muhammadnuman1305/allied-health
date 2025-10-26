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
import { getById$, create$, update$ } from "@/lib/api/admin/wards/_request";
import {
  Ward,
  WardFormData,
  WARD_LOCATIONS,
} from "@/lib/api/admin/wards/_model";

// Form validation schema
const wardFormSchema = z.object({
  name: z.string().min(1, "Ward name is required"),
  code: z
    .string()
    .min(1, "Ward code is required")
    .max(10, "Code must be 10 characters or less"),
  location: z.enum([
    "Ground Floor",
    "First Floor",
    "Second Floor",
    "Third Floor",
    "ICU",
    "Emergency",
    "Surgery",
    "Rehabilitation",
    "Other",
  ]),
  bedCount: z
    .number()
    .min(1, "Bed count must be at least 1")
    .max(1000, "Bed count cannot exceed 1000"),
  defaultDepartment: z.string(),
  status: z.enum(["A", "X"]),
  notes: z.string().optional(),
});

type WardFormValues = z.infer<typeof wardFormSchema>;

interface WardFormContentProps {
  wardId: string;
  isEdit?: boolean;
}

export default function WardFormContent({
  wardId,
  isEdit = false,
}: WardFormContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ward, setWard] = useState<Ward | null>(null);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const form = useForm<WardFormValues>({
    resolver: zodResolver(wardFormSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "Ground Floor",
      bedCount: 1,
      defaultDepartment: "none",
      status: "A",
      notes: "",
    },
  });

  // Load ward data for editing
  useEffect(() => {
    if (isEdit && wardId !== "0") {
      const fetchWard = async () => {
        try {
          setInitialLoading(true);
          const response = await getById$(wardId);
          const wardData = response.data;
          setWard(wardData);

          // Populate form with existing data
          form.reset({
            name: wardData.name,
            code: wardData.code,
            location: wardData.location,
            bedCount: wardData.bedCount,
            defaultDepartment: wardData.defaultDepartment || "none",
            status: wardData.status,
            notes: wardData.notes || "",
          });
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
  }, [wardId, isEdit, form]);

  const onSubmit = async (data: WardFormValues) => {
    try {
      setLoading(true);

      const formData: WardFormData = {
        id: isEdit ? wardId : undefined,
        name: data.name,
        code: data.code,
        location: data.location,
        bedCount: data.bedCount,
        defaultDepartment:
          data.defaultDepartment === "none" ? "" : data.defaultDepartment,
        coverageDepartments: [], // Will be managed separately
        status: data.status,
        notes: data.notes,
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Ward" : "Create New Ward"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit
            ? "Update ward information and settings"
            : "Set up a new hospital ward for patient management"}
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WARD_LOCATIONS.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
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
                          <SelectItem value="dept-1">
                            Physiotherapy Department
                          </SelectItem>
                          <SelectItem value="dept-2">
                            Occupational Therapy Department
                          </SelectItem>
                          <SelectItem value="dept-3">
                            Speech Pathology Department
                          </SelectItem>
                          <SelectItem value="dept-4">
                            Dietitians Department
                          </SelectItem>
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

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Coverage Departments:</strong> Will be managed in
                    the Coverage Mapping section
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

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
                        placeholder="Any additional notes about this ward"
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
              onClick={() => router.push("/admin/setup/wards")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Ward" : "Create Ward"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
