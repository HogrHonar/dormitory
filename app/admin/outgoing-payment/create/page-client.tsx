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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, SendIcon } from "lucide-react";

import {
  OutgoingPaymentSchema,
  OutgoingPaymentSchemaType,
} from "@/lib/zodSchemas";
import { createOutgoingPaymentAction } from "./action";

interface CreateOutgoingPaymentClientProps {
  availableBalance: number;
}

export default function CreateOutgoingPaymentClient({
  availableBalance,
}: CreateOutgoingPaymentClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<OutgoingPaymentSchemaType>({
    resolver: zodResolver(OutgoingPaymentSchema),
    defaultValues: {
      totalCollected: availableBalance,
      amountToHandOver: 0,
      remainingFloat: availableBalance,
      note: "",
      paymentMethod: "CASH",
      periodStart: "",
      periodEnd: "",
    },
  });

  // Keep remainingFloat in sync as user types amountToHandOver
  const watchAmount = form.watch("amountToHandOver");
  const remaining = availableBalance - (watchAmount || 0);

  function onSubmit(values: OutgoingPaymentSchemaType) {
    startTransition(async () => {
      const res = await createOutgoingPaymentAction({
        ...values,
        totalCollected: availableBalance,
        remainingFloat: remaining,
      });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("داواکارییەکە ناردرا بۆ ئەدمین");
      form.reset();
      router.push("/admin/outgoing-payment");
    });
  }

  return (
    <Card dir="rtl" className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>داواکاری پارەی دەرچوو</CardTitle>
        <CardDescription>دروستکردنی داواکاری نوێ بۆ ئەدمین</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Balance Info */}
        <div className="mb-6 rounded-lg bg-muted/50 px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">باڵانسی بەردەست</span>
          <span className="font-bold text-green-600 text-lg">
            {availableBalance.toLocaleString()} IQD
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount to Hand Over */}
            <FormField
              control={form.control}
              name="amountToHandOver"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>بڕی دراو بە ئەدمین (IQD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      placeholder="1,000,000"
                    />
                  </FormControl>
                  <FormDescription>
                    ماوەی لای ژمێریار:{" "}
                    <span
                      className={
                        remaining < 0
                          ? "text-red-600 font-bold"
                          : "text-green-600 font-bold"
                      }
                    >
                      {remaining.toLocaleString()} IQD
                    </span>
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
                      <SelectItem value="CASH">نەقد</SelectItem>
                      <SelectItem value="FIB">FIB</SelectItem>
                      <SelectItem value="FASTPAY">FASTPAY</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period Start */}
            <FormField
              control={form.control}
              name="periodStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سەرەتای ماوەکە (ئارەزوومەندانە)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period End */}
            <FormField
              control={form.control}
              name="periodEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>کۆتایی ماوەکە (ئارەزوومەندانە)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تێبینی (ئارەزوومەندانە)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="هەر تێبینییەک..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending || remaining < 0}
              className="w-full"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <SendIcon className="mr-2" size={16} />
                  ناردن بۆ ئەدمین
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
