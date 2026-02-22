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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusIcon } from "lucide-react";

import { DormitorySchema, DormitorySchemaType } from "@/lib/zodSchemas";
import { createDormitoryAction } from "./action";

interface CreateDormitoryClientProps {
  managers: { id: string; name: string }[];
}

export default function CreateDormitoryClient({
  managers,
}: CreateDormitoryClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<DormitorySchemaType>({
    resolver: zodResolver(DormitorySchema),
    defaultValues: {
      title: "",
      managerId: "",
      description: "",
    },
  });

  function onSubmit(values: DormitorySchemaType) {
    startTransition(async () => {
      const res = await createDormitoryAction(values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Dormitory created successfully");
      form.reset();
      router.push("/admin/dormitory");
    });
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>زیادکردنی بەشە ناوخۆیی</CardTitle>
        <CardDescription>دروستکردنی بەشە ناوخۆیییەکی نوێ</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ناونیشان</FormLabel>
                  <FormControl>
                    <Input placeholder="بەشە ناوخۆییی یەکەم" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Manager (User Selection) */}
            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>بەڕێوەبەر</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="هەڵبژاردنی بەڕێوەبەر" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {managers.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          هیچ بەڕێوەبەرێک نییە
                        </SelectItem>
                      ) : (
                        managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وەسف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وەسفی بەشە ناوخۆیی..."
                      className="resize-none"
                      rows={4}
                      {...field}
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
