"use server";

import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  CreateInsuranceSchema,
  ReturnInsuranceSchema,
  CreateInsuranceSchemaType,
  ReturnInsuranceSchemaType,
} from "@/lib/zodSchemas";

export async function createInsuranceAction(values: CreateInsuranceSchemaType) {
  const session = await requireRole(ROLES.ADMIN);
  if (!session) return { error: "Unauthorized" };

  const parsed = CreateInsuranceSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "نرخەکان دروست نین",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { studentId, amountPaid, paymentMethod, paidAt } = parsed.data;

  try {
    // Check student exists and is in a dormitory
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, roomId: true, fullNameKu: true },
    });

    if (!student) {
      return { error: "فێرخواز نەدۆزرایەوە" };
    }

    if (!student.roomId) {
      return {
        error: "فێرخواز تا ئێستا تۆمارکراو لە نوێخانەدا نییە",
      };
    }

    // Check if student already has an active insurance
    const existing = await prisma.dormInsurance.findFirst({
      where: { studentId, status: "ACTIVE" },
    });

    if (existing) {
      return {
        error: "فێرخواز پێشتر بارمتەی چالاکی هەیە",
      };
    }

    await prisma.dormInsurance.create({
      data: {
        studentId,
        amountPaid,
        paymentMethod,
        status: "ACTIVE",
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
    });

    revalidatePath("/admin/insurance");

    return { status: "success", message: "بارمتە بە سەرکەوتوویی زیادکرا" };
  } catch {
    return { error: "کێشەیەک ڕوویدا لە زیادکردنی بارمتە" };
  }
}

// ─── Return Insurance ────────────────────────────────────────────────────────

export async function returnInsuranceAction(
  insuranceId: string,
  values: ReturnInsuranceSchemaType,
) {
  const session = await requireRole(ROLES.ADMIN);
  if (!session) return { error: "Unauthorized" };

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
    });

    if (!insurance) return { error: "بارمتە نەدۆزرایەوە" };
    if (insurance.status !== "ACTIVE") {
      return { error: "بارمتەکە چالاک نییە" };
    }

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

    revalidatePath("/admin/insurance");

    return { status: "success", message: "بارمتە بە سەرکەوتوویی گەڕایەوە" };
  } catch {
    return { error: "کێشەیەک ڕوویدا لە گەڕاندنەوەی بارمتە" };
  }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteInsuranceAction(insuranceId: string) {
  const session = await requireRole(ROLES.ADMIN);
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.dormInsurance.delete({ where: { id: insuranceId } });
    revalidatePath("/admin/insurance");
    return { status: "success" };
  } catch {
    return { error: "کێشەیەک ڕوویدا لە سڕینەوەی بارمتە" };
  }
}
