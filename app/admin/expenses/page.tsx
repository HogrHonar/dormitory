import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import {
  adminGetExpenses,
  adminGetExpenseFormData,
} from "@/app/data/admin/admin-get-expenses";
import { CreateExpenseDialog } from "./create-expense-dialog";

export default async function Page() {
  await requireRole(ROLES.SUPER_ADMIN);

  const [data, { categories, dorms }] = await Promise.all([
    adminGetExpenses(),
    adminGetExpenseFormData(),
  ]);

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center" dir="rtl">
        <p className="text-xl font-bold py-4">لیستی خەرجییەکان</p>
        <CreateExpenseDialog categories={categories} dorms={dorms} />
      </div>
      <div className="container mx-auto" dir="rtl">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
