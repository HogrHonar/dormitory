import { prisma } from "@/lib/prisma";

export async function adminGetAuditLogs() {
  return await prisma.auditLog.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}

export type AuditLogRow = Awaited<ReturnType<typeof adminGetAuditLogs>>[0];
