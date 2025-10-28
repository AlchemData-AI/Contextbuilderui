import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Textarea } from '../../components/ui/textarea';
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
  Sparkles,
  Plus,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Edit,
  ChevronRight,
  PlayCircle,
  Code,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SqlWorkbench } from '../../components/SqlWorkbench';

interface GoldenQuery {
  id: string;
  question: string;
  answer: string;
  sqlQuery: string;
  status: 'pending' | 'approved' | 'rejected';
  isAiGenerated: boolean;
}

interface GoldenMetric {
  id: string;
  name: string;
  description: string;
  sqlQuery: string;
  status: 'pending' | 'approved' | 'rejected';
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
    status: 'pending',
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
    status: 'pending',
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
    status: 'pending',
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
    status: 'pending',
    isAiGenerated: true,
  },
  {
    id: '2',
    name: 'Average Order Value',
    description: 'Average revenue per order over the last 30 days',
    sqlQuery: `SELECT AVG(total_amount) as avg_order_value
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`,
    status: 'pending',
    isAiGenerated: true,
  },
  {
    id: '3',
    name: 'Active Customers',
    description: 'Number of customers who placed at least one order in the last 30 days',
    sqlQuery: `SELECT COUNT(DISTINCT customer_id) as active_customers
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`,
    status: 'pending',
    isAiGenerated: true,
  },
];

