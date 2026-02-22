import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { getDepartments } from "@/app/data/(public)/department";
import { getEducationYears } from "@/app/data/(public)/educationYear";
import { getAvailableRooms } from "@/app/data/(public)/rooms";
import CreateStudentClient from "./page-client";

export default async function CreateStudentPage() {
  await requireRole(ROLES.SUPER_ADMIN);

  // Fetch all required data on the server
  const [departments, entranceYears, availableRooms] = await Promise.all([
    getDepartments(),
    getEducationYears(),
    getAvailableRooms(), // Get rooms that are not full
  ]);

  return (
    <CreateStudentClient
      departments={departments}
      entranceYears={entranceYears}
      availableRooms={availableRooms}
    />
  );
}
