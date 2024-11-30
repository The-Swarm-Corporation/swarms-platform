import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { UserCheck, Clock, Database, Table } from 'lucide-react';

// Define explicit types
export interface ModelUsage {
  tokens: number;
  requests: number;
}

export interface DailyCost {
  date: string;
  model: {
    [key: string]: ModelUsage;
  };
}

export interface UsageData {
  dailyCosts: DailyCost[];
}

interface SwarmSession {
  uuid: string;
  timestamp: string;
  spreadsheet_name: string;
  num_agents: number;
  duration_minutes: number;
  swarms_spreadsheet_session_agents: Array<{
    name: string;
    role: string;
    platform: string;
  }>;
}

interface ModelActivityProps {
  usageData: UsageData | null;
}

interface AnalyticsData {
  sessions: SwarmSession[];
  totalAgents: number;
  totalSessions: number;
  averageDuration: number;
  agentDistribution: { name: string; value: number }[];
  platformUsage: { name: string; value: number }[];
  sessionTrends: { date: string; count: number }[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const ModelActivity: React.FC<ModelActivityProps> = ({ usageData }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSwarmData() {
      try {
        const { data: sessions, error: sessionsError } = await supabase
          .from('swarms_spreadsheet_sessions')
          .select(`
            uuid,
            timestamp,
            spreadsheet_name,
            num_agents,
            duration_minutes,
            swarms_spreadsheet_session_agents (
              name,
              role,
              platform
            )
          `)
          .order('timestamp', { ascending: false });

        if (sessionsError) throw sessionsError;

        const processedData: AnalyticsData = {
          sessions: sessions || [],
          totalAgents: 0,
          totalSessions: sessions?.length || 0,
          averageDuration: 0,
          agentDistribution: [],
          platformUsage: [],
          sessionTrends: []
        };

        const roleCount: { [key: string]: number } = {};
        const platformCount: { [key: string]: number } = {};
        const dateCount: { [key: string]: number } = {};
        let totalDuration = 0;
        let totalAgents = 0;

        sessions?.forEach(session => {
          totalAgents += session.num_agents;
          totalDuration += session.duration_minutes;

          const date = new Date(session.timestamp).toLocaleDateString();
          dateCount[date] = (dateCount[date] || 0) + 1;

          session.swarms_spreadsheet_session_agents?.forEach(agent => {
            roleCount[agent.role] = (roleCount[agent.role] || 0) + 1;
            platformCount[agent.platform] = (platformCount[agent.platform] || 0) + 1;
          });
        });

        processedData.totalAgents = totalAgents;
        processedData.averageDuration = totalDuration / processedData.totalSessions;
        processedData.agentDistribution = Object.entries(roleCount).map(([name, value]) => ({ name, value }));
        processedData.platformUsage = Object.entries(platformCount).map(([name, value]) => ({ name, value }));
        processedData.sessionTrends = Object.entries(dateCount)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setAnalyticsData(processedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    fetchSwarmData();
  }, []);

  if (loading) return <div className="text-center p-8">Loading analytics...</div>;
  if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  if (!analyticsData) return <div className="text-center p-8">No data available</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <UserCheck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Sessions</p>
                <h3 className="text-2xl font-bold">{analyticsData.totalSessions}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Database className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Agents</p>
                <h3 className="text-2xl font-bold">{analyticsData.totalAgents}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Avg Duration</p>
                <h3 className="text-2xl font-bold">
                  {Math.round(analyticsData.averageDuration)} min
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Table className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Avg Agents/Session</p>
                <h3 className="text-2xl font-bold">
                  {(analyticsData.totalAgents / analyticsData.totalSessions).toFixed(1)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Model Usage Charts */}
      {usageData && usageData.dailyCosts && usageData.dailyCosts.length > 0 && (
        <div className="model-usage xl:mb-10 gap-8">
          {Object.keys(usageData.dailyCosts[0].model || {}).map((modelName) => (
            <Card key={modelName} className="mb-6">
              <CardHeader>
                <CardTitle>{modelName} Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="mb-2">API Requests</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart
                        data={usageData.dailyCosts.map(cost => ({
                          date: new Date(cost.date).toLocaleDateString(),
                          value: cost.model[modelName]?.requests || 0,
                        }))}
                      >
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h5 className="mb-2">Token Usage</h5>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={usageData?.dailyCosts.map(cost => ({
                          date: new Date(cost.date).toLocaleDateString(),
                          value: cost.model[modelName]?.tokens || 0,
                        })) || []}
                      >
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Agent Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent Roles Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.agentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.agentDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.platformUsage}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {analyticsData.platformUsage.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelActivity;