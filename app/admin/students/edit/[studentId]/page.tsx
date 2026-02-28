import { getDepartments } from "@/app/data/(public)/department";
import { getEducationYears } from "@/app/data/(public)/educationYear";
import { getAvailableRooms } from "@/app/data/(public)/rooms";
import EditStudentClient from "./page-client";
import { hasPermission } from "@/lib/has-permission";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditStudentPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function EditStudentPage({
  params,
}: EditStudentPageProps) {
  const { studentId } = await params;

  const canRead = await hasPermission("students:read");
  if (!canRead) {
    redirect("/unauthorized");
  }

  // Fetch student data
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      department: true,
      entranceYear: true,
      room: {
        include: {
          dormitory: true,
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  // Fetch all required data on the server
  const [departments, entranceYears, availableRooms] = await Promise.all([
    getDepartments(),
    getEducationYears(),
    getAvailableRooms(),
  ]);

  // Include current room in available rooms if student has one (in case it's "full" but student is already assigned)
  const currentRoomId = student.roomId;
  const availableRoomIds = new Set(availableRooms.map((r) => r.id));

  // If student has a room that's not in available rooms, fetch it separately
  let allRooms = availableRooms;
  if (currentRoomId && !availableRoomIds.has(currentRoomId)) {
    const currentRoom = await prisma.room.findUnique({
      where: { id: currentRoomId },
      include: {
        dormitory: true,
        _count: {
          select: { students: true },
        },
      },
    });
    if (currentRoom) {
      allRooms = [
        ...availableRooms,
        {
          id: currentRoom.id,
          roomNumber: currentRoom.roomNumber,
          floorNumber: currentRoom.floorNumber,
          capacity: currentRoom.capacity,
          currentOccupancy: currentRoom._count.students,
          dormitory: { title: currentRoom.dormitory.title },
        },
      ];
    }
  }

  return (
    <EditStudentClient
      student={student}
      departments={departments}
      entranceYears={entranceYears}
      availableRooms={allRooms}
    />
  );
}
