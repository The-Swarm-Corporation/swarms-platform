import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { debounce } from '@/shared/utils/helpers';
import { useEffect, useMemo, useState } from 'react';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useModelFileUpload } from '@/modules/platform/explorer/hook/upload-file';

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
  category: string[];
  useCases: { title: string; description: string }[];
  imageUrl?: string;
  filePath?: string;
  isFree?: boolean;
  price?: number;
  sellerWalletAddress?: string;
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
  category: string[];
  requirements?: { package: string; installation: string }[];
  isFree: boolean;
  price: number;
  sellerWalletAddress: string;
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
    category: [],
    requirements: [{ package: '', installation: '' }],
    isFree: true,
    price: 0,
    sellerWalletAddress: '',
  });

  // Store original data for smart change detection
  const [originalData, setOriginalData] = useState<InputState | null>(null);

  const {
    imageUrl,
    setImageUrl,
    setFilePath,
    image,
    filePath,
    uploadProgress,
    uploadStatus,
    isDeleteFile,
    uploadImage,
    deleteImage,
  } = useModelFileUpload();

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

  const hasContentChanged = useMemo(() => {
    if (!originalData) return false;

    return (
      inputState.name !== originalData.name ||
      inputState.description !== originalData.description ||
      inputState.uniqueField !== originalData.uniqueField
    );
  }, [inputState, originalData]);


  const checkTrustworthiness = trpc.marketplace.checkUserTrustworthiness.useQuery(
    undefined,
    {
      enabled: !inputState.isFree && hasContentChanged,
      retry: false,
    }
  );

  const fetchEntityData =
    entityType === 'agent'
      ? trpc.explorer.getAgentById.useQuery(entityId)
      : entityType === 'tool'
        ? trpc.explorer.getToolById.useQuery(entityId)
        : trpc.explorer.getPromptById.useQuery(entityId);

  const entityData: any = fetchEntityData.data;

  useEffect(() => {
    if (entityData) {
      setImageUrl(entityData.image_url ?? '');
      setFilePath(entityData.file_path ?? '');

      const loadedData = {
        name: entityData.name ?? '',
        description: entityData.description ?? '',
        tags: entityData.tags ?? '',
        category: entityData.category ?? [],
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
        isFree: entityData.is_free ?? true,
        price: entityData.price ?? 0,
        sellerWalletAddress: entityData.seller_wallet_address ?? '',
      };

      setInputState(loadedData);
      // Store original data for change detection
      setOriginalData(loadedData);
    }
  }, [entityData, entityType]);

  const debouncedCheckUniqueField = useMemo(() => {
    const debouncedFn = debounce((value: string) => {
      validateMutation.mutateAsync(value);
    }, 400);
    return debouncedFn;
  }, [validateMutation]);

  const handleCategoriesChange = (selectedCategories: string[]) => {
    setInputState((prev) => ({
      ...prev,
      category: selectedCategories,
    }));
  };

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

    if (inputState.category.length === 0) {
      toast.toast({
        title: 'Please select at least one category',
        variant: 'destructive',
      });
      return;
    }

    if (!inputState.isFree && hasContentChanged) {
      if (checkTrustworthiness.isLoading) {
        toast.toast({
          title: 'Checking eligibility...',
        });
        return;
      }

      if (checkTrustworthiness.error) {
        toast.toast({
          title: 'Unable to verify eligibility',
          description: 'Please try again later',
          variant: 'destructive',
        });
        return;
      }

      if (checkTrustworthiness.data && !checkTrustworthiness.data.isEligible) {
        toast.toast({
          title: 'Not eligible for marketplace',
          description: checkTrustworthiness.data.reason,
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

    const data: AgentEditModal | PromptEditModal | ToolEditModal =
      entityType === 'agent'
        ? {
            id: entityId,
            name: inputState.name,
            description: inputState.description,
            tags: trimTags,
            useCases: inputState.useCases,
            category: inputState.category,
            agent: inputState.uniqueField,
            language: inputState.language!,
            imageUrl: imageUrl || undefined,
            filePath: imageUrl && filePath ? filePath : undefined,
            requirements: inputState.requirements!,
            isFree: inputState.isFree,
            price: inputState.price,
            sellerWalletAddress: inputState.sellerWalletAddress,
          }
        : entityType === 'tool'
          ? {
              id: entityId,
              name: inputState.name,
              description: inputState.description,
              tags: trimTags,
              useCases: inputState.useCases,
              category: inputState.category,
              tool: inputState.uniqueField,
              requirements: inputState.requirements!,
              imageUrl: imageUrl || undefined,
              filePath: imageUrl && filePath ? filePath : undefined,
            }
          : {
              id: entityId,
              name: inputState.name,
              description: inputState.description,
              tags: trimTags,
              useCases: inputState.useCases,
              category: inputState.category,
              prompt: inputState.uniqueField,
              imageUrl: imageUrl || undefined,
              filePath: imageUrl && filePath ? filePath : undefined,
              isFree: inputState.isFree,
              price: inputState.price,
              sellerWalletAddress: inputState.sellerWalletAddress,
            };

    // Edit entity
    editMutation.mutateAsync(data).then(() => {
      toast.toast({
        title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} edited successfully 🎉`,
      });

      // Reset form to initial state
      setInputState({
        name: '',
        description: '',
        tags: '',
        useCases: [{ title: '', description: '' }],
        uniqueField: '',
        language: 'python',
        category: [],
        requirements: [{ package: '', installation: '' }],
        isFree: true,
        price: 0,
        sellerWalletAddress: '',
      });
      setOriginalData(null);
      setImageUrl('');
      setFilePath('');

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
    handleCategoriesChange,
    addUseCase,
    removeUseCase,
    addRequirement,
    removeRequirement,
    image,
    imageUrl,
    filePath,
    uploadProgress,
    uploadStatus,
    isDeleteFile,
    uploadImage,
    deleteImage,
    // Smart change detection
    hasContentChanged,
    checkTrustworthiness,
  };
}
