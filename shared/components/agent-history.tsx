'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { ChevronDown, ChevronUp, Search, Settings, Shield, Terminal, Trash2 } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import type { User } from '@supabase/supabase-js'

import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import Input from './ui/Input/Input'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  Collapsible,
  CollapsibleContent,
} from './ui/collapsible'
import { Badge } from './ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Agent {
  id: string
  data: any
  created_at: string
  swarms_api_key: string
  source_ip: string
  status: string
  time_created: string
}

interface SwarmApiKey {
  id: string
  user_id: string
  key: string
  name: string
  limit_credit_dollar: number
  is_deleted: boolean
}

interface AgentsDashboardProps {
  user: User | null
}

export default function AgentsDashboard({ user }: AgentsDashboardProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [apiKeys, setApiKeys] = useState<SwarmApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch] = useDebounce(searchQuery, 500)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const itemsPerPage = 10

  // Fetch API keys for the current user
  const fetchApiKeys = useCallback(async () => {
    if (!user) return
    
    try {
      const { data: keys, error } = await supabase
        .from('swarms_cloud_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)

      if (error) throw error
      setApiKeys(keys || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
    }
  }, [user])

  // Fetch agents with pagination, search, and filtering
  const fetchAgents = useCallback(async () => {
    if (!user || !apiKeys.length) {
      setAgents([])
      setTotalPages(0)
      return
    }

    try {
      setLoading(true)
      const userApiKeys = apiKeys.map(k => k.key)
      
      let query = supabase
        .from('agents')
        .select('*', { count: 'exact' })
        .in('swarms_api_key', userApiKeys)
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
        .order('created_at', { ascending: false })

      if (debouncedSearch) {
        query = query.or(
          `id.ilike.%${debouncedSearch}%,source_ip.ilike.%${debouncedSearch}%,status.ilike.%${debouncedSearch}%`
        )
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, count, error } = await query

      if (error) throw error

      setAgents(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, statusFilter, user, apiKeys])

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  // Set up real-time subscription for the current user's agents
  useEffect(() => {
    if (!user || !apiKeys.length) return

    const userApiKeys = apiKeys.map(k => k.key)
    
    const subscription = supabase
      .channel('agents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
          filter: `swarms_api_key=in.(${userApiKeys.join(',')})`,
        },
        () => {
          fetchAgents()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAgents, user, apiKeys])

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id)
    } else {
      newExpandedRows.add(id)
    }
    setExpandedRows(newExpandedRows)
  }

  const deleteAgent = async (id: string) => {
    if (!user) return
    
    try {
      const agent = agents.find(a => a.id === id)
      if (!agent) return
      
      // Verify the agent belongs to the user through API key
      const hasAccess = apiKeys.some(k => k.key === agent.swarms_api_key)
      if (!hasAccess) {
        throw new Error('Unauthorized')
      }

      const { error } = await supabase.from('agents').delete().eq('id', id)
      if (error) throw error
      await fetchAgents()
    } catch (error) {
      console.error('Error deleting agent:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Card className="border-red-800 bg-zinc-900 p-6 text-white">
          <CardContent>
            <p>Please sign in to view your agents.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <Card className="border-red-800 bg-zinc-900 text-white">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-red-500">Agent Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex w-64 items-center rounded-md border border-red-800 bg-zinc-800 px-3">
                <Search className="mr-2 h-4 w-4 text-red-500" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-0"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 border-red-800 bg-zinc-800 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="border-red-800 bg-zinc-800 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-red-800">
            <Table>
              <TableHeader>
                <TableRow className="border-red-800 hover:bg-zinc-800">
                  <TableHead className="text-red-500">Expand</TableHead>
                  <TableHead className="text-red-500">ID</TableHead>
                  <TableHead className="text-red-500">Status</TableHead>
                  <TableHead className="text-red-500">Source IP</TableHead>
                  <TableHead className="text-red-500">Created At</TableHead>
                  <TableHead className="text-red-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-gray-400"
                    >
                      Loading agents...
                    </TableCell>
                  </TableRow>
                ) : agents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-gray-400"
                    >
                      No agents found
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((agent) => (
                    <>
                      <TableRow
                        key={agent.id}
                        className="border-red-800 hover:bg-zinc-800"
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleRow(agent.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            {expandedRows.has(agent.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono">{agent.id}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(agent.status)} text-white`}
                          >
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {agent.source_ip}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(agent.created_at),
                            'MMM d, yyyy HH:mm:ss'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-400"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-400"
                            >
                              <Terminal className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-400"
                              onClick={() => deleteAgent(agent.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-red-800">
                        <TableCell colSpan={6} className="p-0">
                          <Collapsible
                            open={expandedRows.has(agent.id)}
                            className="w-full"
                          >
                            <CollapsibleContent className="space-y-2 px-4 pb-4">
                              <div className="rounded-md bg-zinc-800 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-red-500" />
                                  <span className="font-semibold text-red-500">
                                    API Key:
                                  </span>
                                  <span className="font-mono">
                                    {agent.swarms_api_key}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <span className="font-semibold text-red-500">
                                    Configuration:
                                  </span>
                                </div>
                                <pre className="overflow-auto rounded-md bg-zinc-900 p-4 font-mono text-sm">
                                  {JSON.stringify(agent.data, null, 2)}
                                </pre>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </TableCell>
                      </TableRow>
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-red-800 bg-zinc-800 text-white hover:bg-zinc-700"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-red-800 bg-zinc-800 text-white hover:bg-zinc-700"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

