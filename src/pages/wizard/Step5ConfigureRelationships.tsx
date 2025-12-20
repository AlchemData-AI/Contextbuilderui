import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { WizardChat } from '../../components/wizard/WizardChat';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { CheckCircle2, XCircle, MessageSquare, ArrowRight, ChevronDown, Loader2, Brain } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Relationship {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  relationshipType: 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one';
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  reason?: string;
}

interface ThinkingLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'thinking' | 'action' | 'complete';
}

const MOCK_RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel-1',
    fromTable: 'orders',
    fromColumn: 'customer_id',
    toTable: 'customers',
    toColumn: 'id',
    relationshipType: 'many-to-one',
    confidence: 0.98,
    status: 'pending',
    reason: 'Foreign key relationship detected. Multiple orders can belong to one customer.',
  },
  {
    id: 'rel-2',
    fromTable: 'order_items',
    fromColumn: 'order_id',
    toTable: 'orders',
    toColumn: 'id',
    relationshipType: 'many-to-one',
    confidence: 0.95,
    status: 'pending',
    reason: 'Foreign key relationship detected. Each order can have multiple line items.',
  },
  {
    id: 'rel-3',
    fromTable: 'order_items',
    fromColumn: 'product_id',
    toTable: 'products',
    toColumn: 'id',
    relationshipType: 'many-to-one',
    confidence: 0.92,
    status: 'pending',
    reason: 'Links order items to product catalog for detailed product information.',
  },
  {
    id: 'rel-4',
    fromTable: 'customers',
    fromColumn: 'id',
    toTable: 'customer_segments',
    toColumn: 'customer_id',
    relationshipType: 'one-to-many',
    confidence: 0.88,
    status: 'pending',
    reason: 'Enables customer segmentation analysis. One customer can belong to multiple segments over time.',
  },
];

const AGENT_THOUGHTS: string[] = [
  "Initializing relationship discovery agent...",
  "Loading schema metadata from analysis results",
  "Examining table structures: orders, customers, order_items, products, customer_segments",
  "Analyzing foreign key constraints and naming conventions",
  "Detected explicit foreign key: orders.customer_id",
  "Detected explicit foreign key: order_items.order_id",
  "Detected explicit foreign key: order_items.product_id",
  "Scanning for implicit relationships based on column naming patterns",
  "Found potential relationship: customers.id → customer_segments.customer_id",
  "Analyzing data cardinality patterns to determine relationship types",
  "Checking referential integrity: orders.customer_id → customers.id (98% match rate)",
  "Checking referential integrity: order_items.order_id → orders.id (100% match rate)",
  "Checking referential integrity: order_items.product_id → products.id (95% match rate)",
  "Calculating confidence scores based on constraint strength and data integrity",
  "Validating relationship directionality (one-to-many, many-to-one)",
  "Building relationship graph with 4 primary relationships",
  "Relationship discovery complete. Ready for analyst review.",
];

