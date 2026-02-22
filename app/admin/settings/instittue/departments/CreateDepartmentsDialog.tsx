"use client";
import { createDepartment } from "@/app/data/(public)/department";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { DepartmentSchema, DepartmentSchemaType } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function CreateDepartmentsDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>زیادکردن</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>زیادکردنی بەش</DialogTitle>
          <DialogDescription>بەش زیاد بکە</DialogDescription>
        </DialogHeader>
        <CreateDepartmentsForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

type CreateDepartmentsFormProps = {
  onSuccess: () => void;
};
export function CreateDepartmentsForm({
  onSuccess,
}: CreateDepartmentsFormProps) {
  const form = useForm<DepartmentSchemaType>({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });
  async function onSubmit(values: DepartmentSchemaType) {
    const { error } = await tryCatch(createDepartment(values));

    if (!error) {
      toast.success("سەرکەوتووبوو");
      onSuccess();
    } else {
      toast.error(error.message);
    }
  }
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ناوی بەش</FormLabel>
                <FormControl>
                  <Input placeholder="ناوی بەش" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کۆدی بەش</FormLabel>
                <FormControl>
                  <Input placeholder="کۆدی بەش" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </form>
      </Form>
    </>
  );
}
