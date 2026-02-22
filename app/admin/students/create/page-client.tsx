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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PlusIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { StudentSchema, StudentSchemaType } from "@/lib/zodSchemas";
import { createStudentAction } from "./action";

interface CreateStudentClientProps {
  departments: { id: string; name: string }[];
  entranceYears: { id: string; name: string }[];
  availableRooms: {
    id: string;
    roomNumber: number;
    floorNumber: number;
    capacity: number;
    currentOccupancy: number;
    dormitory: { title: string };
  }[];
}

export default function CreateStudentClient({
  departments,
  entranceYears,
  availableRooms,
}: CreateStudentClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<StudentSchemaType>({
    resolver: zodResolver(StudentSchema),
    defaultValues: {
      studentCode: "",
      fullNameEn: "",
      fullNameKu: "",
      mobileNo: "",
      gender: "Male",
      email: "",
      departmentId: "",
      entranceYearId: "",
      roomId: "",
      isActive: true,
    },
  });

  function onSubmit(values: StudentSchemaType) {
    startTransition(async () => {
      const res = await createStudentAction(values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Student created successfully");
      form.reset();
      router.push("/admin/students");
    });
  }

  return (
    <>
      <div className="flex items-center gap-2 justify-end mb-4">
        <h1>گەڕاندنەوە</h1>
        <Link
          href="/admin/students"
          className={buttonVariants({ variant: "default" })}
        >
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <Card className="text-start" dir="rtl">
        <CardHeader>
          <CardTitle>زیادکردنی فێرخواز</CardTitle>
          <CardDescription>زیادکردنی فێرخوازی نوێ بۆ سیستەم</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Row 1: Entrance Year, Student Code, Email */}
              <div className="flex gap-4 w-full">
                <FormField
                  control={form.control}
                  name="entranceYearId"
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
                          {entranceYears.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              هیچ ساڵێک نییە
                            </SelectItem>
                          ) : (
                            entranceYears.map((year) => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.name}
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
                  name="studentCode"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>کۆدی فێرخواز</FormLabel>
                      <FormControl>
                        <Input placeholder="کۆدی فێرخواز" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>ناونیشانی ئیمەیڵ</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Full Names, Gender */}
              <div className="flex gap-4 w-full">
                <FormField
                  control={form.control}
                  name="fullNameEn"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Full Name (English)</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name (English)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullNameKu"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>ناوی تەواو (کوردی)</FormLabel>
                      <FormControl>
                        <Input placeholder="ناوی تەواو" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>ڕەگەز</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="ڕەگەز" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">نێر</SelectItem>
                          <SelectItem value="Female">مێ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Mobile, Department */}
              <div className="flex gap-4 w-full">
                <FormField
                  control={form.control}
                  name="mobileNo"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>ژمارەی مۆبایل</FormLabel>
                      <FormControl>
                        <Input placeholder="0750 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>بەش</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="بەشی فێرخواز هەڵبژێرە" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              هیچ بەشێک نییە
                            </SelectItem>
                          ) : (
                            departments.map((department) => (
                              <SelectItem
                                key={department.id}
                                value={department.id}
                              >
                                {department.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 4: Room Assignment (Optional) */}
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>ژوور (دڵخواز)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="هیچ ژوورێک دیاری نەکراوە" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          هیچ ژوورێک دیاری نەکە
                        </SelectItem>
                        {availableRooms.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            هیچ ژوورێکی بەردەست نییە
                          </SelectItem>
                        ) : (
                          availableRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.dormitory.title} - نهۆم {room.floorNumber} -
                              ژوور {room.roomNumber} ({room.currentOccupancy}/
                              {room.capacity})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 5: Is Active */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>فێرخواز چالاکە</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        ئەگەر فێرخوازەکە ئێستا لە زانکۆدایە ئەم بژاردەیە چالاک
                        بکە
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    تکایە چاوەڕێ بە...
                  </>
                ) : (
                  <>
                    <PlusIcon className="mr-1" size={16} />
                    زیادکردنی فێرخواز
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
