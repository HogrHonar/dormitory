"use server";

import { prisma } from "@/lib/prisma";
import { StudentSchema, StudentSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/has-permission";
import { getCurrentUser } from "@/lib/get-current-user";
import { auditLog } from "@/lib/audit";

export async function updateStudentAction(
  studentId: string,
  values: StudentSchemaType,
) {
  const session = await getCurrentUser();
  const allowed = await hasPermission("students:update");
  if (!allowed) {
    await auditLog({
      action: "UPDATE",
      entityType: "Student",
      entityId: studentId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "WARNING",
      description: "Unauthorized attempt to update student",
    });
    return { error: "You do not have permission to update a student" };
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
      where: { id: studentId },
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

    if (!existingStudent) {
      return { error: "فێرخواز نەدۆزرایەوە (Student not found)" };
    }

    if (validatedValues.studentCode !== existingStudent.studentCode) {
      const duplicateStudent = await prisma.student.findUnique({
        where: { studentCode: validatedValues.studentCode },
      });
      if (duplicateStudent) {
        return {
          error:
            "فێرخوازێک بەم کۆدە پێشتر هەیە (Student with this code already exists)",
        };
      }
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
      if (validatedValues.roomId !== existingStudent.roomId) {
        const room = await prisma.room.findUnique({
          where: { id: validatedValues.roomId },
          include: { _count: { select: { students: true } } },
        });
        if (!room)
          return { error: "ژووری دیاریکراو بوونی نییە (Invalid room)" };
        if (room._count.students >= room.capacity) {
          return { error: "ژوورەکە تێچووە (Room is full)" };
        }
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
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
      action: "UPDATE",
      entityType: "Student",
      entityId: studentId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      description: `Updated student "${updatedStudent.fullNameEn}" (${updatedStudent.studentCode})`,
      oldValues: {
        studentCode: existingStudent.studentCode,
        fullNameEn: existingStudent.fullNameEn,
        fullNameKu: existingStudent.fullNameKu,
        email: existingStudent.email,
        gender: existingStudent.gender,
        isActive: existingStudent.isActive,
        department: existingStudent.department.name,
        entranceYear: existingStudent.entranceYear.name,
        room: existingStudent.room
          ? `Floor ${existingStudent.room.floorNumber}, Room ${existingStudent.room.roomNumber} - ${existingStudent.room.dormitory.title}`
          : null,
      },
      newValues: {
        studentCode: updatedStudent.studentCode,
        fullNameEn: updatedStudent.fullNameEn,
        fullNameKu: updatedStudent.fullNameKu,
        email: updatedStudent.email,
        gender: updatedStudent.gender,
        isActive: updatedStudent.isActive,
        department: updatedStudent.department.name,
        entranceYear: updatedStudent.entranceYear.name,
        room: updatedStudent.room
          ? `Floor ${updatedStudent.room.floorNumber}, Room ${updatedStudent.room.roomNumber} - ${updatedStudent.room.dormitory.title}`
          : null,
      },
    });

    revalidatePath("/admin/students");
    return {
      status: "success",
      message: "Student updated successfully",
      data: updatedStudent,
    };
  } catch {
    await auditLog({
      action: "UPDATE",
      entityType: "Student",
      entityId: studentId,
      userId: session?.id,
      userEmail: session?.email,
      userRole: session?.role?.name,
      severity: "ERROR",
      description: "Failed to update student",
    });
    return { error: "Failed to update student" };
  }
}
