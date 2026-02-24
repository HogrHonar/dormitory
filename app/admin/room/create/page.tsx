import { getDormitories } from "@/app/data/admin/admin-get-dormitories";
import CreateRoomClient from "./page-client";
import { hasPermission } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function CreateRoomPage() {
  const canRead = await hasPermission("rooms:read");
  if (!canRead) {
    redirect("/unauthorized");
  }

  const dormitories = await getDormitories();

  return <CreateRoomClient dormitories={dormitories} />;
}
