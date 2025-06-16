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
import { Code, FileText, Package, Plus, X } from 'lucide-react';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import MultiSelect from '@/shared/components/ui/multi-select';
import { useModelFileUpload } from '../hook/upload-file';
import { useRef } from 'react';
import ModelFileUpload from './upload-image';

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
  } = useEditModal({ entityId, entityType, onClose, onEditSuccessfully });

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

  const getEntityIcon = () => {
    switch (entityType) {
      case 'agent':
        return <Code className="w-4 h-4" />;
      case 'tool':
        return <Package className="w-4 h-4" />;
      case 'prompt':
        return <FileText className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getEntityTitle = () => {
    switch (entityType) {
      case 'agent':
        return 'AGENT';
      case 'tool':
        return 'TOOL';
      case 'prompt':
        return 'PROMPT';
      default:
        return 'ENTITY';
    }
  };

  const getUniqueFieldLabel = () => {
    switch (entityType) {
      case 'agent':
        return 'AGENT_CODE';
      case 'tool':
        return 'TOOL_CODE';
      case 'prompt':
        return 'PROMPT';
      default:
        return 'ENTITY_DATA';
    }
  };

  if (!user) return null;

  return (
    <Modal
      className="w-full max-w-md md:max-w-4xl overflow-hidden border-2 border-red-500/50 rounded-none bg-background backdrop-blur-sm shadow-2xl shadow-red-500/20"
      overlayClassName="backdrop-blur-md bg-background/60"
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showHeader={false}
      showClose={false}
    >
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.02)_1px,transparent_1px)] bg-[size:25px_25px]" />
      </div>

      <div className="relative z-10 flex flex-col h-[85vh] md:h-[75vh]">
        <div className="relative bg-background/95 border-b-2 border-red-500/50 px-8 py-6">
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-red-500" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-red-500" />

          <div className="flex items-center justify-end mb-4">
            <button
              onClick={onClose}
              className="group relative p-2 border border-red-500/30 hover:border-red-500 transition-all duration-300 bg-background/50 hover:bg-red-500/10"
            >
              <X className="w-5 h-5 text-muted-foreground group-hover:text-red-400 transition-colors" />
              <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2 tracking-wider flex items-center gap-3">
                {getEntityIcon()}
                {getEntityTitle()} MODIFICATION
                <div className="h-1 w-40 bg-gradient-to-r from-red-500 to-transparent mt-1" />
              </h2>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar">
          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[01]</span>
              <span className="font-medium text-foreground">NAME</span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="relative">
              <Input
                value={inputState.name}
                onChange={(value) =>
                  setInputState({ ...inputState, name: value })
                }
                placeholder=""
                className="bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground h-12 px-4 font-mono transition-all duration-300 hover:bg-background/80"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-red-500/50 rounded-full" />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[02]</span>
              <span className="font-medium text-foreground">DESCRIPTION</span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="relative">
              <textarea
                value={inputState.description}
                onChange={(e) =>
                  setInputState({ ...inputState, description: e.target.value })
                }
                placeholder=""
                className="w-full h-20 p-4 rounded-md bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground resize-none font-mono text-sm transition-all duration-300 hover:bg-background/80 outline-none"
              />
              <div className="absolute bottom-3 right-3 flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 bg-red-500/50 rounded-full"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animation: 'pulse 2s infinite',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[03]</span>
              <span className="font-medium text-foreground">
                {getUniqueFieldLabel()}
              </span>
              <span className="text-red-500 text-xs">*REQUIRED</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="relative">
              <textarea
                value={inputState.uniqueField}
                onChange={(e) => {
                  setInputState({ ...inputState, uniqueField: e.target.value });
                  debouncedCheckUniqueField(e.target.value);
                }}
                required
                placeholder={`Enter ${entityType} code here...`}
                className="w-full h-32 rounded-md p-4 bg-background/80 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground resize-none font-mono text-sm transition-all duration-300 hover:bg-background/90 outline-none leading-relaxed"
              />

              <div className="absolute top-3 right-3 flex items-center gap-2">
                {validateMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <span className="text-red-400 font-mono text-xs">
                      VALIDATING...
                    </span>
                  </div>
                ) : (
                  inputState.uniqueField.length > 0 &&
                  validateMutation.data && (
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${validateMutation.data.valid ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      <span
                        className={`font-mono text-xs ${validateMutation.data.valid ? 'text-green-400' : 'text-red-300'}`}
                      >
                        {validateMutation.data.valid ? 'VALIDATED' : 'ERROR'}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {inputState.uniqueField.length > 0 &&
              !validateMutation.isPending &&
              validateMutation.data &&
              !validateMutation.data.valid && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-sm">
                  <span className="text-red-300">[VALIDATION_ERROR]</span>{' '}
                  {validateMutation.data.error}
                </div>
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
            preface="[04]"
            title={imageUrl ? 'CHANGE_IMAGE' : 'ADD_IMAGE'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="flex items-center gap-3 mb-3">
                <span className="text-red-400 font-mono text-xs">[05]</span>
                <span className="font-medium text-foreground">TAGS</span>
                <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
              </label>
              <Input
                value={inputState.tags}
                onChange={(value) =>
                  setInputState({ ...inputState, tags: value })
                }
                placeholder="utility, automation, api, processing..."
                className="bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground h-12 px-4 font-mono transition-all duration-300 hover:bg-background/80"
              />
            </div>

            <div className="group">
              <label className="flex items-center gap-3 mb-3">
                <span className="text-red-400 font-mono text-xs">[06]</span>
                <span className="font-medium text-foreground">
                  CLASSIFICATION
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
              </label>
              <MultiSelect
                options={explorerCategories.map((category) => ({
                  id: category.value,
                  label: category.label,
                }))}
                selectedValues={inputState.category}
                onChange={handleCategoriesChange}
                placeholder="Select categories..."
                className="h-12 bg-background/60 border-2 border-red-500/30 focus:border-red-500 text-foreground font-mono transition-all duration-300 hover:bg-background/80"
              />
            </div>
          </div>

          <div className="group">
            <label className="flex items-center gap-3 mb-3">
              <span className="text-red-400 font-mono text-xs">[07]</span>
              <span className="font-medium text-foreground">USE_CASES</span>
              <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
            </label>
            <div className="space-y-4">
              {inputState.useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="border border-red-500/20 bg-background/40 p-4 rounded"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-red-400 font-mono text-sm">
                      USE_CASE_{String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-red-500/20 to-transparent" />
                    {index > 0 && (
                      <button
                        onClick={() => removeUseCase(index)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Input
                      value={useCase.title}
                      onChange={(value) =>
                        setInputState((prev) => {
                          const newUseCases = [...prev.useCases];
                          newUseCases[index].title = value;
                          return { ...prev, useCases: newUseCases };
                        })
                      }
                      placeholder="Use case title..."
                      className="bg-background/60 border border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground font-mono"
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
                      placeholder="Detailed use case description..."
                      className="w-full h-16 p-3 rounded-md bg-background/60 border border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground resize-none font-mono text-sm outline-none"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-center">
                <button
                  onClick={addUseCase}
                  className="flex items-center gap-2 px-4 py-2 border border-red-500/30 hover:border-red-500 bg-background/60 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-300 font-mono text-sm"
                >
                  <Plus className="w-4 h-4" />
                  ADD_USE_CASE
                </button>
              </div>
            </div>
          </div>

          {/* Marketplace Section */}
          {(entityType === 'agent' || entityType === 'prompt') && (
            <div className="group">
              <label className="flex items-center gap-3 mb-3">
                <span className="text-red-400 font-mono text-xs">[08]</span>
                <span className="font-medium text-foreground">MARKETPLACE</span>
                <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
              </label>
              <div className="space-y-4 border border-red-500/20 bg-background/40 p-4 rounded">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricing"
                      checked={inputState.isFree}
                      onChange={() => setInputState({ ...inputState, isFree: true, price: 0 })}
                      className="w-4 h-4 text-red-500 border-red-500/30 focus:ring-red-500"
                    />
                    <span className="font-mono text-sm text-foreground">FREE</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pricing"
                      checked={!inputState.isFree}
                      onChange={() => setInputState({ ...inputState, isFree: false })}
                      className="w-4 h-4 text-red-500 border-red-500/30 focus:ring-red-500"
                    />
                    <span className="font-mono text-sm text-foreground">PAID</span>
                  </label>
                </div>

                {!inputState.isFree && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-mono text-red-400 mb-2">
                        PRICE (SOL)
                      </label>
                      <Input
                        type="number"
                        min="0.01"
                        max="999"
                        step="0.01"
                        value={inputState.price}
                        onChange={(value) =>
                          setInputState({ ...inputState, price: parseFloat(value) || 0 })
                        }
                        placeholder="0.01"
                        className="bg-background/60 border border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-mono text-red-400 mb-2">
                        WALLET ADDRESS
                      </label>
                      <Input
                        value={inputState.sellerWalletAddress}
                        onChange={(value) =>
                          setInputState({ ...inputState, sellerWalletAddress: value })
                        }
                        placeholder="Your Solana wallet address..."
                        className="bg-background/60 border border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(entityType === 'agent' || entityType === 'tool') && (
            <>
              <div className="group">
                <label className="flex items-center gap-3 mb-3">
                  <span className="text-red-400 font-mono text-xs">[09]</span>
                  <span className="font-medium text-foreground">LANGUAGE</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
                </label>
                <Select
                  value={inputState.language}
                  onValueChange={(value) =>
                    setInputState({ ...inputState, language: value })
                  }
                >
                  <SelectTrigger className="w-1/2 h-12 bg-background/60 border border-red-500/30 focus:border-red-500 text-foreground font-mono transition-all duration-300 hover:bg-background/80">
                    <SelectValue placeholder="Select runtime..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-[9999] border-red-500/50 text-foreground">
                    {languageOptions.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="font-mono hover:bg-red-500/20"
                      >
                        {option.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="group">
                <label className="flex items-center gap-3 mb-3">
                  <span className="text-red-400 font-mono text-xs">[10]</span>
                  <span className="font-medium text-foreground">
                    REQUIREMENTS
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
                </label>
                <div className="space-y-4">
                  {inputState.requirements?.map((requirement, index) => (
                    <div
                      key={index}
                      className="border border-red-500/20 bg-background/40 p-4 rounded"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Package className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 font-mono text-sm">
                          PACKAGE_{String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-red-500/20 to-transparent" />
                        {index > 0 && (
                          <button
                            onClick={() => removeRequirement(index)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          placeholder="Package name..."
                          className="bg-background/60 border border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground font-mono"
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
                          placeholder="pip install package..."
                          className="bg-background/60 border border-red-500/30 focus:border-red-500 text-foreground placeholder-muted-foreground font-mono"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center">
                    <button
                      onClick={addRequirement}
                      className="flex items-center gap-2 px-4 py-2 border border-red-500/30 hover:border-red-500 bg-background/60 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-300 font-mono text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      ADD_REQUIREMENT
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative bg-background/95 border-t-2 border-red-500/50 px-8 py-6">
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-red-500" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-red-500" />

          <div className="flex items-center justify-end">
            <Button
              disabled={isPending}
              onClick={submit}
              className="relative group px-8 py-3 bg-background border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-mono font-bold tracking-wider overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">
                {isPending ? 'UPDATING...' : 'COMMIT_CHANGES'}
              </span>
              {!isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default EditExplorerModal;
