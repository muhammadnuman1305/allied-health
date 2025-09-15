import { Suspense } from "react";
import ReferralFormContent from "./referral-form-content";

export default async function ReferralFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReferralFormContent referralId={id} />
    </Suspense>
  );
}
