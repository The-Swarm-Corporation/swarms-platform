import { trpc } from '@/shared/utils/trpc/trpc';
import { useState, useCallback } from 'react';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { MAX_FILE_SIZE } from '@/shared/utils/constants';
import { createClient } from '@/shared/utils/supabase/client';
import { uploadFileWithProgress } from '@/shared/components/chat/helper';

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

export function useModelFileUpload() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');

  const deleteFileMutation = trpc.explorer.deleteFile.useMutation();

  const uploadImage = useCallback(async (file: File, modelType: string) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        description: 'File size exceeds the maximum limit of 10MB.',
        variant: 'destructive',
      });
      return null;
    }

    setImage(URL.createObjectURL(file));
    setUploadProgress(0);
    setUploadStatus('uploading');

    const imageId = crypto.randomUUID();
    const filePath = `public/models/${modelType}/${imageId}/${file.name}`;
    const supabase = createClient();

    try {
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage.from('images').createSignedUploadUrl(filePath);

      if (signedUrlError) throw signedUrlError;

      const uploadUrl = signedUrlData.signedUrl;

      await uploadFileWithProgress(uploadUrl, file, setUploadProgress);

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrlData.publicUrl);
      setFilePath(filePath);
      setUploadStatus('success');

      return { url: publicUrlData.publicUrl, imageId };
    } catch (error) {
      setUploadStatus('error');
      toast({
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
      setImage(null);
      setImageUrl(null);
      return { url: null, imageId: null };
    }
  }, []);

  const deleteImage = useCallback(
    async (filePath: string, modelType: string, imageId: string) => {
      try {
        await deleteFileMutation.mutateAsync({
          filePath,
          modelType,
          imageId,
        });
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
    filePath,
    uploadProgress,
    uploadStatus,
    isDeleteFile: deleteFileMutation.isPending,
    uploadImage,
    deleteImage,
    setImage,
    setImageUrl,
  };
}
