import { z } from "zod";

export const StudentSchema = z.object({
  studentCode: z.string().min(1, { message: "کۆدی فێرخواز پێویستە" }),
  fullNameEn: z.string().min(1, { message: "ناوی فێرخواز پێویستە" }),
  fullNameKu: z.string().min(1, { message: "ناوی فێرخواز پێویستە" }),
  mobileNo: z.string().min(1, { message: "ژمارەی مۆبایل پێویستە" }),
  mobileNo2: z.string().optional().or(z.literal("")),
  gender: z.enum(["Male", "Female"]),
  email: z.string().email({ message: "ئیمەیڵ دروست نییە" }),
  departmentId: z.string().min(1, { message: "بەش پێویستە" }),
  entranceYearId: z.string().min(1, { message: "ساڵی هاتن پێویستە" }),
  roomId: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export type StudentSchemaType = z.infer<typeof StudentSchema>;

export type StudentRow = StudentSchemaType & {
  id: string;
};

export const FeeSchema = z.object({
  departments: z.array(z.string()).min(1, "Select at least one department"),

  entranceYear: z.string().min(1, { message: "سالێک دیاری بکە" }),
  totalAmount: z.number().min(1, { message: "کۆی گشتی کرێی داخلی بنوسە" }),
});

export type FeeSchemaType = z.infer<typeof FeeSchema>;

export const InstallmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  installmentNo: z.number().int().min(1),
  amount: z.number().positive(),
  startDate: z.date(),
  endDate: z.date(),
  yearId: z.string().min(1, { message: "سالێک دیاری بکە" }),
  entranceYearId: z.string().min(1, { message: "سالێک دیاری بکە" }),
});

export type InstallmentSchemaType = z.infer<typeof InstallmentSchema>;

export const EducationalYearSchema = z.object({
  name: z.string().min(1, "ناوی ساڵی خوێندن دەبێت لە 1 پیت زیاتر بێت"),
});

export type EducationalYearSchemaType = z.infer<typeof EducationalYearSchema>;

export const DepartmentSchema = z.object({
  name: z.string().min(1, "ناوی بەش دەبێت لە 1 پیت زیاتر بێت"),
  code: z.string().min(1, "کۆدی بەش دەبێت لە 1 پیت زیاتر بێت"),
});

export type DepartmentSchemaType = z.infer<typeof DepartmentSchema>;

// Dormitory Schema
export const DormitorySchema = z.object({
  title: z.string().min(1, "ناونیشان پێویستە").max(100, "ناونیشان زۆر درێژە"),
  managerId: z.string().min(1, "بەڕێوەبەر پێویستە"),
  description: z.string().min(1, "وەسف پێویستە").max(500, "وەسف زۆر درێژە"),
});

export type DormitorySchemaType = z.infer<typeof DormitorySchema>;

// Room Schema
export const RoomSchema = z.object({
  dormId: z.string().min(1, "نوێخانە پێویستە (Dormitory is required)"),
  floorNumber: z
    .number()
    .int()
    .min(0, "ژمارەی نهۆم دەبێت زیاتر یان یەکسان بێت بە سفر"),
  roomNumber: z.number().int().min(1, "ژمارەی ژوور دەبێت زیاتر بێت لە سفر"),
  capacity: z
    .number()
    .int()
    .min(1, "بەرزترین ژمارە دەبێت لانیکەم ١ بێت")
    .max(10, "بەرزترین ژمارە زۆر زۆرە"),
});

export type RoomSchemaType = z.infer<typeof RoomSchema>;

export const CreateInsuranceSchema = z.object({
  studentId: z.string().min(1, "پێویستە فێرخوازێک هەڵبژێری"),
  amountPaid: z
    .number()
    .positive("بڕی پارە دەبێت ئەرێنی بێت")
    .max(100000, "زیاترین بڕ 100,000 IQD-ە"),
  paymentMethod: z.enum(["CASH", "FIB", "FASTPAY"]),
  paidAt: z.string().optional(),
});

export type CreateInsuranceSchemaType = z.infer<typeof CreateInsuranceSchema>;

export const ReturnInsuranceSchema = z.object({
  amountReturned: z.number().min(0, "بڕی گەڕاندنەوە نابێت کەمتر لە سفر بێت"),
  returnNote: z.string().optional(),
  returnedBy: z.string().optional(),
});

export type ReturnInsuranceSchemaType = z.infer<typeof ReturnInsuranceSchema>;

export const OutgoingPaymentSchema = z.object({
  totalCollected: z.number().min(0),
  amountToHandOver: z.number().min(1, "بڕی دراو پێویستە"),
  remainingFloat: z.number().min(0),
  note: z.string().optional(),
  paymentMethod: z.enum(["CASH", "FIB", "FASTPAY"]),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
});

export type OutgoingPaymentSchemaType = z.infer<typeof OutgoingPaymentSchema>;

export const ApproveOutgoingPaymentSchema = z.object({
  id: z.string().min(1),
});

export const RejectOutgoingPaymentSchema = z.object({
  id: z.string().min(1),
  rejectionNote: z.string().min(1, "تێبینی پێویستە"),
});

export const CategoriesSchema = z.object({
  name: z.string().min(1, "ناوی بەش دەبێت لە 1 پیت زیاتر بێت"),
});

export type CategoriesSchemaType = z.infer<typeof CategoriesSchema>;

export const expenseSchema = z.object({
  title: z.string().min(1, { message: "ناونیشان پێویستە" }),
  amount: z.number().positive({ message: "مەبەلغ دەبێت ژمارەیەکی ئەرێنی بێت" }),
  description: z.string().optional(),
  date: z.date(),
  documentUrl: z
    .string()
    .url({ message: "بەستەری دۆکیومێنت دروست نییە" })
    .optional()
    .or(z.literal("")),
  categoryId: z.string().min(1, { message: "جۆر پێویستە" }),
  dormId: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
