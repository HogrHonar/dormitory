"use server";

import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  OutgoingPaymentSchema,
  OutgoingPaymentSchemaType,
  RejectOutgoingPaymentSchema,
} from "@/lib/zodSchemas";
import { adminGetAvailableBalance } from "@/app/data/admin/admin-get-outgoing-payments";
import { hasPermission } from "@/lib/has-permission";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function createOutgoingPaymentAction(
  values: OutgoingPaymentSchemaType,
) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("outgoing-payments:create");
  if (!allowed) {
    await auditLog({
      action: "CREATE",
      entityType: "OutgoingPayment",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to create outgoing payment",
    });
    return {
      error: "You do not have permission to create an outgoing payment",
    };
  }

  const parsed = OutgoingPaymentSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "نرخەکان هەڵەن",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { amountToHandOver, note, paymentMethod, periodStart, periodEnd } =
    parsed.data;

  try {
    const availableBalance = await adminGetAvailableBalance();

    if (amountToHandOver > availableBalance) {
      return {
        error: `بڕی دراو زیاترە لە باڵانسی بەردەست (${availableBalance.toLocaleString()} IQD)`,
      };
    }

    const remainingFloat = availableBalance - amountToHandOver;

    const record = await prisma.outgoingPayment.create({
      data: {
        totalCollected: availableBalance,
        amountToHandOver,
        remainingFloat,
        note,
        paymentMethod,
        periodStart: periodStart ? new Date(periodStart) : null,
        periodEnd: periodEnd ? new Date(periodEnd) : null,
        status: "PENDING",
        submittedBy: session?.id as string,
        submittedAt: new Date(),
      },
    });

    await auditLog({
      action: "CREATE",
      entityType: "OutgoingPayment",
      entityId: record.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: "Submitted outgoing payment request",
      newValues: {
        amountToHandOver: record.amountToHandOver,
        totalCollected: record.totalCollected,
        remainingFloat: record.remainingFloat,
        paymentMethod: record.paymentMethod,
        status: "PENDING",
        periodStart: record.periodStart,
        periodEnd: record.periodEnd,
      },
    });

    revalidatePath("/admin/outgoing-payment");
    return { status: "success", data: record };
  } catch {
    await auditLog({
      action: "CREATE",
      entityType: "OutgoingPayment",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to create outgoing payment",
    });
    return { error: "کێشەیەک ڕوویدا لە کاتی تۆمارکردن" };
  }
}

export async function approveOutgoingPaymentAction(id: string) {
  const session = await requireRole(ROLES.SUPER_ADMIN);
  const allowed = await hasPermission("outgoing-payments:update");
  if (!allowed) {
    await auditLog({
      action: "APPROVE",
      entityType: "OutgoingPayment",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to approve outgoing payment",
    });
    return {
      error: "You do not have permission to approve an outgoing payment",
    };
  }

  try {
    const record = await prisma.outgoingPayment.findUnique({ where: { id } });

    if (!record) return { error: "تۆماری نەدۆزرایەوە" };
    if (record.status !== "PENDING")
      return { error: "ئەم داواکارییە پێشتر کارپێکراوە" };

    await prisma.outgoingPayment.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: session.id,
        approvedAt: new Date(),
      },
    });

    await auditLog({
      action: "APPROVE",
      entityType: "OutgoingPayment",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Approved outgoing payment of ${record.amountToHandOver.toLocaleString()} IQD`,
      oldValues: { status: "PENDING" },
      newValues: { status: "APPROVED", approvedAt: new Date() },
    });

    revalidatePath("/admin/outgoing-payment");
    return { status: "success" };
  } catch {
    await auditLog({
      action: "APPROVE",
      entityType: "OutgoingPayment",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to approve outgoing payment",
    });
    return { error: "کێشەیەک ڕوویدا لە کاتی پەسەندکردن" };
  }
}

export async function rejectOutgoingPaymentAction(
  id: string,
  rejectionNote: string,
) {
  const session = await requireRole(ROLES.SUPER_ADMIN);
  const allowed = await hasPermission("outgoing-payments:update");
  if (!allowed) {
    await auditLog({
      action: "REJECT",
      entityType: "OutgoingPayment",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to reject outgoing payment",
    });
    return {
      error: "You do not have permission to reject an outgoing payment",
    };
  }

  const parsed = RejectOutgoingPaymentSchema.safeParse({ id, rejectionNote });
  if (!parsed.success) return { error: "تێبینی پێویستە" };

  try {
    const record = await prisma.outgoingPayment.findUnique({ where: { id } });

    if (!record) return { error: "تۆماری نەدۆزرایەوە" };
    if (record.status !== "PENDING")
      return { error: "ئەم داواکارییە پێشتر کارپێکراوە" };

    await prisma.outgoingPayment.update({
      where: { id },
      data: { status: "REJECTED", approvedBy: session.id, rejectionNote },
    });

    await auditLog({
      action: "REJECT",
      entityType: "OutgoingPayment",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: `Rejected outgoing payment of ${record.amountToHandOver.toLocaleString()} IQD`,
      oldValues: { status: "PENDING" },
      newValues: { status: "REJECTED", rejectionNote },
    });

    revalidatePath("/admin/outgoing-payment");
    return { status: "success" };
  } catch {
    await auditLog({
      action: "REJECT",
      entityType: "OutgoingPayment",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to reject outgoing payment",
    });
    return { error: "کێشەیەک ڕوویدا لە کاتی ڕەتکردنەوە" };
  }
}

export async function deleteOutgoingPaymentAction(id: string) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("outgoing-payments:delete");
  if (!allowed) {
    await auditLog({
      action: "DELETE",
      entityType: "OutgoingPayment",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to delete outgoing payment",
    });
    return {
      error: "You do not have permission to delete an outgoing payment",
    };
  }

  try {
    const record = await prisma.outgoingPayment.findUnique({ where: { id } });

    if (!record) return { error: "تۆماری نەدۆزرایەوە" };
    if (record.status !== "PENDING")
      return { error: "تەنها داواکارییە چاوەڕوانەکان دەکرێت بسڕدرێنەوە" };

    await prisma.outgoingPayment.delete({ where: { id } });

    await auditLog({
      action: "DELETE",
      entityType: "OutgoingPayment",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Deleted pending outgoing payment of ${record.amountToHandOver.toLocaleString()} IQD`,
      oldValues: {
        amountToHandOver: record.amountToHandOver,
        totalCollected: record.totalCollected,
        paymentMethod: record.paymentMethod,
        status: record.status,
        submittedBy: record.submittedBy,
      },
    });

    revalidatePath("/admin/outgoing-payment");
    return { status: "success" };
  } catch {
    await auditLog({
      action: "DELETE",
      entityType: "OutgoingPayment",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to delete outgoing payment",
    });
    return { error: "کێشەیەک ڕوویدا لە کاتی سڕینەوە" };
  }
}
