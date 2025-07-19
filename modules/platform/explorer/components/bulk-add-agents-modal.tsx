import LoadingSpinner from '@/shared/components/loading-spinner';
import Modal from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import Input from '@/shared/components/ui/Input/Input';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { fetchRepositoryInfo } from '@/shared/utils/github-integration';
import { GitBranch, Plus, Trash2, CheckCircle, XCircle, Upload } from 'lucide-react';
import { trpc } from '@/shared/utils/trpc/trpc';
import { explorerCategories, languageOptions } from '@/shared/utils/constants';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useModelFileUpload } from '../hook/upload-file';
import { useMarketplaceValidation } from '@/shared/hooks/use-deferred-validation';
import { SmartWalletInput } from '@/shared/components/marketplace/smart-wallet-input';
import { WalletProvider } from '@/shared/components/marketplace/wallet-provider';
import { useRouter } from 'next/navigation';
import { validateLinksArray, getSuggestedUrlPattern, type LinkItem } from '@/shared/utils/link-validation';

interface GitHubRepo {
  url: string;
  name: string;
  description: string;
  language: string;
  categories: string[];
  tags: string[];
  mainCode: string;
  imageUrl?: string;
  status: 'pending' | 'importing' | 'success' | 'error';
  error?: string;
  requirements: Array<{ package: string; installation: string }>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccessfully: () => void;
}

