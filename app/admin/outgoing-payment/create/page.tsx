import { adminGetAvailableBalance } from "@/app/data/admin/admin-get-outgoing-payments";
import CreateOutgoingPaymentClient from "./page-client";
import { getUserPermissions } from "@/lib/has-permission";
import { redirect } from "next/navigation";

export default async function CreateOutgoingPaymentPage() {
  const perms = await getUserPermissions();

  const canCreate = perms.has("outgoing-payments:create");

  if (!canCreate) redirect("/unauthorized");

  const availableBalance = await adminGetAvailableBalance();

  return <CreateOutgoingPaymentClient availableBalance={availableBalance} />;
}
