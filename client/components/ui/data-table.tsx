import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "select";
  filterOptions?: { value: string; label: string }[];
  render?: (item: T) => React.ReactNode;
}

export interface FilterState {
  [key: string]: string | null;
  sortField: string | null;
  sortDirection: SortDirection;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems?: number;
  loading?: boolean;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filters,
  onFiltersChange,
  currentPage,
  onPageChange,
  itemsPerPage,
  totalItems,
  loading = false,
  actions,
}: DataTableProps<T>) {
  const [pendingFilters, setPendingFilters] = useState<Record<string, string>>(
    {}
  );

  const handleSort = (field: string) => {
    const newFilters = { ...filters };
    if (newFilters.sortField === field) {
      newFilters.sortDirection =
        newFilters.sortDirection === "asc" ? "desc" : "asc";
    } else {
      newFilters.sortField = field;
      newFilters.sortDirection = "asc";
    }
    onFiltersChange(newFilters);
  };

  const applyTextFilter = (key: string) => {
    const newFilters = { ...filters, [key]: pendingFilters[key] || "" };
    onFiltersChange(newFilters);
  };

  const handleSelectFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const getSortIcon = (field: string) => {
    if (filters.sortField === field) {
      return filters.sortDirection === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      );
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const totalPages = Math.ceil((totalItems || data.length) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = totalItems ? data : data.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)} className={column.width}>
                <div className="flex items-center justify-between">
                  <span>{column.label}</span>
                  {(column.sortable || column.filterable) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Filter className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Filter & Sort</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {column.filterable && (
                          <>
                            <div className="p-2">
                              {column.filterType === "select" ? (
                                <Select
                                  value={
                                    (filters[String(column.key)] as string) ||
                                    "all"
                                  }
                                  onValueChange={(value) =>
                                    handleSelectFilter(
                                      String(column.key),
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {column.filterOptions?.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  placeholder={`Search ${column.label.toLowerCase()}...`}
                                  value={
                                    pendingFilters[String(column.key)] ??
                                    (filters[String(column.key)] || "")
                                  }
                                  onChange={(e) =>
                                    setPendingFilters((prev) => ({
                                      ...prev,
                                      [String(column.key)]: e.target.value,
                                    }))
                                  }
                                  onBlur={() =>
                                    applyTextFilter(String(column.key))
                                  }
                                  className="h-8"
                                />
                              )}
                            </div>
                            {column.sortable && <DropdownMenuSeparator />}
                          </>
                        )}

                        {column.sortable && (
                          <DropdownMenuItem
                            onClick={() => handleSort(String(column.key))}
                          >
                            {getSortIcon(String(column.key))}
                            <span className="ml-2">
                              Sort{" "}
                              {filters.sortField === String(column.key) &&
                              filters.sortDirection === "asc"
                                ? "Z-A"
                                : "A-Z"}
                            </span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableHead>
            ))}
            {actions && <TableHead className="w-[80px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item, index) => (
            <TableRow key={item.id || index}>
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {column.render
                    ? column.render(item)
                    : String(item[column.key] || "")}
                </TableCell>
              ))}
              {actions && <TableCell>{actions(item)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, totalItems || data.length)} of{" "}
          {totalItems || data.length} items
        </div>

        {totalPages > 1 && (
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => {
                  const showPage =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1);

                  const showEllipsis =
                    (pageNumber === currentPage - 2 && currentPage > 3) ||
                    (pageNumber === currentPage + 2 &&
                      currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNumber}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
