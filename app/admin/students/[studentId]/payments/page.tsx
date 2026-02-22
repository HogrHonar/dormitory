// app/admin/students/[studentId]/payments/page.tsx
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { adminGetStudentPayments } from "@/app/data/admin/admin-get-student-payments";
import { adminGetStudentDetails } from "@/app/data/admin/admin-get-student-details";
import { adminGetStudentInstallments } from "@/app/data/admin/admin-get-student-installments";
import { StudentInfoCard } from "./student-info-card";
import { CreatePaymentButton } from "./create-payment-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function Page(props: PageProps) {
  await requireRole(ROLES.SUPER_ADMIN);

  // Await params first
  const params = await props.params;
  const studentId = params.studentId;

  // Fetch data
  const [student, payments, installments] = await Promise.all([
    adminGetStudentDetails(studentId),
    adminGetStudentPayments(studentId),
    adminGetStudentInstallments(studentId),
  ]);

  if (!student) {
    notFound();
  }

  return (
    <section className="container mx-auto px-4 py-8">
      {/* rerturn back to list of studetns */}
      <div className="flex items-center gap-2 justify-end mb-4">
        <h1>گەڕاندنەوە</h1>
        <Link
          href="/admin/students"
          className={buttonVariants({ variant: "default" })}
        >
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <div dir="rtl">
        {/* Student Info Card */}
        <StudentInfoCard student={student} />

        {/* Payments Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">لیستی وەسڵەکان</h2>
          <CreatePaymentButton
            studentId={studentId}
            installments={installments}
          />
        </div>

        <DataTable columns={columns} data={payments} />
      </div>
    </section>
  );
}
