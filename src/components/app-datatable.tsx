"use client";

// components/DataTable.tsx
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  currentPage: number;
  pageSize: number;
  pageSizeOptions?: number[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  currentPage,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  // Create a new URLSearchParams instance from the current searchParams
  const createQueryString = (newPage?: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update parameters only if they're provided
    if (newPage !== undefined) {
      params.set("page", newPage.toString());
    }

    if (newPageSize !== undefined) {
      params.set("pageSize", newPageSize.toString());
    }

    return params.toString();
  };

  const handlePageChange = (page: number) => {
    const queryString = createQueryString(page, undefined);
    router.push(`${pathname}?${queryString}`);
  };

  const handlePageSizeChange = (size: number) => {
    // When page size changes, go back to page 1
    const queryString = createQueryString(1, size);
    router.push(`${pathname}?${queryString}`);
  };

  // Generate pagination numbers to display
  const generatePagination = () => {
    // Always show first and last page
    // Show 1 page before and after current page
    // Use ellipsis for gaps
    const delta = 1;
    const pages = [];

    // Calculate range
    let left = Math.max(1, currentPage - delta);
    let right = Math.min(pageCount, currentPage + delta);

    // Adjust if needed
    if (left > 2) {
      pages.push(1);
      if (left > 3) {
        pages.push("ellipsis-start");
      } else if (left === 3) {
        pages.push(2);
      }
    }

    // Add all pages in the calculated range
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    // Add end pages
    if (right < pageCount - 1) {
      if (right === pageCount - 2) {
        pages.push(pageCount - 1);
      } else if (right < pageCount - 2) {
        pages.push("ellipsis-end");
      }
      pages.push(pageCount);
    }

    return pages;
  };

  const paginationItems = generatePagination();

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer with shadcn/ui Pagination */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div>
            <p className="text-sm text-muted-foreground">Rows per page</p>
          </div>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              handlePageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="justify-center lg:justify-end flex-1 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {paginationItems.map((page, i) =>
              page === "ellipsis-start" || page === "ellipsis-end" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page as number);
                    }}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < pageCount) {
                    handlePageChange(currentPage + 1);
                  }
                }}
                aria-disabled={currentPage >= pageCount}
                className={
                  currentPage >= pageCount
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
