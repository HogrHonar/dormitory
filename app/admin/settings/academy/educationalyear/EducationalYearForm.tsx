"use client";
import { createEducationalYear } from "@/app/data/(public)/educationYear";
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
import {
  EducationalYearSchema,
  EducationalYearSchemaType,
} from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function CreateEducationalYearDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>زیادکردن</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>زیادکردنی ساڵە خوێندن</DialogTitle>
            <DialogDescription>ساڵە خوێندن زیاد بکە</DialogDescription>
          </DialogHeader>
          <CreateEducationalYearForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

type CreateEducationalYearFormProps = {
  onSuccess: () => void;
};

export function CreateEducationalYearForm({
  onSuccess,
}: CreateEducationalYearFormProps) {
  const form = useForm<EducationalYearSchemaType>({
    resolver: zodResolver(EducationalYearSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: EducationalYearSchemaType) {
    const { error } = await tryCatch(createEducationalYear(values.name));

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
              <FormLabel>ناونیشانی ساڵی خوێندن</FormLabel>
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
