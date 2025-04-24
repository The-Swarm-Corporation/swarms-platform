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
      className="max-w-2xl overflow-y-auto bg-black/90 border-2 border-red-500/50 shadow-[0_0_15px_rgba(255,0,0,0.3)] backdrop-blur-sm"
      isOpen={isOpen}
      onClose={onClose}
      title="Add Agent"
    >
      <div className="flex flex-col gap-4 overflow-y-auto h-[60vh] relative px-6 py-4">
        <div className="flex flex-col gap-2">
          <span className="text-red-400 font-semibold tracking-wider uppercase text-sm">Name</span>
          <div className="relative before:absolute before:inset-0 before:border-2 before:border-red-500/50 before:rounded-lg before:shadow-[0_0_10px_rgba(255,0,0,0.2)] before:-skew-x-2">
            <Input
              value={agentName}
              onChange={setAgentName}
              placeholder="Enter name"
              className="bg-black/50 border-2 border-red-500/30 rounded-lg pl-4 pr-8 py-2 text-red-50 placeholder:text-red-200/30 focus:outline-none focus:border-red-400/50 transition-all duration-300"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-red-400 font-semibold tracking-wider uppercase text-sm">Description</span>
          <div className="relative before:absolute before:inset-0 before:border-2 before:border-red-500/50 before:rounded-lg before:shadow-[0_0_10px_rgba(255,0,0,0.2)] before:skew-x-1">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full h-20 p-3 bg-black/50 border-2 border-red-500/30 rounded-lg text-red-50 placeholder:text-red-200/30 focus:outline-none focus:border-red-400/50 transition-all duration-300 resize-none"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-red-400 font-semibold tracking-wider uppercase text-sm">Agent Code in Python</span>
          <div className="relative before:absolute before:inset-0 before:border-2 before:border-red-500/50 before:rounded-lg before:shadow-[0_0_10px_rgba(255,0,0,0.2)] before:-skew-x-1">
            <textarea
              value={agent}
              onChange={(v) => {
                setAgent(v.target.value);
                debouncedCheckPrompt(v.target.value);
              }}
              required
              placeholder="Enter agent code here..."
              className="w-full h-20 p-3 bg-black/50 border-2 border-red-500/30 rounded-lg text-red-50 placeholder:text-red-200/30 focus:outline-none focus:border-red-400/50 transition-all duration-300 resize-none font-mono"
            />
            {validateAgent.isPending ? (
              <div className="absolute right-3 top-3">
                <LoadingSpinner className="text-red-500" />
              </div>
            ) : (
              <div className="absolute right-3.5 top-3.5">
                {agent.length > 0 && validateAgent.data && (
                  <span className={validateAgent.data.valid ? 'text-green-400 text-lg' : 'text-red-500'}>
                    {validateAgent.data.valid ? '✓' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          {agent.length > 0 && !validateAgent.isPending && validateAgent.data && !validateAgent.data.valid && (
            <span className="text-red-500 text-sm ml-2">
              {validateAgent.data.error}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-red-400 font-semibold tracking-wider uppercase text-sm">Language</span>
          <Select onValueChange={setLanguage} value={language}>
            <SelectTrigger className="w-1/2 cursor-pointer capitalize bg-black/50 border-2 border-red-500/30 rounded-lg text-red-50 focus:outline-none focus:border-red-400/50 transition-all duration-300">
              <SelectValue placeholder={language} />
            </SelectTrigger>
            <SelectContent className="capitalize bg-black/90 border-2 border-red-500/30 text-red-50">
              {languageOptions?.map((option) => (
                <SelectItem key={option} value={option} className="hover:bg-red-500/20">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-red-400 font-semibold tracking-wider uppercase text-sm">Tags</span>
          <div className="relative before:absolute before:inset-0 before:border-2 before:border-red-500/50 before:rounded-lg before:shadow-[0_0_10px_rgba(255,0,0,0.2)] before:skew-x-2">
            <Input
              value={tags}
              onChange={setTags}
              placeholder="Tools, Search, etc."
              className="bg-black/50 border-2 border-red-500/30 rounded-lg pl-4 pr-8 py-2 text-red-50 placeholder:text-red-200/30 focus:outline-none focus:border-red-400/50 transition-all duration-300"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            disabled={addAgent.isPending}
            onClick={submit}
            className="w-32 bg-red-500/20 hover:bg-red-500/30 text-red-50 border-2 border-red-500/50 rounded-lg transform hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-0 before:border-2 before:border-red-500/50 before:rounded-lg before:shadow-[0_0_10px_rgba(255,0,0,0.2)] before:-skew-x-2"
          >
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddAgentModal;
