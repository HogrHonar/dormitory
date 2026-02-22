"use server";

import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RoomSchemaType, RoomSchema } from "@/lib/zodSchemas";

export async function createRoomAction(values: RoomSchemaType) {
  const session = await requireRole(ROLES.ADMIN);
  if (!session) return { error: "Unauthorized" };

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
  const session = await requireRole(ROLES.ADMIN);
  if (!session) return { error: "Unauthorized" };

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
