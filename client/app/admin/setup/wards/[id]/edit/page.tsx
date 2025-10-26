import WardFormContent from "../ward-form-content";

interface EditWardPageProps {
  params: {
    id: string;
  };
}

export default function EditWardPage({ params }: EditWardPageProps) {
  return <WardFormContent wardId={params.id} isEdit={true} />;
}
