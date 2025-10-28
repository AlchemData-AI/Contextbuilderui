import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  MessageSquare, 
  TrendingUp, 
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Send,
  Code
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SqlWorkbench } from '../../components/SqlWorkbench';

interface SampleQuery {
  id: string;
  question: string;
  aiAnswer: string;
  sqlQuery: string;
  status: 'pending' | 'approved' | 'needs_revision';
  conversation: { role: 'ai' | 'user'; message: string; timestamp: Date }[];
}

interface Metric {
  id: string;
  name: string;
  description: string;
  sqlQuery: string;
  currentValue: string;
  timeWindow: '7d' | '30d' | '90d' | 'ytd' | 'all';
  status: 'pending' | 'approved' | 'needs_revision';
  conversation: { role: 'ai' | 'user'; message: string; timestamp: Date }[];
}

const MOCK_SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: 'q1',
    question: 'What were our total sales last month?',
    aiAnswer: 'Total sales for last month were $2.4M, which represents a 12% increase compared to the previous month.',
    sqlQuery: `SELECT 
  SUM(total_amount) as total_sales,
  COUNT(*) as order_count
FROM orders
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND created_at < DATE_TRUNC('month', CURRENT_DATE)`,
    status: 'pending',
    conversation: [],
  },
  {
    id: 'q2',
    question: 'Which products are currently low in stock?',
    aiAnswer: 'There are 8 products with stock levels below the reorder threshold. The most critical are: Wireless Mouse (5 units), USB-C Cable (12 units), and Phone Case (8 units).',
    sqlQuery: `SELECT 
  p.name,
  i.quantity_available,
  i.reorder_threshold
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.quantity_available < i.reorder_threshold
ORDER BY (i.reorder_threshold - i.quantity_available) DESC`,
    status: 'pending',
    conversation: [],
  },
  {
    id: 'q3',
    question: 'Who are our top 10 customers by revenue?',
    aiAnswer: 'The top 10 customers account for $850K in total revenue. Leading customer is TechCorp Inc. with $145K in lifetime value.',
    sqlQuery: `SELECT 
  c.name,
  c.email,
  SUM(o.total_amount) as lifetime_value,
  COUNT(o.id) as order_count
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
ORDER BY lifetime_value DESC
LIMIT 10`,
    status: 'pending',
    conversation: [],
  },
];

const MOCK_METRICS: Metric[] = [
  {
    id: 'm1',
    name: 'Total Revenue',
    description: 'Sum of all completed orders',
    sqlQuery: 'SELECT SUM(total_amount) FROM orders WHERE status = \'completed\'',
    currentValue: '$2,450,000',
    timeWindow: '30d',
    status: 'pending',
    conversation: [],
  },
  {
    id: 'm2',
    name: 'Average Order Value',
    description: 'Mean revenue per order',
    sqlQuery: 'SELECT AVG(total_amount) FROM orders WHERE status = \'completed\'',
    currentValue: '$127.50',
    timeWindow: '30d',
    status: 'pending',
    conversation: [],
  },
  {
    id: 'm3',
    name: 'Active Customers',
    description: 'Unique customers with orders in selected period',
    sqlQuery: 'SELECT COUNT(DISTINCT customer_id) FROM orders WHERE created_at > CURRENT_DATE - INTERVAL \'30 days\'',
    currentValue: '4,234',
    timeWindow: '30d',
    status: 'pending',
    conversation: [],
  },
  {
    id: 'm4',
    name: 'Inventory Turnover Rate',
    description: 'Rate at which inventory is sold and replaced',
    sqlQuery: 'SELECT (SUM(quantity_sold) / AVG(quantity_available)) FROM inventory',
    currentValue: '6.2x',
    timeWindow: '90d',
    status: 'pending',
    conversation: [],
  },
];

