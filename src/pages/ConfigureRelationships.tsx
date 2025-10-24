import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { NetworkGraph } from '../components/NetworkGraph';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Link2,
  Sparkles,
  Plus,
  ArrowLeft,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Network as NetworkIcon,
  List,
  ArrowRight,
  Key,
  Send,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ForeignKeyConnection {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
}

interface ProposedConnection {
  id: string;
  targetAgentId: string;
  targetAgentName: string;
  targetAgentDescription: string;
  confidence: number;
  reason: string;
  suggestedPriority: 'high' | 'medium' | 'low';
  suggestedKeywords: string[];
  relationshipType: 'one-way' | 'bidirectional';
  foreignKeys: ForeignKeyConnection[];
  sharedTables: string[];
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  conversation: { role: 'ai' | 'user'; message: string; timestamp: Date }[];
}

interface AvailableAgent {
  id: string;
  name: string;
  description: string;
  tables: { schema: string; table: string; columns: string[] }[];
}

interface SourceTable {
  schema: string;
  table: string;
  columns: string[];
}

const SOURCE_TABLES: SourceTable[] = [
  {
    schema: 'ecommerce',
    table: 'orders',
    columns: ['id', 'customer_id', 'total_amount', 'status', 'created_at'],
  },
  {
    schema: 'ecommerce',
    table: 'order_items',
    columns: ['id', 'order_id', 'product_id', 'quantity', 'price'],
  },
  {
    schema: 'ecommerce',
    table: 'customers',
    columns: ['id', 'email', 'name', 'created_at'],
  },
];

const AI_PROPOSED_CONNECTIONS: ProposedConnection[] = [
  {
    id: '1',
    targetAgentId: 'customer-insights-agent',
    targetAgentName: 'Customer Insights Agent',
    targetAgentDescription: 'Analyzes customer behavior, segmentation, and churn patterns',
    confidence: 0.95,
    reason: 'Strong foreign key relationship through customers table enables cross-analysis of sales and customer behavior',
    suggestedPriority: 'high',
    suggestedKeywords: ['customer behavior', 'churn', 'segmentation', 'retention'],
    relationshipType: 'bidirectional',
    foreignKeys: [
      {
        sourceTable: 'ecommerce.orders',
        sourceColumn: 'customer_id',
        targetTable: 'crm.customers',
        targetColumn: 'id',
      },
    ],
    sharedTables: ['customers'],
    status: 'pending',
    conversation: [],
  },
  {
    id: '2',
    targetAgentId: 'product-analytics-agent',
    targetAgentName: 'Product Analytics Agent',
    targetAgentDescription: 'Tracks product performance, pricing analysis, and SKU trends',
    confidence: 0.92,
    reason: 'Foreign key relationships through products and order_items tables allow comprehensive product-sales analysis',
    suggestedPriority: 'high',
    suggestedKeywords: ['product performance', 'pricing', 'SKU analysis'],
    relationshipType: 'one-way',
    foreignKeys: [
      {
        sourceTable: 'ecommerce.order_items',
        sourceColumn: 'product_id',
        targetTable: 'catalog.products',
        targetColumn: 'id',
      },
    ],
    sharedTables: ['products'],
    status: 'pending',
    conversation: [],
  },
  {
    id: '3',
    targetAgentId: 'inventory-agent',
    targetAgentName: 'Inventory Management Agent',
    targetAgentDescription: 'Monitors stock levels, reorder points, and warehouse operations',
    confidence: 0.88,
    reason: 'Product-level foreign keys enable sales-inventory correlation analysis',
    suggestedPriority: 'medium',
    suggestedKeywords: ['inventory', 'stock', 'warehouse', 'availability'],
    relationshipType: 'bidirectional',
    foreignKeys: [
      {
        sourceTable: 'ecommerce.order_items',
        sourceColumn: 'product_id',
        targetTable: 'warehouse.inventory',
        targetColumn: 'product_id',
      },
    ],
    sharedTables: [],
    status: 'pending',
    conversation: [],
  },
];

