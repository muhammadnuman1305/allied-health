"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/lib/api/admin/specialties/_request";
import {
  Specialty,
  SpecialtyFormData,
} from "@/lib/api/admin/specialties/_model";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SpecialtyFormContent({
  specialtyId,
  isEdit = false,
}: {
  specialtyId: string;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(
    isEdit && specialtyId !== "0"
  );
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    const load = async () => {
      if (!isEdit || specialtyId === "0") {
        setInitialLoading(false);
        return;
      }
      try {
        setInitialLoading(true);
        const res = await getById$(specialtyId);
        const sp: Specialty = res.data;
        form.reset({
          name: sp.name,
          description: sp.description || "",
        });
      } catch (e: any) {
        toast({
          title: "Error",
          description: e?.message || "Failed to load specialty",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [isEdit, specialtyId, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const payload: SpecialtyFormData = {
        id: isEdit ? specialtyId : undefined,
        name: data.name,
        description: data.description,
      };
      if (isEdit) {
        await update$(specialtyId, payload);
        toast({
          title: "Success",
          description: "Specialty updated successfully",
        });
      } else {
        await create$(payload);
        toast({
          title: "Success",
          description: "Specialty created successfully",
        });
      }
      router.push("/admin/setup/specialties");
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save specialty",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Physiotherapy" {...field} />
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
                          placeholder="Describe the specialty"
                          className="min-h-[100px]"
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

          <div className="flex items-center justify-start gap-4 pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Specialty"
                : "Create Specialty"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/setup/specialties")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
