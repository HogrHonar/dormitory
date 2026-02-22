"use server";
// app/admin/fees/action.ts
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { FeeSchema, FeeSchemaType } from "@/lib/zodSchemas";

export async function createFeeAction(values: FeeSchemaType) {
  const session = await requireRole(ROLES.ADMIN);
  if (!session) return { error: "Unauthorized" };

  const parsed = FeeSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Invalid values",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { entranceYear, totalAmount, departments } = parsed.data;

  const feeStructures = await prisma.feeStructure.createMany({
    data: departments.map((departmentId) => ({
      departmentId,
      entranceYear,
      totalAmount,
    })),
  });

  return {
    status: "success",
    message: "Fee structure created for selected departments",
    data: feeStructures,
  };
}
