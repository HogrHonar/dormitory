"use server";

import { DormitorySchemaType, DormitorySchema } from "@/lib/zodSchemas";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/has-permission";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function createDormitoryAction(values: DormitorySchemaType) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("dormitories:create");
  if (!allowed) {
    await auditLog({
      action: "CREATE",
      entityType: "Dormitory",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to create dormitory",
      metadata: { title: values.title },
    });
    return { error: "You do not have permission to create a dormitory" };
  }

  const parsed = DormitorySchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Invalid values",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, managerId, description } = parsed.data;

  try {
    const existingDormitory = await prisma.dormitory.findUnique({
      where: { title },
    });

    if (existingDormitory) {
      return {
        error:
          "بەشەناوخۆیی بەم ناونیشانە پێشتر هەیە (A dormitory with this title already exists)",
      };
    }

    const managerHasDormitory = await prisma.dormitory.findFirst({
      where: { managerId },
    });

    if (managerHasDormitory) {
      return {
        error:
          "ئەم بەڕێوەبەرە پێشتر بەشەناوخۆیی هەیە (This manager already manages a dormitory)",
      };
    }

    const dormitory = await prisma.dormitory.create({
      data: { title, managerId, description },
      include: {
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    await auditLog({
      action: "CREATE",
      entityType: "Dormitory",
      entityId: dormitory.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Created dormitory "${dormitory.title}"`,
      newValues: {
        title: dormitory.title,
        description: dormitory.description,
        manager: dormitory.manager
          ? {
              id: dormitory.manager.id,
              name: dormitory.manager.name,
              email: dormitory.manager.email,
            }
          : null,
      },
    });

    revalidatePath("/admin/dormitory");

    return {
      status: "success",
      message: "Dormitory created successfully",
      data: dormitory,
    };
  } catch {
    await auditLog({
      action: "CREATE",
      entityType: "Dormitory",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to create dormitory",
      metadata: { title },
    });

    return { error: "Failed to create dormitory" };
  }
}

export async function deleteDormitoryAction(dormitoryId: string) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("dormitories:delete");
  if (!allowed) {
    await auditLog({
      action: "DELETE",
      entityType: "Dormitory",
      entityId: dormitoryId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to delete dormitory",
    });
    return { error: "You do not have permission to delete a dormitory" };
  }

  try {
    const dormitory = await prisma.dormitory.findUnique({
      where: { id: dormitoryId },
      include: { manager: { select: { name: true, email: true } } },
    });

    await prisma.dormitory.delete({ where: { id: dormitoryId } });

    await auditLog({
      action: "DELETE",
      entityType: "Dormitory",
      entityId: dormitoryId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Deleted dormitory "${dormitory?.title}"`,
      oldValues: {
        title: dormitory?.title,
        description: dormitory?.description,
        manager: dormitory?.manager ?? null,
      },
    });

    revalidatePath("/admin/dormitory");

    return { status: "success", message: "Dormitory deleted successfully" };
  } catch {
    await auditLog({
      action: "DELETE",
      entityType: "Dormitory",
      entityId: dormitoryId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to delete dormitory",
    });

    return {
      error: "Failed to delete dormitory. It may have associated rooms.",
    };
  }
}
