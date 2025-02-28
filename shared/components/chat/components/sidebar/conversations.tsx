'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  MoreVertical,
  Download,
  Trash,
  Pencil,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/utils/cn';
import { Tables } from '@/types_db';
import LoadingSpinner from '@/shared/components/loading-spinner';
import ConversationModal from './conversation-modal';

interface ConversationSidebarProps {
  conversations: Tables<'swarms_cloud_chat'>[];
  activeId?: string;
  isLoading?: boolean;
  isCreatePending: boolean;
  isUpdatePending: boolean;
  isDeletePending: boolean;
  onUpdateConversation: ({ id, name }: { id: string; name: string }) => void;
  onCreateConversation: (name: string) => void;
  onSwitchConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onExportConversation: (id: string) => void;
  conversationRefetch?: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  isLoading,
  isCreatePending,
  isDeletePending,
  isUpdatePending,
  conversationRefetch,
  onUpdateConversation,
  onCreateConversation,
  onSwitchConversation,
  onDeleteConversation,
  onExportConversation,
}: ConversationSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeChatId, setActiveChatId] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [editChatName, setEditChatName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isMobile = useIsMobile();

  const handleCreateConversation = async () => {
    if (!newChatName.trim()) return;

    await onCreateConversation(newChatName.trim());
    setNewChatName('');
    setIsDialogOpen(false);
    conversationRefetch?.();
  };

  const handleEditModalOpen = (id: string) => {
    setActiveChatId(id);
    setIsEditModalOpen(true);
  };

  const handleEditConversation = async () => {
    if (!editChatName.trim()) return;

    await onUpdateConversation({
      id: activeChatId!,
      name: editChatName.trim(),
    });
    setEditChatName('');
    setIsEditModalOpen(false);
    conversationRefetch?.();
  };

  const handleMobileExpand = () => {
    if (!isExpanded && isMobile) {
      setIsExpanded(true);
    }
  };

  useEffect(() => {
    if (isEditModalOpen) {
      const activeConversation = conversations?.find(
        (conversation) => conversation?.id === activeChatId,
      );
      if (activeConversation) {
        setEditChatName(activeConversation?.name || '');
      }
    }
  }, [isEditModalOpen, activeChatId, conversations]);

  return (
    <motion.div
      initial={false}
      animate={{ width: isExpanded ? 280 : isMobile ? 20 : 64 }}
      onClick={handleMobileExpand}
      className="h-full bg-white/40 max-lg:z-10 dark:bg-black/40 backdrop-blur-sm border-r border-red-600/20 flex max-lg:absolute flex-col"
    >
      <div
        className={cn(
          'border-b border-red-600/20 flex items-center justify-between lg:p-4',
          isMobile && isExpanded ? 'p-4' : '',
        )}
      >
        {isExpanded && (
          <h2 className="text-red-500 font-bold">Conversations</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-500"
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div
        className={cn(
          'flex-col h-full lg:flex',
          isMobile && isExpanded ? 'flex' : 'hidden',
        )}
      >
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-red-500/5 animate-pulse"
                />
              ))
            ) : (
              <AnimatePresence>
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      conversation.id === activeId
                        ? 'bg-white/80 dark:bg-zinc-950/80 border-red-600/50'
                        : 'bg-transparent border-transparent hover:bg-white/40 dark:hover:bg-zinc-900/40'
                    }`}
                    onClick={() => onSwitchConversation(conversation?.id)}
                  >
                    {isExpanded ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="w-5 h-5 text-red-500/70" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-red-500 truncate">
                              {conversation.name}
                            </p>
                            <p className="text-xs text-red-500/50">
                              {format(
                                new Date(
                                  conversation?.updated_at ?? new Date(),
                                ),
                                'MMM d, yyyy',
                              )}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDeletePending}
                              className="text-red-500/70 hover:text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {isDeletePending ? (
                                <LoadingSpinner size={18} />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditModalOpen(conversation?.id);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportConversation(conversation.id);
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await onDeleteConversation(conversation.id);
                                conversationRefetch?.();
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            conversation.id === activeId
                              ? 'bg-red-500'
                              : 'bg-red-500/30'
                          }`}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </div>

      <ConversationModal
        {...{
          isMobile,
          isExpanded,
          isDialogOpen,
          isDeletePending,
          isCreatePending,
          newChatName,
          setIsDialogOpen,
          setNewChatName,
          handleClick: handleCreateConversation,
        }}
      />

      {isEditModalOpen && (
        <ConversationModal
          {...{
            title: 'Edit Conversation',
            description: 'Enter a new name for this conversation.',
            ctaText: 'Save',
            isTrigger: false,
            isMobile,
            isExpanded,
            isDialogOpen: isEditModalOpen,
            isDeletePending,
            isCreatePending: isUpdatePending,
            newChatName: editChatName,
            setIsDialogOpen: setIsEditModalOpen,
            setNewChatName: setEditChatName,
            handleClick: handleEditConversation,
          }}
        />
      )}
    </motion.div>
  );
}
