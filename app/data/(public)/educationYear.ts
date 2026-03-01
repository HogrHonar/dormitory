"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function getEducationYears() {
  return prisma.educationalYear.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function createEducationalYear(name: string) {
  const session = await getCurrentUser();

  try {
    const year = await prisma.educationalYear.create({ data: { name } });

    await auditLog({
      action: "CREATE",
      entityType: "EducationalYear",
      entityId: year.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Created educational year "${year.name}"`,
      newValues: { name: year.name },
    });

    revalidatePath("/admin/settings/academy/educationalyear");
  } catch {
    await auditLog({
      action: "CREATE",
      entityType: "EducationalYear",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to create educational year",
      metadata: { name },
    });
    throw new Error("Failed to create educational year");
  }
}

export async function updateEducationalYear(id: string, name: string) {
  const session = await getCurrentUser();

  try {
    const old = await prisma.educationalYear.findUnique({ where: { id } });

    const updated = await prisma.educationalYear.update({
      where: { id },
      data: { name },
    });

    await auditLog({
      action: "UPDATE",
      entityType: "EducationalYear",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Updated educational year "${old?.name}" → "${updated.name}"`,
      oldValues: { name: old?.name },
      newValues: { name: updated.name },
    });

    revalidatePath("/admin/settings/academy/educationalyear");
  } catch {
    await auditLog({
      action: "UPDATE",
      entityType: "EducationalYear",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to update educational year",
    });
    throw new Error("Failed to update educational year");
  }
}

export async function deleteEducationalYear(id: string) {
  const session = await getCurrentUser();

  try {
    const year = await prisma.educationalYear.findUnique({ where: { id } });

    await prisma.educationalYear.delete({ where: { id } });

    await auditLog({
      action: "DELETE",
      entityType: "EducationalYear",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Deleted educational year "${year?.name}"`,
      oldValues: { name: year?.name },
    });

    revalidatePath("/admin/settings/academy/educationalyear");
  } catch {
    await auditLog({
      action: "DELETE",
      entityType: "EducationalYear",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to delete educational year",
    });
    throw new Error("Failed to delete educational year");
  }
}
