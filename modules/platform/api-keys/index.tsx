'use client';

import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { SwarmApiKey } from '@/shared/models/db-types';
import { createQueryString, formatDate } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { PLATFORM } from '@/shared/utils/constants';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import GenerateKeyComponent from './components/generate-key';

const ApiKeys = () => {
  const { user } = useAuthContext();
  const apiKeys = user ? trpc.apiKey.getApiKeys.useQuery() : null;
  const addApiKey = trpc.apiKey.addApiKey.useMutation();
  const [keyName, setKeyName] = useState<string>('');

  const router = useRouter();
  const [generatedKey, setGeneratedKey] = useState<string | null>('');
  const toast = useToast();
  const columns: ColumnDef<Partial<SwarmApiKey>>[] = useMemo(() => {
    return [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'key',
        header: 'Key',
      },
      {
        accessorKey: 'created_at',
        header: 'Created date',
        cell: (cell) => formatDate(cell.getValue<string>()),
      },
      {
        accessorKey: 'id',
        header: 'Actions',
        cell: (cell) => {
          const deleteApiKey = trpc.apiKey.deleteApiKey.useMutation();
          return (
            <Button
              variant="outline"
              disabled={deleteApiKey.isPending}
              onClick={() => {
                deleteApiKey
                  .mutateAsync(cell.row.original.id as string)
                  .then(() => {
                    apiKeys?.refetch?.();
                    toast.toast({
                      title: 'API key deleted',
                    });
                  });
              }}
            >
              Delete
            </Button>
          );
        },
      },
    ];
  }, []);

  const table = useReactTable({
    data: apiKeys?.data ?? [],
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
  });

  const generate = async () => {
    if (addApiKey.isPending) {
      return;
    }

    try {
      const user = await checkUserSession();

      if (!user) {
        toast.toast({
          description: 'You need to be logged in to generate an API key',
          variant: 'destructive',
        });
        return;
      }

      const data = await addApiKey.mutateAsync({ name: keyName });

      setKeyName('');
      setGeneratedKey(data?.key ?? '');
      apiKeys?.refetch();

      toast.toast({
        title: 'API key created',
      });

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch (error: any) {
      toast.toast({
        description:
          error.message || 'An error occurred while creating API key',
        variant: 'destructive',
      });

      if (error.message) {
        if (error.message.toLowerCase().includes('payment method missing')) {
          const params = createQueryString({
            card_available: 'false',
          });
          router.push(PLATFORM.ACCOUNT + '?' + params);
        }

        if (error.message.toLowerCase().includes('not found')) {
          router.push(PLATFORM.ACCOUNT);
        }
      }
    }
  };

  return (
    <>
      <div className="flex flex-col w-5/6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">API keys</h1>
        <span className="mt-4 text-muted-foreground">
          Your secret API keys are listed below. Please note that we do not
          display your secret API keys again after you generate them. Do not
          share your API key with others, or expose it in the browser or other
          client-side code.
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
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {apiKeys?.isPending && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!apiKeys?.isPending &&
                (table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
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
                ))}
            </TableBody>
          </Table>
        </div>
        {user && (
          <GenerateKeyComponent
            {...{
              page: 'api-key',
              addApiKey,
              generate,
              generatedKey,
              setGeneratedKey,
              setKeyName,
              keyName,
            }}
          />
        )}
        <div className="py-8" />
      </div>
    </>
  );
};

export default ApiKeys;
