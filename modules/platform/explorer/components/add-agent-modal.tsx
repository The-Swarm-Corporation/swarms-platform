import LoadingSpinner from '@/shared/components/loading-spinner';
import Modal from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { debounce } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAddSuccessfully: () => void;
}

const AddAgentModal = ({ isOpen, onClose, onAddSuccessfully }: Props) => {
    const [agentName, setAgentName] = useState('');
    const [description, setDescription] = useState('');
    const [agent, setAgent] = useState('');
    const [tags, setTags] = useState('');
    const [useCases, setUseCases] = useState<
        {
            title: string;
            description: string;
        }[]
    >([
        {
            title: '',
            description: '',
        },
    ]);

    const validateAgent = trpc.explorer.validateAgent.useMutation();

    const debouncedCheckAgent = useMemo(() => {
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

        if (agent.trim().length === 0) {
            toast.toast({
                title: 'Agent is required',
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

        // Validate use cases
        for (const useCase of useCases) {
            if (
                useCase.title.trim().length === 0 ||
                useCase.description.trim().length === 0
            ) {
                toast.toast({
                    title: `Use case ${useCase.title.trim().length === 0 ? 'title' : 'description'} is required`,
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

        // Add Agent
        addAgent
            .mutateAsync({
                name: agentName,
                agent,
                description,
                useCases,
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
                setDescription('');
                setAgent('');
                setTags('');
                setUseCases([{ title: '', description: '' }]);
            });
    };

    return (
        <Modal
            className="max-w-2xl"
            isOpen={isOpen}
            onClose={onClose}
            title="Add Agent"
        >
            <div className="flex flex-col gap-2 overflow-y-auto h-[75vh] relative px-4">
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
                        className="w-full h-15 p-2 border rounded-md bg-transparent outline-0 resize-none"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span>Agent</span>
                    <div className="relatvie">
                        <textarea
                            value={agent}
                            onChange={({ target: { value } }) => {
                                setAgent(value);
                                debouncedCheckAgent(value);
                            }}
                            required
                            placeholder="Type code here..."
                            className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
                        />
                        {validateAgent.isPending ? (
                            <div className="absolute right-[1.5rem] top-[2.4rem]">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="absolute right-[1.5rem] top-[2.4rem]">
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
                    <span>Tags</span>
                    <Input
                        value={tags}
                        onChange={setTags}
                        placeholder="Tools, Search, etc."
                    />
                </div>
                <div className="mt-2 flex flex-col gap-1">
                    <span>Use Cases</span>
                    <div className="flex flex-col gap-2">
                        {useCases.map((useCase, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <span className="w-8">
                                    <span># {i + 1}</span>
                                </span>
                                <div className="w-full flex flex-col gap-1 py-2">
                                    <Input
                                        value={useCase.title}
                                        onChange={(v) => {
                                            const newUseCases = [...useCases];
                                            newUseCases[i].title = v;
                                            setUseCases(newUseCases);
                                        }}
                                        placeholder="Title"
                                    />
                                    <textarea
                                        value={useCase.description}
                                        onChange={(e) => {
                                            const newUseCases = [...useCases];
                                            newUseCases[i].description = e.target.value;
                                            setUseCases(newUseCases);
                                        }}
                                        placeholder="Description"
                                        className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
                                    />
                                </div>
                                <div className="w-4">
                                    {i > 0 && (
                                        <button
                                            onClick={() => {
                                                const newUseCases = [...useCases];
                                                newUseCases.splice(i, 1);
                                                setUseCases(newUseCases);
                                            }}
                                            className="text-red-500"
                                        >
                                            ❌
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-center">
                            <button
                                onClick={() =>
                                    setUseCases([...useCases, { title: '', description: '' }])
                                }
                                className="text-blue-500"
                            >
                                <Plus />
                            </button>
                        </div>
                    </div>
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
