import { trpc } from '@/shared/utils/trpc/trpc';
import { Tables } from '@/types_db';
import { useState, useCallback } from 'react';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { MAX_FILE_SIZE } from '@/shared/utils/constants';

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
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');

  const uploadFileMutation = trpc.fileUpload.uploadFile.useMutation();
  const deleteFileMutation = trpc.fileUpload.deleteFile.useMutation();

  const uploadImage = useCallback(
    async (file: File, chatId: string) => {
      if(file.size > MAX_FILE_SIZE){
        toast({
          description: 'File size exceeds the maximum limit of 10MB.',
          variant: 'destructive',
        });
        return null;
      }
      setImage(file);
      setUploadProgress(0);
      setUploadStatus('uploading');

      try {
        const fileData = await uploadFileMutation.mutateAsync({
          file,
          chatId,
          fileName: file.name,
          fileType: file.type,
        });

        setImageUrl(fileData?.publicUrl);
        setUploadStatus('success');

        // Simulate progress bar
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadProgress(progress);
          if (progress >= 100) clearInterval(interval);
        }, 100);

        return fileData?.publicUrl;
      } catch (error) {
        setUploadStatus('error');
        toast({
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
        setImage(null);
        setImageUrl(null);
        return null;
      }
    },
    [uploadFileMutation],
  );

  const deleteImage = useCallback(
    async (filePath: string) => {
      try {
        await deleteFileMutation.mutateAsync({ filePath });
        setImage(null);
        setImageUrl(null);
        toast({
          description: 'Image removed successfully',
        });
        setUploadStatus('idle');
      } catch (error) {
        toast({
          description: 'Failed to delete image. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [deleteFileMutation],
  );

  return {
    image,
    imageUrl,
    uploadProgress,
    uploadStatus,
    uploadImage,
    deleteImage,
    setImage,
    setImageUrl,
  };
}
