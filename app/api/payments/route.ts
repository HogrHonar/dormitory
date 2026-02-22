// app/api/admin/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-role";
import { ROLES } from "@/lib/roles";
import { Resend } from "resend";
import { z } from "zod";
import type { Payment, Installment } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

// Validation schema
const paymentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  installmentId: z.string().min(1, "Installment ID is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
  paymentType: z.enum(["RECEIVE", "RETURN", "DISCOUNT"]),
  paymentMethod: z.enum(["CASH", "FIB", "FASTPAY"]),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
});

type PaymentWithInstallment = Payment & {
  installment: Pick<Installment, "title" | "amount">;
};

export async function POST(request: NextRequest) {
  try {
    await requireRole(ROLES.SUPER_ADMIN);

    const body = await request.json();
    const validated = paymentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      studentId,
      installmentId,
      amount,
      paymentType,
      paymentMethod,
      discountPercent,
      discountAmount,
      receiptUrl,
    } = validated.data;

    if (paymentType === "DISCOUNT") {
      const hasPercent = discountPercent != null;
      const hasAmount = discountAmount != null;

      if (!hasPercent && !hasAmount) {
        return NextResponse.json(
          {
            error:
              "Either discountPercent or discountAmount is required for DISCOUNT type",
          },
          { status: 400 },
        );
      }

      if (!receiptUrl) {
        return NextResponse.json(
          { error: "Receipt URL is required for DISCOUNT type" },
          { status: 400 },
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { id: true, email: true, fullNameEn: true, fullNameKu: true },
      });
      if (!student) throw new Error("Student not found");

      const installment = await tx.installment.findUnique({
        where: { id: installmentId },
        select: { id: true, title: true, amount: true },
      });
      if (!installment) throw new Error("Installment not found");

      const [receiveAgg, returnAgg, discountAgg] = await Promise.all([
        tx.payment.aggregate({
          where: { studentId, installmentId, paymentType: "RECEIVE" },
          _sum: { amount: true },
        }),
        tx.payment.aggregate({
          where: { studentId, installmentId, paymentType: "RETURN" },
          _sum: { amount: true },
        }),
        tx.payment.aggregate({
          where: { studentId, installmentId, paymentType: "DISCOUNT" },
          _sum: { discountAmount: true },
        }),
      ]);

      const totalReceived = receiveAgg._sum.amount ?? 0;
      const totalReturned = returnAgg._sum.amount ?? 0;
      const paidSoFar = totalReceived - totalReturned;
      const discountSoFar = discountAgg._sum.discountAmount ?? 0;

      const computedDiscountAmount =
        paymentType === "DISCOUNT"
          ? (discountAmount ??
            (discountPercent != null
              ? Number(
                  ((installment.amount * discountPercent) / 100).toFixed(2),
                )
              : 0))
          : 0;

      const effectiveDelta =
        paymentType === "RECEIVE"
          ? amount
          : paymentType === "RETURN"
            ? -amount
            : 0;

      const newPaid = paidSoFar + effectiveDelta;
      const newDiscount = discountSoFar + computedDiscountAmount;

      if (newPaid < 0) {
        throw new Error("Return amount cannot make total paid negative");
      }

      if (newDiscount < 0) {
        throw new Error("Discount amount cannot be negative");
      }

      const netDue = Math.max(0, installment.amount - newDiscount);

      if (newPaid > netDue) {
        throw new Error(
          `Payment exceeds remaining due. Remaining due is $${(netDue - paidSoFar).toFixed(2)}`,
        );
      }

      const paymentStatus =
        newPaid === 0 ? "UNPAID" : newPaid < netDue ? "PARTIALLY_PAID" : "PAID";

      const storedAmount =
        paymentType === "DISCOUNT" ? computedDiscountAmount : amount;

      const payment = await tx.payment.create({
        data: {
          studentId,
          installmentId,
          amount: storedAmount,
          paymentType,
          paymentMethod,
          paymentStatus,
          ...(paymentType === "DISCOUNT" && {
            discountPercent: discountPercent ?? null,
            discountAmount: computedDiscountAmount,
            receiptUrl,
          }),
        },
        include: {
          installment: {
            select: { title: true, amount: true },
          },
        },
      });

      return { payment, student };
    });

    // Best effort email
    sendPaymentConfirmationEmail(result.payment, result.student).catch(
      (error) => console.error("Failed to send email:", error),
    );

    return NextResponse.json(result.payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (
        error.message.includes("cannot") ||
        error.message.includes("required") ||
        error.message.includes("exceeds")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 },
    );
  }
}

async function sendPaymentConfirmationEmail(
  payment: PaymentWithInstallment,
  student: { email: string; fullNameEn: string; fullNameKu?: string | null },
) {
  if (!student.email) {
    console.log("No email address for student");
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const paymentTypeMap: Record<string, string> = {
      RECEIVE: "Received",
      RETURN: "Returned",
      DISCOUNT: "Discounted",
    };

    const paymentTypeText = paymentTypeMap[payment.paymentType] || "Payment";

    const emailBody = `
      <div dir="ltr" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Confirmation</h2>
        <p>Hello <strong>${student.fullNameEn}</strong>,</p>
        <p>This is to confirm your payment transaction:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Type:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${paymentTypeText}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">$${payment.amount.toFixed(2)}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Method:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${payment.paymentMethod}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Installment:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${payment.installment.title}</td>
          </tr>
          ${
            payment.paymentType === "DISCOUNT" &&
            payment.discountPercent &&
            payment.discountAmount
              ? `
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Discount:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${payment.discountPercent}% ($${payment.discountAmount.toFixed(2)})</td>
          </tr>
          `
              : ""
          }
        </table>
        <p style="color: #666; font-size: 14px;">
          If you have any questions, please contact our administration office.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #999; font-size: 12px;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Acme <onboarding@resend.dev>",
      to: [student.email],
      subject: `Payment Confirmation - ${payment.installment.title}`,
      html: emailBody,
    });

    console.log(`Email sent successfully to ${student.email}`);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}
