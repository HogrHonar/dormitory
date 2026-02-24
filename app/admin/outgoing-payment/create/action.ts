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

// Accountant submits a new outgoing payment request
export async function createOutgoingPaymentAction(
  values: OutgoingPaymentSchemaType,
) {
  const allowed = await hasPermission("outgoing-payments:create");
  const session = await getCurrentUser();
  if (!allowed)
    return {
      error: "You do not have permission to create an outgoing payment",
    };

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
    // Always recompute balance server-side — never trust the client
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

    revalidatePath("/admin/outgoing-payment");

    return { status: "success", data: record };
  } catch {
    return { error: "کێشەیەک ڕوویدا لە کاتی تۆمارکردن" };
  }
}

// Admin approves a pending outgoing payment
export async function approveOutgoingPaymentAction(id: string) {
  const allowed = await hasPermission("outgoing-payments:update");
  const session = await requireRole(ROLES.SUPER_ADMIN);
  if (!allowed)
    return {
      error: "You do not have permission to approve an outgoing payment",
    };

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

    revalidatePath("/admin/outgoing-payment");

    return { status: "success" };
  } catch {
    return { error: "کێشەیەک ڕوویدا لە کاتی پەسەندکردن" };
  }
}

// Admin rejects a pending outgoing payment
export async function rejectOutgoingPaymentAction(
  id: string,
  rejectionNote: string,
) {
  const allowed = await hasPermission("outgoing-payments:update");
  const session = await requireRole(ROLES.SUPER_ADMIN);
  if (!allowed)
    return {
      error: "You do not have permission to reject an outgoing payment",
    };

  const parsed = RejectOutgoingPaymentSchema.safeParse({ id, rejectionNote });
  if (!parsed.success) return { error: "تێبینی پێویستە" };

  try {
    const record = await prisma.outgoingPayment.findUnique({ where: { id } });

    if (!record) return { error: "تۆماری نەدۆزرایەوە" };
    if (record.status !== "PENDING")
      return { error: "ئەم داواکارییە پێشتر کارپێکراوە" };

    await prisma.outgoingPayment.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedBy: session.id,
      },
    });

    revalidatePath("/admin/outgoing-payment");

    return { status: "success" };
  } catch {
    return { error: "کێشەیەک ڕوویدا لە کاتی ڕەتکردنەوە" };
  }
}

// Delete a PENDING outgoing payment (accountant can cancel their own submission)
export async function deleteOutgoingPaymentAction(id: string) {
  const allowed = await hasPermission("outgoing-payments:delete");
  if (!allowed)
    return {
      error: "You do not have permission to delete an outgoing payment",
    };

  try {
    const record = await prisma.outgoingPayment.findUnique({ where: { id } });

    if (!record) return { error: "تۆماری نەدۆزرایەوە" };
    if (record.status !== "PENDING")
      return { error: "تەنها داواکارییە چاوەڕوانەکان دەکرێت بسڕدرێنەوە" };

    await prisma.outgoingPayment.delete({ where: { id } });

    revalidatePath("/admin/outgoing-payment");

    return { status: "success" };
  } catch {
    return { error: "کێشەیەک ڕوویدا لە کاتی سڕینەوە" };
  }
}
