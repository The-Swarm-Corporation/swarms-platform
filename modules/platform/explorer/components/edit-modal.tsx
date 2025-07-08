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

import { useRef, useState, useCallback, useEffect } from 'react';
import ModelFileUpload from './upload-image';
import { solToUsd } from '@/shared/services/sol-price';
import { SmartWalletInput } from '@/shared/components/marketplace/smart-wallet-input';
import { WalletProvider } from '@/shared/components/marketplace/wallet-provider';
import { useMarketplaceValidation } from '@/shared/hooks/use-deferred-validation';

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

  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const [isConvertingPrice, setIsConvertingPrice] = useState(false);

  const validation = useMarketplaceValidation();

  useEffect(() => {
    validation.updateField('walletAddress', inputState.sellerWalletAddress);
  }, [inputState.sellerWalletAddress, validation.updateField]);

  const convertPriceToUsd = useCallback(async (solPrice: string) => {
    if (!solPrice || isNaN(parseFloat(solPrice))) {
      setUsdPrice(null);
      return;
    }

    setIsConvertingPrice(true);
    try {
      const usd = await solToUsd(parseFloat(solPrice));
      setUsdPrice(usd);
    } catch (error) {
      console.error('Failed to convert price:', error);
      setUsdPrice(null);
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
    <WalletProvider>
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
              placeholder="Enter name"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span>Description</span>
          <textarea
            value={inputState.description}
            onChange={(e) =>
              setInputState({ ...inputState, description: e.target.value })
            }
            placeholder="Enter description"
            className="w-full h-20 p-2 border rounded-md bg-transparent outline-0 resize-none"
          />
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
                      setInputState({ ...inputState, isFree: true, price: 0 })
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
                      Price (SOL)
                    </label>
                    <Input
                      type="number"
                      min="0.000001"
                      max="999999"
                      step="0.000001"
                      value={inputState.price}
                      onChange={(value) => {
                        const price = parseFloat(value) || 0;
                        setInputState({
                          ...inputState,
                          price,
                        });
                        convertPriceToUsd(value);
                      }}
                      placeholder="0.000001"
                    />
                    {usdPrice !== null && (
                      <p className="text-xs text-gray-400 mt-1">
                        ≈ ${usdPrice.toFixed(2)} USD
                        {isConvertingPrice && ' (converting...)'}
                      </p>
                    )}
                  </div>
                  <div>
                    <SmartWalletInput
                      value={inputState.sellerWalletAddress}
                      onChange={(value) =>
                        setInputState({
                          ...inputState,
                          sellerWalletAddress: value,
                        })
                      }
                      onBlur={() => validation.validateOnBlur('walletAddress')}
                      error={validation.fields.walletAddress?.error}
                      disabled={isPending}
                    />
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
        <Button disabled={isPending} onClick={submit}>
          Update
        </Button>
      </div>
    </Modal>
    </WalletProvider>
  );
}

export default EditExplorerModal;
