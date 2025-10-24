import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  ArrowLeft,
  Database,
  Users,
  Network,
  TrendingUp,
  MessageSquare,
  Calendar,
  Activity,
  Settings,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  PlayCircle,
  PauseCircle,
  Plus,
  Link2,
  ArrowRight,
  Zap,
  Sparkles,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';

interface SampleQuery {
  id: string;
  question: string;
  answer: string;
  sqlQuery: string;
  executionCount: number;
  lastUsed: string;
}

interface Metric {
  id: string;
  name: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

interface AgentConnection {
  id: string;
  agentId: string;
  agentName: string;
  agentDescription: string;
  relationshipType: 'one-way' | 'bidirectional';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'paused';
  useForKeywords: string[];
  usageCount: number;
  lastUsed: string;
}

const MOCK_AGENT = {
  id: 'sales-analytics-agent',
  name: 'Sales Analytics Agent',
  description: 'Analyzes sales performance, inventory trends, and customer behavior',
  status: 'active',
  createdAt: '2024-10-15',
  updatedAt: '2024-10-24',
  createdBy: 'Sarah Johnson',
  targetUsers: ['Sales Managers', 'Business Analysts'],
  tables: [
    'ecommerce.orders',
    'ecommerce.order_items',
    'ecommerce.customers',
    'ecommerce.products',
    'warehouse.inventory',
    'logistics.shipments',
  ],
  relationships: [
    { from: 'orders.customer_id', to: 'customers.id', type: 'One-to-Many' },
    { from: 'order_items.order_id', to: 'orders.id', type: 'One-to-Many' },
    { from: 'order_items.product_id', to: 'products.id', type: 'Many-to-One' },
  ],
  queryCount: 1247,
  activeUsers: 23,
};

const MOCK_METRICS: Metric[] = [
  {
    id: '1',
    name: 'Total Revenue',
    value: '$2,450,000',
    change: '+12.5%',
    trend: 'up',
    description: 'Last 30 days',
  },
  {
    id: '2',
    name: 'Average Order Value',
    value: '$127.50',
    change: '-3.2%',
    trend: 'down',
    description: 'Last 30 days',
  },
  {
    id: '3',
    name: 'Active Customers',
    value: '4,234',
    change: '+8.1%',
    trend: 'up',
    description: 'Last 30 days',
  },
  {
    id: '4',
    name: 'Inventory Turnover',
    value: '6.2x',
    change: '+0.4',
    trend: 'up',
    description: 'Last 90 days',
  },
];

const MOCK_SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: '1',
    question: 'What were our total sales last month?',
    answer: 'Total sales for last month were $2.4M, representing a 12% increase compared to the previous month.',
    sqlQuery: `SELECT 
  SUM(total_amount) as total_sales,
  COUNT(*) as order_count
FROM orders
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND created_at < DATE_TRUNC('month', CURRENT_DATE)`,
    executionCount: 156,
    lastUsed: '2 hours ago',
  },
  {
    id: '2',
    question: 'Which products are currently low in stock?',
    answer: 'There are 8 products with stock levels below the reorder threshold.',
    sqlQuery: `SELECT 
  p.name,
  i.quantity_available,
  i.reorder_threshold
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.quantity_available < i.reorder_threshold
ORDER BY (i.reorder_threshold - i.quantity_available) DESC`,
    executionCount: 89,
    lastUsed: '5 hours ago',
  },
  {
    id: '3',
    question: 'Who are our top 10 customers by revenue?',
    answer: 'The top 10 customers account for $850K in total revenue.',
    sqlQuery: `SELECT 
  c.name,
  c.email,
  SUM(o.total_amount) as lifetime_value
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
ORDER BY lifetime_value DESC
LIMIT 10`,
    executionCount: 234,
    lastUsed: '1 day ago',
  },
];

