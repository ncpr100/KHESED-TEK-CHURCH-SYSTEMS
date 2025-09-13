
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Target, DollarSign, Calendar, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MarketingCampaign } from '@/types/social-media';


interface CampaignAnalyticsProps {
  campaigns: MarketingCampaign[];
}

const statusColors = {
  DRAFT: '#9ca3af',
  ACTIVE: '#10b981',
  PAUSED: '#f59e0b',
  COMPLETED: '#3b82f6',
  CANCELLED: '#ef4444'
};

export default function CampaignAnalytics({ campaigns }: CampaignAnalyticsProps) {
  // Process data for charts
  const statusDistribution = campaigns.reduce((acc: any, campaign) => {
    const status = campaign.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
    status,
    count,
    color: statusColors[status as keyof typeof statusColors]
  }));

  // Budget analysis
  const budgetData = campaigns
    .filter(c => c.budget && c.budget > 0)
    .map(campaign => ({
      name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
      budget: campaign.budget || 0,
      posts: campaign._count?.posts || 0,
      status: campaign.status
    }))
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 10);

  // Timeline data
  const timelineData = campaigns
    .reduce((acc: any, campaign) => {
      const month = new Date(campaign.startDate).toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, campaigns: 0, totalBudget: 0 };
      }
      acc[month].campaigns += 1;
      acc[month].totalBudget += campaign.budget || 0;
      return acc;
    }, {});

  const monthlyData = Object.values(timelineData)
    .sort((a: any, b: any) => a.month.localeCompare(b.month));

  // Platform distribution
  const platformStats = campaigns.reduce((acc: any, campaign) => {
    const platforms = JSON.parse(campaign.platforms || '[]');
    platforms.forEach((platform: string) => {
      acc[platform] = (acc[platform] || 0) + 1;
    });
    return acc;
  }, {});

  const platformData = Object.entries(platformStats).map(([platform, count]) => ({
    platform,
    count
  }));

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const avgBudget = campaigns.filter(c => c.budget).length > 0 
    ? totalBudget / campaigns.filter(c => c.budget).length 
    : 0;
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  const totalPosts = campaigns.reduce((sum, c) => sum + (c._count?.posts || 0), 0);

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium">No Campaign Data</h3>
            <p className="mt-1 text-sm">Create campaigns to view analytics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${Math.round(avgBudget).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              of {campaigns.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Posts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {Math.round(totalPosts / campaigns.length)} per campaign
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(platformStats).length}</div>
            <p className="text-xs text-muted-foreground">
              Different platforms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Campaign Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ status, count, percent }: any) => 
                    `${status} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {statusData.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Campaigns']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => [value, 'Campaigns']} />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Analysis */}
        {budgetData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `$${value.toLocaleString()}`,
                      'Budget'
                    ]}
                    labelFormatter={(label: any) => `Campaign: ${label}`}
                  />
                  <Bar dataKey="budget" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    formatter={(value: any, name: string) => [
                      name === 'campaigns' ? value : `$${value.toLocaleString()}`,
                      name === 'campaigns' ? 'Campaigns' : 'Total Budget'
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="campaigns" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="campaigns"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalBudget" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="totalBudget"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Campaign Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Campaign</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Budget</th>
                  <th className="text-left p-2">Posts</th>
                  <th className="text-left p-2">Duration</th>
                  <th className="text-left p-2">Platforms</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 10).map(campaign => {
                  const platforms = JSON.parse(campaign.platforms || '[]');
                  const duration = campaign.endDate 
                    ? Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                    
                  return (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-xs text-gray-500">
                          Started {new Date(campaign.startDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={`text-xs px-2 py-1 ${
                          campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {campaign.budget ? `$${campaign.budget.toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="p-2">{campaign._count?.posts || 0}</td>
                      <td className="p-2">{duration ? `${duration}d` : 'Ongoing'}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {platforms.slice(0, 2).map((platform: string) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                          {platforms.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{platforms.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
