import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const today = new Date();
  const results = { sent: 0, skipped: 0, errors: 0 };

  const installments = await prisma.installment.findMany({
    where: {
      startDate: { lte: today },
      endDate: { gte: today },
    },
    include: {
      entranceYear: {
        include: {
          students: {
            where: { isActive: true },
            include: {
              payments: {
                where: { paymentType: "RECEIVE" },
                select: { installmentId: true },
              },
              installmentReminders: {
                where: { reminderStage: "FIRST" },
                select: { installmentId: true },
              },
            },
          },
        },
      },
    },
  });

  for (const installment of installments) {
    const students = installment.entranceYear.students;

    for (const student of students) {
      const alreadyPaid = student.payments.some(
        (p) => p.installmentId === installment.id,
      );
      const alreadyReminded = student.installmentReminders.some(
        (r) => r.installmentId === installment.id,
      );

      if (alreadyPaid || alreadyReminded) {
        results.skipped++;
        continue;
      }

      try {
        await resend.emails.send({
          from: "Dormitory <noreply@mail.btvi.edu.iq>",
          to: student.email,
          subject: `Payment Reminder - ${installment.title}`,
          html: `
            <p>Hello ${student.fullNameEn},</p>
            <p>Your installment <strong>${installment.title}</strong>
            (${installment.amount}$) is still unpaid.</p>
            <p>Due date: ${installment.endDate.toDateString()}</p>
            <p>Please complete the payment as soon as possible.</p>
            <br/>
            <p>Regards,<br/>Dormitory Management</p>
          `,
        });

        await prisma.installmentReminder.create({
          data: {
            studentId: student.id,
            installmentId: installment.id,
            reminderStage: "FIRST",
          },
        });

        results.sent++;
      } catch (err) {
        console.error(`Failed for student ${student.id}:`, err);
        results.errors++;
      }
    }
  }

  return Response.json({ status: "ok", results });
}
