
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
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart,
  RadialBar, ScatterChart, Scatter
} from 'recharts';
import { 
  LayoutDashboard, Plus, Settings, Eye, EyeOff, Maximize2,
  TrendingUp, TrendingDown, DollarSign, Users, Calendar,
  MessageSquare, Share2, UserCheck, Loader2, RefreshCw,
  BarChart3, PieChart as PieChartIcon, Activity, Target
} from 'lucide-react';
import { format } from 'date-fns';

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  userRole?: string;
  widgets: Widget[];
  createdAt: string;
}

interface Widget {
  id: string;
  name: string;
  type: string;
  chartType?: string;
  position: string;
  isVisible: boolean;
  refreshInterval: number;
  dataSource: string;
  config?: string;
}

interface KPIMetric {
  id: string;
  name: string;
  description?: string;
  category: string;
  currentValue: number;
  previousValue?: number;
  changePercent?: number;
  trendDirection?: string;
  target?: number;
  color: string;
  icon?: string;
  unit?: string;
  period: string;
}

const WIDGET_TYPES = [
  { value: 'KPI', label: 'KPI Card', icon: Target },
  { value: 'CHART', label: 'Chart', icon: BarChart3 },
  { value: 'TABLE', label: 'Data Table', icon: LayoutDashboard },
  { value: 'METRIC', label: 'Single Metric', icon: Activity }
];

