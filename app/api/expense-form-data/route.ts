import { NextResponse } from "next/server";
import { adminGetExpenseFormData } from "@/app/data/admin/admin-get-expenses";
import { hasPermission } from "@/lib/has-permission";

export const dynamic = "force-dynamic";

export async function GET() {
  const canRead = await hasPermission("expenses:read");
  if (!canRead) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await adminGetExpenseFormData();
  return NextResponse.json(data);
}
