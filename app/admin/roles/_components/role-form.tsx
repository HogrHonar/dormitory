"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createRoleAction,
  updateRoleAction,
} from "@/app/admin/roles/actions/admin/role-actions";

const roleSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Only letters, numbers, hyphens and underscores",
    ),
  description: z.string().max(255).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  defaultValues?: RoleFormValues & { id?: string };
}

export function RoleForm({ defaultValues }: RoleFormProps) {
  const router = useRouter();
  const isEditing = !!defaultValues?.id;

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  async function onSubmit(values: RoleFormValues) {
    const result = isEditing
      ? await updateRoleAction(defaultValues!.id!, values)
      : await createRoleAction(values);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditing ? "Role updated" : "Role created");
      router.push("/admin/roles");
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. MANAGER" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this role can do..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Role"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/roles")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
