"use server";
// app/admin/fees/action.ts
import { prisma } from "@/lib/prisma";
import { FeeSchema, FeeSchemaType } from "@/lib/zodSchemas";
import { hasPermission } from "@/lib/has-permission";

export async function createFeeAction(values: FeeSchemaType) {
  const allowed = await hasPermission("fees:create");
  if (!allowed)
    return { error: "You do not have permission to create a fee structure" };

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
