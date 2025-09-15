import { Suspense } from "react";
import WardFormContent from "./ward-form-content";

export default function WardFormPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WardFormContent wardId={params.id} />
    </Suspense>
  );
}
