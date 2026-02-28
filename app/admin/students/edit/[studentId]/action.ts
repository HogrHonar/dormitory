"use server";

import { prisma } from "@/lib/prisma";
import { StudentSchema, StudentSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";
import { hasPermission } from "@/lib/has-permission";

export async function updateStudentAction(
  studentId: string,
  values: StudentSchemaType,
) {
//   const allowed = await hasPermission("students:update");
//   if (!allowed) {
//     return { error: "You do not have permission to update a student" };
//   }

  const parsed = StudentSchema.safeParse(values);
  if (!parsed.success) {
    return {
      error: "Invalid values",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const validatedValues = parsed.data;

  try {
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      return {
        error: "فێرخواز نەدۆزرایەوە (Student not found)",
      };
    }

    // Check if student code already exists (but not for this student)
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

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: validatedValues.departmentId },
    });

    if (!department) {
      return {
        error: "بەشی دیاریکراو بوونی نییە (Invalid department)",
      };
    }

    // Verify entrance year exists
    const entranceYear = await prisma.educationalYear.findUnique({
      where: { id: validatedValues.entranceYearId },
    });

    if (!entranceYear) {
      return {
        error: "ساڵی خوێندنی دیاریکراو بوونی نییە (Invalid entrance year)",
      };
    }

    // If room is assigned, verify it exists and has capacity (unless it's the same room)
    if (validatedValues.roomId && validatedValues.roomId !== "none") {
      // Only check capacity if changing rooms
      if (validatedValues.roomId !== existingStudent.roomId) {
        const room = await prisma.room.findUnique({
          where: { id: validatedValues.roomId },
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        });

        if (!room) {
          return {
            error: "ژووری دیاریکراو بوونی نییە (Invalid room)",
          };
        }

        if (room._count.students >= room.capacity) {
          return {
            error: "ژوورەکە تێچووە (Room is full)",
          };
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
            dormitory: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/admin/students");

    return {
      status: "success",
      message: "Student updated successfully",
      data: updatedStudent,
    };
  } catch {
    return {
      error: `Failed to update student`,
    };
  }
}
