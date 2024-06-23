import { ChangeEvent, useState } from 'react';
import { useToast } from '../components/ui/Toasts/use-toast';
import { createClient } from '../utils/supabase/client';
import { SwitchImageProps } from './edit-modal';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export function useUploadFileToStorage({
  isSwitchImage,
}: {
  isSwitchImage?: SwitchImageProps;
}) {
  const toast = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e?.target?.files?.[0];
    // Limit file size to 5MB
    if (file && file.size <= MAX_FILE_SIZE) {
      setImageFile(file);
    } else {
      toast.toast({
        variant: 'destructive',
        title: 'Error uploading image',
        description: 'File size should be less than 5MB',
      });
    }
  }

  async function uploadImage() {
    if (!imageFile || isSwitchImage === "no") return;

    setIsUploading(true);
    toast.toast({
      description: 'Processing...',
    });

    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from('images')
      .upload(`public/${imageFile.name}`, imageFile);
    setIsUploading(false);
    if (error) {
      console.error('Error uploading image:', error);
      toast.toast({
        description: error.message,
      });
      return '';
    }
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    toast.toast({
      description: 'Process completed!',
    });

    return publicUrlData.publicUrl;
  }

  return {
    imageUrl,
    imageFile,
    setImageFile,
    setImageUrl,
    isUploading,
    handleFileChange,
    uploadImage,
  };
}
