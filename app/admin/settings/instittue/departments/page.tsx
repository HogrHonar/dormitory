import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getDepartments } from "@/app/data/(public)/department";
import { CreateDepartmentsDialog } from "./CreateDepartmentsDialog";

export default async function DepartmentsPage() {
  const data = await getDepartments();
  return (
    <>
      <main className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <CreateDepartmentsDialog />

          <p className="text-xl font-bold">لیستی بەشەکانی پەیمانگە</p>
        </div>

        <div className="container mx-auto" dir="rtl">
          <DataTable columns={columns} data={data} />
        </div>
      </main>
    </>
  );
}
