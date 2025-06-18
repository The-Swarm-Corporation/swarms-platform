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
import { useMemo, useRef, useState, useEffect } from 'react';
import { useModelFileUpload } from '../hook/upload-file';
import ModelFileUpload from './upload-image';
import { useMarketplaceValidation } from '@/shared/hooks/use-deferred-validation';

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
  const [isValidating, setIsValidating] = useState(false);

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
  const checkTrustworthiness = trpc.marketplace.checkUserTrustworthiness.useQuery(
    undefined,
    {
      enabled: !isFree, // Only check when user wants to create paid content
      retry: false,
    }
  );

  // Initialize deferred validation
  const validation = useMarketplaceValidation();

  // Update validation fields when state changes
  useEffect(() => {
    validation.updateField('name', agentName);
    validation.updateField('description', description);
    validation.updateField('content', agent);
    validation.updateField('price', price);
    validation.updateField('walletAddress', walletAddress);
    validation.updateField('tags', tags);
  }, [agentName, description, agent, price, walletAddress, tags]);

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
    // Check if validation is in progress
    if (isValidating || validateAgent.isPending) {
      toast.toast({
        title: 'Please wait for validation to complete',
        variant: 'destructive',
      });
      return;
    }

    // Validate all fields using deferred validation
    if (!validation.validateAll()) {
      toast.toast({
        title: 'Please fix the errors in the form',
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

    // Check trustworthiness for paid items
    if (!isFree) {
      if (checkTrustworthiness.isLoading) {
        toast.toast({
          title: 'Checking eligibility...',
        });
        return;
      }

      if (checkTrustworthiness.error) {
        toast.toast({
          title: 'Unable to verify eligibility',
          description: 'Please try again later',
          variant: 'destructive',
        });
        return;
      }

      if (checkTrustworthiness.data && !checkTrustworthiness.data.isEligible) {
        toast.toast({
          title: 'Not eligible for marketplace',
          description: checkTrustworthiness.data.reason,
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

        // Parse error message for better user feedback
        let errorMessage = 'An error has occurred';
        let isApiFailure = false;

        if (error?.message) {
          if (error.message.includes('Fallback validation:')) {
            errorMessage = error.message;
            isApiFailure = true;
          } else if (error.message.includes('Content quality score')) {
            errorMessage = error.message;
          } else if (error.message.includes('not eligible')) {
            errorMessage = error.message;
          } else if (error.message.includes('API request failed') || error.message.includes('temporarily unavailable')) {
            errorMessage = error.message;
            isApiFailure = true;
          } else {
            errorMessage = error.message;
          }
        }

        toast.toast({
          title: isApiFailure ? 'Validation Service Issue' : 'Submission Failed',
          description: errorMessage,
          variant: 'destructive',
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
          {/* Quality Validation Disclosure */}
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 text-lg">ℹ️</span>
              <div className="text-sm">
                <p className="text-blue-300 font-medium mb-1">Quality Validation Notice</p>
                <p className="text-blue-200 text-xs leading-relaxed">
                  All agent submissions undergo automated quality validation to maintain marketplace standards.
                  {!isFree && (
                    <span className="text-yellow-300"> Paid submissions require higher quality scores and contributor eligibility checks.</span>
                  )}
                  {' '}Low-quality entries will be rejected with constructive feedback to help you improve.
                </p>
                <p className="text-blue-100 text-xs mt-2 font-mono">
                  <strong>Fallback Policy:</strong> If our AI validation service is unavailable, we&apos;ll check your submission history instead.
                  {isFree ? ' Free submissions need 2+ approved items.' : ' Paid submissions need 2+ approved items with 3.5+ average rating.'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm text-gray-200 flex items-center gap-2">
              Name
              <span className="text-xs text-red-500">*</span>
            </span>
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
                onChange={(v) => {
                  setAgent(v.target.value);
                  // Only trigger API validation on blur, not on every keystroke
                }}
                onBlur={async () => {
                  validation.validateOnBlur('content');
                  if (agent.trim().length >= 5) {
                    setIsValidating(true);
                    try {
                      await validateAgent.mutateAsync(agent);
                    } finally {
                      setIsValidating(false);
                    }
                  }
                }}
                required
                placeholder="Paste your agent's code here..."
                className={`w-full h-40 p-3 border rounded-md bg-black/40 outline-0 resize-none font-mono text-sm transition-colors ${
                  validation.fields.content?.error ? 'border-red-500' : 'border-red-500/30 focus:border-red-500'
                }`}
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
            {/* Show validation errors */}
            {validation.fields.content?.error && (
              <span className="text-red-500 text-sm">
                {validation.fields.content.error}
              </span>
            )}
            {/* Show API validation errors */}
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
                  {/* Trustworthiness Status */}
                  {checkTrustworthiness.isLoading && (
                    <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <LoadingSpinner />
                      <span className="text-blue-400 text-sm">Checking marketplace eligibility...</span>
                    </div>
                  )}

                  {checkTrustworthiness.data && !checkTrustworthiness.data.isEligible && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-400 font-medium">❌ Not Eligible for Marketplace</span>
                      </div>
                      <p className="text-red-300 text-sm">{checkTrustworthiness.data.reason}</p>
                      {!checkTrustworthiness.data.isBypassUser && (
                        <div className="mt-2 text-xs text-red-200">
                          <p>Requirements: 2+ published items with 3.5+ average rating</p>
                          <p>Your stats: {checkTrustworthiness.data.publishedCount} published, {checkTrustworthiness.data.averageRating.toFixed(1)} avg rating</p>
                        </div>
                      )}
                    </div>
                  )}

                  {checkTrustworthiness.data && checkTrustworthiness.data.isEligible && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-medium">✅ Eligible for Marketplace</span>
                      </div>
                      {!checkTrustworthiness.data.isBypassUser && (
                        <p className="text-green-300 text-sm mt-1">
                          {checkTrustworthiness.data.publishedCount} published items, {checkTrustworthiness.data.averageRating.toFixed(1)} avg rating
                        </p>
                      )}
                    </div>
                  )}
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
              disabled={
                addAgent.isPending ||
                isLoading ||
                isValidating ||
                validateAgent.isPending ||
                (!isFree && checkTrustworthiness.isLoading) ||
                (!isFree && checkTrustworthiness.data && !checkTrustworthiness.data.isEligible)
              }
              onClick={submit}
              className="relative group px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-background border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-mono font-bold tracking-wider overflow-hidden text-sm sm:text-base"
            >
              {addAgent.isPending || isLoading
                ? 'Submitting...'
                : isValidating || validateAgent.isPending
                ? 'Validating...'
                : !isFree && checkTrustworthiness.isLoading
                ? 'Checking...'
                : 'Submit Agent'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddAgentModal;
