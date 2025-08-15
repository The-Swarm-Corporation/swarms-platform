import LoadingSpinner from '@/shared/components/loading-spinner';
import Modal from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import Input from '@/shared/components/ui/Input/Input';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { fetchRepositoryInfo } from '@/shared/utils/github-integration';
import { GitBranch, Plus, Sparkles, Code, Terminal, Book } from 'lucide-react';

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
import { useRouter } from 'next/navigation';
import { validateLinksArray, getSuggestedUrlPattern, type LinkItem } from '@/shared/utils/link-validation';
import { motion } from 'framer-motion';


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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [priceUsd, setPriceUsd] = useState(''); // USD price input
  const [walletAddress, setWalletAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null); // SOL equivalent preview
  const [isConvertingPrice, setIsConvertingPrice] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [requirements, setRequirements] = useState([
    { package: 'requests', installation: 'pip3 install requests' },
  ]);
  const [links, setLinks] = useState<LinkItem[]>([
    { name: '', url: '' },
  ]);
  const [linkErrors, setLinkErrors] = useState<string>('');
  const router = useRouter();

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

  // Reset all states when modal opens/closes
  const resetForm = useCallback(() => {
    setAgentName('');
    setAgent('');
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
    setGithubUrl('');
    setIsImporting(false);
    setLanguage('python');
    setRequirements([
      { package: 'requests', installation: 'pip3 install requests' },
    ]);

    // Reset validation and mutation state - these are stable references
    try {
      validation.reset();
      validateAgent.reset();
    } catch (error) {
      console.warn('Error resetting validation:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to prevent infinite loops - validation and validateAgent are stable

  // Reset form when modal closes (but not during redirect)
  useEffect(() => {
    if (!isOpen && !isRedirecting) {
      resetForm();
    }
  }, [isOpen, isRedirecting, resetForm]);

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


  const handleCategoriesChange = (selectedCategories: string[]) => {
    setCategories(selectedCategories);
  };

  const addRequirement = () => {
    setRequirements([...requirements, { package: '', installation: '' }]);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const updateRequirement = (index: number, field: 'package' | 'installation', value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index][field] = value;
    setRequirements(newRequirements);
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





  const handleClose = () => {
    onClose();
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
        requirements: requirements.filter(req => req.package.trim() && req.installation.trim()),
        tags: trimTags,
        links: filteredLinks,
        isFree,
        price_usd: isFree ? 0 : parseFloat(priceUsd),
        sellerWalletAddress: isFree ? '' : walletAddress,
      })
      .then(async (result) => {
        setIsLoading(false);

        toast.toast({
          title: 'Agent added successfully 🎉',
        });

        if (result?.id) {
          setIsRedirecting(true);

          toast.toast({
            title: 'Successfully added your agent ✨ Redirecting to your agent...',
            description: 'This may take a moment. You can close this modal if it takes too long.',
            duration: 5000,
          });

          router.push(`/agent/${result.id}`);

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
        setIsRedirecting(false);

        addAgent.reset();
      });
  };

  const handleGitHubImport = async () => {
    if (!githubUrl) {
      toast.toast({
        title: 'Please enter a GitHub repository URL',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      const repoInfo = await fetchRepositoryInfo(githubUrl);
      
      if (!repoInfo) {
        throw new Error('Failed to fetch repository information');
      }

      setAgentName(repoInfo.name);
      setDescription(`${repoInfo.description}\n\nSource: ${githubUrl}`);
      setAgent(repoInfo.mainCode);
      setLanguage(repoInfo.language);
      setCategories(repoInfo.categories);
      setTags(repoInfo.tags.join(', '));

      if (repoInfo.imageUrl) {
        const response = await fetch(repoInfo.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'repo-avatar.png', { type: 'image/png' });
        await uploadImage(file, modelType);
      }

      toast.toast({
        title: 'Repository imported successfully',
        description: 'Please review and adjust the imported information.',
      });
    } catch (error) {
      console.error('Error importing from GitHub:', error);
      toast.toast({
        title: 'Failed to import repository',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!user) return null;

  return (
    <WalletProvider>
      <Modal
        className="max-w-4xl"
        isOpen={isOpen}
        onClose={handleClose}
        title="Add Agent"
      >
        <div className="flex flex-col gap-6 overflow-y-auto h-[70vh] relative px-6 py-4">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <h2 className="text-2xl font-bold tracking-tight mb-2">Post Your Agent</h2>
            <p className="text-zinc-400 text-sm">Post your agent to the marketplace</p>
          </motion.div>

          {/* GitHub Import Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-2xl p-4 border border-zinc-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <GitBranch className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold">Import from GitHub</h3>
            </div>
            <p className="text-zinc-400 mb-3 text-xs leading-relaxed">
              Import an agent from a public GitHub repository. The repository should contain Python code (preferably main.py or example.py). 
              Private repositories are not supported yet.
            </p>
            <div className="flex gap-3">
              <Input
                value={githubUrl}
                onChange={setGithubUrl}
                placeholder="Enter public GitHub repository URL"
                className="flex-1 bg-zinc-900/50 border-zinc-700/50 focus:border-blue-400"
              />
              <Button
                onClick={handleGitHubImport}
                disabled={isImporting || !githubUrl}
                className="w-20 bg-blue-500 hover:bg-blue-600 text-white text-sm"
              >
                {isImporting ? <LoadingSpinner /> : 'Import'}
              </Button>
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
              <h3 className="text-base font-semibold">Agent Image</h3>
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

          {/* Quality Validation Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 font-mono"
          >
            <div className="flex items-start gap-2">
              <span className="text-teal-400 text-base">ℹ️</span>
              <div className="text-xs">
                <p className="text-teal-400 font-medium mb-1">
                  Quality Validation Notice
                </p>
                <p className="text-teal-400/80 text-xs leading-relaxed">
                  All agent submissions undergo automated quality validation to maintain marketplace standards.
                  {!isFree && (
                    <span className="text-yellow-300">
                      {' '}Paid submissions require higher quality scores and contributor trustworthiness verification.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form Grid */}
          <div className="space-y-4">
            {/* Basic Information - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-semibold">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                  <Input
                    value={agentName}
                    onChange={setAgentName}
                    onBlur={() => validation.validateOnBlur('name')}
                    placeholder="Enter agent name"
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

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Language</label>
                  <Select onValueChange={setLanguage} value={language}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-700/50 focus:border-emerald-400">
                      <SelectValue placeholder={language} />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {languageOptions?.map((option) => (
                        <SelectItem key={option} value={option} className="capitalize">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => validation.validateOnBlur('description')}
                    placeholder="Describe what your agent does..."
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
                    placeholder="AI, automation, tools, etc. (comma-separated)"
                    className={`bg-zinc-900/50 border transition-colors duration-300 ${
                      validation.fields.tags?.error
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-zinc-700/50 focus:border-yellow-400'
                    }`}
                  />
                  {validation.fields.tags?.error && (
                    <span className="text-red-400 text-xs mt-1 block">
                      {validation.fields.tags.error}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Code className="w-4 h-4 text-blue-400" />
                  <h3 className="text-base font-semibold">Requirements</h3>
                </div>
                <button
                  type="button"
                  onClick={addRequirement}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
              
              <div className="space-y-2">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-zinc-900/50 rounded-lg border border-zinc-700/30">
                    <span className="text-blue-400 text-xs font-mono">📦 {index + 1}</span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        value={requirement.package}
                        onChange={(value) => updateRequirement(index, 'package', value)}
                        placeholder="Package name"
                        className="bg-zinc-800/50 border-zinc-600/50 focus:border-blue-400 text-xs"
                      />
                      <Input
                        value={requirement.installation}
                        onChange={(value) => updateRequirement(index, 'installation', value)}
                        placeholder="pip install package"
                        className="bg-zinc-800/50 border-zinc-600/50 focus:border-blue-400 text-xs"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Agent Code - Below Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <Code className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-semibold">Agent Code</h3>
              </div>
              
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
                        await validateAgent.mutateAsync({ agent });
                      } catch (error) {
                        validateAgent.reset();
                      } finally {
                        setIsValidating(false);
                      }
                    }
                  }}
                  required
                  placeholder="Paste your agent's code here... (Add types and docstrings)"
                  className={`w-full h-32 p-3 border rounded-lg bg-zinc-900/50 outline-0 resize-none font-mono text-xs transition-colors duration-300 ${
                    validation.fields.content?.error
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-zinc-700/50 focus:border-purple-400'
                  }`}
                />

                {validateAgent.isPending && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-zinc-800/80 px-2 py-1 rounded text-xs">
                    <LoadingSpinner />
                    <span className="text-blue-400">Validating...</span>
                  </div>
                )}
              </div>

              {validation.fields.content?.error && (
                <span className="text-red-400 text-xs mt-2 block">
                  {validation.fields.content.error}
                </span>
              )}

              {agent.length > 0 &&
                !validateAgent.isPending &&
                validateAgent.data &&
                !validateAgent.data.valid && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
                    <strong>Validation Error:</strong> {validateAgent.data.error}
                  </div>
                )}
            </motion.div>

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
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
            transition={{ duration: 0.6, delay: 0.9 }}
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
                  {/* Trustworthiness Status */}
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
                    disabled={addAgent.isPending || isLoading}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
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
                disabled={addAgent.isPending || isLoading}
                className="text-zinc-400 hover:text-zinc-300 border-zinc-700/50 hover:border-zinc-600/50"
              >
                Clear Form
              </Button>
            )}

            <Button
              disabled={
                addAgent.isPending ||
                isLoading ||
                isRedirecting ||
                isValidating ||
                validateAgent.isPending ||
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
                : addAgent.isPending || isLoading
                  ? 'Submitting...'
                  : isValidating || validateAgent.isPending
                    ? 'Validating...'
                    : !isFree && checkTrustworthiness.isLoading
                      ? 'Checking...'
                      : 'Submit Agent'}
            </Button>
          </motion.div>
        </div>
      </Modal>
    </WalletProvider>
  );
};

export default AddAgentModal;
