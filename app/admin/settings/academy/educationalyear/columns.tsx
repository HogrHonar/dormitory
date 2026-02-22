"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EducationalYearRowActions } from "./educationalYear";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type AdminEducationalYearRow = {
  id: string;
  name: string;
};

export const columns: ColumnDef<AdminEducationalYearRow>[] = [
  {
    accessorFn: (row) => row.name,
    id: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex justify-end"
      >
        ساڵ
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <EducationalYearRowActions educationalYear={row.original} />
    ),
  },
];
