"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SpecialtyFormContent from "@/app/admin/setup/specialties/[id]/specialty-form-content";

export default function SpecialtyFormPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const isEdit = id !== "0";
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Specialty" : "Create New Specialty"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update specialty details"
              : "Add a new clinical specialty"}
          </p>
        </div>
      </div>

      <SpecialtyFormContent specialtyId={id} isEdit={isEdit} />
    </div>
  );
}
