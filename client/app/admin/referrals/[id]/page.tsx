import { Suspense } from "react";
import ReferralFormContent from "./referral-form-content";

export default function ReferralFormPage({ params }: { params: { id: any } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReferralFormContent referralId={params.id} />
    </Suspense>
  );
}
