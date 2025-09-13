
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Plus, Play, Download, Clock, CheckCircle, AlertCircle,
  Loader2, Filter, Search, Calendar, BarChart3, PieChart,
  TrendingUp, Users, DollarSign, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

interface CustomReport {
  id: string;
  name: string;
  description?: string;
  reportType: string;
  chartType?: string;
  isPublic: boolean;
  isTemplate: boolean;
  lastRunAt?: string;
  runCount: number;
  createdAt: string;
  schedules: any[];
  executions: any[];
}

const REPORT_TYPES = [
  { value: 'FINANCIAL', label: 'Financial', icon: DollarSign, color: 'bg-green-500' },
  { value: 'MEMBER', label: 'Members', icon: Users, color: 'bg-blue-500' },
  { value: 'EVENT', label: 'Events', icon: Calendar, color: 'bg-purple-500' },
  { value: 'COMMUNICATION', label: 'Communications', icon: MessageSquare, color: 'bg-orange-500' },
  { value: 'CUSTOM', label: 'Custom', icon: BarChart3, color: 'bg-gray-500' }
];

const CHART_TYPES = [
  { value: 'TABLE', label: 'Table' },
  { value: 'BAR', label: 'Bar Chart' },
  { value: 'LINE', label: 'Line Chart' },
  { value: 'PIE', label: 'Pie Chart' },
  { value: 'AREA', label: 'Area Chart' }
];

export default function ReportsClient() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showTemplate, setShowTemplate] = useState<boolean | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [executingReports, setExecutingReports] = useState<Set<string>>(new Set());

  // Create report form state
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    reportType: 'FINANCIAL',
    chartType: 'TABLE',
    isPublic: false,
    isTemplate: false
  });

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '/api/reports';
      const params = new URLSearchParams();
      
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      
      if (showTemplate !== null) {
        params.append('template', showTemplate.toString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReport,
          config: { basic: true }, // Basic configuration
          columns: ['id', 'name', 'createdAt'], // Default columns
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create report');
      }

      setCreateDialogOpen(false);
      setNewReport({
        name: '',
        description: '',
        reportType: 'FINANCIAL',
        chartType: 'TABLE',
        isPublic: false,
        isTemplate: false
      });
      
      fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      setError('Failed to create report. Please try again.');
    }
  };

  const executeReport = async (reportId: string) => {
    setExecutingReports(prev => new Set([...prev, reportId]));

    try {
      const response = await fetch(`/api/reports/${reportId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'JSON' })
      });

      if (!response.ok) {
        throw new Error('Failed to execute report');
      }

      const result = await response.json();
      
      // Refresh reports to show updated execution info
      fetchReports();
      
      // You could show the results in a dialog or navigate to a results page
      console.log('Report execution result:', result);

    } catch (error) {
      console.error('Error executing report:', error);
      setError('Failed to execute report. Please try again.');
    } finally {
      setExecutingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (session) {
      fetchReports();
    }
  }, [session, filterType, showTemplate]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getReportTypeInfo = (type: string) => {
    return REPORT_TYPES.find(rt => rt.value === type) || REPORT_TYPES[4];
  };

  const getStatusBadge = (report: CustomReport) => {
    const lastExecution = report.executions[0];
    if (!lastExecution) {
      return <Badge variant="secondary">Never Run</Badge>;
    }

    switch (lastExecution.status) {
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'RUNNING':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
          <p className="text-gray-600 mt-2">
            Create, manage, and execute custom reports for your church data
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Report Name</Label>
                <Input
                  id="name"
                  value={newReport.name}
                  onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this report shows"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select 
                  value={newReport.reportType} 
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, reportType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="chartType">Chart Type</Label>
                <Select 
                  value={newReport.chartType} 
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, chartType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHART_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newReport.isPublic}
                    onChange={(e) => setNewReport(prev => ({ ...prev, isPublic: e.target.checked }))}
                  />
                  <span className="text-sm">Public Report</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newReport.isTemplate}
                    onChange={(e) => setNewReport(prev => ({ ...prev, isTemplate: e.target.checked }))}
                  />
                  <span className="text-sm">Use as Template</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createReport} disabled={!newReport.name}>
                  Create Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {REPORT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={showTemplate === null ? 'all' : showTemplate.toString()} 
          onValueChange={(value) => setShowTemplate(value === 'all' ? null : value === 'true')}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="false">Custom</SelectItem>
            <SelectItem value="true">Templates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const typeInfo = getReportTypeInfo(report.reportType);
          const Icon = typeInfo.icon;
          const isExecuting = executingReports.has(report.id);
          
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`p-2 rounded-md ${typeInfo.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {report.name}
                </CardTitle>
                {report.description && (
                  <p className="text-sm text-gray-600">{report.description}</p>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">{typeInfo.label}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Chart:</span>
                    <span className="font-medium">{report.chartType || 'Table'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(report)}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Run:</span>
                    <span className="font-medium">
                      {report.lastRunAt ? 
                        format(new Date(report.lastRunAt), 'MMM d, yyyy') : 
                        'Never'
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Executions:</span>
                    <span className="font-medium">{report.runCount}</span>
                  </div>

                  {report.isTemplate && (
                    <Badge variant="secondary" className="text-xs">
                      Template
                    </Badge>
                  )}
                  
                  {report.isPublic && (
                    <Badge variant="outline" className="text-xs">
                      Public
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => executeReport(report.id)}
                    disabled={isExecuting}
                    className="flex-1"
                  >
                    {isExecuting ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {isExecuting ? 'Running...' : 'Run'}
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReports.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterType !== 'all' 
              ? 'No reports match your current filters.' 
              : 'Get started by creating your first custom report.'
            }
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Report
          </Button>
        </div>
      )}
    </div>
  );
}
