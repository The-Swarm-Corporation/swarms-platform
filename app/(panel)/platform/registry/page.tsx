'use client';

import { useState, useEffect } from 'react';
import { Search, Grid3X3, List, Filter, ChevronDown, Star, Users, Calendar, Tag, Database, DollarSign, Plus, GitBranch } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { trpc } from '@/shared/utils/trpc/trpc';
import BookmarkButton from '@/shared/components/bookmark-button';
import AddAgentModal from '@/modules/platform/explorer/components/add-agent-modal';
import BulkAddAgentsModal from '@/modules/platform/explorer/components/bulk-add-agents-modal';

// Industry categories for filtering
const industryCategories = [
  { value: 'all', label: 'All Industries' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'customer-support', label: 'Customer Support' },
  { value: 'research', label: 'Research' },
  { value: 'public-safety', label: 'Public Safety' },
  { value: 'other', label: 'Other' },
];

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

// Price filter options
const priceFilterOptions = [
  { value: 'all', label: 'All Prices' },
  { value: 'free', label: 'Free Only' },
  { value: 'paid', label: 'Paid Only' },
];

// Agents per page options
const agentsPerPageOptions = [
  { value: 10, label: '10 per page' },
  { value: 20, label: '20 per page' },
  { value: 50, label: '50 per page' },
  { value: 100, label: '100 per page' },
];

// Get unique users for filtering
const getUniqueUsers = (agents: any[]) => {
  const users = new Map();
  agents.forEach(agent => {
    if (agent.user?.username || agent.user?.full_name) {
      const username = agent.user.username || agent.user.full_name;
      const userId = agent.user.id;
      if (!users.has(userId)) {
        users.set(userId, { id: userId, username, full_name: agent.user.full_name });
      }
    }
  });
  return Array.from(users.values()).sort((a, b) => a.username.localeCompare(b.username));
};

const RegistryPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [agentsPerPage, setAgentsPerPage] = useState(20);
  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  const [bulkAddAgentsModalOpen, setBulkAddAgentsModalOpen] = useState(false);

  // Helper function to get agent URL
  const getAgentUrl = (agent: any) => {
    if (agent.statusType === 'publicChat') {
      return `/chat/${agent.share_id}`;
    }
    return `/agent/${agent.id}`;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch agents data
  const { data: agentsData, isLoading, refetch } = trpc.explorer.getExplorerData.useQuery({
    includePrompts: false,
    includeTools: false,
    limit: 1000, // Fetch a large number to get all agents for proper filtering
    offset: 0,
    search: searchQuery,
    category: selectedIndustry === 'all' ? undefined : selectedIndustry,
  });

  // Fetch user data for agents
  const agentIds = agentsData?.agents?.map((agent: any) => agent.user_id).filter(Boolean) || [];
  const { data: usersData } = trpc.main.getUsersByIds.useQuery(
    { userIds: agentIds },
    { enabled: agentIds.length > 0 }
  );

  // Combine agents with user data
  const agentsWithUsers = agentsData?.agents?.map((agent: any) => {
    const user = usersData?.find((u: any) => u.id === agent.user_id);
    return {
      ...agent,
      user: user || { username: 'Anonymous', full_name: 'Anonymous' },
    };
  }) || [];

  const agents = agentsWithUsers;

  // Get unique users for filtering
  const uniqueUsers = getUniqueUsers(agents || []);

  // Filter and sort agents
  const filteredAndSortedAgents = (agents || [])
    .filter((agent: any) => {
      if (!agent) return false;
      
      // Search filter
      if (searchQuery) {
        const name = agent.name?.toLowerCase() || '';
        const description = agent.description?.toLowerCase() || '';
        const username = (agent.user?.username || agent.user?.full_name || '').toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        if (!name.includes(searchLower) && !description.includes(searchLower) && !username.includes(searchLower)) {
          return false;
        }
      }
      
      // Price filter
      if (priceFilter === 'free' && agent.is_free !== true) {
        return false;
      }
      if (priceFilter === 'paid' && agent.is_free !== false) {
        return false;
      }
      
      // User filter
      if (userFilter !== 'all' && agent.user?.id !== userFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'oldest':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
          return (b.rating || 0) - (a.rating || 0); // Use rating as popularity metric
        default:
          return 0;
      }
    });

  // Pagination
  const totalAgentsInDB = agentsData?.totalAgents || 0;
  const filteredAgentsCount = filteredAndSortedAgents.length;
  const totalPages = Math.ceil(filteredAgentsCount / agentsPerPage);
  const startIndex = (currentPage - 1) * agentsPerPage;
  const endIndex = startIndex + agentsPerPage;
  const paginatedAgents = filteredAndSortedAgents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedIndustry, priceFilter, userFilter, sortBy]);

    const AgentCard = ({ agent }: { agent: any }) => (
    <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm flex flex-col h-full">
      {/* Agent Image - Only render if image exists */}
      {agent.image_url && (
        <div className="relative h-24 sm:h-28 overflow-hidden rounded-t-lg flex-shrink-0">
          <Image
            src={agent.image_url}
            alt={agent.name || 'Agent'}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <CardHeader className={`pb-2 p-3 sm:p-4 ${!agent.image_url ? 'pt-4' : ''} flex-shrink-0`}>
        <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                <AvatarImage src={agent.user?.avatar_url || agent.user?.avatar} />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                  {(agent.user?.username || agent.user?.full_name || 'A')?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
                          <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <CardTitle className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                    {agent.name || 'Unnamed Agent'}
                  </CardTitle>
                  {agent.is_free !== undefined && (
                    <Badge 
                      variant={agent.is_free ? "secondary" : "default"}
                      className={`text-xs px-1.5 py-0.5 ${
                        agent.is_free 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <DollarSign className="h-2.5 w-2.5 mr-0.5" />
                      {agent.is_free ? 'Free' : 'Paid'}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  by {agent.user?.full_name || agent.user?.username || 'Anonymous'}
                </CardDescription>
              </div>
          </div>

        </div>
      </CardHeader>
      <CardContent className="pt-0 p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {agent.description || 'No description available'}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {Array.isArray(agent.tags) && agent.tags.slice(0, 2).map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                {tag}
              </Badge>
            ))}
            {Array.isArray(agent.tags) && agent.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-gray-200 dark:border-gray-700">
                +{agent.tags.length - 2} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{agent.rating?.toFixed(1) || 'N/A'}</span>
              </div>
              {!agent.is_free && agent.price_usd && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${agent.price_usd}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {/* View Details Button and Bookmark - Always at bottom */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8 text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={() => {
                const agentUrl = getAgentUrl(agent);
                window.open(agentUrl, '_blank');
              }}
            >
              Get Started
            </Button>
            <BookmarkButton
              id={agent.id}
              type="agent"
              name={agent.name || 'Unnamed Agent'}
              description={agent.description}
              username={agent.user?.username || agent.user?.full_name}
              created_at={agent.created_at}
              tags={Array.isArray(agent.tags) ? agent.tags : []}
              className="h-8 px-2 text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

    const AgentTableRow = ({ agent }: { agent: any }) => (
    <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-gray-200 dark:border-gray-800">
      <TableCell className="font-medium p-2 sm:p-3 lg:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
            <AvatarImage src={agent.user?.avatar_url || agent.user?.avatar} />
            <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              {(agent.user?.username || agent.user?.full_name || 'A')?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <div className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base truncate">{agent.name || 'Unnamed Agent'}</div>
              {agent.is_free !== undefined && (
                <Badge 
                  variant={agent.is_free ? "secondary" : "default"}
                  className={`text-xs px-1 sm:px-2 py-0.5 ${
                    agent.is_free 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">{agent.is_free ? 'Free' : 'Paid'}</span>
                  <span className="sm:hidden">{agent.is_free ? 'F' : 'P'}</span>
                </Badge>
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
              <span className="sm:hidden">by {agent.user?.username || agent.user?.full_name || 'Anonymous'}</span>
              <a 
                href={getAgentUrl(agent)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline hidden sm:inline"
              >
                View Agent
              </a>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="p-2 sm:p-3 lg:p-4 hidden sm:table-cell">
        <div className="text-xs sm:text-sm text-gray-900 dark:text-white">
          {agent.user?.username || agent.user?.full_name || 'Anonymous'}
        </div>
      </TableCell>
      <TableCell className="max-w-xs p-2 sm:p-3 lg:p-4 hidden lg:table-cell">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
          {agent.description || 'No description available'}
        </p>
      </TableCell>
      <TableCell className="p-2 sm:p-3 lg:p-4 hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {Array.isArray(agent.tags) && agent.tags.slice(0, 2).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {tag}
            </Badge>
          ))}
          {Array.isArray(agent.tags) && agent.tags.length > 2 && (
            <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 border-gray-200 dark:border-gray-700">
              +{agent.tags.length - 2}
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell className="text-center p-2 sm:p-3 lg:p-4">
        <div className="flex items-center justify-center space-x-1">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs sm:text-sm">{agent.rating?.toFixed(1) || 'N/A'}</span>
        </div>
      </TableCell>
      <TableCell className="text-center p-2 sm:p-3 lg:p-4 hidden sm:table-cell">
        <div className="flex items-center justify-center space-x-1">
          {agent.is_free ? (
            <Badge variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              Free
            </Badge>
          ) : agent.price_usd ? (
            <div className="flex items-center space-x-1">
              <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="text-xs sm:text-sm">${agent.price_usd}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">N/A</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right p-2 sm:p-3 lg:p-4">
        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900"
            onClick={() => {
              const agentUrl = getAgentUrl(agent);
              window.open(agentUrl, '_blank');
            }}
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Start</span>
          </Button>
          <BookmarkButton
            id={agent.id}
            type="agent"
            name={agent.name || 'Unnamed Agent'}
            description={agent.description}
            username={agent.user?.username || agent.user?.full_name}
            created_at={agent.created_at}
            tags={Array.isArray(agent.tags) ? agent.tags : []}
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900"
          />
        </div>
      </TableCell>
    </TableRow>
  );

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Agent Registry
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                Discover and explore AI agents from the Swarms community
              </p>
            </div>
            
            {/* Search */}
            <div className="mb-2 sm:mb-4">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search agents by name, description, username, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 sm:h-10 lg:h-12 text-sm sm:text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-black"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-4">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-full h-9 sm:h-10 lg:h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-xs sm:text-sm">
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full h-9 sm:h-10 lg:h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-xs sm:text-sm">
                  <SelectValue placeholder="Price Filter" />
                </SelectTrigger>
                <SelectContent>
                  {priceFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-full h-9 sm:h-10 lg:h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-9 sm:h-10 lg:h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Agents</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalAgentsInDB}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Active Vendors</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(agents.filter((a: any) => a?.user?.id).map((a: any) => a.user.id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Market Value</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    ${agents
                      .filter((a: any) => !a?.is_free && a?.price_usd)
                      .reduce((sum: number, a: any) => sum + (a.price_usd || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle and Add Agent */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 flex-1 sm:flex-none"
            >
              <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 flex-1 sm:flex-none"
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>
          
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                {filteredAndSortedAgents.length} agents found
              </p>
            <div className="flex gap-1 sm:gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setAddAgentModalOpen(true)}
                className="h-8 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
              >
                <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Agent</span>
                <span className="sm:hidden">Add</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkAddAgentsModalOpen(true)}
                className="h-8 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-1 sm:flex-none"
              >
                <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Bulk Import</span>
                <span className="sm:hidden">Import</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : filteredAgentsCount === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <Database className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                No agents found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {paginatedAgents.map((agent: any, index: number) => (
              <AgentCard key={agent.id || index} agent={agent} />
            ))}
          </div>
        ) : (
          <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-800">
                    <TableHead className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Agent</TableHead>
                    <TableHead className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Username</TableHead>
                    <TableHead className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">Description</TableHead>
                    <TableHead className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Tags</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Rating</TableHead>
                    <TableHead className="text-center text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Price</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAgents.map((agent: any, index: number) => (
                    <AgentTableRow key={agent.id || index} agent={agent} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Pagination Controls */}
        {filteredAgentsCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6 lg:mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Show:</span>
                <Select value={agentsPerPage.toString()} onValueChange={(value) => setAgentsPerPage(parseInt(value))}>
                  <SelectTrigger className="w-20 sm:w-24 h-8 text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agentsPerPageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAgentsCount)} of {filteredAgentsCount} agents
              </span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2 sm:px-3 text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  if (totalPages <= 5) {
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  
                  // Show first page, current page, and last page with ellipsis
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  
                  // Show ellipsis
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="px-1 sm:px-2 text-gray-400 text-xs">
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2 sm:px-3 text-xs border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Agent Modal */}
      <AddAgentModal
        onAddSuccessfully={() => {
          setAddAgentModalOpen(false);
          refetch();
        }}
        modelType="agent"
        isOpen={addAgentModalOpen}
        onClose={() => setAddAgentModalOpen(false)}
      />
      
      {/* Bulk Add Agents Modal */}
      <BulkAddAgentsModal
        onAddSuccessfully={() => {
          setBulkAddAgentsModalOpen(false);
          refetch();
        }}
        isOpen={bulkAddAgentsModalOpen}
        onClose={() => setBulkAddAgentsModalOpen(false)}
      />
    </div>
  );
};

export default RegistryPage; 