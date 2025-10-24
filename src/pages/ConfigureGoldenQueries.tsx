import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Sparkles,
  Plus,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Save,
  AlertCircle,
  Send,
  Edit3,
  Link2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface GoldenQuery {
  id: string;
  question: string;
  answer: string;
  sqlQuery: string;
  involvedAgents: string[];
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  conversation: { role: 'ai' | 'user'; message: string; timestamp: Date }[];
  isAiGenerated: boolean;
}

interface GoldenMetric {
  id: string;
  name: string;
  description: string;
  sqlQuery: string;
  involvedAgents: string[];
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  conversation: { role: 'ai' | 'user'; message: string; timestamp: Date }[];
  isAiGenerated: boolean;
}

const AI_PROPOSED_QUERIES: GoldenQuery[] = [
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
    involvedAgents: ['Sales Analytics'],
    status: 'pending',
    conversation: [],
    isAiGenerated: true,
  },
  {
    id: '2',
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
    involvedAgents: ['Sales Analytics', 'Customer Insights'],
    status: 'pending',
    conversation: [],
    isAiGenerated: true,
  },
  {
    id: '3',
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
    involvedAgents: ['Sales Analytics', 'Inventory Management'],
    status: 'pending',
    conversation: [],
    isAiGenerated: true,
  },
  {
    id: '4',
    question: 'What is our average order fulfillment time?',
    answer: 'Average fulfillment time is 2.3 days from order placement to delivery.',
    sqlQuery: `SELECT 
  AVG(EXTRACT(EPOCH FROM (shipped_at - created_at))/86400) as avg_days
FROM orders
WHERE shipped_at IS NOT NULL`,
    involvedAgents: ['Sales Analytics'],
    status: 'pending',
    conversation: [],
    isAiGenerated: true,
  },
];

