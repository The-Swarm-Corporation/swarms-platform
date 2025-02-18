import { useState, useCallback } from 'react';

export type FileWithPreview = {
  file: File;
  preview: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
};

export function useFileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const getFileType = useCallback((file: File): FileWithPreview['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('document') || file.type.includes('pdf'))
      return 'document';
    return 'other';
  }, []);

  const processFile = useCallback(
    (file: File): Promise<FileWithPreview> => {
      return new Promise((resolve) => {
        const fileType = getFileType(file);

        if (fileType === 'image') {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              file,
              preview: reader.result as string,
              type: fileType,
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve({
            file,
            preview: '',
            type: fileType,
          });
        }
      });
    },
    [getFileType],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (!droppedFiles?.length) return;

      const processedFiles = await Promise.all(droppedFiles.map(processFile));
      setFiles((prev) => [...prev, ...processedFiles]);

      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    },
    [processFile],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setUploadProgress(0);
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (!selectedFiles?.length) return;

      const processedFiles = await Promise.all(selectedFiles.map(processFile));
      setFiles((prev) => [...prev, ...processedFiles]);

      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    },
    [processFile],
  );

  return {
    files,
    dragActive,
    uploadProgress,
    handleDrag,
    handleDrop,
    removeFile,
    clearFiles,
    handleFileSelect,
  };
}
