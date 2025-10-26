import DepartmentFormContent from "../department-form-content";

interface EditDepartmentPageProps {
  params: {
    id: string;
  };
}

export default function EditDepartmentPage({
  params,
}: EditDepartmentPageProps) {
  return <DepartmentFormContent departmentId={params.id} isEdit={true} />;
}
