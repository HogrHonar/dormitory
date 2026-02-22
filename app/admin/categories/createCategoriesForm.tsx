"use client";

import { createCategory } from "@/app/data/admin/admin-get-categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { tryCatch } from "@/hooks/try-catch";
import { CategoriesSchema, CategoriesSchemaType } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>زیادکردن</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>زیادکردنی جۆر</DialogTitle>
            <DialogDescription>جۆر زیاد بکە</DialogDescription>
          </DialogHeader>
          <CreateCategoryForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

type CreateCategoryFormProps = {
  onSuccess: () => void;
};

export function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const form = useForm<CategoriesSchemaType>({
    resolver: zodResolver(CategoriesSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CategoriesSchemaType) {
    const { error } = await tryCatch(createCategory(values.name));

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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
