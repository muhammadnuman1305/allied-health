import { Suspense } from "react";
import PatientFormContent from "./patient-form-content";

export default async function PatientFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PatientFormContent patientId={id} />
    </Suspense>
  );
}
