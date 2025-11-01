import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Textarea } from '../../components/ui/textarea';
import {
  CheckCircle2,
  Sparkles,
  Network,
  ArrowRight,
  Send,
  MessageSquare,
  AlertCircle,
  Link2,
  CheckCheck,
  X,
  Key,
  Database,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AgentConnection {
  id: string;
  targetAgentId: string;
  targetAgentName: string;
  targetAgentDescription: string;
  confidence: number;
  reason: string;
  suggestedPriority: 'high' | 'medium' | 'low';
  relationshipType: 'one-way' | 'bidirectional';
  foreignKeys: {
    sourceTable: string;
    sourceColumn: string;
    targetTable: string;
    targetColumn: string;
  }[];
  sharedTables: string[];
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  conversation: { role: 'ai' | 'user'; message: string }[];
}

const PROPOSED_CONNECTIONS: AgentConnection[] = [
  {
    id: 'conn-1',
    targetAgentId: 'customer-insights-agent',
    targetAgentName: 'Customer Insights Agent',
    targetAgentDescription: 'Analyzes customer behavior, segmentation, and churn patterns',
    confidence: 0.95,
    reason: 'Strong foreign key relationship through customers table enables cross-analysis of sales and customer behavior',
    suggestedPriority: 'high',
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
    id: 'conn-2',
    targetAgentId: 'product-analytics-agent',
    targetAgentName: 'Product Analytics Agent',
    targetAgentDescription: 'Tracks product performance, pricing analysis, and SKU trends',
    confidence: 0.92,
    reason: 'Foreign key relationships through products and order_items tables allow comprehensive product-sales analysis',
    suggestedPriority: 'high',
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
    id: 'conn-3',
    targetAgentId: 'inventory-agent',
    targetAgentName: 'Inventory Management Agent',
    targetAgentDescription: 'Monitors stock levels, reorder points, and warehouse operations',
    confidence: 0.88,
    reason: 'Product-level foreign keys enable sales-inventory correlation analysis',
    suggestedPriority: 'medium',
    relationshipType: 'one-way',
    foreignKeys: [
      {
        sourceTable: 'ecommerce.order_items',
        sourceColumn: 'product_id',
        targetTable: 'warehouse.inventory',
        targetColumn: 'product_id',
      },
    ],
    sharedTables: ['products', 'inventory'],
    status: 'pending',
    conversation: [],
  },
];

export function Step8AgentRelationships() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<AgentConnection[]>(PROPOSED_CONNECTIONS);
  const [activeConnId, setActiveConnId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);

  const activeConnection = activeConnId
    ? connections.find((c) => c.id === activeConnId)
    : null;

  const reviewedCount = connections.filter((c) => c.status !== 'pending').length;
  const approvedCount = connections.filter((c) => c.status === 'approved').length;

  const handleApprove = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, status: 'approved' as const } : conn))
    );
    toast.success('Agent connection approved');
    setActiveConnId(null);
  };

  const handleReject = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, status: 'rejected' as const } : conn))
    );
    toast.success('Agent connection rejected');
    setActiveConnId(null);
  };

  const handleModify = (id: string) => {
    setActiveConnId(id);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !activeConnId) return;

    const updatedConnections = connections.map((conn) =>
      conn.id === activeConnId
        ? {
            ...conn,
            conversation: [
              ...conn.conversation,
              { role: 'user' as const, message: chatMessage },
              {
                role: 'ai' as const,
                message: `I've updated the connection parameters based on your feedback. The relationship type has been adjusted to better reflect the data flow between agents.`,
              },
            ],
            status: 'needs_revision' as const,
          }
        : conn
    );

    setConnections(updatedConnections);
    setChatMessage('');
    toast.success('Feedback sent to AI');
  };

  const handleConfirmRevision = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) => (conn.id === id ? { ...conn, status: 'approved' as const } : conn))
    );
    toast.success('Connection approved with revisions');
    setActiveConnId(null);
  };

  const handleFinish = () => {
    // Save agent relationships to localStorage
    localStorage.setItem('agentConnectionsConfigured', 'true');
    
    if (approvedCount === 0) {
      toast.info('Skipped agent relationships - you can configure these later from the agent settings');
    } else {
      toast.success(`Agent published with ${approvedCount} connection${approvedCount !== 1 ? 's' : ''}!`);
    }
    
    navigate('/agents/sales-analytics-agent');
  };

  const handleSkipAll = () => {
    toast.info('Skipped agent relationships - you can configure these later');
    navigate('/agents/sales-analytics-agent');
  };

  return (
    <WizardLayout
      currentStep={8}
      totalSteps={8}
      title="Agent Relationships (Advanced)"
      onBack={() => navigate('/agents/create/step-7')}
      onSaveDraft={() => {
        localStorage.setItem(
          'wizardDraft',
          JSON.stringify({
            step: 8,
            connections: connections,
          })
        );
        toast.success('Draft saved');
      }}
    >
      <div className="h-full flex flex-col">
        {/* Success Banner */}
        {showSuccessBanner && (
          <div className="bg-gradient-to-r from-[#E8F9F8] to-[#F0FFFE] border border-[#00B5B3] rounded-lg p-4 mb-6 relative">
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="absolute top-4 right-4 text-[#666666] hover:text-[#333333]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00B98E] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#333333] mb-1">
                  🎉 Agent Published Successfully!
                </h3>
                <p className="text-[#666666] mb-3">
                  Your Sales Analytics Agent is now live. This final step is optional but recommended—connect to
                  other agents to enable powerful cross-domain insights.
                </p>
                <Badge variant="outline" className="bg-white border-[#DDDDDD] text-[#666666]">
                  Optional
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">
          {/* Left Panel - Connection List */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="mb-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-[#333333] mb-1">
                  AI-Suggested Agent Connections
                </h3>
                <p className="text-[#666666]">
                  Based on shared data and foreign key relationships
                </p>
              </div>
              <div className="text-right">
                <div className="text-[#00B5B3]">
                  {reviewedCount} of {connections.length}
                </div>
                <div className="text-[#999999]">reviewed</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3 pr-4">
                {connections.map((conn) => (
                  <Card
                    key={conn.id}
                    className={`p-4 border-2 transition-all cursor-pointer ${
                      activeConnId === conn.id
                        ? 'border-[#00B5B3] bg-[#F0FFFE]'
                        : conn.status === 'approved'
                        ? 'border-[#4CAF50] bg-[#F1F8F4]'
                        : conn.status === 'rejected'
                        ? 'border-[#DDDDDD] bg-[#F8F9FA] opacity-60'
                        : conn.status === 'needs_revision'
                        ? 'border-[#F79009] bg-[#FFF9F0]'
                        : 'border-[#EEEEEE] hover:border-[#00B5B3]'
                    }`}
                    onClick={() => setActiveConnId(conn.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00B5B3] to-[#0099A8] flex items-center justify-center flex-shrink-0">
                          <Network className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-[#333333]">
                              {conn.targetAgentName}
                            </h4>
                            {conn.status === 'approved' && (
                              <CheckCircle2 className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                            )}
                            {conn.status === 'rejected' && (
                              <X className="w-4 h-4 text-[#999999] flex-shrink-0" />
                            )}
                            {conn.status === 'needs_revision' && (
                              <AlertCircle className="w-4 h-4 text-[#F79009] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[#666666] line-clamp-1">
                            {conn.targetAgentDescription}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-2 flex-shrink-0 ${
                          conn.suggestedPriority === 'high'
                            ? 'bg-[#FFF9F0] border-[#F79009] text-[#F79009]'
                            : 'bg-[#F8F9FA] border-[#DDDDDD] text-[#666666]'
                        }`}
                      >
                        {conn.confidence * 100}% match
                      </Badge>
                    </div>

                    {/* Reason */}
                    <p className="text-[#666666] mb-3 line-clamp-2">
                      {conn.reason}
                    </p>

                    {/* Foreign Keys */}
                    <div className="flex items-start gap-2 mb-3 p-2 bg-white rounded border border-[#EEEEEE]">
                      <Key className="w-4 h-4 text-[#00B5B3] flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[#999999] mb-1">Foreign Key Connection</div>
                        {conn.foreignKeys.map((fk, idx) => (
                          <div key={idx} className="text-[#666666] truncate">
                            <span className="text-[#00B5B3]">{fk.sourceTable}</span>.{fk.sourceColumn} →{' '}
                            <span className="text-[#00B5B3]">{fk.targetTable}</span>.{fk.targetColumn}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {conn.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(conn.id);
                          }}
                          className="flex-1 bg-[#00B5B3] hover:bg-[#009996]"
                        >
                          <CheckCheck className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModify(conn.id);
                          }}
                          className="flex-1 border-[#DDDDDD]"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Modify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(conn.id);
                          }}
                          className="border-[#DDDDDD] hover:bg-[#FEF3F2] hover:border-[#F04438]"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {conn.status === 'needs_revision' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmRevision(conn.id);
                          }}
                          className="flex-1 bg-[#00B5B3] hover:bg-[#009996]"
                        >
                          <CheckCheck className="w-4 h-4 mr-2" />
                          Approve Revision
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(conn.id);
                          }}
                          className="border-[#DDDDDD]"
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {conn.status === 'approved' && (
                      <div className="text-[#4CAF50] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Connection Approved</span>
                      </div>
                    )}

                    {conn.status === 'rejected' && (
                      <div className="text-[#999999] flex items-center gap-2">
                        <X className="w-4 h-4" />
                        <span>Connection Rejected</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Chat/Details - Sticky */}
          <div className="w-[400px] flex-shrink-0 overflow-hidden">
            {activeConnection ? (
              <Card className="h-full border-2 border-[#EEEEEE] flex flex-col">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-[#EEEEEE] flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-[#00B5B3]" />
                    <h4 className="text-[#333333]">Modify Connection</h4>
                  </div>
                  <p className="text-[#999999]">{activeConnection.targetAgentName}</p>
                </div>

                {/* Conversation */}
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="space-y-4">
                    {/* Initial AI Message */}
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B5B3] to-[#0099A8] flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 bg-[#F0FFFE] rounded-lg p-3 border border-[#E0F7F7]">
                        <p className="text-[#666666]">
                          I've proposed a {activeConnection.relationshipType} connection to the{' '}
                          {activeConnection.targetAgentName}. Would you like to modify the relationship type,
                          priority, or add custom routing rules?
                        </p>
                      </div>
                    </div>

                    {/* Conversation History */}
                    {activeConnection.conversation.map((msg, idx) => (
                      <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'ai' && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B5B3] to-[#0099A8] flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`flex-1 rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-[#00B5B3] text-white max-w-[80%]'
                              : 'bg-[#F0FFFE] border border-[#E0F7F7]'
                          }`}
                        >
                          <p className={msg.role === 'user' ? 'text-white' : 'text-[#666666]'}>
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="p-4 border-t border-[#EEEEEE] flex-shrink-0">
                  <div className="flex gap-2">
                    <Textarea
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Describe how you'd like to modify this connection..."
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="w-full mt-2 bg-[#00B5B3] hover:bg-[#009996]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to AI
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="h-full border-2 border-[#EEEEEE] flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-[#F0FFFE] flex items-center justify-center mx-auto mb-4">
                    <Link2 className="w-8 h-8 text-[#00B5B3]" />
                  </div>
                  <h4 className="text-[#333333] mb-2">Select a Connection</h4>
                  <p className="text-[#666666]">
                    Click on a connection to view details or modify it with AI assistance
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-6 border-t border-[#EEEEEE] flex items-center justify-between">
          <Button variant="outline" onClick={handleSkipAll} className="border-[#DDDDDD]">
            Skip Agent Relationships
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <div className="text-[#333333]">
                {approvedCount} connection{approvedCount !== 1 ? 's' : ''} approved
              </div>
              {reviewedCount < connections.length && (
                <div className="text-[#999999]">
                  {connections.length - reviewedCount} remaining
                </div>
              )}
            </div>
            <Button
              onClick={handleFinish}
              className="bg-[#00B5B3] hover:bg-[#009996]"
            >
              Finish & View Agent
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
