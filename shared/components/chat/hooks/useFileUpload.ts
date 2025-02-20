import { trpc } from '@/shared/utils/trpc/trpc';
import { useState, useCallback } from 'react';
import type { Message } from '@/shared/components/chat/types';

export type FileWithPreview = {
  file: File;
  preview: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  url?: string;
};

export function useFileUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [dragActive, setDragActive] = useState(false);

  const uploadFileMutation = trpc.fileUpload.uploadFile.useMutation();
  const deleteFileMutation = trpc.fileUpload.deleteFile.useMutation();

  const getFileType = useCallback((file: File): FileWithPreview['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('document') || file.type.includes('pdf'))
      return 'document';
    return 'other';
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setUploadProgress({});
  }, []);

  const uploadFile = useCallback(
    async (file: File, messageId: string, refetch?: () => void) => {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const fileType = getFileType(file);
        const preview = fileType === 'image' ? URL.createObjectURL(file) : '';

        const fileData = await uploadFileMutation.mutateAsync({
          file,
          messageId,
          fileName: file.name,
          fileType: file.type,
        });

        setFiles((prev) => [
          ...prev,
          { file, preview, type: fileType, url: fileData?.public_url },
        ]);

        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress((prev) => {
                const newProgress = { ...prev };
                delete newProgress[file.name];
                return newProgress;
              });
            }, 500);
          }
        }, 100);

        refetch?.();
        return fileData;
      } catch (error) {
        console.error('File upload failed:', error);
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
        throw error;
      }
    },
    [uploadFileMutation, getFileType],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, message: Message) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (!selectedFiles.length) return;

      try {
        await Promise.all(
          selectedFiles.map((file) => uploadFile(file, message.id)),
        );
      } catch (error) {
        console.error('File upload failed:', error);
      }
    },
    [uploadFile],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent, message: Message) => {
      e.preventDefault();

      if (message.role !== 'user') return;

      setDragActive(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (!droppedFiles.length) return;

      try {
        await Promise.all(
          droppedFiles.map((file) => uploadFile(file, message.id)),
        );
      } catch (error) {
        console.error('File upload failed:', error);
      }
    },
    [uploadFile],
  );

  const removeFile = useCallback(
    async (filePath: string, fileId: string, refetch?: () => void) => {
      try {
        await deleteFileMutation.mutateAsync({ filePath, fileId });
        setFiles((prev) => prev.filter((f) => f.url !== filePath));
        refetch?.();
      } catch (error) {
        console.error('File deletion failed:', error);
        throw error;
      }
    },
    [deleteFileMutation],
  );

  return {
    files,
    uploadProgress,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileSelect,
    clearFiles,
    uploadFile,
    removeFile,
  };
}
