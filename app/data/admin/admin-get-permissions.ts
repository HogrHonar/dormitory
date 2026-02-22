import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const adminGetAllPermissions = cache(async () => {
  return prisma.permission.findMany({
    orderBy: { name: "asc" },
  });
});
