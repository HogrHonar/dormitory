import { buttonVariants } from "@/components/ui/button";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  await requireRole(ROLES.SUPER_ADMIN);

  return (
    <section className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <Link
          className={buttonVariants({ variant: "default" })}
          href="/admin/student/create"
        >
          زیادکردن
          <PlusIcon />
        </Link>
        <p className="text-xl font-bold">فێرخوازانی بەشە ناوخۆیی</p>
      </div>
    </section>
  );
}
