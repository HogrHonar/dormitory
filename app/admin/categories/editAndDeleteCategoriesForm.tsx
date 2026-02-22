import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminCategoriesProps } from "./columns";
import { MoreHorizontal } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";

import {
  deleteCategory,
  updateCategory,
} from "@/app/data/admin/admin-get-categories";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoriesSchema, CategoriesSchemaType } from "@/lib/zodSchemas";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";

type UpdateCategoriesFormProps = {
  id: string;
  name: string;
  onSuccess: () => void;
};
export function UpdateCategoriesForm({
  id,
  name,
  onSuccess,
}: UpdateCategoriesFormProps) {
  const form = useForm<CategoriesSchemaType>({
    resolver: zodResolver(CategoriesSchema),
    defaultValues: { name },
  });

  async function onSubmit(values: CategoriesSchemaType) {
    const { error } = await tryCatch(updateCategory(id, values.name));

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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ناونیشان</FormLabel>
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

export function CategoryRowActions({
  categories,
}: {
  categories: AdminCategoriesProps;
}) {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

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
            <AlertDialogAction onClick={() => deleteCategory(categories.id)}>
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
          <UpdateCategoriesForm
            id={categories.id}
            name={categories.name}
            onSuccess={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