const AVAILABLE_AGENTS: AvailableAgent[] = [
  {
    id: 'marketing-agent',
    name: 'Marketing Campaign Agent',
    description: 'Analyzes marketing campaign performance and ROI',
    tables: [
      { schema: 'marketing', table: 'campaigns', columns: ['id', 'customer_id', 'name'] },
      { schema: 'marketing', table: 'ad_spend', columns: ['id', 'campaign_id', 'amount'] },
    ],
  },
  {
    id: 'finance-agent',
    name: 'Finance & Accounting Agent',
    description: 'Tracks revenue, expenses, and financial metrics',
    tables: [
      { schema: 'finance', table: 'transactions', columns: ['id', 'order_id', 'amount'] },
      { schema: 'finance', table: 'invoices', columns: ['id', 'customer_id', 'total'] },
    ],
  },
];

export function ConfigureRelationships() {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const [connections, setConnections] = useState<ProposedConnection[]>(AI_PROPOSED_CONNECTIONS);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [sourceTable, setSourceTable] = useState('');
  const [sourceColumn, setSourceColumn] = useState('');
  const [targetTable, setTargetTable] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [manualPriority, setManualPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [activeTab, setActiveTab] = useState('list');
  const [revisionMessage, setRevisionMessage] = useState('');
  const [selectedConnectionForRevision, setSelectedConnectionForRevision] = useState<string | null>(null);

  const approvedCount = connections.filter((c) => c.status === 'approved').length;
  const pendingConnections = connections.filter((c) => c.status === 'pending' || c.status === 'needs_revision');
  const approvedConnections = connections.filter((c) => c.status === 'approved');

  const handleApprove = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, status: 'approved' as const } : conn))
    );
    toast.success('Connection approved');
  };

  const handleReject = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, status: 'rejected' as const } : conn))
    );
    toast.success('Connection rejected');
  };

  const handleRequestRevision = (id: string) => {
    if (!revisionMessage.trim()) {
      toast.error('Please provide feedback for revision');
      return;
    }

    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === id
          ? {
              ...conn,
              status: 'needs_revision' as const,
              conversation: [
                ...conn.conversation,
                {
                  role: 'user' as const,
                  message: revisionMessage,
                  timestamp: new Date(),
                },
                {
                  role: 'ai' as const,
                  message: 'I understand your feedback. I\'ll adjust the relationship configuration and foreign key mappings based on your input.',
                  timestamp: new Date(),
                },
              ],
            }
          : conn
      )
    );

    setRevisionMessage('');
    setSelectedConnectionForRevision(null);
    toast.success('Revision request sent to AI');
  };

  const handleSaveAndContinue = () => {
    if (approvedCount === 0) {
      toast.error('Please approve at least one connection');
      return;
    }
    // Mark that connections have been configured
    localStorage.setItem('agentConnectionsConfigured', 'true');
    toast.success(`${approvedCount} connections configured`);
    navigate(`/configure-golden-queries/${agentId}`);
  };

  const selectedAgentData = AVAILABLE_AGENTS.find((a) => a.id === selectedAgent);

  // Prepare graph data
  const graphNodes = [
    { id: 'current', label: 'Sales Analytics\nAgent', type: 'current' as const },
    ...approvedConnections.map((c) => ({
      id: c.targetAgentId,
      label: c.targetAgentName.replace(' Agent', ''),
      type: 'connected' as const,
    })),
    ...pendingConnections.filter(c => c.status === 'pending').map((c) => ({
      id: c.targetAgentId,
      label: c.targetAgentName.replace(' Agent', ''),
      type: 'suggested' as const,
    })),
  ];

  const graphEdges = [
    ...approvedConnections.map((c) => ({
      source: 'current',
      target: c.targetAgentId,
      type: c.relationshipType,
      status: 'active' as const,
    })),
    ...pendingConnections.filter(c => c.status === 'pending').map((c) => ({
      source: 'current',
      target: c.targetAgentId,
      type: c.relationshipType,
      status: 'suggested' as const,
    })),
  ];

  return (
    <div className="h-screen flex flex-col bg-[#FAFBFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/agents/${agentId}`)}
            className="flex items-center gap-2 text-[#666666] hover:text-[#333333] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Agent</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#666666]">
              {approvedCount} connection{approvedCount !== 1 ? 's' : ''} approved
            </span>
            <Button
              variant="outline"
              onClick={() => navigate(`/agents/${agentId}`)}
            >
              Save Draft
            </Button>
            <Button
              className="bg-[#00B5B3] hover:bg-[#009996]"
              onClick={handleSaveAndContinue}
              disabled={approvedCount === 0}
            >
              Save & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
            <Link2 className="w-6 h-6 text-[#00B5B3]" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-[#333333] mb-1">Configure Agent Relationships</h1>
            <p className="text-sm text-[#666666]">
              Connect Sales Analytics Agent to other agents based on foreign key relationships and shared data
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="bg-white border-b border-[#EEEEEE] px-8 flex-shrink-0">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger value="list" className="text-sm">
                <List className="w-4 h-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="graph" className="text-sm">
                <NetworkIcon className="w-4 h-4 mr-2" />
                Network Graph
              </TabsTrigger>
            </TabsList>
          </div>

          {/* List View */}
          <TabsContent value="list" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-8 max-w-5xl mx-auto space-y-6">
                {/* Info Card */}
                <Card className="p-5 border border-[#E0F7F7] bg-[#F0FFFE]">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[#00B5B3] mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#333333] mb-1">AI-Powered Connection Analysis</h3>
                      <p className="text-xs text-[#666666]">
                        We've analyzed foreign key relationships and data overlap across all agents. 
                        Review suggestions below and approve connections that make sense for your use case.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        pendingConnections.filter(c => c.status === 'pending').forEach((c) => handleApprove(c.id))
                      }
                    >
                      Approve All
                    </Button>
                  </div>
                </Card>

                {/* Pending Connections */}
                {pendingConnections.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-[#00B5B3]" />
                      <h3 className="text-sm font-semibold text-[#333333]">AI Suggested Connections</h3>
                      <Badge variant="outline">{pendingConnections.length}</Badge>
                    </div>

                    <div className="space-y-4">
                      {pendingConnections.map((connection) => (
                        <Card key={connection.id} className={`p-5 ${
                          connection.status === 'needs_revision' 
                            ? 'border-2 border-[#F79009]' 
                            : 'border border-[#EEEEEE]'
                        }`}>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                              <Database className="w-5 h-5 text-[#00B5B3]" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-[#333333]">
                                      {connection.targetAgentName}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className={
                                        connection.confidence >= 0.9
                                          ? 'text-[#00B98E] border-[#00B98E]'
                                          : connection.confidence >= 0.85
                                          ? 'text-[#F79009] border-[#F79009]'
                                          : 'text-[#666666] border-[#666666]'
                                      }
                                    >
                                      {Math.round(connection.confidence * 100)}% confidence
                                    </Badge>
                                    {connection.relationshipType === 'bidirectional' && (
                                      <Badge variant="outline" className="text-xs">
                                        ↔ Bidirectional
                                      </Badge>
                                    )}
                                    {connection.status === 'needs_revision' && (
                                      <Badge className="bg-[#F79009] text-white text-xs">
                                        Needs Revision
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#666666]">{connection.targetAgentDescription}</p>
                                </div>
                              </div>

                              {/* Reason */}
                              <div className="bg-[#F8F9FA] rounded p-3 mb-3 border border-[#EEEEEE]">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-3.5 h-3.5 text-[#00B5B3] mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium text-[#333333] mb-0.5">Why this connection?</p>
                                    <p className="text-xs text-[#666666]">{connection.reason}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Foreign Keys */}
                              <div className="mb-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Key className="w-3.5 h-3.5 text-[#00B5B3]" />
                                  <p className="text-xs font-medium text-[#333333]">Foreign Key Relationships:</p>
                                </div>
                                <div className="space-y-1.5">
                                  {connection.foreignKeys.map((fk, idx) => (
                                    <div key={idx} className="bg-white rounded p-2 border border-[#EEEEEE]">
                                      <code className="text-xs text-[#666666]">
                                        {fk.sourceTable}.{fk.sourceColumn} → {fk.targetTable}.{fk.targetColumn}
                                      </code>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Conversation */}
                              {connection.conversation.length > 0 && (
                                <div className="mb-3 p-3 bg-[#FFF9F0] rounded border border-[#F79009]">
                                  <p className="text-xs font-medium text-[#333333] mb-2">Revision History:</p>
                                  <div className="space-y-2">
                                    {connection.conversation.map((msg, idx) => (
                                      <div key={idx} className={`text-xs p-2 rounded ${
                                        msg.role === 'user' 
                                          ? 'bg-white border border-[#EEEEEE]' 
                                          : 'bg-[#F0FFFE] border border-[#E0F7F7]'
                                      }`}>
                                        <span className="font-medium">{msg.role === 'user' ? 'You' : 'AI'}:</span> {msg.message}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Revision Input */}
                              {selectedConnectionForRevision === connection.id && (
                                <div className="mb-3 p-3 bg-white rounded border-2 border-[#00B5B3]">
                                  <Label className="text-xs font-medium text-[#666666] mb-2">Request Revision</Label>
                                  <Textarea
                                    placeholder="Explain what needs to be changed (e.g., wrong foreign key, incorrect relationship type, etc.)"
                                    value={revisionMessage}
                                    onChange={(e) => setRevisionMessage(e.target.value)}
                                    className="text-xs mb-2 min-h-[80px]"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="bg-[#00B5B3] hover:bg-[#009996]"
                                      onClick={() => handleRequestRevision(connection.id)}
                                    >
                                      <Send className="w-3 h-3 mr-1" />
                                      Send to AI
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedConnectionForRevision(null);
                                        setRevisionMessage('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Keywords */}
                              <div className="mb-4">
                                <p className="text-xs font-medium text-[#999999] uppercase tracking-wide mb-1.5">
                                  Suggested Keywords:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {connection.suggestedKeywords.map((keyword, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 pt-3 border-t border-[#EEEEEE]">
                                <Badge
                                  className={
                                    connection.suggestedPriority === 'high'
                                      ? 'bg-[#00B98E] text-white'
                                      : connection.suggestedPriority === 'medium'
                                      ? 'bg-[#F79009] text-white'
                                      : 'bg-[#666666] text-white'
                                  }
                                >
                                  {connection.suggestedPriority} priority
                                </Badge>
                                <div className="flex-1" />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-[#F79009] border-[#F79009]"
                                  onClick={() => setSelectedConnectionForRevision(connection.id)}
                                  disabled={selectedConnectionForRevision === connection.id}
                                >
                                  <Edit3 className="w-3 h-3 mr-1" />
                                  Revise
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-[#00B98E] hover:bg-[#00A87E] text-white"
                                  onClick={() => handleApprove(connection.id)}
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-[#F04438] border-[#F04438]"
                                  onClick={() => handleReject(connection.id)}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Connections */}
                {approvedConnections.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-[#00B98E]" />
                      <h3 className="text-sm font-semibold text-[#333333]">Approved Connections</h3>
                      <Badge className="bg-[#00B98E] text-white">{approvedConnections.length}</Badge>
                    </div>

                    <div className="space-y-2">
                      {approvedConnections.map((connection) => (
                        <Card key={connection.id} className="p-4 border border-[#00B98E] bg-[#F0FFF9]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-4 h-4 text-[#00B98E]" />
                              <div>
                                <p className="text-sm font-medium text-[#333333]">{connection.targetAgentName}</p>
                                <p className="text-xs text-[#666666]">
                                  {connection.suggestedPriority} priority • {connection.foreignKeys.length} foreign key{connection.foreignKeys.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setConnections((prev) =>
                                  prev.map((c) => (c.id === connection.id ? { ...c, status: 'pending' as const } : c))
                                )
                              }
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Add */}
                <Card className="p-4 border-2 border-dashed border-[#DDDDDD]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#333333] mb-1">Don't see what you need?</h4>
                      <p className="text-xs text-[#666666]">Manually add a connection to any other agent</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowManualDialog(true)}>
                      <Plus className="w-3 h-3 mr-2" />
                      Add Manually
                    </Button>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Graph View */}
          <TabsContent value="graph" className="flex-1 m-0 overflow-hidden">
            <div className="h-full p-8 overflow-auto">
              <Card className="p-6 border border-[#EEEEEE]">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#333333] mb-1">Agent Relationship Network</h3>
                  <p className="text-xs text-[#666666]">
                    Visual representation of connections between agents. Hover over nodes for details.
                  </p>
                </div>
                <NetworkGraph nodes={graphNodes} edges={graphEdges} height={500} />
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Manual Add Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Manual Connection</DialogTitle>
            <DialogDescription>
              Select an agent and define the foreign key relationship
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs font-medium text-[#666666] mb-2">Select Target Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_AGENTS.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
                        <p className="text-xs text-[#666666]">{agent.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAgent && (
              <>
                <div className="p-3 bg-[#F0FFFE] rounded border border-[#E0F7F7]">
                  <h4 className="text-xs font-semibold text-[#333333] mb-2">Define Foreign Key Relationship</h4>
                  <p className="text-xs text-[#666666]">
                    Specify how tables from your agent connect to tables in the target agent
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-[#666666] mb-2">Source Table (Your Agent)</Label>
                    <Select value={sourceTable} onValueChange={setSourceTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select table..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_TABLES.map((table) => (
                          <SelectItem key={`${table.schema}.${table.table}`} value={`${table.schema}.${table.table}`}>
                            {table.schema}.{table.table}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-[#666666] mb-2">Source Column</Label>
                    <Select value={sourceColumn} onValueChange={setSourceColumn} disabled={!sourceTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceTable &&
                          SOURCE_TABLES.find((t) => `${t.schema}.${t.table}` === sourceTable)?.columns.map((col) => (
                            <SelectItem key={col} value={col}>
                              {col}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-[#666666] mb-2">Target Table</Label>
                    <Select value={targetTable} onValueChange={setTargetTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select table..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedAgentData?.tables.map((table) => (
                          <SelectItem key={`${table.schema}.${table.table}`} value={`${table.schema}.${table.table}`}>
                            {table.schema}.{table.table}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-[#666666] mb-2">Target Column</Label>
                    <Select value={targetColumn} onValueChange={setTargetColumn} disabled={!targetTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column..." />
                      </SelectTrigger>
                      <SelectContent>
                        {targetTable &&
                          selectedAgentData?.tables
                            .find((t) => `${t.schema}.${t.table}` === targetTable)
                            ?.columns.map((col) => (
                              <SelectItem key={col} value={col}>
                                {col}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {sourceTable && sourceColumn && targetTable && targetColumn && (
                  <div className="p-3 bg-[#E6F7F4] rounded border border-[#00B98E]">
                    <p className="text-xs font-medium text-[#333333] mb-1">Preview:</p>
                    <code className="text-xs text-[#00B5B3]">
                      {sourceTable}.{sourceColumn} → {targetTable}.{targetColumn}
                    </code>
                  </div>
                )}

                <div>
                  <Label className="text-xs font-medium text-[#666666] mb-2">Priority</Label>
                  <Select value={manualPriority} onValueChange={(v: any) => setManualPriority(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowManualDialog(false);
              setSelectedAgent('');
              setSourceTable('');
              setSourceColumn('');
              setTargetTable('');
              setTargetColumn('');
            }}>
              Cancel
            </Button>
            <Button
              className="bg-[#00B5B3] hover:bg-[#009996]"
              disabled={!selectedAgent || !sourceTable || !sourceColumn || !targetTable || !targetColumn}
              onClick={() => {
                const agent = AVAILABLE_AGENTS.find((a) => a.id === selectedAgent);
                if (!agent) return;

                const newConnection: ProposedConnection = {
                  id: `manual-${Date.now()}`,
                  targetAgentId: agent.id,
                  targetAgentName: agent.name,
                  targetAgentDescription: agent.description,
                  confidence: 1.0,
                  reason: 'Manually configured by user',
                  suggestedPriority: manualPriority,
                  suggestedKeywords: [],
                  relationshipType: 'one-way',
                  foreignKeys: [
                    {
                      sourceTable,
                      sourceColumn,
                      targetTable,
                      targetColumn,
                    },
                  ],
                  sharedTables: [],
                  status: 'approved',
                  conversation: [],
                };

                setConnections((prev) => [...prev, newConnection]);
                setShowManualDialog(false);
                setSelectedAgent('');
                setSourceTable('');
                setSourceColumn('');
                setTargetTable('');
                setTargetColumn('');
                toast.success('Connection added');
              }}
            >
              Add Connection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
