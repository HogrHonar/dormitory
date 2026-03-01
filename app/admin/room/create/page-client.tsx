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

import { RoomSchema, RoomSchemaType } from "@/lib/zodSchemas";
import { createRoomAction } from "./action";

interface CreateRoomClientProps {
  dormitories: { id: string; title: string }[];
}

export default function CreateRoomClient({
  dormitories,
}: CreateRoomClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<RoomSchemaType>({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      dormId: "",
      floorNumber: 0,
      roomNumber: 0,
      capacity: 0,
    },
  });

  function onSubmit(values: RoomSchemaType) {
    startTransition(async () => {
      const res = await createRoomAction(values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Room created successfully");
      form.reset();
      router.push("/admin/room");
    });
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>زیادکردنی ژوور</CardTitle>
        <CardDescription>دروستکردنی ژوورێکی نوێ</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dormitory Selection */}
            <FormField
              control={form.control}
              name="dormId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>نوێخانە</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="هەڵبژاردنی نوێخانە" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dormitories.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          هیچ بەشە ناوخۆیی نییە
                        </SelectItem>
                      ) : (
                        dormitories.map((dormitory) => (
                          <SelectItem key={dormitory.id} value={dormitory.id}>
                            {dormitory.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Floor Number */}
            <FormField
              control={form.control}
              name="floorNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ژمارەی نهۆم</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormDescription>
                    نهۆمی خوارەوە = 0، نهۆمی یەکەم = 1، هتد
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room Number */}
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ژمارەی ژوور</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      placeholder="101"
                    />
                  </FormControl>
                  <FormDescription>
                    ژمارەی یەکتای ژوور لە نهۆمەکە
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacity */}
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>بەرزترین ژمارە</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      placeholder="4"
                    />
                  </FormControl>
                  <FormDescription>
                    ژمارەی فێرخوازان لە ژوورەکە (بنەڕەت: 4)
                  </FormDescription>
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
