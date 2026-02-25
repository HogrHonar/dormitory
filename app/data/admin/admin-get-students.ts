"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export type StudentsProps = {
  id: string;
  studentCode: string;
  fullNameEn: string;
  fullNameKu: string;
  mobileNo: string;
  mobileNo2: string;
  gender: string;
  department: {
    name: string;
  };
  floorNo: number;
  roomNo: number;
  email: string;
  entranceYear: {
    name: string;
  };
};

type Filters = {
  fullNameKu?: string;
  mobileNo?: string;
  department?: string;
  floorNo?: string | number;
  roomNo?: string | number;
  entranceYear?: {
    name?: string;
  };
  dormitoryId?: string;
  isActive?: boolean;
};

export async function adminGetStudents(
  filters: Filters,
  page: number,
  pageSize: number,
  currentUserId: string,
) {
  let dormitoryScope = {};

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true }, // 👈 select role field
  });

  if (user?.role?.name !== "SUPER_ADMIN") {
    const dormitory = await prisma.dormitory.findFirst({
      where: { managerId: currentUserId },
      select: { id: true },
    });

    dormitoryScope = dormitory
      ? {
          room: {
            dormId: dormitory.id,
          },
        }
      : {};
  }

  const where: Prisma.StudentWhereInput = {
    ...dormitoryScope,
    // Filter by student name
    ...(filters?.fullNameKu && {
      fullNameKu: {
        contains: filters.fullNameKu,
        mode: Prisma.QueryMode.insensitive,
      },
    }),

    // Filter by mobile number
    ...(filters?.mobileNo && {
      mobileNo: {
        contains: filters.mobileNo,
      },
    }),

    // Filter by department
    ...(filters?.department &&
      filters.department !== "all" && {
        department: {
          name: filters.department,
        },
      }),

    // Filter by entrance year
    ...(filters?.entranceYear &&
      filters.entranceYear.name &&
      filters.entranceYear.name !== "all" && {
        entranceYear: {
          name: {
            equals: filters.entranceYear.name,
          },
        },
      }),

    // Filter by active status
    ...(filters?.isActive !== undefined && {
      isActive: filters.isActive,
    }),

    // Filter by room's floor number
    ...(filters?.floorNo &&
      filters.floorNo !== "all" && {
        room: {
          floorNumber: Number(filters.floorNo),
        },
      }),

    // Filter by room number
    ...(filters?.roomNo &&
      filters.roomNo !== "all" && {
        room: {
          roomNumber: Number(filters.roomNo),
        },
      }),

    ...(filters?.dormitoryId && { room: { dormId: filters.dormitoryId } }),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        entranceYear: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(page &&
        pageSize && {
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
    }),
    prisma.student.count({ where }),
  ]);

  const data: StudentsProps[] = students.map((student) => ({
    id: student.id,
    studentCode: student.studentCode,
    fullNameEn: student.fullNameEn,
    fullNameKu: student.fullNameKu,
    mobileNo: student.mobileNo,
    mobileNo2: student.mobileNo2 ?? "",
    gender: student.gender,
    email: student.email,
    department: {
      name: student.department.name,
    },
    entranceYear: {
      name: student.entranceYear.name,
    },
    floorNo: student.room?.floorNumber ?? 0, // or maybe null? We'll keep as 0 if no room
    roomNo: student.room?.roomNumber ?? 0,
  }));

  return { data, total, page, pageSize };
}

/**
 * Get students with specific room assignment status
 */
export async function adminGetStudentsByRoomStatus(
  hasRoom: boolean,
  page: number = 1,
  pageSize: number = 10,
) {
  const where: Prisma.StudentWhereInput = {
    roomId: hasRoom ? { not: null } : null,
  };

  const [data, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        entranceYear: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            floorNumber: true,
            dormitory: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

/**
 * Get students by specific room
 */
export async function adminGetStudentsByRoom(roomId: string) {
  const students = await prisma.student.findMany({
    where: {
      roomId,
    },
    include: {
      department: {
        select: {
          name: true,
        },
      },
      entranceYear: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      fullNameKu: "asc",
    },
  });

  return students;
}

/**
 * Get students by dormitory
 */
export async function adminGetStudentsByDormitory(dormitoryId: string) {
  const students = await prisma.student.findMany({
    where: {
      room: {
        dormId: dormitoryId,
      },
    },
    include: {
      department: {
        select: {
          name: true,
        },
      },
      entranceYear: {
        select: {
          name: true,
        },
      },
      room: {
        select: {
          roomNumber: true,
          floorNumber: true,
        },
      },
    },
    orderBy: [
      {
        room: {
          floorNumber: "asc",
        },
      },
      {
        room: {
          roomNumber: "asc",
        },
      },
      {
        fullNameKu: "asc",
      },
    ],
  });

  return students;
}

/**
 * Get students statistics
 */
export async function getStudentsStats() {
  const [
    totalStudents,
    activeStudents,
    studentsWithRoom,
    studentsWithoutRoom,
    studentsByDepartment,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { isActive: true } }),
    prisma.student.count({ where: { roomId: { not: null } } }),
    prisma.student.count({ where: { roomId: null } }),
    prisma.student.groupBy({
      by: ["departmentId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    }),
  ]);

  return {
    totalStudents,
    activeStudents,
    inactiveStudents: totalStudents - activeStudents,
    studentsWithRoom,
    studentsWithoutRoom,
    studentsByDepartment,
  };
}
