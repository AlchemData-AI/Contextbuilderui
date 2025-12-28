import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Activity,
  Clock,
  Sparkles,
  ChevronRight,
  Table as TableIcon
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface MetricData {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: any;
  dashboard: string;
  dashboardId: string;
  insight?: string;
  breakdown?: { label: string; value: string }[];
}

interface AIUpdate {
  id: string;
  timestamp: Date;
  title: string;
  insight: string;
  metrics: string[];
  severity: 'info' | 'warning' | 'success';
}

const MAIN_METRICS: MetricData[] = [
  {
    id: 'm1',
    title: 'Total Revenue',
    value: '$2.4M',
    change: 12.5,
    changeLabel: 'vs last month',
    icon: DollarSign,
    dashboard: 'Sales',
    dashboardId: 'sales-performance',
    insight: 'Strong growth driven by Electronics category (+18%) and Mobile App channel (+24%)',
    breakdown: [
      { label: 'Last 7 days', value: '$580K' },
      { label: 'Last 30 days', value: '$2.4M' },
      { label: 'E-commerce', value: '$1.2M (50%)' },
      { label: 'Mobile App', value: '$720K (30%)' }
    ]
  },
  {
    id: 'm2',
    title: 'Active Users',
    value: '4,234',
    change: 8.2,
    changeLabel: 'vs last month',
    icon: Users,
    dashboard: 'Users',
    dashboardId: 'user-analytics',
    insight: 'Healthy user growth with strong retention in recent cohorts (78% Week 1 retention)',
    breakdown: [
      { label: 'Daily Active', value: '1,845' },
      { label: 'Weekly Active', value: '3,234' },
      { label: 'New This Month', value: '892' },
      { label: 'Churned', value: '124' }
    ]
  },
  {
    id: 'm3',
    title: 'Total Orders',
    value: '18,942',
    change: 8.3,
    changeLabel: 'vs last month',
    icon: ShoppingCart,
    dashboard: 'Sales',
    dashboardId: 'sales-performance',
    insight: 'Order volume up 8.3% with improved AOV ($127.50) from cross-sell optimization',
    breakdown: [
      { label: 'Today', value: '687' },
      { label: 'This Week', value: '4,234' },
      { label: 'Avg Daily', value: '631' },
      { label: 'Peak Hour', value: '89/hr' }
    ]
  },
  {
    id: 'm4',
    title: 'Stock Items',
    value: '1,247',
    change: -3.2,
    changeLabel: 'vs last month',
    icon: Package,
    dashboard: 'Inventory',
    dashboardId: 'inventory-management',
    insight: 'Inventory reduction due to strong sales, 23 items below reorder threshold',
    breakdown: [
      { label: 'In Stock', value: '1,247' },
      { label: 'Low Stock', value: '23 items' },
      { label: 'On Order', value: '456 units' },
      { label: 'Out of Stock', value: '8 items' }
    ]
  }
];

const AI_UPDATES: AIUpdate[] = [
  {
    id: 'ai-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    title: 'Sales Surge Detected',
    insight: 'Smart watch sales increased 24% following the Series 5 launch. Consider increasing inventory for Q1.',
    metrics: ['Revenue', 'Conversion Rate'],
    severity: 'success'
  },
  {
    id: 'ai-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    title: 'Conversion Rate Declining',
    insight: 'Checkout conversion dropped 2.1% despite higher traffic. Recommend A/B testing simplified checkout flow.',
    metrics: ['Conversion Rate', 'Checkout'],
    severity: 'warning'
  },
  {
    id: 'ai-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    title: 'Cross-sell Performance',
    insight: 'Average order value up 5.8% due to accessory bundles. Expand recommendation engine coverage.',
    metrics: ['AOV', 'Product Mix'],
    severity: 'success'
  },
  {
    id: 'ai-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    title: 'Mobile Growth Trend',
    insight: 'Mobile app now accounts for 30% of revenue. Consider mobile-exclusive promotions.',
    metrics: ['Mobile Sales', 'Channels'],
    severity: 'info'
  }
];

