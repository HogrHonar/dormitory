"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { expenseSchema } from "@/lib/zodSchemas";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function FileUploadInput({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileFormData = new FormData();
      fileFormData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: fileFormData,
      });

      if (!uploadResponse.ok) throw new Error("فایلەکە بارنەبوو");

      const uploadData = await uploadResponse.json();
      onChange(uploadData.url);
      setFileName(file.name);
    } catch (err) {
      toast.error("فایلەکە بارنەبوو");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,.pdf"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading
          ? "چاوەڕوانبە..."
          : (fileName ?? (value ? "فایلێکی نوێ هەڵبژێرە" : "فایل هەڵبژێرە"))}
      </Button>
      {value && !isUploading && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 underline whitespace-nowrap"
        >
          بینینی فایل
        </a>
      )}
    </div>
  );
}

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface Category {
  id: string;
  name: string;
}

interface Dorm {
  id: string;
  title: string;
}

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormValues>;
  categories: Category[];
  dorms: Dorm[];
  onSubmit: (
    values: ExpenseFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
  onSuccess: () => void;
  submitLabel: string;
}

export function ExpenseForm({
  defaultValues,
  categories,
  dorms,
  onSubmit,
  onSuccess,
  submitLabel,
}: ExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      description: "",
      date: new Date(),
      documentUrl: "",
      categoryId: "",
      dormId: "",
      ...defaultValues,
    },
  });

  function handleSubmit(values: ExpenseFormValues) {
    startTransition(async () => {
      const result = await onSubmit(values);
      if (result.success) {
        toast.success("کارەکە سەرکەوتوو بوو");
        onSuccess();
      } else {
        toast.error(result.error ?? "هەڵەیەک ڕوویدا");
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
        dir="rtl"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ناونیشان</FormLabel>
              <FormControl>
                <Input placeholder="ناونیشانی خەرجی" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>بڕی پارە (د.ع)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="0"
                    value={
                      field.value ? Number(field.value).toLocaleString() : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, "");
                      field.onChange(Number(raw));
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>ڕێکەوت</FormLabel>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        onClick={() => setOpen(true)}
                        className={cn(
                          "w-full justify-between text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? format(field.value, "yyyy-MM-dd")
                          : "Select date"}
                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>جۆر</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="جۆرێک هەڵبژێرە" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dormId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>بەشە ناوخۆیی (ئارەزوومەند)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="بەشە ناوخۆییەک هەڵبژێرە" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NO_DORM">هیچ</SelectItem>
                    {dorms.map((dorm) => (
                      <SelectItem key={dorm.id} value={dorm.id}>
                        {dorm.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تێبینی (ئارەزوومەند)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="تێبینی زیاتر بنووسە..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>بەڵگەنامە (ئارەزوومەند)</FormLabel>
              <FormControl>
                <FileUploadInput
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "چاوەڕوانبە..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
