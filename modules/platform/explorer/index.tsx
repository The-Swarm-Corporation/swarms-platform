'use client';

import { trpc } from '@/shared/utils/trpc/trpc';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import AddSwarmModal from './components/add-swarm-modal';
import Input from '@/shared/components/ui/Input';
import useModels from './hook/models';
import { explorerOptions } from '@/shared/constants/explorer';
import AddPromptModal from './components/add-prompt-modal';
import Models from './components/content/models';
import Prompts from './components/content/prompts';
import Swarms from './components/content/swarms';
import { Activity, Grid2X2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const Explorer = () => {
  const models = trpc.explorer.getModels.useQuery();
  const allSwarms = trpc.explorer.getAllApprovedSwarms.useQuery();
  const synthifyMagicLink = trpc.explorer.synthifyMagicLink.useMutation();
  const pendingSwarms = trpc.explorer.getMyPendingSwarms.useQuery();

  const isLoading = allSwarms.isLoading || pendingSwarms.isLoading;
  const reloadSwarmStatus = trpc.explorer.reloadSwarmStatus.useMutation();

  // Prompts
  const allPrompts = trpc.explorer.getAllPrompts.useQuery();

  const [addSwarModalOpen, setAddSwarmModalOpen] = useState(false);
  const [addPromptModalOpen, setAddPromptModalOpen] = useState(false);
  const {
    filteredModels,
    filteredSwarms,
    filteredPrompts,
    search,
    options,
    filterOption,
    isDataLoading,
    handleSearchChange,
    handleOptionChange,
    handleRemoveOption,
  } = useModels();

  const toast = useToast();
  const trySynthify = async () => {
    if (synthifyMagicLink.isPending) {
      return;
    }
    const t = toast.toast({
      title: 'wait a moment...',
      duration: 10000,
    });
    synthifyMagicLink
      .mutateAsync()
      .then((res) => {
        window.open(res as string, '_blank');
      })
      .catch((err) => {
        t.update({
          id: t.id,
          title: 'Something went wrong',
          variant: 'destructive',
          duration: 3000,
        });
      })
      .finally(() => { });
  };
  useEffect(() => {
    if (!pendingSwarms.isLoading && pendingSwarms.data) {
      pendingSwarms.data.data?.forEach((swarm) => {
        reloadSwarmStatus.mutateAsync(swarm.id).then((res) => {
          if (res != swarm.status) {
            pendingSwarms.refetch();
          }
        });
      });
    }
  }, [pendingSwarms.isLoading]);
  const onAddSuccessfuly = () => {
    pendingSwarms.refetch();
  };

  const onAddPrompt = () => {
    allPrompts.refetch();
  };

  const elements = [
    { key: 'models', content: <Models {...{ models, filteredModels }} /> },
    {
      key: 'prompts',
      content: (
        <Prompts {...{ allPrompts, filteredPrompts, setAddPromptModalOpen }} />
      ),
    },
    {
      key: 'swarms',
      content: (
        <Swarms
          {...{
            isLoading,
            pendingSwarms,
            filteredSwarms,
            setAddSwarmModalOpen,
            trySynthify,
          }}
        />
      ),
    },
  ];

  // Rearrange elements based on filterOption
  const reorderedElements = elements.sort((a, b) => {
    if (a.key === filterOption) return -1;
    if (b.key === filterOption) return 1;
    return 0;
  });

  return (
    <>
      <AddSwarmModal
        onAddSuccessfuly={onAddSuccessfuly}
        isOpen={addSwarModalOpen}
        onClose={() => setAddSwarmModalOpen(false)}
      />
      <AddPromptModal
        onAddSuccessfully={onAddPrompt}
        isOpen={addPromptModalOpen}
        onClose={() => setAddPromptModalOpen(false)}
      />
      <div className="w-full flex flex-col h-full">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Explorer</h1>
          <span className="mt-4 text-muted-foreground">
            Find which one that suits your task such as accounting, finance,
            marketing, etc.
          </span>
        </div>
        <div className="mt-8 pb-4 sticky top-20 bg-white dark:bg-black z-10">
          <ul className="p-0 mb-2 flex items-center gap-3">
            {options.map((option) => {
              const colorSelector =
                filterOption === option || filterOption === 'all'
                  ? 'text-green-500'
                  : 'text-primary';
              return (
                <li
                  key={option}
                  className={cn(
                    'shadow cursor-pointer capitalize text-center rounded-sm flex items-center justify-center bg-secondary text-foreground w-24 p-1 px-2 text-sm',
                    colorSelector,
                  )}
                >
                  {option}
                  <Activity
                    size={15}
                    className={cn('ml-2 font-bold', colorSelector)}
                  />
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search..."
              onChange={handleSearchChange}
              value={search}
              disabled={isDataLoading}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            />

            <Select
              onValueChange={(value) => {
                handleOptionChange(value);
              }}
              disabled={isDataLoading}
              value={filterOption}
            >
              <SelectTrigger className="w-1/2 xl:w-1/4 cursor-pointer">
                <SelectValue placeholder={filterOption} />
              </SelectTrigger>
              <SelectContent>
                {explorerOptions?.map((option) => (
                  <SelectItem key={option.label} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col h-full">
          {reorderedElements.map(({ content }) => content)}
        </div>
      </div>
    </>
  );
};

export default Explorer;
