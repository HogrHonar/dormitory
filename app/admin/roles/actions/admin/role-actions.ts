"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

import { z } from "zod";

// ─── Validation Schemas ────────────────────────────────────────────────────

const roleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/),
  description: z.string().max(255).optional(),
});

// ─── Create Role ───────────────────────────────────────────────────────────

export async function createRoleAction(input: unknown) {
  await requireRole(ROLES.SUPER_ADMIN);

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { name, description } = parsed.data;

  try {
    await prisma.role.create({
      data: { name: name.toUpperCase(), description },
    });
    revalidatePath("/admin/roles");
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Role name already exists" };
    return { error: "Failed to create role" };
  }
}

// ─── Update Role ───────────────────────────────────────────────────────────

export async function updateRoleAction(id: string, input: unknown) {
  await requireRole(ROLES.SUPER_ADMIN);

  if (!id || typeof id !== "string") return { error: "Invalid role ID" };

  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { name, description } = parsed.data;

  try {
    await prisma.role.update({
      where: { id },
      data: { name: name.toUpperCase(), description },
    });
    revalidatePath("/admin/roles");
  } catch (e: any) {
    if (e?.code === "P2002") return { error: "Role name already exists" };
    if (e?.code === "P2025") return { error: "Role not found" };
    return { error: "Failed to update role" };
  }
}

// ─── Delete Role ───────────────────────────────────────────────────────────

export async function deleteRoleAction(id: string) {
  await requireRole(ROLES.SUPER_ADMIN);

  if (!id || typeof id !== "string") return { error: "Invalid role ID" };

  // Prevent deleting built-in roles
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return { error: "Role not found" };
  if (Object.values(ROLES).includes(role.name as any)) {
    return { error: "Cannot delete a built-in role" };
  }

  try {
    await prisma.role.delete({ where: { id } });
    revalidatePath("/admin/roles");
  } catch {
    return { error: "Failed to delete role" };
  }
}

// ─── Set Role Permissions (atomic replace) ────────────────────────────────

const setPermissionsSchema = z.object({
  roleId: z.string().min(1),
  permissionIds: z.array(z.string()).max(500),
});

export async function setRolePermissionsAction(
  roleId: string,
  permissionIds: string[],
) {
  await requireRole(ROLES.SUPER_ADMIN);

  const parsed = setPermissionsSchema.safeParse({ roleId, permissionIds });
  if (!parsed.success) return { error: "Invalid input" };

  // Verify role exists
  const role = await prisma.role.findUnique({
    where: { id: parsed.data.roleId },
  });
  if (!role) return { error: "Role not found" };

  // Verify all permissionIds actually exist (prevent phantom IDs)
  const existingPerms = await prisma.permission.findMany({
    where: { id: { in: parsed.data.permissionIds } },
    select: { id: true },
  });
  const validIds = new Set(existingPerms.map((p) => p.id));
  const allValid = parsed.data.permissionIds.every((id) => validIds.has(id));
  if (!allValid) return { error: "One or more permissions are invalid" };

  try {
    // Atomic: delete all then insert new
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

    revalidatePath(`/admin/roles/${parsed.data.roleId}/permissions`);
    revalidatePath("/admin/roles");
  } catch {
    return { error: "Failed to update permissions" };
  }
}
