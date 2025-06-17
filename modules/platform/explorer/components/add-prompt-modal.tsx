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
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

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

    // Validate pricing fields
    if (!isFree) {
      const priceNum = parseFloat(price);
      if (
        !price ||
        isNaN(priceNum) ||
        priceNum < 0.000001 ||
        priceNum > 999999
      ) {
        toast.toast({
          title: 'Price must be between 0.000001 and 999,999 SOL',
          variant: 'destructive',
        });
        return;
      }

      if (!walletAddress.trim()) {
        toast.toast({
          title: 'Wallet address is required for paid prompts',
          variant: 'destructive',
        });
        return;
      }
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
        isFree,
        price: isFree ? 0 : parseFloat(price),
        sellerWalletAddress: isFree ? '' : walletAddress,
      })
      .then(async () => {
        toast.toast({
          title: 'Prompt added successfully 🎉',
        });

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
      className="max-w-2xl"
      isOpen={isOpen}
      onClose={onClose}
      title="Add Prompt"
    >
      <div className="flex flex-col gap-2 overflow-y-auto h-[75vh] relative px-4">
        <div className="flex flex-col gap-1">
          <span>Name</span>
          <div className="relative">
            <Input
              value={promptName}
              onChange={setPromptName}
              placeholder="Enter name"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span>Prompt</span>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(v) => {
                setPrompt(v.target.value);
                debouncedCheckPrompt(v.target.value);
              }}
              required
              placeholder="Enter prompt here..."
              className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
            />
            {validatePrompt.isPending ? (
              <div className="absolute right-2 top-2">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="absolute right-2.5 top-2.5">
                {prompt.length > 0 && validatePrompt.data && (
                  <span
                    className={
                      validatePrompt.data.valid
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {validatePrompt.data.valid ? '✅' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          {prompt.length > 0 &&
            !validatePrompt.isPending &&
            validatePrompt.data &&
            !validatePrompt.data.valid && (
              <span className="text-red-500 text-sm">
                {validatePrompt.data.error}
              </span>
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
        />
        <div className="flex flex-col gap-1">
          <span>Categories</span>
          <MultiSelect
            options={explorerCategories.map((category) => ({
              id: category.value,
              label: category.label,
            }))}
            selectedValues={categories}
            onChange={handleCategoriesChange}
            placeholder="Select categories"
          />
        </div>

        <div className="flex flex-col gap-1 mt-4">
          <span>Tags</span>
          <Input
            value={tags}
            onChange={setTags}
            placeholder="Tools, Search, etc."
          />
        </div>

        <div className="group flex flex-col gap-2">
          <span className="font-medium text-sm text-gray-200">Pricing</span>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={`flex items-center gap-2 px-4 py-2 border-2 transition-all duration-300 font-mono text-sm ${
                  isFree
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-red-500/30 bg-background/60 text-muted-foreground hover:border-red-500/50'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${isFree ? 'bg-green-500' : 'bg-red-500/30'}`}
                />
                Free
              </button>

              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`flex items-center gap-2 px-4 py-2 border-2 transition-all duration-300 font-mono text-sm ${
                  !isFree
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                    : 'border-red-500/30 bg-background/60 text-muted-foreground hover:border-red-500/50'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${!isFree ? 'bg-yellow-500' : 'bg-red-500/30'}`}
                />
                Paid
              </button>
            </div>

            {!isFree && (
              <div className="space-y-4 p-4 border border-yellow-500/30 bg-yellow-500/5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price (SOL) <span className="text-yellow-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={price}
                    onChange={setPrice}
                    placeholder="0.00"
                    min="0.000001"
                    max="999999"
                    step="0.000001"
                    className="bg-background/40 border border-yellow-500/30 focus:border-yellow-500 text-foreground placeholder-muted-foreground transition-colors duration-300 hover:bg-background/60"
                  />
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Range: 0.000001 - 999,999 SOL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Wallet Address{' '}
                    <span className="text-yellow-500">*</span>
                  </label>
                  <Input
                    value={walletAddress}
                    onChange={setWalletAddress}
                    placeholder="Enter your Solana wallet address..."
                    className="bg-background/40 border border-yellow-500/30 focus:border-yellow-500 text-foreground placeholder-muted-foreground transition-colors duration-300 hover:bg-background/60"
                  />
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Platform takes 10% commission. You&apos;ll receive 90% of
                    the sale price.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            disabled={addPrompt.isPending || isLoading}
            onClick={submit}
            className="w-32"
          >
            {addPrompt.isPending || isLoading
              ? 'Submitting...'
              : 'Submit Prompt'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPromptModal;
