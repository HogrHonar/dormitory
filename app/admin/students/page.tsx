//ID No. ---- Student Name --- Department --- Total Fees of installment --- Paid --- Return Back --- Discount --- Remian
//at the bottom total --- total fees --- total paid --- total return back -- total discount  --- total remian

// Filter List is ---> Year, Name, Student ID, Department, Installment No. , Paid Status (Paid, Not Paid, Partially Paid)

// app/admin/students/page.tsx  ← this becomes the server component
import { getUserPermissions } from "@/lib/has-permission";
import StudentsClient from "./students-client";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
  const perms = await getUserPermissions();

  const canRead = perms.has("students:read");
  const canCreate = perms.has("students:create");

  if (!canRead) redirect("/unauthorized");

  return <StudentsClient canCreate={canCreate} />;
}
