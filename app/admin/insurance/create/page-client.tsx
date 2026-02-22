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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusIcon } from "lucide-react";

import { createInsuranceAction } from "./action";
import {
  CreateInsuranceSchemaType,
  CreateInsuranceSchema,
} from "@/lib/zodSchemas";

interface CreateInsuranceClientProps {
  students: { id: string; studentCode: string; fullNameKu: string }[];
}

export default function CreateInsuranceClient({
  students,
}: CreateInsuranceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateInsuranceSchemaType>({
    resolver: zodResolver(CreateInsuranceSchema),
    defaultValues: {
      studentId: "",
      amountPaid: 100000,
      paymentMethod: "CASH",
      paidAt: "",
    },
  });

  function onSubmit(values: CreateInsuranceSchemaType) {
    startTransition(async () => {
      const res = await createInsuranceAction(values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("بارمتە بە سەرکەوتوویی زیادکرا");
      form.reset();
      router.push("/admin/insurance");
    });
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>زیادکردنی بارمتە</CardTitle>
        <CardDescription>تۆمارکردنی بارمتەی نوێخانە بۆ فێرخواز</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Student Selection */}
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>فێرخواز</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="هەڵبژاردنی فێرخواز" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          هیچ فێرخوازێک نییە
                        </SelectItem>
                      ) : (
                        students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.fullNameKu} — {student.studentCode}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    تەنها فێرخوازانی تۆمارکراو لە نوێخانەدا دەردەکەون
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Paid */}
            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>بڕی بارمتە (IQD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      placeholder="100000"
                    />
                  </FormControl>
                  <FormDescription>
                    بنەڕەتی بڕی بارمتە 100,000 IQD-ە
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شێوازی پارەدان</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="هەڵبژاردنی شێواز" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">کاش</SelectItem>
                      <SelectItem value="FIB">FIB</SelectItem>
                      <SelectItem value="FASTPAY">FastPay</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paid At */}
            <FormField
              control={form.control}
              name="paidAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ڕێکەوتی پارەدان</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>بەتاڵ بێهێڵە بۆ ئەمڕۆ</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <PlusIcon className="mr-2" size={16} />
                  زیادکردن
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
