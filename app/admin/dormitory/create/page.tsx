import { getManagerUsers } from "@/app/data/(public)/users";
import CreateDormitoryClient from "./CreateDormitoryClient";
import { getUserPermissions } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function CreateDormitoryPage() {
  const perms = await getUserPermissions();

  const canCreate = perms.has("dormitories:create");

  if (!canCreate) redirect("/unauthorized");

  // Fetch managers on the server
  const managers = await getManagerUsers();

  return <CreateDormitoryClient managers={managers} />;
}
