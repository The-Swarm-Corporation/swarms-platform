import Modal from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import Input from '@/shared/components/ui/Input/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { explorerCategories, languageOptions } from '@/shared/utils/constants';
import LoadingSpinner from '@/shared/components/loading-spinner';
import useEditModal from '@/shared/hooks/edit-modal';
import { Plus } from 'lucide-react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import MultiSelect from '@/shared/components/ui/multi-select';

import { useRef, useState, useCallback } from 'react';
import ModelFileUpload from './upload-image';
import { getSolPrice } from '@/shared/services/sol-price';

interface EditExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'agent' | 'prompt' | 'tool';
  entityId: string;
  onEditSuccessfully: () => void;
}

function EditExplorerModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  onEditSuccessfully,
}: EditExplorerModalProps) {
  const { user } = useAuthContext();
  const {
    inputState,
    setInputState,
    submit,
    validateMutation,
    debouncedCheckUniqueField,
    addUseCase,
    isPending,
    removeUseCase,
    addRequirement,
    removeRequirement,
    handleCategoriesChange,

    //upload
    image,
    imageUrl,
    filePath,
    uploadProgress,
    uploadStatus,
    isDeleteFile,
    uploadImage,
    deleteImage,

    hasContentChanged,
    checkTrustworthiness,
  } = useEditModal({ entityId, entityType, onClose, onEditSuccessfully });

  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [isConvertingPrice, setIsConvertingPrice] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const convertUsdToSol = useCallback(async (usdPrice: string) => {
    if (!usdPrice || isNaN(parseFloat(usdPrice))) {
      setSolPrice(null);
      return;
    }

    setIsConvertingPrice(true);
    try {
      const currentSolPrice = await getSolPrice();
      const solEquivalent = parseFloat(usdPrice) / currentSolPrice;
      setSolPrice(solEquivalent);
    } catch (error) {
      console.error('Failed to convert price:', error);
      setSolPrice(null);
    } finally {
      setIsConvertingPrice(false);
    }
  }, []);

  const imageUploadRef = useRef<HTMLInputElement>(null);

  const handleImageUploadClick = () => {
    imageUploadRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadStatus === 'uploading') return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (filePath && entityType) {
      await deleteImage(filePath, entityType);
    }

    await uploadImage(file, entityType);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (uploadStatus === 'uploading') return;

    e.preventDefault();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (filePath && entityType) {
      await deleteImage(filePath, entityType);
    }

    await uploadImage(file, entityType);
  };

  if (!user) return null;

  return (
    <Modal
      className="max-w-2xl"
      isOpen={isOpen}
      onClose={onClose}
      title={`Update ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`}
    >
      <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar h-[75vh] relative px-4">
        <div className="flex flex-col gap-1">
          <span>Name</span>
          <div className="relative">
            <Input
              value={inputState.name}
              onChange={(value) =>
                setInputState({ ...inputState, name: value })
              }
              onBlur={() => {
                if (!inputState.name.trim()) {
                  setErrors(prev => ({
                    ...prev,
                    name: 'Name is required'
                  }));
                } else if (inputState.name.trim().length < 2) {
                  setErrors(prev => ({
                    ...prev,
                    name: 'Name must be at least 2 characters long'
                  }));
                } else if (inputState.name.trim().length > 100) {
                  setErrors(prev => ({
                    ...prev,
                    name: 'Name cannot exceed 100 characters'
                  }));
                } else {
                  setErrors(prev => {
                    const { name, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              placeholder="Enter name"
            />
            {errors.name && (
              <span className="text-red-500 text-sm mt-1">
                {errors.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span>Description</span>
          <textarea
            value={inputState.description}
            onChange={(e) =>
              setInputState({ ...inputState, description: e.target.value })
            }
            onBlur={() => {
              if (!inputState.description.trim()) {
                setErrors(prev => ({
                  ...prev,
                  description: 'Description is required'
                }));
              } else if (inputState.description.trim().length < 10) {
                setErrors(prev => ({
                  ...prev,
                  description: 'Description must be at least 10 characters long'
                }));
              } else if (inputState.description.trim().length > 10000) {
                setErrors(prev => ({
                  ...prev,
                  description: 'Description cannot exceed 10,000 characters'
                }));
              } else {
                setErrors(prev => {
                  const { description, ...rest } = prev;
                  return rest;
                });
              }
            }}
            placeholder="Enter description"
            className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
          />
          {errors.description && (
            <span className="text-red-500 text-sm mt-1">
              {errors.description}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="capitalize">{entityType}</span>
          <div className="relative">
            <textarea
              value={inputState.uniqueField}
              onChange={(e) => {
                setInputState({ ...inputState, uniqueField: e.target.value });
                debouncedCheckUniqueField(e.target.value);
              }}
              onBlur={() => {
                if (!inputState.uniqueField.trim()) {
                  setErrors(prev => ({
                    ...prev,
                    content: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} content is required`
                  }));
                } else if (inputState.uniqueField.trim().length < 5) {
                  setErrors(prev => ({
                    ...prev,
                    content: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} content must be at least 5 characters long`
                  }));
                } else if (inputState.uniqueField.trim().length > 50000) {
                  setErrors(prev => ({
                    ...prev,
                    content: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} content cannot exceed 50,000 characters`
                  }));
                } else {
                  setErrors(prev => {
                    const { content, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              required
              placeholder={`Enter ${entityType} here...`}
              className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
            />
            {validateMutation.isPending ? (
              <div className="absolute right-2 top-2">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="absolute right-2.5 top-2.5">
                {inputState?.uniqueField?.length > 0 &&
                  validateMutation.data && (
                    <span
                      className={
                        validateMutation.data.valid
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      {validateMutation.data.valid ? '✅' : ''}
                    </span>
                  )}
              </div>
            )}
          </div>
          {errors.content && (
            <span className="text-red-500 text-sm mt-1">
              {errors.content}
            </span>
          )}
          {inputState?.uniqueField?.length > 0 &&
            !validateMutation.isPending &&
            validateMutation.data &&
            !validateMutation.data.valid && (
              <span className="text-red-500 text-sm">
                {validateMutation.data.error}
              </span>
            )}
        </div>
        <ModelFileUpload
          image={image}
          imageUrl={imageUrl || ''}
          filePath={filePath || ''}
          isDeleteFile={isDeleteFile}
          deleteImage={deleteImage}
          modelType={entityType}
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
            value={inputState.tags}
            onChange={(value) => setInputState({ ...inputState, tags: value })}
            placeholder="Tools, Search, etc."
          />
        </div>

        <div className="flex flex-col gap-1">
          <span>Categories</span>
          <MultiSelect
            options={explorerCategories.map((category) => ({
              id: category.value,
              label: category.label,
            }))}
            selectedValues={inputState.category}
            onChange={handleCategoriesChange}
            placeholder="Select categories"
          />
        </div>

        {/* UseCases */}
        <div className="flex flex-col gap-1">
          <span>Use Cases</span>
          <div className="flex flex-col gap-2">
            {inputState.useCases.map((useCase, index) => (
              <div key={index} className="flex gap-4 items-center">
                <span className="w-8">
                  <span># {index + 1}</span>
                </span>
                <div className="w-full flex flex-col gap-1 py-2">
                  <Input
                    value={useCase.title}
                    onChange={(value) =>
                      setInputState((prev) => {
                        const newUseCases = [...prev.useCases];
                        newUseCases[index].title = value;
                        return { ...prev, useCases: newUseCases };
                      })
                    }
                    placeholder="Use case title"
                  />
                  <textarea
                    value={useCase.description}
                    onChange={(e) =>
                      setInputState((prev) => {
                        const newUseCases = [...prev.useCases];
                        newUseCases[index].description = e.target.value;
                        return { ...prev, useCases: newUseCases };
                      })
                    }
                    placeholder="Description"
                    className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
                  />
                </div>
                <div className="w-4">
                  {index > 0 && (
                    <button
                      onClick={() => removeUseCase(index)}
                      className="text-red-500"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex justify-center">
              <button onClick={addUseCase} className="text-blue-500">
                <Plus />
              </button>
            </div>
          </div>
        </div>
        {(entityType === 'agent' || entityType === 'prompt') && (
          <div className="flex flex-col gap-1">
            <span>Pricing</span>
            <div className="space-y-4 border border-red-500/20 bg-background/40 p-4 rounded">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pricing"
                    checked={inputState.isFree}
                    onChange={() =>
                      setInputState({ ...inputState, isFree: true, price: '0' })
                    }
                    className="w-4 h-4 text-blue-500 border-blue-500/30 focus:ring-blue-500"
                  />
                  <span className="font-mono text-sm text-blue-400">
                    Free
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pricing"
                    checked={!inputState.isFree}
                    onChange={() =>
                      setInputState({ ...inputState, isFree: false })
                    }
                    className="w-4 h-4 text-green-500 border-green-500/30 focus:ring-green-500"
                  />
                  <span className="font-mono text-sm text-green-400">
                    Paid
                  </span>
                </label>
              </div>

              {!inputState.isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-mono text-red-400 mb-2">
                      Price (USD) <span className="text-yellow-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0.01"
                      max="999999"
                      step="0.01"
                      value={inputState.price}
                      onChange={(value) => {
                        setInputState({
                          ...inputState,
                          price: value,
                        });
                      }}
                      onBlur={() => {
                        // Validate price
                        const price = parseFloat(inputState.price);
                        if (inputState.price && (isNaN(price) || price < 0.01 || price > 999999)) {
                          setErrors(prev => ({
                            ...prev,
                            price: price < 0.01 ? 'Price must be at least $0.01 USD' : 'Price cannot exceed $999,999 USD'
                          }));
                        } else {
                          setErrors(prev => {
                            const { price, ...rest } = prev;
                            return rest;
                          });
                        }
                        convertUsdToSol(inputState.price);
                      }}
                      placeholder="10.00"
                    />
                    {errors.price && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.price}
                      </span>
                    )}
                    {inputState.price && !errors.price && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground font-mono">
                          Range: $0.01 - $999,999 USD
                        </p>
                        {isConvertingPrice ? (
                          <div className="flex items-center gap-1">
                            <LoadingSpinner />
                            <span className="text-xs text-muted-foreground">Converting...</span>
                          </div>
                        ) : solPrice !== null ? (
                          <span className="text-xs text-green-400 font-mono">
                            ≈ {solPrice.toFixed(6)} SOL (at current rate)
                          </span>
                        ) : null}
                      </div>
                    )}
                    {!inputState.price && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        Range: $0.01 - $999,999 USD
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-mono text-red-400 mb-2">
                      Wallet Address
                    </label>
                    <Input
                      value={inputState.sellerWalletAddress}
                      onChange={(value) =>
                        setInputState({
                          ...inputState,
                          sellerWalletAddress: value,
                        })
                      }
                      onBlur={() => {
                        if (inputState.sellerWalletAddress && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(inputState.sellerWalletAddress)) {
                          setErrors(prev => ({
                            ...prev,
                            walletAddress: 'Invalid Solana wallet address'
                          }));
                        } else {
                          setErrors(prev => {
                            const { walletAddress, ...rest } = prev;
                            return rest;
                          });
                        }
                      }}
                      placeholder="Your Solana wallet address..."
                    />
                    {errors.walletAddress && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.walletAddress}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!inputState.isFree && (
                <div className="space-y-3">
                  {hasContentChanged && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-400 font-medium">
                          ⚠️ Content Changes Detected
                        </span>
                      </div>
                      <p className="text-yellow-300 text-sm">
                        Your content has been modified. Marketplace validation will be required for paid items.
                      </p>
                    </div>
                  )}

                  {checkTrustworthiness.data &&
                    !checkTrustworthiness.data.isEligible && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-400 font-medium">
                            ❌ Not Eligible for Marketplace
                          </span>
                        </div>
                        <p className="text-red-300 text-sm">
                          {checkTrustworthiness.data.reason}
                        </p>
                        {!checkTrustworthiness.data.isBypassUser && (
                          <div className="mt-2 text-xs text-red-200">
                            <p>
                              Requirements: 2+ published items with 3.5+ average
                              rating
                            </p>
                            <p>
                              Your stats:{' '}
                              {checkTrustworthiness.data.publishedCount}{' '}
                              published,{' '}
                              {checkTrustworthiness.data.averageRating.toFixed(1)}{' '}
                              avg rating
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  {checkTrustworthiness.data &&
                    checkTrustworthiness.data.isEligible && hasContentChanged && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-400 font-medium">
                            ✅ Eligible for Marketplace
                          </span>
                        </div>
                        <p className="text-green-300 text-sm">
                          Content changes will be validated before publishing.
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        {entityType === 'agent' ||
          (entityType === 'tool' && (
            <>
              <div className="flex flex-col gap-1">
                <span>Language</span>
                <Select
                  value={inputState.language}
                  onValueChange={(value) =>
                    setInputState({ ...inputState, language: value })
                  }
                >
                  <SelectTrigger className="w-1/2 cursor-pointer capitalize">
                    <SelectValue placeholder={inputState.language} />
                  </SelectTrigger>
                  <SelectContent className="capitalize">
                    {languageOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span>Requirements</span>
                <div className="flex flex-col gap-2">
                  {inputState.requirements?.map((requirement, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <span className="w-10">📦 {index + 1}</span>
                      <div className="w-full flex flex-col md:flex-row gap-1 py-2">
                        <Input
                          value={requirement.package}
                          onChange={(value) =>
                            setInputState((prev) => {
                              const newRequirements = [
                                ...(prev.requirements ?? []),
                              ];
                              newRequirements[index].package = value;
                              return { ...prev, requirements: newRequirements };
                            })
                          }
                          placeholder="Enter package name"
                        />
                        <Input
                          value={requirement.installation}
                          onChange={(value) =>
                            setInputState((prev) => {
                              const newRequirements = [
                                ...(prev.requirements ?? []),
                              ];
                              newRequirements[index].installation = value;
                              return { ...prev, requirements: newRequirements };
                            })
                          }
                          placeholder="pip install package"
                        />
                      </div>
                      <div className="w-4">
                        {index > 0 && (
                          <button
                            onClick={() => removeRequirement(index)}
                            className="text-red-500 text-sm"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <button
                      onClick={addRequirement}
                      className="text-blue-500 text-sm"
                    >
                      <Plus />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          disabled={
            isPending ||
            validateMutation.isPending ||
            (!inputState.isFree && checkTrustworthiness.isLoading) ||
            (!inputState.isFree && checkTrustworthiness.data && !checkTrustworthiness.data.isEligible) ||
            Object.keys(errors).length > 0 ||
            !inputState.name.trim() ||
            !inputState.description.trim() ||
            !inputState.uniqueField.trim() ||
            (!inputState.isFree && !inputState.price) ||
            (!inputState.isFree && !inputState.sellerWalletAddress.trim())
          }
          onClick={submit}
        >
          {isPending ? 'Updating...' : 'Update'}
        </Button>
      </div>
    </Modal>
  );
}

export default EditExplorerModal;
