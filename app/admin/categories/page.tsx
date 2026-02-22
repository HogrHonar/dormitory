import { DataTable } from "./data-table";
import { columns } from "./columns";
import { AdminGetCategories } from "@/app/data/admin/admin-get-categories";
import { CreateCategoryDialog } from "./createCategoriesForm";

export default async function CategoryPage() {
  const data = await AdminGetCategories();
  return (
    <>
      <main className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <CreateCategoryDialog />

          <p className="text-xl font-bold">لیستی جۆرەکان</p>
        </div>

        <div className="container mx-auto" dir="rtl">
          <DataTable columns={columns} data={data} />
        </div>
      </main>
    </>
  );
}
