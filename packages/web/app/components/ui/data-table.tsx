import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronUp, ChevronDown, ArrowDownNarrowWide, ArrowDownUp, ArrowUpWideNarrow } from "lucide-react";

// internals
import { Button } from "./button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [showAll, setShowAll] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const AMOUNT_TO_SHOW = 2;
  const rows = table.getRowModel().rows;
  const displayedRows = showAll ? rows : rows.slice(0, AMOUNT_TO_SHOW);
  const hasMore = rows.length > AMOUNT_TO_SHOW;

  return (
    <div className="rounded-sm border bg-zinc-950 border-zinc-700 overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-zinc-700 hover:bg-zinc-800 bg-zinc-800">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-zinc-50 h-8 text-sm">
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-1 ${
                          header.column.getCanSort() ? "cursor-pointer select-none" : ""
                        }`}
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          {
                            asc: <ArrowDownNarrowWide className="size-4" />,
                            desc: <ArrowUpWideNarrow className="size-4" />,
                          }[header.column.getIsSorted() as string] ?? <ArrowDownUp className="size-4" />
                        )}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {displayedRows.length ? (
            <>
              {displayedRows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-zinc-900 border-b border-zinc-700 text-sm"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
              {hasMore ? (
                <TableRow className="border-b border-zinc-700 text-sm hover:bg-zinc-950">
                  <TableCell colSpan={columns.length} className="text-center p-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAll(!showAll)}
                      className="text-sm text-zinc-300 hover:text-zinc-50 w-full h-full bg-zinc-950 hover:bg-zinc-950 border-none hover:border-none py-3"
                    >
                      {showAll ? "Ver menos opciones" : `Ver más opciones (${rows.length - AMOUNT_TO_SHOW})`}
                      {showAll ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ) : null}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
