'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  MoreVertical,
  Plus,
  Download,
  Trash,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useIsMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/utils/cn';
import { Tables } from '@/types_db';

interface ConversationSidebarProps {
  conversations: Tables<"swarms_cloud_chat">[];
  activeId?: string;
  isLoading?: boolean;
  onCreateConversation: (name: string) => void;
  onSwitchConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onExportConversation: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  isLoading,
  onCreateConversation,
  onSwitchConversation,
  onDeleteConversation,
  onExportConversation,
}: ConversationSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newChatName, setNewChatName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isMobile = useIsMobile();

  const handleCreateConversation = () => {
    if (newChatName.trim()) {
      onCreateConversation(newChatName.trim());
      setNewChatName('');
      setIsDialogOpen(false);
    }
  };

  const handleMobileExpand = () => {
    if (!isExpanded && isMobile) {
      setIsExpanded(true);
    }
  };

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
                                new Date(conversation?.updated_at ?? new Date()),
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
                              className="text-red-500/70 hover:text-red-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation(conversation.id);
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

      <div
        className={cn(
          'p-4 border-t border-red-600/20 pb-8 lg:block',
          isMobile && isExpanded ? 'block' : 'hidden',
        )}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className={`${isExpanded ? 'w-full' : 'w-auto'} bg-red-500 hover:bg-red-600 text-white`}
            >
              <Plus className="h-4 w-4" />
              {isExpanded && <span className="ml-2">New Chat</span>}
            </Button>
          </DialogTrigger>
          <DialogContent className="border-[#40403F] border">
            <DialogHeader>
              <DialogTitle>New Conversation</DialogTitle>
              <DialogDescription>
                Give your conversation a name to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Input
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="Enter conversation name..."
                className="bg-white/80 dark:bg-zinc-950/80"
              />
              <Button
                onClick={handleCreateConversation}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                disabled={!newChatName.trim()}
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}
