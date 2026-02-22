import { prisma } from "@/lib/prisma";

/**
 * Get all users who can be dormitory managers
 * You can filter by role if needed (e.g., only MANAGER role)
 */
export async function getManagerUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        // Option 1: Filter by specific role
        // role: "MANAGER", // Uncomment if you have a MANAGER role
        // Option 2: Exclude certain roles
        // role: { notIn: ["STUDENT", "PARENT"] },
        // Option 3: Get all users (if any user can be a manager)
        // No where clause needed
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name || user.email, // Fallback to email if name is null
    }));
  } catch (error) {
    console.error("Failed to fetch manager users:", error);
    return [];
  }
}

/**
 * Get users who are NOT yet managing any dormitory
 * Useful for preventing duplicate manager assignments
 */
export async function getAvailableManagerUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        managedDormitories: { none: {} }, // Only users who don't manage a dormitory
        // Add role filter if needed:
        // role: "MANAGER",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name || user.email,
    }));
  } catch (error) {
    console.error("Failed to fetch available manager users:", error);
    return [];
  }
}
