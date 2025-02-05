import React from 'react';
import {
  Send,
  Edit2,
  Trash2,
  Maximize,
  MoreHorizontal,
  OctagonMinus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Separator from '../ui/AuthForms/Separator';
import { cn } from '@/shared/utils/cn';
import usePromptChat from './hook';

export interface ChatComponentProps {
  promptId: string;
  systemPrompt: string;
  userId: string;
  model?: string;
}

const ChatComponent = ({
  promptId,
  systemPrompt,
  userId,
  model = 'gpt-4',
}: ChatComponentProps) => {
  const {
    input,
    isExpanded,
    isLoading,
    editInput,
    isStreaming,
    messages,
    textareaRef,
    editingMessageId,
    latestMessageRef,
    handleSend,
    handleStop,
    handleSendEdit,
    setEditInput,
    setIsExpanded,
    handleEditMessage,
    handleInputChange,
    handleDeleteMessage,
  } = usePromptChat({ promptId, systemPrompt, userId, model });

  return (
    <div className="relative mx-auto bg-[#00000080] border border-[#f9f9f959] shadow-2xl pt-7 md:p-5 md:py-10 rounded-lg leading-normal overflow-hidden no-scrollbar w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute right-4 top-4 z-10"
      >
        <Maximize
          className={`transform transition-transform ${
            isExpanded ? '' : 'rotate-180'
          }`}
          color="red"
        />
      </button>

      <motion.div
        animate={{ height: isExpanded ? 'auto' : '4rem' }}
        className="bg-transparent rounded-lg shadow-lg mt-5"
      >
        <div className={`${isExpanded ? 'h-[600px]' : 'h-20'} flex flex-col`}>
          <div className="flex-1 overflow-y-auto px-4 space-y-7">
            <AnimatePresence>
              {messages?.map((message, index) => {
                return (
                  <motion.div
                    key={`${message?.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    ref={
                      index === messages.length - 1 ? latestMessageRef : null
                    }
                    className={`flex items-center gap-4 relative ${
                      message?.sender === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex p-3 rounded-lg w-full ${
                        message?.sender === 'user'
                          ? 'bg-zinc-700 text-white max-w-[50%]'
                          : 'bg-gray-700 text-white max-w-full my-4'
                      }`}
                    >
                      {editingMessageId === message?.response_id ? (
                        <textarea
                          value={editInput}
                          ref={textareaRef}
                          onChange={(e) => setEditInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendEdit(message?.response_id ?? '');
                            }
                          }}
                          className="bg-inherit text-inherit resize-none border-none outline-none w-full h-fit"
                        />
                      ) : (
                        <Markdown className="prose w-full" remarkPlugins={[remarkGfm]}>
                          {message?.text || ''}
                        </Markdown>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-zinc-500">
                        <MoreHorizontal size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="absolute -top-4 right-0 mt-1 bg-white shadow-lg rounded-md p-0">
                        {message?.sender === 'user' && (
                          <>
                            <DropdownMenuItem
                              className="flex items-center w-full p-2 rounded-none cursor-pointer text-black"
                              onClick={() =>
                                handleEditMessage(message?.response_id || '')
                              }
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <Separator text="" className="py-0" />
                          </>
                        )}
                        <DropdownMenuItem
                          className="flex items-center w-full p-2 text-red-500 rounded-none cursor-pointer"
                          onClick={() => handleDeleteMessage(message?.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="py-4 border-t">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 p-4 py-3 border rounded-lg bg-gray-500/10 border-primary outline-none"
                disabled={isLoading}
              />
              <Button
                // disabled={isLoading}
                onClick={isStreaming ? handleStop : handleSend}
                className={cn(
                  'p-2 py-3 text-white rounded-lg',
                  isStreaming ? 'bg-primary' : 'bg-destructive',
                )}
              >
                {isStreaming ? (
                  <OctagonMinus className="w-5 h-5" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatComponent;
