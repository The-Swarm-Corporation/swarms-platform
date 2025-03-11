import type { FileWithPreview } from '../hooks/useFileUpload';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFileIcon } from '../helper';
import Image from 'next/image';
import { Tables } from '@/types_db';

interface FilePreviewProps {
  file: FileWithPreview | Tables<'swarms_cloud_chat_files'>;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const previewFile = file as FileWithPreview;
  const fileIcon = getFileIcon(previewFile);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative group rounded-lg border border-red-600/20 bg-zinc-950/80 p-4 hover:bg-zinc-900/50 transition-colors"
    >
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>

      {/* <div className="flex items-center gap-3">
        <div className="text-red-500">{fileIcon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-red-500 text-sm truncate">
            {file?.file_name || previewFile.file.name}
          </p>
          <p className="text-red-500/50 text-xs">
            {((file.file_size || previewFile.file.size) / 1024 / 1024).toFixed(
              2,
            )}{' '}
            MB
          </p>
        </div>
      </div> */}

      {file?.file_type?.startsWith('image/') && file?.public_url ? (
        <div className="mt-2 relative h-5 w-5 md:h-10 md:w-10 rounded-lg overflow-hidden border border-red-600/20">
          <Image
            src={file.public_url || '/placeholder.svg'}
            alt={file?.file_name ?? ''}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ) : (
        previewFile?.type === 'image' &&
        previewFile?.preview && (
          <div className="mt-2 relative h-5 w-5 md:h-10 md:w-10 rounded-lg overflow-hidden border border-red-600/20">
            <Image
              src={previewFile.preview || '/placeholder.svg'}
              alt={previewFile.file.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )
      )}
    </motion.div>
  );
}
