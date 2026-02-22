// app/admin/students/[studentId]/payments/student-info-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, AlertCircle, Circle } from "lucide-react";

interface StudentInfoCardProps {
  student: {
    id: string;
    studentCode: string;
    fullNameEn: string;
    fullNameKu: string;
    mobileNo: string;
    email: string;
    entranceYear: string;
    department: {
      id: string;
      name: string;
      code: string;
    };
    totalAmount: number;
    totalPaid: number;
    balance: number;
    installmentCounts: {
      total: number;
      paid: number;
      partial: number;
      unpaid: number;
    };
    installmentStatus: Array<{
      installmentId: string;
      installmentNo: number;
      title: string;
      amount: number;
      paidAmount: number;
      remainingAmount: number;
      status: "paid" | "partial" | "unpaid";
    }>;
  };
}

export function StudentInfoCard({ student }: StudentInfoCardProps) {
  const balanceColor =
    student.balance > 0
      ? "text-red-600"
      : student.balance < 0
        ? "text-green-600"
        : "text-gray-600";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-right">زانیاری فێرخواز</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Student Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground text-right">
              ناوی فێرخواز (کوردی)
            </p>
            <p className="font-semibold text-right">{student.fullNameKu}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground text-right">
              ناوی فێرخواز (ئینگلیزی)
            </p>
            <p className="font-semibold text-right">{student.fullNameEn}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground text-right">
              کۆدی فێرخواز
            </p>
            <p className="font-semibold text-right">{student.studentCode}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground text-right">بەش</p>
            <Badge variant="secondary" className="text-right">
              {student.department.name}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground text-right">
              ساڵی چوونەژوورەوە
            </p>
            <p className="font-semibold text-right">{student.entranceYear}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground text-right">
              ژمارەی مۆبایل
            </p>
            <p className="font-semibold text-right" dir="ltr">
              {student.mobileNo}
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground text-right">
                کۆی گشتی
              </p>
              <p className="text-xl font-bold text-right">
                {student.totalAmount.toLocaleString()}هەزار
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground text-right">
                پارەی دراو
              </p>
              <p className="text-xl font-bold text-green-600 text-right">
                {student.totalPaid.toLocaleString()}هەزار
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground text-right">ماوە</p>
              <p
                className={`text-xl font-bold text-right ${balanceColor} هەزار`}
              >
                {Math.abs(student.balance).toLocaleString()}هەزار
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground text-right">
                کرێە تەواوبووەکان
              </p>
              <p className="text-xl font-bold text-right">
                {student.installmentCounts.paid} /{" "}
                {student.installmentCounts.total}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground text-right">دۆخ</p>
              <div className="text-right">
                {student.balance > 0 ? (
                  <Badge variant="destructive">قەرزار</Badge>
                ) : student.balance < 0 ? (
                  <Badge variant="default" className="bg-green-600">
                    زیادە
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-blue-600">
                    تەواو
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Installment Details Table */}
        {student.installmentStatus.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3 text-right">
              وردەکاریی کرێ
            </h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">دۆخ</TableHead>
                    <TableHead className="text-right">کرێ</TableHead>
                    <TableHead className="text-right">بڕی کرێ</TableHead>
                    <TableHead className="text-right">پارەی دراو</TableHead>
                    <TableHead className="text-right">ماوە</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.installmentStatus.map((inst) => (
                    <TableRow key={inst.installmentId}>
                      <TableCell className="text-right">
                        {inst.status === "paid" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 inline" />
                        ) : inst.status === "partial" ? (
                          <AlertCircle className="h-5 w-5 text-orange-600 inline" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 inline" />
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {inst.title}
                      </TableCell>
                      <TableCell className="text-right">
                        {inst.amount.toLocaleString()}هەزار
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {inst.paidAmount.toLocaleString()}هەزار
                      </TableCell>
                      <TableCell className="text-right">
                        {inst.remainingAmount > 0 ? (
                          <span className="text-red-600 font-semibold">
                            {inst.remainingAmount.toLocaleString()}هەزار
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
