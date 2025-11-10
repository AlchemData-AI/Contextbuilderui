import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { WizardChat } from '../../components/wizard/WizardChat';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import {
  CheckCircle2,
  Network,
  ArrowRight,
  X,
  Key,
  ChevronDown,
  MessageSquare,
  Check,
  XCircle,
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
  status: 'pending' | 'approved' | 'rejected' | 'modified';
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
  },
];

export function Step8AgentRelationships() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<AgentConnection[]>(PROPOSED_CONNECTIONS);
  const [showChat, setShowChat] = useState(false);
  const [activeConnId, setActiveConnId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(PROPOSED_CONNECTIONS[0]?.id || null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const connectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const activeConnection = activeConnId ? connections.find((c) => c.id === activeConnId) : null;
  const reviewedCount = connections.filter((c) => c.status !== 'pending').length;
  const approvedCount = connections.filter((c) => c.status === 'approved').length;
  const allReviewed = connections.every((c) => c.status !== 'pending');

  const scrollToConnection = (id: string) => {
    const element = connectionRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Close chat when switching to a different connection
  useEffect(() => {
    if (expandedId && showChat && activeConnId && expandedId !== activeConnId) {
      setShowChat(false);
      setActiveConnId(null);
    }
  }, [expandedId]);

  const handleApprove = (id: string) => {
    setConnections((prev) => prev.map((conn) => (conn.id === id ? { ...conn, status: 'approved' as const } : conn)));
    
    // Find next pending connection
    const currentIndex = connections.findIndex((c) => c.id === id);
    const nextPending = connections.slice(currentIndex + 1).find((c) => c.status === 'pending');
    
    if (nextPending) {
      setExpandedId(nextPending.id);
      setActiveConnId(nextPending.id);
      setShowChat(true);
      setTimeout(() => scrollToConnection(nextPending.id), 100);
    } else {
      setExpandedId(null);
      setShowChat(false);
      setActiveConnId(null);
    }
    
    toast.success('Agent connection approved');
  };

  const handleReject = (id: string) => {
    setConnections((prev) => prev.map((conn) => (conn.id === id ? { ...conn, status: 'rejected' as const } : conn)));
    
    // Find next pending connection
    const currentIndex = connections.findIndex((c) => c.id === id);
    const nextPending = connections.slice(currentIndex + 1).find((c) => c.status === 'pending');
    
    if (nextPending) {
      setExpandedId(nextPending.id);
      setActiveConnId(nextPending.id);
      setShowChat(true);
      setTimeout(() => scrollToConnection(nextPending.id), 100);
    } else {
      setExpandedId(null);
      setShowChat(false);
      setActiveConnId(null);
    }
    
    toast.success('Agent connection rejected');
  };

  const handleModify = (id: string) => {
    setActiveConnId(id);
    setShowChat(true);
  };

  const handleChatConfirm = (value: string) => {
    if (!activeConnId) return;

    setConnections((prev) =>
      prev.map((conn) => (conn.id === activeConnId ? { ...conn, status: 'modified' as const } : conn))
    );

    // Find next pending connection
    const currentIndex = connections.findIndex((c) => c.id === activeConnId);
    const nextPending = connections.slice(currentIndex + 1).find((c) => c.status === 'pending');

    if (nextPending) {
      setExpandedId(nextPending.id);
      setActiveConnId(nextPending.id);
      setShowChat(true);
      setTimeout(() => scrollToConnection(nextPending.id), 100);
    } else {
      setExpandedId(null);
      setShowChat(false);
      setActiveConnId(null);
    }

    toast.success('Connection modified');
  };

  const handleChatSkip = () => {
    if (!activeConnId) return;

    setConnections((prev) =>
      prev.map((conn) => (conn.id === activeConnId ? { ...conn, status: 'modified' as const } : conn))
    );

    // Find next pending connection
    const currentIndex = connections.findIndex((c) => c.id === activeConnId);
    const nextPending = connections.slice(currentIndex + 1).find((c) => c.status === 'pending');

    if (nextPending) {
      setExpandedId(nextPending.id);
      setActiveConnId(nextPending.id);
      setShowChat(true);
      setTimeout(() => scrollToConnection(nextPending.id), 100);
    } else {
      setExpandedId(null);
      setShowChat(false);
      setActiveConnId(null);
    }

    toast.success('Connection marked as modified');
  };

  const handleFinish = () => {
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

  const getStatusColor = (status: AgentConnection['status']) => {
    switch (status) {
      case 'approved':
        return 'text-[#4CAF50] border-[#4CAF50] bg-[#E8F5E9]';
      case 'rejected':
        return 'text-[#F04438] border-[#F04438] bg-[#FEF3F2]';
      case 'modified':
        return 'text-[#F79009] border-[#F79009] bg-[#FEF6EE]';
      default:
        return 'text-[#666666] border-[#DDDDDD] bg-[#F8F9FA]';
    }
  };

  return (
    <WizardLayout
      currentStep={8}
      totalSteps={8}
      title="Agent Relationships"
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
      <div className="h-full flex flex-col pb-10">
        {/* Two-Panel Layout */}
        <div className="flex-1 overflow-hidden">
          <div className={`h-full flex gap-4 px-8`}>
            {/* Left Panel - Connection List */}
            <div
              className={`${
                showChat ? 'w-1/2' : 'flex-1 max-w-4xl mx-auto'
              } transition-all overflow-y-auto scrollbar-hide`}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* Success Banner - Inside scrollable area */}
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
                      <h3 className="text-[#333333] mb-1">🎉 Agent Published Successfully!</h3>
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

              <div className="space-y-3">
                {connections.map((conn, index) => {
                  const isExpanded = expandedId === conn.id;
                  const isHighlighted = isExpanded;

                  return (
                    <div
                      key={conn.id}
                      ref={(el) => (connectionRefs.current[conn.id] = el)}
                      className={`bg-white border-2 rounded-lg transition-all ${
                        isHighlighted
                          ? 'border-[#00B5B3] shadow-[0_0_0_3px_rgba(0,181,179,0.1)]'
                          : 'border-[#EEEEEE] hover:border-[#CCCCCC]'
                      } ${isExpanded ? 'p-4' : 'p-3'}`}
                    >
                      {/* Minimized View */}
                      {!isExpanded && conn.status !== 'pending' ? (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => {
                              setExpandedId(conn.id);
                              setTimeout(() => scrollToConnection(conn.id), 100);
                              if (conn.status === 'modified') {
                                setActiveConnId(conn.id);
                                setShowChat(true);
                              }
                            }}
                            className="flex items-center gap-3 flex-1 text-left hover:opacity-75 transition-opacity"
                          >
                            {/* Compact Connection Display */}
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B5B3] to-[#0099A8] flex items-center justify-center flex-shrink-0">
                                <Network className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-[#333333]">{conn.targetAgentName}</span>
                            </div>

                            {/* Status Badge */}
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getStatusColor(conn.status)}`}>
                              {conn.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {conn.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                              {conn.status === 'modified' && <MessageSquare className="w-3 h-3 mr-1" />}
                              {conn.status}
                            </Badge>
                          </button>

                          {/* Expand Button */}
                          <button
                            onClick={() => {
                              setExpandedId(conn.id);
                              setTimeout(() => scrollToConnection(conn.id), 100);
                              if (conn.status === 'modified') {
                                setActiveConnId(conn.id);
                                setShowChat(true);
                              }
                            }}
                            className="ml-3 text-[#999999] hover:text-[#00B5B3] transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Expanded View */}
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00B5B3] to-[#0099A8] flex items-center justify-center flex-shrink-0">
                              <Network className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-[#333333]">{conn.targetAgentName}</h4>
                                <Badge
                                  variant="outline"
                                  className={`flex-shrink-0 ${
                                    conn.suggestedPriority === 'high'
                                      ? 'bg-[#FFF9F0] border-[#F79009] text-[#F79009]'
                                      : 'bg-[#F8F9FA] border-[#DDDDDD] text-[#666666]'
                                  }`}
                                >
                                  {conn.confidence * 100}% match
                                </Badge>
                              </div>
                              <p className="text-[#666666]">{conn.targetAgentDescription}</p>
                            </div>
                          </div>

                          {/* Reason */}
                          <div className="bg-[#F8F9FA] rounded-lg p-3 mb-3">
                            <div className="text-[#999999] mb-1">Why this connection?</div>
                            <p className="text-[#666666]">{conn.reason}</p>
                          </div>

                          {/* Foreign Keys */}
                          <div className="bg-white border border-[#EEEEEE] rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Key className="w-4 h-4 text-[#00B5B3]" />
                              <span className="text-[#999999]">Foreign Key Connections</span>
                            </div>
                            {conn.foreignKeys.map((fk, idx) => (
                              <div key={idx} className="text-[#666666] ml-6">
                                <span className="text-[#00B5B3]">{fk.sourceTable}</span>.{fk.sourceColumn}
                                <ArrowRight className="w-3 h-3 inline mx-2 text-[#999999]" />
                                <span className="text-[#00B5B3]">{fk.targetTable}</span>.{fk.targetColumn}
                              </div>
                            ))}
                          </div>

                          {/* Relationship Details */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white border border-[#EEEEEE] rounded-lg px-3 py-2">
                              <div className="text-[#999999]">Type</div>
                              <div className="text-[#333333]">{conn.relationshipType}</div>
                            </div>
                            <div className="bg-white border border-[#EEEEEE] rounded-lg px-3 py-2">
                              <div className="text-[#999999]">Priority</div>
                              <div className="text-[#333333]">{conn.suggestedPriority}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          {conn.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(conn.id)}
                                className="flex-1 bg-[#00B5B3] hover:bg-[#009996]"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleModify(conn.id)}
                                className="flex-1 border-[#DDDDDD]"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Modify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(conn.id)}
                                className="border-[#DDDDDD] hover:bg-[#FEF3F2] hover:border-[#F04438]"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {/* Status display for reviewed connections */}
                          {conn.status !== 'pending' && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`${getStatusColor(conn.status)}`}>
                                  {conn.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {conn.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                  {conn.status === 'modified' && <MessageSquare className="w-3 h-3 mr-1" />}
                                  {conn.status}
                                </Badge>
                                <button
                                  onClick={() => {
                                    setConnections((prev) =>
                                      prev.map((c) => (c.id === conn.id ? { ...c, status: 'pending' as const } : c))
                                    );
                                    setExpandedId(conn.id);
                                  }}
                                  className="text-[#00B5B3] hover:underline"
                                >
                                  Reset to pending
                                </button>
                              </div>

                              <button
                                onClick={() => {
                                  setExpandedId(null);
                                  if (conn.status === 'modified' && activeConnId === conn.id) {
                                    setShowChat(false);
                                    setActiveConnId(null);
                                  }
                                }}
                                className="text-[#999999] hover:text-[#00B5B3] transition-colors"
                              >
                                <ChevronDown className="w-4 h-4 rotate-180" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - Chat (only visible when modifying) */}
            {showChat && activeConnection && (
              <div className="w-1/2 bg-white rounded-lg border border-[#EEEEEE] overflow-hidden">
                <WizardChat
                  key={activeConnId}
                  taskTitle="Modify Agent Connection"
                  taskDescription={activeConnection.targetAgentName}
                  initialPrompt={`I've proposed a ${activeConnection.relationshipType} connection to ${activeConnection.targetAgentName} with ${
                    activeConnection.confidence * 100
                  }% confidence. What would you like to change about this connection?`}
                  placeholder="Describe what needs to change about this connection..."
                  onConfirm={handleChatConfirm}
                  onSkip={handleChatSkip}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer - Always show progress */}
        <div className="fixed bottom-0 left-[280px] right-0 bg-white border-t border-[#EEEEEE] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-40">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleSkipAll} className="border-[#DDDDDD]">
                  Skip All
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00B5B3] text-white flex items-center justify-center text-xs">
                    {reviewedCount}
                  </div>
                  <span className="text-sm text-[#666666]">
                    {reviewedCount}/{connections.length} connection{connections.length !== 1 ? 's' : ''} reviewed
                  </span>
                </div>
                {allReviewed && (
                  <Badge variant="outline" className="bg-[#E8F5E9] text-[#4CAF50] border-[#4CAF50]">
                    <Check className="w-3 h-3 mr-1" />
                    Ready to finish
                  </Badge>
                )}
              </div>
              <Button onClick={handleFinish} className="bg-[#00B5B3] hover:bg-[#009996]">
                {approvedCount > 0 ? `Finish with ${approvedCount} Connection${approvedCount !== 1 ? 's' : ''}` : 'Finish & View Agent'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
