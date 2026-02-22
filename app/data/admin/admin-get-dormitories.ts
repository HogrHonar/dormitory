import { prisma } from "@/lib/prisma";

export async function adminGetDormitories() {
  try {
    const dormitories = await prisma.dormitory.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return dormitories;
  } catch (error) {
    console.error("Failed to fetch dormitories:", error);
    return [];
  }
}

/**
 * Get all dormitories for dropdown selection
 */
export async function getDormitories() {
  try {
    const dormitories = await prisma.dormitory.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    return dormitories;
  } catch (error) {
    console.error("Failed to fetch dormitories:", error);
    return [];
  }
}

/**
 * Get a single dormitory by ID
 */
export async function getDormitoryById(id: string) {
  try {
    const dormitory = await prisma.dormitory.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return dormitory;
  } catch (error) {
    console.error("Failed to fetch dormitory:", error);
    return null;
  }
}

export type AdminDormitoryRow = Awaited<
  ReturnType<typeof adminGetDormitories>
>[number];
