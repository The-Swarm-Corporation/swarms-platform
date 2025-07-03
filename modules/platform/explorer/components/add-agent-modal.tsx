import LoadingSpinner from '@/shared/components/loading-spinner';
import Modal from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import Input from '@/shared/components/ui/Input/Input';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

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
import { useRef, useState, useEffect, useCallback } from 'react';
import { useModelFileUpload } from '../hook/upload-file';
import ModelFileUpload from './upload-image';
import { useMarketplaceValidation } from '@/shared/hooks/use-deferred-validation';
import { SmartWalletInput } from '@/shared/components/marketplace/smart-wallet-input';
import { WalletProvider } from '@/shared/components/marketplace/wallet-provider';
import { getSolPrice } from '@/shared/services/sol-price';
import { launchConfetti } from '@/shared/utils/helpers';

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
  const [priceUsd, setPriceUsd] = useState(''); // USD price input
  const [walletAddress, setWalletAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null); // SOL equivalent preview
  const [isConvertingPrice, setIsConvertingPrice] = useState(false);

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
  const toast = useToast();

  const addAgent = trpc.explorer.addAgent.useMutation();
  const checkTrustworthiness =
    trpc.marketplace.checkUserTrustworthiness.useQuery(undefined, {
      enabled: !isFree,
      retry: false,
    });

  const validation = useMarketplaceValidation();

  // Convert USD to SOL on price change
  const convertUsdToSol = async (usdPrice: string) => {
    if (!usdPrice || isNaN(parseFloat(usdPrice))) {
      setSolPrice(null);
      return;
    }

    setIsConvertingPrice(true);
    try {
      const currentSolPrice = await getSolPrice();
      const solEquivalent = parseFloat(usdPrice) / currentSolPrice;
      setSolPrice(solEquivalent);
    } catch (error) {
      console.error('Failed to convert USD to SOL:', error);
      setSolPrice(null);
    } finally {
      setIsConvertingPrice(false);
    }
  };

  useEffect(() => {
    validation.updateField('name', agentName);
    validation.updateField('description', description);
    validation.updateField('content', agent);
    validation.updateField('price', priceUsd);
    validation.updateField('walletAddress', walletAddress);
    validation.updateField('tags', tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentName, description, agent, priceUsd, walletAddress, tags]);

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

  const resetForm = useCallback(() => {
    setAgentName('');
    setDescription('');
    setAgent('');
    setTags('');
    setLanguage('python');
    setCategories([]);
    setIsFree(true);
    setPriceUsd('');
    setWalletAddress('');
    setSolPrice(null);
    setIsLoading(false);
    setIsValidating(false);
    setIsConvertingPrice(false);

    validation.reset();

    validateAgent.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [justSubmitted, setJustSubmitted] = useState(false);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (isOpen && justSubmitted) {
      resetForm();
      setJustSubmitted(false);
    }
  }, [isOpen, justSubmitted, resetForm]);

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
    if (isValidating || validateAgent.isPending) {
      toast.toast({
        title: 'Please wait for validation to complete',
        variant: 'destructive',
      });
      return;
    }

    try {
      const validationResult = validation.validateAll();
      if (!validationResult.isValid) {
        const firstError = validationResult.errors[0];
        toast.toast({
          title: 'Form Validation Error',
          description: firstError || 'Please check all required fields',
          variant: 'destructive',
        });
        return;
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.toast({
        title: 'Validation Error',
        description: 'Please check all fields and try again',
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
        price_usd: isFree ? 0 : parseFloat(priceUsd),
        sellerWalletAddress: isFree ? '' : walletAddress,
      })
      .then(async () => {
        toast.toast({
          title: 'Agent added successfully 🎉',
        });

        launchConfetti();

        onAddSuccessfully();

        setJustSubmitted(true);

        resetForm();

        onClose();
      })
      .catch((error) => {
        console.log({ error });

        let errorMessage = 'Unable to submit your agent. Please try again.';
        let isApiFailure = false;

        if (error?.message) {
          if (error.message.includes('validation system') || error.message.includes('temporarily')) {
            errorMessage = error.message;
            isApiFailure = true;
          } else if (error.message.includes('quality standards') || error.message.includes('needs improvement')) {
            errorMessage = error.message;
          } else if (error.message.includes('paid content') || error.message.includes('highly-rated items')) {
            errorMessage = error.message;
          } else if (error.message.includes('Daily limit')) {
            errorMessage = error.message;
          } else if (error.message.includes('Price must be')) {
            errorMessage = 'Please enter a valid price for paid agents (minimum $0.01).';
          } else if (error.message.includes('Wallet address')) {
            errorMessage = 'Please enter a valid wallet address for paid agents.';
          } else if (error.message.includes('already exists')) {
            errorMessage = 'This agent already exists. Please create something unique.';
          } else {
            errorMessage = 'Unable to submit your agent. Please check your content and try again.';
          }
        }

        toast.toast({
          title: isApiFailure
            ? 'Service Temporarily Unavailable'
            : 'Submission Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsLoading(false);

        addAgent.reset();
      });
  };

  if (!user) return null;

  return (
    <WalletProvider>
      <Modal
        className="max-w-2xl"
        isOpen={isOpen}
        onClose={handleClose}
        title="Add Agent"
      >
      <div className="flex flex-col gap-2 overflow-y-auto h-[75vh] relative px-4">
        <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg font-mono">
          <div className="flex items-start gap-2">
            <span className="text-teal-500 text-lg">ℹ️</span>
            <div className="text-sm">
              <p className="text-teal-500 font-medium mb-1">
                Quality Validation Notice
              </p>
              <p className="text-teal-500 text-xs leading-relaxed">
                All agent submissions undergo automated quality validation to
                maintain marketplace standards.
                {!isFree && (
                  <span className="text-yellow-300">
                    {' '}
                    Paid submissions require higher quality scores and
                    contributor trustworthiness verification.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span>Name</span>
          <div className="relative">
            <Input
              value={agentName}
              onChange={setAgentName}
              placeholder="Enter name"
              className="border border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            className="w-full h-20 p-2 border border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400 rounded-md bg-transparent outline-0 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span>Agent Code - (Add types and docstrings)</span>
          <div className="relative">
            <textarea
              value={agent}
              onChange={(v) => {
                setAgent(v.target.value);
                if (validateAgent.data) {
                  validateAgent.reset();
                }
              }}
              onBlur={async () => {
                validation.validateOnBlur('content');
                if (agent.trim().length >= 5) {
                  setIsValidating(true);
                  try {
                    await validateAgent.mutateAsync(agent);
                  } catch (error) {
                    validateAgent.reset();
                  } finally {
                    setIsValidating(false);
                  }
                }
              }}
              required
              placeholder="Paste your agent's code here..."
              className={`w-full h-40 p-3 border rounded-md bg-transparent outline-0 resize-none font-mono text-sm ${
                validation.fields.content?.error
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400'
              }`}
            />

            {validateAgent.isPending && (
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <LoadingSpinner />
                <span className="text-blue-500 text-xs">Validating...</span>
              </div>
            )}
          </div>

          {validation.fields.content?.error && (
            <span className="text-red-500 text-sm">
              {validation.fields.content.error}
            </span>
          )}

          {agent.length > 0 &&
            !validateAgent.isPending &&
            validateAgent.data &&
            !validateAgent.data.valid && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 text-sm rounded">
                <strong>Validation Error:</strong> {validateAgent.data.error}
              </div>
            )}
        </div>

        <div className="flex flex-col gap-1">
          <span>Language</span>
          <Select onValueChange={setLanguage} value={language}>
            <SelectTrigger className="w-1/2 cursor-pointer capitalize">
              <SelectValue placeholder={language} />
            </SelectTrigger>
            <SelectContent className="capitalize">
              {languageOptions?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 my-4">
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
          <span>Tags</span>
          <Input
            value={tags}
            onChange={setTags}
            placeholder="AI, automation, tools, etc."
            className="border border-gray-300 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400"
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
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-500/30 bg-background/60 text-muted-foreground hover:border-gray-500/50'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${isFree ? 'bg-blue-500' : 'bg-gray-500/30'}`}
                />
                Free
              </button>

              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`flex items-center gap-2 px-4 py-2 border-2 transition-all duration-300 font-mono text-sm ${
                  !isFree
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-gray-500/30 bg-background/60 text-muted-foreground hover:border-gray-500/50'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${!isFree ? 'bg-green-500' : 'bg-gray-500/30'}`}
                />
                Paid
              </button>
            </div>

            {!isFree && (
              <div className="space-y-4 p-4 border border-green-500/30 bg-green-500/5">
                {/* Trustworthiness Status */}
                {checkTrustworthiness.isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg">
                    <LoadingSpinner />
                    <span className="text-[#FF6B6B] text-sm">
                      Checking marketplace eligibility...
                    </span>
                  </div>
                )}

                {checkTrustworthiness.data &&
                  !checkTrustworthiness.data.isEligible && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-400 font-medium">
                          ❌ Not Eligible for Marketplace
                        </span>
                      </div>
                      <p className="text-red-300 text-sm">
                        {checkTrustworthiness.data.reason}
                      </p>
                      {!checkTrustworthiness.data.isBypassUser && (
                        <div className="mt-2 text-xs text-red-200">
                          <p>
                            Requirements: 2+ published items with 3.5+ average
                            rating
                          </p>
                          <p>
                            Your stats:{' '}
                            {checkTrustworthiness.data.publishedCount}{' '}
                            published,{' '}
                            {checkTrustworthiness.data.averageRating.toFixed(1)}{' '}
                            avg rating
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                {checkTrustworthiness.data &&
                  checkTrustworthiness.data.isEligible && (
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 font-medium">
                          ✅ Eligible for Marketplace
                        </span>
                      </div>
                      {!checkTrustworthiness.data.isBypassUser && (
                        <p className="text-green-300 text-sm mt-1">
                          {checkTrustworthiness.data.publishedCount} published
                          items,{' '}
                          {checkTrustworthiness.data.averageRating.toFixed(1)}{' '}
                          avg rating
                        </p>
                      )}
                    </div>
                  )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price (USD) <span className="text-yellow-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={priceUsd}
                    onChange={setPriceUsd}
                    onBlur={() => {
                      validation.validateOnBlur('price');
                      convertUsdToSol(priceUsd);
                    }}
                    placeholder="10.00"
                    min="0.01"
                    max="999999"
                    step="0.01"
                    className={`bg-background/40 border transition-colors duration-300 hover:bg-background/60 ${
                      validation.fields.price?.error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-green-500/30 focus:border-green-500'
                    } text-foreground placeholder-muted-foreground`}
                  />
                  {validation.fields.price?.error && (
                    <span className="text-red-500 text-sm mt-1">
                      {validation.fields.price.error}
                    </span>
                  )}
                  {priceUsd && !validation.fields.price?.error && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground font-mono">
                        Range: $0.01 - $999,999 USD
                      </p>
                      {isConvertingPrice ? (
                        <div className="flex items-center gap-1">
                          <LoadingSpinner />
                          <span className="text-xs text-muted-foreground">Converting...</span>
                        </div>
                      ) : solPrice !== null ? (
                        <span className="text-xs text-green-400 font-mono">
                          ≈ {solPrice.toFixed(6)} SOL (at current rate)
                        </span>
                      ) : null}
                    </div>
                  )}
                  {!priceUsd && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Range: $0.01 - $999,999 USD
                    </p>
                  )}
                </div>

                <SmartWalletInput
                  value={walletAddress}
                  onChange={setWalletAddress}
                  onBlur={() => validation.validateOnBlur('walletAddress')}
                  error={validation.fields.walletAddress?.error}
                  disabled={addAgent.isPending || isLoading}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={addAgent.isPending || isLoading}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear Form
          </Button>

          <Button
            disabled={
              addAgent.isPending ||
              isLoading ||
              isValidating ||
              validateAgent.isPending ||
              (!isFree && checkTrustworthiness.isLoading) ||
              (!isFree &&
                checkTrustworthiness.data &&
                !checkTrustworthiness.data.isEligible)
            }
            onClick={submit}
            className="w-32"
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
    </Modal>
    </WalletProvider>
  );
};

export default AddAgentModal;
