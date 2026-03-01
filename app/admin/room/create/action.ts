"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RoomSchemaType, RoomSchema } from "@/lib/zodSchemas";
import { hasPermission } from "@/lib/has-permission";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function createRoomAction(values: RoomSchemaType) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("rooms:create");
  if (!allowed) {
    await auditLog({
      action: "CREATE",
      entityType: "Room",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to create room",
    });
    return { error: "You do not have permission to create a room" };
  }

  const parsed = RoomSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Invalid values",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { dormId, floorNumber, roomNumber, capacity } = parsed.data;

  try {
    const existingRoom = await prisma.room.findFirst({
      where: { dormId, floorNumber, roomNumber },
    });

    if (existingRoom) {
      return {
        error:
          "ژوورێک بەم ژمارەیە لەم نهۆمە پێشتر هەیە (A room with this number already exists on this floor)",
      };
    }

    const dormitory = await prisma.dormitory.findUnique({
      where: { id: dormId },
    });
    if (!dormitory) {
      return { error: "نوێخانە نەدۆزرایەوە (Dormitory not found)" };
    }

    const room = await prisma.room.create({
      data: { dormId, floorNumber, roomNumber, capacity },
      include: { dormitory: { select: { id: true, title: true } } },
    });

    await auditLog({
      action: "CREATE",
      entityType: "Room",
      entityId: room.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Created room ${floorNumber}-${roomNumber} in "${dormitory.title}"`,
      newValues: {
        floorNumber: room.floorNumber,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        dormitory: room.dormitory.title,
      },
    });

    revalidatePath("/admin/room");
    return {
      status: "success",
      message: "Room created successfully",
      data: room,
    };
  } catch {
    await auditLog({
      action: "CREATE",
      entityType: "Room",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to create room",
      metadata: { dormId, floorNumber, roomNumber },
    });
    return { error: "Failed to create room" };
  }
}

export async function deleteRoomAction(roomId: string) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("rooms:delete");
  if (!allowed) {
    await auditLog({
      action: "DELETE",
      entityType: "Room",
      entityId: roomId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to delete room",
    });
    return { error: "You do not have permission to delete a room" };
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { dormitory: { select: { title: true } } },
    });

    await prisma.room.delete({ where: { id: roomId } });

    await auditLog({
      action: "DELETE",
      entityType: "Room",
      entityId: roomId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Deleted room ${room?.floorNumber}-${room?.roomNumber} in "${room?.dormitory.title}"`,
      oldValues: {
        floorNumber: room?.floorNumber,
        roomNumber: room?.roomNumber,
        capacity: room?.capacity,
        dormitory: room?.dormitory.title,
      },
    });

    revalidatePath("/admin/room");
    return { status: "success", message: "Room deleted successfully" };
  } catch {
    await auditLog({
      action: "DELETE",
      entityType: "Room",
      entityId: roomId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to delete room",
    });
    return { error: "Failed to delete room" };
  }
}
