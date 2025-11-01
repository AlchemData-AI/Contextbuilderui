import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { TwoPanelWizardLayout, PanelItem } from '../../components/wizard/TwoPanelWizardLayout';
import { WizardChat } from '../../components/wizard/WizardChat';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { ChevronRight, Check, MessageSquare, TrendingUp, CheckCircle2, XCircle, Code, Edit2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type ItemType = 'query' | 'metric';

interface QueryOrMetricItem {
  id: string;
  type: ItemType;
  label: string;
  description: string;
  question?: string; // For queries
  aiAnswer?: string; // For queries
  sqlQuery?: string;
  metricValue?: string; // For metrics
  status: 'pending' | 'approved' | 'rejected' | 'modified';
}

const MOCK_ITEMS: QueryOrMetricItem[] = [
  // Sample Queries
  {
    id: 'q1',
    type: 'query',
    label: 'Total sales last month',
    description: 'What were our total sales last month?',
    question: 'What were our total sales last month?',
    aiAnswer: 'Total sales for last month were $2.4M, which represents a 12% increase compared to the previous month.',
    sqlQuery: `SELECT \n  SUM(total_amount) as total_sales,\n  COUNT(*) as order_count\nFROM orders\nWHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')\n  AND created_at < DATE_TRUNC('month', CURRENT_DATE)`,
    status: 'pending',
  },
  {
    id: 'q2',
    type: 'query',
    label: 'Products low in stock',
    description: 'Which products are currently low in stock?',
    question: 'Which products are currently low in stock?',
    aiAnswer: 'There are 8 products with stock levels below the reorder threshold. The most critical are: Wireless Mouse (5 units), USB-C Cable (12 units), and Phone Case (8 units).',
    sqlQuery: `SELECT \n  p.name,\n  i.quantity_available,\n  i.reorder_threshold\nFROM inventory i\nJOIN products p ON i.product_id = p.id\nWHERE i.quantity_available < i.reorder_threshold\nORDER BY (i.reorder_threshold - i.quantity_available) DESC`,
    status: 'pending',
  },
  {
    id: 'q3',
    type: 'query',
    label: 'Top 10 customers',
    description: 'Who are our top 10 customers by revenue?',
    question: 'Who are our top 10 customers by revenue?',
    aiAnswer: 'The top 10 customers account for $850K in total revenue. Leading customer is TechCorp Inc. with $145K in lifetime value.',
    sqlQuery: `SELECT \n  c.name,\n  c.email,\n  SUM(o.total_amount) as lifetime_value,\n  COUNT(o.id) as order_count\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.email\nORDER BY lifetime_value DESC\nLIMIT 10`,
    status: 'pending',
  },
  // Metrics
  {
    id: 'm1',
    type: 'metric',
    label: 'Total Revenue',
    description: 'Sum of all completed orders',
    sqlQuery: "SELECT SUM(total_amount) FROM orders WHERE status = 'completed'",
    metricValue: '$2,450,000',
    status: 'pending',
  },
  {
    id: 'm2',
    type: 'metric',
    label: 'Average Order Value',
    description: 'Mean revenue per order',
    sqlQuery: "SELECT AVG(total_amount) FROM orders WHERE status = 'completed'",
    metricValue: '$127.50',
    status: 'pending',
  },
  {
    id: 'm3',
    type: 'metric',
    label: 'Active Customers',
    description: 'Unique customers with orders in last 30 days',
    sqlQuery: "SELECT COUNT(DISTINCT customer_id) FROM orders WHERE created_at > CURRENT_DATE - INTERVAL '30 days'",
    metricValue: '4,234',
    status: 'pending',
  },
];

// SQL Syntax Highlighting
function highlightSql(sql: string): string {
  const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|GROUP BY|ORDER BY|HAVING|AS|COUNT|SUM|AVG|MAX|MIN|DISTINCT|LIMIT|OFFSET|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|DATABASE|DATE_TRUNC|INTERVAL|CURRENT_DATE)\b/gi;
  const functions = /\b(COUNT|SUM|AVG|MAX|MIN|UPPER|LOWER|TRIM|LENGTH|SUBSTRING|CONCAT|ROUND|FLOOR|CEIL|NOW|DATE|YEAR|MONTH|DAY)\s*\(/gi;
  const strings = /'([^']*)'/g;
  const numbers = /\b(\d+)\b/g;
  const comments = /(--[^\n]*)/g;
  
  return sql
    .replace(keywords, '<span style="color: #C586C0;">$1</span>')
    .replace(functions, '<span style="color: #DCDCAA;">$1</span>(')
    .replace(strings, '<span style="color: #CE9178;">\'$1\'</span>')
    .replace(numbers, '<span style="color: #B5CEA8;">$1</span>')
    .replace(comments, '<span style="color: #6A9955;">$1</span>');
}

