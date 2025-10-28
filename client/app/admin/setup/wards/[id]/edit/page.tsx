import WardFormContent from "../ward-form-content";

interface EditWardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWardPage({ params }: EditWardPageProps) {
  const { id } = await params;
  return <WardFormContent wardId={id} isEdit={true} />;
}
