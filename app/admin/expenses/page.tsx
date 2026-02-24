import { DataTable } from "./data-table";
import { columns } from "./columns";
import {
  adminGetExpenses,
  adminGetExpenseFormData,
} from "@/app/data/admin/admin-get-expenses";
import { CreateExpenseDialog } from "./create-expense-dialog";
import { hasPermission } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function Page() {
  const canRead = await hasPermission("expenses:read");
  if (!canRead) {
    redirect("/unauthorized");
  }

  const canCreate = await hasPermission("expenses:create");

  const [data, { categories, dorms }] = await Promise.all([
    adminGetExpenses(),
    adminGetExpenseFormData(),
  ]);

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center" dir="rtl">
        <p className="text-xl font-bold py-4">لیستی خەرجییەکان</p>
        {canCreate && (
          <CreateExpenseDialog categories={categories} dorms={dorms} />
        )}
      </div>
      <div className="container mx-auto" dir="rtl">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
