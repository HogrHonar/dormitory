import { prisma } from "@/lib/prisma";

/**
 * Get all rooms that have available capacity for new students
 */
export async function getAvailableRooms() {
  try {
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        roomNumber: true,
        floorNumber: true,
        capacity: true,
        dormitory: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: [
        {
          dormitory: {
            title: "asc",
          },
        },
        {
          floorNumber: "asc",
        },
        {
          roomNumber: "asc",
        },
      ],
    });

    // Filter rooms that are not full and add current occupancy
    return rooms
      .filter((room) => room._count.students < room.capacity)
      .map((room) => ({
        id: room.id,
        roomNumber: room.roomNumber,
        floorNumber: room.floorNumber,
        capacity: room.capacity,
        currentOccupancy: room._count.students,
        dormitory: {
          title: room.dormitory.title,
        },
      }));
  } catch (error) {
    console.error("Failed to fetch available rooms:", error);
    return [];
  }
}

/**
 * Get room details by ID
 */
export async function getRoomById(id: string) {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        dormitory: {
          select: {
            id: true,
            title: true,
          },
        },
        students: {
          select: {
            id: true,
            studentCode: true,
            fullNameKu: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return room;
  } catch (error) {
    console.error("Failed to fetch room:", error);
    return null;
  }
}

/**
 * Check if a room has available capacity
 */
export async function isRoomAvailable(roomId: string): Promise<boolean> {
  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        capacity: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!room) return false;

    return room._count.students < room.capacity;
  } catch (error) {
    console.error("Failed to check room availability:", error);
    return false;
  }
}