export function Step8GoldenQueries() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState<GoldenQuery[]>(AI_PROPOSED_QUERIES);
  const [metrics, setMetrics] = useState<GoldenMetric[]>(AI_PROPOSED_METRICS);
  const [showAddQueryDialog, setShowAddQueryDialog] = useState(false);
  const [showAddMetricDialog, setShowAddMetricDialog] = useState(false);

  // Manual add states
  const [newQuestion, setNewQuestion] = useState('');
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricDesc, setNewMetricDesc] = useState('');

  // SQL Workbench state
  const [sqlWorkbenchOpen, setSqlWorkbenchOpen] = useState(false);
  const [sqlWorkbenchContent, setSqlWorkbenchContent] = useState('');
  const [sqlWorkbenchTitle, setSqlWorkbenchTitle] = useState('SQL Workbench');
  const [sqlWorkbenchCallback, setSqlWorkbenchCallback] = useState<((sql: string) => void) | null>(null);

  const approvedQueriesCount = queries.filter((q) => q.status === 'approved').length;
  const approvedMetricsCount = metrics.filter((m) => m.status === 'approved').length;
  const hasApprovedAny = approvedQueriesCount > 0 || approvedMetricsCount > 0;

  // SQL Workbench handlers
  const openSqlWorkbench = (sql: string, title: string, onSave: (sql: string) => void) => {
    setSqlWorkbenchContent(sql);
    setSqlWorkbenchTitle(title);
    setSqlWorkbenchCallback(() => onSave);
    setSqlWorkbenchOpen(true);
  };

  const handleSqlWorkbenchSave = (sql: string) => {
    if (sqlWorkbenchCallback) {
      sqlWorkbenchCallback(sql);
    }
  };

  const handleApproveQuery = (id: string) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'approved' as const } : q))
    );
    toast.success('Query approved');
  };

  const handleRejectQuery = (id: string) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'rejected' as const } : q))
    );
  };

  const handleApproveMetric = (id: string) => {
    setMetrics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'approved' as const } : m))
    );
    toast.success('Metric approved');
  };

  const handleRejectMetric = (id: string) => {
    setMetrics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'rejected' as const } : m))
    );
  };

  const handleAddQuery = () => {
    if (!newQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const newQuery: GoldenQuery = {
      id: `manual-${Date.now()}`,
      question: newQuestion,
      answer: 'AI will generate answer based on your data...',
      sqlQuery: '-- SQL will be generated automatically',
      status: 'approved',
      isAiGenerated: false,
    };

    setQueries((prev) => [...prev, newQuery]);
    setShowAddQueryDialog(false);
    setNewQuestion('');
    toast.success('Query added - AI will generate SQL and answer');
  };

  const handleAddMetric = () => {
    if (!newMetricName.trim() || !newMetricDesc.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const newMetric: GoldenMetric = {
      id: `manual-${Date.now()}`,
      name: newMetricName,
      description: newMetricDesc,
      sqlQuery: '-- SQL will be generated automatically',
      status: 'approved',
      isAiGenerated: false,
    };

    setMetrics((prev) => [...prev, newMetric]);
    setShowAddMetricDialog(false);
    setNewMetricName('');
    setNewMetricDesc('');
    toast.success('Metric added - AI will generate SQL');
  };

  const handleFinish = () => {
    if (!hasApprovedAny) {
      toast.error('Please approve at least one query or metric');
      return;
    }
    toast.success('Agent setup complete!');
    navigate('/agents/sales-analytics-agent');
  };

  const pendingQueries = queries.filter((q) => q.status === 'pending');
  const approvedQueries = queries.filter((q) => q.status === 'approved');
  const pendingMetrics = metrics.filter((m) => m.status === 'pending');
  const approvedMetrics = metrics.filter((m) => m.status === 'approved');

  return (
    <WizardLayout
      currentStep={8}
      totalSteps={8}
      title="Define Golden Queries & Metrics"
      onBack={() => navigate('/wizard/configure-relationships')}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00B5B3] to-[#00B5B3]/80 px-6 py-5 border-b-2 border-[#00B5B3]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">Golden Queries & Metrics</h2>
              <p className="text-sm text-white/90 mb-3">
                These pre-validated queries and metrics showcase your agent's capabilities and help users get started quickly.
              </p>
              <div className="flex items-center gap-4 text-sm text-white/90">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  {approvedQueriesCount} queries
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  {approvedMetricsCount} metrics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Golden Queries Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#00B5B3]" />
                  <h3 className="text-sm font-semibold text-[#333333]">Golden Queries</h3>
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
                      <Button className="bg-[#00B5B3] hover:bg-[#009996]" onClick={handleAddQuery}>
                        Add Query
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Pending Queries */}
              {pendingQueries.length > 0 && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00B5B3]" />
                    <p className="text-xs font-medium text-[#666666]">AI Suggested</p>
                  </div>
                  {pendingQueries.map((query) => (
                    <Card key={query.id} className="p-4 border border-[#EEEEEE]">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-semibold text-[#333333] flex-1">{query.question}</h4>
                        <Badge variant="outline" className="text-[10px]">AI Generated</Badge>
                      </div>

                      <div className="bg-[#F8F9FA] rounded p-3 mb-3 border border-[#EEEEEE]">
                        <p className="text-xs text-[#333333]">{query.answer}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="mb-3 text-xs h-7"
                        onClick={() =>
                          openSqlWorkbench(query.sqlQuery, `SQL: ${query.question}`, (updatedSql) => {
                            setQueries((prev) =>
                              prev.map((q) => (q.id === query.id ? { ...q, sqlQuery: updatedSql } : q))
                            );
                          })
                        }
                      >
                        <Code className="w-3 h-3 mr-1" />
                        View & Edit SQL
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-[#00B98E] hover:bg-[#00A87E] text-white"
                          onClick={() => handleApproveQuery(query.id)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#F04438] border-[#F04438]"
                          onClick={() => handleRejectQuery(query.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Approved Queries */}
              {approvedQueries.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00B98E]" />
                    <p className="text-xs font-medium text-[#666666]">Approved ({approvedQueries.length})</p>
                  </div>
                  {approvedQueries.map((query) => (
                    <Card key={query.id} className="p-3 border border-[#00B98E] bg-[#F0FFF9]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-[#333333] flex-1">{query.question}</p>
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 w-full"
                        onClick={() =>
                          openSqlWorkbench(query.sqlQuery, `SQL: ${query.question}`, (updatedSql) => {
                            setQueries((prev) =>
                              prev.map((q) => (q.id === query.id ? { ...q, sqlQuery: updatedSql } : q))
                            );
                          })
                        }
                      >
                        <Code className="w-3 h-3 mr-1" />
                        View SQL
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Golden Metrics Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00B5B3]" />
                  <h3 className="text-sm font-semibold text-[#333333]">Golden Metrics</h3>
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
                      <Button className="bg-[#00B5B3] hover:bg-[#009996]" onClick={handleAddMetric}>
                        Add Metric
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Pending Metrics */}
              {pendingMetrics.length > 0 && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00B5B3]" />
                    <p className="text-xs font-medium text-[#666666]">AI Suggested</p>
                  </div>
                  {pendingMetrics.map((metric) => (
                    <Card key={metric.id} className="p-4 border border-[#EEEEEE]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-[#333333] mb-1">{metric.name}</h4>
                          <p className="text-xs text-[#666666] mb-3">{metric.description}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">AI Generated</Badge>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="mb-3 text-xs h-7"
                        onClick={() =>
                          openSqlWorkbench(metric.sqlQuery, `SQL: ${metric.name}`, (updatedSql) => {
                            setMetrics((prev) =>
                              prev.map((m) => (m.id === metric.id ? { ...m, sqlQuery: updatedSql } : m))
                            );
                          })
                        }
                      >
                        <Code className="w-3 h-3 mr-1" />
                        View & Edit SQL
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-[#00B98E] hover:bg-[#00A87E] text-white"
                          onClick={() => handleApproveMetric(metric.id)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[#F04438] border-[#F04438]"
                          onClick={() => handleRejectMetric(metric.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Approved Metrics */}
              {approvedMetrics.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00B98E]" />
                    <p className="text-xs font-medium text-[#666666]">Approved ({approvedMetrics.length})</p>
                  </div>
                  {approvedMetrics.map((metric) => (
                    <Card key={metric.id} className="p-3 border border-[#00B98E] bg-[#F0FFF9]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#333333]">{metric.name}</p>
                          <p className="text-xs text-[#666666]">{metric.description}</p>
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
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-[#EEEEEE] bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#666666]">
              {hasApprovedAny ? (
                <span className="text-[#00B98E] font-medium">
                  {approvedQueriesCount} queries and {approvedMetricsCount} metrics approved
                </span>
              ) : (
                'Approve at least one query or metric to finish'
              )}
            </p>
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
      </div>
    </WizardLayout>
  );
}
