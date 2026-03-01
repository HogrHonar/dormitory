// lib/audit.ts
"server-only";

import { prisma } from "@/lib/prisma";
import { AuditAction, LogSeverity } from "@/app/generated/prisma/client";
import { headers } from "next/headers";

interface AuditOptions {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  oldValues?: object;
  newValues?: object;
  metadata?: object;
  description?: string;
  severity?: LogSeverity;
}

export async function auditLog(options: AuditOptions) {
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? null;
  const userAgent = headersList.get("user-agent") ?? null;
  const requestId = headersList.get("x-request-id") ?? crypto.randomUUID();

  await prisma.auditLog.create({
    data: {
      ...options,
      oldValues: options.oldValues ?? undefined,
      newValues: options.newValues ?? undefined,
      metadata: options.metadata ?? undefined,
      ipAddress,
      userAgent,
      requestId,
    },
  });
}
