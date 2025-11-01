import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { WizardChat } from '../../components/wizard/WizardChat';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { CheckCircle2, XCircle, MessageSquare, ArrowRight, Check, ChevronDown } from 'lucide-react';
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

export function Step5ConfigureRelationships() {
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState<Relationship[]>(MOCK_RELATIONSHIPS);
  const [showChat, setShowChat] = useState(false);
  const [activeRelId, setActiveRelId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_RELATIONSHIPS[0]?.id || null);
  const relationshipRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  // Close chat when switching to a different relationship (unless explicitly opening chat for that relationship)
  useEffect(() => {
    if (expandedId && showChat && activeRelId && expandedId !== activeRelId) {
      setShowChat(false);
      setActiveRelId(null);
    }
  }, [expandedId]);

  const handleApprove = (id: string) => {
    setRelationships((prev) =>
      prev.map((rel) => (rel.id === id ? { ...rel, status: 'approved' as const } : rel))
    );
    toast.success('Relationship approved');
    
    // Find next pending relationship
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
    
    // Find next pending relationship
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
    
    // Find next pending relationship
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
    
    // Find next pending relationship
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
      <div className="h-full flex flex-col pb-10">
        {/* Two-Panel Layout */}
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
              {relationships.map((rel, index) => {
                const isExpanded = expandedId === rel.id;
                // Highlight any expanded relationship
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
                          {/* Compact Relationship Display */}
                          <div className="flex items-center gap-2 text-sm flex-1">
                            <span className="text-[#666666]">{rel.fromTable}.{rel.fromColumn}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#00B5B3]" />
                            <span className="text-[#666666]">{rel.toTable}.{rel.toColumn}</span>
                          </div>
                          
                          {/* Status Badge */}
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
                        
                        {/* Expand Button */}
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
                        {/* Two-column Grid for Table.Column → Table.Column */}
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mb-3">
                          {/* From Side */}
                          <div className="bg-white border border-[#EEEEEE] rounded-lg px-3 py-2.5">
                            <div className="text-sm">
                              <span className="text-[#999999]">{rel.fromTable}</span>
                              <span className="text-[#CCCCCC] mx-1">•</span>
                              <span className="text-[#333333]">{rel.fromColumn}</span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 text-[#00B5B3]" />
                          </div>

                          {/* To Side */}
                          <div className="bg-white border border-[#EEEEEE] rounded-lg px-3 py-2.5">
                            <div className="text-sm">
                              <span className="text-[#999999]">{rel.toTable}</span>
                              <span className="text-[#CCCCCC] mx-1">•</span>
                              <span className="text-[#333333]">{rel.toColumn}</span>
                            </div>
                          </div>
                        </div>

                        {/* Relationship Type & Reason */}
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
                                    Remove this relationship
                                  </TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => handleModify(rel.id)}
                                      className="w-7 h-7 rounded-full bg-[#E0F7F7] hover:bg-[#B2EBF2] flex items-center justify-center transition-colors"
                                    >
                                      <MessageSquare className="w-4 h-4 text-[#00B5B3]" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    Chat with AI to adjust this relationship
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                            
                            <span className="text-xs text-[#999999]">
                              {Math.round(rel.confidence * 100)}% confidence
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 ${getStatusColor(rel.status)}`}
                              >
                                {rel.status}
                              </Badge>
                              <button
                                className="text-xs text-[#00B5B3] hover:text-[#009996] underline"
                                onClick={() => {
                                  setRelationships((prev) =>
                                    prev.map((r) =>
                                      r.id === rel.id ? { ...r, status: 'pending' as const } : r
                                    )
                                  );
                                  setExpandedId(rel.id);
                                }}
                              >
                                Reset to pending
                              </button>
                            </div>
                            
                            <button
                              onClick={() => {
                                setExpandedId(null);
                                if (rel.status === 'modified' && activeRelId === rel.id) {
                                  setShowChat(false);
                                  setActiveRelId(null);
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
            {showChat && activeRelationship && (
              <div className="w-1/2 bg-white rounded-lg border border-[#EEEEEE] overflow-hidden">
                <WizardChat
                  key={activeRelId}
                  taskTitle="Modify Relationship"
                  taskDescription={`${activeRelationship.fromTable}.${activeRelationship.fromColumn} → ${activeRelationship.toTable}.${activeRelationship.toColumn}`}
                  initialPrompt={`I've detected this relationship with ${Math.round(
                    activeRelationship.confidence * 100
                  )}% confidence. The current type is "${
                    activeRelationship.relationshipType
                  }". What would you like to change about this relationship?`}
                  placeholder="Describe what needs to change..."
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
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00B5B3] text-white flex items-center justify-center text-xs">
                    {reviewedCount}
                  </div>
                  <span className="text-sm text-[#666666]">
                    {reviewedCount}/{relationships.length} relationship
                    {relationships.length !== 1 ? 's' : ''} reviewed
                  </span>
                </div>
                {allReviewed && (
                  <Badge
                    variant="outline"
                    className="bg-[#E8F5E9] text-[#4CAF50] border-[#4CAF50]"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Ready to continue
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleContinue}
                className="bg-[#00B5B3] hover:bg-[#009996]"
                disabled={!allReviewed}
              >
                Continue to Queries & Metrics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
