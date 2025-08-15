import LoadingSpinner from '@/shared/components/loading-spinner';
import Modal from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import Input from '@/shared/components/ui/Input/Input';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { debounce } from '@/shared/utils/helpers';
import { fetchRepositoryInfo } from '@/shared/utils/github-integration';
import { GitBranch, Plus, Sparkles, Code, Terminal, Book, Wrench } from 'lucide-react';
import { trpc } from '@/shared/utils/trpc/trpc';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { explorerCategories, languageOptions } from '@/shared/utils/constants';
import MultiSelect from '@/shared/components/ui/multi-select';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useModelFileUpload } from '../hook/upload-file';
import ModelFileUpload from './upload-image';
import { useMarketplaceValidation } from '@/shared/hooks/use-deferred-validation';
import { validateLinksArray, getSuggestedUrlPattern, type LinkItem } from '@/shared/utils/link-validation';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccessfully: () => void;
  modelType: string;
}

const AddToolModal = ({
  isOpen,
  onClose,
  onAddSuccessfully,
  modelType,
}: Props) => {
  const { user } = useAuthContext();
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [tool, setTool] = useState('');
  const [tags, setTags] = useState('');
  const [language, setLanguage] = useState('python');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [requirements, setRequirements] = useState([
    { package: '', installation: '' },
  ]);
  const [links, setLinks] = useState<LinkItem[]>([
    { name: '', url: '' },
  ]);
  const [linkErrors, setLinkErrors] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  const validation = useMarketplaceValidation();

  const resetForm = () => {
    setToolName('');
    setTool('');
    setDescription('');
    setTags('');
    setCategories([]);
    setIsLoading(false);
    setIsRedirecting(false);
    setLinks([{ name: '', url: '' }]);
    setLanguage('python');
    setRequirements([{ package: '', installation: '' }]);
    setLinkErrors('');
    setGithubUrl('');
    setIsImporting(false);
    validation.reset();
  };

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

  const validateTool = trpc.explorer.validateTool.useMutation();

  const debouncedCheckPrompt = useMemo(() => {
    const debouncedFn = debounce((value: string) => {
      validateTool.mutateAsync({ tool: value });
    }, 400);
    return debouncedFn;
  }, [validateTool.mutateAsync]);

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

  const toast = useToast();

  const addTool = trpc.explorer.addTool.useMutation();

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
    // Validate Tool
    if (validateTool.isPending) {
      toast.toast({
        title: 'Validating Tool',
      });
      return;
    }

    // Form validation
    if (!toolName || toolName.trim().length === 0) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Tool name is required',
        variant: 'destructive',
      });
      return;
    }

    if (toolName.trim().length < 2) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Tool name must be at least 2 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (toolName.length > 100) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Tool name cannot exceed 100 characters',
        variant: 'destructive',
      });
      return;
    }

    if (!description || description.trim().length === 0) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Description is required',
        variant: 'destructive',
      });
      return;
    }

    if (description.trim().length < 10) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Description must be at least 10 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (description.length > 1000) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Description cannot exceed 1,000 characters',
        variant: 'destructive',
      });
      return;
    }

    if (!tool || tool.trim().length === 0) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Tool code is required',
        variant: 'destructive',
      });
      return;
    }

    if (tool.trim().length < 5) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Tool code must be at least 5 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (tool.length > 50000) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Tool code cannot exceed 50,000 characters',
        variant: 'destructive',
      });
      return;
    }

    if (validateTool.data && !validateTool.data.valid) {
      toast.toast({
        title: 'Invalid Tool',
        description: validateTool.data.error,
        variant: 'destructive',
      });
      return;
    }

    if (categories.length === 0) {
      toast.toast({
        title: 'Form Validation Error',
        description: 'Please select at least one category',
        variant: 'destructive',
      });
      return;
    }

    // Validate tags if provided
    if (tags && tags.trim().length > 0) {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (tagList.length > 10) {
        toast.toast({
          title: 'Form Validation Error',
          description: 'Maximum 10 tags allowed',
          variant: 'destructive',
        });
        return;
      }

      if (tagList.some((tag) => tag.length > 50)) {
        toast.toast({
          title: 'Form Validation Error',
          description: 'Each tag must be 50 characters or less',
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

    // Add Tool
    addTool
      .mutateAsync({
        name: toolName,
        tool,
        description,
        useCases: [{ title: '', description: '' }],
        language,
        category: categories,
        imageUrl: imageUrl || undefined,
        filePath: imageUrl && filePath ? filePath : undefined,
        requirements: requirements.filter(req => req.package.trim() && req.installation.trim()),
        tags: trimTags,
        links: filteredLinks,
      })
      .then(async (result) => {
        setIsLoading(false);

        toast.toast({
          title: 'Tool added successfully 🎉',
        });

        if (result?.id) {
          setIsRedirecting(true);

          toast.toast({
            title: 'Successfully added your tool ✨ Redirecting to your tool...',
            description: 'This may take a moment. You can close this modal if it takes too long.',
            duration: 5000,
          });

          router.push(`/tool/${result.id}`);

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
        toast.toast({
          title: 'An error has occurred',
        });
        setIsLoading(false);
        setIsRedirecting(false);
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

      setToolName(repoInfo.name);
      setDescription(`${repoInfo.description}\n\nSource: ${githubUrl}`);
      setTool(repoInfo.mainCode);
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
    <Modal
      className="max-w-4xl overflow-y-auto"
      isOpen={isOpen}
      onClose={onClose}
      title="Add Tool"
    >
      <div className="flex flex-col gap-6 overflow-y-auto h-[70vh] relative px-6 py-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-2">Post Your Tool</h2>
          <p className="text-zinc-400 text-sm">Post your tool to the marketplace</p>
        </motion.div>

        {/* GitHub Import Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <GitBranch className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold">Import from GitHub</h3>
          </div>
          <p className="text-zinc-400 mb-3 text-xs leading-relaxed">
            Import a tool from a public GitHub repository. The repository should contain Python code (preferably main.py or example.py). 
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
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
                <Input
                  value={toolName}
                  onChange={setToolName}
                  onBlur={() => validation.validateOnBlur('name')}
                  placeholder="Enter tool name"
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
                  placeholder="Describe what your tool does..."
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

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
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

          {/* Tool Code - Below Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-zinc-800/30 backdrop-blur-xl rounded-xl p-4 border border-zinc-700/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <Wrench className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-semibold">Tool Code</h3>
            </div>
            
            <div className="relative">
              <textarea
                value={tool}
                onChange={(v) => {
                  setTool(v.target.value);
                  debouncedCheckPrompt(v.target.value);
                }}
                onBlur={() => validation.validateOnBlur('content')}
                required
                placeholder="Enter tool code here... (Add types and docstrings)"
                className={`w-full h-32 p-3 border rounded-lg bg-zinc-900/50 outline-0 resize-none font-mono text-xs transition-colors duration-300 ${
                  validation.fields.content?.error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-700/50 focus:border-purple-400'
                }`}
              />
              {validateTool.isPending ? (
                <div className="absolute right-2 top-2 bg-zinc-800/80 px-2 py-1 rounded text-xs">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="absolute right-2 top-2">
                  {tool.length > 0 && validateTool.data && (
                    <span
                      className={
                        validateTool.data.valid
                          ? 'text-green-400 text-base'
                          : 'text-red-400 text-base'
                      }
                    >
                      {validateTool.data.valid ? '✅' : '❌'}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {tool.length > 0 &&
              !validateTool.isPending &&
              validateTool.data &&
              !validateTool.data.valid && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
                  <strong>Validation Error:</strong> {validateTool.data.error}
                </div>
              )}
            
            {validation.fields.content?.error && (
              <span className="text-red-400 text-xs mt-2 block">
                {validation.fields.content.error}
              </span>
            )}
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
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
              disabled={addTool.isPending || isLoading}
              className="text-zinc-400 hover:text-zinc-300 border-zinc-700/50 hover:border-zinc-600/50"
            >
              Clear Form
            </Button>
          )}

          <Button
            disabled={addTool.isPending || isLoading || isRedirecting}
            onClick={submit}
            className="w-32 bg-zinc-900/50 hover:bg-zinc-700/30 border border-zinc-700/50 text-zinc-300 hover:text-white transition-all duration-300"
          >
            {isRedirecting
              ? 'Redirecting...'
              : addTool.isPending || isLoading
                ? 'Submitting...'
                : 'Submit Tool'}
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
};

export default AddToolModal;
