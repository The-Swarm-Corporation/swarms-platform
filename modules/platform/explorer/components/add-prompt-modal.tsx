import LoadingSpinner from '@/shared/components/loading-spinner';
import Modal from '@/shared/components/modal';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { Button } from '@/shared/components/ui/button';
import Input from '@/shared/components/ui/Input/Input';
import MultiSelect from '@/shared/components/ui/multi-select';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { explorerCategories } from '@/shared/utils/constants';
import { debounce, launchConfetti } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useMemo, useRef, useState } from 'react';
import { useModelFileUpload } from '../hook/upload-file';
import ModelFileUpload from './upload-image';

interface Props {
  isOpen: boolean;
  modelType: string;
  onClose: () => void;
  onAddSuccessfully: () => void;
}

const AddPromptModal = ({
  isOpen,
  onClose,
  modelType,
  onAddSuccessfully,
}: Props) => {
  const { user } = useAuthContext();

  const [promptName, setPromptName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    image,
    imageUrl,
    filePath,
    uploadProgress,
    uploadStatus,
    isDeleteFile,
    uploadImage,
    deleteImage,
  } = useModelFileUpload();

  const imageUploadRef = useRef<HTMLInputElement>(null);

  const validatePrompt = trpc.explorer.validatePrompt.useMutation();

  const debouncedCheckPrompt = useMemo(() => {
    const debouncedFn = debounce((value: string) => {
      validatePrompt.mutateAsync(value);
    }, 400);
    return debouncedFn;
  }, []);

  const handleCategoriesChange = (selectedCategories: string[]) => {
    setCategories(selectedCategories);
  };

  const toast = useToast();
  const utils = trpc.useUtils(); // For immediate cache invalidation

  const addPrompt = trpc.explorer.addPrompt.useMutation();

  const handleImageUploadClick = () => {
    imageUploadRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadStatus === 'uploading') return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (filePath && modelType) {
      await deleteImage(filePath, modelType);
    }

    await uploadImage(file, modelType);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (uploadStatus === 'uploading') return;

    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (filePath && modelType) {
      await deleteImage(filePath, modelType);
    }

    await uploadImage(file, modelType);
  };

  const submit = () => {
    // Validate prompt
    if (validatePrompt.isPending) {
      toast.toast({
        title: 'Validating prompt',
      });
      return;
    }

    if (promptName.trim().length < 2) {
      toast.toast({
        title: 'Name should be at least 2 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (prompt.trim().length === 0) {
      toast.toast({
        title: 'Prompt is required',
        variant: 'destructive',
      });
      return;
    }

    if (validatePrompt.data && !validatePrompt.data.valid) {
      toast.toast({
        title: 'Invalid Prompt',
        description: validatePrompt.data.error,
        variant: 'destructive',
      });
      return;
    }

    if (categories.length === 0) {
      toast.toast({
        title: 'Please select at least one category',
        variant: 'destructive',
      });
      return;
    }

    const trimTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .join(',');

    setIsLoading(true);

    // Add prompt
    addPrompt
      .mutateAsync({
        name: promptName,
        prompt,
        description,
        category: categories,
        imageUrl: imageUrl || undefined,
        filePath: imageUrl && filePath ? filePath : undefined,
        useCases: [
          {
            title: '',
            description: '',
          },
        ],
        tags: trimTags,
      })
      .then(async () => {
        toast.toast({
          title: 'Prompt added successfully 🎉',
        });

        await Promise.all([
          utils.explorer.getExplorerData.invalidate(),
          utils.main.trending.invalidate(),
        ]);

        onClose();

        //celeberate the confetti
        launchConfetti();

        onAddSuccessfully();
        // Reset form
        setPromptName('');
        setDescription('');
        setPrompt('');
        setTags('');
      })
      .catch((error) => {
        console.log({ error });
        toast.toast({
          title: 'An error has occurred',
        });
        setIsLoading(false);
      });
  };

  if (!user) return null;

  return (
    <Modal
      className="w-full max-w-md md:max-w-4xl overflow-hidden border-2 border-red-500/50 rounded-none bg-black backdrop-blur-sm shadow-2xl shadow-red-500/20"
      overlayClassName="backdrop-blur-md bg-black/60"
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showHeader={false}
      showClose={false}
    >
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:25px_25px]" />
      </div>

      <div className="relative z-10 flex flex-col h-[85vh] sm:h-[80vh] md:h-[75vh]">
        <div className="relative bg-black/95 border-b-2 border-red-500/50 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-red-500" />
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-red-500" />

          <div className="flex items-center justify-end mb-4">
            <button
              onClick={onClose}
              className="group relative p-2 border border-red-500/30 hover:border-red-500 transition-all duration-300 bg-black/50 hover:bg-red-500/10"
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 tracking-wider">
                PROMPT SUBMISSION
                <div className="h-1 w-20 sm:w-24 md:w-28 bg-gradient-to-r from-red-500 to-transparent mt-1" />
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm font-mono leading-relaxed max-w-2xl">
                Share your prompt with the community by filling out the details
                below. Make it clear, useful, and well-tagged so others can
                easily find and use it.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[01]</span>
              <span className="font-medium text-white">PROMPT_NAME</span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="relative">
              <Input
                value={promptName}
                onChange={setPromptName}
                placeholder="Enter cognitive pattern identifier..."
                className="bg-black/60 border-2 border-red-500/30 focus:border-red-500 text-white placeholder-gray-500 h-10 sm:h-12 px-3 sm:px-4 font-mono text-sm sm:text-base transition-all duration-300 hover:bg-black/80"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-red-500/50 rounded-full" />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[02]</span>
              <span className="font-medium text-white">PROMPT_DESCRIPTION</span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Define behavioral patterns and parameters..."
                className="w-full h-16 sm:h-20 rounded-lg p-3 sm:p-4 bg-black/60 border-2 border-red-500/30 focus:border-red-500 text-white placeholder-gray-500 resize-none font-mono text-xs sm:text-sm transition-all duration-300 hover:bg-black/80 outline-none"
              />
              <div className="absolute bottom-3 right-3 flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 bg-red-500/50 rounded-full"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animation: 'pulse 2s infinite',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[03]</span>
              <span className="font-medium text-white">PROMPT</span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  debouncedCheckPrompt(e.target.value);
                }}
                required
                placeholder="You are an advanced AI assistant with specialized capabilities..."
                className="w-full h-24 sm:h-28 md:h-32 p-3 sm:p-4 bg-black/80 rounded-lg border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-gray-500 resize-none font-mono text-xs sm:text-sm transition-all duration-300 hover:bg-black/90 outline-none leading-relaxed"
              />

              <div className="absolute top-3 right-3 flex items-center gap-2">
                {validatePrompt.isPending ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <span className="text-yellow-400 font-mono text-xs">
                      PARSING...
                    </span>
                  </div>
                ) : (
                  prompt.length > 0 &&
                  validatePrompt.data && (
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${validatePrompt.data.valid ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      <span
                        className={`font-mono text-xs ${validatePrompt.data.valid ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {validatePrompt.data.valid ? 'VALIDATED' : 'ERROR'}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="absolute bottom-3 left-3 text-gray-600 font-mono text-xs">
                {prompt.length} chars
              </div>
            </div>

            {prompt.length > 0 &&
              !validatePrompt.isPending &&
              validatePrompt.data &&
              !validatePrompt.data.valid && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-sm">
                  <span className="text-red-500">[ERROR]</span>{' '}
                  {validatePrompt.data.error}
                </div>
              )}
          </div>

          <ModelFileUpload
            image={image}
            imageUrl={imageUrl || ''}
            filePath={filePath || ''}
            isDeleteFile={isDeleteFile}
            deleteImage={deleteImage}
            modelType={modelType}
            handleImageUpload={handleFileSelect}
            handleDrop={handleDrop}
            handleImageEditClick={handleImageUploadClick}
            uploadRef={imageUploadRef}
            uploadStatus={uploadStatus}
            uploadProgress={uploadProgress}
            preface="[04]"
            title="ADD_IMAGE"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="group">
              <label className="flex items-center gap-3 mb-3">
                <span className="text-red-400 font-mono text-xs">[05]</span>
                <span className="font-medium text-white">CLASSIFICATION</span>
                <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
              </label>
              <MultiSelect
                options={explorerCategories.map((category) => ({
                  id: category.value,
                  label: category.label,
                }))}
                selectedValues={categories}
                onChange={handleCategoriesChange}
                placeholder="Select classifications..."
                className="h-10 sm:h-12 bg-black/60 border-2 border-red-500/30 focus:border-red-500 text-white font-mono text-sm sm:text-base transition-all duration-300 hover:bg-black/80"
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-3 mb-3">
                <span className="text-red-400 font-mono text-xs">[06]</span>
                <span className="font-medium text-white">METADATA_TAGS</span>
                <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
              </label>
              <Input
                value={tags}
                onChange={setTags}
                placeholder="analysis, creative, technical, search..."
                className="bg-black/60 border-2 border-red-500/30 focus:border-red-500 text-white placeholder-gray-500 h-10 sm:h-12 px-3 sm:px-4 font-mono text-sm sm:text-base transition-all duration-300 hover:bg-black/80"
              />
            </div>
          </div>
        </div>

        <div className="relative bg-black/95 border-t-2 border-red-500/50 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-red-500" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-red-500" />

          <div className="flex items-center justify-end">
            <Button
              disabled={addPrompt.isPending || isLoading}
              onClick={submit}
              className="relative group px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-black border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-mono font-bold tracking-wider overflow-hidden text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">
                {addPrompt.isPending || isLoading
                  ? 'SUBMITTING...'
                  : 'SUBMIT_PROMPT'}
              </span>
              {!addPrompt.isPending && !isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddPromptModal;