const USER_CONVERSATIONS = [
  {
    id: '1',
    user: 'Sarah Johnson',
    timestamp: '2024-10-24 14:32',
    question: 'What were our top 5 products by revenue last quarter?',
    answer: 'Based on sales data, the top 5 products were: 1) Premium Laptop ($450K), 2) Wireless Mouse ($280K), 3) Mechanical Keyboard ($210K), 4) USB-C Hub ($185K), 5) Monitor Stand ($120K). Total revenue from top 5: $1.245M.',
    satisfaction: 'positive',
  },
  {
    id: '2',
    user: 'Mike Chen',
    timestamp: '2024-10-24 11:15',
    question: 'Show me customers who haven\'t ordered in the last 90 days',
    answer: 'There are 342 customers who haven\'t placed an order in the last 90 days. The average time since last order is 112 days. Would you like to see a breakdown by customer segment?',
    satisfaction: 'positive',
  },
  {
    id: '3',
    user: 'Alex Rivera',
    timestamp: '2024-10-23 16:45',
    question: 'What is our inventory turnover rate for electronics category?',
    answer: 'The inventory turnover rate for electronics is 6.2x over the last 90 days, which is above the industry average of 5.1x. This indicates healthy inventory movement.',
    satisfaction: 'positive',
  },
  {
    id: '4',
    user: 'Sarah Johnson',
    timestamp: '2024-10-23 09:20',
    question: 'Which shipping zones have the highest delay rates?',
    answer: 'Zone 4 (West Coast) has the highest delay rate at 12.3%, followed by Zone 7 (Alaska/Hawaii) at 11.8%. The primary cause is warehouse capacity constraints in those regions.',
    satisfaction: 'neutral',
  },
];

// Set to empty to show the "Complete Setup" banner
const MOCK_CONNECTIONS: AgentConnection[] = [];

// Example with connections (uncomment to see full state):
/*
const MOCK_CONNECTIONS: AgentConnection[] = [
  {
    id: '1',
    agentId: 'customer-insights-agent',
    agentName: 'Customer Insights Agent',
    agentDescription: 'Analyzes customer behavior, segmentation, and churn patterns',
    relationshipType: 'one-way',
    priority: 'high',
    status: 'active',
    useForKeywords: ['customer behavior', 'churn', 'segmentation', 'retention'],
    usageCount: 234,
    lastUsed: '2 hours ago',
  },
  {
    id: '2',
    agentId: 'product-analytics-agent',
    agentName: 'Product Analytics Agent',
    agentDescription: 'Tracks product performance, pricing analysis, and SKU trends',
    relationshipType: 'bidirectional',
    priority: 'medium',
    status: 'active',
    useForKeywords: ['product performance', 'pricing', 'SKU analysis'],
    usageCount: 156,
    lastUsed: '5 hours ago',
  },
  {
    id: '3',
    agentId: 'forecasting-agent',
    agentName: 'Forecasting Agent',
    agentDescription: 'Provides predictive analytics and trend forecasting',
    relationshipType: 'one-way',
    priority: 'medium',
    status: 'active',
    useForKeywords: ['forecast', 'prediction', 'trends', 'future'],
    usageCount: 89,
    lastUsed: '1 day ago',
  },
];
*/

