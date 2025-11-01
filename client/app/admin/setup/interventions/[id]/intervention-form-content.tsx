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
  getSpecialtyOptions$,
} from "@/lib/api/admin/interventions/_request";
import {
  Intervention,
  InterventionFormData,
} from "@/lib/api/admin/interventions/_model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpecialtyOption } from "@/lib/api/admin/specialties/_model";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  specialtyId: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function InterventionFormContent({
  interventionId,
  isEdit = false,
}: {
  interventionId: string;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(
    isEdit && interventionId !== "0"
  );
  const [loading, setLoading] = useState(false);
  const [specialtyOptions, setSpecialtyOptions] = useState<SpecialtyOption[]>(
    []
  );
  const [optionsLoading, setOptionsLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      specialtyId: "",
      notes: "",
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setOptionsLoading(true);
        const res = await getSpecialtyOptions$();
        setSpecialtyOptions(res.data);
      } catch (e) {
        setSpecialtyOptions([]);
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!isEdit || interventionId === "0") {
        setInitialLoading(false);
        return;
      }
      try {
        setInitialLoading(true);
        const res = await getById$(interventionId);
        const it: Intervention = res.data;
        form.reset({
          name: it.name,
          description: it.description || "",
          specialtyId: it.specialtyId || "",
          notes: it.notes || "",
        });
      } catch (e: any) {
        toast({
          title: "Error",
          description: e?.message || "Failed to load intervention",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [isEdit, interventionId, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const payload: InterventionFormData = {
        id: isEdit ? interventionId : undefined,
        name: data.name,
        description: data.description,
        specialtyId: data.specialtyId || undefined,
        notes: data.notes,
      };
      if (isEdit) {
        await update$(interventionId, payload);
        toast({
          title: "Success",
          description: "Intervention updated successfully",
        });
      } else {
        await create$(payload);
        toast({
          title: "Success",
          description: "Intervention created successfully",
        });
      }
      router.push("/admin/setup/interventions");
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to save intervention",
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/setup/interventions")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Intervention" : "Create Intervention"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update intervention details"
              : "Create a new clinical intervention"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mobilisation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialtyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(v === "none" ? "" : v)
                        }
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {optionsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading specialties...
                            </SelectItem>
                          ) : (
                            specialtyOptions.map((o) => (
                              <SelectItem key={o.id} value={o.id}>
                                {o.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the intervention"
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

          <div className="flex items-center justify-start gap-3">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Intervention"
                : "Create Intervention"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/setup/interventions")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
