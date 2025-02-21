import { trpc } from '@/shared/utils/trpc/trpc';
import { Tables } from '@/types_db';
import { useState, useCallback } from 'react';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

export type FileWithPreview = {
  file: File;
  preview: string;
  id?: string;
  file_path?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  public_url?: string;
};

export function useFileUpload() {
  const { toast } = useToast();
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
      }
    },
    [uploadFileMutation, getFileType],
  );

  const handleFileSelect = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      message: Tables<'swarms_cloud_chat_messages'>,
    ) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (!selectedFiles.length) return;

      try {
        await Promise.all(
          selectedFiles.map((file) => uploadFile(file, message.id)),
        );
      } catch (error) {
        console.error('File upload failed:', error);
        toast({
          description: 'Failed to upload file. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [uploadFile],
  );

  const handleDrop = useCallback(
    async (
      e: React.DragEvent,
      message: Tables<'swarms_cloud_chat_messages'>,
    ) => {
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
        toast({
          description: 'Failed to upload file. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [uploadFile],
  );

  const removeDBFile = useCallback(
    async (filePath: string, fileId: string, refetch?: () => void) => {
      try {
        await deleteFileMutation.mutateAsync({ filePath, fileId });
        setFiles((prev) => prev.filter((f) => f.public_url !== filePath));
        refetch?.();
      } catch (error) {
        console.error('File deletion failed:', error);
        toast({
          description: 'Failed to delete media. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [deleteFileMutation],
  );

  const deleteFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    files,
    uploadProgress,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileSelect,
    clearFiles,
    uploadFile,
    deleteFile,
    removeDBFile,
  };
}
