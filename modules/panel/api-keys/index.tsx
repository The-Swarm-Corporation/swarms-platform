'use client';

import { Button } from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';
import { trpc } from '@/shared/utils/trpc/trpc';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdDate: string;
};

export const apiKeys: ApiKey[] = [
  {
    createdDate: '2021-09-01T12:00:00Z',
    id: '489e1d42',
    key: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
    name: 'Default'
  },
  {
    createdDate: '2021-09-01T12:00:00Z',
    id: '489e1d42',
    key: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
    name: 'general'
  },
  {
    createdDate: '2021-09-01T12:00:00Z',
    id: '489e1d42',
    key: 'sk_test_4eC39HqLyjWDarjtT1zdp7dc',
    name: 'randomfdfd'
  }
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
const columns: ColumnDef<ApiKey>[] = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'key',
    header: 'Key'
  },
  {
    accessorKey: 'createdDate',
    header: 'Created date',
    cell: (cell) => formatDate(cell.getValue<string>())
  }
];
const formatDate = (date: string) => {
  // like: Jul 28, 2022
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
const ApiKeys = () => {
  const test = trpc.test.useQuery();
  console.log(test.data);
  const table = useReactTable({
    data: apiKeys,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <>
      <div className="flex flex-col w-5/6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">API keys</h1>
        <span className="mt-4 text-muted-foreground">
          Your secret API keys are listed below. Please note that we do not
          display your secret API keys again after you generate them. Do not
          share your API key with others, or expose it in the browser or other
          client-side code. In order to protect the security of your account,
        </span>
        <div className="mt-4">
          {/* api keys table */}
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
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
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="shadow-none">
                Create new API key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add new API key</DialogTitle>
                {/* <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription> */}
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">
                    Name
                  </label>
                  <Input
                    id="name"
                    defaultValue="Pedro Duarte"
                    className="col-span-3"
                    onChange={() => {}}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="username" className="text-right">
                    Username
                  </label>
                  <Input
                    id="username"
                    defaultValue="@peduarte"
                    className="col-span-3"
                    onChange={() => {}}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default ApiKeys;
