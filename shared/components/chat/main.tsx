'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ellipsis, Mic, Send, Shield } from 'lucide-react';
import { useAgents } from './hooks/useChatAgents';
import { useConversations } from './hooks/useConversations';
import LoadSequence from './components/loader';
import { ConversationSidebar } from './components/sidebar/conversations';
import { cn } from '@/shared/utils/cn';
import { AgentSidebar } from './components/sidebar';
import ChatMessage from './components/message';
import { Tables } from '@/types_db';
import { SwarmsApiClient } from '@/shared/utils/api/swarms';
import { useToast } from '../ui/Toasts/use-toast';
import { useAuthContext } from '../ui/auth.provider';
import { useFileUpload } from './hooks/useFileUpload';

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

const swarmsApi = new SwarmsApiClient(
  process.env.NEXT_PUBLIC_SWARMS_API_KEY || '',
);

export default function SwarmsChat({}: SwarmsChatProps) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(true);
  const [messages, setMessages] = useState<
    Tables<'swarms_cloud_chat_messages'>[]
  >([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);
  const isCreatingConversation = useRef(false);
  const {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading: isLoadingConversations,
    isCreatePending,
    isDeletePending,
    isUpdatePending,
    refetch,
    createConversation,
    updateConversation,
    switchConversation,
    deleteConversation,
    addMessage,
    exportConversation,
  } = useConversations();
  const {
    agents,
    isLoading: isLoadingAgents,
    swarmConfig,
    openAgentModal,
    setOpenAgentModal,
    agentsRefetch,
    addAgent,
    updateAgent,
    removeAgent,
    isCreateAgent,
    isUpdateAgent,
    isToggleAgent,
    isDeleteAgent,
    updateSwarmArchitecture,
    toggleAgent,
  } = useAgents({
    activeConversationId,
  });
  const { imageUrl } = useFileUpload();

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
    if (
      !isLoadingConversations &&
      conversations?.length === 0 &&
      !isCreatingConversation.current
    ) {
      isCreatingConversation.current = true;
      createConversation('New Chat').finally(() => {
        isCreatingConversation.current = false;
      });
    }
  }, [isLoadingConversations, conversations?.length, createConversation]);

  useEffect(() => {
    if (!activeConversation.data) return;

    setMessages((prevMessages) => {
      if (prevMessages.length === 0) {
        return activeConversation.data.messages || [];
      }
      return prevMessages;
    });
  }, [activeConversation?.data]);

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
    if (activeConversation.data?.id !== activeConversationId) return;
  
    const userMessage = input.trim();
    const timestamp = new Date().toISOString();
  
    const userMessageObj = {
      id: crypto.randomUUID(),
      chat_id: activeConversation?.data?.id ?? '',
      role: 'user',
      content: JSON.stringify([{ role: 'user', content: userMessage }]),
      structured_content: null,
      timestamp,
      user_id: user?.id || null,
      agent_id: "",
      metadata: null,
      img: imageUrl || "",
      created_at: timestamp,
    };
  
    setMessages((prev) => [...prev, userMessageObj]);
    setInput('');
    setIsLoading(true);
  
    try {
      await addMessage({
        content: userMessageObj.content,
        role: 'user',
        timestamp: userMessageObj.timestamp,
        imageUrl: userMessageObj.img,
        agentId: agents?.[0]?.id,
      });
  
      const activeAgents = agents
        .filter((agent) =>
          swarmConfig?.agents?.some(
            (configAgent) => configAgent.agent_id === agent.id,
          ),
        )
        .filter((agent) => agent.is_active);
  
      if (!swarmConfig?.architecture || activeAgents.length < 2) {
        toast({
          description: 'A swarm must have at least two active agents.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
  
      const apiAgents = SwarmsApiClient.convertAgentsToApiFormat(
        activeAgents,
        swarmConfig.architecture,
      );
      const swarmType = SwarmsApiClient.getSwarmType(swarmConfig.architecture);
  
      const swarmRequest = {
        name: activeConversation.data?.name || 'Chat Session',
        description: 'Chat interaction',
        agents: apiAgents,
        swarm_type: swarmType,
        task: userMessage,
        max_loops: 1,
      };
  
      const response = await swarmsApi.executeSwarm(swarmRequest);
  
      const aiResponseObj = {
        id: crypto.randomUUID(),
        chat_id: activeConversation?.data?.id ?? '',
        role: 'assistant',
        content: JSON.stringify(response?.output),
        structured_content: response?.output ? JSON.stringify(response?.output) : null,
        timestamp: new Date().toISOString(),
        user_id: null,
        img: null,
        agent_id: activeAgents[0]?.id || "",
        metadata: response?.metadata ? JSON.stringify(response.metadata) : null,
        created_at: new Date().toISOString(),
      };
  
      setMessages((prev) => [...prev, aiResponseObj]);
  
      await addMessage({
        content: aiResponseObj.content,
        role: 'assistant',
        timestamp: aiResponseObj.timestamp,
        agentId: aiResponseObj.agent_id,
      });

      console.log({ responseTwo: response });
  
    } catch (error) {
      console.error('Error:', error);
      toast({
        description: 'An error occurred while processing your request.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-100/50 to-zinc-50/80 dark:from-zinc-950/50 dark:to-black" />
      <div className="relative w-full h-full flex">
        <ConversationSidebar
          conversations={conversations || []}
          activeId={activeConversationId}
          isLoading={isLoadingConversations}
          isDeletePending={isDeletePending}
          isCreatePending={isCreatePending}
          isUpdatePending={isUpdatePending}
          conversationRefetch={refetch}
          onUpdateConversation={updateConversation}
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
                  <ChatMessage
                    key={`${message?.id}-${index}`}
                    message={message}
                    getAgentName={getAgentName}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="w-2 h-2 bg-primary/50 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0.2,
                      }}
                      className="w-2 h-2 bg-primary/50 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: 0.4,
                      }}
                      className="w-2 h-2 bg-primary/50 rounded-full"
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
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter your message..."
                      className="w-full bg-white/80 text-xs lg:text-base dark:bg-zinc-950/80 backdrop-blur-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-[#928E8B] border border-red-600/20 rounded-md lg:rounded-lg px-3 lg:px-6 py-2 lg:py-4 focus:outline-none focus:border-red-500/50 transition-colors"
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
                    {isLoading ? (
                      <Ellipsis className="w-4 h-4 lg:w-6 lg:h-6 animate-pulse" />
                    ) : (
                      <Send className="w-4 h-4 lg:w-6 lg:h-6" />
                    )}
                    <div className="absolute inset-0 rounded-full group-hover:animate-ping bg-red-600/20 hidden group-hover:block" />
                  </button>
                </div>
              </form>
            </div>
          </div>
          <AgentSidebar
            agents={agents || []}
            isLoadingAgents={isLoadingAgents}
            isCreateAgent={isCreateAgent}
            agentsRefetch={agentsRefetch}
            isUpdateAgent={isUpdateAgent}
            isToggleAgent={isToggleAgent}
            isDeleteAgent={isDeleteAgent}
            swarmArchitecture={
              swarmConfig?.architecture || 'SequentialWorkflow'
            }
            openAgentModal={openAgentModal}
            setOpenAgentModal={setOpenAgentModal}
            onAddAgent={addAgent}
            onUpdateAgent={updateAgent}
            onRemoveAgent={removeAgent}
            onUpdateSwarmArchitecture={updateSwarmArchitecture}
            onToggleAgent={toggleAgent}
          />
        </div>
      </div>
    </div>
  );
}
