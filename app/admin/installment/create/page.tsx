"use client";

import { useEffect, useState, useTransition } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon } from "lucide-react";

import { InstallmentSchema, InstallmentSchemaType } from "@/lib/zodSchemas";
import { createInstallmentAction } from "./action";
import { getEducationYears } from "@/app/data/(public)/educationYear";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateInstallmentPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingEntranceYears, setLoadingEntranceYears] = useState(true);
  const [entranceYears, setEntranceYears] = useState<
    { id: string; name: string }[]
  >([]);
  const [yearId, setYearId] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([getEducationYears()])
      .then(([years]) => {
        setEntranceYears(years);
        setYearId(years);
      })
      .catch(() => toast.error("Failed to load form data"))
      .finally(() => {
        setLoadingEntranceYears(false);
      });
  }, []);
  const form = useForm<InstallmentSchemaType>({
    resolver: zodResolver(InstallmentSchema),
    defaultValues: {
      entranceYearId: "",
      yearId: "",
      title: "",
      installmentNo: 1,
      amount: 0,
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const installmentTitle = [
    "مانگی ١",
    "مانگی ٢",
    "مانگی ٣",
    "مانگی ٤",
    "مانگی ٥",
    "مانگی ٦",
    "مانگی ٧",
    "مانگی ٨",
    "مانگی ٩",
    "مانگی ١٠",
    "مانگی ١١",
    "مانگی ١٢",
  ];

  function onSubmit(values: InstallmentSchemaType) {
    startTransition(async () => {
      const res = await createInstallmentAction(values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Installment created successfully");
      form.reset();
      router.push("/admin/installment");
    });
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>زیادکردنی کرێ</CardTitle>
        <CardDescription>زیادکردنی کرێ بۆ فێرخوازان</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="yearId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>ساڵی خوێندن</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ساڵی خوێندن" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingEntranceYears ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="size-4 animate-spin" />
                        </SelectItem>
                      ) : (
                        yearId.map((yearId) => (
                          <SelectItem key={yearId.id} value={yearId.id}>
                            {yearId.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="entranceYearId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>ساڵی دەستپێکردنی فێرخواز</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ساڵی دەستپێکردنی فێرخواز" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingEntranceYears ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="size-4 animate-spin" />
                        </SelectItem>
                      ) : (
                        entranceYears.map((entranceYear) => (
                          <SelectItem
                            key={entranceYear.id}
                            value={entranceYear.id}
                          >
                            {entranceYear.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ناوی کرێ</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ناوی کرێ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {installmentTitle.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Installment No */}
            <FormField
              control={form.control}
              name="installmentNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ژمارەی کرێ</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount (IQD) */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>بڕی پارە (IQD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      placeholder="250000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ڕێکەوتی دەستپێک</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value.toISOString().split("T")[0]}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ڕێکەوتی کۆتایی</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value.toISOString().split("T")[0]}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
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
