
"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { ContactMessage } from "@/lib/types"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onDelete: () => void;
  onStatusChange: (id: string, isRead: boolean) => void;
}

export function DataTableRowActions<TData>({
  row,
  onDelete,
  onStatusChange
}: DataTableRowActionsProps<TData>) {
  const message = row.original as ContactMessage;


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onStatusChange(message.id, !message.isRead)}>
          Mark as {message.isRead ? 'Unread' : 'Read'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          Delete Message
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
