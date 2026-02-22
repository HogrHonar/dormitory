"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw } from "lucide-react";

import {
  ReturnInsuranceSchema,
  ReturnInsuranceSchemaType,
} from "@/lib/zodSchemas";
import { returnInsuranceAction } from "../../create/action";

interface ReturnInsuranceClientProps {
  insurance: {
    id: string;
    amountPaid: number;
    student: {
      fullNameKu: string;
      studentCode: string;
    };
  };
}

export default function ReturnInsuranceClient({
  insurance,
}: ReturnInsuranceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReturnInsuranceSchemaType>({
    resolver: zodResolver(ReturnInsuranceSchema),
    defaultValues: {
      amountReturned: insurance.amountPaid,
      returnNote: "",
      returnedBy: "",
    },
  });

  const watchedAmount = form.watch("amountReturned") ?? 0;
  const deduction = insurance.amountPaid - watchedAmount;

  function onSubmit(values: ReturnInsuranceSchemaType) {
    startTransition(async () => {
      const res = await returnInsuranceAction(insurance.id, values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("بارمتە بە سەرکەوتوویی گەڕایەوە");
      router.push("/admin/insurance");
    });
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>گەڕاندنەوەی بارمتە</CardTitle>
        <CardDescription>
          پرۆسەکردنی گەڕاندنەوەی بارمتەی نوێخانە
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Student info summary */}
        <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">فێرخواز</span>
            <span className="font-medium">{insurance.student.fullNameKu}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">کۆد</span>
            <Badge variant="outline">{insurance.student.studentCode}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">بڕی بارمتە</span>
            <span className="font-bold">
              {insurance.amountPaid.toLocaleString()} IQD
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount Returned */}
            <FormField
              control={form.control}
              name="amountReturned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>بڕی گەڕاندنەوە (IQD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      max={insurance.amountPaid}
                      min={0}
                    />
                  </FormControl>
                  {deduction > 0 && (
                    <p className="text-sm text-red-500 font-medium">
                      بڕی کەمکراوە: {deduction.toLocaleString()} IQD
                    </p>
                  )}
                  {deduction === 0 && watchedAmount > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      تەواوی بارمتە دەگەڕێتەوە
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Return Note */}
            <FormField
              control={form.control}
              name="returnNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تێبینی</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="نموونە: كورسی شكراوە، ژووری پیسبووە..."
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    ئەگەر کەمکراوەیەک هەیە هۆکارەکەی بنووسە
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Returned By */}
            <FormField
              control={form.control}
              name="returnedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>پرۆسەکراوە لەلایەن</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ناوی بەڕێوەبەر..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RotateCcw className="mr-2" size={16} />
                  گەڕاندنەوەی بارمتە
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
