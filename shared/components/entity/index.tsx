'use client';
// Todo: Add the ability to hover over buttons and get copy from text, markdown, and more!
import React, { PropsWithChildren, useState, useTransition } from 'react';

import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Copy,
  Pencil,
  Share,
  Star,
  FileDown,
  Info,
  MessageSquare,
  Download,
  Code,
  Stars,
  Bot,
  ExternalLink,
  Globe,
  FileText,
  Link,
} from 'lucide-react';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { usePathname } from 'next/navigation';
import Avatar from '@/shared/components/avatar';
import { Button } from '../ui/button';
import AgentRequirements, { RequirementProps } from './agent-requirements';
import ShareModal from '@/modules/platform/explorer/components/share-modal';
import EditExplorerModal from '@/modules/platform/explorer/components/edit-modal';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import AddRatingModal from '../rating/add-rating';
import ListReview, { ReviewProps } from '../rating/list-rating';
import ReactStars from 'react-rating-star-with-type';
import { getReviewRating } from '../rating/helper';
import { saveAs } from 'file-saver';
import Markdown from 'react-markdown';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import remarkGfm from 'remark-gfm';
import { stripMarkdown } from './helper';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import BookmarkButton from '@/shared/components/bookmark-button';
import RecommendedItems from './recommended-items';
import TwitterX from '@/shared/components/icons/TwitterX';
import GitHub from '@/shared/components/icons/GitHub';
import LinkedIn from '@/shared/components/icons/LinkedIn';
import Discord from '@/shared/components/icons/Discord';
import YouTube from '@/shared/components/icons/YouTube';
import Telegram from '@/shared/components/icons/Telegram';

type UseCasesProps = { title: string; description: string };

type EntityType = 'agent' | 'prompt' | 'tool';

interface LinkItem {
  name: string;
  url: string;
}

interface Entity extends PropsWithChildren {
  id?: string;
  name?: string;
  tags?: string[];
  title: string;
  language?: string;
  description?: string;
  usecases?: UseCasesProps[];
  prompt?: string;
  imageUrl?: string;
  requirements?: RequirementProps[];
  userId?: string | null;
  links?: LinkItem[] | null;
  agentCode?: string; // NEW: The main code of the agent as a string
  createdAt?: string; // Optional: time posted
  authorUsername?: string; // Optional: author username
}

const CommentList = dynamic(() => import('@/shared/components/comments'), {
  ssr: false,
});
const ChatComponent = dynamic(() => import('@/shared/components/chat/prompt'), {
  ssr: false,
});

const styles = `
@keyframes gradient-x {
  0%, 100% {
    background-size: 200% 200%;
    background-position: left center;
  }
  50% {
    background-size: 200% 200%;
    background-position: right center;
  }
}

.animate-gradient-x {
  animation: gradient-x 15s ease infinite;
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

function UseCases({ usecases }: { usecases: UseCasesProps[] }) {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
    'from-violet-500 to-indigo-500',
  ];

  return (
    <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950/50 ">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Use Cases
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ">
        {usecases?.map((usecase, index) => {
          const colorClass = colors[index % colors.length];
          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-500 ease-out hover:shadow-xl hover:scale-[1.02] hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1"
            >
              {/* Animated border gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${colorClass} animate-gradient-x`}
              />
              <div className="absolute inset-[1px] rounded-xl bg-white dark:bg-zinc-950" />

              {/* Content */}
              <div className="relative p-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {usecase?.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {usecase?.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Add custom wrapper component
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then(mod => mod.PrismAsyncLight),
  { ssr: false }
);

const CustomPre = (props: React.HTMLAttributes<HTMLPreElement>) => (
  <pre id="customPreTag" {...props} />
);

