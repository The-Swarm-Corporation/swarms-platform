import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { Message } from '../types';
import { Hexagon, Upload } from 'lucide-react';
import { FileWithPreview, useFileUpload } from '../hooks/useFileUpload';
import { FilePreview } from './file';
import { ProgressBar } from './progress';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Tables } from '@/types_db';

interface ChatMessageProps {
  message: Tables<'swarms_cloud_chat_messages'>;
  getAgentName: (agentId?: string) => string;
}

export default function ChatMessage({
  message,
  getAgentName,
}: ChatMessageProps) {
  const { data: dataFiles } = trpc.fileUpload.getMessageFiles.useQuery(
    message?.id,
  );
  const {
    files,
    uploadProgress,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileSelect,
    clearFiles,
    deleteFile,
    removeDBFile,
  } = useFileUpload();

  const structured_content = message?.structured_content ?? "";
  const content = message?.content ?? "";

  let parsedStructuredContent;
  try {
    parsedStructuredContent =
      typeof structured_content === 'string'
        ? JSON.parse(structured_content)
        : structured_content;
  } catch {
    parsedStructuredContent = structured_content;
  }

  let parsedContent = content;
  try {
    parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    parsedContent = content;
  }

  const hasStructuredContent = !!parsedStructuredContent;
  let displayContent = hasStructuredContent
    ? parsedStructuredContent
    : parsedContent;

  if (!Array.isArray(displayContent)) {
    displayContent = [displayContent];
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex flex-col mb-6',
          message.role === 'user' ? 'items-end' : 'items-start',
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(e: React.DragEvent) => handleDrop(e, message)}
      >
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-red-500/50 text-[10px] lg:text-xs font-mono">
            {message.timestamp}
          </span>
          {message.role === 'assistant' && (
            <>
              <Hexagon className="h-3 w-3 lg:w-4 lg:h-4 text-red-500/50" />
              <span className="text-red-500/70 text-xs font-mono">
                {getAgentName(message?.agent_id ?? '')}
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
          {/* <div className="relative text-xs lg:text-base">{message.content}</div> */}
        </div>
      </motion.div>
      {dragActive ? (
        <div className="absolute inset-0 z-50 bg-zinc-50/90 dark:bg-black/90 flex items-center justify-center border-2 border-dashed border-red-600/50">
          <div className="text-red-500 text-xl font-bold">
            Drop files to upload
          </div>
        </div>
      ) : (
        <>
          {message.role === 'user' && (
            <>
              <input
                type="file"
                multiple
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleFileSelect(e, message)
                }
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="p-3 rounded-full transition-all duration-300 relative group bg-white/80 dark:bg-zinc-950/80 text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 border border-red-600/20 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <div className="absolute inset-0 rounded-full group-hover:animate-ping bg-red-600/20 hidden group-hover:block" />
              </label>
            </>
          )}
          {((dataFiles && dataFiles?.length > 0) || files.length > 0) && (
            <div className="flex items-center flex-wrap gap-2">
              <AnimatePresence>
                {(dataFiles || files).map((file, index) => (
                  <FilePreview
                    key={
                      file?.file_name ||
                      `${(file as FileWithPreview).file.name}-${index}`
                    }
                    file={file}
                    onRemove={
                      file?.file_name
                        ? () =>
                            removeDBFile(file?.file_path || '', file?.id || '')
                        : () => deleteFile(index)
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
          <div className="mt-1 flex items-center flex-wrap gap-2">
            {Object.entries(uploadProgress).map(
              ([fileName, progress]) =>
                progress > 0 &&
                progress < 100 && (
                  <div key={fileName}>
                    <ProgressBar progress={progress} />
                    <span>
                      Uploading {fileName}: {progress}%
                    </span>
                  </div>
                ),
            )}
          </div>
        </>
      )}
    </>
  );
}
