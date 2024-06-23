import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { debounce } from '@/shared/utils/helpers';
import { useEffect, useMemo, useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useUploadFileToStorage } from './upload-file';

interface EditExplorerModalProps {
  onClose: () => void;
  entityType: 'agent' | 'prompt';
  entityId: string;
  onEditSuccessfully: () => void;
}

type EditModal = {
  id: string;
  name: string;
  description?: string;
  tags?: string;
  image_url?: string;
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

interface InputState {
  name: string;
  description: string;
  tags: string;
  useCases: { title: string; description: string }[];
  uniqueField: string;
  language?: string;
  imageUrl?: string;
  requirements?: { package: string; installation: string }[];
}

export type SwitchImageProps = 'yes' | 'no';
export default function useEditModal({
  entityType,
  entityId,
  onClose,
  onEditSuccessfully,
}: EditExplorerModalProps) {
  const toast = useToast();

  const [isSwitchImage, setIsSwitchImage] = useState<SwitchImageProps>('no');
  const [inputState, setInputState] = useState<InputState>({
    name: '',
    description: '',
    tags: '',
    useCases: [{ title: '', description: '' }],
    uniqueField: '',
    language: 'python',
    imageUrl: '',
    requirements: [{ package: '', installation: '' }],
  });

  const { imageFile, isUploading, handleFileChange, setImageFile, uploadImage } =
    useUploadFileToStorage({ isSwitchImage });

  const validateMutation =
    entityType === 'agent'
      ? trpc.explorer.validateAgent.useMutation()
      : trpc.explorer.validatePrompt.useMutation();
  const editMutation =
    entityType === 'agent'
      ? trpc.explorer.updateAgent.useMutation()
      : trpc.explorer.updatePrompt.useMutation();

  const fetchEntityData =
    entityType === 'agent'
      ? trpc.explorer.getAgentById.useQuery(entityId)
      : trpc.explorer.getPromptById.useQuery(entityId);

  const entityData: any = fetchEntityData.data;

  useEffect(() => {
    if (entityData) {
      setInputState({
        name: entityData.name ?? '',
        description: entityData.description ?? '',
        tags: entityData.tags ?? '',
        imageUrl: entityData.image_url ?? '',
        useCases: entityData.use_cases ?? [{ title: '', description: '' }],
        uniqueField:
          entityType === 'agent' ? entityData.agent : entityData.prompt,
        language: entityType === 'agent' ? entityData.language : 'python',
        requirements:
          entityType === 'agent'
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
    if (entityType === 'agent') {
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
    if (entityType === 'agent') {
      setInputState((prev) => {
        const newRequirements = [...(prev.requirements ?? [])];
        newRequirements.splice(index, 1);
        return { ...prev, requirements: newRequirements };
      });
    }
  };

  const submit = async () => {
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
        title: `${entityType === 'agent' ? 'Agent' : 'Prompt'} is required`,
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
    if (entityType === 'agent' && inputState.requirements) {
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

    const imageLink = imageFile ? await uploadImage() : null;
    const imageUrl = isSwitchImage === 'no' ? entityData.image_url : imageLink;

    // Prepare data based on entityType
    const data: AgentEditModal | PromptEditModal =
      entityType === 'agent'
        ? {
            id: entityId,
            name: inputState.name,
            description: inputState.description,
            tags: trimTags,
            useCases: inputState.useCases,
            agent: inputState.uniqueField,
            language: inputState.language!,
            image_url: imageUrl || "",
            requirements: inputState.requirements!,
          }
        : {
            id: entityId,
            name: inputState.name,
            description: inputState.description,
            tags: trimTags,
            useCases: inputState.useCases,
            image_url: imageUrl || "",
            prompt: inputState.uniqueField,
          };

    // Edit entity
    editMutation
      .mutateAsync(data)
      .then(() => {
        toast.toast({
          title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} edited successfully 🎉`,
        });
        setImageFile(null);
        onClose();
        onEditSuccessfully();
      })
      .catch((err) => console.error(err));
  };

  return {
    inputState,
    setInputState,
    isSwitchImage,
    setIsSwitchImage,
    submit,
    debouncedCheckUniqueField,
    validateMutation,
    isPending: editMutation.isPending || isUploading,
    handleFileChange,
    addUseCase,
    removeUseCase,
    addRequirement,
    removeRequirement,
  };
}
