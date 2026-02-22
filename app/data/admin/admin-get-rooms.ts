import { prisma } from "@/lib/prisma";

export async function adminGetRooms() {
  try {
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        floorNumber: true,
        roomNumber: true,
        capacity: true,
        createdAt: true,
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

    return rooms;
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return [];
  }
}
