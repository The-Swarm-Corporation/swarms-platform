'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { RefreshCcw, Search, Download, ChevronLeft, ChevronRight, Filter, Eye, EyeOff, Code, Copy, Check, ChevronDown } from 'lucide-react';
import {
  fetchSwarmLogs,
  type SwarmLog,
} from '@/shared/utils/api/telemetry/api';
import { useAPIKeyContext } from '@/shared/components/ui/apikey.provider';
import { estimateTokenCost } from '@/shared/utils/helpers';
import { getDisplaySwarmName } from '@/shared/components/telemetry/helper';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'completion', label: 'Completion' },
  { value: 'agent-batch-input', label: 'Agent Batch Input' },
  { value: 'swarm-input', label: 'Swarm Input' },
  { value: 'agent-input', label: 'Agent Input' },
];

const PAGE_SIZES = [10, 25, 50, 100];

// JSON Viewer Component
const JSONViewer = ({ data, title }: { data: any; title: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formattedJson = JSON.stringify(data, null, 2);

  return (
    <div className="border border-white/20 rounded-lg bg-background/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 px-2 text-xs hover:bg-white/10"
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3 w-3 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3 w-3" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs hover:bg-white/10"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>
      
      <div className={`overflow-auto ${isExpanded ? 'max-h-96' : 'max-h-32'}`}>
        <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
          {formattedJson}
        </pre>
      </div>
    </div>
  );
};

// Log Detail Modal Component
const LogDetailModal = ({ 
  log, 
  isOpen, 
  onClose 
}: { 
  log: SwarmLog; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-white/20 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Log Details</h2>
            <Button variant="ghost" onClick={onClose} size="sm">
              ✕
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">ID:</span> {log.id}</div>
                  <div><span className="font-medium">Created:</span> {new Date(log.created_at).toLocaleString()}</div>
                  <div><span className="font-medium">Category:</span> {log.category || 'N/A'}</div>
                  <div><span className="font-medium">API Key:</span> {log.api_key ? `${log.api_key.slice(0, 8)}...` : 'N/A'}</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Swarm Info</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {log.data?.swarm_name || 'N/A'}</div>
                  <div><span className="font-medium">Type:</span> {log.data?.swarm_type || 'N/A'}</div>
                  <div><span className="font-medium">Status:</span> {log.data?.status || 'N/A'}</div>
                  <div><span className="font-medium">Description:</span> {log.data?.description || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Full Data JSON */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Complete Log Data</h3>
              <JSONViewer data={log} title="Full Log Entry" />
            </div>

            {/* Data Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Data Section</h3>
              <JSONViewer data={log.data} title="Data Object" />
            </div>

            {/* Usage Section */}
            {log.data?.usage && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Usage Information</h3>
                <JSONViewer data={log.data.usage} title="Usage Data" />
              </div>
            )}

            {/* Metadata Section */}
            {log.data?.metadata && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h3>
                <JSONViewer data={log.data.metadata} title="Metadata" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<SwarmLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Filters and pagination state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showDetailedData, setShowDetailedData] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SwarmLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const { apiKey } = useAPIKeyContext();

  useEffect(() => {
    if (!apiKey) return;

    const loadLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchSwarmLogs(apiKey);

        if (!response.logs || !Array.isArray(response.logs)) {
          throw new Error('Invalid logs data received');
        }

        const validLogs = response.logs.filter((log) => {
          return (
            log.data?.status &&
            typeof log.data?.execution_time === 'number' &&
            typeof log.data?.usage?.total_tokens === 'number' &&
            log.created_at
          );
        });

        const sortedLogs = validLogs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        setLogs(sortedLogs);
      } catch (err) {
        console.error('Error loading logs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load logs');
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [apiKey, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const openLogDetail = (log: SwarmLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const toggleRowExpansion = (logId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(logId)) {
      newExpandedRows.delete(logId);
    } else {
      newExpandedRows.add(logId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Filter logs based on search and category
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        (log.data?.swarm_name || '')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (log.data?.description || '')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (log.data?.task || '')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (log.category || '')
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [logs, search, selectedCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, pageSize]);

  const exportToCSV = () => {
    try {
      const headers = [
        'Swarm Name',
        'Category',
        'Status',
        'Start Time',
        'Duration (s)',
        'Tokens',
        'Cost ($)',
        'Description',
        'Task',
        'Number of Agents',
        'Swarm Type',
        'Full JSON Data',
      ];

      const csvContent = [
        headers.join(','),
        ...filteredLogs.map((log) => {
          const totalCost = log.data?.usage
            ? estimateTokenCost(
                log.data.usage.input_tokens,
                log.data.usage.output_tokens,
              ).totalCost
            : 0;
          const row = [
            log.data?.swarm_name,
            log.category || 'N/A',
            log.data?.status,
            new Date(log?.created_at).toLocaleString(),
            log.data?.execution_time?.toFixed(2),
            log.data?.usage?.total_tokens.toLocaleString(),
            totalCost,
            `"${(log.data.description || '').replace(/"/g, '""')}"`,
            `"${(log.data.task || '').replace(/"/g, '""')}"`,
            log.data?.number_of_agents || 0,
            log.data?.swarm_type || 'N/A',
            `"${JSON.stringify(log).replace(/"/g, '""')}"`,
          ];
          return row.join(',');
        }),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `swarm-history-${new Date().toISOString().split('T')[0]}.csv`,
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV file');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 border border-white/20 rounded-lg bg-background/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-[400px] bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 bg-destructive/5 border border-white/20">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error Loading History</h3>
            <p className="mb-4 text-sm">{error}</p>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="border border-white/20 text-destructive hover:bg-destructive/10"
              size="sm"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-6 bg-card border border-white/20">
          <p className="text-muted-foreground text-center">
            No execution history found
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 border border-white/20 rounded-lg bg-background/50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Execution History</h1>
        <p className="text-sm text-muted-foreground mt-2">
          View and analyze past swarm executions with full JSON data access
        </p>
      </div>

      <Card className="border border-white/20 bg-card">
        <div className="p-6 border-b border-white/20">
          <div className="flex flex-col gap-4">
            {/* Search and Export Row */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by swarm name, description, task, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-background border border-white/20"
                />
              </div>
              <Button
                variant="outline"
                className="border border-white/20 hover:bg-white/10"
                onClick={exportToCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-background border border-white/20">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-32 bg-background border border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedData(!showDetailedData)}
                className="border border-white/20 hover:bg-white/10"
              >
                {showDetailedData ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Show Details
                  </>
                )}
              </Button>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} results
              {selectedCategory !== 'all' && ` in category: ${CATEGORIES.find(c => c.value === selectedCategory)?.label}`}
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableHead className="text-sm font-medium w-8"></TableHead>
              <TableHead className="text-sm font-medium">Swarm Name</TableHead>
              <TableHead className="text-sm font-medium">Category</TableHead>
              <TableHead className="text-sm font-medium">Status</TableHead>
              <TableHead className="text-sm font-medium">Start Time</TableHead>
              <TableHead className="text-sm font-medium">Duration</TableHead>
              <TableHead className="text-sm font-medium">Tokens</TableHead>
              <TableHead className="text-sm font-medium">Cost</TableHead>
              {showDetailedData && (
                <>
                  <TableHead className="text-sm font-medium">Task</TableHead>
                  <TableHead className="text-sm font-medium">Agents</TableHead>
                  <TableHead className="text-sm font-medium">Type</TableHead>
                </>
              )}
              <TableHead className="text-sm font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs?.map((log) => {
              const swarmName = getDisplaySwarmName(
                log?.data?.swarm_name,
                log?.data?.description,
              );
              const { totalCost } = estimateTokenCost(
                log.data?.usage?.input_tokens,
                log.data?.usage?.output_tokens,
              );
              const isExpanded = expandedRows.has(log.id);
              
              return (
                <>
                  <TableRow
                    key={log.id}
                    className="border-white/20 hover:bg-white/5"
                  >
                    <TableCell className="w-8 p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(log.id)}
                        className="h-6 w-6 p-0 hover:bg-white/10"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {swarmName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {log.category || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          log.data.status === 'success'
                            ? 'border-green-500 text-green-500'
                            : 'border-destructive text-destructive'
                        }
                      >
                        {log.data.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">{log.data?.execution_time.toFixed(2)}s</TableCell>
                    <TableCell className="text-sm">
                      {log.data?.usage?.total_tokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">${totalCost.toFixed(4)}</TableCell>
                    {showDetailedData && (
                      <>
                        <TableCell className="text-sm max-w-xs truncate" title={log.data?.task}>
                          {log.data?.task || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.data?.number_of_agents || 0}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.data?.swarm_type || 'N/A'}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLogDetail(log)}
                          className="h-7 px-2 text-xs border border-white/20 hover:bg-white/10"
                        >
                          <Code className="mr-1 h-3 w-3" />
                          Modal
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded JSON Data Row */}
                  {isExpanded && (
                    <TableRow key={`${log.id}-expanded`} className="border-white/20">
                      <TableCell colSpan={showDetailedData ? 12 : 9} className="p-0">
                        <div className="bg-background/30 border-t border-white/20 p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-foreground">JSON Data Configuration</h4>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                                  }}
                                  className="h-6 px-2 text-xs hover:bg-white/10"
                                >
                                  <Copy className="mr-1 h-3 w-3" />
                                  Copy All
                                </Button>
                              </div>
                            </div>
                            
                            {/* Main Data Section */}
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground mb-2">Data Object</h5>
                              <div className="bg-background/50 border border-white/20 rounded p-3 max-h-64 overflow-auto">
                                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
                                  {JSON.stringify(log.data, null, 2)}
                                </pre>
                              </div>
                            </div>
                            
                            {/* Usage Section */}
                            {log.data?.usage && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2">Usage Information</h5>
                                <div className="bg-background/50 border border-white/20 rounded p-3 max-h-48 overflow-auto">
                                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
                                    {JSON.stringify(log.data.usage, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                            
                            {/* Metadata Section */}
                            {log.data?.metadata && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground mb-2">Metadata</h5>
                                <div className="bg-background/50 border border-white/20 rounded p-3 max-h-48 overflow-auto">
                                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
                                    {JSON.stringify(log.data.metadata, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border border-white/20 hover:bg-white/10"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0 border border-white/20 hover:bg-white/10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border border-white/20 hover:bg-white/10"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
}
