"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { deleteRoleAction } from "@/app/admin/roles/actions/admin/role-actions";
import { toast } from "sonner";

export type AdminRoleRow = {
  id: string;
  name: string;
  description: string | null;
  _count: {
    users: number;
    permissions: number;
  };
  createdAt: Date;
};

export const columns: ColumnDef<AdminRoleRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Role Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" />
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.getValue("description") ?? "—"}
      </span>
    ),
  },
  {
    id: "permissions",
    header: "Permissions",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original._count.permissions} permissions
      </Badge>
    ),
  },
  {
    id: "users",
    header: "Users",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original._count.users} users</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const role = row.original;

      async function handleDelete() {
        const result = await deleteRoleAction(role.id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Role deleted successfully");
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/roles/${role.id}/edit`}>Edit Role</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/roles/${role.id}/permissions`}>
                Manage Permissions
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              Delete Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
