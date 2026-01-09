

"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Project } from "@/lib/types"
import { DataTableRowActions } from "./data-table-row-actions"

type GetColumnsParams = {
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}


export const columns = ({ onEdit, onDelete }: GetColumnsParams): ColumnDef<Project>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished")
      return <Badge variant={isPublished ? "default" : "secondary"}>{isPublished ? "Published" : "Draft"}</Badge>
    }
  },
    {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
        const dateString = row.getValue("createdAt") as string;
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US").format(date);
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original
      return (
        <DataTableRowActions 
          row={row} 
          onEdit={() => onEdit(project)}
          onDelete={() => onDelete(project.id)}
        />
      )
    },
  },
]
