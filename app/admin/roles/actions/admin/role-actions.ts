"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { z } from "zod";

const roleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/),
  description: z.string().max(255).optional(),
});

export async function createRoleAction(input: unknown) {
  const session = await requireRole(ROLES.SUPER_ADMIN);

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { name, description } = parsed.data;

  try {
    const role = await prisma.role.create({
      data: { name: name.toUpperCase(), description },
    });

    await auditLog({
      action: "CREATE",
      entityType: "Role",
      entityId: role.id,
      userId: session.id,
      userEmail: session.email,
      userRole: session.role?.name,
      description: `Created role "${role.name}"`,
      newValues: { name: role.name, description: role.description },
    });

    revalidatePath("/admin/roles");
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Role name already exists" };
    await auditLog({
      action: "CREATE",
      entityType: "Role",
      userId: session.id,
      userEmail: session.email,
      userRole: session.role?.name,
      severity: "ERROR",
      description: "Failed to create role",
      metadata: { name: name.toUpperCase() },
    });
    return { error: "Failed to create role" };
  }
}

export async function updateRoleAction(id: string, input: unknown) {
  const session = await requireRole(ROLES.SUPER_ADMIN);

  if (!id || typeof id !== "string") return { error: "Invalid role ID" };

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { name, description } = parsed.data;

  try {
    const old = await prisma.role.findUnique({ where: { id } });
    const updated = await prisma.role.update({
      where: { id },
      data: { name: name.toUpperCase(), description },
    });

    await auditLog({
      action: "UPDATE",
      entityType: "Role",
      entityId: id,
      userId: session.id,
      userEmail: session.email,
      userRole: session.role?.name,
      description: `Updated role "${updated.name}"`,
      oldValues: { name: old?.name, description: old?.description },
      newValues: { name: updated.name, description: updated.description },
    });

    revalidatePath("/admin/roles");
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Role name already exists" };
    if (e?.code === "P2025") return { error: "Role not found" };
    await auditLog({
      action: "UPDATE",
      entityType: "Role",
      entityId: id,
      userId: session.id,
      userEmail: session.email,
      userRole: session.role?.name,
      severity: "ERROR",
      description: "Failed to update role",
    });
    return { error: "Failed to update role" };
  }
}

export async function deleteRoleAction(id: string) {
  const session = await requireRole(ROLES.SUPER_ADMIN);

  if (!id || typeof id !== "string") return { error: "Invalid role ID" };

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return { error: "Role not found" };
  if (Object.values(ROLES).includes(role.name as any)) {
    await auditLog({
      action: "DELETE",
      entityType: "Role",
      entityId: id,
      userId: session.id,
      userEmail: session.email,
      userRole: session.role?.name,
      severity: "WARNING",
      description: `Attempted to delete built-in role "${role.name}"`,
    });
    return { error: "Cannot delete a built-in role" };
  }

  try {
    await prisma.role.delete({ where: { id } });

    await auditLog({
      action: "DELETE",
      entityType: "Role",
      entityId: id,
      userId: session.id,
      userEmail: session.email,
      userRole: session.role?.name,
      description: `Deleted role "${role.name}"`,
      oldValues: { name: role.name, description: role.description },
    });

    revalidatePath("/admin/roles");
  } catch {
    await auditLog({
      action: "DELETE",
      entityType: "Role",
      entityId: id,
      userId: session.id,
      userEmail: session.email,
      userRole: session.role?.name,
      severity: "ERROR",
      description: `Failed to delete role "${role.name}"`,
    });
    return { error: "Failed to delete role" };
  }
}

const setPermissionsSchema = z.object({
  roleId: z.string().min(1),
  permissionIds: z.array(z.string()).max(500),
});

export async function setRolePermissionsAction(
  roleId: string,
  permissionIds: string[],
) {
  const session = await requireRole(ROLES.SUPER_ADMIN);

  const parsed = setPermissionsSchema.safeParse({ roleId, permissionIds });
  if (!parsed.success) return { error: "Invalid input" };

  const role = await prisma.role.findUnique({
    where: { id: parsed.data.roleId },
  });
  if (!role) return { error: "Role not found" };

  const existingPerms = await prisma.permission.findMany({
    where: { id: { in: parsed.data.permissionIds } },
    select: { id: true, name: true },
  });
  const validIds = new Set(existingPerms.map((p) => p.id));
  const allValid = parsed.data.permissionIds.every((id) => validIds.has(id));
  if (!allValid) return { error: "One or more permissions are invalid" };

  // Capture old permissions for audit
  const oldPerms = await prisma.rolePermission.findMany({
    where: { roleId: parsed.data.roleId },
    include: { permission: { select: { name: true } } },
  });

  try {
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: { roleId: parsed.data.roleId },
      }),
      prisma.rolePermission.createMany({
        data: parsed.data.permissionIds.map((permissionId) => ({
          roleId: parsed.data.roleId,
          permissionId,
        })),
        skipDuplicates: true,
      }),
    ]);

    await auditLog({
      action: "ASSIGN_ROLE",
      entityType: "RolePermission",
      entityId: roleId,
      userId: session.id,
      userEmail: session.email,
      userRole: session.role?.name,
      description: `Updated permissions for role "${role.name}"`,
      oldValues: { permissions: oldPerms.map((p) => p.permission.name) },
      newValues: { permissions: existingPerms.map((p) => p.name) },
    });

    revalidatePath(`/admin/roles/${parsed.data.roleId}/permissions`);
    revalidatePath("/admin/roles");
  } catch {
    await auditLog({
      action: "ASSIGN_ROLE",
      entityType: "RolePermission",
      entityId: roleId,
      userId: session.id,
      userEmail: session.email,
      userRole: session.role?.name,
      severity: "ERROR",
      description: `Failed to update permissions for role "${role.name}"`,
    });
    return { error: "Failed to update permissions" };
  }
}
