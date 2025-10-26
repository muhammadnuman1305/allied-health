import { Suspense } from "react";
import UserFormContent from "./user-form-content";

export default function UserFormPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserFormContent userId={params.id} />
    </Suspense>
  );
}
