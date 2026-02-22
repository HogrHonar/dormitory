import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { getDormitories } from "@/app/data/admin/admin-get-dormitories";
import CreateRoomClient from "./page-client";

export default async function CreateRoomPage() {
  await requireRole(ROLES.SUPER_ADMIN);

  const dormitories = await getDormitories();

  return <CreateRoomClient dormitories={dormitories} />;
}
