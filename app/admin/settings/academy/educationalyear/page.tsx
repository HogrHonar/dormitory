import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getEducationYears } from "@/app/data/(public)/educationYear";
import { CreateEducationalYearDialog } from "./EducationalYearForm";

export default async function EducationalYearPage() {
  const data = await getEducationYears();
  return (
    <>
      <main className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <CreateEducationalYearDialog />

          <p className="text-xl font-bold">لیستی ساڵی خوێندن</p>
        </div>

        <div className="container mx-auto" dir="rtl">
          <DataTable columns={columns} data={data} />
        </div>
      </main>
    </>
  );
}
