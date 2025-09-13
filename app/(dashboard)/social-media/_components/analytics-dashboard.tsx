
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Heart, MessageSquare, Share, Eye, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SocialMediaAccount {
  id: string;
  platform: string;
  username?: string;
  displayName?: string;
}

interface AnalyticsDashboardProps {
  accounts: SocialMediaAccount[];
}

interface MetricData {
  id: string;
  platform: string;
  metricType: string;
  value: number;
  date: string;
  account: {
    platform: string;
    username?: string;
    displayName?: string;
  };
}

const platformColors = {
  FACEBOOK: '#1877f2',
  TWITTER: '#1da1f2',
  INSTAGRAM: '#e1306c',
  LINKEDIN: '#0077b5'
};

const platformIcons = {
  FACEBOOK: Facebook,
  TWITTER: Twitter,
  INSTAGRAM: Instagram,
  LINKEDIN: Linkedin
};

const metricIcons = {
  FOLLOWERS: Users,
  LIKES: Heart,
  COMMENTS: MessageSquare,
  SHARES: Share,
  IMPRESSIONS: Eye,
  REACH: TrendingUp
};

export default function AnalyticsDashboard({ accounts }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [selectedPlatform, selectedAccount, timeRange]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPlatform !== 'all') {
        params.append('platform', selectedPlatform);
      }
      if (selectedAccount !== 'all') {
        params.append('accountId', selectedAccount);
      }
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));
      
      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/social-media-metrics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock data for demonstration since we don't have real metrics yet
  const generateMockData = () => {
    const mockData: MetricData[] = [];
    const platforms = selectedPlatform === 'all' ? ['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'LINKEDIN'] : [selectedPlatform];
    const metricTypes = ['FOLLOWERS', 'LIKES', 'COMMENTS', 'SHARES', 'IMPRESSIONS', 'REACH'];
    
    for (let i = parseInt(timeRange); i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      platforms.forEach(platform => {
        metricTypes.forEach(metricType => {
          const baseValue = {
            FOLLOWERS: 1000,
            LIKES: 50,
            COMMENTS: 10,
            SHARES: 5,
            IMPRESSIONS: 1000,
            REACH: 800
          }[metricType] || 100;

          mockData.push({
            id: `${platform}-${metricType}-${i}`,
            platform,
            metricType,
            value: Math.floor(baseValue + Math.random() * baseValue * 0.3),
            date: date.toISOString(),
            account: {
              platform,
              username: `@church_${platform.toLowerCase()}`,
              displayName: `Church ${platform}`
            }
          });
        });
      });
    }
    
    return mockData;
  };

  // Use mock data if no real metrics
  const chartData = metrics.length > 0 ? metrics : generateMockData();

  // Aggregate data for charts
  const dailyMetrics = chartData.reduce((acc: any, metric) => {
    const date = new Date(metric.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date };
    }
    
    if (!acc[date][metric.metricType]) {
      acc[date][metric.metricType] = 0;
    }
    
    acc[date][metric.metricType] += metric.value;
    return acc;
  }, {});

  const timeSeriesData = Object.values(dailyMetrics).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Platform distribution
  const platformData = Object.values(
    chartData.reduce((acc: any, metric) => {
      if (!acc[metric.platform]) {
        acc[metric.platform] = {
          platform: metric.platform,
          value: 0,
          color: platformColors[metric.platform as keyof typeof platformColors]
        };
      }
      acc[metric.platform].value += metric.value;
      return acc;
    }, {})
  );

  // Calculate totals for overview cards
  const totals = chartData.reduce((acc: any, metric) => {
    if (!acc[metric.metricType]) {
      acc[metric.metricType] = 0;
    }
    acc[metric.metricType] += metric.value;
    return acc;
  }, {});

  const activeAccounts = accounts.filter(acc => 
    selectedPlatform === 'all' || acc.platform === selectedPlatform
  );

  if (!accounts || accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium">No Analytics Available</h3>
            <p className="mt-1 text-sm">Connect social media accounts to view analytics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {accounts.map(account => (
              <SelectItem key={account.platform} value={account.platform}>
                {account.platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {activeAccounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.displayName || account.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="30 days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(totals).slice(0, 4).map(([metricType, value]) => {
          const Icon = metricIcons[metricType as keyof typeof metricIcons] || BarChart3;
          
          return (
            <Card key={metricType}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {metricType.toLowerCase()}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(value as number).toLocaleString()}</div>
                <Badge variant="secondary" className="mt-1">
                  Last {timeRange} days
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="LIKES" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.7}
                />
                <Area 
                  type="monotone" 
                  dataKey="COMMENTS" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.7}
                />
                <Area 
                  type="monotone" 
                  dataKey="SHARES" 
                  stackId="1" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ platform, percent }: any) => 
                    `${platform} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {platformData.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Total Engagement']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Follower Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="FOLLOWERS" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reach & Impressions */}
        <Card>
          <CardHeader>
            <CardTitle>Reach & Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Bar dataKey="REACH" fill="#06b6d4" />
                <Bar dataKey="IMPRESSIONS" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
