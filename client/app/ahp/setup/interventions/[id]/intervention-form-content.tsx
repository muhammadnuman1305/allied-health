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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  getById$,
  create$,
  update$,
  getSpecialtyOptions$,
  getComponentTypes$,
} from "@/lib/api/admin/interventions/_request";
import {
  Intervention,
  InterventionFormData,
  InterventionComponentRow,
  ComponentTypeOption,
} from "@/lib/api/admin/interventions/_model";
import { SpecialtyOption } from "@/lib/api/admin/specialties/_model";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  specialtyId: z.string().optional(),
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
  const [initialLoading, setInitialLoading] = useState(isEdit && interventionId !== "0");
  const [loading, setLoading] = useState(false);
  const [specialtyOptions, setSpecialtyOptions] = useState<SpecialtyOption[]>([]);
  const [componentTypeOptions, setComponentTypeOptions] = useState<ComponentTypeOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [componentRows, setComponentRows] = useState<InterventionComponentRow[]>([
    { componentType: "", value: "" },
  ]);
  const [componentErrors, setComponentErrors] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", specialtyId: "" },
  });

  useEffect(() => {
    const load = async () => {
      try {
        setOptionsLoading(true);
        const [specRes, ctRes] = await Promise.all([
          getSpecialtyOptions$(),
          getComponentTypes$(),
        ]);
        setSpecialtyOptions(specRes.data);
        setComponentTypeOptions(ctRes.data);
      } catch {
        setSpecialtyOptions([]);
        setComponentTypeOptions([]);
      } finally {
        setOptionsLoading(false);
      }
    };
    load();
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
        });
        if (it.components && it.components.length > 0) {
          const rows: InterventionComponentRow[] = [];
          for (const group of it.components) {
            for (const val of group.values) {
              rows.push({ componentType: group.type, value: val });
            }
          }
          setComponentRows(rows.length > 0 ? rows : [{ componentType: "", value: "" }]);
        }
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

  const addRow = () =>
    setComponentRows((prev) => [...prev, { componentType: "", value: "" }]);

  const removeRow = (index: number) =>
    setComponentRows((prev) => prev.filter((_, i) => i !== index));

  const updateRow = (index: number, field: keyof InterventionComponentRow, val: string) =>
    setComponentRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: val } : r))
    );

  const validateComponents = (): boolean => {
    const errors: string[] = componentRows.map((r) => {
      if (!r.componentType) return "Component type is required";
      if (!r.value.trim()) return "Value is required";
      return "";
    });
    setComponentErrors(errors);
    if (componentRows.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one component is required",
        variant: "destructive",
      });
      return false;
    }
    return errors.every((e) => e === "");
  };

  const onSubmit = async (data: FormValues) => {
    if (!validateComponents()) return;
    try {
      setLoading(true);
      const payload: InterventionFormData = {
        id: isEdit ? interventionId : undefined,
        name: data.name,
        description: data.description,
        specialtyId: data.specialtyId || undefined,
        components: componentRows,
      };
      if (isEdit) {
        await update$(interventionId, payload);
        toast({ title: "Success", description: "Intervention updated successfully" });
      } else {
        await create$(payload);
        toast({ title: "Success", description: "Intervention created successfully" });
      }
      router.push("/ahp/setup/interventions");
    } catch {
      toast({ title: "Error", description: "Failed to save intervention", variant: "destructive" });
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
        <Button variant="ghost" size="sm" onClick={() => router.push("/ahp/setup/interventions")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Intervention" : "Create Intervention"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update intervention details and components"
              : "Create a new clinical intervention with dynamic components"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
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
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
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
                            <SelectItem value="loading" disabled>Loading…</SelectItem>
                          ) : (
                            specialtyOptions.map((o) => (
                              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
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
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dynamic Components */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Components</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define the techniques, equipment, activities and other elements for this
                    intervention. At least one component is required.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Component
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {componentRows.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No components added yet. Click &quot;Add Component&quot; to begin.
                </p>
              )}

              {componentRows.map((row, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30"
                >
                  {/* Type */}
                  <div className="flex-1 min-w-[180px]">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Type *
                    </label>
                    <Select
                      value={row.componentType}
                      onValueChange={(v) => updateRow(index, "componentType", v)}
                    >
                      <SelectTrigger
                        className={
                          componentErrors[index] && !row.componentType
                            ? "border-destructive"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {componentTypeOptions.map((ct) => (
                          <SelectItem key={ct.id} value={ct.name}>
                            {ct.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {componentErrors[index] && !row.componentType && (
                      <p className="text-xs text-destructive mt-1">{componentErrors[index]}</p>
                    )}
                  </div>

                  {/* Value */}
                  <div className="flex-[2]">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Value *
                    </label>
                    <Input
                      placeholder="e.g., Hoist transfer"
                      value={row.value}
                      onChange={(e) => updateRow(index, "value", e.target.value)}
                      className={
                        componentErrors[index] && !row.value.trim()
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {componentErrors[index] && !row.value.trim() && (
                      <p className="text-xs text-destructive mt-1">{componentErrors[index]}</p>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={componentRows.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {componentRows.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addRow}
                  className="w-full border-dashed border"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Another Component
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Update Intervention" : "Create Intervention"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/ahp/setup/interventions")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
