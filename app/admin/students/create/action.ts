"use server";

import { prisma } from "@/lib/prisma";
import { StudentSchema, StudentSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/has-permission";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function createStudentAction(values: StudentSchemaType) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("students:create");
  if (!allowed) {
    await auditLog({
      action: "CREATE",
      entityType: "Student",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: "Unauthorized attempt to create student",
      severity: "WARNING",
      metadata: { studentCode: values.studentCode },
    });
    return { error: "You do not have permission to create a student" };
  }

  const parsed = StudentSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Invalid values",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const validatedValues = parsed.data;

  try {
    const existingStudent = await prisma.student.findUnique({
      where: { studentCode: validatedValues.studentCode },
    });

    if (existingStudent) {
      return {
        error:
          "فێرخوازێک بەم کۆدە پێشتر هەیە (Student with this code already exists)",
      };
    }

    const department = await prisma.department.findUnique({
      where: { id: validatedValues.departmentId },
    });

    if (!department) {
      return { error: "بەشی دیاریکراو بوونی نییە (Invalid department)" };
    }

    const entranceYear = await prisma.educationalYear.findUnique({
      where: { id: validatedValues.entranceYearId },
    });

    if (!entranceYear) {
      return {
        error: "ساڵی خوێندنی دیاریکراو بوونی نییە (Invalid entrance year)",
      };
    }

    if (validatedValues.roomId && validatedValues.roomId !== "none") {
      const room = await prisma.room.findUnique({
        where: { id: validatedValues.roomId },
        include: { _count: { select: { students: true } } },
      });

      if (!room) {
        return { error: "ژووری دیاریکراو بوونی نییە (Invalid room)" };
      }

      if (room._count.students >= room.capacity) {
        return { error: "ژوورەکە تێچووە (Room is full)" };
      }
    }

    const student = await prisma.student.create({
      data: {
        studentCode: validatedValues.studentCode,
        fullNameEn: validatedValues.fullNameEn,
        fullNameKu: validatedValues.fullNameKu,
        mobileNo: validatedValues.mobileNo,
        mobileNo2: validatedValues.mobileNo2,
        gender: validatedValues.gender,
        email: validatedValues.email,
        isActive: validatedValues.isActive ?? true,
        departmentId: validatedValues.departmentId,
        entranceYearId: validatedValues.entranceYearId,
        roomId:
          validatedValues.roomId && validatedValues.roomId !== "none"
            ? validatedValues.roomId
            : null,
        userId: session?.id as string,
      },
      include: {
        department: { select: { name: true } },
        entranceYear: { select: { name: true } },
        room: {
          select: {
            roomNumber: true,
            floorNumber: true,
            dormitory: { select: { title: true } },
          },
        },
      },
    });

    await auditLog({
      action: "CREATE",
      entityType: "Student",
      entityId: student.id,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Created student ${student.fullNameEn} (${student.studentCode})`,
      newValues: {
        studentCode: student.studentCode,
        fullNameEn: student.fullNameEn,
        fullNameKu: student.fullNameKu,
        email: student.email,
        gender: student.gender,
        department: student.department.name,
        entranceYear: student.entranceYear.name,
        room: student.room
          ? `Floor ${student.room.floorNumber}, Room ${student.room.roomNumber} - ${student.room.dormitory.title}`
          : null,
      },
    });

    revalidatePath("/admin/students");

    return {
      status: "success",
      message: "Student created successfully",
      data: student,
    };
  } catch {
    await auditLog({
      action: "CREATE",
      entityType: "Student",
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: "Failed to create student",
      severity: "ERROR",
      metadata: { studentCode: validatedValues.studentCode },
    });

    return { error: "Failed to create student" };
  }
}
