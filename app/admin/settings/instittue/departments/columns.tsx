"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepartmentRowAction } from "./DepartmentRowAction";
// import { EducationalYearRowActions } from "./educationalYear";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type AdminDEpartmentRow = {
  id: string;
  code: string;
  name: string;
};

export const columns: ColumnDef<AdminDEpartmentRow>[] = [
  {
    accessorKey: "code",
    header: () => <div className="text-right">کۆد</div>,
  },
  {
    accessorFn: (row) => row.name,
    id: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex justify-end"
      >
        بەشەکان
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DepartmentRowAction department={row.original} />,
  },
];
