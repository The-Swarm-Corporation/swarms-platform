"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs"
import { SwarmComparison } from "@/shared/components/telemetry/swarm-comparison-chart"
import { UsageOverview } from "@/shared/components/telemetry/usage-overview"
import { SuccessRateChart } from "@/shared/components/telemetry/success-rate-chart"
import { CostAnalysis } from "@/shared/components/telemetry/cost-analysis"
import { AgentDistribution } from "@/shared/components/telemetry/agent-distribution"
import { Button } from "@/shared/components/ui/button"
import { Calendar, Download, Filter, Share2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Calendar as CalendarComponent } from "@/shared/components/ui/calendar"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"

export function EnterpriseAnalytics() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "custom">("30d")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-600">Enterprise Analytics</h2>
          <p className="text-zinc-400">Comprehensive analytics and insights for your swarm operations</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          )}

          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="swarms">Swarms</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <UsageOverview />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SuccessRateChart />
            <CostAnalysis />
          </div>

          <SwarmComparison limit={5} />
        </TabsContent>

        <TabsContent value="swarms" className="space-y-6 mt-6">
          <SwarmComparison />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Swarm Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for your swarms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-500">Average Execution Time</p>
                    <p className="text-2xl font-bold">3.42s</p>
                    <p className="text-xs text-green-500">↓ 12% from last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-500">Average Token Usage</p>
                    <p className="text-2xl font-bold">4,328</p>
                    <p className="text-xs text-red-500">↑ 8% from last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-500">Average Cost</p>
                    <p className="text-2xl font-bold">$0.0842</p>
                    <p className="text-xs text-red-500">↑ 5% from last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-500">Success Rate</p>
                    <p className="text-2xl font-bold">94.7%</p>
                    <p className="text-xs text-green-500">↑ 2.3% from last period</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Swarm Type Distribution</CardTitle>
                <CardDescription>Breakdown of swarm types in use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Sequential Workflow</span>
                    </div>
                    <span className="font-bold">42%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Concurrent Workflow</span>
                    </div>
                    <span className="font-bold">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Group Chat</span>
                    </div>
                    <span className="font-bold">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Hierarchical Swarm</span>
                    </div>
                    <span className="font-bold">10%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Other Types</span>
                    </div>
                    <span className="font-bold">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6 mt-6">
          <AgentDistribution />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Performance metrics by agent role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Worker Agents</span>
                      <span className="text-sm font-bold">96.2% Success</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "96.2%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Supervisor Agents</span>
                      <span className="text-sm font-bold">92.8% Success</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "92.8%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Specialist Agents</span>
                      <span className="text-sm font-bold">89.5% Success</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "89.5%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Analyst Agents</span>
                      <span className="text-sm font-bold">94.1% Success</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "94.1%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Agents</CardTitle>
                <CardDescription>Agents with highest success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Financial Analyst</p>
                      <p className="text-xs text-zinc-500">Specialist • gpt-4o</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">99.2%</p>
                      <p className="text-xs text-zinc-500">342 runs</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Document Parser</p>
                      <p className="text-xs text-zinc-500">Worker • gpt-4o</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">98.7%</p>
                      <p className="text-xs text-zinc-500">512 runs</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Content Strategist</p>
                      <p className="text-xs text-zinc-500">Supervisor • gpt-4o</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">97.5%</p>
                      <p className="text-xs text-zinc-500">287 runs</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Legal Reviewer</p>
                      <p className="text-xs text-zinc-500">Specialist • gpt-4</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">96.8%</p>
                      <p className="text-xs text-zinc-500">189 runs</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Market Analyst</p>
                      <p className="text-xs text-zinc-500">Analyst • gpt-4o</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">95.9%</p>
                      <p className="text-xs text-zinc-500">231 runs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6 mt-6">
          <CostAnalysis />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Cost analysis by swarm type and model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">By Swarm Type</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sequential Workflow</span>
                        <span className="text-sm font-bold">$124.56</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Concurrent Workflow</span>
                        <span className="text-sm font-bold">$98.32</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Group Chat</span>
                        <span className="text-sm font-bold">$76.19</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Other Types</span>
                        <span className="text-sm font-bold">$52.87</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">By Model</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">GPT-4o</span>
                        <span className="text-sm font-bold">$215.43</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">GPT-4</span>
                        <span className="text-sm font-bold">$87.65</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">GPT-3.5 Turbo</span>
                        <span className="text-sm font-bold">$48.86</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Efficiency</CardTitle>
                <CardDescription>Cost per token and execution metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Avg. Cost per 1K Tokens</p>
                      <p className="text-2xl font-bold">$0.0032</p>
                      <p className="text-xs text-green-500">↓ 8% from last period</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-500">Avg. Cost per Execution</p>
                      <p className="text-2xl font-bold">$0.0842</p>
                      <p className="text-xs text-red-500">↑ 5% from last period</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-2">Cost Efficiency by Swarm</h4>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Financial Analysis</span>
                          <span className="text-sm font-bold">$0.0021 per 1K tokens</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Content Creation</span>
                          <span className="text-sm font-bold">$0.0028 per 1K tokens</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Legal Document Review</span>
                          <span className="text-sm font-bold">$0.0045 per 1K tokens</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

