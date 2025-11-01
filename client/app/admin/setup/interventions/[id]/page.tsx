"use client";

import { useParams } from "next/navigation";
import InterventionFormContent from "./intervention-form-content";

export default function InterventionFormPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const isEdit = id !== "0";
  return <InterventionFormContent interventionId={id} isEdit={isEdit} />;
}
