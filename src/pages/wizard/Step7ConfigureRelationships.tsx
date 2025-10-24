import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Link2,
  Sparkles,
  Plus,
  ArrowRight,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

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
  dataOverlap: string[];
  status: 'pending' | 'approved' | 'rejected';
}

interface AvailableAgent {
  id: string;
  name: string;
  description: string;
  tables: string[];
}

const AI_PROPOSED_CONNECTIONS: ProposedConnection[] = [
  {
    id: '1',
    targetAgentId: 'customer-insights-agent',
    targetAgentName: 'Customer Insights Agent',
    targetAgentDescription: 'Analyzes customer behavior, segmentation, and churn patterns',
    confidence: 0.95,
    reason: 'Both agents share customer data and can complement sales analysis with behavioral insights',
    suggestedPriority: 'high',
    suggestedKeywords: ['customer behavior', 'churn', 'segmentation', 'retention'],
    relationshipType: 'bidirectional',
    dataOverlap: ['customers', 'orders'],
    status: 'pending',
  },
  {
    id: '2',
    targetAgentId: 'product-analytics-agent',
    targetAgentName: 'Product Analytics Agent',
    targetAgentDescription: 'Tracks product performance, pricing analysis, and SKU trends',
    confidence: 0.88,
    reason: 'Product performance data complements sales metrics for comprehensive analysis',
    suggestedPriority: 'high',
    suggestedKeywords: ['product performance', 'pricing', 'SKU analysis'],
    relationshipType: 'one-way',
    dataOverlap: ['products', 'order_items'],
    status: 'pending',
  },
  {
    id: '3',
    targetAgentId: 'forecasting-agent',
    targetAgentName: 'Forecasting Agent',
    targetAgentDescription: 'Provides predictive analytics and trend forecasting',
    confidence: 0.82,
    reason: 'Historical sales data can be enriched with predictive insights',
    suggestedPriority: 'medium',
    suggestedKeywords: ['forecast', 'prediction', 'trends', 'future'],
    relationshipType: 'one-way',
    dataOverlap: ['orders', 'order_items'],
    status: 'pending',
  },
  {
    id: '4',
    targetAgentId: 'inventory-agent',
    targetAgentName: 'Inventory Management Agent',
    targetAgentDescription: 'Monitors stock levels, reorder points, and warehouse operations',
    confidence: 0.75,
    reason: 'Sales data correlates with inventory movement and stock requirements',
    suggestedPriority: 'medium',
    suggestedKeywords: ['inventory', 'stock', 'warehouse'],
    relationshipType: 'bidirectional',
    dataOverlap: ['products', 'inventory'],
    status: 'pending',
  },
];

const AVAILABLE_AGENTS: AvailableAgent[] = [
  {
    id: 'marketing-agent',
    name: 'Marketing Campaign Agent',
    description: 'Analyzes marketing campaign performance and ROI',
    tables: ['campaigns', 'ad_spend', 'conversions'],
  },
  {
    id: 'finance-agent',
    name: 'Finance & Accounting Agent',
    description: 'Tracks revenue, expenses, and financial metrics',
    tables: ['transactions', 'invoices', 'payments'],
  },
];

