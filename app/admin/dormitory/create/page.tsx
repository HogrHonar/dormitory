import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { getManagerUsers } from "@/app/data/(public)/users";
import CreateDormitoryClient from "./CreateDormitoryClient";

export default async function CreateDormitoryPage() {
  await requireRole(ROLES.SUPER_ADMIN);

  // Fetch managers on the server
  const managers = await getManagerUsers();

  return <CreateDormitoryClient managers={managers} />;
}
