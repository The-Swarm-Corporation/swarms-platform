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
import { useMemo, useState } from 'react';
import { explorerCategories, languageOptions } from '@/shared/utils/constants';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import MultiSelect from '@/shared/components/ui/multi-select';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccessfully: () => void;
}

const AddToolModal = ({ isOpen, onClose, onAddSuccessfully }: Props) => {
  const { user } = useAuthContext();
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [tool, setTool] = useState('');
  const [tags, setTags] = useState('');
  const [language, setLanguage] = useState('python');
  const [categories, setCategories] = useState<string[]>([]);

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

  const addTool = trpc.explorer.addTool.useMutation();

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

    // Add Tool
    addTool
      .mutateAsync({
        name: toolName,
        tool,
        description,
        useCases: [{ title: '', description: '' }],
        language,
        category: categories,
        requirements: [{ package: '', installation: '' }],
        tags: trimTags,
      })
      .then(() => {
        toast.toast({
          title: 'Tool added successfully 🎉',
        });
        onClose();
        onAddSuccessfully();
        // Reset form
        setToolName('');
        setTool('');
        setDescription('');
        setTags('');
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
          <span>Tool Code - (Add types and docstrings)</span>
          <div className="relative">
            <textarea
              value={tool}
              onChange={(v) => {
                setTool(v.target.value);
                debouncedCheckPrompt(v.target.value);
              }}
              required
              placeholder="Enter tool code here..."
              className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
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
        <div className="flex flex-col gap-1">
          <span>Tags</span>
          <Input
            value={tags}
            onChange={setTags}
            placeholder="Tools, Search, etc."
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button
            disabled={addTool.isPending}
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

export default AddToolModal;
