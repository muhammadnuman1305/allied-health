import { Suspense } from "react";
import PatientFormContent from "./user-form-content";

export default async function PatientFormPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PatientFormContent patientId={params?.id} />
    </Suspense>
  );
}

