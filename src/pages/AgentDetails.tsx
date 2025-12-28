import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
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
  PauseCircle,
  Plus,
  Link2,
  ArrowRight,
  Zap,
  Sparkles,
  X,
  Share2,
  UserPlus,
  Mail,
  Globe,
  Lock,
  PlayCircle,
  Send,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner@2.0.3';
import { useAuthStore, hasPermission } from '../lib/authStore';

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

interface SharedUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: string;
}

const MOCK_SHARED_USERS: SharedUser[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'owner',
    addedAt: '2024-10-15',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'editor',
    addedAt: '2024-10-18',
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'viewer',
    addedAt: '2024-10-20',
  },
];

export function AgentDetails() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [agentVisibility, setAgentVisibility] = useState<'public' | 'private'>('private');
  const [sharedUsers, setSharedUsers] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'viewer' | 'editor'>('viewer');
  
  // New modal states
  const [showConnectedAgentModal, setShowConnectedAgentModal] = useState(false);
  const [showGoldenQueryModal, setShowGoldenQueryModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<AgentConnection | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<SampleQuery | null>(null);
  const [chatMode, setChatMode] = useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = useState('overview');
  const [showRelationshipBanner, setShowRelationshipBanner] = useState(MOCK_CONNECTIONS.length === 0);

  const canEditAgents = user ? hasPermission(user.role, 'canEditAgents') : false;
  const canDeleteAgents = user ? hasPermission(user.role, 'canDeleteAgents') : false;
  


  const handleAction = (action: string) => {
    switch (action) {
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



  const handleAddUser = () => {
    if (!newUserEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Check if user already has access
    if (sharedUsers.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      toast.error('User already has access to this agent');
      return;
    }

    const newUser: SharedUser = {
      id: Date.now().toString(),
      name: newUserEmail.split('@')[0].replace('.', ' '),
      email: newUserEmail,
      role: newUserRole,
      addedAt: new Date().toISOString().split('T')[0],
    };

    setSharedUsers([...sharedUsers, newUser]);
    setNewUserEmail('');
    setNewUserRole('viewer');
    toast.success(`Shared with ${newUserEmail}`);
  };

  const handleRemoveUser = (userId: string) => {
    setSharedUsers(sharedUsers.filter(u => u.id !== userId));
    toast.success('Access removed');
  };

  const handleChangeRole = (userId: string, newRole: 'editor' | 'viewer') => {
    setSharedUsers(sharedUsers.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
    toast.success('Role updated');
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFBFC]">
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
            <div className="flex-1">
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
            {canEditAgents && (
              <Button 
                size="sm"
                onClick={() => navigate(`/agents/${agentId}/edit/step-1`)}
                className="bg-[#00B5B3] hover:bg-[#009996] text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Agent
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {(canEditAgents || canDeleteAgents) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEditAgents && (
                    <>
                      <DropdownMenuItem onClick={() => handleAction('duplicate')}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('pause')}>
                        <PauseCircle className="w-4 h-4 mr-2" />
                        Pause Agent
                      </DropdownMenuItem>
                    </>
                  )}
                  {canEditAgents && canDeleteAgents && <DropdownMenuSeparator />}
                  {canDeleteAgents && (
                    <DropdownMenuItem onClick={() => handleAction('delete')} className="text-[#F04438]">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Agent
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-[#EEEEEE] px-8">
          <TabsList className="bg-transparent h-12">
            <TabsTrigger 
              value="overview" 
              className="text-sm data-[state=active]:text-[#00B5B3] data-[state=active]:border-b-2 data-[state=active]:border-[#00B5B3]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="queries" 
              className="text-sm data-[state=active]:text-[#00B5B3] data-[state=active]:border-b-2 data-[state=active]:border-[#00B5B3]"
            >
              Golden Queries
            </TabsTrigger>
            <TabsTrigger 
              value="connected-agents" 
              className="text-sm data-[state=active]:text-[#00B5B3] data-[state=active]:border-b-2 data-[state=active]:border-[#00B5B3]"
            >
              Connected Agents
            </TabsTrigger>
            <TabsTrigger 
              value="configuration" 
              className="text-sm data-[state=active]:text-[#00B5B3] data-[state=active]:border-b-2 data-[state=active]:border-[#00B5B3]"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="conversations" 
              className="text-sm data-[state=active]:text-[#00B5B3] data-[state=active]:border-b-2 data-[state=active]:border-[#00B5B3]"
            >
              User Conversations
            </TabsTrigger>
          </TabsList>
        </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6 flex-1 overflow-y-auto px-8 py-6">
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
          <TabsContent value="connected-agents" className="mt-0 space-y-6 flex-1 overflow-y-auto px-8 py-6">
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
          <TabsContent value="queries" className="mt-0 space-y-4 flex-1 overflow-y-auto px-8 py-6">
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
          <TabsContent value="configuration" className="mt-0 space-y-6 flex-1 overflow-y-auto px-8 py-6">
            <Card className="p-5 border border-[#EEEEEE]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#333333]">Agent Configuration</h3>
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
          <TabsContent value="conversations" className="mt-0 space-y-4 flex-1 overflow-y-auto px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#333333] mb-1">User Conversations</h3>
                <p className="text-xs text-[#666666]">Real conversations where users interacted with this agent</p>
              </div>
              <span className="text-xs text-[#999999]">{USER_CONVERSATIONS.length} conversations</span>
            </div>

            {USER_CONVERSATIONS.map((conv) => (
              <Card 
                key={conv.id} 
                className="p-5 border border-[#EEEEEE] hover:border-[#00B5B3] transition-all cursor-pointer group"
                onClick={() => navigate(`/chat?conversation=${conv.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#E0F7F7] flex items-center justify-center group-hover:bg-[#00B5B3] transition-colors">
                      <Users className="w-4 h-4 text-[#00B5B3] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#333333]">{conv.user}</p>
                      <p className="text-xs text-[#999999]">{conv.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <ArrowRight className="w-4 h-4 text-[#999999] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#666666]" />
                      <span className="text-xs font-medium text-[#666666]">Question</span>
                    </div>
                    <p className="text-sm text-[#333333] pl-5">{conv.question}</p>
                  </div>

                  <div className="bg-[#F8F9FA] rounded p-3 border border-[#EEEEEE] group-hover:bg-[#E0F7F7] transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#00B5B3]" />
                      <span className="text-xs font-medium text-[#00B5B3]">Agent Response</span>
                    </div>
                    <p className="text-sm text-[#333333]">{conv.answer}</p>
                  </div>
                  
                  <div className="text-xs text-[#00B5B3] group-hover:underline pt-2">
                    Click to view full conversation →
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Agent</DialogTitle>
            <DialogDescription>
              Give others in your organization access to this agent
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Visibility Settings */}
            <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#EEEEEE]">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4 text-[#00B5B3]" />
                <h4 className="text-sm font-semibold text-[#333333]">Visibility</h4>
              </div>

              <RadioGroup value={agentVisibility} onValueChange={(value: 'public' | 'private') => setAgentVisibility(value)}>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 border border-[#DDDDDD] rounded-lg hover:border-[#00B5B3] transition-colors cursor-pointer" onClick={() => setAgentVisibility('public')}>
                    <RadioGroupItem value="public" id="visibility-public" className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-3.5 h-3.5 text-[#00B5B3]" />
                        <Label htmlFor="visibility-public" className="text-sm font-medium text-[#333333] cursor-pointer">
                          Public
                        </Label>
                      </div>
                      <p className="text-xs text-[#666666]">
                        Available to everyone in your organization
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border border-[#DDDDDD] rounded-lg hover:border-[#00B5B3] transition-colors cursor-pointer" onClick={() => setAgentVisibility('private')}>
                    <RadioGroupItem value="private" id="visibility-private" className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-3.5 h-3.5 text-[#00B5B3]" />
                        <Label htmlFor="visibility-private" className="text-sm font-medium text-[#333333] cursor-pointer">
                          Private
                        </Label>
                      </div>
                      <p className="text-xs text-[#666666]">
                        Only shared with specific people below
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Add New User */}
            {agentVisibility === 'private' && (
              <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#EEEEEE]">
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="w-4 h-4 text-[#00B5B3]" />
                  <h4 className="text-sm font-semibold text-[#333333]">Add People</h4>
                </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-[#666666] mb-2">Email Address</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddUser();
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                    <Select value={newUserRole} onValueChange={(v: any) => setNewUserRole(v)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div>
                            <p className="text-sm font-medium">Viewer</p>
                            <p className="text-xs text-[#666666]">Can view only</p>
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div>
                            <p className="text-sm font-medium">Editor</p>
                            <p className="text-xs text-[#666666]">Can edit agent</p>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleAddUser}
                      className="bg-[#00B5B3] hover:bg-[#009996]"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Current Access */}
            {agentVisibility === 'private' && (
              <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#00B5B3]" />
                <h4 className="text-sm font-semibold text-[#333333]">
                  People with Access ({sharedUsers.length})
                </h4>
              </div>

              <div className="space-y-2">
                {sharedUsers.map((user) => (
                  <Card key={user.id} className="p-3 border border-[#EEEEEE]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E0F7F7] flex items-center justify-center">
                          <span className="text-xs font-semibold text-[#00B5B3]">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#333333]">{user.name}</p>
                          <p className="text-xs text-[#666666]">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {user.role === 'owner' ? (
                          <Badge variant="outline" className="text-xs">
                            Owner
                          </Badge>
                        ) : (
                          <>
                            <Select
                              value={user.role}
                              onValueChange={(v: any) => handleChangeRole(user.id, v)}
                            >
                              <SelectTrigger className="w-[110px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveUser(user.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4 text-[#666666]" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            )}

            {/* Info */}
            {agentVisibility === 'private' && (
              <div className="p-3 bg-[#F0FFFE] rounded border border-[#E0F7F7]">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#00B5B3] mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-[#333333] mb-1">Permission Levels</p>
                    <ul className="text-xs text-[#666666] space-y-1">
                      <li>• <strong>Viewer:</strong> Can view agent details and query results</li>
                      <li>• <strong>Editor:</strong> Can modify agent configuration and relationships</li>
                      <li>• <strong>Owner:</strong> Full control including sharing and deletion</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}