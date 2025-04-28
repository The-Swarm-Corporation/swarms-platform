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

    const trimTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .join(',');

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
      })
      .then(() => {
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
        <div className="flex justify-end mt-4">
          <Button
            disabled={addPrompt.isPending}
            onClick={submit}
            className="w-32"
          >
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddPromptModal;
