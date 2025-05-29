import React, { Dispatch, forwardRef, SetStateAction, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { Edit, Hexagon, Trash } from 'lucide-react';
import { Tables } from '@/types_db';
import { MessageObj, parseJSON } from '../helper';
import MarkdownComponent from '../../markdown';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '../../ui/button';
import LoadingSpinner from '../../loading-spinner';

interface ChatMessageProps {
  message: Omit<Tables<'swarms_cloud_chat_messages'>, 'is_deleted'>;
  isEditLoading: boolean;
  editingMessageId: string | null;
  replaceMode: 'replaceAll' | 'replaceOriginal';
  isDeleteMessage: boolean;
  setReplaceMode: Dispatch<SetStateAction<'replaceAll' | 'replaceOriginal'>>;
  startEditingMessage: (messageId: string) => void;
  isSharedConversation: string;
  cancelEditingMessage: () => void;
  editMessage: (
    messageId: string,
    newContent: string,
    replaceAll: boolean,
  ) => Promise<Tables<'swarms_cloud_chat_messages'> | null>;
  deleteMessage: (messageId: string | null) => void;
  onEdit: (
    updatedMessage: Tables<'swarms_cloud_chat_messages'>,
    replaceAll: boolean,
  ) => Promise<void>;
}

const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      message,
      isEditLoading,
      editingMessageId,
      replaceMode,
      isDeleteMessage,
      isSharedConversation,
      setReplaceMode,
      startEditingMessage,
      cancelEditingMessage,
      editMessage,
      deleteMessage,
      onEdit,
    },
    ref,
  ) => {
    const structuredContent = parseJSON(message?.structured_content ?? '');
    const content = parseJSON(message?.content ?? '');

    let displayContent = structuredContent || content;
    if (!Array.isArray(displayContent)) {
      displayContent = [displayContent];
    }
    const [editContent, setEditContent] = useState('');
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const isEditing = editingMessageId === message.id;

    const handleOpenDeleteModal = () => setOpenDeleteModal(true);
    const handleCloseDeleteModal = () => {
      setOpenDeleteModal(false);
    };

    const handleEdit = () => {
      startEditingMessage(message?.id);
      setEditContent(
        typeof content === 'string'
          ? content
          : Array.isArray(content)
            ? content[0]?.content
            : content?.content || '',
      );
    };

    const handleDelete = async () => {
      await deleteMessage(message?.id);

      handleCloseDeleteModal();
    };

    const handleEditSubmit = async () => {
      if (!editContent.trim()) return;

      const updatedMessage = await editMessage(
        message.id,
        editContent,
        replaceMode === 'replaceAll',
      );

      if (updatedMessage && onEdit) {
        await onEdit(updatedMessage, replaceMode === 'replaceAll');
      }
    };

    return (
      <div
        className={cn(
          'flex mb-6 flex-col group',
          message.role === 'user' ? 'justify-end' : '',
        )}
        ref={ref}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex flex-col w-full',
            message.role === 'user' ? 'items-end' : 'items-start',
          )}
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-black dark:text-[#928E8B] text-[10px] lg:text-xs font-mono">
              {new Date(message?.timestamp ?? '').toLocaleString('en-US')}
            </span>

            {!isSharedConversation && (
              <div className="flex items-center">
                {message.role === 'user' && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={handleOpenDeleteModal}
                  className="p-1 rounded invisible group-hover:visible hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <Trash className="h-3 w-3 text-primary" />
                </button>
              </div>
            )}
          </div>

          <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
            <DialogContent className="max-w-xl border border-[#40403F]">
              <DialogHeader>
                <DialogTitle></DialogTitle>
                <DialogDescription className="text-center text-white">
                  Are you sure you&apos;d like to delete this message?
                </DialogDescription>
              </DialogHeader>

              <div className="flex mt-4 justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={isDeleteMessage}
                  onClick={handleCloseDeleteModal}
                >
                  Cancel
                </Button>
                <Button disabled={isDeleteMessage} onClick={handleDelete}>
                  Delete
                  {isDeleteMessage && (
                    <LoadingSpinner size={15} className="ml-2" />
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div
            className={cn(
              'w-full',
              message?.role !== 'user' ? 'grid lg:grid-cols-1 gap-10' : '',
            )}
          >
            {isEditing ? (
              <div className="w-full flex justify-end">
                <div
                  className={cn(
                    'rounded-md lg:rounded-lg px-2 lg:px-6 py-3 text-black dark:text-white lg:py-4 relative overflow-hidden transition-colors duration-300',
                    'max-w-[90%] md:max-w-[70%] xl:max-w-[60%] w-full bg-[#928E8B] dark:bg-[#444444]',
                  )}
                >
                  <textarea
                    value={editContent}
                    autoFocus
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-transparent outline-none resize-none min-h-[100px] text-xs lg:text-base"
                  />

                  <div className="flex w-full flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1">
                        <input
                          type="radio"
                          id={`replaceAll-${message.id}`}
                          name={`replaceMode-${message.id}`}
                          checked={replaceMode === 'replaceAll'}
                          onChange={() => setReplaceMode('replaceAll')}
                        />
                        <label
                          htmlFor={`replaceAll-${message.id}`}
                          className="text-xs md:text-sm"
                        >
                          Replace all following
                        </label>
                      </div>

                      <div className="flex items-center space-x-1">
                        <input
                          type="radio"
                          id={`replaceOriginal-${message.id}`}
                          name={`replaceMode-${message.id}`}
                          checked={replaceMode === 'replaceOriginal'}
                          onChange={() => setReplaceMode('replaceOriginal')}
                        />
                        <label
                          htmlFor={`replaceOriginal-${message.id}`}
                          className="text-xs md:text-sm"
                        >
                          Keep following
                        </label>
                      </div>
                    </div>

                    <div className="flex md:justify-end space-x-2 mt-3 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isEditLoading}
                        onClick={cancelEditingMessage}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleEditSubmit}
                        className="w-full"
                        disabled={!editContent.trim() || isEditLoading}
                      >
                        Save{' '}
                        {isEditLoading && (
                          <LoadingSpinner size={15} className="ml-2" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              displayContent
                .filter((msg: MessageObj) =>
                  message.role === 'assistant'
                    ? msg?.role?.toLowerCase() !== 'user'
                    : true,
                )
                .map((msg: MessageObj, index: number) => {
                  return (
                    <div
                      key={`${msg?.role}-${index}`}
                      className={cn(
                        'flex flex-col',
                        message.role === 'user' ? 'items-end' : 'items-start',
                      )}
                    >
                      {msg?.role?.toLowerCase() !== 'user' && (
                        <div className="flex items-center gap-1 mb-2">
                          <Hexagon className="h-3 w-3 lg:w-4 lg:h-4 text-red-500/50" />
                          <span className="text-black dark:text-[#928E8B] text-xs font-bold font-mono capitalize">
                            {msg?.role}
                          </span>
                        </div>
                      )}
                      <div
                        key={index}
                        className={cn(
                          'rounded-md lg:rounded-lg px-2 lg:px-6 py-3 text-black dark:text-white lg:py-4 relative overflow-hidden transition-colors duration-300',
                          message?.role === 'user'
                            ? 'max-w-[70%] xl:max-w-[60%] bg-[#928E8B] dark:bg-[#444444]'
                            : 'max-w-full dark:bg-[#131313] bg-[#928E8B] border-2 border-[#f9f9f914]',
                        )}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-pulse" />
                        <div className="relative text-xs lg:text-base w-full">
                          <MarkdownComponent
                            text={
                              msg?.content?.replace(
                                /^Time:\s[\d-]+\s[\d:]+\s*/,
                                '',
                              ) ?? ''
                            }
                            className="px-0"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </motion.div>
        <div className="flex w-full justify-end">
          {(message as any)?.is_edited && !isEditing && (
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-right">
              (edited)
            </div>
          )}
          {message.role === 'user' && message?.img && !isEditing && (
            <div className="relative mt-1">
              <Image
                src={message?.img}
                alt="Uploaded image"
                height={50}
                width={50}
                className="object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