function EntityLinks({ links }: { links: LinkItem[] }) {
  const getIconForLink = (name: string) => {
    const normalizedName = name.toLowerCase().trim();

    switch (normalizedName) {
      case 'github':
        return <GitHub className="h-4 w-4" />;
      case 'twitter':
      case 'x':
        return <TwitterX className="h-4 w-4" />;
      case 'linkedin':
        return <LinkedIn className="h-4 w-4" />;
      case 'youtube':
        return <YouTube className="h-4 w-4" />;
      case 'website':
      case 'site':
        return <Globe className="h-4 w-4" />;
      case 'documentation':
      case 'docs':
        return <FileText className="h-4 w-4" />;
      case 'blog':
        return <FileText className="h-4 w-4" />;
      case 'discord':
        return <Discord className="h-4 w-4" />;
      case 'telegram':
        return <Telegram className="h-4 w-4" />;
      default:
        return <Link className="h-4 w-4" />;
    }
  };

  const getThemeColors = (name: string) => {
    const normalizedName = name.toLowerCase().trim();

    switch (normalizedName) {
      case 'github':
        return 'bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-[#181717] dark:text-gray-300 hover:text-[#181717] dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transform hover:scale-105 hover:shadow-md';
      case 'twitter':
        return 'bg-[#1DA1F2]/10 dark:bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/20 dark:hover:bg-[#1DA1F2]/30 border-[#1DA1F2]/30 dark:border-[#1DA1F2]/50 text-[#1DA1F2] dark:text-[#1DA1F2] hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 dark:hover:border-[#1DA1F2]/70 transform hover:scale-105 hover:shadow-md';
      case 'x':
        return 'bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transform hover:scale-105 hover:shadow-md';
      case 'linkedin':
        return 'bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 hover:bg-[#0A66C2]/20 dark:hover:bg-[#0A66C2]/30 border-[#0A66C2]/30 dark:border-[#0A66C2]/50 text-[#0A66C2] dark:text-[#0A66C2] hover:text-[#0A66C2] hover:border-[#0A66C2]/50 dark:hover:border-[#0A66C2]/70 transform hover:scale-105 hover:shadow-md';
      case 'youtube':
        return 'bg-[#FF0000]/10 dark:bg-[#FF0000]/20 hover:bg-[#FF0000]/20 dark:hover:bg-[#FF0000]/30 border-[#FF0000]/30 dark:border-[#FF0000]/50 text-[#FF0000] dark:text-[#FF0000] hover:text-[#FF0000] hover:border-[#FF0000]/50 dark:hover:border-[#FF0000]/70 transform hover:scale-105 hover:shadow-md';
      case 'discord':
        return 'bg-[#5865F2]/10 dark:bg-[#5865F2]/20 hover:bg-[#5865F2]/20 dark:hover:bg-[#5865F2]/30 border-[#5865F2]/30 dark:border-[#5865F2]/50 text-[#5865F2] dark:text-[#5865F2] hover:text-[#5865F2] hover:border-[#5865F2]/50 dark:hover:border-[#5865F2]/70 transform hover:scale-105 hover:shadow-md';
      case 'telegram':
        return 'bg-[#0088cc]/10 dark:bg-[#0088cc]/20 hover:bg-[#0088cc]/20 dark:hover:bg-[#0088cc]/30 border-[#0088cc]/30 dark:border-[#0088cc]/50 text-[#0088cc] dark:text-[#0088cc] hover:text-[#0088cc] hover:border-[#0088cc]/50 dark:hover:border-[#0088cc]/70 transform hover:scale-105 hover:shadow-md';
      case 'website':
      case 'site':
        return 'bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:border-green-300 dark:hover:border-green-700 transform hover:scale-105 hover:shadow-md';
      case 'documentation':
      case 'docs':
        return 'bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:border-purple-300 dark:hover:border-purple-700 transform hover:scale-105 hover:shadow-md';
      case 'blog':
        return 'bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700 transform hover:scale-105 hover:shadow-md';
      default:
        return 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500 transform hover:scale-105 hover:shadow-md';
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link, index) => (
        <button
          key={index}
          onClick={() => handleLinkClick(link.url)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors duration-200 ${getThemeColors(link.name)}`}
          title={`${link.name}: ${link.url}`}
        >
          {getIconForLink(link.name)}
          <span>{link.name}</span>
        </button>
      ))}
    </div>
  );
}

export default function EntityComponent({
  id,
  title,
  name,
  tags,
  prompt,
  description,
  usecases,
  language,
  requirements,
  children,
  userId,
  imageUrl,
  links,
  agentCode,
  createdAt,
  authorUsername,
}: Entity) {
  const toast = useToast();
  const user = trpc.main.getUser.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const reviewQuery = user
    ? trpc.explorer.checkReview.useQuery({ modelId: id ?? '' })
    : null;
  const reviews = trpc.explorer.getReviews.useQuery(id ?? '');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const entityTitle = title.toLowerCase();

  const showEditButton =
    (entityTitle === 'agent' ||
      entityTitle === 'prompt' ||
      entityTitle === 'tool') &&
    user &&
    user?.data?.id === userId;

  const pathName = usePathname();
  const [isShowShareModalOpen, setIsShowModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isReviewModal, setIsReviewModal] = useState(false);
  const [isReviewListModal, setIsReviewListModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('preview');

  async function copyToClipboard(text: string) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.toast({ title: 'Copied to clipboard' });
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  }

  const handleShowShareModal = () => setIsShowModalOpen(true);
  const handleCloseModal = () => setIsShowModalOpen(false);

  const handleShowEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleShowReviewModal = () => setIsReviewModal(true);

  const handleShowReviewListModal = () => setIsReviewListModal(true);
  const handleCloseReviewListModal = () => setIsReviewListModal(false);

  function onEditSuccessfully() {
    startTransition(() => {
      router.refresh();
    });
  }

  const { modelRating, reviewLength, reviewTextEnd } = getReviewRating(
    (reviews.data as ReviewProps[]) || [],
  );

  const handleRefetch = () => {
    reviewQuery?.refetch();
    reviews?.refetch();
  };

  const downloadFile = (
    content: string,
    fileName: string,
    fileType: string,
  ) => {
    const blob = new Blob([content], { type: fileType });
    saveAs(blob, fileName);
  };

  const handleCopy = () => {
    let contentToCopy;
    if (selectedTab === 'md') {
      contentToCopy = prompt;
    } else if (selectedTab === 'txt') {
      contentToCopy = stripMarkdown(prompt ?? '');
    } else if (selectedTab === 'framework') {
      contentToCopy = `import time
from swarms import Agent

# Put your api key in the .env file like OPENAI_API_KEY=""


# Initialize the agent
agent = Agent(
    agent_name="${name || 'Custom-Agent'}",
    agent_description="${description?.replace(/"/g, '\\"') || 'Custom agent for specific tasks'}",
    system_prompt="""${prompt?.replace(/"/g, '\\"') || ''}""",
    max_loops=1,
    model_name="gpt-4o-mini",
    dynamic_temperature_enabled=True,
    output_type="all",
    max_tokens=16384,
    # dashboard=True
)

# Run the agent with your task
out = agent.run("Your task description here")

time.sleep(10)
print(out)`;
    } else if (selectedTab === 'api') {
      contentToCopy = `import os
import requests
from dotenv import load_dotenv

# Load API key from environment
load_dotenv()
API_KEY = os.getenv("SWARMS_API_KEY")
BASE_URL = "https://api.swarms.world"

# Configure headers with your API key
headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def run_single_agent(agent_config, task):
    """
    Run a single agent with the AgentCompletion format.
    """
    payload = {
        "agent_config": agent_config,
        "task": task
    }

    try:
        response = requests.post(
            f"{BASE_URL}/v1/agent/completions", 
            headers=headers, 
            json=payload
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None

# Agent configuration using this prompt
agent_config = {
    "agent_name": "${name || 'Custom-Agent'}",
    "description": "${description?.replace(/"/g, '\\"') || 'Custom agent for specific tasks'}",
    "system_prompt": """${prompt?.replace(/"/g, '\\"') || ''}""",
    "model_name": "gpt-4o",
    "role": "worker",
    "max_loops": 2,
    "max_tokens": 8192,
    "temperature": 0.5,
    "auto_generate_prompt": False,
}

# Your task
task = "Your task description here"

# Run the agent
result = run_single_agent(agent_config, task)
print(result)`;
    } else {
      contentToCopy = prompt;
    }
    copyToClipboard(contentToCopy ?? '');
  };

  const handleDownload = () => {
    let contentToDownload;
    let filename;
    let filetype;
    if (selectedTab === 'md') {
      contentToDownload = prompt;
      filename = `${name ?? 'prompt'}.md`;
      filetype = 'text/markdown';
    } else if (selectedTab === 'txt') {
      contentToDownload = stripMarkdown(prompt ?? '');
      filename = `${name ?? 'prompt'}.txt`;
      filetype = 'text/plain';
    } else if (selectedTab === 'framework') {
      contentToDownload = `import time
from swarms import Agent

# Put your api key in the .env file like OPENAI_API_KEY=""


# Initialize the agent
agent = Agent(
    agent_name="${name || 'Custom-Agent'}",
    agent_description="${description?.replace(/"/g, '\\"') || 'Custom agent for specific tasks'}",
    system_prompt="""${prompt?.replace(/"/g, '\\"') || ''}""",
    max_loops=1,
    model_name="gpt-4o-mini",
    dynamic_temperature_enabled=True,
    output_type="all",
    max_tokens=16384,
    # dashboard=True
)

