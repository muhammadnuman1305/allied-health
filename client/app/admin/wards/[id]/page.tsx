import { Suspense } from "react";
import WardFormContent from "./ward-form-content";

export default async function WardFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WardFormContent wardId={id} />
    </Suspense>
  );
}
