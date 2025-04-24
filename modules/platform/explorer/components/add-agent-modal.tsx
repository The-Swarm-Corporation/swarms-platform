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
import { languageOptions } from '@/shared/utils/constants';
import { useAuthContext } from '@/shared/components/ui/auth.provider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccessfully: () => void;
}

const AddAgentModal = ({ isOpen, onClose, onAddSuccessfully }: Props) => {
  const { user } = useAuthContext();
  const [agentName, setAgentName] = useState('');
  const [description, setDescription] = useState('');
  const [agent, setAgent] = useState('');
  const [tags, setTags] = useState('');
  const [language, setLanguage] = useState('python');

  const validateAgent = trpc.explorer.validateAgent.useMutation();

  const debouncedCheckPrompt = useMemo(() => {
    const debouncedFn = debounce((value: string) => {
      validateAgent.mutateAsync(value);
    }, 400);
    return debouncedFn;
  }, []);

  const toast = useToast();

  const addAgent = trpc.explorer.addAgent.useMutation();

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

    const trimTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .join(',');

    // Add Agent
    addAgent
      .mutateAsync({
        name: agentName,
        agent,
        description,
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
      })
      .then(() => {
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
      });
  };

  if (!user) return null;

  return (
    <Modal
      className="max-w-2xl overflow-y-auto"
      isOpen={isOpen}
      onClose={onClose}
      title="Add Agent"
    >
      <div className="flex flex-col gap-2 overflow-y-auto h-[60vh] relative px-4">
        <div className="flex flex-col gap-1">
          <span>Name</span>
          <div className="relative">
            <Input
              value={agentName}
              onChange={setAgentName}
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
          <span>Agent Code in Python</span>
          <div className="relative">
            <textarea
              value={agent}
              onChange={(v) => {
                setAgent(v.target.value);
                debouncedCheckPrompt(v.target.value);
              }}
              required
              placeholder="Enter agent code here..."
              className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
            />
            {validateAgent.isPending ? (
              <div className="absolute right-2 top-2">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="absolute right-2.5 top-2.5">
                {agent.length > 0 && validateAgent.data && (
                  <span
                    className={
                      validateAgent.data.valid
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {validateAgent.data.valid ? '✅' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          {agent.length > 0 &&
            !validateAgent.isPending &&
            validateAgent.data &&
            !validateAgent.data.valid && (
              <span className="text-red-500 text-sm">
                {validateAgent.data.error}
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
            disabled={addAgent.isPending}
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

export default AddAgentModal;
