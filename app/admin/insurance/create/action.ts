"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  CreateInsuranceSchema,
  ReturnInsuranceSchema,
  CreateInsuranceSchemaType,
  ReturnInsuranceSchemaType,
} from "@/lib/zodSchemas";
import { hasPermission } from "@/lib/has-permission";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function createInsuranceAction(values: CreateInsuranceSchemaType) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("insurance:create");
  if (!allowed) {
    await auditLog({
      action: "CREATE",
      entityType: "DormInsurance",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to create insurance",
    });
    return { error: "You do not have permission to create an insurance" };
  }

  const parsed = CreateInsuranceSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "نرخەکان دروست نین",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { studentId, amountPaid, paymentMethod, paidAt } = parsed.data;

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, roomId: true, fullNameKu: true, studentCode: true },
    });

    if (!student) return { error: "فێرخواز نەدۆزرایەوە" };
    if (!student.roomId)
      return { error: "فێرخواز تا ئێستا تۆمارکراو لە نوێخانەدا نییە" };

    const existing = await prisma.dormInsurance.findFirst({
      where: { studentId, status: "ACTIVE" },
    });

    if (existing) return { error: "فێرخواز پێشتر بارمتەی چالاکی هەیە" };

    const insurance = await prisma.dormInsurance.create({
      data: {
        studentId,
        amountPaid,
        paymentMethod,
        status: "ACTIVE",
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
    });

    await auditLog({
      action: "CREATE",
      entityType: "DormInsurance",
      entityId: insurance.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Created insurance for student "${student.fullNameKu}" (${student.studentCode})`,
      newValues: {
        studentId,
        amountPaid,
        paymentMethod,
        status: "ACTIVE",
        paidAt: insurance.paidAt,
      },
    });

    revalidatePath("/admin/insurance");
    return { status: "success", message: "بارمتە بە سەرکەوتوویی زیادکرا" };
  } catch {
    await auditLog({
      action: "CREATE",
      entityType: "DormInsurance",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to create insurance",
      metadata: { studentId },
    });
    return { error: "کێشەیەک ڕوویدا لە زیادکردنی بارمتە" };
  }
}

export async function returnInsuranceAction(
  insuranceId: string,
  values: ReturnInsuranceSchemaType,
) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("insurance:update");
  if (!allowed) {
    await auditLog({
      action: "UPDATE",
      entityType: "DormInsurance",
      entityId: insuranceId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to return insurance",
    });
    return { error: "You do not have permission to return an insurance" };
  }

  const parsed = ReturnInsuranceSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "نرخەکان دروست نین",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { amountReturned, returnNote, returnedBy } = parsed.data;

  try {
    const insurance = await prisma.dormInsurance.findUnique({
      where: { id: insuranceId },
      include: { student: { select: { fullNameKu: true, studentCode: true } } },
    });

    if (!insurance) return { error: "بارمتە نەدۆزرایەوە" };
    if (insurance.status !== "ACTIVE") return { error: "بارمتەکە چالاک نییە" };
    if (amountReturned > insurance.amountPaid) {
      return {
        error: "بڕی گەڕاندنەوە نابێت زیاتر لە بڕی بارمتەی پارەدراو بێت",
      };
    }

    const newStatus = amountReturned === 0 ? "FORFEITED" : "RETURNED";

    await prisma.dormInsurance.update({
      where: { id: insuranceId },
      data: {
        amountReturned,
        returnNote: returnNote ?? null,
        returnedBy: returnedBy ?? null,
        returnedAt: new Date(),
        status: newStatus,
      },
    });

    await auditLog({
      action: "UPDATE",
      entityType: "DormInsurance",
      entityId: insuranceId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Insurance ${newStatus.toLowerCase()} for student "${insurance.student.fullNameKu}" (${insurance.student.studentCode})`,
      oldValues: {
        status: insurance.status,
        amountPaid: insurance.amountPaid,
        amountReturned: insurance.amountReturned,
      },
      newValues: {
        status: newStatus,
        amountReturned,
        returnNote: returnNote ?? null,
        returnedBy: returnedBy ?? null,
      },
    });

    revalidatePath("/admin/insurance");
    return { status: "success", message: "بارمتە بە سەرکەوتوویی گەڕایەوە" };
  } catch {
    await auditLog({
      action: "UPDATE",
      entityType: "DormInsurance",
      entityId: insuranceId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to return insurance",
    });
    return { error: "کێشەیەک ڕوویدا لە گەڕاندنەوەی بارمتە" };
  }
}

export async function deleteInsuranceAction(insuranceId: string) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("insurance:delete");
  if (!allowed) {
    await auditLog({
      action: "DELETE",
      entityType: "DormInsurance",
      entityId: insuranceId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to delete insurance",
    });
    return { error: "You do not have permission to delete an insurance" };
  }

  try {
    const insurance = await prisma.dormInsurance.findUnique({
      where: { id: insuranceId },
      include: { student: { select: { fullNameKu: true, studentCode: true } } },
    });

    await prisma.dormInsurance.delete({ where: { id: insuranceId } });

    await auditLog({
      action: "DELETE",
      entityType: "DormInsurance",
      entityId: insuranceId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Deleted insurance for student "${insurance?.student.fullNameKu}" (${insurance?.student.studentCode})`,
      oldValues: {
        amountPaid: insurance?.amountPaid,
        status: insurance?.status,
        paymentMethod: insurance?.paymentMethod,
        paidAt: insurance?.paidAt,
      },
    });

    revalidatePath("/admin/insurance");
    return { status: "success" };
  } catch {
    await auditLog({
      action: "DELETE",
      entityType: "DormInsurance",
      entityId: insuranceId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to delete insurance",
    });
    return { error: "کێشەیەک ڕوویدا لە سڕینەوەی بارمتە" };
  }
}