const REVENUE_TREND_DATA = [
  { month: 'Jul', revenue: 2280000 },
  { month: 'Aug', revenue: 2450000 },
  { month: 'Sep', revenue: 2520000 },
  { month: 'Oct', revenue: 2380000 },
  { month: 'Nov', revenue: 2480000 },
  { month: 'Dec', revenue: 2400000 },
];

const TOP_PRODUCTS_DATA = [
  { product: 'Wireless Headphones Pro', revenue: '$145,230', growth: '+18%', growthValue: 18 },
  { product: 'Smart Watch Series 5', revenue: '$128,900', growth: '+24%', growthValue: 24 },
  { product: 'USB-C Cable 3-Pack', revenue: '$89,450', growth: '+12%', growthValue: 12 },
  { product: 'Laptop Stand Aluminum', revenue: '$76,340', growth: '+8%', growthValue: 8 },
  { product: 'Wireless Mouse', revenue: '$62,120', growth: '-3%', growthValue: -3 },
];

const SALES_BY_CHANNEL_DATA = [
  { channel: 'E-commerce', revenue: '$1.2M', share: '50%' },
  { channel: 'Mobile App', revenue: '$720K', share: '30%' },
  { channel: 'Retail Stores', revenue: '$360K', share: '15%' },
  { channel: 'Wholesale', revenue: '$120K', share: '5%' },
];

