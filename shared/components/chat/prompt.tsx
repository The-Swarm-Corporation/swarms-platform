import React, { useState } from 'react';
import {
  Send,
  Edit2,
  Trash2,
  Maximize,
  MoreHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Button } from '../ui/button';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Separator from '../ui/AuthForms/Separator';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  createdAt: string;
  promptId: string;
  userId: string;
}

interface ChatComponentProps {
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
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = trpc.explorer.getPromptChats.useQuery(
    { promptId, userId },
    { enabled: false },
  );
  const fetchMutation = trpc.explorer.savePromptChat.useMutation();
  const deleteMutation = trpc.explorer.deletePromptChat.useMutation();

  // Load messages only on user interaction
  const loadChat = () => {
    if (!messages.length) {
      fetchMessages.refetch().then(({ data }) => {
        if (data) setMessages(data);
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);

    const newUserMessage = {
      text: input,
      sender: 'user',
      prompt_id: promptId,
      user_id: userId,
    };
    setMessages((prev: any) => [...prev, newUserMessage]);

    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, systemPrompt }),
      });

      const { text } = await response.json();
      const aiResponse = {
        text,
        sender: 'agent',
        prompt_id: promptId,
        user_id: userId,
      };
      setMessages((prev: any) => [...prev, aiResponse]);

      // Store in Supabase
      fetchMutation
        .mutateAsync([newUserMessage, aiResponse])
        .then((res) => console.log(res))
        .catch((e) => console.error(e));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInput(e.target.value);

  const handleDeleteMessage = async (messageId: string) => {
    setMessages((prev: any) => prev.filter((m: any) => m.id !== messageId));
    await deleteMutation.mutateAsync({ messageId });
  };

  return (
    <div className="relative mx-auto bg-[#00000080] border border-[#f9f9f959] shadow-2xl pt-7 md:p-5 md:py-10 mt-10 rounded-lg leading-normal overflow-hidden no-scrollbar w-full">
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
        className="bg-transparent rounded-lg shadow-lg mt-7"
      >
        <div className={`${isExpanded ? 'h-[600px]' : 'h-20'} flex flex-col`}>
          <div className="flex-1 overflow-y-auto px-4 space-y-7">
            <AnimatePresence>
              {messages?.map((message: ChatMessage) => (
                <motion.div
                  key={message?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-4 relative ${
                    message?.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex p-3 rounded-lg ${
                      message?.sender === 'user'
                        ? 'bg-zinc-700 text-white max-w-[75%]'
                        : 'bg-gray-700 text-white max-w-[100%] my-4'
                    }`}
                  >
                    {/* {editingMessageId === message.id ? (
                      <input
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        className="w-full p-1 rounded border"
                      />
                    ) : (
                      message.content
                    )} */}
                    <Markdown className="prose" remarkPlugins={[remarkGfm]}>
                      {message?.text || ''}
                    </Markdown>
                  </div>
                  {message?.sender === 'user' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-zinc-500">
                        <MoreHorizontal size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="absolute -top-4 right-0 mt-1 bg-white shadow-lg rounded-md p-0">
                        <DropdownMenuItem
                          className="flex items-center w-full p-2 rounded-none cursor-pointer text-black"
                          //   onClick={() => {
                          //     setEditingMessageId(message.id);
                          //     setEditInput(message.content);
                          //   }}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <Separator text="" className='py-0' />
                        <DropdownMenuItem
                          className="flex items-center w-full p-2 text-red-500 rounded-none cursor-pointer"
                          onClick={() => handleDeleteMessage(message?.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="py-4 border-t">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 p-4 py-3 border rounded-lg bg-gray-500/10 border-primary outline-none"
                disabled={isLoading}
              />
              <Button
                disabled={isLoading}
                onClick={handleSend}
                className="p-2 py-3 bg-blue-500 text-white rounded-lg"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatComponent;
