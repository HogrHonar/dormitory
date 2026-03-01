"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function AdminGetCategories() {
  try {
    return await prisma.category.findMany({
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createCategory(name: string) {
  const session = await getCurrentUser();

  try {
    const category = await prisma.category.create({ data: { name } });

    await auditLog({
      action: "CREATE",
      entityType: "Category",
      entityId: category.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Created category "${category.name}"`,
      newValues: { name: category.name },
    });

    revalidatePath("/admin/categories");
    return category;
  } catch (error) {
    console.error(error);
    await auditLog({
      action: "CREATE",
      entityType: "Category",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to create category",
      metadata: { name },
    });
    return null;
  }
}

export async function updateCategory(id: string, name: string) {
  const session = await getCurrentUser();

  try {
    const old = await prisma.category.findUnique({ where: { id } });
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });

    await auditLog({
      action: "UPDATE",
      entityType: "Category",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Updated category "${old?.name}" → "${category.name}"`,
      oldValues: { name: old?.name },
      newValues: { name: category.name },
    });

    revalidatePath("/admin/categories");
    return category;
  } catch (error) {
    console.error(error);
    await auditLog({
      action: "UPDATE",
      entityType: "Category",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to update category",
    });
    return null;
  }
}

export async function deleteCategory(id: string) {
  const session = await getCurrentUser();

  try {
    const old = await prisma.category.findUnique({ where: { id } });
    const category = await prisma.category.delete({ where: { id } });

    await auditLog({
      action: "DELETE",
      entityType: "Category",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Deleted category "${old?.name}"`,
      oldValues: { name: old?.name },
    });

    revalidatePath("/admin/categories");
    return category;
  } catch (error) {
    console.error(error);
    await auditLog({
      action: "DELETE",
      entityType: "Category",
      entityId: id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to delete category",
    });
    return null;
  }
}