export function Step5ConfigureRelationships() {
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState<Relationship[]>(MOCK_RELATIONSHIPS);
  const [showChat, setShowChat] = useState(false);
  const [activeRelId, setActiveRelId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_RELATIONSHIPS[0]?.id || null);
  const relationshipRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(true);
  const [logs, setLogs] = useState<ThinkingLog[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (scrollRef.current && logs.length > 0) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLDivElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [logs]);

  // Streaming agent thoughts
  useEffect(() => {
    if (!isProcessing) return;

    if (currentLogIndex >= AGENT_THOUGHTS.length) {
      // Mark as complete
      setTimeout(() => {
        setIsComplete(true);
        // Hide processing view and show relationships
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      }, 500);
      return;
    }

    const delay = currentLogIndex === 0 ? 500 : 150;
    
    const timer = setTimeout(() => {
      const newLog: ThinkingLog = {
        id: `log-${currentLogIndex}`,
        timestamp: new Date(),
        message: AGENT_THOUGHTS[currentLogIndex],
        type: currentLogIndex === AGENT_THOUGHTS.length - 1 ? 'complete' : 
              currentLogIndex < 3 ? 'action' : 'thinking',
      };
      
      setLogs((prev) => [...prev, newLog]);
      setCurrentLogIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentLogIndex, isProcessing]);

  const activeRelationship = activeRelId
    ? relationships.find((r) => r.id === activeRelId)
    : null;
  const reviewedCount = relationships.filter((r) => r.status !== 'pending').length;
  const allReviewed = relationships.every((r) => r.status !== 'pending');

  const scrollToRelationship = (id: string) => {
    const element = relationshipRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (expandedId && showChat && activeRelId && expandedId !== activeRelId) {
      setShowChat(false);
      setActiveRelId(null);
    }
  }, [expandedId, showChat, activeRelId]);

  const handleApprove = (id: string) => {
    setRelationships((prev) =>
      prev.map((rel) => (rel.id === id ? { ...rel, status: 'approved' as const } : rel))
    );
    toast.success('Relationship approved');
    
    const currentIndex = relationships.findIndex((r) => r.id === id);
    const nextPending = relationships.slice(currentIndex + 1).find((r) => r.status === 'pending');
    
    if (nextPending) {
      setExpandedId(nextPending.id);
      setTimeout(() => scrollToRelationship(nextPending.id), 100);
    } else {
      setExpandedId(null);
    }
  };

  const handleReject = (id: string) => {
    setRelationships((prev) =>
      prev.map((rel) => (rel.id === id ? { ...rel, status: 'rejected' as const } : rel))
    );
    toast.success('Relationship rejected');
    
    const currentIndex = relationships.findIndex((r) => r.id === id);
    const nextPending = relationships.slice(currentIndex + 1).find((r) => r.status === 'pending');
    
    if (nextPending) {
      setExpandedId(nextPending.id);
      setTimeout(() => scrollToRelationship(nextPending.id), 100);
    } else {
      setExpandedId(null);
    }
  };

  const handleModify = (id: string) => {
    setActiveRelId(id);
    setShowChat(true);
    setExpandedId(id);
  };

  const handleChatConfirm = (value: string) => {
    if (!activeRelId) return;

    setRelationships((prev) =>
      prev.map((rel) =>
        rel.id === activeRelId ? { ...rel, status: 'modified' as const, reason: value } : rel
      )
    );
    
    const currentIndex = relationships.findIndex((r) => r.id === activeRelId);
    const nextPending = relationships.slice(currentIndex + 1).find((r) => r.status === 'pending');
    
    if (nextPending) {
      setExpandedId(nextPending.id);
      setTimeout(() => scrollToRelationship(nextPending.id), 100);
    } else {
      setExpandedId(null);
    }
    
    setShowChat(false);
    setActiveRelId(null);
    toast.success('Relationship modified');
  };

  const handleChatSkip = () => {
    if (!activeRelId) return;

    setRelationships((prev) =>
      prev.map((rel) =>
        rel.id === activeRelId ? { ...rel, status: 'modified' as const } : rel
      )
    );
    
    const currentIndex = relationships.findIndex((r) => r.id === activeRelId);
    const nextPending = relationships.slice(currentIndex + 1).find((r) => r.status === 'pending');
    
    if (nextPending) {
      setExpandedId(nextPending.id);
      setTimeout(() => scrollToRelationship(nextPending.id), 100);
    } else {
      setExpandedId(null);
    }
    
    setShowChat(false);
    setActiveRelId(null);
    toast.success('Relationship marked as modified');
  };

  const handleContinue = () => {
    if (!allReviewed) {
      toast.error('Please review all relationships before continuing');
      return;
    }

    localStorage.setItem(
      'wizardData',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('wizardData') || '{}'),
        relationships,
      })
    );

    toast.success('Relationships configured');
    navigate('/agents/create/step-6');
  };

  const getStatusColor = (status: Relationship['status']) => {
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

  const progress = (currentLogIndex / AGENT_THOUGHTS.length) * 100;

  return (
    <WizardLayout
      currentStep={5}
      totalSteps={7}
      title="Configure Relationships"
      onBack={() => navigate('/agents/create/step-4')}
      onSaveDraft={() => {
        localStorage.setItem(
          'wizardDraft',
          JSON.stringify({
            step: 5,
            relationships,
          })
        );
        toast.success('Draft saved');
      }}
    >
      {isProcessing ? (
        // Processing View - Agent Thinking
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="p-6 border border-[#EEEEEE]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#E0F7F7] rounded-lg flex items-center justify-center flex-shrink-0">
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-[#00B98E]" />
                ) : (
                  <Brain className="w-6 h-6 text-[#00B5B3] animate-pulse" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-[#333333] mb-1">
                  {isComplete ? 'Discovery Complete' : 'Agent Thinking...'}
                </h2>
                <p className="text-sm text-[#666666]">
                  {isComplete 
                    ? 'AI has finished analyzing table relationships and dependencies'
                    : 'AI is discovering relationships between your data tables'
                  }
                </p>
                
                {/* Progress indicator */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00B5B3] transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-[#00B5B3] min-w-[40px] text-right">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Agent Thinking Logs */}
          <Card className="border border-[#EEEEEE] overflow-hidden">
            <div className="p-4 border-b border-[#EEEEEE] bg-[#FAFBFC]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#00B5B3]" />
                <span className="text-sm font-medium text-[#333333]">Agent Reasoning</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {logs.length} thoughts
                </Badge>
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-440px)]" ref={scrollRef}>
              <div className="p-4 space-y-1 font-mono text-xs">
                {logs.map((log, idx) => (
                  <div 
                    key={log.id}
                    className={`py-1.5 px-3 rounded transition-all duration-200 ${
                      log.type === 'complete' 
                        ? 'bg-[#E8F5E9] text-[#2E7D32]' 
                        : log.type === 'action'
                        ? 'bg-[#E0F7F7] text-[#00796B]'
                        : 'text-[#666666]'
                    }`}
                    style={{
                      animation: `fadeIn 0.3s ease-out ${idx * 0.02}s both`
                    }}
                  >
                    <span className="text-[#999999] mr-3 select-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {!isComplete && currentLogIndex < AGENT_THOUGHTS.length && (
                  <div className="py-1.5 px-3 text-[#999999] flex items-center gap-2">
                    <span className="mr-3">{String(currentLogIndex + 1).padStart(2, '00')}</span>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      ) : (
        // Main Relationships Review View
        <div className="h-full flex flex-col pb-10">
          <div className="flex-1 overflow-hidden">
            <div className={`h-full flex gap-4 px-8`}>
              {/* Left Panel - Relationships List */}
              <div
                className={`${
                  showChat ? 'w-1/2' : 'flex-1 max-w-4xl mx-auto'
                } transition-all overflow-y-auto scrollbar-hide`}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <div className="space-y-3">
                  {relationships.map((rel) => {
                    const isExpanded = expandedId === rel.id;
                    const isHighlighted = isExpanded;
                    
                    return (
                      <div
                        key={rel.id}
                        ref={(el) => (relationshipRefs.current[rel.id] = el)}
                        className={`bg-white border-2 rounded-lg transition-all ${
                          isHighlighted
                            ? 'border-[#00B5B3] shadow-[0_0_0_3px_rgba(0,181,179,0.1)]'
                            : 'border-[#EEEEEE] hover:border-[#CCCCCC]'
                        } ${isExpanded ? 'p-4' : 'p-3'}`}
                      >
                        {/* Minimized View */}
                        {!isExpanded && rel.status !== 'pending' ? (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => {
                                setExpandedId(rel.id);
                                setTimeout(() => scrollToRelationship(rel.id), 100);
                                if (rel.status === 'modified') {
                                  setActiveRelId(rel.id);
                                  setShowChat(true);
                                }
                              }}
                              className="flex items-center gap-3 flex-1 text-left hover:opacity-75 transition-opacity"
                            >
                              <div className="flex items-center gap-2 text-sm flex-1">
                                <span className="text-[#666666]">{rel.fromTable}.{rel.fromColumn}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#00B5B3]" />
                                <span className="text-[#666666]">{rel.toTable}.{rel.toColumn}</span>
                              </div>
                              
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 ${getStatusColor(rel.status)}`}
                              >
                                {rel.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {rel.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                {rel.status === 'modified' && <MessageSquare className="w-3 h-3 mr-1" />}
                                {rel.status}
                              </Badge>
                            </button>
                            
                            <button
                              onClick={() => {
                                setExpandedId(rel.id);
                                setTimeout(() => scrollToRelationship(rel.id), 100);
                                if (rel.status === 'modified') {
                                  setActiveRelId(rel.id);
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
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mb-3">
                              <div className="bg-white border border-[#EEEEEE] rounded-lg px-3 py-2.5">
                                <div className="text-sm">
                                  <span className="text-[#999999]">{rel.fromTable}</span>
                                  <span className="text-[#CCCCCC] mx-1">•</span>
                                  <span className="text-[#333333]">{rel.fromColumn}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 text-[#00B5B3]" />
                              </div>

                              <div className="bg-white border border-[#EEEEEE] rounded-lg px-3 py-2.5">
                                <div className="text-sm">
                                  <span className="text-[#999999]">{rel.toTable}</span>
                                  <span className="text-[#CCCCCC] mx-1">•</span>
                                  <span className="text-[#333333]">{rel.toColumn}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-sm text-[#666666] mb-3">
                              <span className="text-[#333333]">{rel.relationshipType}</span> • {rel.reason}
                            </div>

                            {/* Action Buttons */}
                            {rel.status === 'pending' ? (
                              <div className="flex items-center justify-between">
                                <TooltipProvider delayDuration={200}>
                                  <div className="flex items-center gap-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleApprove(rel.id)}
                                          className="w-7 h-7 rounded-full bg-[#E8F5E9] hover:bg-[#C8E6C9] flex items-center justify-center transition-colors"
                                        >
                                          <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">
                                        Accept this relationship as correct
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleReject(rel.id)}
                                          className="w-7 h-7 rounded-full bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center transition-colors"
                                        >
                                          <XCircle className="w-4 h-4 text-[#F04438]" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">
                                        Reject this relationship
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleModify(rel.id)}
                                          className="w-7 h-7 rounded-full bg-[#FFF3E0] hover:bg-[#FFE0B2] flex items-center justify-center transition-colors"
                                        >
                                          <MessageSquare className="w-4 h-4 text-[#F79009]" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">
                                        Modify relationship with AI chat
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </TooltipProvider>

                                <Badge variant="outline" className="text-xs">
                                  {Math.round(rel.confidence * 100)}% confidence
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getStatusColor(rel.status)}`}
                                >
                                  {rel.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                  {rel.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                  {rel.status === 'modified' && <MessageSquare className="w-3 h-3 mr-1" />}
                                  {rel.status}
                                </Badge>
                                <button
                                  onClick={() => {
                                    setExpandedId(null);
                                  }}
                                  className="text-xs text-[#00B5B3] hover:underline"
                                >
                                  Collapse
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

              {/* Right Panel - Chat (conditional) */}
              {showChat && activeRelationship && (
                <div className="w-1/2 flex flex-col">
                  <WizardChat
                    title={`Modify: ${activeRelationship.fromTable}.${activeRelationship.fromColumn} → ${activeRelationship.toTable}.${activeRelationship.toColumn}`}
                    placeholder="Describe how this relationship should be modified..."
                    onConfirm={handleChatConfirm}
                    onSkip={handleChatSkip}
                    skipLabel="Keep as Modified"
                    context={{
                      relationship: activeRelationship,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pt-4 border-t border-[#EEEEEE] bg-white">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="text-sm text-[#666666]">
                {reviewedCount} of {relationships.length} relationships reviewed
              </div>
              <Button
                onClick={handleContinue}
                disabled={!allReviewed}
                className="bg-[#00B5B3] hover:bg-[#00A5A3] text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-4px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </WizardLayout>
  );
}