'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Send,
  Shield,
  Hexagon,
  Lock,
  Radio,
  Cpu,
  Power,
  ChevronUp,
  ChevronDown,
  Upload,
} from 'lucide-react';
import { useFileUpload } from './hooks/useFileUpload';
import { useAgents } from './hooks/useChatAgents';
import { useConversations } from './hooks/useConversations';
import LoadSequence from './components/loader';
import { ConversationSidebar } from './components/sidebar/conversations';
import { cn } from '@/shared/utils/cn';
import { FilePreview } from './components/file';
import { ProgressBar } from './components/progress';
import { AgentSidebar } from './components/sidebar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentId?: string;
}

interface SwarmsChatProps {
  modelFunction?: (message: string) => Promise<string>;
}

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function SwarmsChat({
  modelFunction = async (message: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `Response to: ${message}`;
  },
}: SwarmsChatProps) {
  const [isFetching, setIsFetching] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);
  const {
    files,
    dragActive,
    uploadProgress,
    handleDrag,
    handleDrop,
    removeFile,
    clearFiles,
    handleFileSelect,
  } = useFileUpload();
  const {
    agents,
    swarmConfig,
    addAgent,
    updateAgent,
    removeAgent,
    updateSwarmArchitecture,
    toggleAgent,
  } = useAgents();
  const {
    conversations,
    activeConversation,
    isLoading: isLoadingConversations,
    error: conversationsError,
    createConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    exportConversation,
  } = useConversations();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;

        recognition.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');

          setInput(transcript);
        };
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isLoadingConversations && conversations.length === 0) {
      createConversation('New Chat');
    }
  }, [isLoadingConversations, conversations.length, createConversation]);

  useEffect(() => {
    if (activeConversation) {
      setMessages(activeConversation.messages);
    }
  }, [activeConversation]);

  const toggleListening = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
    }
    setIsListening(!isListening);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !activeConversation) return;

    const userMessage = input.trim();
    const timestamp = getCurrentTime();

    // Add user message
    const userMessageObj = {
      role: 'user' as const,
      content: userMessage,
      timestamp,
    };
    await addMessage(userMessageObj);
    setInput('');
    setIsLoading(true);

    try {
      const activeAgents = swarmConfig.agents.filter((agent) => agent.isActive);

      if (swarmConfig.architecture === 'concurrent') {
        const responses = await Promise.all(
          activeAgents.map(async (agent) => {
            const response = await modelFunction(userMessage);
            return { agent, response };
          }),
        );

        for (const { agent, response } of responses) {
          await addMessage({
            role: 'assistant',
            content: response,
            timestamp: getCurrentTime(),
            agentId: agent.id,
          });
        }
      } else if (swarmConfig.architecture === 'sequential') {
        for (const agent of activeAgents) {
          const response = await modelFunction(userMessage);
          await addMessage({
            role: 'assistant',
            content: response,
            timestamp: getCurrentTime(),
            agentId: agent.id,
          });
        }
      } else {
        const [primaryAgent, ...secondaryAgents] = activeAgents;
        if (primaryAgent) {
          const primaryResponse = await modelFunction(userMessage);
          await addMessage({
            role: 'assistant',
            content: primaryResponse,
            timestamp: getCurrentTime(),
            agentId: primaryAgent.id,
          });

          for (const agent of secondaryAgents) {
            const response = await modelFunction(primaryResponse);
            await addMessage({
              role: 'assistant',
              content: response,
              timestamp: getCurrentTime(),
              agentId: agent.id,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      await addMessage({
        role: 'assistant',
        content: 'An error occurred. Please try again.',
        timestamp: getCurrentTime(),
      });
    }

    setIsLoading(false);
  };

  const getAgentName = (agentId?: string) => {
    if (!agentId) return 'System';
    const agent = agents.find((a) => a.id === agentId);
    return agent ? agent.name : 'Unknown Agent';
  };

  if (isFetching) {
    return <LoadSequence onComplete={() => setIsFetching(false)} />;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 lg:ml-[80px] max-lg:mt-16 transition-colors duration-300',
        'bg-zinc-50 dark:bg-[#000000]',
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-100/50 to-zinc-50/80 dark:from-zinc-950/50 dark:to-black" />
      <div className="relative w-full h-full flex">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConversation?.id}
          isLoading={isLoadingConversations}
          onCreateConversation={createConversation}
          onSwitchConversation={switchConversation}
          onDeleteConversation={deleteConversation}
          onExportConversation={exportConversation}
        />
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <div className="max-lg:hidden bg-white/40 dark:bg-black/40 backdrop-blur-sm border-b border-red-600/20 p-6 transition-colors duration-300">
              <div className="max-w-screen-xl mx-auto">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Shield className="w-10 h-10 text-red-500" />
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className="absolute inset-0 text-red-500"
                      >
                        <Shield className="w-10 h-10" />
                      </motion.div>
                    </div>
                    <div>
                      <h2 className="text-red-500 font-bold text-3xl tracking-wider flex items-center gap-2">
                        Swarms
                        <span className="text-xs font-normal opacity-50">
                          v1.0.1
                        </span>
                      </h2>
                      <p className="text-red-500/50 text-sm tracking-wide">
                        Swarms Agent System
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="max-w-screen-xl mx-auto">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex flex-col mb-6',
                      message.role === 'user' ? 'items-end' : 'items-start',
                    )}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-red-500/50 text-[10px] lg:text-xs font-mono">
                        {message.timestamp}
                      </span>
                      {message.role === 'assistant' && (
                        <>
                          <Hexagon className="h-3 w-3 lg:w-4 lg:h-4 text-red-500/50" />
                          <span className="text-red-500/70 text-xs font-mono">
                            {getAgentName(message.agentId)}
                          </span>
                        </>
                      )}
                    </div>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-md lg:rounded-lg px-2 lg:px-6 py-3 lg:py-4 relative overflow-hidden transition-colors duration-300',
                        message.role === 'user'
                          ? 'bg-white/80 dark:bg-zinc-950/80 text-zinc-900 dark:text-white border border-red-600/50'
                          : 'bg-red-50/80 dark:bg-black/80 text-red-500 border border-red-600/30',
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-pulse" />
                      <div className="relative text-xs lg:text-base">{message.content}</div>
                    </div>
                  </motion.div>
                ))}

                {files.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <AnimatePresence>
                      {files.map((file, index) => (
                        <FilePreview
                          key={`${file.file.name}-${index}`}
                          file={file}
                          onRemove={() => removeFile(index)}
                        />
                      ))}
                    </AnimatePresence>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <ProgressBar progress={uploadProgress} />
                    )}
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="w-3 h-3 bg-red-500/50 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0.2,
                      }}
                      className="w-3 h-3 bg-red-500/50 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0.4,
                      }}
                      className="w-3 h-3 bg-red-500/50 rounded-full"
                    />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-t border-red-600/20 p-6 transition-colors duration-300">
              <form onSubmit={handleSubmit} className="max-w-screen-xl mx-auto">
                <div className="flex items-center space-x-2 lg:space-x-4">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={cn(
                      'p-2 lg:p-4 rounded-full transition-all duration-300 relative group',
                      isListening
                        ? 'bg-red-600/20 text-red-500 border border-red-600/50'
                        : 'bg-white/80 dark:bg-zinc-950/80 text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 border border-red-600/20',
                    )}
                  >
                    <Mic className="w-3 h-3 lg:w-6 lg:h-6" />
                    <div
                      className={cn(
                        'absolute inset-0 rounded-full',
                        isListening && 'animate-ping bg-red-600/20',
                      )}
                    />
                  </button>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="p-2 lg:p-4 rounded-full transition-all duration-300 relative group bg-white/80 dark:bg-zinc-950/80 text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 border border-red-600/20 cursor-pointer"
                  >
                    <Upload className="w-3 h-3 lg:w-6 lg:h-6" />
                    <div className="absolute inset-0 rounded-full group-hover:animate-ping bg-red-600/20 hidden group-hover:block" />
                  </label>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter your message..."
                      className="w-full bg-white/80 text-xs lg:text-base dark:bg-zinc-950/80 backdrop-blur-sm text-zinc-900 dark:text-red-500 placeholder-zinc-500 dark:placeholder-[#928E8B] border border-red-600/20 rounded-md lg:rounded-lg px-3 lg:px-6 py-2 lg:py-4 focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                    <div className="absolute inset-0 pointer-events-none border border-red-600/10 rounded-lg">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-pulse" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-3 lg:p-4 bg-white/80 dark:bg-zinc-950/80 text-red-500 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative group border border-red-600/20"
                  >
                    <Send className="w-4 h-4 lg:w-6 lg:h-6" />
                    <div className="absolute inset-0 rounded-full group-hover:animate-ping bg-red-600/20 hidden group-hover:block" />
                  </button>
                </div>
              </form>
            </div>
          </div>
          <AgentSidebar
            agents={agents}
            swarmArchitecture={swarmConfig.architecture}
            onAddAgent={addAgent}
            onUpdateAgent={updateAgent}
            onRemoveAgent={removeAgent}
            onUpdateSwarmArchitecture={updateSwarmArchitecture}
            onToggleAgent={toggleAgent}
          />
        </div>
      </div>
      {dragActive && (
        <div className="absolute inset-0 z-50 bg-zinc-50/90 dark:bg-black/90 flex items-center justify-center border-2 border-dashed border-red-600/50">
          <div className="text-red-500 text-xl font-bold">
            Drop files to upload
          </div>
        </div>
      )}
    </div>
  );
}
