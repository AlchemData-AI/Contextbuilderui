import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Search,
  ChevronRight,
  Table as TableIcon,
  BarChart3,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: any;
  insight?: string;
  breakdown?: { label: string; value: string }[];
}

interface ChartConfig {
  id: string;
  title: string;
  description: string;
  type: 'line' | 'bar' | 'area' | 'pie';
  data: any[];
}

interface TableData {
  id: string;
  title: string;
  description: string;
  rows: any[];
  columns: { key: string; label: string; align?: 'left' | 'right' | 'center' }[];
}

interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  metrics: MetricCard[];
  charts: ChartConfig[];
  tables: TableData[];
  insights: string[];
}

const CHART_COLORS = ['#00B5B3', '#0EA5E9', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

// Sample data for revenue trend
const REVENUE_TREND_DATA = [
  { month: 'Jan', revenue: 1850000, target: 2000000 },
  { month: 'Feb', revenue: 1920000, target: 2000000 },
  { month: 'Mar', revenue: 2100000, target: 2000000 },
  { month: 'Apr', revenue: 2050000, target: 2100000 },
  { month: 'May', revenue: 2200000, target: 2100000 },
  { month: 'Jun', revenue: 2350000, target: 2200000 },
  { month: 'Jul', revenue: 2280000, target: 2200000 },
  { month: 'Aug', revenue: 2450000, target: 2300000 },
  { month: 'Sep', revenue: 2520000, target: 2300000 },
  { month: 'Oct', revenue: 2380000, target: 2400000 },
  { month: 'Nov', revenue: 2480000, target: 2400000 },
  { month: 'Dec', revenue: 2400000, target: 2500000 },
];

const SALES_BY_CATEGORY_DATA = [
  { category: 'Electronics', value: 1200000 },
  { category: 'Accessories', value: 680000 },
  { category: 'Apparel', value: 340000 },
  { category: 'Home & Garden', value: 180000 },
];

const CONVERSION_FUNNEL_DATA = [
  { stage: 'Visitors', count: 45230, percentage: 100 },
  { stage: 'Product Views', count: 28450, percentage: 62.9 },
  { stage: 'Add to Cart', count: 12340, percentage: 27.3 },
  { stage: 'Checkout', count: 6780, percentage: 15.0 },
  { stage: 'Purchase', count: 4650, percentage: 10.3 },
];

const USER_GROWTH_DATA = [
  { week: 'W1', newUsers: 234, activeUsers: 3456 },
  { week: 'W2', newUsers: 312, activeUsers: 3678 },
  { week: 'W3', newUsers: 289, activeUsers: 3890 },
  { week: 'W4', newUsers: 445, activeUsers: 4123 },
  { week: 'W5', newUsers: 398, activeUsers: 4234 },
];

const DASHBOARDS: Record<string, DashboardConfig> = {
  'sales-performance': {
    id: 'sales-performance',
    name: 'Sales Performance',
    description: 'Track revenue, conversions, and sales trends across all channels',
    metrics: [
      {
        id: 'sp-m1',
        title: 'Total Revenue',
        value: '$2.4M',
        change: 12.5,
        changeLabel: 'vs last month',
        icon: DollarSign,
        insight: 'Strong performance driven by Electronics (+18%) and Mobile channel (+24%)',
        breakdown: [
          { label: 'This Week', value: '$580K' },
          { label: 'This Month', value: '$2.4M' },
          { label: 'Top Category', value: 'Electronics' },
          { label: 'vs Target', value: '-4% ($2.5M)' }
        ]
      },
      {
        id: 'sp-m2',
        title: 'Conversion Rate',
        value: '3.24%',
        change: -2.1,
        changeLabel: 'vs last month',
        icon: TrendingUp,
        insight: 'Decline in checkout conversion despite 15% traffic increase suggests flow issues',
        breakdown: [
          { label: 'Desktop', value: '3.8%' },
          { label: 'Mobile', value: '2.9%' },
          { label: 'Tablet', value: '3.1%' },
          { label: 'Peak Time', value: '4.2% (2-4PM)' }
        ]
      },
      {
        id: 'sp-m3',
        title: 'Average Order Value',
        value: '$127.50',
        change: 5.8,
        changeLabel: 'vs last month',
        icon: ShoppingCart,
        insight: 'AOV improvement driven by successful cross-sell strategy and accessory bundles',
        breakdown: [
          { label: 'With Bundle', value: '$145' },
          { label: 'No Bundle', value: '$98' },
          { label: 'New Customer', value: '$112' },
          { label: 'Returning', value: '$138' }
        ]
      },
      {
        id: 'sp-m4',
        title: 'Total Orders',
        value: '18,942',
        change: 8.3,
        changeLabel: 'vs last month',
        icon: BarChart3,
        insight: 'Order volume growing steadily across all channels, mobile leading at 30%',
        breakdown: [
          { label: 'E-commerce', value: '9,234' },
          { label: 'Mobile App', value: '5,890' },
          { label: 'Retail', value: '2,456' },
          { label: 'Wholesale', value: '1,362' }
        ]
      }
    ],
    charts: [
      {
        id: 'revenue-trend',
        title: 'Revenue Trend',
        description: 'Monthly revenue vs. target over the last 12 months',
        type: 'area',
        data: REVENUE_TREND_DATA
      },
      {
        id: 'sales-by-category',
        title: 'Sales by Category',
        description: 'Revenue distribution across product categories',
        type: 'pie',
        data: SALES_BY_CATEGORY_DATA
      },
      {
        id: 'conversion-funnel',
        title: 'Conversion Funnel',
        description: 'Customer journey from visitor to purchase',
        type: 'bar',
        data: CONVERSION_FUNNEL_DATA
      }
    ],
    tables: [
      {
        id: 'top-products',
        title: 'Top Performing Products',
        description: 'Best selling products by revenue in the last 30 days',
        columns: [
          { key: 'product', label: 'Product', align: 'left' },
          { key: 'category', label: 'Category', align: 'left' },
          { key: 'revenue', label: 'Revenue', align: 'right' },
          { key: 'units', label: 'Units Sold', align: 'right' },
          { key: 'growth', label: 'Growth', align: 'right' }
        ],
        rows: [
          { product: 'Wireless Headphones Pro', category: 'Electronics', revenue: '$145,230', units: '1,234', growth: '+18%', growthValue: 18 },
          { product: 'Smart Watch Series 5', category: 'Electronics', revenue: '$128,900', units: '987', growth: '+24%', growthValue: 24 },
          { product: 'USB-C Cable 3-Pack', category: 'Accessories', revenue: '$89,450', units: '4,567', growth: '+12%', growthValue: 12 },
          { product: 'Laptop Stand Aluminum', category: 'Accessories', revenue: '$76,340', units: '1,890', growth: '+8%', growthValue: 8 },
          { product: 'Wireless Mouse', category: 'Electronics', revenue: '$62,120', units: '2,345', growth: '-3%', growthValue: -3 },
          { product: 'Mechanical Keyboard RGB', category: 'Electronics', revenue: '$58,920', units: '456', growth: '+15%', growthValue: 15 },
          { product: 'Monitor 27" 4K', category: 'Electronics', revenue: '$52,340', units: '123', growth: '+9%', growthValue: 9 },
          { product: 'Webcam HD Pro', category: 'Electronics', revenue: '$48,670', units: '789', growth: '+22%', growthValue: 22 },
        ]
      },
      {
        id: 'sales-by-channel',
        title: 'Sales by Channel',
        description: 'Revenue breakdown across different sales channels',
        columns: [
          { key: 'channel', label: 'Channel', align: 'left' },
          { key: 'revenue', label: 'Revenue', align: 'right' },
          { key: 'orders', label: 'Orders', align: 'right' },
          { key: 'aov', label: 'AOV', align: 'right' },
          { key: 'share', label: 'Share', align: 'right' }
        ],
        rows: [
          { channel: 'E-commerce Website', revenue: '$1.2M', orders: '9,234', aov: '$130', share: '50%' },
          { channel: 'Mobile App', revenue: '$720K', orders: '5,890', aov: '$122', share: '30%' },
          { channel: 'Retail Stores', revenue: '$360K', orders: '2,456', aov: '$147', share: '15%' },
          { channel: 'Wholesale', revenue: '$120K', orders: '1,362', aov: '$88', share: '5%' }
        ]
      }
    ],
    insights: [
      'Revenue increased 12.5% this month, driven primarily by a 24% surge in smart watch sales following the Series 5 launch.',
      'Conversion rate declined 2.1% despite higher traffic, suggesting potential issues with the checkout flow that warrant investigation.',
      'Average order value improved 5.8% as customers increasingly bundle accessories with main purchases, validating the recent cross-sell recommendations.',
      'Mobile app sales continue strong growth trajectory at 30% of total revenue, suggesting mobile-first strategy is paying off.'
    ]
  },
  'user-analytics': {
    id: 'user-analytics',
    name: 'User Analytics',
    description: 'Understand user behavior, engagement, and growth patterns',
    metrics: [
      {
        id: 'ua-m1',
        title: 'Active Users',
        value: '4,234',
        change: 8.2,
        changeLabel: 'vs last month',
        icon: Users
      },
      {
        id: 'ua-m2',
        title: 'New Signups',
        value: '892',
        change: 23.4,
        changeLabel: 'vs last month',
        icon: TrendingUp
      },
      {
        id: 'ua-m3',
        title: 'Engagement Rate',
        value: '68%',
        change: 4.1,
        changeLabel: 'vs last month',
        icon: Activity
      },
      {
        id: 'ua-m4',
        title: 'Avg Session Duration',
        value: '8m 32s',
        change: -1.8,
        changeLabel: 'vs last month',
        icon: BarChart3
      }
    ],
    charts: [
      {
        id: 'user-growth',
        title: 'User Growth Trend',
        description: 'New users and active users over the last 5 weeks',
        type: 'line',
        data: USER_GROWTH_DATA
      }
    ],
    tables: [
      {
        id: 'user-cohorts',
        title: 'User Cohorts',
        description: 'Retention rates by signup cohort',
        columns: [
          { key: 'cohort', label: 'Cohort', align: 'left' },
          { key: 'users', label: 'Users', align: 'right' },
          { key: 'week1', label: 'Week 1', align: 'right' },
          { key: 'week2', label: 'Week 2', align: 'right' },
          { key: 'week4', label: 'Week 4', align: 'right' }
        ],
        rows: [
          { cohort: 'December 2024', users: '892', week1: '78%', week2: '64%', week4: '52%' },
          { cohort: 'November 2024', users: '756', week1: '76%', week2: '61%', week4: '48%' },
          { cohort: 'October 2024', users: '834', week1: '74%', week2: '59%', week4: '45%' },
          { cohort: 'September 2024', users: '698', week1: '72%', week2: '56%', week4: '42%' }
        ]
      }
    ],
    insights: [
      'Active user base grew 8.2% this month, with particularly strong growth in the 25-34 age demographic.',
      'New signups surged 23.4% following the social media campaign launch, exceeding projections by 15%.',
      'Recent cohorts show improved retention rates, suggesting onboarding improvements are having positive impact.'
    ]
  }
};

export default function DashboardDetail() {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const dashboard = dashboardId ? DASHBOARDS[dashboardId] : null;

  if (!dashboard) {
    return (
      <div className="h-full flex items-center justify-center bg-[#FAFBFC]">
        <div className="text-center">
          <p className="text-lg text-[#666666] mb-4">Dashboard not found</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleMetricDeepDive = (metric: MetricCard) => {
    // Create a summary of the metric data
    const metricSummary = {
      title: metric.title,
      value: metric.value,
      change: `${metric.change > 0 ? '+' : ''}${metric.change}%`,
      changeLabel: metric.changeLabel,
      insight: metric.insight,
      breakdown: metric.breakdown
    };
    
    // Store data in sessionStorage to avoid URL encoding issues
    sessionStorage.setItem('deepdive_metric_data', JSON.stringify(metricSummary));
    navigate(`/chat/new?deepdive=metric`);
  };

  const handleTableDeepDive = (table: TableData) => {
    const question = `Show me insights about ${table.title}`;
    navigate(`/chat?context=dashboard&dashboard=${dashboard.id}&table=${table.id}&question=${encodeURIComponent(question)}`);
  };

  const handleChartDeepDive = (chart: ChartConfig) => {
    const question = `Analyze the ${chart.title} and provide insights`;
    navigate(`/chat?context=dashboard&dashboard=${dashboard.id}&chart=${chart.id}&question=${encodeURIComponent(question)}`);
  };

  const handleAskQuestion = () => {
    if (searchQuery.trim()) {
      navigate(`/chat?context=dashboard&dashboard=${dashboard.id}&question=${encodeURIComponent(searchQuery)}`);
    }
  };

  const renderChart = (chart: ChartConfig) => {
    switch (chart.type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chart.data}>
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
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="#CCCCCC" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #EEEEEE',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis 
                dataKey="stage" 
                tick={{ fill: '#666666', fontSize: 12 }}
                axisLine={{ stroke: '#EEEEEE' }}
              />
              <YAxis 
                tick={{ fill: '#666666', fontSize: 12 }}
                axisLine={{ stroke: '#EEEEEE' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #EEEEEE',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'count') return value.toLocaleString();
                  if (name === 'percentage') return `${value}%`;
                  return value;
                }}
              />
              <Bar dataKey="count" fill="#00B5B3" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis 
                dataKey="week" 
                tick={{ fill: '#666666', fontSize: 12 }}
                axisLine={{ stroke: '#EEEEEE' }}
              />
              <YAxis 
                tick={{ fill: '#666666', fontSize: 12 }}
                axisLine={{ stroke: '#EEEEEE' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #EEEEEE',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#00B5B3" 
                strokeWidth={2}
                dot={{ fill: '#00B5B3', r: 4 }}
                name="New Users"
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 4 }}
                name="Active Users"
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFBFC] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-[#666666] hover:text-[#00B5B3]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-[#111827] mb-1">{dashboard.name}</h1>
              <p className="text-sm text-[#666666]">{dashboard.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                <Input
                  placeholder="Ask a question about this data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  className="pl-10 pr-4 h-10"
                />
              </div>
              <Button
                onClick={handleAskQuestion}
                disabled={!searchQuery.trim()}
                className="bg-[#00B5B3] hover:bg-[#00A5A3] text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ask
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
          {/* Metrics Grid */}
          <div>
            <h2 className="text-lg font-semibold text-[#111827] mb-4">Key Metrics</h2>
            <div className="grid grid-cols-4 gap-4">
              {dashboard.metrics.map((metric) => {
                const Icon = metric.icon;
                const isPositive = metric.change > 0;
                const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
                
                return (
                  <Card
                    key={metric.id}
                    className="p-6 border border-[#EEEEEE] hover:border-[#00B5B3] hover:shadow-lg transition-all group relative"
                  >
                    {/* Hover Tooltip */}
                    {metric.insight && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-br from-[#E0F7F7] to-white border border-[#00B5B3] rounded-t-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 -translate-y-full shadow-xl">
                        <div className="flex items-start gap-2 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#00B5B3] flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-[#333333] leading-relaxed">{metric.insight}</p>
                        </div>
                        {metric.breakdown && metric.breakdown.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5">
                            {metric.breakdown.map((item, idx) => (
                              <div key={idx} className="bg-white/70 rounded px-2 py-1">
                                <p className="text-xs text-[#666666] mb-0.5">{item.label}</p>
                                <p className="text-xs font-semibold text-[#111827]">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center group-hover:bg-[#00B5B3] transition-colors">
                        <Icon className="w-5 h-5 text-[#00B5B3] group-hover:text-white transition-colors" />
                      </div>
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
                        onClick={() => handleMetricDeepDive(metric)}
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

          {/* Charts Section */}
          {dashboard.charts.length > 0 && (
            <div className="grid grid-cols-2 gap-6">
              {dashboard.charts.map((chart) => (
                <Card key={chart.id} className="border border-[#EEEEEE] overflow-hidden group">
                  <div className="p-6 border-b border-[#EEEEEE] bg-[#FAFBFC] flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-[#EEEEEE] flex items-center justify-center">
                        {chart.type === 'line' && <LineChartIcon className="w-5 h-5 text-[#00B5B3]" />}
                        {chart.type === 'bar' && <BarChart3 className="w-5 h-5 text-[#00B5B3]" />}
                        {chart.type === 'area' && <Activity className="w-5 h-5 text-[#00B5B3]" />}
                        {chart.type === 'pie' && <PieChartIcon className="w-5 h-5 text-[#00B5B3]" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#111827] mb-1">{chart.title}</h3>
                        <p className="text-sm text-[#666666]">{chart.description}</p>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChartDeepDive(chart)}
                      className="text-[#00B5B3] border-[#00B5B3] hover:bg-[#E0F7F7] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Sparkles className="w-3 h-3 mr-1.5" />
                      Deep Dive
                    </Button>
                  </div>
                  
                  <div className="p-6 bg-white">
                    {renderChart(chart)}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* AI Insights */}
          {dashboard.insights.length > 0 && (
            <Card className="p-6 border border-[#EEEEEE] bg-gradient-to-br from-[#E0F7F7] to-white">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#00B5B3] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">AI-Generated Insights</h3>
                  <p className="text-sm text-[#666666]">Key findings and recommendations from your data</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {dashboard.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-[#E0F7F7]">
                    <div className="w-6 h-6 rounded bg-[#E0F7F7] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-[#00B5B3]">{index + 1}</span>
                    </div>
                    <p className="text-sm text-[#333333] leading-relaxed flex-1">{insight}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Data Tables */}
          {dashboard.tables.map((table) => (
            <Card key={table.id} className="border border-[#EEEEEE] overflow-hidden group">
              <div className="p-6 border-b border-[#EEEEEE] bg-[#FAFBFC] flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#EEEEEE] flex items-center justify-center">
                    <TableIcon className="w-5 h-5 text-[#00B5B3]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#111827] mb-1">{table.title}</h3>
                    <p className="text-sm text-[#666666]">{table.description}</p>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTableDeepDive(table)}
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
                      {table.columns.map((col) => (
                        <th 
                          key={col.key}
                          className={`px-6 py-3 text-xs font-medium text-[#666666] uppercase tracking-wider ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#F0F0F0]">
                    {table.rows.map((row, idx) => (
                      <tr 
                        key={idx}
                        className="hover:bg-[#FAFBFC] transition-colors"
                      >
                        {table.columns.map((col) => {
                          const value = row[col.key];
                          const isGrowth = col.key === 'growth';
                          const growthValue = row.growthValue;
                          const isPositive = isGrowth && growthValue > 0;
                          const isNegative = isGrowth && growthValue < 0;
                          
                          return (
                            <td 
                              key={col.key}
                              className={`px-6 py-4 whitespace-nowrap text-sm ${
                                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                              }`}
                            >
                              {isGrowth ? (
                                <span className={`font-medium ${
                                  isPositive ? 'text-[#4CAF50]' : isNegative ? 'text-[#F04438]' : 'text-[#666666]'
                                }`}>
                                  {value}
                                </span>
                              ) : (
                                <span className="text-[#333333]">{value}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}