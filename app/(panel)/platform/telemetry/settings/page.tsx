'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  fetchAvailableModels,
  fetchAvailableSwarmTypes,
} from '@/shared/utils/api/telemetry/api';
import {
  AlertCircle,
  Database,
  Loader2,
  RefreshCcw,
  Search,
  Zap,
  Calendar,
  MessageCircle,
  Mail,
  ExternalLink,
  Shield,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/shared/components/ui/table';
import { useAPIKeyContext } from '@/shared/components/ui/apikey.provider';
import { getTruncatedString } from '@/shared/utils/helpers';

export default function SettingsPage() {
  const [models, setModels] = useState<string[]>([]);
  const [swarmTypes, setSwarmTypes] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingSwarmTypes, setIsLoadingSwarmTypes] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [swarmTypesError, setSwarmTypesError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [swarmTypeSearchQuery, setSwarmTypeSearchQuery] = useState('');
  const { apiKey } = useAPIKeyContext();

  // Check if API key exists on component mount
  useEffect(() => {
    setHasApiKey(!!apiKey);
  }, [apiKey]);

  const fetchModels = async () => {
    setIsLoadingModels(true);
    setModelsError(null);
    try {
      const data = await fetchAvailableModels(apiKey);
      setModels(data);
    } catch (error) {
      console.error('Error in fetchModels:', error);
      setModelsError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch available models',
      );
      // Don't set models here - the API function will return fallback data
    } finally {
      setIsLoadingModels(false);
    }
  };

  const fetchSwarmTypes = async () => {
    setIsLoadingSwarmTypes(true);
    setSwarmTypesError(null);
    try {
      const data = await fetchAvailableSwarmTypes(apiKey);
      setSwarmTypes(data);
    } catch (error) {
      console.error('Error in fetchSwarmTypes:', error);
      setSwarmTypesError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch available swarm types',
      );
      // Don't set swarm types here - the API function will return fallback data
    } finally {
      setIsLoadingSwarmTypes(false);
    }
  };

  // Filter models based on search query
  const filteredModels = models.filter((model) =>
    model.toLowerCase().includes(modelSearchQuery.toLowerCase()),
  );

  // Filter swarm types based on search query
  const filteredSwarmTypes = swarmTypes.filter((type) =>
    type.toLowerCase().includes(swarmTypeSearchQuery.toLowerCase()),
  );

  const rateLimitsData = [
    {
      type: 'Requests per Minute',
      freeTier: '100',
      premiumTier: '2,000',
      timeWindow: '1 minute',
      description: 'Maximum API calls per minute',
    },
    {
      type: 'Requests per Hour',
      freeTier: '50',
      premiumTier: '10,000',
      timeWindow: '1 hour',
      description: 'Maximum API calls per hour',
    },
    {
      type: 'Requests per Day',
      freeTier: '1,200',
      premiumTier: '100,000',
      timeWindow: '24 hours',
      description: 'Maximum API calls per day',
    },
    {
      type: 'Tokens per Agent',
      freeTier: '200,000',
      premiumTier: '2,000,000',
      timeWindow: 'Per request',
      description: 'Maximum tokens per agent',
    },
    {
      type: 'Prompt Length',
      freeTier: '200,000',
      premiumTier: '200,000',
      timeWindow: 'Per request',
      description: 'Maximum input tokens per request',
    },
    {
      type: 'Batch Size',
      freeTier: '10',
      premiumTier: '10',
      timeWindow: 'Per request',
      description: 'Maximum agents in batch requests',
    },
    {
      type: 'IP-based Fallback',
      freeTier: '100',
      premiumTier: '100',
      timeWindow: '60 seconds',
      description: 'For requests without API keys',
    },
  ];

  return (
    <div className="space-y-8 p-6 border border-white/20 rounded-lg bg-background/50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Configure your Swarms platform settings and view API information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-white/20 bg-card hover:border-white/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-foreground/60" />
              Available Models
            </CardTitle>
            <CardDescription>
              View all available language models for your swarms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <Button
                onClick={fetchModels}
                disabled={isLoadingModels || !hasApiKey}
                className="bg-foreground text-background hover:bg-foreground/90 border border-white/20"
              >
                {isLoadingModels ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Models...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Fetch Available Models
                  </>
                )}
              </Button>

              {models.length > 0 && (
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search models..."
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    className="pl-8 bg-background border border-white/20"
                  />
                </div>
              )}
            </div>

            {!hasApiKey && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-500/10 p-3 rounded-md border border-amber-500/20">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">Please configure your API key first</p>
              </div>
            )}

            {modelsError && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{modelsError}</p>
              </div>
            )}

            <div className="h-[250px] overflow-y-auto">
              {models.length > 0 ? (
                <div className="border border-white/20 rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-white/5">
                        <TableHead className="text-sm font-medium">
                          Model Name
                        </TableHead>
                        <TableHead className="text-sm font-medium text-right">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredModels.length > 0 ? (
                        filteredModels.map((model, index) => (
                          <TableRow
                            key={index}
                            className="border-white/20 hover:bg-white/5"
                          >
                            <TableCell className="font-medium text-sm">
                              {getTruncatedString(model, 60)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-500"
                              >
                                Available
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            No models found matching your search
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">No models loaded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/20 bg-card hover:border-white/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-foreground/60" />
              Available Swarm Types
            </CardTitle>
            <CardDescription>
              View all available swarm types for your configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <Button
                onClick={fetchSwarmTypes}
                disabled={isLoadingSwarmTypes || !hasApiKey}
                className="bg-foreground text-background hover:bg-foreground/90 border border-white/20"
              >
                {isLoadingSwarmTypes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Types...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Fetch Available Types
                  </>
                )}
              </Button>

              {swarmTypes.length > 0 && (
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search types..."
                    value={swarmTypeSearchQuery}
                    onChange={(e) => setSwarmTypeSearchQuery(e.target.value)}
                    className="pl-8 bg-background border border-white/20"
                  />
                </div>
              )}
            </div>

            {!hasApiKey && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-500/10 p-3 rounded-md border border-amber-500/20">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">Please configure your API key first</p>
              </div>
            )}

            {swarmTypesError && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{swarmTypesError}</p>
              </div>
            )}

            <div className="h-[250px] overflow-y-auto">
              {swarmTypes.length > 0 ? (
                <div className="border border-white/20 rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-white/5">
                        <TableHead className="text-sm font-medium">
                          Swarm Type
                        </TableHead>
                        <TableHead className="text-sm font-medium text-right">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSwarmTypes.length > 0 ? (
                        filteredSwarmTypes.map((type, index) => (
                          <TableRow
                            key={index}
                            className="border-white/20 hover:bg-white/5"
                          >
                            <TableCell className="font-medium text-sm">
                              {getTruncatedString(type, 60)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-500"
                              >
                                Available
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            No swarm types found matching your search
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">No swarm types loaded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limits Section */}
      <Card className="border border-white/20 bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-foreground/60" />
                Rate Limits
              </CardTitle>
              <CardDescription>
                Comprehensive rate limiting system for fair usage and system stability
              </CardDescription>
            </div>
            <Button
              asChild
              variant="outline"
              className="border border-white/20 hover:bg-white/10"
            >
              <a 
                href="https://docs.swarms.ai/getting-started/rate-limits" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Documentation
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-sm font-medium">Rate Limit Type</TableHead>
                  <TableHead className="text-sm font-medium text-center">Free Tier</TableHead>
                  <TableHead className="text-sm font-medium text-center">Premium Tier</TableHead>
                  <TableHead className="text-sm font-medium text-center">Time Window</TableHead>
                  <TableHead className="text-sm font-medium">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateLimitsData.map((limit, index) => (
                  <TableRow
                    key={index}
                    className="border-white/20 hover:bg-white/5"
                  >
                    <TableCell className="font-medium text-sm">
                      {limit.type}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      <Badge variant="outline" className="border-white/20">
                        {limit.freeTier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      <Badge className="bg-foreground text-background">
                        {limit.premiumTier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {limit.timeWindow}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {limit.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Premium Benefits */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-white/20">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Premium Tier Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <span>20x more requests per minute (2,000 vs 100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <span>200x more requests per hour (10,000 vs 50)</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <span>83x more requests per day (100,000 vs 1,200)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <span>10x more tokens per agent (2M vs 200K)</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <Button
                asChild
                className="bg-foreground text-background hover:bg-foreground/90 border border-white/20"
              >
                <a 
                  href="https://swarms.world/platform/account" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Upgrade to Premium - $99/month
                </a>
              </Button>
            </div>
          </div>

          {/* API Endpoint Info */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-white/20">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Check Your Rate Limits
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Use the <code className="bg-background px-2 py-1 rounded text-xs border border-white/20">/v1/rate/limits</code> endpoint to check your current usage:
            </p>
            <div className="bg-background p-3 rounded border border-white/20">
              <code className="text-xs text-muted-foreground">
                curl -H &quot;x-api-key: your-api-key&quot; https://api.swarms.world/v1/rate/limits
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-white/20 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-foreground/60" />
            Technical Support
          </CardTitle>
          <CardDescription>
            Get help with Swarms platform and technical issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Private Call Booking */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-foreground/60" />
                <h3 className="font-medium">Book Private Call</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Schedule a one-on-one technical support session with our team
              </p>
              <Button
                asChild
                className="w-full bg-foreground text-background hover:bg-foreground/90 border border-white/20"
              >
                <a 
                  href="https://cal.com/swarms/swarms-technical-support" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Book Support Call
                </a>
              </Button>
            </div>

            {/* Discord Community */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-foreground/60" />
                <h3 className="font-medium">Discord Community</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Join our Discord community for help, discussions, and updates
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full border border-white/20 hover:bg-white/10"
              >
                <a 
                  href="https://discord.gg/EamjgSaEQf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Join Discord
                </a>
              </Button>
            </div>

            {/* Email Support */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-foreground/60" />
                <h3 className="font-medium">Email Support</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Contact us directly via email for technical assistance
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full border border-white/20 hover:bg-white/10"
              >
                <a 
                  href="mailto:kye@swarms.world"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  kye@swarms.world
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
