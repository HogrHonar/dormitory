"use server";

import { InstallmentSchemaType } from "@/lib/zodSchemas";
import { prisma } from "@/lib/prisma";
import { InstallmentSchema } from "@/lib/zodSchemas";
import { hasPermission } from "@/lib/has-permission";

export async function createInstallmentAction(values: InstallmentSchemaType) {
  const allowed = await hasPermission("installments:create");
  if (!allowed)
    return { error: "You do not have permission to create an installment" };

  const parsed = InstallmentSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Invalid values",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const {
    yearId,
    entranceYearId,
    title,
    installmentNo,
    amount,
    startDate,
    endDate,
  } = parsed.data;

  const installment = await prisma.installment.createMany({
    data: {
      yearId,
      entranceYearId,
      title,
      installmentNo,
      amount,
      startDate,
      endDate,
    },
  });

  return {
    status: "success",
    message: "Installment created successfully",
    data: installment,
  };
}
