// src/shared/components/ui/table/PaginatedTable.tsx
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Button } from '@/shared/components/spread_sheet_swarm/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  header: string;
  width: number;
  renderCell?: (item: any) => React.ReactNode;
  hideInExpanded?: boolean;
}

interface PaginatedTableProps {
  columns: Column[];
  data: any[];
  pageSize?: number;
  className?: string;
  expandable?: boolean; // New prop to control expandability
}

export function PaginatedTable({
  columns,
  data,
  pageSize = 10,
  className,
  expandable = false, // Default to non-expandable
}: PaginatedTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(
    new Set(),
  );

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  const toggleRow = (id: string) => {
    if (!expandable) return;
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border overflow-hidden">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {expandable && <TableHead className="w-[50px] px-2"></TableHead>}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="whitespace-nowrap"
                  style={{
                    width: `${column.width}px`,
                    maxWidth: `${column.width}px`,
                  }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow
                  className={cn(
                    'group',
                    expandable && expandedRows.has(item.id) && 'bg-muted/50',
                    expandable && 'cursor-pointer hover:bg-muted/50',
                  )}
                >
                  {expandable && (
                    <TableCell
                      className="w-[50px] px-2"
                      onClick={() => toggleRow(item.id)}
                    >
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedRows.has(item.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      style={{
                        width: `${column.width}px`,
                        maxWidth: `${column.width}px`,
                      }}
                      onClick={() =>
                        !column.renderCell && expandable && toggleRow(item.id)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            'truncate',
                            !column.renderCell &&
                              expandable &&
                              'cursor-pointer',
                          )}
                          title={
                            column.renderCell ? undefined : item[column.key]
                          }
                        >
                          {column.renderCell
                            ? column.renderCell(item)
                            : item[column.key]}
                        </div>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
                {expandable && expandedRows.has(item.id) && (
                  <TableRow className="bg-muted/50">
                    <TableCell
                      colSpan={columns.length + 1}
                      className="px-4 py-4"
                    >
                      <div className="grid gap-4">
                        {columns
                          .filter((column) => !column.hideInExpanded)
                          .map((column) => (
                            <div key={column.key} className="space-y-2">
                              <div className="font-medium text-sm text-muted-foreground">
                                {column.header}
                              </div>
                              <div className="text-sm whitespace-pre-wrap">
                                {item[column.key]}
                              </div>
                            </div>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