const BulkAddAgentsModal = ({
  isOpen,
  onClose,
  onAddSuccessfully,
}: Props) => {
  const { user } = useAuthContext();
  const [githubUrls, setGithubUrls] = useState<string[]>(['']);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [priceUsd, setPriceUsd] = useState(''); // USD price input
  const [walletAddress, setWalletAddress] = useState('');
  const [language, setLanguage] = useState('python');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([
    { name: '', url: '' },
  ]);
  const [linkErrors, setLinkErrors] = useState<string>('');
  const router = useRouter();

  const {
    image,
    imageUrl,
    filePath,
    uploadProgress,
    uploadStatus,
    isDeleteFile,
    uploadImage,
    deleteImage,
  } = useModelFileUpload();

  const imageUploadRef = useRef<HTMLInputElement>(null);
  const addAgent = trpc.explorer.addAgent.useMutation();
  const checkTrustworthiness = trpc.marketplace.checkUserTrustworthiness.useQuery(undefined, {
    enabled: !isFree,
    retry: false,
  });
  const validation = useMarketplaceValidation();
  const toast = useToast();

  // Reset all states when modal opens/closes
  const resetForm = useCallback(() => {
    setGithubUrls(['']);
    setRepos([]);
    setIsImporting(false);
    setIsSubmitting(false);
    setIsFree(true);
    setPriceUsd('');
    setWalletAddress('');
    setLinks([{ name: '', url: '' }]);
    setLinkErrors('');
    setLanguage('python');
    setCategories([]);
    setTags('');

    // Reset validation safely
    if (validation && typeof validation.reset === 'function') {
      try {
        validation.reset();
      } catch (error) {
        console.warn('Error resetting validation:', error);
      }
    }
  }, []); // Remove validation dependency to prevent infinite loops

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const addGithubUrl = () => {
    setGithubUrls([...githubUrls, '']);
  };

  const removeGithubUrl = (index: number) => {
    if (githubUrls.length > 1) {
      const newUrls = githubUrls.filter((_, i) => i !== index);
      setGithubUrls(newUrls);
      
      // Remove corresponding repo from repos array
      const newRepos = repos.filter((_, i) => i !== index);
      setRepos(newRepos);
    }
  };

  const updateGithubUrl = (index: number, url: string) => {
    const newUrls = [...githubUrls];
    newUrls[index] = url;
    setGithubUrls(newUrls);
  };

  const importAllRepositories = async () => {
    const validUrls = githubUrls.filter(url => url.trim());
    
    if (validUrls.length === 0) {
      toast.toast({
        title: 'Please enter at least one GitHub URL',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    const newRepos: GitHubRepo[] = [];

    for (let i = 0; i < validUrls.length; i++) {
      const url = validUrls[i];
      
      // Update status to importing
      const importingRepo: GitHubRepo = {
        url,
        name: '',
        description: '',
        language: 'python',
        categories: [],
        tags: [],
        mainCode: '',
        status: 'importing',
        requirements: []
      };
      
      newRepos[i] = importingRepo;
      setRepos([...newRepos]);

      try {
        const repoInfo = await fetchRepositoryInfo(url);
        
        if (!repoInfo) {
          throw new Error('Failed to fetch repository information');
        }

        newRepos[i] = {
          url,
          name: repoInfo.name,
          description: repoInfo.description,
          language: repoInfo.language,
          categories: repoInfo.categories,
          tags: repoInfo.tags,
          mainCode: repoInfo.mainCode,
          imageUrl: repoInfo.imageUrl,
          status: 'success',
          requirements: repoInfo.requirements
        };
      } catch (error) {
        console.error('Error importing repository:', error);
        newRepos[i] = {
          url,
          name: '',
          description: '',
          language: 'python',
          categories: [],
          tags: [],
          mainCode: '',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          requirements: []
        };
      }
      
      setRepos([...newRepos]);
    }

    setIsImporting(false);
    
    const successCount = newRepos.filter(repo => repo.status === 'success').length;
    const errorCount = newRepos.filter(repo => repo.status === 'error').length;
    
    if (successCount > 0) {
      toast.toast({
        title: `Import completed`,
        description: `${successCount} repositories imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });
    } else {
      toast.toast({
        title: 'Import failed',
        description: 'All repositories failed to import. Please check the URLs and try again.',
        variant: 'destructive',
      });
    }
  };

  const submitAllAgents = async () => {
    const validRepos = repos.filter(repo => repo.status === 'success');
    
    if (validRepos.length === 0) {
      toast.toast({
        title: 'No valid repositories to submit',
        variant: 'destructive',
      });
      return;
    }

    if (!isFree) {
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

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const repo of validRepos) {
      try {
        const trimTags = tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
          .join(',');

        const finalCategories = categories.length > 0 ? categories : repo.categories;
        const finalTags = tags.trim() ? trimTags : repo.tags.join(', ');
        const finalLanguage = language !== 'python' ? language : repo.language;

        const filteredLinks = links.filter(link => link.name.trim() && link.url.trim());
        const linkValidation = validateLinksArray(filteredLinks);
        if (!linkValidation.isValid) {
          throw new Error(`Invalid links: ${linkValidation.error}`);
        }

        await addAgent.mutateAsync({
          name: repo.name,
          agent: repo.mainCode,
          description: repo.description,
          category: finalCategories,
          imageUrl: undefined, // We'll handle images separately if needed
          filePath: undefined,
          useCases: [
            {
              title: '',
              description: '',
            },
          ],
          language: finalLanguage,
          requirements: repo.requirements,
          tags: finalTags,
          links: filteredLinks,
          isFree,
          price_usd: isFree ? 0 : parseFloat(priceUsd),
          sellerWalletAddress: isFree ? '' : walletAddress,
        });

        successCount++;
      } catch (error) {
        console.error('Error submitting agent:', error);
        errorCount++;
      }
    }

    setIsSubmitting(false);

    if (successCount > 0) {
      toast.toast({
        title: `Agents submitted successfully 🎉`,
        description: `${successCount} agents added${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });
      
      onAddSuccessfully();
      resetForm();
      onClose();
    } else {
      toast.toast({
        title: 'Submission failed',
        description: 'All agents failed to submit. Please check your content and try again.',
        variant: 'destructive',
      });
    }
  };

  const addLink = () => {
    setLinks([...links, { name: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);

    if (linkErrors) {
      setLinkErrors('');
    }

    if (field === 'url' && value.trim()) {
      const linkValidation = validateLinksArray([{ name: newLinks[index].name, url: value }]);
      if (!linkValidation.isValid) {
        setLinkErrors(`Link ${index + 1}: ${linkValidation.error}`);
      }
    }
  };

  if (!user) return null;

  return (
    <WalletProvider>
      <Modal
        className="max-w-4xl bg-black border border-gray-800"
        isOpen={isOpen}
        onClose={onClose}
        title="Bulk Add Agents from GitHub"
        description="Import multiple GitHub repositories and convert them into agents automatically. Requirements will be fetched from each repository's dependency files."
      >
        <div className="flex flex-col gap-4 overflow-y-auto h-[75vh] relative px-4 bg-black text-white">
          {/* GitHub URLs Section */}
          <div className="flex flex-col gap-2 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-5 h-5 text-green-400" />
              <h3 className="font-medium text-white">GitHub Repository URLs</h3>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Enter multiple public GitHub repository URLs. Each repository will be imported and converted into an agent.
              Private repositories are not supported. Requirements will be automatically fetched from each repository.
            </p>
            
            <div className="flex flex-col gap-2">
              {githubUrls.map((url, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={url}
                    onChange={(value) => updateGithubUrl(index, value)}
                    placeholder="Enter public GitHub repository URL"
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-green-500"
                  />
                  {githubUrls.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeGithubUrl(index)}
                      className="px-2 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <div className="flex gap-2">
                <Button
                  onClick={addGithubUrl}
                  variant="outline"
                  className="w-fit border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another URL
                </Button>
                
                <Button
                  onClick={importAllRepositories}
                  disabled={isImporting || githubUrls.every(url => !url.trim())}
                  className="w-fit bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  {isImporting ? <LoadingSpinner /> : <Upload className="w-4 h-4 mr-2" />}
                  {isImporting ? 'Importing...' : 'Import All Repositories'}
                </Button>
              </div>
            </div>
          </div>

          {/* Import Status */}
          {repos.length > 0 && (
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
              <h4 className="font-medium mb-3 text-white">Import Status</h4>
              <div className="flex flex-col gap-2">
                {repos.map((repo, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-800 border border-gray-700 rounded">
                    {repo.status === 'importing' && <LoadingSpinner />}
                    {repo.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {repo.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                    
                    <div className="flex-1">
                      <div className="font-medium text-white">{repo.name || repo.url}</div>
                      {repo.status === 'success' && (
                        <div className="text-sm text-gray-400">
                          Language: {repo.language} | Categories: {repo.categories.join(', ')}
                          {repo.requirements.length > 0 && (
                            <span className="ml-2 text-green-400">
                              | Requirements: {repo.requirements.length} found
                            </span>
                          )}
                        </div>
                      )}
                      {repo.status === 'error' && (
                        <div className="text-sm text-red-400">{repo.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global Settings */}
          <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <h4 className="font-medium mb-3 text-white">Global Settings</h4>
            <p className="text-sm text-gray-400 mb-4">
              These settings will be applied to all imported agents. Individual repository settings will be used as defaults.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-gray-300">Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:border-green-500"
                >
                  {languageOptions?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-gray-300">Categories (comma-separated)</span>
                <Input
                  value={categories.join(', ')}
                  onChange={(value) => setCategories(value.split(',').map((cat: string) => cat.trim()).filter(Boolean))}
                  placeholder="AI, automation, tools"
                  className="border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-green-500"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-gray-300">Additional Tags</span>
                <Input
                  value={tags}
                  onChange={setTags}
                  placeholder="AI, automation, tools, etc."
                  className="border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">Add Links</h4>
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
            {linkErrors && (
              <div className="text-red-400 text-sm mb-2">
                {linkErrors}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {links.map((link, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <span className="w-10 text-gray-400">🔗 {index + 1}</span>
                  <div className="w-full flex flex-col md:flex-row gap-1 py-2">
                    <Input
                      value={link.name}
                      onChange={(value) => updateLink(index, 'name', value)}
                      placeholder="Link name (e.g., GitHub, Twitter)"
                      className="border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-green-500"
                    />
                    <Input
                      value={link.url}
                      onChange={(value) => updateLink(index, 'url', value)}
                      placeholder={link.name ? getSuggestedUrlPattern(link.name) : "https://example.com"}
                      className="border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-green-500"
                    />
                  </div>
                  <div className="w-4">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <h4 className="font-medium mb-3 text-white">Pricing</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsFree(true)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 transition-all duration-300 font-mono text-sm ${
                    isFree
                      ? 'border-gray-400 bg-gray-800 text-gray-300'
                      : 'border-gray-600 bg-gray-900 text-gray-500 hover:border-gray-500'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isFree ? 'bg-gray-400' : 'bg-gray-600'}`}
                  />
                  Free
                </button>

                <button
                  type="button"
                  onClick={() => setIsFree(false)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 transition-all duration-300 font-mono text-sm ${
                    !isFree
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-gray-600 bg-gray-900 text-gray-500 hover:border-gray-500'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${!isFree ? 'bg-green-500' : 'bg-gray-600'}`}
                  />
                  Paid
                </button>
              </div>

              {!isFree && (
                <div className="space-y-4 p-4 border border-green-500/30 bg-green-500/5">
                  {/* Trustworthiness Status */}
                  {checkTrustworthiness.isLoading && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <LoadingSpinner />
                      <span className="text-red-400 text-sm">
                        Checking marketplace eligibility...
                      </span>
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
                      </div>
                    )}

                  {checkTrustworthiness.data &&
                    checkTrustworthiness.data.isEligible && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 font-medium">
                            ✅ Eligible for Marketplace
                          </span>
                        </div>
                      </div>
                    )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (USD) <span className="text-yellow-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={priceUsd}
                      onChange={setPriceUsd}
                      placeholder="10.00"
                      min="0.01"
                      max="999999"
                      step="0.01"
                      className="bg-gray-800 border border-green-500/30 focus:border-green-500 text-white placeholder-gray-500"
                    />
                  </div>

                  <SmartWalletInput
                    value={walletAddress}
                    onChange={setWalletAddress}
                    onBlur={() => validation.validateOnBlur('walletAddress')}
                    error={validation.fields.walletAddress?.error}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              Clear Form
            </Button>

            <Button
              disabled={
                isSubmitting ||
                repos.filter(repo => repo.status === 'success').length === 0 ||
                (!isFree && checkTrustworthiness.isLoading) ||
                (!isFree &&
                  checkTrustworthiness.data &&
                  !checkTrustworthiness.data.isEligible)
              }
              onClick={submitAllAgents}
              className="w-40 bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              {isSubmitting
                ? 'Submitting...'
                : `Submit ${repos.filter(repo => repo.status === 'success').length} Agents`}
            </Button>
          </div>
        </div>
      </Modal>
    </WalletProvider>
  );
};

export default BulkAddAgentsModal; 