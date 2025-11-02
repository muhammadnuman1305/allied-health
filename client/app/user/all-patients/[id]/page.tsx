import { Suspense } from "react";
import PatientDetailContent from "../[id]/patient-detail-content";

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { id } = await params;
  const { returnTo } = await searchParams;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PatientDetailContent patientId={id} returnTo={returnTo} />
    </Suspense>
  );
}
