"use server";

import { InstallmentSchemaType } from "@/lib/zodSchemas";
import { prisma } from "@/lib/prisma";
import { InstallmentSchema } from "@/lib/zodSchemas";
import { hasPermission } from "@/lib/has-permission";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function createInstallmentAction(values: InstallmentSchemaType) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("installments:create");
  if (!allowed) {
    await auditLog({
      action: "CREATE",
      entityType: "Installment",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to create installment",
    });
    return { error: "You do not have permission to create an installment" };
  }

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

  try {
    const installment = await prisma.installment.create({
      data: {
        yearId,
        entranceYearId,
        title,
        installmentNo,
        amount,
        startDate,
        endDate,
      },
      include: {
        year: { select: { name: true } },
        entranceYear: { select: { name: true } },
      },
    });

    await auditLog({
      action: "CREATE",
      entityType: "Installment",
      entityId: installment.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Created installment "${installment.title}" (#${installment.installmentNo})`,
      newValues: {
        title: installment.title,
        installmentNo: installment.installmentNo,
        amount: installment.amount,
        startDate: installment.startDate,
        endDate: installment.endDate,
        year: installment.year.name,
        entranceYear: installment.entranceYear.name,
      },
    });

    return {
      status: "success",
      message: "Installment created successfully",
      data: installment,
    };
  } catch {
    await auditLog({
      action: "CREATE",
      entityType: "Installment",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to create installment",
      metadata: { title, installmentNo },
    });

    return { error: "Failed to create installment" };
  }
}
