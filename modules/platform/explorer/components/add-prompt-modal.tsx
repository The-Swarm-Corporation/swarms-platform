import LoadingSpinner from '@/shared/components/loading-spinner';
import Modal from '@/shared/components/modal';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { Button } from '@/shared/components/ui/button';
import Input from '@/shared/components/ui/Input/Input';
import MultiSelect from '@/shared/components/ui/multi-select';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { explorerCategories } from '@/shared/utils/constants';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useModelFileUpload } from '../hook/upload-file';
import { useMarketplaceValidation } from '@/shared/hooks/use-deferred-validation';
import ModelFileUpload from './upload-image';
import { SmartWalletInput } from '@/shared/components/marketplace/smart-wallet-input';
import { WalletProvider } from '@/shared/components/marketplace/wallet-provider';
import { getSolPrice } from '@/shared/services/sol-price';
import { Plus, Sparkles, Code, Terminal, Book, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { validateLinksArray, getSuggestedUrlPattern, type LinkItem } from '@/shared/utils/link-validation';
import { motion } from 'framer-motion';

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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [priceUsd, setPriceUsd] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [isConvertingPrice, setIsConvertingPrice] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([
    { name: '', url: '' },
  ]);
  const [linkErrors, setLinkErrors] = useState<string>('');
  const router = useRouter();



  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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

  const handleCategoriesChange = (selectedCategories: string[]) => {
    setCategories(selectedCategories);
  };

  const addLink = () => {
    setLinks([...links, { name: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);

    if (linkErrors) {
      setLinkErrors('');
    }

    if (field === 'url' && value.trim()) {
      const linkValidation = validateLinksArray([{ name: newLinks[index].name, url: value }]);
      if (!linkValidation.isValid) {
        setLinkErrors(`Link ${index + 1}: ${linkValidation.error}`);
      }
    }
  };

  const toast = useToast();


  const addPrompt = trpc.explorer.addPrompt.useMutation();
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
    validation.updateField('name', promptName);
    validation.updateField('description', description);
    validation.updateField('content', prompt);
    validation.updateField('price', priceUsd);
    validation.updateField('walletAddress', walletAddress);
    validation.updateField('tags', tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptName, description, prompt, priceUsd, walletAddress, tags]);

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
    setPromptName('');
    setPrompt('');
    setDescription('');
    setTags('');
    setCategories([]);
    setIsLoading(false);
    setIsRedirecting(false);
    setIsFree(true);
    setPriceUsd('');
    setWalletAddress('');
    setLinks([{ name: '', url: '' }]);
    setLinkErrors('');
    setIsValidating(false);
    setSolPrice(null);
    setIsConvertingPrice(false);

    validation.reset();
    validatePrompt.reset();
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
    if (validatePrompt.isPending) {
      return;
    }

    if (isValidating || validatePrompt.isPending) {
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

    const filteredLinks = links.filter(link => link.name.trim() && link.url.trim());
    const linkValidation = validateLinksArray(filteredLinks);
    if (!linkValidation.isValid) {
      setLinkErrors(linkValidation.error || 'Invalid links');
      toast.toast({
        title: 'Invalid links',
        description: linkValidation.error,
        variant: 'destructive',
      });
      return;
    }
    setLinkErrors('');

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
        links: filteredLinks,
        isFree,
        price_usd: isFree ? 0 : parseFloat(priceUsd),
        sellerWalletAddress: isFree ? '' : walletAddress,
      })
      .then(async (result) => {
        setIsLoading(false);

        toast.toast({
          title: 'Prompt added successfully 🎉',
        });

        if (result?.id) {
          setIsRedirecting(true);

          toast.toast({
            title: 'Successfully added your prompt ✨ Redirecting to your prompt...',
            description: 'This may take a moment. You can close this modal if it takes too long.',
            duration: 5000,
          });

          router.push(`/prompt/${result.id}`);

          setTimeout(() => {
            setIsRedirecting(false);
            toast.toast({
              title: 'Taking longer than expected?',
              description: 'You can close this modal and navigate manually.',
              duration: 3000,
            });
          }, 8000);
        } else {
          onAddSuccessfully();
          resetForm();
          onClose();
        }
      })
      .catch((error) => {
        console.log({ error });

        let errorMessage = 'Unable to submit your prompt. Please try again.';
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
            errorMessage = 'Please enter a valid price for paid prompts (minimum $0.01).';
          } else if (error.message.includes('Wallet address')) {
            errorMessage = 'Please enter a valid wallet address for paid prompts.';
          } else if (error.message.includes('already exists')) {
            errorMessage = 'This prompt already exists. Please create something unique.';
          } else {
            errorMessage = 'Unable to submit your prompt. Please check your content and try again.';
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
        setIsRedirecting(false);

        addPrompt.reset();
      });
  };

  if (!user) return null;

  return (
    <WalletProvider>
      <Modal
        className="max-w-4xl"
        isOpen={isOpen}
        onClose={handleClose}
        title="Add Prompt"
      >
        <div className="flex flex-col gap-6 overflow-y-auto h-[70vh] relative px-6 py-4">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <h2 className="text-2xl font-bold tracking-tight mb-2">Post Your Prompt</h2>
            <p className="text-zinc-400 text-sm">Post your prompt to the marketplace</p>
          </motion.div>

          {/* Quality Validation Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-xl p-3 font-mono"
          >
            <div className="flex items-start gap-2">
              <span className="text-[#FF6B6B] text-base">ℹ️</span>
              <div className="text-xs">
                <p className="text-[#FF6B6B] font-medium mb-1">
                  Quality Validation Notice
                </p>
                <p className="text-[#FF6B6B]/80 text-xs leading-relaxed">
                  All prompt submissions undergo automated quality validation to maintain marketplace standards.
                  {!isFree && (
                    <span className="text-yellow-300">
                      {' '}Paid submissions require higher quality scores and contributor eligibility checks.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Image Upload - Moved to top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <Book className="w-4 h-4 text-green-400" />
              <h3 className="text-base font-semibold">Prompt Image</h3>
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
          </motion.div>

          {/* Form Grid */}
          <div className="space-y-4">
            {/* Basic Information - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-semibold">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                  <Input
                    value={promptName}
                    onChange={setPromptName}
                    onBlur={() => validation.validateOnBlur('name')}
                    placeholder="Enter prompt name"
                    className={`bg-zinc-900/50 border transition-colors duration-300 ${
                      validation.fields.name?.error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-700/50 focus:border-emerald-400'
                    }`}
                  />
                  {validation.fields.name?.error && (
                    <span className="text-red-400 text-xs mt-1 block">
                      {validation.fields.name.error}
                    </span>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => validation.validateOnBlur('description')}
                    placeholder="Describe what your prompt does..."
                    className={`w-full h-20 p-2 border rounded-lg bg-zinc-900/50 outline-0 resize-none transition-colors duration-300 ${
                      validation.fields.description?.error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-700/50 focus:border-emerald-400'
                    }`}
                  />
                  {validation.fields.description?.error && (
                    <span className="text-red-400 text-xs mt-1 block">
                      {validation.fields.description.error}
                    </span>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Categories</label>
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

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Tags</label>
                  <Input
                    value={tags}
                    onChange={setTags}
                    onBlur={() => validation.validateOnBlur('tags')}
                    placeholder="Tools, Search, etc. (comma-separated)"
                    className={`bg-zinc-900/50 border transition-colors duration-300 ${
                      validation.fields.tags?.error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-700/50 focus:border-yellow-400'
                    }`}
                  />
                  {validation.fields.tags?.error && (
                    <span className="text-red-400 text-xs mt-2 block">
                      {validation.fields.tags.error}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Prompt Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-semibold">Prompt Content</h3>
              </div>
              
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(v) => {
                    setPrompt(v.target.value);
                    if (validatePrompt.data) {
                      validatePrompt.reset();
                    }
                  }}
                  onBlur={async () => {
                    validation.validateOnBlur('content');
                    if (prompt.trim().length >= 5) {
                      setIsValidating(true);
                      try {
                        await validatePrompt.mutateAsync({ prompt });
                      } catch (error) {
                        validatePrompt.reset();
                      } finally {
                        setIsValidating(false);
                      }
                    }
                  }}
                  required
                  placeholder="Enter your prompt here... (Add clear instructions and examples)"
                  className={`w-full h-32 p-3 border rounded-lg bg-zinc-900/50 outline-0 resize-none transition-colors duration-300 ${
                    validation.fields.content?.error
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-zinc-700/50 focus:border-purple-400'
                  }`}
                />
                {validatePrompt.isPending ? (
                  <div className="absolute right-2 top-2 bg-zinc-800/80 px-2 py-1 rounded text-xs">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="absolute right-2 top-2">
                    {prompt.length > 0 && validatePrompt.data && (
                      <span
                        className={
                          validatePrompt.data.valid
                            ? 'text-green-400 text-base'
                            : 'text-red-400 text-base'
                        }
                      >
                        {validatePrompt.data.valid ? '✅' : '❌'}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {validation.fields.content?.error && (
                <span className="text-red-400 text-xs mt-2 block">
                  {validation.fields.content.error}
                </span>
              )}
              
              {prompt.length > 0 &&
                !validatePrompt.isPending &&
                validatePrompt.data &&
                !validatePrompt.data.valid && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
                    <strong>Validation Error:</strong> {validatePrompt.data.error}
                  </div>
                )}
            </motion.div>

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Book className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-base font-semibold">Links</h3>
                </div>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Link
                </button>
              </div>
              
              {linkErrors && (
                <div className="text-red-400 text-xs mb-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                  {linkErrors}
                </div>
              )}
              
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-zinc-900/50 rounded-lg border border-zinc-700/30">
                    <span className="text-indigo-400 text-xs font-mono">🔗 {index + 1}</span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={link.name}
                        onChange={(value) => updateLink(index, 'name', value)}
                        placeholder="Link name (e.g., GitHub, Twitter)"
                        className="bg-zinc-800/50 border-zinc-600/50 focus:border-indigo-400 text-xs"
                      />
                      <Input
                        value={link.url}
                        onChange={(value) => updateLink(index, 'url', value)}
                        placeholder={link.name ? getSuggestedUrlPattern(link.name) : "https://example.com"}
                        className="bg-zinc-800/50 border-zinc-600/50 focus:border-indigo-400 text-xs"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Pricing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-4 h-4 text-green-400" />
              <h3 className="text-base font-semibold">Pricing</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFree(true)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 transition-all duration-300 font-mono text-xs rounded-lg ${
                    isFree
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-zinc-700/50 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600/50'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isFree ? 'bg-blue-500' : 'bg-zinc-600'}`}
                  />
                  Free
                </button>

                <button
                  type="button"
                  onClick={() => setIsFree(false)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 transition-all duration-300 font-mono text-xs rounded-lg ${
                    !isFree
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-zinc-700/50 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600/50'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${!isFree ? 'bg-green-500' : 'bg-zinc-600'}`}
                  />
                  Paid
                </button>
              </div>

              {!isFree && (
                <div className="space-y-3 p-3 border border-green-500/30 bg-green-500/5 rounded-lg">
                  {checkTrustworthiness.isLoading && (
                    <div className="flex items-center gap-2 p-2 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg">
                      <LoadingSpinner />
                      <span className="text-[#FF6B6B] text-xs">
                        Checking marketplace eligibility...
                      </span>
                    </div>
                  )}

                  {checkTrustworthiness.data &&
                    !checkTrustworthiness.data.isEligible && (
                      <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-red-400 font-medium text-xs">
                            ❌ Not Eligible for Marketplace
                          </span>
                        </div>
                        <p className="text-red-300 text-xs">
                          {checkTrustworthiness.data.reason}
                        </p>
                        {!checkTrustworthiness.data.isBypassUser && (
                          <div className="mt-1 text-xs text-red-200">
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
                      <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-medium text-xs">
                            ✅ Eligible for Marketplace
                          </span>
                        </div>
                        {!checkTrustworthiness.data.isBypassUser && (
                          <p className="text-green-300 text-xs mt-1">
                            {checkTrustworthiness.data.publishedCount} published
                            items,{' '}
                            {checkTrustworthiness.data.averageRating.toFixed(1)}{' '}
                            avg rating
                          </p>
                        )}
                      </div>
                    )}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
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
                      className={`bg-zinc-900/50 border transition-colors duration-300 hover:bg-zinc-800/50 ${
                        validation.fields.price?.error
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-green-500/30 focus:border-green-500'
                      }`}
                    />
                    {validation.fields.price?.error && (
                      <span className="text-red-400 text-xs mt-1 block">
                        {validation.fields.price.error}
                      </span>
                    )}
                    {priceUsd && !validation.fields.price?.error && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-zinc-400 font-mono">
                          Range: $0.01 - $999,999 USD
                        </p>
                        {isConvertingPrice ? (
                          <div className="flex items-center gap-1">
                            <LoadingSpinner />
                            <span className="text-xs text-zinc-400">Converting...</span>
                          </div>
                        ) : solPrice !== null ? (
                          <span className="text-xs text-green-400 font-mono">
                            ≈ {solPrice.toFixed(6)} SOL (at current rate)
                          </span>
                        ) : null}
                      </div>
                    )}
                    {!priceUsd && (
                      <p className="text-xs text-zinc-400 mt-1 font-mono">
                        Range: $0.01 - $999,999 USD
                      </p>
                    )}
                  </div>

                  <SmartWalletInput
                    value={walletAddress}
                    onChange={setWalletAddress}
                    onBlur={() => validation.validateOnBlur('walletAddress')}
                    error={validation.fields.walletAddress?.error}
                    disabled={addPrompt.isPending || isLoading}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex justify-between pt-3 border-t border-zinc-700/50"
          >
            {isRedirecting ? (
              <Button
                variant="outline"
                onClick={() => {
                  setIsRedirecting(false);
                  resetForm();
                  onClose();
                }}
                className="text-zinc-400 hover:text-zinc-300 border-zinc-700/50 hover:border-zinc-600/50"
              >
                Close Modal
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={addPrompt.isPending || isLoading}
                className="text-zinc-400 hover:text-zinc-300 border-zinc-700/50 hover:border-zinc-600/50"
              >
                Clear Form
              </Button>
            )}

            <Button
              disabled={
                addPrompt.isPending ||
                isLoading ||
                isRedirecting ||
                isValidating ||
                validatePrompt.isPending ||
                (!isFree && checkTrustworthiness.isLoading) ||
                (!isFree &&
                  checkTrustworthiness.data &&
                  !checkTrustworthiness.data.isEligible)
              }
              onClick={submit}
              className="w-32 bg-zinc-900/50 hover:bg-zinc-700/30 border border-zinc-700/50 text-zinc-300 hover:text-white transition-all duration-300"
            >
              {isRedirecting
                ? 'Redirecting...'
                : addPrompt.isPending || isLoading
                  ? 'Submitting...'
                  : isValidating || validatePrompt.isPending
                    ? 'Validating...'
                    : !isFree && checkTrustworthiness.isLoading
                      ? 'Checking...'
                      : 'Submit Prompt'}
            </Button>
          </motion.div>
        </div>
      </Modal>
    </WalletProvider>
  );
};

export default AddPromptModal;