export function Step5SampleQueriesMetrics() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState<SampleQuery[]>(MOCK_SAMPLE_QUERIES);
  const [metrics, setMetrics] = useState<Metric[]>(MOCK_METRICS);
  const [activeChat, setActiveChat] = useState<{ type: 'query' | 'metric'; id: string } | null>(null);
  const [chatInput, setChatInput] = useState('');

  const handleQuickApprove = (type: 'query' | 'metric', id: string) => {
    if (type === 'query') {
      setQueries(queries.map((q) =>
        q.id === id ? { ...q, status: 'approved' } : q
      ));
    } else {
      setMetrics(metrics.map((m) =>
        m.id === id ? { ...m, status: 'approved' } : m
      ));
    }
    toast.success('Approved');
  };

  const handleOpenChat = (type: 'query' | 'metric', id: string) => {
    setActiveChat({ type, id });
    setChatInput('');
  };

  const handleSendMessage = (message?: string) => {
    if (!activeChat) return;
    const msg = message || chatInput;
    if (!msg.trim()) return;

    const newConversation = { role: 'user' as const, message: msg, timestamp: new Date() };

    if (activeChat.type === 'query') {
      setQueries(queries.map((q) =>
        q.id === activeChat.id
          ? {
              ...q,
              conversation: [...q.conversation, newConversation],
              status: 'needs_revision',
            }
          : q
      ));
    } else {
      setMetrics(metrics.map((m) =>
        m.id === activeChat.id
          ? {
              ...m,
              conversation: [...m.conversation, newConversation],
              status: 'needs_revision',
            }
          : m
      ));
    }

    setChatInput('');
    toast.success('Feedback submitted');
  };

  const handleMetricTimeWindowChange = (metricId: string, timeWindow: Metric['timeWindow']) => {
    setMetrics(metrics.map((m) =>
      m.id === metricId ? { ...m, timeWindow } : m
    ));
  };

  const handleContinue = () => {
    const pendingQueries = queries.filter((q) => q.status === 'pending').length;
    const pendingMetrics = metrics.filter((m) => m.status === 'pending').length;
    
    if (pendingQueries > 0 || pendingMetrics > 0) {
      toast.error(`Please review all items (${pendingQueries + pendingMetrics} remaining)`);
      return;
    }

    localStorage.setItem('wizardData', JSON.stringify({ 
      ...JSON.parse(localStorage.getItem('wizardData') || '{}'),
      sampleQueries: queries,
      metrics 
    }));
    toast.success('Queries and metrics validated');
    navigate('/agents/create/step-6');
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'needs_revision') => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-[#00B98E] text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'needs_revision':
        return <Badge variant="outline" className="border-[#F79009] text-[#F79009]"><AlertCircle className="w-3 h-3 mr-1" />In Review</Badge>;
      default:
        return <Badge variant="outline" className="text-[#999999]">Pending Review</Badge>;
    }
  };

  const renderCodeOrText = (text: string) => {
    const sqlPattern = /\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i;
    const columnPattern = /\w+\.\w+/;
    
    if (sqlPattern.test(text) || columnPattern.test(text)) {
      return (
        <pre className="bg-[#F8F9FA] border border-[#EEEEEE] rounded p-2 font-mono text-[10px] text-[#333333] overflow-x-auto whitespace-pre-wrap">
          {text}
        </pre>
      );
    }
    
    return <p className="text-xs text-[#333333]">{text}</p>;
  };

  const activeItem = activeChat
    ? activeChat.type === 'query'
      ? queries.find((q) => q.id === activeChat.id)
      : metrics.find((m) => m.id === activeChat.id)
    : null;

  const queriesApproved = queries.filter((q) => q.status === 'approved').length;
  const metricsApproved = metrics.filter((m) => m.status === 'approved').length;

  return (
    <WizardLayout
      currentStep={5}
      totalSteps={6}
      title="Sample Queries & Metrics"
      onBack={() => navigate('/agents/create/step-4')}
      onSaveDraft={() => {
        localStorage.setItem('wizardDraft', JSON.stringify({ step: 5, queries, metrics }));
        toast.success('Draft saved');
      }}
    >
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Main Content - Single Scroll */}
        <div className="flex-1">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 max-w-5xl">
              {/* Sample Queries Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-[#00B5B3]" />
                  <h3 className="text-sm font-semibold text-[#333333]">
                    Sample Queries ({queriesApproved}/{queries.length} approved)
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {queries.map((query, index) => (
                    <Card key={query.id} className="p-4 border border-[#EEEEEE] flex flex-col">
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-[10px] h-5">Q{index + 1}</Badge>
                              {getStatusBadge(query.status)}
                            </div>
                            <h4 className="text-xs font-semibold text-[#333333] mb-2">{query.question}</h4>
                          </div>
                        </div>

                        <div className="bg-[#F8F9FA] rounded p-3 mb-2 border border-[#EEEEEE] flex-1">
                          <p className="text-xs text-[#333333] line-clamp-3">{query.aiAnswer}</p>
                        </div>

                        <details className="text-xs mb-3">
                          <summary className="cursor-pointer text-[#666666] hover:text-[#00B5B3] mb-1 font-medium">
                            View SQL
                          </summary>
                          <pre className="bg-[#F8F9FA] p-2 rounded font-mono text-[10px] text-[#333333] overflow-x-auto border border-[#EEEEEE]">
                            {query.sqlQuery}
                          </pre>
                        </details>

                        {query.conversation.length > 0 && (
                          <div className="bg-[#FFF8E6] border border-[#F79009] rounded p-2 mb-3">
                            <p className="text-[10px] font-semibold text-[#F79009] mb-1">Feedback:</p>
                            <p className="text-xs text-[#333333] line-clamp-2">{query.conversation[query.conversation.length - 1].message}</p>
                          </div>
                        )}

                        {query.status === 'pending' && (
                          <div className="flex gap-2 mt-auto pt-2 border-t border-[#EEEEEE]">
                            <Button
                              size="sm"
                              onClick={() => handleQuickApprove('query', query.id)}
                              className="flex-1 bg-[#00B98E] hover:bg-[#00A87D] text-white text-xs h-8"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenChat('query', query.id)}
                              className="flex-1 text-xs h-8 text-[#F79009] border-[#F79009] hover:bg-[#FFF8E6]"
                            >
                              Revise
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Metrics Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-[#00B5B3]" />
                  <h3 className="text-sm font-semibold text-[#333333]">
                    Metrics ({metricsApproved}/{metrics.length} approved)
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {metrics.map((metric) => (
                    <Card key={metric.id} className="p-4 border border-[#EEEEEE] flex flex-col">
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(metric.status)}
                            </div>
                            <h4 className="text-xs font-semibold text-[#333333] mb-1">{metric.name}</h4>
                            <p className="text-xs text-[#666666]">{metric.description}</p>
                          </div>
                        </div>

                        <div className="bg-[#F0FFFE] border border-[#00B5B3] rounded-lg p-3 mb-2">
                          <div className="text-2xl font-semibold text-[#00B5B3] mb-2">
                            {metric.currentValue}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-[#666666]" />
                            <Select
                              value={metric.timeWindow}
                              onValueChange={(v) => handleMetricTimeWindowChange(metric.id, v as Metric['timeWindow'])}
                            >
                              <SelectTrigger className="h-7 w-28 text-[10px] border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="ytd">Year to date</SelectItem>
                                <SelectItem value="all">All time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <details className="text-xs mb-3">
                          <summary className="cursor-pointer text-[#666666] hover:text-[#00B5B3] mb-1 font-medium">
                            View SQL
                          </summary>
                          <pre className="bg-[#F8F9FA] p-2 rounded font-mono text-[10px] text-[#333333] overflow-x-auto border border-[#EEEEEE]">
                            {metric.sqlQuery}
                          </pre>
                        </details>

                        {metric.conversation.length > 0 && (
                          <div className="bg-[#FFF8E6] border border-[#F79009] rounded p-2 mb-3">
                            <p className="text-[10px] font-semibold text-[#F79009] mb-1">Feedback:</p>
                            <p className="text-xs text-[#333333] line-clamp-2">{metric.conversation[metric.conversation.length - 1].message}</p>
                          </div>
                        )}

                        {metric.status === 'pending' && (
                          <div className="flex gap-2 mt-auto pt-2 border-t border-[#EEEEEE]">
                            <Button
                              size="sm"
                              onClick={() => handleQuickApprove('metric', metric.id)}
                              className="flex-1 bg-[#00B98E] hover:bg-[#00A87D] text-white text-xs h-8"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenChat('metric', metric.id)}
                              className="flex-1 text-xs h-8 text-[#F79009] border-[#F79009] hover:bg-[#FFF8E6]"
                            >
                              Revise
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Chat Sidebar - Only when active */}
        {activeChat && activeItem && (
          <div className="w-[380px] flex flex-col bg-white rounded-lg border border-[#00B5B3] overflow-hidden shadow-lg">
            {/* Chat Header */}
            <div className="p-3 border-b border-[#EEEEEE] bg-[#F0FFFE]">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-xs font-semibold text-[#333333]">
                  {activeChat.type === 'query' ? (activeItem as SampleQuery).question : (activeItem as Metric).name}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveChat(null)}
                  className="h-5 w-5 p-0 text-lg"
                >
                  ×
                </Button>
              </div>
              <p className="text-[10px] text-[#666666]">Request changes or ask questions</p>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {activeChat.type === 'query' && (
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#00B5B3] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-white font-semibold">AI</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#F8F9FA] rounded p-2 border border-[#EEEEEE]">
                        <p className="text-xs text-[#333333]">{(activeItem as SampleQuery).aiAnswer}</p>
                      </div>
                    </div>
                  </div>
                )}

                {(activeItem as any).conversation.map((msg: any, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'ai' ? 'bg-[#00B5B3]' : 'bg-[#666666]'
                    }`}>
                      <span className="text-[10px] text-white font-semibold">
                        {msg.role === 'ai' ? 'AI' : 'You'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className={`rounded p-2 ${
                        msg.role === 'ai'
                          ? 'bg-[#F8F9FA] border border-[#EEEEEE]'
                          : 'bg-[#E0F7F7] border border-[#00B5B3]'
                      }`}>
                        {renderCodeOrText(msg.message)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-2 border-t border-[#EEEEEE] bg-[#FAFBFC]">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Describe what needs to change..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  className="resize-none border border-[#DDDDDD] focus:border-[#00B5B3] text-xs"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim()}
                  className="bg-[#00B5B3] hover:bg-[#009996] px-2"
                  size="sm"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleContinue}
          className="bg-[#00B5B3] hover:bg-[#009996]"
          disabled={queries.some((q) => q.status === 'pending') || metrics.some((m) => m.status === 'pending')}
        >
          Continue to Review & Publish
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </WizardLayout>
  );
}
