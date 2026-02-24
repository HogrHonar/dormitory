import { getDepartments } from "@/app/data/(public)/department";
import { getEducationYears } from "@/app/data/(public)/educationYear";
import { getAvailableRooms } from "@/app/data/(public)/rooms";
import CreateStudentClient from "./page-client";
import { hasPermission } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function CreateStudentPage() {
  const canRead = await hasPermission("students:read");
  if (!canRead) {
    redirect("/unauthorized");
  }

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
