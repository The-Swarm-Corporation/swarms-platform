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
import MultiSelect from '@/shared/components/ui/multi-select';
import { useMemo, useRef, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useModelFileUpload } from '../hook/upload-file';
import ModelFileUpload from './upload-image';
import { useMarketplaceValidation } from '@/shared/hooks/use-deferred-validation';
import { validateLinksArray, getSuggestedUrlPattern, type LinkItem } from '@/shared/utils/link-validation';

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
            title: 'Redirecting to your tool...',
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

  if (!user) return null;

  return (
    <Modal
      className="max-w-2xl overflow-y-auto"
      isOpen={isOpen}
      onClose={onClose}
      title="Add Tool"
    >
      <div className="flex flex-col gap-2 overflow-y-auto h-[60vh] relative px-4">
        <div className="flex flex-col gap-1">
          <span>Name</span>
          <div className="relative">
            <Input
              value={toolName}
              onChange={setToolName}
              onBlur={() => validation.validateOnBlur('name')}
              placeholder="Enter name"
              className={`border ${
                validation.fields.name?.error
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400'
              }`}
            />
            {validation.fields.name?.error && (
              <span className="text-red-500 text-sm mt-1">
                {validation.fields.name.error}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => validation.validateOnBlur('description')}
            placeholder="Enter description"
            className={`w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none ${
              validation.fields.description?.error
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400'
            }`}
          />
          {validation.fields.description?.error && (
            <span className="text-red-500 text-sm mt-1">
              {validation.fields.description.error}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span>Tool Code - (Add types and docstrings)</span>
          <div className="relative">
            <textarea
              value={tool}
              onChange={(v) => {
                setTool(v.target.value);
                debouncedCheckPrompt(v.target.value);
              }}
              onBlur={() => validation.validateOnBlur('content')}
              required
              placeholder="Enter tool code here..."
              className={`w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none ${
                validation.fields.content?.error
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400'
              }`}
            />
            {validateTool.isPending ? (
              <div className="absolute right-2 top-2">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="absolute right-2.5 top-2.5">
                {tool.length > 0 && validateTool.data && (
                  <span
                    className={
                      validateTool.data.valid
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {validateTool.data.valid ? '✅' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          {tool.length > 0 &&
            !validateTool.isPending &&
            validateTool.data &&
            !validateTool.data.valid && (
              <span className="text-red-500 text-sm">
                {validateTool.data.error}
              </span>
            )}
          {validation.fields.content?.error && (
            <span className="text-red-500 text-sm mt-1">
              {validation.fields.content.error}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span>Language</span>
          <Select onValueChange={setLanguage} value={language}>
            <SelectTrigger className="w-1/2 cursor-pointer, capitalize">
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

        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center justify-between">
            <span>Requirements</span>
            <button
              type="button"
              onClick={addRequirement}
              className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Requirement
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex gap-4 items-center">
                <span className="w-10">📦 {index + 1}</span>
                <div className="w-full flex flex-col md:flex-row gap-1 py-2">
                  <Input
                    value={requirement.package}
                    onChange={(value) => updateRequirement(index, 'package', value)}
                    placeholder="Enter package name"
                    className="border border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400"
                  />
                  <Input
                    value={requirement.installation}
                    onChange={(value) => updateRequirement(index, 'installation', value)}
                    placeholder="pip install package"
                    className="border border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400"
                  />
                </div>
                <div className="w-4">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-500 text-sm hover:text-red-400"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center justify-between">
            <span>Add Links</span>
            <button
              type="button"
              onClick={addLink}
              className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Link
            </button>
          </div>
          {linkErrors && (
            <div className="text-red-500 text-sm mb-2">
              {linkErrors}
            </div>
          )}
          <div className="flex flex-col gap-2">
            {links.map((link, index) => (
              <div key={index} className="flex gap-4 items-center">
                <span className="w-10">🔗 {index + 1}</span>
                <div className="w-full flex flex-col md:flex-row gap-1 py-2">
                  <Input
                    value={link.name}
                    onChange={(value) => updateLink(index, 'name', value)}
                    placeholder="Link name (e.g., GitHub, Twitter)"
                    className="border border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400"
                  />
                  <Input
                    value={link.url}
                    onChange={(value) => updateLink(index, 'url', value)}
                    placeholder={link.name ? getSuggestedUrlPattern(link.name) : "https://example.com"}
                    className="border border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400"
                  />
                </div>
                <div className="w-4">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="text-red-500 text-sm hover:text-red-400"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </div>
            ))}
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
        />
        <div className="flex flex-col gap-1">
          <span>Tags</span>
          <Input
            value={tags}
            onChange={setTags}
            onBlur={() => validation.validateOnBlur('tags')}
            placeholder="Tools, Search, etc."
            className={`border ${
              validation.fields.tags?.error
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400'
            }`}
          />
          {validation.fields.tags?.error && (
            <span className="text-red-500 text-sm mt-1">
              {validation.fields.tags.error}
            </span>
          )}
        </div>
        <div className="flex justify-between mt-4">
          {isRedirecting ? (
            <Button
              variant="outline"
              onClick={() => {
                setIsRedirecting(false);
                resetForm();
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Close Modal
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={addTool.isPending || isLoading}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear Form
            </Button>
          )}

          <Button
            disabled={addTool.isPending || isLoading || isRedirecting}
            onClick={submit}
            className="w-32"
          >
            {isRedirecting
              ? 'Redirecting...'
              : addTool.isPending || isLoading
                ? 'Submitting...'
                : 'Submit Tool'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddToolModal;
