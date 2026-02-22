"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CategoryRowActions } from "./editAndDeleteCategoriesForm";

export type AdminCategoriesProps = {
  id: string;
  name: string;
};

export const columns: ColumnDef<AdminCategoriesProps>[] = [
  {
    accessorKey: "name",
    header: () => <div className="text-right">ناونیشان</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;

      return <CategoryRowActions categories={category} />;
    },
  },
];
