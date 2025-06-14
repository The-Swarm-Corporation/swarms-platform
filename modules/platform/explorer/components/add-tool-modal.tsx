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
import { useMemo, useRef, useState } from 'react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useModelFileUpload } from '../hook/upload-file';
import ModelFileUpload from './upload-image';

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
      validateTool.mutateAsync(value);
    }, 400);
    return debouncedFn;
  }, []);

  const handleCategoriesChange = (selectedCategories: string[]) => {
    setCategories(selectedCategories);
  };

  const toast = useToast();
  const utils = trpc.useUtils(); // For immediate cache invalidation

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

    if (toolName.trim().length < 2) {
      toast.toast({
        title: 'Name should be at least 2 characters long',
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
        requirements: [{ package: '', installation: '' }],
        tags: trimTags,
      })
      .then(async () => {
        toast.toast({
          title: 'Tool added successfully 🎉',
        });

        await Promise.all([
          utils.explorer.getExplorerData.invalidate(),
          utils.main.trending.invalidate(),
        ]);

        onClose();
        onAddSuccessfully();
        // Reset form
        setToolName('');
        setTool('');
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
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="relative z-10 flex flex-col h-[85vh] sm:h-[80vh] md:h-[75vh]">
        <div className="relative bg-background/95 border-b-2 border-red-500/50 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-red-500" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-red-500" />

          <div className="flex items-center justify-end mb-4">
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
                TOOL DEPLOYMENT
                <div className="h-1 w-24 sm:w-28 md:w-36 bg-gradient-to-r from-red-500 to-transparent mt-1" />
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm font-mono leading-relaxed max-w-2xl">
                Share a tool you&apos;d like others to explore, filling out the
                details below. Make it clear, useful, and well-tagged so others
                can easily find and use it.
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
                value={toolName}
                onChange={setToolName}
                placeholder="Enter tool identifier..."
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
                placeholder="Define tool capabilities and operational parameters..."
                className="w-full rounded-lg h-16 sm:h-20 p-3 sm:p-4 bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground resize-none font-mono text-xs sm:text-sm transition-all duration-300 hover:bg-background/80 outline-none"
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

          <div className="group overflow-hidden">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[03]</span>
              <span className="font-medium text-foreground">CODE</span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="text-muted-foreground font-mono text-xs mb-2 flex items-center gap-2">
              <span className="text-yellow-400">[INFO]</span>
              Include type definitions and comprehensive docstrings for optimal
              compilation
            </div>
            <div className="relative">
              <textarea
                value={tool}
                onChange={(e) => {
                  setTool(e.target.value);
                  debouncedCheckPrompt(e.target.value);
                }}
                required
                placeholder={`def utility_function(param: str) -> dict:
    """
    Comprehensive utility function with type hints
    
    Args:
        param (str): Input parameter description
        
    Returns:
        dict: Processed result data
    """
    return {"status": "success", "data": param}`}
                className="w-full h-40 sm:h-48 md:h-56 p-3 sm:p-4 pl-8 sm:pl-12 bg-background/80 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground resize-none font-mono text-xs sm:text-sm transition-all duration-300 hover:bg-background/90 outline-none leading-relaxed"
              />

              <div className="absolute top-3 right-3 flex items-center gap-2">
                {validateTool.isPending ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <span className="text-yellow-400 font-mono text-xs">
                      VALIDATING...
                    </span>
                  </div>
                ) : (
                  tool.length > 0 &&
                  validateTool.data && (
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${validateTool.data.valid ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      <span
                        className={`font-mono text-xs ${validateTool.data.valid ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {validateTool.data.valid ? 'VALIDATED' : 'ERROR'}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="absolute left-1 sm:left-2 top-3 sm:top-4 text-muted-foreground font-mono text-xs leading-relaxed select-none">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i}>{String(i + 1).padStart(2, '0')}</div>
                ))}
              </div>

              <div className="absolute bottom-3 left-8 sm:left-12 text-cyan-400 font-mono text-xs">
                {tool.includes('def ') && 'FUNCTION_DETECTED'}
              </div>
            </div>

            {tool.length > 0 &&
              !validateTool.isPending &&
              validateTool.data &&
              !validateTool.data.valid && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-sm">
                  <span className="text-red-500">[ERROR]</span>{' '}
                  {validateTool.data.error}
                </div>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="group">
              <label className="flex items-center gap-3 mb-3">
                <span className="text-red-400 font-mono text-xs">[04]</span>
                <span className="font-medium text-foreground">SYNTAX</span>
                <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
              </label>
              <Select onValueChange={setLanguage} value={language}>
                <SelectTrigger className="h-10 sm:h-12 bg-background/60 border border-red-500/30 focus:border-red-500 text-foreground font-mono text-sm sm:text-base transition-all duration-300 hover:bg-background/80">
                  <SelectValue placeholder="Select runtime..." />
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
              placeholder="utility, automation, api, data-processing, integration..."
              className="bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground h-10 sm:h-12 px-3 sm:px-4 font-mono text-sm sm:text-base transition-all duration-300 hover:bg-background/80"
            />
          </div>
        </div>

        <div className="relative bg-background/95 border-t-2 border-red-500/50 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-red-500" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-red-500" />

          <div className="flex items-center justify-end">
            <Button
              disabled={addTool.isPending || isLoading}
              onClick={submit}
              className="relative group px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-background border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-mono font-bold tracking-wider overflow-hidden text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">
                {addTool.isPending || isLoading ? 'COMPILING...' : 'PUSH_TOOL'}
              </span>
              {!addTool.isPending && !isLoading && (
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

export default AddToolModal;
