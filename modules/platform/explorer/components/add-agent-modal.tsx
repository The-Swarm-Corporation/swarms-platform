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
      if (!price || isNaN(priceNum) || priceNum <= 0 || priceNum > 999) {
        toast.toast({
          title: 'Price must be between 0.01 and 999',
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
        sellerWalletAddress: isFree ? "" : walletAddress,
      })
      .then(async () => {
        toast.toast({
          title: 'Agent added successfully 🎉',
        });

        await Promise.all([
          utils.explorer.getExplorerData.invalidate(),
          utils.main.trending.invalidate(),
        ]);

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
      className="w-full max-w-md md:max-w-4xl overflow-hidden border-2 border-red-500/50 rounded-none bg-background backdrop-blur-sm shadow-2xl shadow-red-500/20"
      overlayClassName="backdrop-blur-md bg-background/60"
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showHeader={false}
      showClose={false}
    >
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="relative z-10 flex flex-col h-[85vh] sm:h-[80vh] md:h-[75vh]">
        <div className="relative bg-background/95 border-b-2 border-red-500/50 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-red-500" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-red-500" />

          <div className="flex items-center justify-between mb-4">
            <div />
            <button
              onClick={onClose}
              className="group relative p-2 border border-red-500/30 hover:border-red-500 transition-all duration-300 bg-background/50 hover:bg-red-500/10"
            >
              <svg
                className="w-5 h-5 text-muted-foreground group-hover:text-red-400 transition-colors"
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
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-wider">
                AGENT SUBMISSION
                <div className="h-1 w-20 sm:w-24 md:w-32 bg-gradient-to-r from-red-500 to-transparent mt-1" />
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm font-mono leading-relaxed max-w-2xl">
                Share your agent with the community by filling out the details
                below. Make sure to provide clear descriptions, categories and
                appropriate tags below.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[01]</span>
              <span className="font-medium text-foreground">NAME</span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="relative">
              <Input
                value={agentName}
                onChange={setAgentName}
                placeholder="Enter unique agent designation..."
                className="bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground h-10 sm:h-12 px-3 sm:px-4 font-mono text-sm sm:text-base transition-all duration-300 hover:bg-background/80"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-red-500/50 rounded-full" />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[02]</span>
              <span className="font-medium text-foreground">DESCRIPTION</span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Define agent capabilities and operational parameters..."
                className="w-full rounded-xl h-20 sm:h-24 p-3 sm:p-4 bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground resize-none font-mono text-xs sm:text-sm transition-all duration-300 hover:bg-background/80 outline-none"
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
              <span className="font-medium text-foreground">CODE</span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="relative">
              <textarea
                value={agent}
                onChange={(e) => {
                  setAgent(e.target.value);
                  debouncedCheckPrompt(e.target.value);
                }}
                required
                placeholder="// Initialize agent code..."
                className="w-full rounded-xl h-32 sm:h-40 md:h-48 p-3 sm:p-4 bg-background/80 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground resize-none font-mono text-xs sm:text-sm transition-all duration-300 hover:bg-background/90 outline-none"
              />

              <div className="absolute top-3 right-3 flex items-center gap-2">
                {validateAgent.isPending ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <span className="text-yellow-400 font-mono text-xs">
                      ANALYZING...
                    </span>
                  </div>
                ) : (
                  agent.length > 0 &&
                  validateAgent.data && (
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${validateAgent.data.valid ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      <span
                        className={`font-mono text-xs ${validateAgent.data.valid ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {validateAgent.data.valid ? 'VALIDATED' : 'ERROR'}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {agent.length > 0 &&
              !validateAgent.isPending &&
              validateAgent.data &&
              !validateAgent.data.valid && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-sm">
                  <span className="text-red-500">[ERROR]</span>{' '}
                  {validateAgent.data.error}
                </div>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="group">
              <label className="flex items-center gap-3 mb-3">
                <span className="text-red-400 font-mono text-xs">[04]</span>
                <span className="font-medium text-foreground">LANGUAGE</span>
                <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
              </label>
              <Select onValueChange={setLanguage} value={language}>
                <SelectTrigger className="h-10 sm:h-12 bg-background/60 border border-red-500/30 focus:border-red-500 text-foreground font-mono text-sm sm:text-base transition-all duration-300 hover:bg-background/80">
                  <SelectValue placeholder="Select protocol..." />
                </SelectTrigger>
                <SelectContent className="bg-background border z-[9999] border-red-500/50 text-foreground">
                  {languageOptions?.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="font-mono hover:bg-red-500/20"
                    >
                      {option.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="group">
              <label className="flex items-center gap-3 mb-3">
                <span className="text-red-400 font-mono text-xs">[05]</span>
                <span className="font-medium text-foreground">CLASSIFICATION</span>
                <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
              </label>
              <MultiSelect
                options={explorerCategories.map((category) => ({
                  id: category.value,
                  label: category.label,
                }))}
                selectedValues={categories}
                onChange={handleCategoriesChange}
                placeholder="Select categories..."
                className="h-10 sm:h-12 bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground font-mono text-sm sm:text-base transition-all duration-300 hover:bg-background/80"
              />
            </div>
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
            preface="[06]"
            title="ADD_IMAGE"
          />

          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[07]</span>
              <span className="font-medium text-foreground">TAGS</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <Input
              value={tags}
              onChange={setTags}
              placeholder="ai, automation, tools, data-processing..."
              className="bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground h-10 sm:h-12 px-3 sm:px-4 font-mono text-sm sm:text-base transition-all duration-300 hover:bg-background/80"
            />
          </div>

          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[08]</span>
              <span className="font-medium text-foreground">PRICING</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>

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
                  <div className={`w-2 h-2 rounded-full ${isFree ? 'bg-green-500' : 'bg-red-500/30'}`} />
                  FREE
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
                  <div className={`w-2 h-2 rounded-full ${!isFree ? 'bg-yellow-500' : 'bg-red-500/30'}`} />
                  PAID
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
                      min="0.01"
                      max="999"
                      step="0.01"
                      className="bg-background/60 border-2 border-yellow-500/30 focus:border-yellow-500 text-foreground placeholder-muted-foreground h-10 sm:h-12 px-3 sm:px-4 font-mono text-sm sm:text-base transition-all duration-300 hover:bg-background/80"
                    />
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Maximum price: 999 SOL
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Wallet Address <span className="text-yellow-500">*</span>
                    </label>
                    <Input
                      value={walletAddress}
                      onChange={setWalletAddress}
                      placeholder="Enter your Solana wallet address..."
                      className="bg-background/60 border-2 border-yellow-500/30 focus:border-yellow-500 text-foreground placeholder-muted-foreground h-10 sm:h-12 px-3 sm:px-4 font-mono text-sm sm:text-base transition-all duration-300 hover:bg-background/80"
                    />
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Platform takes 10% commission. You&apos;ll receive 90% of the sale price.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative bg-background/95 border-t-2 border-red-500/50 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-red-500" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-red-500" />

          <div className="flex items-center justify-between">
            <div />
            <Button
              disabled={addAgent.isPending || isLoading}
              onClick={submit}
              className="relative group px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-background border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-mono font-bold tracking-wider overflow-hidden text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">
                {addAgent.isPending || isLoading
                  ? 'DEPLOYING...'
                  : 'DEPLOY_AGENT'}
              </span>
              {!addAgent.isPending && !isLoading && (
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

export default AddAgentModal;