# Run the agent with your task
out = agent.run("Your task description here")

time.sleep(10)
print(out)`;
      filename = `${name ?? 'prompt'}_framework.py`;
      filetype = 'text/python';
    } else if (selectedTab === 'api') {
      contentToDownload = `import os
import requests
from dotenv import load_dotenv

# Load API key from environment
load_dotenv()
API_KEY = os.getenv("SWARMS_API_KEY")
BASE_URL = "https://api.swarms.world"

# Configure headers with your API key
headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def run_single_agent(agent_config, task):
    """
    Run a single agent with the AgentCompletion format.
    """
    payload = {
        "agent_config": agent_config,
        "task": task
    }

    try:
        response = requests.post(
            f"{BASE_URL}/v1/agent/completions", 
            headers=headers, 
            json=payload
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None

# Agent configuration using this prompt
agent_config = {
    "agent_name": "${name || 'Custom-Agent'}",
    "description": "${description?.replace(/"/g, '\\"') || 'Custom agent for specific tasks'}",
    "system_prompt": """${prompt?.replace(/"/g, '\\"') || ''}""",
    "model_name": "gpt-4o",
    "role": "worker",
    "max_loops": 2,
    "max_tokens": 8192,
    "temperature": 0.5,
    "auto_generate_prompt": False,
}

