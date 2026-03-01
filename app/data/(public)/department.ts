"use server";

import { prisma } from "@/lib/prisma";
import { DepartmentSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function getDepartments() {
  return await prisma.department.findMany({
    select: { id: true, name: true, code: true },
  });
}

export type Department = Awaited<ReturnType<typeof getDepartments>>[0];

export async function createDepartment(data: DepartmentSchemaType) {
  const session = await getCurrentUser();

  try {
    const department = await prisma.department.create({ data });

    await auditLog({
      action: "CREATE",
      entityType: "Department",
      entityId: department.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Created department "${department.name}" (${department.code})`,
      newValues: { name: department.name, code: department.code },
    });

    revalidatePath("/admin/settings/instittue/departments");
  } catch {
    await auditLog({
      action: "CREATE",
      entityType: "Department",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to create department",
      metadata: { name: data.name, code: data.code },
    });
    throw new Error("Failed to create department");
  }
}

export async function deleteDepartment(id: string) {
  const session = await getCurrentUser();

  try {
    const department = await prisma.department.findUnique({ where: { id } });

    await prisma.department.delete({ where: { id } });

    await auditLog({
      action: "DELETE",
      entityType: "Department",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Deleted department "${department?.name}" (${department?.code})`,
      oldValues: { name: department?.name, code: department?.code },
    });

    revalidatePath("/admin/settings/instittue/departments");
  } catch {
    await auditLog({
      action: "DELETE",
      entityType: "Department",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to delete department",
    });
    throw new Error("Failed to delete department");
  }
}

export async function updateDepartment(id: string, code: string, name: string) {
  const session = await getCurrentUser();

  try {
    const old = await prisma.department.findUnique({ where: { id } });

    const updated = await prisma.department.update({
      where: { id },
      data: { code, name },
    });

    await auditLog({
      action: "UPDATE",
      entityType: "Department",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Updated department "${updated.name}" (${updated.code})`,
      oldValues: { name: old?.name, code: old?.code },
      newValues: { name: updated.name, code: updated.code },
    });

    revalidatePath("/admin/settings/instittue/departments");
  } catch {
    await auditLog({
      action: "UPDATE",
      entityType: "Department",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to update department",
    });
    throw new Error("Failed to update department");
  }
}
