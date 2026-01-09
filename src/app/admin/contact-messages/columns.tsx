
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { ContactMessage } from "@/lib/types"
import { DataTableRowActions } from "./data-table-row-actions"

type GetColumnsParams = {
  onDelete: (id: string) => void;
  onStatusChange: (id: string, isRead: boolean) => void;
}


export const columns = ({ onDelete, onStatusChange }: GetColumnsParams): ColumnDef<ContactMessage>[] => [
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
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "isRead",
    header: "Status",
    cell: ({ row }) => {
      const isRead = row.getValue("isRead");
      return <Badge variant={isRead ? 'secondary' : 'default'}>{isRead ? 'Read' : 'Unread'}</Badge>
    }
  },
    {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Received At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const dateString = row.getValue("createdAt") as string;
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("ro-RO", { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const message = row.original
      return (
        <DataTableRowActions 
          row={row} 
          onDelete={() => onDelete(message.id)}
          onStatusChange={onStatusChange}
        />
      )
    },
  },
]
