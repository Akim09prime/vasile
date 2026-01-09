
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
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Lead } from "@/lib/types"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onDelete: () => void;
  onStatusChange: (id: string, status: Lead['status']) => void;
}

export function DataTableRowActions<TData>({
  row,
  onDelete,
  onStatusChange
}: DataTableRowActionsProps<TData>) {
  const lead = row.original as Lead;
  const leadStatuses: Lead['status'][] = ['new', 'contacted', 'qualified', 'lost', 'won'];


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
        <DropdownMenuItem>
          View Lead Details
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {leadStatuses.map(status => (
                <DropdownMenuItem 
                  key={status} 
                  onClick={() => onStatusChange(lead.id, status)}
                  disabled={lead.status === status}
                >
                  <span className="capitalize">{status}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          Delete Lead
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