const AI_PROPOSED_METRICS: GoldenMetric[] = [
  {
    id: '1',
    name: 'Total Revenue (MTD)',
    description: 'Month-to-date total revenue from all orders',
    sqlQuery: `SELECT SUM(total_amount) as total_revenue
FROM orders
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
    involvedAgents: ['Sales Analytics'],
    status: 'pending',
    conversation: [],
    isAiGenerated: true,
  },
  {
    id: '2',
    name: 'Average Order Value',
    description: 'Average revenue per order over the last 30 days',
    sqlQuery: `SELECT AVG(total_amount) as avg_order_value
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`,
    involvedAgents: ['Sales Analytics'],
    status: 'pending',
    conversation: [],
    isAiGenerated: true,
  },
  {
    id: '3',
    name: 'Customer Retention Rate',
    description: 'Percentage of customers who made repeat purchases',
    sqlQuery: `SELECT 
  COUNT(DISTINCT customer_id) as active_customers
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`,
    involvedAgents: ['Sales Analytics', 'Customer Insights'],
    status: 'pending',
    conversation: [],
    isAiGenerated: true,
  },
  {
    id: '4',
    name: 'Inventory Turnover Rate',
    description: 'How quickly inventory is sold and replaced',
    sqlQuery: `SELECT 
  SUM(quantity_sold) / AVG(quantity_available) as turnover_rate
FROM inventory`,
    involvedAgents: ['Sales Analytics', 'Inventory Management'],
    status: 'pending',
    conversation: [],
    isAiGenerated: true,
  },
];

export function ConfigureGoldenQueries() {
  const navigate = useNavigate();
  const { agentId } = useParams();
  const [queries, setQueries] = useState<GoldenQuery[]>(AI_PROPOSED_QUERIES);
  const [metrics, setMetrics] = useState<GoldenMetric[]>(AI_PROPOSED_METRICS);
  const [showAddQueryDialog, setShowAddQueryDialog] = useState(false);
  const [showAddMetricDialog, setShowAddMetricDialog] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState('');
  const [selectedQueryForRevision, setSelectedQueryForRevision] = useState<string | null>(null);
  const [selectedMetricForRevision, setSelectedMetricForRevision] = useState<string | null>(null);

  const [newQuestion, setNewQuestion] = useState('');
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricDesc, setNewMetricDesc] = useState('');

  const approvedQueriesCount = queries.filter((q) => q.status === 'approved').length;
  const approvedMetricsCount = metrics.filter((m) => m.status === 'approved').length;
  const hasApprovedAny = approvedQueriesCount > 0 || approvedMetricsCount > 0;

  const pendingQueries = queries.filter((q) => q.status === 'pending' || q.status === 'needs_revision');
  const approvedQueries = queries.filter((q) => q.status === 'approved');
  const pendingMetrics = metrics.filter((m) => m.status === 'pending' || m.status === 'needs_revision');
  const approvedMetrics = metrics.filter((m) => m.status === 'approved');

  const handleRequestQueryRevision = (id: string) => {
    if (!revisionMessage.trim()) {
      toast.error('Please provide feedback for revision');
      return;
    }

    setQueries((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: 'needs_revision' as const,
              conversation: [
                ...q.conversation,
                {
                  role: 'user' as const,
                  message: revisionMessage,
                  timestamp: new Date(),
                },
                {
                  role: 'ai' as const,
                  message: 'I understand. I\'ll revise the query and answer based on your feedback.',
                  timestamp: new Date(),
                },
              ],
            }
          : q
      )
    );

    setRevisionMessage('');
    setSelectedQueryForRevision(null);
    toast.success('Revision request sent');
  };

  const handleRequestMetricRevision = (id: string) => {
    if (!revisionMessage.trim()) {
      toast.error('Please provide feedback for revision');
      return;
    }

    setMetrics((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: 'needs_revision' as const,
              conversation: [
                ...m.conversation,
                {
                  role: 'user' as const,
                  message: revisionMessage,
                  timestamp: new Date(),
                },
                {
                  role: 'ai' as const,
                  message: 'I understand. I\'ll adjust the metric definition and query.',
                  timestamp: new Date(),
                },
              ],
            }
          : m
      )
    );

    setRevisionMessage('');
    setSelectedMetricForRevision(null);
    toast.success('Revision request sent');
  };

  const handleFinish = () => {
    if (!hasApprovedAny) {
      toast.error('Please approve at least one query or metric');
      return;
    }
    toast.success('Agent setup complete!');
    navigate(`/agents/${agentId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-[#FAFBFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(`/configure-relationships/${agentId}`)}
            className="flex items-center gap-2 text-[#666666] hover:text-[#333333] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Relationships</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#666666]">
              {approvedQueriesCount} queries, {approvedMetricsCount} metrics
            </span>
            <Button
              variant="outline"
              onClick={() => navigate(`/agents/${agentId}`)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              className="bg-[#00B5B3] hover:bg-[#009996]"
              onClick={handleFinish}
              disabled={!hasApprovedAny}
            >
              Finish Setup
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[#00B5B3]" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-[#333333] mb-1">Define Golden Queries & Metrics</h1>
            <p className="text-sm text-[#666666]">
              Pre-validated queries and metrics that showcase your agent's capabilities and help users get started quickly
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-8 max-w-6xl mx-auto space-y-8 pb-12">
          {/* Golden Queries Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#00B5B3]" />
                <h3 className="text-sm font-semibold text-[#333333]">
                  Golden Queries ({approvedQueriesCount}/{queries.length} approved)
                </h3>
              </div>
              <Dialog open={showAddQueryDialog} onOpenChange={setShowAddQueryDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-3 h-3 mr-2" />
                    Add Query
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Golden Query</DialogTitle>
                    <DialogDescription>
                      Add a question that showcases your agent's capabilities
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-xs font-medium text-[#666666] mb-2">Question</Label>
                      <Textarea
                        placeholder="What were our total sales last month?"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-[#999999] mt-1">
                        AI will automatically generate the SQL query and answer
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddQueryDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#00B5B3] hover:bg-[#009996]"
                      onClick={() => {
                        if (!newQuestion.trim()) {
                          toast.error('Please enter a question');
                          return;
                        }
                        const newQuery: GoldenQuery = {
                          id: `manual-${Date.now()}`,
                          question: newQuestion,
                          answer: 'AI will generate answer based on your data...',
                          sqlQuery: '-- SQL will be generated automatically',
                          involvedAgents: ['Sales Analytics'],
                          status: 'approved',
                          conversation: [],
                          isAiGenerated: false,
                        };
                        setQueries((prev) => [...prev, newQuery]);
                        setShowAddQueryDialog(false);
                        setNewQuestion('');
                        toast.success('Query added - AI will generate SQL and answer');
                      }}
                    >
                      Add Query
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Pending Queries - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-4">
              {pendingQueries.map((query) => (
                <Card key={query.id} className={`p-4 flex flex-col ${
                  query.status === 'needs_revision' 
                    ? 'border-2 border-[#F79009]' 
                    : 'border border-[#EEEEEE]'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          AI Generated
                        </Badge>
                        {query.status === 'needs_revision' && (
                          <Badge className="bg-[#F79009] text-white text-xs">
                            Needs Revision
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-[#333333] mb-2">{query.question}</h4>
                    </div>
                  </div>

                  {/* Involved Agents */}
                  <div className="mb-3 flex items-center gap-1.5 flex-wrap">
                    <Link2 className="w-3.5 h-3.5 text-[#666666]" />
                    {query.involvedAgents.map((agent, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {agent}
                      </Badge>
                    ))}
                  </div>

                  <div className="bg-[#F8F9FA] rounded p-3 mb-3 border border-[#EEEEEE]">
                    <p className="text-xs text-[#333333] line-clamp-3">{query.answer}</p>
                  </div>

                  <details className="text-xs mb-3">
                    <summary className="cursor-pointer text-[#666666] hover:text-[#00B5B3] mb-2 font-medium">
                      View SQL Query
                    </summary>
                    <pre className="bg-[#F8F9FA] p-3 rounded font-mono text-[10px] text-[#333333] overflow-x-auto border border-[#EEEEEE]">
                      {query.sqlQuery}
                    </pre>
                  </details>

                  {/* Conversation */}
                  {query.conversation.length > 0 && (
                    <div className="mb-3 p-3 bg-[#FFF9F0] rounded border border-[#F79009]">
                      <p className="text-xs font-medium text-[#333333] mb-2">Revision History:</p>
                      <div className="space-y-2">
                        {query.conversation.slice(-2).map((msg, idx) => (
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
                  {selectedQueryForRevision === query.id && (
                    <div className="mb-3 p-3 bg-white rounded border-2 border-[#00B5B3]">
                      <Label className="text-xs font-medium text-[#666666] mb-2">Request Revision</Label>
                      <Textarea
                        placeholder="Explain what needs to be changed..."
                        value={revisionMessage}
                        onChange={(e) => setRevisionMessage(e.target.value)}
                        className="text-xs mb-2 min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#00B5B3] hover:bg-[#009996]"
                          onClick={() => handleRequestQueryRevision(query.id)}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQueryForRevision(null);
                            setRevisionMessage('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#EEEEEE]">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-[#F79009] border-[#F79009] text-xs"
                      onClick={() => setSelectedQueryForRevision(query.id)}
                      disabled={selectedQueryForRevision === query.id}
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Revise
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-[#00B98E] hover:bg-[#00A87E] text-white text-xs"
                      onClick={() =>
                        setQueries((prev) =>
                          prev.map((q) => (q.id === query.id ? { ...q, status: 'approved' as const } : q))
                        )
                      }
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Approved Queries */}
            {approvedQueries.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#00B98E]" />
                  <p className="text-xs font-medium text-[#666666]">Approved ({approvedQueries.length})</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {approvedQueries.map((query) => (
                    <Card key={query.id} className="p-3 border border-[#00B98E] bg-[#F0FFF9]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-[#333333] mb-2">{query.question}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {query.involvedAgents.map((agent, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setQueries((prev) =>
                              prev.map((q) => (q.id === query.id ? { ...q, status: 'pending' as const } : q))
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
          </div>

          {/* Golden Metrics Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00B5B3]" />
                <h3 className="text-sm font-semibold text-[#333333]">
                  Golden Metrics ({approvedMetricsCount}/{metrics.length} approved)
                </h3>
              </div>
              <Dialog open={showAddMetricDialog} onOpenChange={setShowAddMetricDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-3 h-3 mr-2" />
                    Add Metric
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Golden Metric</DialogTitle>
                    <DialogDescription>
                      Define a key metric that your agent will track
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-xs font-medium text-[#666666] mb-2">Metric Name</Label>
                      <Input
                        placeholder="Total Revenue (MTD)"
                        value={newMetricName}
                        onChange={(e) => setNewMetricName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-[#666666] mb-2">Description</Label>
                      <Textarea
                        placeholder="Month-to-date total revenue from all orders"
                        value={newMetricDesc}
                        onChange={(e) => setNewMetricDesc(e.target.value)}
                      />
                      <p className="text-xs text-[#999999] mt-1">
                        AI will automatically generate the SQL query
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddMetricDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#00B5B3] hover:bg-[#009996]"
                      onClick={() => {
                        if (!newMetricName.trim() || !newMetricDesc.trim()) {
                          toast.error('Please fill in all fields');
                          return;
                        }
                        const newMetric: GoldenMetric = {
                          id: `manual-${Date.now()}`,
                          name: newMetricName,
                          description: newMetricDesc,
                          sqlQuery: '-- SQL will be generated automatically',
                          involvedAgents: ['Sales Analytics'],
                          status: 'approved',
                          conversation: [],
                          isAiGenerated: false,
                        };
                        setMetrics((prev) => [...prev, newMetric]);
                        setShowAddMetricDialog(false);
                        setNewMetricName('');
                        setNewMetricDesc('');
                        toast.success('Metric added - AI will generate SQL');
                      }}
                    >
                      Add Metric
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Pending Metrics - 2 Column Grid */}
            <div className="grid grid-cols-2 gap-4">
              {pendingMetrics.map((metric) => (
                <Card key={metric.id} className={`p-4 flex flex-col ${
                  metric.status === 'needs_revision' 
                    ? 'border-2 border-[#F79009]' 
                    : 'border border-[#EEEEEE]'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          AI Generated
                        </Badge>
                        {metric.status === 'needs_revision' && (
                          <Badge className="bg-[#F79009] text-white text-xs">
                            Needs Revision
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-[#333333] mb-1">{metric.name}</h4>
                      <p className="text-xs text-[#666666] mb-2">{metric.description}</p>
                    </div>
                  </div>

                  {/* Involved Agents */}
                  <div className="mb-3 flex items-center gap-1.5 flex-wrap">
                    <Link2 className="w-3.5 h-3.5 text-[#666666]" />
                    {metric.involvedAgents.map((agent, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {agent}
                      </Badge>
                    ))}
                  </div>

                  <details className="text-xs mb-3">
                    <summary className="cursor-pointer text-[#666666] hover:text-[#00B5B3] mb-2 font-medium">
                      View SQL Query
                    </summary>
                    <pre className="bg-[#F8F9FA] p-3 rounded font-mono text-[10px] text-[#333333] overflow-x-auto border border-[#EEEEEE]">
                      {metric.sqlQuery}
                    </pre>
                  </details>

                  {/* Conversation */}
                  {metric.conversation.length > 0 && (
                    <div className="mb-3 p-3 bg-[#FFF9F0] rounded border border-[#F79009]">
                      <p className="text-xs font-medium text-[#333333] mb-2">Revision History:</p>
                      <div className="space-y-2">
                        {metric.conversation.slice(-2).map((msg, idx) => (
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
                  {selectedMetricForRevision === metric.id && (
                    <div className="mb-3 p-3 bg-white rounded border-2 border-[#00B5B3]">
                      <Label className="text-xs font-medium text-[#666666] mb-2">Request Revision</Label>
                      <Textarea
                        placeholder="Explain what needs to be changed..."
                        value={revisionMessage}
                        onChange={(e) => setRevisionMessage(e.target.value)}
                        className="text-xs mb-2 min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#00B5B3] hover:bg-[#009996]"
                          onClick={() => handleRequestMetricRevision(metric.id)}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMetricForRevision(null);
                            setRevisionMessage('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#EEEEEE]">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-[#F79009] border-[#F79009] text-xs"
                      onClick={() => setSelectedMetricForRevision(metric.id)}
                      disabled={selectedMetricForRevision === metric.id}
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Revise
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-[#00B98E] hover:bg-[#00A87E] text-white text-xs"
                      onClick={() =>
                        setMetrics((prev) =>
                          prev.map((m) => (m.id === metric.id ? { ...m, status: 'approved' as const } : m))
                        )
                      }
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Approved Metrics */}
            {approvedMetrics.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#00B98E]" />
                  <p className="text-xs font-medium text-[#666666]">Approved ({approvedMetrics.length})</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {approvedMetrics.map((metric) => (
                    <Card key={metric.id} className="p-3 border border-[#00B98E] bg-[#F0FFF9]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#333333] mb-1">{metric.name}</p>
                          <p className="text-xs text-[#666666] mb-2">{metric.description}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {metric.involvedAgents.map((agent, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {agent}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setMetrics((prev) =>
                              prev.map((m) => (m.id === metric.id ? { ...m, status: 'pending' as const } : m))
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
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
