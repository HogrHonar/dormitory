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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PlusIcon } from "lucide-react";

import { FeeSchema, FeeSchemaType } from "@/lib/zodSchemas";
import { createFeeAction } from "./action";
import { getDepartments } from "@/app/data/(public)/department";

export default function CreateFeeStructurePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch(() => {
        toast.error("Failed to load departments");
      });
  }, []);

  const form = useForm<FeeSchemaType>({
    resolver: zodResolver(FeeSchema),
    defaultValues: {
      entranceYear: "",
      totalAmount: 0,
      departments: [],
    },
  });

  function onSubmit(values: FeeSchemaType) {
    startTransition(async () => {
      const res = await createFeeAction(values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Fee structure created successfully");
      form.reset();
      router.push("/admin/fees");
    });
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>زیادکردنی Fee Structure</CardTitle>
        <CardDescription>
          دیاریکردنی پارەی خوێندن بۆ یەک یان زیاتر بەش
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Entrance Year */}
            <FormField
              control={form.control}
              name="entranceYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ساڵی خوێندن</FormLabel>
                  <FormControl>
                    <Input placeholder="2025-2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total Amount */}
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>کۆی پارە ($)</FormLabel>
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

            {/* Departments (MULTI SELECT) */}
            <FormField
              control={form.control}
              name="departments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>بەشەکان</FormLabel>
                  <div className="grid grid-cols-2 gap-3 border rounded-md p-4">
                    {departments.map((dept) => (
                      <label
                        key={dept.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={field.value.includes(dept.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, dept.id]);
                            } else {
                              field.onChange(
                                field.value.filter((id) => id !== dept.id),
                              );
                            }
                          }}
                        />
                        <span>{dept.name}</span>
                      </label>
                    ))}
                  </div>
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