export function AgentDetails() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [hasRelationships] = useState(MOCK_CONNECTIONS.length > 0);
  const [showRelationshipBanner, setShowRelationshipBanner] = useState(!MOCK_CONNECTIONS.length);

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        toast.success('Edit functionality coming soon');
        break;
      case 'duplicate':
        toast.success('Agent duplicated');
        break;
      case 'pause':
        toast.success('Agent paused');
        break;
      case 'delete':
        toast.error('Delete functionality requires confirmation');
        break;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FAFBFC]">
      {/* Relationship Setup Banner */}
      {showRelationshipBanner && (
        <div className="bg-gradient-to-r from-[#F79009] to-[#F79009]/80 px-8 py-4 border-b-2 border-[#F79009]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-0.5">Complete Your Agent Setup</h3>
                <p className="text-xs text-white/90">
                  Connect this agent to other agents to unlock its full potential. Without relationships, this agent works in isolation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-white text-[#F79009] hover:bg-white/90"
                onClick={() => navigate('/configure-relationships/sales-analytics-agent')}
              >
                Configure Relationships
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setShowRelationshipBanner(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] px-8 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-[#333333]">{MOCK_AGENT.name}</h1>
                <Badge className="bg-[#00B98E] text-white">
                  <Activity className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-[#666666] mb-3">{MOCK_AGENT.description}</p>
              <div className="flex items-center gap-4 text-xs text-[#999999]">
                <span>Created {MOCK_AGENT.createdAt}</span>
                <span>•</span>
                <span>Updated {MOCK_AGENT.updatedAt}</span>
                <span>•</span>
                <span>By {MOCK_AGENT.createdBy}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <PlayCircle className="w-4 h-4 mr-2" />
              Test Agent
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleAction('edit')}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Configuration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('duplicate')}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction('pause')}>
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Pause Agent
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAction('delete')} className="text-[#F04438]">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#666666]" />
            <span className="text-sm text-[#333333] font-medium">{MOCK_AGENT.queryCount.toLocaleString()}</span>
            <span className="text-xs text-[#999999]">queries</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#666666]" />
            <span className="text-sm text-[#333333] font-medium">{MOCK_AGENT.activeUsers}</span>
            <span className="text-xs text-[#999999]">active users</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#666666]" />
            <span className="text-sm text-[#333333] font-medium">{MOCK_AGENT.tables.length}</span>
            <span className="text-xs text-[#999999]">tables</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-white border-b border-[#EEEEEE] px-8">
          <TabsList className="bg-transparent h-12">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="queries" className="text-sm">Golden Queries</TabsTrigger>
            <TabsTrigger value="connected-agents" className="text-sm">Connected Agents</TabsTrigger>
            <TabsTrigger value="configuration" className="text-sm">Configuration</TabsTrigger>
            <TabsTrigger value="conversations" className="text-sm">User Conversations</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-8 py-6">
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* Metrics */}
            <div>
              <h3 className="text-sm font-semibold text-[#333333] mb-4">Key Metrics</h3>
              <div className="grid grid-cols-4 gap-4">
                {MOCK_METRICS.map((metric) => (
                  <Card key={metric.id} className="p-4 border border-[#EEEEEE]">
                    <div className="flex items-start justify-between mb-2">
                      <TrendingUp className="w-4 h-4 text-[#00B5B3]" />
                      <Badge
                        variant="outline"
                        className={
                          metric.trend === 'up'
                            ? 'text-[#00B98E] border-[#00B98E]'
                            : metric.trend === 'down'
                            ? 'text-[#F04438] border-[#F04438]'
                            : 'text-[#666666] border-[#666666]'
                        }
                      >
                        {metric.change}
                      </Badge>
                    </div>
                    <div className="text-2xl font-semibold text-[#333333] mb-1">{metric.value}</div>
                    <div className="text-xs font-medium text-[#333333] mb-1">{metric.name}</div>
                    <div className="text-xs text-[#999999]">{metric.description}</div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-5 border border-[#EEEEEE]">
                <h4 className="text-sm font-semibold text-[#333333] mb-4">Target Users</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00B5B3]" />
                    <div className="flex-1">
                      <p className="text-xs text-[#333333]">{MOCK_AGENT.targetUsers.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border border-[#EEEEEE]">
                <h4 className="text-sm font-semibold text-[#333333] mb-4">Data Tables</h4>
                <div className="flex flex-wrap gap-2">
                  {MOCK_AGENT.tables.map((table) => (
                    <Badge key={table} variant="outline" className="text-xs">
                      {table}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            {/* Relationships */}
            <Card className="p-5 border border-[#EEEEEE]">
              <h4 className="text-sm font-semibold text-[#333333] mb-4">
                <Network className="w-4 h-4 inline mr-2 text-[#00B5B3]" />
                Table Relationships
              </h4>
              <div className="space-y-2">
                {MOCK_AGENT.relationships.map((rel, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded border border-[#EEEEEE]">
                    <code className="text-xs font-mono text-[#00B5B3]">{rel.from}</code>
                    <span className="text-xs text-[#999999]">→</span>
                    <code className="text-xs font-mono text-[#00B5B3]">{rel.to}</code>
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {rel.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Connected Agents Tab */}
          <TabsContent value="connected-agents" className="mt-0 space-y-6">
            {/* Header */}
            <Card className="p-5 border border-[#E0F7F7] bg-[#F0FFFE]">
              <div className="flex items-start gap-3">
                <Link2 className="w-5 h-5 text-[#00B5B3] mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#333333] mb-1">Connected Agents</h3>
                  <p className="text-xs text-[#666666]">
                    This agent can reference other agents for specialized knowledge. Connected agents answer questions outside this agent's primary domain.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-[#00B5B3] hover:bg-[#009996]"
                  onClick={() => navigate('/configure-relationships/sales-analytics-agent')}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  {MOCK_CONNECTIONS.length === 0 ? 'Configure Now' : 'Add Connection'}
                </Button>
              </div>
            </Card>

            {/* Empty State with AI Suggestions */}
            {MOCK_CONNECTIONS.length === 0 && (
              <Card className="p-6 border-2 border-dashed border-[#F79009] bg-[#FFF9F0]">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-[#F79009]/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[#F79009]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#333333] mb-2">No Connections Yet</h3>
                  <p className="text-xs text-[#666666] mb-4">
                    This agent is working in isolation. Connect it to other agents to unlock its full potential and provide more comprehensive answers.
                  </p>
                  <Button
                    className="bg-[#F79009] hover:bg-[#E67E00] text-white"
                    onClick={() => navigate('/configure-relationships/sales-analytics-agent')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    View AI Suggestions
                  </Button>
                </div>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 border border-[#EEEEEE]">
                <div className="text-2xl font-semibold text-[#00B5B3] mb-1">
                  {MOCK_CONNECTIONS.length}
                </div>
                <div className="text-xs text-[#666666]">Total Connections</div>
              </Card>
              <Card className="p-4 border border-[#EEEEEE]">
                <div className="text-2xl font-semibold text-[#00B5B3] mb-1">
                  {MOCK_CONNECTIONS.reduce((acc, c) => acc + c.usageCount, 0)}
                </div>
                <div className="text-xs text-[#666666]">Total Routing Events</div>
              </Card>
              <Card className="p-4 border border-[#EEEEEE]">
                <div className="text-2xl font-semibold text-[#00B5B3] mb-1">
                  {MOCK_CONNECTIONS.filter(c => c.status === 'active').length}
                </div>
                <div className="text-xs text-[#666666]">Active Connections</div>
              </Card>
            </div>

            {/* Connection List */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#333333]">All Connections</h3>
              
              {MOCK_CONNECTIONS.map((connection) => (
                <Card key={connection.id} className="p-5 border border-[#EEEEEE]">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5 text-[#00B5B3]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-[#333333]">{connection.agentName}</h4>
                            {connection.relationshipType === 'bidirectional' && (
                              <Badge variant="outline" className="text-[10px] h-5">
                                <ArrowRight className="w-3 h-3 mr-1" />
                                Bidirectional
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[#666666] mb-3">{connection.agentDescription}</p>
                        </div>
                        <Badge
                          className={
                            connection.priority === 'high'
                              ? 'bg-[#00B98E] text-white'
                              : connection.priority === 'medium'
                              ? 'bg-[#F79009] text-white'
                              : 'bg-[#666666] text-white'
                          }
                        >
                          {connection.priority} priority
                        </Badge>
                      </div>

                      {/* Keywords */}
                      <div className="mb-3">
                        <p className="text-[10px] font-medium text-[#999999] uppercase tracking-wide mb-1.5">
                          Use For:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {connection.useForKeywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px]">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#EEEEEE]">
                        <div className="flex items-center gap-4 text-xs text-[#999999]">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {connection.usageCount} uses
                          </span>
                          <span>•</span>
                          <span>Last used {connection.lastUsed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <PlayCircle className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7 text-[#F04438] border-[#F04438]">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Golden Queries Tab */}
          <TabsContent value="queries" className="mt-0 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#333333] mb-1">Golden Queries</h3>
                <p className="text-xs text-[#666666]">Pre-validated, high-quality queries that showcase agent capabilities</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#999999]">{MOCK_SAMPLE_QUERIES.length} queries</span>
                <Button size="sm" variant="outline">
                  <Plus className="w-3 h-3 mr-2" />
                  Add Query
                </Button>
              </div>
            </div>

            {MOCK_SAMPLE_QUERIES.map((query) => (
              <Card key={query.id} className="p-5 border border-[#EEEEEE]">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[#333333]">{query.question}</h4>
                  <div className="flex items-center gap-3 text-xs text-[#999999]">
                    <span>{query.executionCount} executions</span>
                    <span>•</span>
                    <span>Last used {query.lastUsed}</span>
                  </div>
                </div>

                <div className="bg-[#F8F9FA] rounded p-3 mb-3 border border-[#EEEEEE]">
                  <p className="text-xs text-[#333333]">{query.answer}</p>
                </div>

                <details className="text-xs">
                  <summary className="cursor-pointer text-[#666666] hover:text-[#00B5B3] mb-2 font-medium">
                    View SQL Query
                  </summary>
                  <pre className="bg-[#F8F9FA] p-3 rounded font-mono text-[10px] text-[#333333] overflow-x-auto border border-[#EEEEEE]">
                    {query.sqlQuery}
                  </pre>
                </details>
              </Card>
            ))}
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="mt-0 space-y-6">
            <Card className="p-5 border border-[#EEEEEE]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#333333]">Agent Configuration</h3>
                <Button size="sm" variant="outline">
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#666666]">Agent Name</label>
                  <p className="text-sm text-[#333333] mt-1">{MOCK_AGENT.name}</p>
                </div>

                <Separator />

                <div>
                  <label className="text-xs font-medium text-[#666666]">Description</label>
                  <p className="text-sm text-[#333333] mt-1">{MOCK_AGENT.description}</p>
                </div>

                <Separator />

                <div>
                  <label className="text-xs font-medium text-[#666666]">Target Users</label>
                  <p className="text-sm text-[#333333] mt-1">{MOCK_AGENT.targetUsers.join(', ')}</p>
                </div>

                <Separator />

                <div>
                  <label className="text-xs font-medium text-[#666666]">Data Sources</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MOCK_AGENT.tables.map((table) => (
                      <Badge key={table} variant="outline" className="text-xs">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-xs font-medium text-[#666666]">Status</label>
                  <div className="mt-2">
                    <Badge className="bg-[#00B98E] text-white">Active</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* User Conversations Tab */}
          <TabsContent value="conversations" className="mt-0 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#333333] mb-1">User Conversations</h3>
                <p className="text-xs text-[#666666]">Real conversations where users interacted with this agent</p>
              </div>
              <span className="text-xs text-[#999999]">{USER_CONVERSATIONS.length} conversations</span>
            </div>

            {USER_CONVERSATIONS.map((conv) => (
              <Card key={conv.id} className="p-5 border border-[#EEEEEE]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#E0F7F7] flex items-center justify-center">
                      <Users className="w-4 h-4 text-[#00B5B3]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#333333]">{conv.user}</p>
                      <p className="text-xs text-[#999999]">{conv.timestamp}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      conv.satisfaction === 'positive'
                        ? 'text-[#00B98E] border-[#00B98E]'
                        : conv.satisfaction === 'neutral'
                        ? 'text-[#F79009] border-[#F79009]'
                        : 'text-[#F04438] border-[#F04438]'
                    }
                  >
                    {conv.satisfaction === 'positive' ? '👍 Helpful' : conv.satisfaction === 'neutral' ? '😐 Neutral' : '👎 Not helpful'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#666666]" />
                      <span className="text-xs font-medium text-[#666666]">Question</span>
                    </div>
                    <p className="text-sm text-[#333333] pl-5">{conv.question}</p>
                  </div>

                  <div className="bg-[#F8F9FA] rounded p-3 border border-[#EEEEEE]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#00B5B3]" />
                      <span className="text-xs font-medium text-[#00B5B3]">Agent Response</span>
                    </div>
                    <p className="text-sm text-[#333333]">{conv.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