# Your task
task = "Your task description here"

# Run the agent
result = run_single_agent(agent_config, task)
print(result)`;
      filename = `${name ?? 'prompt'}_api.py`;
      filetype = 'text/python';
    } else {
      contentToDownload = stripMarkdown(prompt ?? '');
      filename = `${name ?? 'prompt'}.csv`;
      filetype = 'text/csv';
    }
    const toastText = filetype.includes('markdown')
      ? 'Downloaded as markdown'
      : filetype.includes('python')
        ? 'Downloaded as Python file'
        : filetype.includes('csv')
          ? 'Downloaded as csv'
          : 'Download as plain text';
    downloadFile(contentToDownload ?? '', filename, filetype);
    toast.toast({ description: toastText });
  };

  const handleExportToAI = (platform: 'chatgpt' | 'claude') => {
    if (!prompt) return;

    const encodedPrompt = encodeURIComponent(prompt);
    const encodedDescription = encodeURIComponent(description || '');
    const encodedName = encodeURIComponent(name || '');

    let url: string;

    if (platform === 'chatgpt') {
      url = `https://chatgpt.com/?hints=search&q=${encodedPrompt}`;
    } else {
      url = `https://claude.ai/new?q=${encodedPrompt}`;
    }

    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');

    toast.toast({
      description: `Opened ${platform === 'chatgpt' ? 'ChatGPT' : 'Claude'} in new tab`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
      {/* Header Section */}
      <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 md:p-8 bg-white dark:bg-zinc-950/50 mb-8">
        <div className="max-md:text-center">
          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x" />
            {imageUrl ? (
              <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-black to-red-950">
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
                  <Image
                    src={imageUrl}
                    alt={`${name || title} - ${entityTitle} image`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    priority
                    quality={90}
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </div>
            ) : (
              <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 h-32 flex items-center justify-center">
                <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                  <Code className="h-8 w-8" />
                  <span className="text-lg font-medium">No image available</span>
                </div>
              </div>
            )}
          </div>

          {/* Title and Description Section */}
          <div className="space-y-8">
            {title && (
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <Code className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
                  {title}
                </h2>
              </div>
            )}

            <div className="space-y-6">
              {name && (
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100">
                  {name}
                </h1>
              )}
              {description && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Info className="h-4 w-4" />
                    <h3 className="text-sm font-medium">About this {entityTitle}</h3>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <Markdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Override default link to open in new tab
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline" />
                          ),
                          // Style tables
                          table: ({ node, ...props }) => (
                            <div className="my-6 w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                              <table {...props} className="w-full border-collapse text-sm" />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead {...props} className="bg-zinc-100 dark:bg-zinc-800/50" />
                          ),
                          tr: ({ node, ...props }) => (
                            <tr {...props} className="border-b border-zinc-200 dark:border-zinc-800" />
                          ),
                          th: ({ node, ...props }) => (
                            <th {...props} className="border-r border-zinc-200 dark:border-zinc-800 px-4 py-2 text-left font-medium" />
                          ),
                          td: ({ node, ...props }) => (
                            <td {...props} className="border-r border-zinc-200 dark:border-zinc-800 px-4 py-2" />
                          ),
                          // Style code blocks
                          code: ({ node, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match && !className?.includes('code-block');
                            return isInline ? (
                              <code 
                                {...props} 
                                className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm"
                              >
                                {children}
                              </code>
                            ) : (
                              <div className="relative group">
                                <button 
                                  onClick={() => copyToClipboard(children as string)}
                                  className="absolute right-2 top-2 p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors duration-200 border border-zinc-700/50 opacity-0 group-hover:opacity-100"
                                  title="Copy code"
                                >
                                  <Copy size={14} className="text-zinc-200" />
                                </button>
                                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-200 dark:bg-zinc-700/50 border-b border-zinc-300 dark:border-zinc-600">
                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                      {match?.[1]?.toUpperCase() || 'CODE'}
                                    </span>
                                  </div>
                                  <pre className="p-4 overflow-x-auto">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                </div>
                              </div>
                            );
                          },
                          // Add spacing to paragraphs
                          p: ({ node, ...props }) => (
                            <p {...props} className="mb-4 last:mb-0 leading-relaxed" />
                          ),
                          // Style headings
                          h1: ({ node, ...props }) => (
                            <h1 {...props} className="text-2xl font-bold mt-8 mb-4" />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 {...props} className="text-xl font-bold mt-8 mb-4" />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 {...props} className="text-lg font-bold mt-6 mb-4" />
                          ),
                          h4: ({ node, ...props }) => (
                            <h4 {...props} className="text-base font-bold mt-6 mb-4" />
                          ),
                          // Style lists
                          ul: ({ node, ...props }) => (
                            <ul {...props} className="list-disc pl-6 mb-4 last:mb-0 space-y-2" />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol {...props} className="list-decimal pl-6 mb-4 last:mb-0 space-y-2" />
                          ),
                          // Style blockquotes
                          blockquote: ({ node, ...props }) => (
                            <blockquote {...props} className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 my-4 italic" />
                          ),
                          // Style horizontal rules
                          hr: ({ node, ...props }) => (
                            <hr {...props} className="my-8 border-zinc-200 dark:border-zinc-800" />
                          ),
                        }}
                      >
                        {description}
                      </Markdown>
                    </div>
                  </div>
                </div>
              )}
              <Avatar
                userId={userId ?? ''}
                showUsername
                showBorder
                className="mt-6"
                title={`${title ?? ''} Author`}
              />
            </div>
          </div>

          {/* Tags Section */}
          {tags && tags.length > 0 && (
            <div className="mt-8">
              <div className="flex gap-2 select-none flex-wrap justify-center md:justify-start">
                {tags?.map(
                  (tag) =>
                    tag.trim() && (
                      <div
                        key={tag}
                        className="text-sm px-3 py-1.5 rounded-full !text-red-500/70 border border-red-500/70 bg-red-50 dark:bg-red-950/20"
                      >
                        {tag}
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          {/* Action Buttons Section */}
          <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
            {showEditButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowEditModal}
                className="flex items-center gap-2 border-zinc-300 dark:border-zinc-700"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowShareModal}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 border-green-600"
            >
              <Share className="h-4 w-4 text-white" />
              Share
            </Button>
            {id && user.data?.id && !reviewQuery?.data?.hasReviewed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowReviewModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 border-blue-600"
              >
                <Star className="h-4 w-4 text-white hover:text-white" />
                Rate
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowReviewListModal}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 border-yellow-600"
            >
              <Stars className="h-4 w-4 text-white hover:text-white" />
              Reviews{' '}
              {reviewLength && reviewLength > 0 ? `(${reviewLength})` : ''}
            </Button>
            <BookmarkButton
              id={id || ''}
              type={entityTitle as 'prompt' | 'agent' | 'tool'}
              name={name || title}
              description={description}
              created_at={new Date().toISOString()}
              username={user?.data?.username || undefined}
              tags={tags}
            />
            {prompt && (
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
                >
                  <ExternalLink className="h-4 w-4 text-white" />
                  Export to AI
                </Button>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-zinc-800/95 border border-zinc-700/50 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        downloadFile(
                          prompt ?? '',
                          `${name ?? 'prompt'}.txt`,
                          'text/plain',
                        );
                        toast.toast({ description: 'Downloaded as text file' });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as Text (.txt)
                    </button>
                    <button
                      onClick={() => {
                        downloadFile(
                          prompt ?? '',
                          `${name ?? 'prompt'}.md`,
                          'text/markdown',
                        );
                        toast.toast({
                          description: 'Downloaded as markdown file',
                        });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as Markdown (.md)
                    </button>
                    <button
                      onClick={() => {
                        const frameworkCode = `import time
from swarms import Agent

# Put your api key in the .env file like OPENAI_API_KEY=""


# Initialize the agent
agent = Agent(
    agent_name="${name || 'Custom-Agent'}",
    agent_description="""${(description || 'Custom agent for specific tasks').replace(/"""/g, '\"\"\"').replace(/^\n+/, '')}""",
    system_prompt="""${prompt?.replace(/"/g, '\\"') || ''}""",
    max_loops=1,
    model_name="gpt-4o-mini",
    dynamic_temperature_enabled=True,
    output_type="all",
    max_tokens=16384,
    # dashboard=True
)

# Run the agent with your task
out = agent.run("Your task description here")

time.sleep(10)
print(out)`;
                        downloadFile(
                          frameworkCode,
                          `${name ?? 'prompt'}_framework.py`,
                          'text/python',
                        );
                        toast.toast({
                          description: 'Downloaded as Framework Python file',
                        });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as Framework (.py)
                    </button>
                    <button
                      onClick={() => {
                        const apiCode = `import os
import requests
from dotenv import load_dotenv

# Load API key from environment
load_dotenv()
API_KEY = os.getenv("SWARMS_API_KEY")
BASE_URL = "https://api.swarms.world"

# Configure headers with your API key
headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def run_single_agent(agent_config, task):
    """
    Run a single agent with the AgentCompletion format.
    """
    payload = {
        "agent_config": agent_config,
        "task": task
    }

    try:
        response = requests.post(
            f"{BASE_URL}/v1/agent/completions", 
            headers=headers, 
            json=payload
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None

# Agent configuration using this prompt
agent_config = {
    "agent_name": "${name || 'Custom-Agent'}",
    "description": """${(description || 'Custom agent for specific tasks').replace(/"""/g, '\"\"\"').replace(/^\n+/, '')}""",
    "system_prompt": """${prompt?.replace(/"/g, '\\"') || ''}""",
    "model_name": "gpt-4o",
    "role": "worker",
    "max_loops": 2,
    "max_tokens": 8192,
    "temperature": 0.5,
    "auto_generate_prompt": False,
}

# Your task
task = "Your task description here"

# Run the agent
result = run_single_agent(agent_config, task)
print(result)`;
                        downloadFile(
                          apiCode,
                          `${name ?? 'prompt'}_api.py`,
                          'text/python',
                        );
                        toast.toast({
                          description: 'Downloaded as API Python file',
                        });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as API (.py)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Links Section */}
          {links && links.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Link className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Related Links
                </span>
              </div>
              <EntityLinks links={links} />
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      <ListReview
        reviews={reviews.data as ReviewProps[]}
        isOpen={isReviewListModal}
        onClose={handleCloseReviewListModal}
      />

      {!reviewQuery?.data?.hasReviewed && (
        <AddRatingModal
          id={id ?? ''}
          handleRefetch={handleRefetch}
          open={isReviewModal}
          setOpen={setIsReviewModal}
          modelType={entityTitle}
        />
      )}
      <EditExplorerModal
        entityId={id ?? ''}
        entityType={entityTitle as EntityType}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onEditSuccessfully={onEditSuccessfully}
        key={id}
      />

      {/* Use Cases Section */}
      {usecases && usecases?.some((uc) => uc?.title?.trim() !== '') && (
        <section className="mb-8">
          <UseCases usecases={usecases} />
        </section>
      )}

      {/* Requirements Section */}
      {(title.toLowerCase() === 'agent' || title.toLowerCase() === 'tool') &&
        requirements && (
          <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950/50 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Requirements
              </h2>
            </div>
            <AgentRequirements
              requirements={requirements as RequirementProps[]}
            />
          </section>
        )}

      {/* Code Section */}
      {children && (
        <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950/50 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Code className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Agent Code
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                The main implementation code for this {entityTitle}. You can view, copy, and use this code directly in your projects.
              </p>
            </div>
          </div>
          {children}
        </section>
      )}

      {/* Agent JSON Panel */}
      {entityTitle === 'agent' && agentCode && (
        <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950/50 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Agent Metadata (JSON)
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                All metadata and code for this agent, as a JSON object. Useful for programmatic use, export, or debugging.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                onClick={() => {
                  const jsonData = JSON.stringify({
                    id,
                    name,
                    title,
                    description,
                    tags,
                    requirements,
                    usecases,
                    language,
                    userId,
                    authorUsername: authorUsername || undefined,
                    createdAt: createdAt || undefined,
                    links,
                    code: agentCode,
                  }, null, 2);
                  copyToClipboard(jsonData);
                }}
                className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors duration-200 border border-zinc-700/50"
                title="Copy JSON to clipboard"
              >
                <Copy size={16} className="text-zinc-200" />
              </button>
              <button
                onClick={() => {
                  const jsonData = JSON.stringify({
                    id,
                    name,
                    title,
                    description,
                    tags,
                    requirements,
                    usecases,
                    language,
                    userId,
                    authorUsername: authorUsername || undefined,
                    createdAt: createdAt || undefined,
                    links,
                    code: agentCode,
                  }, null, 2);
                  downloadFile(jsonData, `${id}.json`, 'application/json');
                  toast.toast({ description: 'Downloaded as JSON file' });
                }}
                className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors duration-200 border border-zinc-700/50"
                title="Download as JSON file"
              >
                <FileDown size={16} className="text-zinc-200" />
              </button>
            </div>
            <pre className="bg-zinc-900 text-green-200 text-xs md:text-sm rounded-lg p-4 overflow-x-auto border border-zinc-800">
              {JSON.stringify({
                id,
                name,
                title,
                description,
                tags,
                requirements,
                usecases,
                language,
                userId,
                authorUsername: authorUsername || undefined,
                createdAt: createdAt || undefined,
                links,
                code: agentCode,
              }, null, 2)}
            </pre>
          </div>
        </section>
      )}

      {/* Prompt Section */}
      {prompt && (
        <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950/50 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Main Prompt
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                Copy this prompt, download it, or export it directly to ChatGPT
                or Claude to use in your conversations.
              </p>
            </div>
          </div>

          <div className="bg-[#00000080] border border-[#f9f9f959] shadow-2xl pt-7 md:p-5 md:py-7 rounded-lg leading-normal overflow-hidden no-scrollbar relative">
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors duration-200 border border-zinc-700/50"
                title="Copy to clipboard"
              >
                <Copy size={20} className="text-zinc-200" />
              </button>
              <div className="relative group">
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors duration-200 border border-zinc-700/50"
                  title="Download options"
                >
                  <FileDown size={20} className="text-zinc-200" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-zinc-800/95 border border-zinc-700/50 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        downloadFile(
                          prompt ?? '',
                          `${name ?? 'prompt'}.txt`,
                          'text/plain',
                        );
                        toast.toast({ description: 'Downloaded as text file' });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as Text (.txt)
                    </button>
                    <button
                      onClick={() => {
                        downloadFile(
                          prompt ?? '',
                          `${name ?? 'prompt'}.md`,
                          'text/markdown',
                        );
                        toast.toast({
                          description: 'Downloaded as markdown file',
                        });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as Markdown (.md)
                    </button>
                    <button
                      onClick={() => {
                        const frameworkCode = `import time
from swarms import Agent

# Put your api key in the .env file like OPENAI_API_KEY=""


# Initialize the agent
agent = Agent(
    agent_name="${name || 'Custom-Agent'}",
    agent_description="""${(description || 'Custom agent for specific tasks').replace(/"""/g, '\"\"\"').replace(/^\n+/, '')}""",
    system_prompt="""${prompt?.replace(/"/g, '\\"') || ''}""",
    max_loops=1,
    model_name="gpt-4o-mini",
    dynamic_temperature_enabled=True,
    output_type="all",
    max_tokens=16384,
    # dashboard=True
)

# Run the agent with your task
out = agent.run("Your task description here")

time.sleep(10)
print(out)`;
                        downloadFile(
                          frameworkCode,
                          `${name ?? 'prompt'}_framework.py`,
                          'text/python',
                        );
                        toast.toast({
                          description: 'Downloaded as Framework Python file',
                        });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as Framework (.py)
                    </button>
                    <button
                      onClick={() => {
                        const apiCode = `import os
import requests
from dotenv import load_dotenv

# Load API key from environment
load_dotenv()
API_KEY = os.getenv("SWARMS_API_KEY")
BASE_URL = "https://api.swarms.world"

# Configure headers with your API key
headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def run_single_agent(agent_config, task):
    """
    Run a single agent with the AgentCompletion format.
    """
    payload = {
        "agent_config": agent_config,
        "task": task
    }

    try:
        response = requests.post(
            f"{BASE_URL}/v1/agent/completions", 
            headers=headers, 
            json=payload
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None

# Agent configuration using this prompt
agent_config = {
    "agent_name": "${name || 'Custom-Agent'}",
    "description": """${(description || 'Custom agent for specific tasks').replace(/"""/g, '\"\"\"').replace(/^\n+/, '')}""",
    "system_prompt": """${prompt?.replace(/"/g, '\\"') || ''}""",
    "model_name": "gpt-4o",
    "role": "worker",
    "max_loops": 2,
    "max_tokens": 8192,
    "temperature": 0.5,
    "auto_generate_prompt": False,
}

# Your task
task = "Your task description here"

# Run the agent
result = run_single_agent(agent_config, task)
print(result)`;
                        downloadFile(
                          apiCode,
                          `${name ?? 'prompt'}_api.py`,
                          'text/python',
                        );
                        toast.toast({
                          description: 'Downloaded as API Python file',
                        });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as API (.py)
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-7">
              <Tabs
                className="flex flex-col gap-4 w-auto"
                defaultValue="preview"
                onValueChange={(value) => setSelectedTab(value)}
              >
                <TabsList className="flex justify-start w-auto">
                  <TabsTrigger
                    value={'preview'}
                    className="transition-colors duration-200 cursor-pointer hover:bg-zinc-800/80 hover:text-white focus:bg-zinc-900/90 focus:text-white active:bg-zinc-900/90 px-4 py-2 rounded-md text-base md:text-sm"
                  >
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value={'md'}
                    className="transition-colors duration-200 cursor-pointer hover:bg-zinc-800/80 hover:text-white focus:bg-zinc-900/90 focus:text-white active:bg-zinc-900/90 px-4 py-2 rounded-md text-base md:text-sm"
                  >
                    Markdown
                  </TabsTrigger>
                  <TabsTrigger
                    value={'txt'}
                    className="transition-colors duration-200 cursor-pointer hover:bg-zinc-800/80 hover:text-white focus:bg-zinc-900/90 focus:text-white active:bg-zinc-900/90 px-4 py-2 rounded-md text-base md:text-sm"
                  >
                    Text
                  </TabsTrigger>
                  <TabsTrigger
                    value={'framework'}
                    className="transition-colors duration-200 cursor-pointer hover:bg-zinc-800/80 hover:text-white focus:bg-zinc-900/90 focus:text-white active:bg-zinc-900/90 px-4 py-2 rounded-md text-base md:text-sm"
                  >
                    Framework
                  </TabsTrigger>
                  <TabsTrigger
                    value={'api'}
                    className="transition-colors duration-200 cursor-pointer hover:bg-zinc-800/80 hover:text-white focus:bg-zinc-900/90 focus:text-white active:bg-zinc-900/90 px-4 py-2 rounded-md text-base md:text-sm"
                  >
                    API
                  </TabsTrigger>
                </TabsList>
                <div className="p-4 rounded-xl overflow-hidden !bg-gray-500/10">
                  <TabsContent className="m-0" value={'preview'}>
                    <SyntaxHighlighter
                      PreTag={CustomPre}
                      style={dracula}
                      language={language || 'markdown'}
                    >
                      {prompt}
                    </SyntaxHighlighter>
                  </TabsContent>
                  <TabsContent className="m-0" value={'md'}>
                    <Markdown className="prose" remarkPlugins={[remarkGfm]}>
                      {prompt}
                    </Markdown>
                  </TabsContent>
                  <TabsContent className="m-0" value={'txt'}>
                    <pre className="whitespace-pre-wrap">
                      {stripMarkdown(prompt)}
                    </pre>
                  </TabsContent>
                  <TabsContent className="m-0" value={'framework'}>
                    <SyntaxHighlighter
                      PreTag={CustomPre}
                      style={dracula}
                      language="python"
                    >
                      {`import time
from swarms import Agent

# Put your api key in the .env file like OPENAI_API_KEY=""


# Initialize the agent
agent = Agent(
    agent_name="${name || 'Custom-Agent'}",
    agent_description="""${(description || 'Custom agent for specific tasks').replace(/"""/g, '\"\"\"').replace(/^\n+/, '')}""",
    system_prompt="""${prompt?.replace(/"/g, '\\"') || ''}""",
    max_loops=1,
    model_name="gpt-4o-mini",
    dynamic_temperature_enabled=True,
    output_type="all",
    max_tokens=16384,
    # dashboard=True
)

# Run the agent with your task
out = agent.run("Your task description here")

time.sleep(10)
print(out)`}
                    </SyntaxHighlighter>
                  </TabsContent>
                  <TabsContent className="m-0" value={'api'}>
                    <SyntaxHighlighter
                      PreTag={CustomPre}
                      style={dracula}
                      language="python"
                    >
                      {`import os
import requests
from dotenv import load_dotenv

# Load API key from environment
load_dotenv()
API_KEY = os.getenv("SWARMS_API_KEY")
BASE_URL = "https://api.swarms.world"

# Configure headers with your API key
headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def run_single_agent(agent_config, task):
    """
    Run a single agent with the AgentCompletion format.
    """
    payload = {
        "agent_config": agent_config,
        "task": task
    }

    try:
        response = requests.post(
            f"{BASE_URL}/v1/agent/completions", 
            headers=headers, 
            json=payload
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None

# Agent configuration using this prompt
agent_config = {
    "agent_name": "${name || 'Custom-Agent'}",
    "description": """${(description || 'Custom agent for specific tasks').replace(/"""/g, '\"\"\"').replace(/^\n+/, '')}""",
    "system_prompt": """${prompt?.replace(/"/g, '\\"') || ''}""",
    "model_name": "gpt-4o",
    "role": "worker",
    "max_loops": 2,
    "max_tokens": 8192,
    "temperature": 0.5,
    "auto_generate_prompt": False,
}

# Your task
task = "Your task description here"

# Run the agent
result = run_single_agent(agent_config, task)
print(result)`}
                    </SyntaxHighlighter>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </section>
      )}

      {/* Chat Section for Prompts */}
      {entityTitle === 'prompt' && prompt && (
        <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950/50 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Prompt Agent Chat
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                Interact with this prompt in real-time. The AI will respond
                based on the system prompt.
              </p>
            </div>
          </div>
          <ChatComponent promptId={id ?? ''} systemPrompt={prompt} />
        </section>
      )}

      {/* Comments Section */}
      {id && (
        <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-950/50 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Comments & Discussion
            </h2>
          </div>
          <CommentList modelId={id} title={title} />
        </section>
      )}

      {/* Recommendations Section */}
      {id && title && (
        <RecommendedItems 
          currentId={id} 
          type={title.toLowerCase() as 'prompt' | 'agent' | 'tool'} 
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShowShareModalOpen}
        onClose={handleCloseModal}
        link={pathName ?? ''}
      />
    </div>
  );
}
