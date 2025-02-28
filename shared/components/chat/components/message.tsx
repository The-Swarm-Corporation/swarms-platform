import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { Hexagon, Upload, X } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { ProgressBar } from './progress';
import { Tables } from '@/types_db';
import { MessageObj, parseJSON } from '../helper';
import MarkdownComponent from '../../markdown';
import Image from 'next/image';

interface ChatMessageProps {
  message: Tables<'swarms_cloud_chat_messages'>;
  getAgentName: (agentId?: string) => string;
}

export default function ChatMessage({
  message,
  getAgentName,
}: ChatMessageProps) {
  const {
    image,
    imageUrl,
    uploadProgress,
    uploadStatus,
    uploadImage,
    deleteImage,
  } = useFileUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file, message.id);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await uploadImage(file, message.id);
  };

  const imgUrl = message?.img || imageUrl || '';

  const structuredContent = parseJSON(message?.structured_content ?? '');
  const content = parseJSON(message?.content ?? '');

  let displayContent = structuredContent || content;
  if (!Array.isArray(displayContent)) {
    displayContent = [displayContent];
  }

  return (
    <div
      className={cn(
        'flex mb-6',
        imgUrl || uploadStatus === 'uploading'
          ? 'flex-col'
          : 'flex-row items-end',
        message.role === 'user' ? 'justify-end' : '',
      )}
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
          <span className="text-red-500/50 text-[10px] lg:text-xs font-mono">
            {message?.timestamp}
          </span>
        </div>

        <div
          className={cn(
            'w-full',
            message?.role !== 'user' ? 'grid lg:grid-cols-2 gap-3' : '',
          )}
        >
          {displayContent
            .filter((msg: MessageObj) =>
              message.role === 'assistant' ? msg.role !== 'user' : true,
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
                  {msg?.role !== 'user' && (
                    <div className="flex items-center gap-1 mb-2">
                      <Hexagon className="h-3 w-3 lg:w-4 lg:h-4 text-red-500/50" />
                      <span className="text-red-500/70 text-xs font-mono capitalize">
                        {msg?.role}
                      </span>
                    </div>
                  )}
                  <div
                    key={index}
                    className={cn(
                      'rounded-md lg:rounded-lg px-2 lg:px-6 py-3 lg:py-4 relative overflow-hidden transition-colors duration-300',
                      'bg-red-50/80 dark:bg-black/80 text-red-500 border border-red-600/30',
                      message?.role === 'user'
                        ? 'max-w-[70%] xl:max-w-[60%]'
                        : 'max-w-full',
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-pulse" />
                    <div className="relative text-xs lg:text-base w-full">
                      <MarkdownComponent
                        text={msg?.content ?? ''}
                        className="px-0"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>
      <div>
        {message.role === 'user' && (
          <div className="flex w-full justify-end">
            {message?.img || imageUrl ? (
              <div className="relative mt-1">
                <Image
                  src={imgUrl}
                  alt="Uploaded image"
                  height={50}
                  width={50}
                  className="object-cover rounded-md"
                />
                <X
                  role="button"
                  size={20}
                  onClick={() => deleteImage(imgUrl)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                />
              </div>
            ) : (
              <>
                <div
                  className="px-4 py-1 rounded cursor-pointer w-fit"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={!!imageUrl}
                    className="hidden"
                    id={`upload-image-${message.id}`}
                  />
                  {uploadStatus === 'uploading' && uploadProgress > 0 ? (
                    <div className="w-full mb-2">
                      <ProgressBar progress={uploadProgress} />
                      <span className="text-xs text-red-500/70">
                        Uploading image: {uploadProgress}%
                      </span>
                    </div>
                  ) : (
                    <label
                      htmlFor={`upload-image-${message.id}`}
                      className="cursor-pointer flex items-center text-primary/50"
                    >
                      <Upload size={15} className="ml-2" />
                    </label>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
