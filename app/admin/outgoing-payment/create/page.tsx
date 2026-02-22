import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { adminGetAvailableBalance } from "@/app/data/admin/admin-get-outgoing-payments";
import CreateOutgoingPaymentClient from "./page-client";

export default async function CreateOutgoingPaymentPage() {
  await requireRole(ROLES.ACCOUNTANT);

  const availableBalance = await adminGetAvailableBalance();

  return <CreateOutgoingPaymentClient availableBalance={availableBalance} />;
}
