import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { TwoPanelWizardLayout, PanelItem } from '../../components/wizard/TwoPanelWizardLayout';
import { WizardChat } from '../../components/wizard/WizardChat';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { ChevronRight, MessageSquare, TrendingUp, CheckCircle2, XCircle, Code, Edit2, Loader2, Brain } from 'lucide-react';
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

interface ThinkingLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'thinking' | 'action' | 'complete';
}

const AGENT_THOUGHTS: string[] = [
  "Initializing query and metrics generation agent...",
  "Loading schema analysis and relationship data from previous steps",
  "Analyzing business domain context and user personas",
  "Identifying common analytical patterns and questions",
  "Examining table structures for typical query patterns",
  "Generating natural language question: 'What were our total sales last month?'",
  "Constructing SQL query for monthly sales analysis",
  "Generating natural language question: 'Which products are currently low in stock?'",
  "Building inventory threshold query with product joins",
  "Generating natural language question: 'Who are our top 10 customers by revenue?'",
  "Creating customer lifetime value aggregation query",
  "Scanning for numeric columns suitable for key metrics",
  "Identified metric candidate: Total Revenue (SUM of order amounts)",
  "Identified metric candidate: Average Order Value (AVG of order amounts)",
  "Identified metric candidate: Active Customers (COUNT DISTINCT of recent customers)",
  "Validating all SQL queries for syntax correctness",
  "Checking column references against schema metadata",
  "Verifying join conditions and foreign key relationships",
  "All queries validated successfully. Generated 3 sample queries and 3 key metrics.",
];

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
  const [showChat, setShowChat] = useState(true); // Default to chat mode
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [correctCode, setCorrectCode] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false); // Set to false to skip processing animation by default
  const [logs, setLogs] = useState<ThinkingLog[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Skip processing if needed (for testing)
  const skipProcessing = () => {
    setIsComplete(true);
    setIsProcessing(false);
  };

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
        // Hide processing view and show review interface
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

      // Auto-scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentLogIndex, isProcessing]);

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
    
    setTimeout(() => {
      moveToNextPending();
    }, 800);
  };

  const handleModify = () => {
    setShowChat(true);
  };

  const handleEdit = () => {
    if (!activeItem) return;
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
      setShowChat(true); // Keep chat mode as default
    }
  };

  const handleChatConfirm = (value: string) => {
    if (!activeItem) return;
    
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
    navigate('/agents/create/step-7');
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
    if (!activeItem) {
      console.log('No active item found. activeItemId:', activeItemId, 'items:', items);
      return (
        <div className="p-6 flex items-center justify-center h-full">
          <p className="text-sm text-[#666666]">No item selected</p>
        </div>
      );
    }

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
              className="w-full"
            >
              <Code className="w-4 h-4 mr-2" />
              Edit SQL Code
            </Button>
          </div>
        </div>
      );
    }

    // Normal mode
    return (
      <div className="absolute inset-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111827]">{activeItem.label}</h3>
              <Badge
                variant="outline"
                className={activeItem.status !== 'pending' ? getStatusColor(activeItem.status) : ''}
              >
                {activeItem.type === 'query' ? 'Sample Query' : 'Key Metric'}
              </Badge>
            </div>

            {activeItem.type === 'query' ? (
              <div className="space-y-4">
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
              </div>
            ) : (
              <div>
                <Label className="mb-2 block text-xs text-[#666666]">Metric Value</Label>
                <div className="bg-[#F0FFFE] border border-[#00B5B3] rounded-lg p-4">
                  <p className="text-2xl font-semibold text-[#00B5B3]">{activeItem.metricValue}</p>
                  <p className="text-sm text-[#666666] mt-1">{activeItem.description}</p>
                </div>
              </div>
            )}

            {activeItem.sqlQuery && (
              <div className="mt-4">
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

          {/* Actions */}
          {activeItem.status === 'pending' ? (
            <div className="space-y-3">
              <TooltipProvider delayDuration={200}>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleApprove}
                        variant="outline"
                        className="flex-1 border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9] hover:text-[#4CAF50]"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      This {activeItem.type} is correct and ready to use
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleReject}
                        variant="outline"
                        className="flex-1 border-[#F04438] text-[#F04438] hover:bg-[#FEF3F2] hover:text-[#F04438]"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      This {activeItem.type} is not useful or accurate
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              <Button
                onClick={handleModify}
                variant="outline"
                className="w-full border-[#00B5B3] text-[#00B5B3] hover:bg-[#E0F7F7] hover:text-[#00B5B3]"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Modify with AI
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
                <span className="text-sm text-[#666666]">Status:</span>
                <span className={`text-sm font-medium ${getStatusColor(activeItem.status)}`}>
                  {getStatusLabel(activeItem.status)}
                </span>
              </div>
              <Button
                onClick={handleEdit}
                variant="outline"
                className="w-full"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Decision
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const progress = (currentLogIndex / AGENT_THOUGHTS.length) * 100;

  return (
    <WizardLayout
      title="Configure Sample Queries & Metrics"
      currentStep={6}
      totalSteps={8}
      onBack={() => navigate('/agents/create/step-5')}
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
                  {isComplete ? 'Generation Complete' : 'Agent Thinking...'}
                </h2>
                <p className="text-sm text-[#666666]">
                  {isComplete 
                    ? 'AI has finished generating sample queries and identifying key metrics'
                    : 'AI is creating sample queries and metrics based on your data structure'
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
            
            <ScrollArea className="h-[calc(100vh-520px)]" ref={scrollRef}>
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
                    <span className="mr-3">{String(currentLogIndex + 1).padStart(2, '0')}</span>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      ) : (
        // Main Review Interface
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
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
                      {completedItems.size}/{items.length} items reviewed
                    </span>
                  </div>
                  {completedItems.size === items.length && (
                    <Badge variant="outline" className="bg-[#E8F5E9] text-[#4CAF50] border-[#4CAF50]">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ready to continue
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={completedItems.size < items.length}
                  className="bg-[#00B5B3] hover:bg-[#00A5A3] text-white disabled:bg-[#CCCCCC] disabled:text-[#999999] disabled:cursor-not-allowed"
                >
                  Continue
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Editor Dialog */}
      <Dialog open={codeEditorOpen} onOpenChange={setCodeEditorOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit SQL Code</DialogTitle>
            <DialogDescription>
              Update the SQL query to match the correct implementation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Correct SQL Code</Label>
              <Textarea
                value={correctCode}
                onChange={(e) => setCorrectCode(e.target.value)}
                placeholder="Enter the correct SQL query..."
                className="font-mono text-sm min-h-[200px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCodeEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCodeSubmit} className="bg-[#00B5B3] hover:bg-[#00A5A3]">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
      `}</style>
    </WizardLayout>
  );
}