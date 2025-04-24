import { ImagePlus, Pencil } from 'lucide-react';
import Image from 'next/image';
import { RefObject } from 'react';

type Props = {
  image: string | null;
  isUploading: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop?: (e: React.DragEvent) => void;
  handleImageEditClick: () => void;
  uploadRef: RefObject<HTMLInputElement>;
  error?: string;
};

export default function ModelFileUpload({
  image,
  isUploading,
  handleImageUpload,
  handleImageEditClick,
  handleDrop,
  uploadRef,
  error,
}: Props) {
  return (
    <div className="mt-7">
      <p className="mb-2 text-white text-sm">Add Image</p>

      <div
        className="relative w-full max-w-md cursor-pointer rounded-xl border border-dashed border-[#40403F] bg-transparent py-8 text-center text-[#928E8B]"
        tabIndex={0}
        onClick={handleImageEditClick}
        onKeyDown={(e) => e.key === 'Enter' && handleImageEditClick()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        aria-label="Click to upload image"
      >
        {isUploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#00000070]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        {image ? (
          <div className="relative mx-auto h-[200px] w-[200px] overflow-hidden rounded-xl">
            <Image
              src={image ?? ''}
              alt={'Uploaded image'}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white">
              <Pencil size={12} />
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
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          ref={uploadRef}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
