"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RoomSchemaType, RoomSchema } from "@/lib/zodSchemas";
import { hasPermission } from "@/lib/has-permission";

export async function createRoomAction(values: RoomSchemaType) {
  const allowed = await hasPermission("rooms:create");
  if (!allowed) return { error: "You do not have permission to create a room" };

  const parsed = RoomSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Invalid values",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const { dormId, floorNumber, roomNumber, capacity } = parsed.data;

  try {
    // Check if room with same dormId, floorNumber, and roomNumber already exists
    const existingRoom = await prisma.room.findFirst({
      where: {
        dormId,
        floorNumber,
        roomNumber,
      },
    });

    if (existingRoom) {
      return {
        error:
          "ژوورێک بەم ژمارەیە لەم نهۆمە پێشتر هەیە (A room with this number already exists on this floor)",
      };
    }

    // Verify dormitory exists
    const dormitory = await prisma.dormitory.findUnique({
      where: { id: dormId },
    });

    if (!dormitory) {
      return {
        error: "نوێخانە نەدۆزرایەوە (Dormitory not found)",
      };
    }

    const room = await prisma.room.create({
      data: {
        dormId,
        floorNumber,
        roomNumber,
        capacity,
      },
      include: {
        dormitory: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    revalidatePath("/admin/room");

    return {
      status: "success",
      message: "Room created successfully",
      data: room,
    };
  } catch {
    return {
      error: `Failed to create room`,
    };
  }
}

export async function deleteRoomAction(roomId: string) {
  const allowed = await hasPermission("rooms:delete");
  if (!allowed) return { error: "You do not have permission to delete a room" };

  try {
    await prisma.room.delete({
      where: {
        id: roomId,
      },
    });

    revalidatePath("/admin/room");

    return {
      status: "success",
      message: "Room deleted successfully",
    };
  } catch {
    return {
      error: `Failed to delete room`,
    };
  }
}
