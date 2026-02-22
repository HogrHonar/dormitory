"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";
import { AdminDEpartmentRow } from "./columns";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteDepartment,
  updateDepartment,
} from "@/app/data/(public)/department";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { DepartmentSchema, DepartmentSchemaType } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { tryCatch } from "@/hooks/try-catch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function DepartmentRowAction({
  department,
}: {
  department: AdminDEpartmentRow;
}) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            گۆڕانکاری
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-red-600 focus:text-red-600"
          >
            سڕینەوە
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>سڕینەوە</AlertDialogTitle>
            <AlertDialogDescription>
              دڵنیای لە سڕینەوەی ئەم بەشە؟
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDelete(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDepartment(department.id)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>گۆڕانکاری</DialogTitle>
          </DialogHeader>
          <UpdateDepartmentForm
            id={department.id}
            code={department.code}
            name={department.name}
            onSuccess={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

type AdminDepartmentRowProps = {
  id: string;
  code: string;
  name: string;
  onSuccess: () => void;
};

export function UpdateDepartmentForm({
  id,
  code,
  name,
  onSuccess,
}: AdminDepartmentRowProps) {
  const form = useForm<DepartmentSchemaType>({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: {
      code,
      name,
    },
  });

  async function onSubmit(values: DepartmentSchemaType) {
    const { error } = await tryCatch(
      updateDepartment(id, values.code, values.name),
    );

    if (!error) {
      toast.success("سەرکەوتووبوو");
      onSuccess();
    } else {
      toast.error(error.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>کۆدی بەش</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ناوی بەش</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
