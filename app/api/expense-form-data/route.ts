import { NextResponse } from "next/server";
import { adminGetExpenseFormData } from "@/app/data/admin/admin-get-expenses";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";

export async function GET() {
  await requireRole(ROLES.SUPER_ADMIN);
  const data = await adminGetExpenseFormData();
  return NextResponse.json(data);
}
