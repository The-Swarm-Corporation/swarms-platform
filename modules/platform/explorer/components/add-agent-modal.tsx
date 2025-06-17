import LoadingSpinner from '@/shared/components/loading-spinner';
import Modal from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import Input from '@/shared/components/ui/Input/Input';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { debounce } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { explorerCategories, languageOptions } from '@/shared/utils/constants';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import MultiSelect from '@/shared/components/ui/multi-select';
import { useMemo, useRef, useState } from 'react';
import { useModelFileUpload } from '../hook/upload-file';
import ModelFileUpload from './upload-image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  modelType: string;
  onAddSuccessfully: () => void;
}

const AddAgentModal = ({
  isOpen,
  onClose,
  onAddSuccessfully,
  modelType,
}: Props) => {
  const { user } = useAuthContext();
  const [agentName, setAgentName] = useState('');
  const [description, setDescription] = useState('');
  const [agent, setAgent] = useState('');
  const [tags, setTags] = useState('');
  const [language, setLanguage] = useState('python');
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

  const validateAgent = trpc.explorer.validateAgent.useMutation();

  const debouncedCheckPrompt = useMemo(() => {
    const debouncedFn = debounce((value: string) => {
      validateAgent.mutateAsync(value);
    }, 400);
    return debouncedFn;
  }, []);

  const toast = useToast();
  const utils = trpc.useUtils(); // For immediate cache invalidation

  const addAgent = trpc.explorer.addAgent.useMutation();

  const handleCategoriesChange = (selectedCategories: string[]) => {
    setCategories(selectedCategories);
  };

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
    // Validate Agent
    if (validateAgent.isPending) {
      toast.toast({
        title: 'Validating Agent',
      });
      return;
    }

    if (agentName.trim().length < 2) {
      toast.toast({
        title: 'Name should be at least 2 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (validateAgent.data && !validateAgent.data.valid) {
      toast.toast({
        title: 'Invalid Agent',
        description: validateAgent.data.error,
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
          title: 'Wallet address is required for paid agents',
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

    // Add Agent
    addAgent
      .mutateAsync({
        name: agentName,
        agent,
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
        language,
        requirements: [
          { package: 'requests', installation: 'pip3 install requests' },
        ],
        tags: trimTags,
        isFree,
        price: isFree ? 0 : parseFloat(price),
        sellerWalletAddress: isFree ? '' : walletAddress,
      })
      .then(async () => {
        toast.toast({
          title: 'Agent added successfully 🎉',
        });

        onClose();
        onAddSuccessfully();
        // Reset form
        setAgentName('');
        setAgent('');
        setDescription('');
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
      className="max-w-2xl overflow-y-auto border-2 border-red-500 rounded-lg bg-black/80 backdrop-blur-sm"
      isOpen={isOpen}
      onClose={onClose}
      title=""
    >
      <div className="flex flex-col gap-4 overflow-y-auto h-[70vh] relative">
        <div className="sticky top-0 z-10 bg-black/90 border-b border-red-500/30 px-6 py-4">
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Submit Your Agent
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Share your agent with the community by filling out the details
            below. Make sure to provide clear descriptions, categories and
            appropriate tags below. Make sure to provide clear descriptions and
            appropriate tags to help others discover and use your agent
            effectively.
          </p>
        </div>

        <div className="px-6 pb-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm text-gray-200 flex items-center gap-2">
              Name
              <span className="text-xs text-red-500">*</span>
            </span>
            <div className="relative">
              <Input
                value={agentName}
                onChange={setAgentName}
                placeholder="Give your agent a unique and descriptive name"
                className="border border-red-500/30 focus:border-red-500 transition-colors bg-black/40"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm text-gray-200 flex items-center gap-2">
              Description
              <span className="text-xs text-red-500">*</span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your agent does and how it can help others"
              className="w-full h-20 p-3 border border-red-500/30 focus:border-red-500 rounded-md bg-black/40 outline-0 resize-none transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm text-gray-200 flex items-center gap-2">
              Agent Code
              <span className="text-xs text-red-500">*</span>
            </span>
            <div className="relative">
              <textarea
                value={agent}
                onChange={(v) => {
                  setAgent(v.target.value);
                  debouncedCheckPrompt(v.target.value);
                }}
                required
                placeholder="Paste your agent's code here..."
                className="w-full h-40 p-3 border border-red-500/30 focus:border-red-500 rounded-md bg-black/40 outline-0 resize-none font-mono text-sm transition-colors"
              />
              {validateAgent.isPending ? (
                <div className="absolute right-3 top-3">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="absolute right-3 top-3">
                  {agent.length > 0 && validateAgent.data && (
                    <span
                      className={
                        validateAgent.data.valid
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      {validateAgent.data.valid ? '✅' : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
            {agent.length > 0 &&
              !validateAgent.isPending &&
              validateAgent.data &&
              !validateAgent.data.valid && (
                <span className="text-red-500 text-sm">
                  {validateAgent.data.error}
                </span>
              )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm text-gray-200">Language</span>
            <Select onValueChange={setLanguage} value={language}>
              <SelectTrigger className="w-1/2 cursor-pointer capitalize border border-red-500/30 focus:border-red-500 transition-colors bg-black/40">
                <SelectValue placeholder={language} />
              </SelectTrigger>
              <SelectContent className="capitalize border border-red-500/30">
                {languageOptions?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm text-gray-200">
              Categories
            </span>
            <MultiSelect
              options={explorerCategories.map((category) => ({
                id: category.value,
                label: category.label,
              }))}
              selectedValues={categories}
              onChange={handleCategoriesChange}
              placeholder="Select categories"
              className="border !border-red-500/30 !focus:border-red-500 transition-colors bg-black/40"
            />
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
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm text-gray-200">Tags</span>
            <Input
              value={tags}
              onChange={setTags}
              placeholder="Add relevant tags (e.g., AI, Data Processing, Web Scraping)"
              className="border border-red-500/30 focus:border-red-500 transition-colors bg-black/40"
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

          <div className="flex justify-end mt-4 pt-4 border-t border-red-500/30">
            <Button
              disabled={addAgent.isPending || isLoading}
              onClick={submit}
              className="w-40 border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-colors duration-200 font-medium"
            >
              {addAgent.isPending || isLoading
                ? 'Submitting...'
                : 'Submit Agent'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddAgentModal;