export default function DashboardHome() {
  const navigate = useNavigate();

  const formatTimestamp = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const handleMetricClick = (metric: MetricData) => {
    navigate(`/dashboard/${metric.dashboardId}`);
  };

  const handleDeepDive = (metric: MetricData, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a summary of the metric data
    const metricSummary = {
      title: metric.title,
      value: metric.value,
      change: `${metric.change > 0 ? '+' : ''}${metric.change}%`,
      changeLabel: metric.changeLabel,
      dashboard: metric.dashboard,
      insight: metric.insight,
      breakdown: metric.breakdown
    };
    
    // Store data in sessionStorage to avoid URL encoding issues
    sessionStorage.setItem('deepdive_metric_data', JSON.stringify(metricSummary));
    navigate(`/chat/new?deepdive=metric`);
  };

  const handleInsightDeepDive = (update: AIUpdate) => {
    navigate(`/chat?context=insight&id=${update.id}&question=${encodeURIComponent(update.title)}`);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFBFC] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#111827] mb-1">Dashboard</h1>
              <p className="text-sm text-[#666666]">Real-time insights and analytics across your business</p>
            </div>
            <Button
              onClick={() => navigate('/chat')}
              className="bg-[#00B5B3] hover:bg-[#00A5A3] text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask Analytics Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Main Content - Left Column */}
            <div className="col-span-8 space-y-6">
              {/* Key Metrics */}
              <div>
                <h2 className="text-lg font-semibold text-[#111827] mb-4">Key Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  {MAIN_METRICS.map((metric) => {
                    const Icon = metric.icon;
                    const isPositive = metric.change > 0;
                    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
                    
                    return (
                      <Card
                        key={metric.id}
                        className="p-6 border border-[#EEEEEE] hover:border-[#00B5B3] hover:shadow-lg transition-all cursor-pointer group relative"
                        onClick={() => handleMetricClick(metric)}
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-br from-[#E0F7F7] to-white border border-[#00B5B3] rounded-t-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 -translate-y-full shadow-xl">
                          <div className="flex items-start gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-[#00B5B3] flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-[#333333] leading-relaxed">{metric.insight}</p>
                          </div>
                          {metric.breakdown && metric.breakdown.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {metric.breakdown.map((item, idx) => (
                                <div key={idx} className="bg-white/70 rounded px-2 py-1.5">
                                  <p className="text-xs text-[#666666] mb-0.5">{item.label}</p>
                                  <p className="text-sm font-semibold text-[#111827]">{item.value}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center group-hover:bg-[#00B5B3] transition-colors">
                            <Icon className="w-5 h-5 text-[#00B5B3] group-hover:text-white transition-colors" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {metric.dashboard}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 mb-4">
                          <p className="text-sm text-[#666666]">{metric.title}</p>
                          <p className="text-3xl font-semibold text-[#111827]">{metric.value}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <TrendIcon 
                              className={`w-4 h-4 ${
                                isPositive ? 'text-[#4CAF50]' : 'text-[#F04438]'
                              }`} 
                            />
                            <span className={`text-sm font-medium ${
                              isPositive ? 'text-[#4CAF50]' : 'text-[#F04438]'
                            }`}>
                              {Math.abs(metric.change)}%
                            </span>
                            <span className="text-xs text-[#999999]">{metric.changeLabel}</span>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeepDive(metric, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#00B5B3] hover:text-[#00A5A3] hover:bg-[#E0F7F7] h-7 px-2"
                          >
                            Deep Dive
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Revenue Trend Chart */}
              <Card className="border border-[#EEEEEE] overflow-hidden group">
                <div className="p-6 border-b border-[#EEEEEE] bg-[#FAFBFC] flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#EEEEEE] flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#00B5B3]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#111827] mb-1">Revenue Trend</h3>
                      <p className="text-sm text-[#666666]">Last 6 months performance</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/dashboard/sales-performance')}
                    className="text-[#00B5B3] border-[#00B5B3] hover:bg-[#E0F7F7] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View Details
                    <ChevronRight className="w-3 h-3 ml-1.5" />
                  </Button>
                </div>
                
                <div className="p-6 bg-white">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={REVENUE_TREND_DATA}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00B5B3" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00B5B3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#666666', fontSize: 12 }}
                        axisLine={{ stroke: '#EEEEEE' }}
                      />
                      <YAxis 
                        tick={{ fill: '#666666', fontSize: 12 }}
                        axisLine={{ stroke: '#EEEEEE' }}
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #EEEEEE',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                        formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#00B5B3" 
                        strokeWidth={2}
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Top Products Table */}
              <Card className="border border-[#EEEEEE] overflow-hidden group">
                <div className="p-6 border-b border-[#EEEEEE] bg-[#FAFBFC] flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#EEEEEE] flex items-center justify-center">
                      <TableIcon className="w-5 h-5 text-[#00B5B3]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#111827] mb-1">Top Performing Products</h3>
                      <p className="text-sm text-[#666666]">Best sellers this month</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/dashboard/sales-performance')}
                    className="text-[#00B5B3] border-[#00B5B3] hover:bg-[#E0F7F7] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Deep Dive
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#EEEEEE] bg-[#F8F9FA]">
                        <th className="px-6 py-3 text-xs font-medium text-[#666666] uppercase tracking-wider text-left">
                          Product
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-[#666666] uppercase tracking-wider text-right">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-[#666666] uppercase tracking-wider text-right">
                          Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#F0F0F0]">
                      {TOP_PRODUCTS_DATA.map((row, idx) => {
                        const isPositive = row.growthValue > 0;
                        const isNegative = row.growthValue < 0;
                        
                        return (
                          <tr 
                            key={idx}
                            className="hover:bg-[#FAFBFC] transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#333333]">
                              {row.product}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#333333]">
                              {row.revenue}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <span className={`font-medium ${
                                isPositive ? 'text-[#4CAF50]' : isNegative ? 'text-[#F04438]' : 'text-[#666666]'
                              }`}>
                                {row.growth}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Sales by Channel Table */}
              <Card className="border border-[#EEEEEE] overflow-hidden group">
                <div className="p-6 border-b border-[#EEEEEE] bg-[#FAFBFC] flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#EEEEEE] flex items-center justify-center">
                      <TableIcon className="w-5 h-5 text-[#00B5B3]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#111827] mb-1">Sales by Channel</h3>
                      <p className="text-sm text-[#666666]">Revenue breakdown</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/dashboard/sales-performance')}
                    className="text-[#00B5B3] border-[#00B5B3] hover:bg-[#E0F7F7] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    Deep Dive
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#EEEEEE] bg-[#F8F9FA]">
                        <th className="px-6 py-3 text-xs font-medium text-[#666666] uppercase tracking-wider text-left">
                          Channel
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-[#666666] uppercase tracking-wider text-right">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-[#666666] uppercase tracking-wider text-right">
                          Share
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#F0F0F0]">
                      {SALES_BY_CHANNEL_DATA.map((row, idx) => (
                        <tr 
                          key={idx}
                          className="hover:bg-[#FAFBFC] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#333333]">
                            {row.channel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#333333]">
                            {row.revenue}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#333333]">
                            {row.share}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Quick Access to Dashboards */}
              <div>
                <h2 className="text-lg font-semibold text-[#111827] mb-4">Your Dashboards</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'sales-performance', name: 'Sales Performance', icon: BarChart3, metrics: 8 },
                    { id: 'user-analytics', name: 'User Analytics', icon: Users, metrics: 6 },
                    { id: 'inventory-management', name: 'Inventory Management', icon: Package, metrics: 5 },
                    { id: 'customer-experience', name: 'Customer Experience', icon: Activity, metrics: 7 }
                  ].map((dashboard) => {
                    const Icon = dashboard.icon;
                    return (
                      <Card
                        key={dashboard.id}
                        onClick={() => navigate(`/dashboard/${dashboard.id}`)}
                        className="p-5 border border-[#EEEEEE] hover:border-[#00B5B3] hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#F8F9FA] group-hover:bg-[#E0F7F7] flex items-center justify-center transition-colors">
                            <Icon className="w-5 h-5 text-[#666666] group-hover:text-[#00B5B3] transition-colors" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#111827] mb-0.5">{dashboard.name}</p>
                            <p className="text-xs text-[#666666]">{dashboard.metrics} metrics</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#00B5B3] transition-colors" />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Insights Feed - Right Column */}
            <div className="col-span-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00B5B3]" />
                  <h2 className="text-lg font-semibold text-[#111827]">AI Insights</h2>
                </div>
                <Badge variant="outline" className="text-xs bg-[#E0F7F7] text-[#00B5B3] border-[#00B5B3]">
                  Live
                </Badge>
              </div>
              
              <Card className="border border-[#EEEEEE]">
                <div className="p-4 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
                  {AI_UPDATES.map((update, index) => (
                    <div
                      key={update.id}
                      className={`group ${index !== 0 ? 'pt-4 border-t border-[#F0F0F0]' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          update.severity === 'success' 
                            ? 'bg-[#E8F5E9]' 
                            : update.severity === 'warning'
                            ? 'bg-[#FFF4E6]'
                            : 'bg-[#E0F7F7]'
                        }`}>
                          {update.severity === 'success' ? (
                            <TrendingUp className="w-4 h-4 text-[#4CAF50]" />
                          ) : update.severity === 'warning' ? (
                            <TrendingDown className="w-4 h-4 text-[#FF9800]" />
                          ) : (
                            <Activity className="w-4 h-4 text-[#00B5B3]" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-medium text-sm text-[#111827]">
                              {update.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-[#999999] flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(update.timestamp)}
                            </div>
                          </div>
                          
                          <p className="text-sm text-[#666666] leading-relaxed mb-3">
                            {update.insight}
                          </p>
                          
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {update.metrics.map((metric) => (
                              <Badge 
                                key={metric}
                                variant="outline" 
                                className="text-xs bg-[#F8F9FA] border-[#E5E7EB]"
                              >
                                {metric}
                              </Badge>
                            ))}
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleInsightDeepDive(update)}
                            className="text-[#00B5B3] hover:text-[#00A5A3] hover:bg-[#E0F7F7] h-7 px-2 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Sparkles className="w-3 h-3 mr-1.5" />
                            Investigate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}