const CHART_TYPES = [
  { value: 'BAR', label: 'Bar Chart' },
  { value: 'LINE', label: 'Line Chart' },
  { value: 'PIE', label: 'Pie Chart' },
  { value: 'AREA', label: 'Area Chart' },
  { value: 'DOUGHNUT', label: 'Doughnut Chart' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Sample data for demonstration
const sampleDonationData = [
  { month: 'Jan', amount: 4500000, donations: 45 },
  { month: 'Feb', amount: 5200000, donations: 52 },
  { month: 'Mar', amount: 4800000, donations: 48 },
  { month: 'Apr', amount: 5600000, donations: 56 },
  { month: 'May', amount: 6100000, donations: 61 },
  { month: 'Jun', amount: 5800000, donations: 58 }
];

const sampleMembershipData = [
  { category: 'Adultos', count: 320, percentage: 65 },
  { category: 'Jóvenes', count: 120, percentage: 24 },
  { category: 'Niños', count: 54, percentage: 11 }
];

const sampleEventData = [
  { month: 'Jan', events: 12, attendance: 890 },
  { month: 'Feb', events: 14, attendance: 1020 },
  { month: 'Mar', events: 16, attendance: 1150 },
  { month: 'Apr', events: 13, attendance: 980 },
  { month: 'May', events: 18, attendance: 1340 },
  { month: 'Jun', events: 15, attendance: 1180 }
];

export default function BusinessIntelligenceClient() {
  const { data: session } = useSession();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Create dashboard form state
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: '',
    isDefault: false,
    isPublic: false,
    userRole: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardsRes, kpiRes] = await Promise.all([
        fetch('/api/dashboards'),
        fetch('/api/kpi-metrics')
      ]);

      if (!dashboardsRes.ok || !kpiRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [dashboardsData, kpiData] = await Promise.all([
        dashboardsRes.json(),
        kpiRes.json()
      ]);

      setDashboards(dashboardsData);
      setKpiMetrics(kpiData);
      
      // Set default dashboard
      const defaultDashboard = dashboardsData.find((d: Dashboard) => d.isDefault) || dashboardsData[0];
      setCurrentDashboard(defaultDashboard);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos del dashboard. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    setRefreshing(true);
    try {
      await fetch('/api/kpi-metrics/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      // Refresh KPI data
      const kpiRes = await fetch('/api/kpi-metrics');
      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpiMetrics(kpiData);
      }
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const createDashboard = async () => {
    try {
      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDashboard,
          layout: { grid: { cols: 12, rows: 12 } }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create dashboard');
      }

      setCreateDialogOpen(false);
      setNewDashboard({
        name: '',
        description: '',
        isDefault: false,
        isPublic: false,
        userRole: ''
      });
      
      fetchData();
    } catch (error) {
      console.error('Error creating dashboard:', error);
      setError('Error al crear el dashboard. Por favor intenta nuevamente.');
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (growth: number | undefined, trendDirection: string | undefined) => {
    if (growth === undefined || !trendDirection) return null;
    
    const isPositive = trendDirection === 'UP';
    const icon = isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
        {icon}
        {Math.abs(growth)}%
      </div>
    );
  };

  const renderKPICard = (metric: KPIMetric) => {
    const progressPercentage = metric.target ? (metric.currentValue / metric.target) * 100 : 0;
    
    return (
      <Card key={metric.id}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className={`p-2 rounded-md bg-${metric.color}-500 text-white`}>
              <Activity className="h-4 w-4" />
            </div>
            {metric.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {metric.unit === '$' ? formatCurrency(metric.currentValue) : metric.currentValue}
              {metric.unit && metric.unit !== '$' && <span className="text-sm text-gray-600 ml-1">{metric.unit}</span>}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 capitalize">{metric.period.toLowerCase()}</span>
              {formatGrowth(metric.changePercent, metric.trendDirection)}
            </div>
            
            {metric.target && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progreso de Meta</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${metric.color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando inteligencia de negocios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perspectivas Pastorales</h1>
          <p className="text-gray-600 mt-2">
            Inteligencia ministerial avanzada y perspectivas estratégicas para el crecimiento espiritual y organizacional
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {dashboards.length > 1 && (
            <Select
              value={currentDashboard?.id || undefined}
              onValueChange={(value) => {
                const dashboard = dashboards.find(d => d.id === value);
                setCurrentDashboard(dashboard || null);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar dashboard" />
              </SelectTrigger>
              <SelectContent>
                {dashboards.map(dashboard => (
                  <SelectItem key={dashboard.id} value={dashboard.id}>
                    {dashboard.name} {dashboard.isDefault && '(Predeterminado)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Actualizar
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Dashboard</Label>
                  <Input
                    id="name"
                    value={newDashboard.name}
                    onChange={(e) => setNewDashboard(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ingresa el nombre del dashboard"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newDashboard.description}
                    onChange={(e) => setNewDashboard(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe este dashboard"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newDashboard.isDefault}
                      onChange={(e) => setNewDashboard(prev => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    <span className="text-sm">Establecer como Predeterminado</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newDashboard.isPublic}
                      onChange={(e) => setNewDashboard(prev => ({ ...prev, isPublic: e.target.checked }))}
                    />
                    <span className="text-sm">Dashboard Público</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createDashboard} disabled={!newDashboard.name}>
                    Crear Dashboard
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* KPI Metrics Grid */}
      {kpiMetrics.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Indicadores Clave de Rendimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiMetrics.slice(0, 8).map(renderKPICard)}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Tendencias de Donaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sampleDonationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `$${value/1000000}M`} />
                <Tooltip formatter={(value: any) => [formatCurrency(value), 'Monto']} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Membership Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Distribución de Membresía
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sampleMembershipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="count"
                  label={({ category, percentage }) => `${category} ${percentage}%`}
                >
                  {sampleMembershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Asistencia a Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sampleEventData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="events" fill="#8B5CF6" name="Eventos" />
                <Bar dataKey="attendance" fill="#A855F7" name="Asistencia" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Métricas de Crecimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-800 font-medium">Crecimiento de Donaciones</p>
                  <p className="text-2xl font-bold text-green-900">+15.3%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Crecimiento de Miembros</p>
                  <p className="text-2xl font-bold text-blue-900">+8.7%</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-purple-800 font-medium">Asistencia a Eventos</p>
                  <p className="text-2xl font-bold text-purple-900">+22.1%</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State for New Users */}
      {kpiMetrics.length === 0 && !loading && (
        <div className="text-center py-12">
          <LayoutDashboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay métricas KPI configuradas</h3>
          <p className="text-gray-600 mb-4">
            Crea tus primeras métricas KPI para comenzar a rastrear indicadores clave de rendimiento.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Métricas KPI
          </Button>
        </div>
      )}
    </div>
  );
}
