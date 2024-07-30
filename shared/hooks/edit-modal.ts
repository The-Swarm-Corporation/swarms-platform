import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { debounce } from '@/shared/utils/helpers';
import { useEffect, useMemo, useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';

interface EditExplorerModalProps {
  onClose: () => void;
  entityType: 'agent' | 'prompt' | 'tool';
  entityId: string;
  onEditSuccessfully: () => void;
}

type EditModal = {
  id: string;
  name: string;
  description?: string;
  tags?: string;
  useCases: { title: string; description: string }[];
};

interface AgentEditModal extends EditModal {
  agent: string;
  language?: string;
  requirements: { package: string; installation: string }[];
}

interface PromptEditModal extends EditModal {
  prompt: string;
}

interface ToolEditModal extends Omit<AgentEditModal, 'agent'> {
  tool: string;
}

interface InputState {
  name: string;
  description: string;
  tags: string;
  useCases: { title: string; description: string }[];
  uniqueField: string;
  language?: string;
  requirements?: { package: string; installation: string }[];
}

export default function useEditModal({
  entityType,
  entityId,
  onClose,
  onEditSuccessfully,
}: EditExplorerModalProps) {
  const toast = useToast();

  const [inputState, setInputState] = useState<InputState>({
    name: '',
    description: '',
    tags: '',
    useCases: [{ title: '', description: '' }],
    uniqueField: '',
    language: 'python',
    requirements: [{ package: '', installation: '' }],
  });

  const validateMutation =
    entityType === 'agent'
      ? trpc.explorer.validateAgent.useMutation()
      : entityType === 'tool'
        ? trpc.explorer.validateTool.useMutation()
        : trpc.explorer.validatePrompt.useMutation();
  const editMutation =
    entityType === 'agent'
      ? trpc.explorer.updateAgent.useMutation()
      : entityType === 'tool'
        ? trpc.explorer.updateTool.useMutation()
        : trpc.explorer.updatePrompt.useMutation();

  const fetchEntityData =
    entityType === 'agent'
      ? trpc.explorer.getAgentById.useQuery(entityId)
      : entityType === 'tool'
        ? trpc.explorer.getToolById.useQuery(entityId)
        : trpc.explorer.getPromptById.useQuery(entityId);

  const entityData: any = fetchEntityData.data;

  useEffect(() => {
    if (entityData) {
      setInputState({
        name: entityData.name ?? '',
        description: entityData.description ?? '',
        tags: entityData.tags ?? '',
        useCases: entityData.use_cases ?? [{ title: '', description: '' }],
        uniqueField:
          entityType === 'agent'
            ? entityData.agent
            : entityType === 'tool'
              ? entityData.tool
              : entityData.prompt,
        language:
          entityType === 'agent' || entityType === 'tool'
            ? entityData.language
            : 'python',
        requirements:
          entityType === 'agent' || entityType === 'tool'
            ? entityData.requirements
            : [{ package: '', installation: '' }],
      });
    }
  }, [entityData, entityType]);

  const debouncedCheckUniqueField = useMemo(() => {
    const debouncedFn = debounce((value: string) => {
      validateMutation.mutateAsync(value);
    }, 400);
    return debouncedFn;
  }, []);

  const addUseCase = () => {
    setInputState((prev) => ({
      ...prev,
      useCases: [...prev.useCases, { title: '', description: '' }],
    }));
  };

  const removeUseCase = (index: number) => {
    setInputState((prev) => {
      const newUseCases = [...prev.useCases];
      newUseCases.splice(index, 1);
      return { ...prev, useCases: newUseCases };
    });
  };

  const addRequirement = () => {
    if (entityType === 'agent' || entityType === 'tool') {
      setInputState((prev) => ({
        ...prev,
        requirements: [
          ...(prev.requirements ?? []),
          { package: '', installation: '' },
        ],
      }));
    }
  };

  const removeRequirement = (index: number) => {
    if (entityType === 'agent' || entityType === 'tool') {
      setInputState((prev) => {
        const newRequirements = [...(prev.requirements ?? [])];
        newRequirements.splice(index, 1);
        return { ...prev, requirements: newRequirements };
      });
    }
  };

  const submit = () => {
    // Common validation
    if (validateMutation.isPending) {
      toast.toast({
        title: `Validating ${entityType}`,
      });
      return;
    }

    if (inputState.name.trim().length < 2) {
      toast.toast({
        title: 'Name should be at least 2 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (inputState.uniqueField.trim().length === 0) {
      toast.toast({
        title: `${entityType === 'agent' ? 'Agent' : entityType === 'tool' ? 'Tool' : 'Prompt'} is required`,
        variant: 'destructive',
      });
      return;
    }

    if (validateMutation.data && !validateMutation.data.valid) {
      toast.toast({
        title: `Invalid ${entityType}`,
        description: validateMutation.data.error,
        variant: 'destructive',
      });
      return;
    }

    // Validate use cases
    for (const useCase of inputState.useCases) {
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

    const trimTags = inputState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .join(',');

    // Unique validation for agent requirements
    if (
      (entityType === 'agent' || entityType === 'tool') &&
      inputState.requirements
    ) {
      for (const requirement of inputState.requirements) {
        if (
          requirement.package.trim().length === 0 ||
          requirement.installation.trim().length === 0
        ) {
          toast.toast({
            title: `Requirement ${requirement.package.trim().length === 0 ? 'package' : 'installation'} is required`,
            variant: 'destructive',
          });
          return;
        }
      }
    }

    // Prepare data based on entityType
    const data: AgentEditModal | PromptEditModal | ToolEditModal =
      entityType === 'agent'
        ? {
            id: entityId,
            name: inputState.name,
            description: inputState.description,
            tags: trimTags,
            useCases: inputState.useCases,
            agent: inputState.uniqueField,
            language: inputState.language!,
            requirements: inputState.requirements!,
          }
        : entityType === 'tool'
          ? {
              id: entityId,
              name: inputState.name,
              description: inputState.description,
              tags: trimTags,
              useCases: inputState.useCases,
              tool: inputState.uniqueField,
              requirements: inputState.requirements!,
            }
          : {
              id: entityId,
              name: inputState.name,
              description: inputState.description,
              tags: trimTags,
              useCases: inputState.useCases,
              prompt: inputState.uniqueField,
            };

    // Edit entity
    editMutation.mutateAsync(data).then(() => {
      toast.toast({
        title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} edited successfully 🎉`,
      });
      onClose();
      onEditSuccessfully();
    });
  };

  return {
    inputState,
    setInputState,
    submit,
    debouncedCheckUniqueField,
    validateMutation,
    isPending: editMutation.isPending,
    addUseCase,
    removeUseCase,
    addRequirement,
    removeRequirement,
  };
}
