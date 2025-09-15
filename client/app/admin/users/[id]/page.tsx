import { Suspense } from "react";
import UserFormContent from "./user-form-content";

export default async function UserFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserFormContent userId={id} />
    </Suspense>
  );
}