export function Step7ConfigureRelationships() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<ProposedConnection[]>(AI_PROPOSED_CONNECTIONS);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [manualPriority, setManualPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const approvedCount = connections.filter((c) => c.status === 'approved').length;
  const hasApprovedAny = approvedCount > 0;

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

  const handleAddManual = () => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }

    const agent = AVAILABLE_AGENTS.find((a) => a.id === selectedAgent);
    if (!agent) return;

    const newConnection: ProposedConnection = {
      id: `manual-${Date.now()}`,
      targetAgentId: agent.id,
      targetAgentName: agent.name,
      targetAgentDescription: agent.description,
      confidence: 1.0,
      reason: 'Manually added by user',
      suggestedPriority: manualPriority,
      suggestedKeywords: [],
      relationshipType: 'one-way',
      dataOverlap: agent.tables,
      status: 'approved',
    };

    setConnections((prev) => [...prev, newConnection]);
    setShowManualDialog(false);
    setSelectedAgent('');
    toast.success('Connection added');
  };

  const handleContinue = () => {
    if (!hasApprovedAny) {
      toast.error('Please approve at least one connection to continue');
      return;
    }
    // Navigate to golden queries step
    navigate('/wizard/golden-queries');
  };

  const handleSkip = () => {
    navigate('/agents/sales-analytics-agent');
  };

  const pendingConnections = connections.filter((c) => c.status === 'pending');
  const approvedConnections = connections.filter((c) => c.status === 'approved');
  const rejectedConnections = connections.filter((c) => c.status === 'rejected');

  return (
    <WizardLayout
      currentStep={7}
      totalSteps={8}
      title="Configure Agent Relationships"
      onBack={() => navigate('/wizard/review-publish')}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00B5B3] to-[#00B5B3]/80 px-6 py-5 border-b-2 border-[#00B5B3]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">Connect Your Agent</h2>
              <p className="text-sm text-white/90 mb-3">
                We've analyzed your agent and identified potential connections that will enhance its capabilities.
                Review AI suggestions below and add manual connections if needed.
              </p>
              <div className="flex items-center gap-4 text-sm text-white/90">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {connections.length} AI suggestions
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {approvedCount} approved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* AI Suggested Connections */}
            {pendingConnections.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#00B5B3]" />
                    <h3 className="text-sm font-semibold text-[#333333]">AI Suggested Connections</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      pendingConnections.forEach((c) => handleApprove(c.id))
                    }
                  >
                    Approve All
                  </Button>
                </div>

                <div className="space-y-3">
                  {pendingConnections.map((connection) => (
                    <Card key={connection.id} className="p-4 border border-[#EEEEEE]">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                          <Database className="w-5 h-5 text-[#00B5B3]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
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
                                      : connection.confidence >= 0.8
                                      ? 'text-[#F79009] border-[#F79009]'
                                      : 'text-[#666666] border-[#666666]'
                                  }
                                >
                                  {Math.round(connection.confidence * 100)}% confidence
                                </Badge>
                              </div>
                              <p className="text-xs text-[#666666] mb-2">
                                {connection.targetAgentDescription}
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#F8F9FA] rounded p-3 mb-3 border border-[#EEEEEE]">
                            <div className="flex items-start gap-2 mb-2">
                              <AlertCircle className="w-3.5 h-3.5 text-[#00B5B3] mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-[#333333] mb-0.5">Why this connection?</p>
                                <p className="text-xs text-[#666666]">{connection.reason}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-[#999999] mt-2 pt-2 border-t border-[#EEEEEE]">
                              <span>Shared tables: {connection.dataOverlap.join(', ')}</span>
                              <span>•</span>
                              <span>Priority: {connection.suggestedPriority}</span>
                              <span>•</span>
                              <span>{connection.relationshipType === 'bidirectional' ? 'Bidirectional' : 'One-way'}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-[10px] font-medium text-[#999999] uppercase tracking-wide mb-1.5">
                              Suggested Keywords:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {connection.suggestedKeywords.map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="text-[10px]">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
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
                    <Card key={connection.id} className="p-3 border border-[#00B98E] bg-[#F0FFF9]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#00B98E]" />
                          <div>
                            <p className="text-sm font-medium text-[#333333]">{connection.targetAgentName}</p>
                            <p className="text-xs text-[#666666]">
                              {connection.suggestedPriority} priority • {connection.relationshipType}
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
                <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-3 h-3 mr-2" />
                      Add Manually
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Manual Connection</DialogTitle>
                      <DialogDescription>
                        Select an agent to connect and configure the relationship
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <Label className="text-xs font-medium text-[#666666] mb-2">Select Agent</Label>
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
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowManualDialog(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-[#00B5B3] hover:bg-[#009996]" onClick={handleAddManual}>
                        Add Connection
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-[#EEEEEE] bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleSkip} className="text-[#666666]">
              Skip for Now
            </Button>
            <div className="flex items-center gap-3">
              <p className="text-xs text-[#666666]">
                {approvedCount > 0 ? (
                  <span className="text-[#00B98E] font-medium">
                    {approvedCount} connection{approvedCount !== 1 ? 's' : ''} approved
                  </span>
                ) : (
                  'Approve at least one connection to continue'
                )}
              </p>
              <Button
                className="bg-[#00B5B3] hover:bg-[#009996]"
                onClick={handleContinue}
                disabled={!hasApprovedAny}
              >
                Continue to Golden Queries
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
