import React from 'react';
import {
  Send,
  Edit2,
  Trash2,
  Maximize,
  MoreHorizontal,
  OctagonMinus,
  Bot,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import Separator from '../ui/AuthForms/Separator';
import { cn } from '@/shared/utils/cn';
import MarkdownComponent from '../markdown.tsx';
import usePromptChat from './hooks/usePromptChat';

export interface ChatComponentProps {
  promptId: string;
  systemPrompt: string;
  model?: string;
}

const ChatComponent = ({
  promptId,
  systemPrompt,
  model = 'gpt-4o',
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
  } = usePromptChat({ promptId, systemPrompt, model });

  // Local handler for textarea input
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Create a synthetic event that matches the expected HTMLInputElement
    const syntheticEvent = {
      target: { value: e.target.value }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  return (
    <div className="relative w-full h-full bg-black border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-white/80">AI Assistant</span>
          <span className="text-xs text-white/40">• {model}</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
        >
          <Maximize
            className={cn(
              "w-4 h-4 text-white/60 transition-transform duration-200",
              isExpanded ? "rotate-180" : ""
            )}
          />
        </button>
      </div>

      {/* Chat Container */}
      <motion.div
        animate={{ height: isExpanded ? '600px' : '400px' }}
        className="flex flex-col h-full"
      >
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <AnimatePresence>
            {messages?.map((message, index) => (
              <motion.div
                key={`${message?.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                ref={index === messages.length - 1 ? latestMessageRef : null}
                className={cn(
                  "flex items-end gap-3 group",
                  message?.sender === 'user' ? "flex-row-reverse justify-end" : "flex-row justify-start"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-white/10",
                  message?.sender === 'user' 
                    ? "bg-white/10 text-white/80" 
                    : "bg-white/5 text-white/60"
                )}>
                  {message?.sender === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 max-w-[80%] min-w-0 space-y-2">
                  {editingMessageId === message?.response_id ? (
                    <div className="relative">
                      <textarea
                        value={editInput}
                        ref={textareaRef}
                        onChange={(e) => setEditInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendEdit(message?.response_id ?? '');
                          }
                        }}
                        className="w-full min-h-[100px] p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none outline-none focus:border-white/20 transition-colors"
                        placeholder="Edit your message..."
                      />
                    </div>
                  ) : (
                    <div className={cn(
                      "p-4 rounded-lg border transition-all duration-200 overflow-hidden",
                      message?.sender === 'user'
                        ? "bg-white/5 border-white/10 text-white"
                        : "bg-white/3 border-white/5 text-white/90"
                    )}>
                      <div className="overflow-x-auto break-words">
                        <MarkdownComponent text={message?.text || ''} />
                      </div>
                    </div>
                  )}

                  {/* Message Actions */}
                  <div className={cn(
                    "flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                    message?.sender === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-white/10 transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-white/60" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/95 border border-white/10 backdrop-blur-sm">
                        {message?.sender === 'user' && (
                          <>
                            <DropdownMenuItem
                              className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
                              onClick={() => handleEditMessage(message?.response_id || '')}
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <Separator text="" className="bg-white/10" />
                          </>
                        )}
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDeleteMessage(message?.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white/60" />
              </div>
              <div className="flex-1 max-w-[80%]">
                <div className="p-4 bg-white/3 border border-white/5 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-black/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <textarea
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 min-h-[44px] max-h-32 bg-transparent text-white placeholder-white/40 resize-none outline-none border-none focus:ring-0 focus:outline-none"
              disabled={isLoading}
              rows={1}
            />
            <Button
              onClick={isStreaming ? handleStop : handleSend}
              disabled={!input.trim() && !isStreaming}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 ml-2",
                isStreaming 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-white hover:bg-white/90 text-black disabled:bg-white/20 disabled:text-white/40"
              )}
            >
              {isStreaming ? (
                <OctagonMinus className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          {/* Character count or status */}
          <div className="mt-2 flex items-center justify-between text-xs text-white/40">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {input.length > 0 && (
              <span>{input.length} characters</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatComponent;