export function Step5SampleQueriesMetrics() {
  const navigate = useNavigate();
  const [items, setItems] = useState(MOCK_ITEMS);
  const [activeItemId, setActiveItemId] = useState(MOCK_ITEMS[0].id);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [showChat, setShowChat] = useState(false);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [correctCode, setCorrectCode] = useState('');

  const activeItem = items.find((i) => i.id === activeItemId);

  const panelItems: PanelItem[] = items.map((item) => ({
    id: item.id,
    label: item.label,
    description: item.description,
    completed: completedItems.has(item.id),
    inputType: 'multiple-choice',
    icon: item.type === 'query' ? MessageSquare : TrendingUp,
  }));

  const handleApprove = () => {
    if (!activeItem) return;
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === activeItemId ? { ...item, status: 'approved' as const } : item
      )
    );
    
    setCompletedItems(new Set(completedItems).add(activeItemId));
    toast.success('Approved');
    
    // Auto-move to next after a brief moment
    setTimeout(() => {
      moveToNextPending();
    }, 800);
  };

  const handleReject = () => {
    if (!activeItem) return;
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === activeItemId ? { ...item, status: 'rejected' as const } : item
      )
    );
    
    setCompletedItems(new Set(completedItems).add(activeItemId));
    toast.success('Rejected');
    
    // Auto-move to next after a brief moment
    setTimeout(() => {
      moveToNextPending();
    }, 800);
  };

  const handleModify = () => {
    setShowChat(true);
  };

  const handleEdit = () => {
    if (!activeItem) return;
    // Reset to pending status to allow re-review
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === activeItemId ? { ...item, status: 'pending' as const } : item
      )
    );
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(activeItemId);
      return newSet;
    });
  };

  const moveToNextPending = () => {
    const currentIndex = items.findIndex((i) => i.id === activeItemId);
    const nextPending = items
      .slice(currentIndex + 1)
      .find((i) => !completedItems.has(i.id));
    
    if (nextPending) {
      setActiveItemId(nextPending.id);
      setShowChat(false);
    }
  };

  const handleChatConfirm = (value: string) => {
    if (!activeItem) return;
    
    // Mark as modified
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === activeItemId ? { ...item, status: 'modified' as const } : item
      )
    );
    
    setCompletedItems(new Set(completedItems).add(activeItemId));
    setShowChat(false);
    toast.success('Modified');
    
    setTimeout(() => {
      moveToNextPending();
    }, 800);
  };

  const handleCodeSubmit = () => {
    if (!correctCode.trim()) {
      toast.error('Please enter the correct code');
      return;
    }

    // Update the item with correct code
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === activeItemId ? { ...item, sqlQuery: correctCode, status: 'modified' as const } : item
      )
    );
    
    setCodeEditorOpen(false);
    setCompletedItems(new Set(completedItems).add(activeItemId));
    toast.success('Modified');
    setCorrectCode('');
    setShowChat(false);
    
    setTimeout(() => {
      moveToNextPending();
    }, 800);
  };

  const handleSkipChat = () => {
    if (!activeItem) return;
    setCompletedItems(new Set(completedItems).add(activeItemId));
    setShowChat(false);
    toast.success('Marked as done');
    moveToNextPending();
  };

  const handleContinue = () => {
    if (completedItems.size < items.length) {
      toast.error('Please review all items before continuing');
      return;
    }

    localStorage.setItem('wizardData', JSON.stringify({
      ...JSON.parse(localStorage.getItem('wizardData') || '{}'),
      sampleQueries: items.filter(i => i.type === 'query'),
      metrics: items.filter(i => i.type === 'metric'),
    }));
    
    toast.success('Queries and metrics validated');
    navigate('/agents/create/step-7'); // Now step 7 is Review & Publish
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'modified':
        return 'Modified';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-[#4CAF50]';
      case 'rejected':
        return 'text-[#F04438]';
      case 'modified':
        return 'text-[#00B5B3]';
      default:
        return '';
    }
  };

  const renderContent = () => {
    if (!activeItem) return null;

    // Chat mode
    if (showChat) {
      return (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4 border-b border-[#EEEEEE]">
              {activeItem.type === 'query' ? (
                <>
                  <div>
                    <Label className="mb-2 block text-xs text-[#666666]">Question</Label>
                    <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded-lg p-3">
                      <p className="text-sm text-[#333333]">{activeItem.question}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block text-xs text-[#666666]">AI Answer</Label>
                    <div className="bg-[#F0FFFE] border border-[#00B5B3] rounded-lg p-3">
                      <p className="text-sm text-[#333333]">{activeItem.aiAnswer}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <Label className="mb-2 block text-xs text-[#666666]">Metric Value</Label>
                  <div className="bg-[#F0FFFE] border border-[#00B5B3] rounded-lg p-3">
                    <p className="text-xl text-[#00B5B3]">{activeItem.metricValue}</p>
                    <p className="text-xs text-[#666666] mt-1">{activeItem.description}</p>
                  </div>
                </div>
              )}
              {activeItem.sqlQuery && (
                <div>
                  <Label className="mb-2 block text-xs text-[#666666]">SQL Query</Label>
                  <div className="rounded border border-[#E5E7EB] bg-[#F9FAFB]">
                    <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#E5E7EB]">
                      <span className="text-xs text-[#6B7280]">
                        {activeItem.type === 'query' ? 'query.sql' : 'metric.sql'}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#374151]">
                        <span dangerouslySetInnerHTML={{ __html: highlightSql(activeItem.sqlQuery) }} />
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <WizardChat
                taskTitle={activeItem.label}
                taskDescription={`Discuss modifications needed for this ${activeItem.type}`}
                initialPrompt={`I ${activeItem.type === 'query' ? 'answered this question' : 'calculated this metric'}. Does this look correct to you? If not, let me know what needs to be changed.`}
                placeholder="Describe what needs to change..."
                onConfirm={handleChatConfirm}
                onSkip={handleSkipChat}
              />
            </div>
          </div>
          
          <div className="border-t border-[#EEEEEE] p-4 bg-white">
            <Button
              onClick={() => {
                setCorrectCode(activeItem.sqlQuery || '');
                setCodeEditorOpen(true);
              }}
              variant="outline"
              className="w-full text-[#00B5B3] border-[#00B5B3] hover:bg-[#F0FFFE]"
            >
              <Code className="w-4 h-4 mr-2" />
              Add Correct Code
            </Button>
          </div>
        </div>
      );
    }

    // Completed state - show status and task completed
    if (completedItems.has(activeItemId)) {
      return (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 overflow-y-auto pb-10">
            <div className="px-[24px] py-[0px]">
              <div className="py-6 pr-6">
                <p className={`font-semibold text-sm ${getStatusColor(activeItem.status)} mb-1`}>
                  {getStatusLabel(activeItem.status)}
                </p>
                <p className="font-semibold text-sm text-[#333333] mb-4">✅ Task Completed</p>
                
                {activeItem.type === 'query' ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="mb-2 block">Question</Label>
                      <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded-lg p-3">
                        <p className="text-sm text-[#333333]">{activeItem.question}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">AI Answer</Label>
                      <div className="bg-[#F0FFFE] border border-[#00B5B3] rounded-lg p-3">
                        <p className="text-sm text-[#333333]">{activeItem.aiAnswer}</p>
                      </div>
                    </div>
                    {activeItem.sqlQuery && (
                      <div>
                        <Label className="mb-2 block">SQL Query</Label>
                        <div className="rounded border border-[#E5E7EB] bg-[#F9FAFB]">
                          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#E5E7EB]">
                            <span className="text-xs text-[#6B7280]">query.sql</span>
                          </div>
                          <div className="p-2.5">
                            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#374151]">
                              <span dangerouslySetInnerHTML={{ __html: highlightSql(activeItem.sqlQuery) }} />
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="mb-2 block">Metric Name</Label>
                      <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded-lg p-3">
                        <p className="text-sm text-[#333333]">{activeItem.label}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Current Value</Label>
                      <div className="bg-[#F0FFFE] border border-[#00B5B3] rounded-lg p-3">
                        <p className="text-xl text-[#00B5B3]">{activeItem.metricValue}</p>
                        <p className="text-xs text-[#666666] mt-1">{activeItem.description}</p>
                      </div>
                    </div>
                    {activeItem.sqlQuery && (
                      <div>
                        <Label className="mb-2 block">SQL Calculation</Label>
                        <div className="rounded border border-[#E5E7EB] bg-[#F9FAFB]">
                          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#E5E7EB]">
                            <span className="text-xs text-[#6B7280]">metric.sql</span>
                          </div>
                          <div className="p-2.5">
                            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#374151]">
                              <span dangerouslySetInnerHTML={{ __html: highlightSql(activeItem.sqlQuery) }} />
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-[#EEEEEE] p-4 bg-white">
            <Button
              onClick={handleEdit}
              variant="outline"
              className="w-full"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      );
    }

    // Query display
    if (activeItem.type === 'query') {
      return (
        <div className="absolute inset-0 overflow-y-auto flex flex-col">
          <div className="flex-1 p-6 space-y-4">
            <div>
              <Label className="mb-2 block">Question</Label>
              <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded-lg p-4">
                <p className="text-sm text-[#333333]">{activeItem.question}</p>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">AI Answer</Label>
              <div className="bg-[#F0FFFE] border border-[#00B5B3] rounded-lg p-4">
                <p className="text-sm text-[#333333]">{activeItem.aiAnswer}</p>
              </div>
            </div>

            {/* SQL Query - Always Expanded */}
            {activeItem.sqlQuery && (
              <div>
                <Label className="mb-2 block">SQL Query</Label>
                <div className="rounded border border-[#E5E7EB] bg-[#F9FAFB]">
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#E5E7EB]">
                    <span className="text-xs text-[#6B7280]">query.sql</span>
                  </div>
                  <div className="p-2.5">
                    <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#374151]">
                      <span dangerouslySetInnerHTML={{ __html: highlightSql(activeItem.sqlQuery) }} />
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <TooltipProvider delayDuration={200}>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleApprove}
                        className="w-7 h-7 rounded-full bg-[#E8F5E9] hover:bg-[#C8E6C9] flex items-center justify-center transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Accept this query as correct
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleReject}
                        className="w-7 h-7 rounded-full bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-[#F04438]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Remove this query
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleModify}
                        className="w-7 h-7 rounded-full bg-[#E0F7F7] hover:bg-[#B2EBF2] flex items-center justify-center transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-[#00B5B3]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Chat with AI to modify this query
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      );
    }

    // Metric display
    return (
      <div className="absolute inset-0 overflow-y-auto flex flex-col">
        <div className="flex-1 p-6 space-y-4">
          <div>
            <Label className="mb-2 block">Metric Name</Label>
            <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded-lg p-4">
              <p className="text-sm text-[#333333]">{activeItem.label}</p>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Current Value</Label>
            <div className="bg-[#F0FFFE] border border-[#00B5B3] rounded-lg p-4">
              <p className="text-2xl text-[#00B5B3]">{activeItem.metricValue}</p>
              <p className="text-xs text-[#666666] mt-1">{activeItem.description}</p>
            </div>
          </div>

          {/* SQL Calculation - Always Expanded */}
          {activeItem.sqlQuery && (
            <div>
              <Label className="mb-2 block">SQL Calculation</Label>
              <div className="rounded border border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#E5E7EB]">
                  <span className="text-xs text-[#6B7280]">metric.sql</span>
                </div>
                <div className="p-2.5">
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#374151]">
                    <span dangerouslySetInnerHTML={{ __html: highlightSql(activeItem.sqlQuery) }} />
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleApprove}
                      className="w-7 h-7 rounded-full bg-[#E8F5E9] hover:bg-[#C8E6C9] flex items-center justify-center transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Accept this metric as correct
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleReject}
                      className="w-7 h-7 rounded-full bg-[#FFEBEE] hover:bg-[#FFCDD2] flex items-center justify-center transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-[#F04438]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Remove this metric
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleModify}
                      className="w-7 h-7 rounded-full bg-[#E0F7F7] hover:bg-[#B2EBF2] flex items-center justify-center transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-[#00B5B3]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Chat with AI to modify this metric
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  };

  const allReviewed = completedItems.size >= items.length;

  return (
    <WizardLayout
      title="Configure Sample Queries & Metrics"
      currentStep={6}
      totalSteps={7}
      onBack={() => navigate('/agents/create/step-5')}
      onSaveDraft={() => {
        localStorage.setItem(
          'wizardDraft',
          JSON.stringify({
            step: 6,
            items,
            completedItems: Array.from(completedItems),
          })
        );
        toast.success('Draft saved');
      }}
    >
      <div className="h-full flex flex-col">
        {/* Two-Panel Layout */}
        <div className="flex-1 overflow-hidden pb-[88px]">
          <TwoPanelWizardLayout
            items={panelItems}
            activeItemId={activeItemId}
            onItemClick={setActiveItemId}
          >
            {renderContent()}
          </TwoPanelWizardLayout>
        </div>

        {/* Footer - Always show progress */}
        <div className="fixed bottom-0 left-[280px] right-0 bg-white border-t border-[#EEEEEE] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-40">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00B5B3] text-white flex items-center justify-center text-xs">
                    {completedItems.size}
                  </div>
                  <span className="text-sm text-[#666666]">
                    {completedItems.size}/{items.length} item{items.length !== 1 ? 's' : ''} reviewed
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
                Continue to Review & Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor Dialog */}
      <Dialog open={codeEditorOpen} onOpenChange={setCodeEditorOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Correct SQL Code</DialogTitle>
            <DialogDescription>
              Paste the correct SQL code below that should replace the current query or metric calculation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code-editor">SQL Code *</Label>
              <Textarea
                id="code-editor"
                value={correctCode}
                onChange={(e) => setCorrectCode(e.target.value)}
                placeholder="SELECT * FROM..."
                className="font-mono text-sm h-64 mt-2"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCodeEditorOpen(false);
                  setCorrectCode('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCodeSubmit}
                className="bg-[#00B5B3] hover:bg-[#009996]"
              >
                Submit Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </WizardLayout>
  );
}
