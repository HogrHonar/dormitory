import { DataTable } from "./data-table";
import { columns } from "./columns";
import { adminGetAuditLogs } from "@/app/data/admin/admin-get-audit-logs";
import { hasPermission } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function AuditLogsPage() {
  const canRead = await hasPermission("audit-logs:read");
  if (!canRead) redirect("/unauthorized");

  const data = await adminGetAuditLogs();

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center">
        <p className="text-xl font-bold py-4">تۆماری چالاکییەکان</p>
      </div>
      <div dir="rtl">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
