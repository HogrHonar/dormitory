import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";

export default async function Page() {
  await requireRole(ROLES.SUPER_ADMIN);

  return (
    <section className="container m-auto p-4">
      <div className="flex justify-center items-center">Under Developing</div>
    </section>
  );
}
