'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CopyPlus,
  Ellipsis,
  KeyRound,
  Loader2,
  Lock,
  LockOpen,
  Mic,
  Send,
  Shield,
  Upload,
  X,
} from 'lucide-react';
import LoadSequence from './components/loader';
import { ConversationSidebar } from './components/sidebar/conversations';
import { cn } from '@/shared/utils/cn';
import { ConfigSidebar } from './components/sidebar/config';
import ChatMessage from './components/message';
import { Tables } from '@/types_db';
import { ProgressBar } from './components/progress';
import Image from 'next/image';
import LoadingSpinner from '../loading-spinner';
import Link from 'next/link';
import { Button } from '../ui/button';
import MessageScreen from './components/message-screen';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import useSwarmsChat from './hooks/useChat';

interface SwarmsChatProps {
  modelFunction?: (message: string) => Promise<string>;
}

export default function SwarmsChat({}: SwarmsChatProps) {
  const {
    input,
    apiKeyQuery,
    isCreatingApiKey,
    isInitializing,
    creationError,
    isFetching,
    isSharedConversation,
    user,
    messages,
    isLoading,
    messagesEndRef,
    isListening,
    activeChatId,
    activeConversation,
    activeConversationId,
    isEditModalOpen,
    loadingAfterMessageId,
    isEditLoading,
    isActiveLoading,
    openCloneModal,
    isClonePending,
    openTogglePublicModal,
    isTogglePublicPending,
    replaceMode,
    imageUrl,
    image,
    filePath,
    isDeleteFile,
    uploadStatus,
    uploadProgress,
    isUpdatePending,
    models,
    agents,
    isLoadingAgents,
    swarmConfig,
    openAgentModal,
    conversations,
    isLoadingConversations,
    isCreatePending,
    isDeletePending,
    isCreateAgent,
    isUpdateAgent,
    isToggleAgent,
    isDeleteAgent,
    isDeleteMessage,
    editingMessageId,
    editMessage,
    deleteMessage,
    startEditingMessage,
    cancelEditingMessage,
    setIsFetching,
    setInput,
    handleSubmit,
    toggleListening,
    handleTogglePublicModal,
    setActiveChatId,
    setIsEditModalOpen,
    handleMessageEdit,
    setOpenAgentModal,
    agentsRefetch,
    addAgent,
    updateAgent,
    removeAgent,
    updateSwarmArchitecture,
    toggleAgent,
    updateConversation,
    refetch,
    deleteImage,
    handleDrop,
    handleFileSelect,
    handleCloseTogglePublicModal,
    cloneSharedConversation,
    setOpenCloneModal,
    handleCloseCloneModal,
    togglePublicConversation,
    setReplaceMode,
    createConversation,
    deleteConversation,
    exportConversation,
  } = useSwarmsChat();

  if (apiKeyQuery.isLoading || isCreatingApiKey.current || isInitializing) {
    return (
      <MessageScreen
        containerClass="h-full w-full"
        borderClass="border border-zinc-700/50"
        title="Swarms Agent System"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
          <p className="text-zinc-300 text-xs font-semibold">
            {apiKeyQuery.isLoading
              ? 'Checking for existing API credentials...'
              : isCreatingApiKey.current
                ? 'Generating secure API key for you...'
                : 'Initializing Swarms Chat...'}
          </p>
        </div>
        <p className="text-xs text-zinc-400 text-center mt-2">
          We&apos;re setting up your environment to interact with our AI agents.
          This only takes a moment and ensures a seamless experience.
        </p>
      </MessageScreen>
    );
  }

  if (creationError) {
    return (
      <MessageScreen
        icon={AlertTriangle}
        iconClass="h-10 w-10 text-primary mb-2"
        title="API Key Creation Failed"
        borderClass="border border-primary/50"
      >
        <p className="text-sm text-center text-zinc-300">
          We encountered an issue creating your API key:
        </p>
        <p className="text-primary text-center font-mono text-sm p-3 bg-red-900/20 rounded-md border border-red-900/50">
          {creationError}
        </p>
        <Link
          href="https://swarms.world/platform/api-keys"
          target="_blank"
          className="mt-6"
        >
          <Button className="bg-primary hover:bg-primary/80">
            <KeyRound size={20} className="mr-2" /> Manage API Keys
          </Button>
        </Link>
      </MessageScreen>
    );
  }

  if (
    !apiKeyQuery.data?.key &&
    !apiKeyQuery.isLoading &&
    !isCreatingApiKey.current &&
    !isInitializing
  ) {
    return (
      <MessageScreen
        icon={KeyRound}
        iconClass="h-12 w-12 text-yellow-500 mb-2"
        title="API Key Required"
        borderClass="border border-zinc-700/50"
      >
        <p className="text-center text-sm text-zinc-300">
          You&apos;ll need an API key to interact with our platform. We tried to
          create one automatically but ran into an issue.
        </p>
        <Link
          href="https://swarms.world/platform/api-keys"
          target="_blank"
          className="mt-6"
        >
          <Button className="bg-primary hover:bg-primary/80">
            <KeyRound size={20} className="mr-2" /> Create API Key
          </Button>
        </Link>
      </MessageScreen>
    );
  }

  if (isFetching) {
    return <LoadSequence onComplete={() => setIsFetching(false)} />;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] lg:ml-[80px] max-lg:mt-16 transition-colors duration-300',
        'bg-zinc-50 dark:bg-[#000000]',
      )}
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-100/50 to-zinc-50/80 dark:from-zinc-950/50 dark:to-black" />
      <div className="relative w-full h-full flex">
        <ConversationSidebar
          conversations={(conversations as Tables<'swarms_cloud_chat'>[]) || []}
          activeId={activeConversationId}
          isLoading={isLoadingConversations}
          isDeletePending={isDeletePending}
          isCreatePending={isCreatePending}
          isClonePending={isClonePending}
          isUpdatePending={isUpdatePending}
          conversationRefetch={refetch}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={setIsEditModalOpen}
          onUpdateConversation={updateConversation}
          onCreateConversation={createConversation}
          onDeleteConversation={deleteConversation}
          onExportConversation={exportConversation}
        />
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-sm border-b border-[#f9f9f914] py-2 px-8 lg:p-6 transition-colors duration-300">
              <div className="max-w-screen-xl mx-auto">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2 lg:space-x-4">
                    <div className="relative">
                      <Shield className="w-5 h-5 lg:w-10 lg:h-10 text-primary/50" />
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className="absolute inset-0 text-primary"
                      >
                        <Shield className="w-5 h-5 lg:w-10 lg:h-10" />
                      </motion.div>
                    </div>
                    <div>
                      <h2 className="text-primary/70 font-semibold text-xl lg:text-3xl tracking-wider flex items-center gap-2">
                        Swarms
                        <span className="text-xs text-primary font-normal opacity-50">
                          v1.0.1
                        </span>
                      </h2>
                      <p className="text-red-500/50 text-xs lg:text-sm tracking-wide">
                        Swarms Agent System
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isSharedConversation && (
                      <Dialog
                        open={openCloneModal}
                        onOpenChange={setOpenCloneModal}
                      >
                        <DialogTrigger asChild>
                          <Button
                            aria-label="Clone conversation"
                            className="w-full bg-transparent border border-[#40403F] hover:bg-[#1e1e1e] text-white"
                          >
                            {!isClonePending && (
                              <CopyPlus className="h-4 w-4" />
                            )}
                            <span className="ml-2 hidden lg:flex">
                              Clone conversation
                            </span>
                            {isClonePending && <LoadingSpinner size={18} />}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl border border-[#40403F]">
                          <DialogHeader>
                            <DialogTitle></DialogTitle>
                            <DialogDescription className="text-center text-white">
                              Are you sure you&apos;d like to clone this
                              conversation?
                              {!user && (
                                <Link href="/signin">
                                  <span className="flex font-mono text-primary/70 justify-center mt-2 hover:underline">
                                    Make sure you&apos;re signed in!
                                  </span>
                                </Link>
                              )}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="flex mt-4 justify-center gap-2">
                            <Button
                              variant="outline"
                              disabled={isClonePending}
                              onClick={handleCloseCloneModal}
                            >
                              Cancel
                            </Button>
                            <Button
                              disabled={isClonePending}
                              onClick={cloneSharedConversation}
                            >
                              Clone
                              {isClonePending && (
                                <LoadingSpinner size={15} className="ml-2" />
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {user && user.id === activeConversation?.data?.user_id && (
                      <Dialog
                        open={openTogglePublicModal}
                        onOpenChange={handleTogglePublicModal}
                      >
                        <DialogTrigger asChild>
                          <Button
                            aria-label="Toggle conversation public status"
                            className={cn(
                              'w-full bg-primary/40 hover:bg-primary/70 text-white',
                              activeConversation?.data?.is_public &&
                                'bg-transparent border border-[#40403F] hover:bg-[#1e1e1e]',
                            )}
                          >
                            {!isTogglePublicPending &&
                              (activeConversation?.data?.is_public ? (
                                <Lock className="h-3 w-3 lg:h-4 lg:w-4" />
                              ) : (
                                <LockOpen className="h-3 w-3 lg:h-4 lg:w-4" />
                              ))}
                            <span className="ml-2 hidden lg:flex">
                              Make Conversation{' '}
                              {activeConversation?.data?.is_public
                                ? 'Private'
                                : 'Public'}
                            </span>
                            {isTogglePublicPending && (
                              <LoadingSpinner size={18} />
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl border border-[#40403F]">
                          <DialogHeader>
                            <DialogTitle></DialogTitle>
                            <DialogDescription className="text-center text-white">
                              <span className="block font-mono mb-4 font-semibold">
                                Are you sure you&apos;d like to make this
                                conversation public?
                              </span>
                              {!activeConversation?.data?.is_public ? (
                                <span className="mt-2 text-sm font-mono text-center">
                                  By making this conversation public, you agree
                                  to add this conversation to the{' '}
                                  <a
                                    href="/"
                                    target="_blank"
                                    className="text-primary/70 font-medium hover:underline"
                                  >
                                    marketplace
                                  </a>{' '}
                                  in accordance with our terms of service and
                                  privacy policy.
                                </span>
                              ) : (
                                <span className="font-mono text-sm mt-2">
                                  By making this conversation private, you will
                                  remove it from the marketplace.
                                </span>
                              )}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="flex mt-4 justify-center gap-2">
                            <Button
                              variant="outline"
                              disabled={isTogglePublicPending}
                              onClick={handleCloseTogglePublicModal}
                            >
                              Cancel
                            </Button>
                            <Button
                              disabled={isTogglePublicPending}
                              onClick={togglePublicConversation}
                            >
                              Make{' '}
                              {activeConversation?.data?.is_public
                                ? 'private'
                                : 'public'}
                              {isTogglePublicPending && (
                                <LoadingSpinner size={15} className="ml-2" />
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:px-20 lg:p-6 space-y-6">
              <div className="max-w-screen-xl mx-auto relative">
                {messages.map((message, index) => (
                  <div key={`${message?.id}-${index}`}>
                    <ChatMessage
                      message={message}
                      isEditLoading={isEditLoading}
                      onEdit={handleMessageEdit}
                      isDeleteMessage={isDeleteMessage}
                      isSharedConversation={isSharedConversation}
                      setReplaceMode={setReplaceMode}
                      replaceMode={replaceMode}
                      editingMessageId={editingMessageId}
                      startEditingMessage={startEditingMessage}
                      cancelEditingMessage={cancelEditingMessage}
                      editMessage={editMessage}
                      deleteMessage={deleteMessage}
                      ref={
                        index === messages.length - 1 &&
                        replaceMode === 'replaceAll'
                          ? messagesEndRef
                          : null
                      }
                    />

                    {isLoading &&
                      loadingAfterMessageId === message.id &&
                      replaceMode !== 'replaceAll' && (
                        <div className="flex items-center space-x-2 ml-6 mt-2 mb-6">
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
                  </div>
                ))}

                {isActiveLoading && (
                  <div className="absolute inset-0 bg-black/40 w-full" />
                )}

                {isLoading &&
                  (!loadingAfterMessageId || replaceMode === 'replaceAll') && (
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
              </div>
            </div>

            {isActiveLoading && (
              <p className="font-mono absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-xs z-10">
                Hang on...
              </p>
            )}

            {!isSharedConversation && (
              <div className="bg-white/60 relative dark:bg-black/60 backdrop-blur-sm border-t f9f9f914 p-6 transition-colors duration-300">
                <form
                  onSubmit={handleSubmit}
                  className="max-w-screen-xl mx-auto"
                >
                  <div className="flex items-center space-x-2 lg:space-x-4">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={cn(
                        'p-2 lg:p-4 rounded-full transition-all duration-300 relative group',
                        isListening
                          ? 'bg-red-600/20 text-primary/50 border border-red-600/50'
                          : 'bg-white/80 dark:bg-zinc-950/80 text-primary/50 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 border border-red-600/20',
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
                    <>
                      <div
                        className="p-2 lg:p-4 rounded-full cursor-pointer w-fit"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={uploadStatus === 'uploading' || !!imageUrl}
                          className="hidden"
                          id={`upload-image-${activeConversationId}`}
                        />
                        <label
                          htmlFor={`upload-image-${activeConversationId}`}
                          className="cursor-pointer flex items-center text-primary/50"
                        >
                          <Upload
                            className={cn(
                              'w-3 h-3 lg:w-6 lg:h-6',
                              uploadStatus === 'uploading'
                                ? 'animate-pulse'
                                : '',
                            )}
                          />
                        </label>

                        {(imageUrl || image) && (
                          <div className="absolute z-10 -top-[166px] left-0 flex items-end w-full">
                            <div className="relative h-40 w-40 mt-1 border border-[#40403F]">
                              <Image
                                src={imageUrl || image || ''}
                                alt="Uploaded image"
                                fill
                                className="object-cover rounded-md"
                              />
                              {imageUrl &&
                                (isDeleteFile ? (
                                  <LoadingSpinner
                                    size={15}
                                    className="absolute -top-2 -right-2"
                                  />
                                ) : (
                                  <X
                                    role="button"
                                    size={20}
                                    onClick={() =>
                                      deleteImage(
                                        filePath ?? '',
                                        activeConversationId,
                                      )
                                    }
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                                  />
                                ))}
                            </div>
                            {uploadStatus === 'uploading' &&
                              uploadProgress > 0 && (
                                <div className="w-full flex items-end gap-1 bg-white/80 dark:bg-black/70">
                                  <ProgressBar
                                    progress={uploadProgress}
                                    className="h-2.5"
                                  />
                                  <span className="text-sm text-black dark:text-[#928E8B]">
                                    {uploadProgress}%
                                  </span>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </>
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
            )}
          </div>
          <ConfigSidebar
            agents={agents || []}
            models={models || []}
            activeConversation={activeConversation}
            isLoadingAgents={isLoadingAgents}
            isCreateAgent={isCreateAgent}
            agentsRefetch={agentsRefetch}
            chatRefetch={refetch}
            isUpdatePending={isUpdatePending}
            isUpdateAgent={isUpdateAgent}
            isToggleAgent={isToggleAgent}
            isDeleteAgent={isDeleteAgent}
            swarmArchitecture={
              swarmConfig?.architecture || 'SequentialWorkflow'
            }
            openAgentModal={openAgentModal}
            setOpenAgentModal={setOpenAgentModal}
            onUpdateConversation={updateConversation}
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
