import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  const today = new Date();

  // 1️⃣ Get active installments
  const installments = await prisma.installment.findMany({
    where: {
      startDate: { lte: today },
      endDate: { gte: today },
    },
  });

  for (const installment of installments) {
    // 2️⃣ Get students belonging to this entranceYear
    const students = await prisma.student.findMany({
      where: {
        entranceYearId: installment.entranceYearId,
        isActive: true,
      },
    });

    for (const student of students) {
      // 3️⃣ Check if student already paid (RECEIVE type)
      const paid = await prisma.payment.findFirst({
        where: {
          studentId: student.id,
          installmentId: installment.id,
          paymentType: "RECEIVE",
        },
      });

      if (paid) continue;

      // 4️⃣ Check if FIRST reminder already sent
      const reminderExists = await prisma.installmentReminder.findUnique({
        where: {
          studentId_installmentId_reminderStage: {
            studentId: student.id,
            installmentId: installment.id,
            reminderStage: "FIRST",
          },
        },
      });

      if (reminderExists) continue;

      // 5️⃣ Send email
      await resend.emails.send({
        from: "Dormitory <noreply@yourdomain.com>",
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

      // 6️⃣ Save reminder record
      await prisma.installmentReminder.create({
        data: {
          studentId: student.id,
          installmentId: installment.id,
          reminderStage: "FIRST",
        },
      });
    }
  }

  return Response.json({ status: "ok" });
}
