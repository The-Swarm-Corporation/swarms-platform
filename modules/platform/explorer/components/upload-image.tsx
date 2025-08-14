import { ProgressBar } from '@/shared/components/chat/components/progress';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { ImagePlus, Pencil, X } from 'lucide-react';
import Image from 'next/image';
import { RefObject } from 'react';

type Props = {
  image: string | null;
  imageUrl: string;
  uploadStatus: string;
  uploadProgress: number;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop?: (e: React.DragEvent) => void;
  handleImageEditClick: () => void;
  uploadRef: RefObject<HTMLInputElement | null>;
  error?: string;
  filePath: string;
  modelType: string;
  isDeleteFile: boolean;
  preface?: string;
  title?: string;
  deleteImage: (
    filePath: string,
    modelType: string,
    successMessage?: string,
  ) => void;
};

export default function ModelFileUpload({
  image,
  imageUrl,
  uploadStatus,
  uploadProgress,
  handleImageUpload,
  handleImageEditClick,
  filePath,
  isDeleteFile,
  deleteImage,
  modelType,
  handleDrop,
  uploadRef,
  error,
  preface,
  title = "Add Image"
}: Props) {
  return (
    <div className="mt-7">
      <div className="flex items-center gap-3 mb-3">
        {preface && (
          <span className="text-red-400 font-mono text-xs">{preface}</span>
        )}
        <p className="text-foreground font-medium">{title}</p>
      </div>

      <div
        className="relative w-full max-w-md cursor-pointer rounded-xl border border-dashed border-red-500/30 hover:border-red-500/50 bg-transparent py-8 text-center text-[#928E8B]"
        tabIndex={0}
        onClick={handleImageEditClick}
        onKeyDown={(e) => e.key === 'Enter' && handleImageEditClick()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        aria-label="Click to upload image"
      >
        {uploadStatus === 'uploading' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#00000070]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        {imageUrl || image ? (
          <div className="relative mx-auto h-[220px] w-full overflow-hidden rounded-xl">
            {(imageUrl || image)?.startsWith('blob:') || (imageUrl || image)?.startsWith('data:') ? (
              <img
                src={imageUrl || image || ''}
                alt={'Uploaded image'}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={imageUrl || image || ''}
                alt={'Uploaded image'}
                fill
                sizes="150px"
                className="object-cover"
                unoptimized
              />
            )}
            <div className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white">
              {imageUrl &&
                (isDeleteFile ? (
                  <LoadingSpinner size={15} />
                ) : (
                  <X
                    role="button"
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteImage(
                        filePath ?? '',
                        modelType,
                        'Image removed successfully',
                      );
                    }}
                    className="p-1 bg-red-500 text-white rounded-full"
                  />
                ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1">
            <ImagePlus size={32} />
            <p className="text-sm font-medium">
              Drop your image here, or browse
            </p>
            <p className="text-xs text-[#928E8B]">*Max file size 60MB</p>
          </div>
        )}

        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/bmp, image/tiff"
          className="hidden"
          onChange={handleImageUpload}
          ref={uploadRef as RefObject<HTMLInputElement>}
        />
      </div>

      {uploadStatus === 'uploading' && uploadProgress > 0 && (
        <div className="w-full flex items-end gap-1 bg-white/80 dark:bg-black/70">
          <ProgressBar progress={uploadProgress} className="h-2.5" />
          <span className="text-sm text-black dark:text-[#928E8B]">
            {uploadProgress}%
          </span>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
