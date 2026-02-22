import { prisma } from "@/lib/prisma";

import { cache } from "react";

export const adminGetRoles = cache(async () => {
  return prisma.role.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { users: true, permissions: true },
      },
    },
  });
});

export const adminGetAllRoles = cache(async () => {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
});

export const adminGetRoleById = cache(async (id?: string) => {
  if (!id) return null;

  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });
});
