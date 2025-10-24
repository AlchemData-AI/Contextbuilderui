import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { CheckCircle2, Loader2, Info } from 'lucide-react';

interface AnalysisTask {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete';
  progress: number;
  logs: string[];
}

interface LogEntry {
  timestamp: Date;
  taskId: string;
  message: string;
  type: 'info' | 'success';
}

const INITIAL_TASKS: AnalysisTask[] = [
  { id: '1', label: 'Analyzing table schemas', status: 'pending', progress: 0, logs: [] },
  { id: '2', label: 'Detecting relationships between tables', status: 'pending', progress: 0, logs: [] },
  { id: '3', label: 'Identifying key metrics and aggregations', status: 'pending', progress: 0, logs: [] },
  { id: '4', label: 'Generating business questions', status: 'pending', progress: 0, logs: [] },
  { id: '5', label: 'Creating sample queries', status: 'pending', progress: 0, logs: [] },
];

const TASK_LOGS: Record<string, string[]> = {
  '1': [
    'Connecting to data warehouse...',
    'Found 6 tables in selected schemas',
    'Analyzing ecommerce.orders (1.25M rows, 12 columns)',
    'Analyzing ecommerce.order_items (3.8M rows, 8 columns)',
    'Analyzing ecommerce.customers (450K rows, 15 columns)',
    'Analyzing ecommerce.products (25K rows, 10 columns)',
    'Analyzing warehouse.inventory (85K rows, 7 columns)',
    'Analyzing logistics.shipments (920K rows, 9 columns)',
    'Schema analysis complete',
  ],
  '2': [
    'Detecting foreign key relationships...',
    'Found relationship: orders.customer_id → customers.id',
    'Found relationship: order_items.order_id → orders.id',
    'Found relationship: order_items.product_id → products.id',
    'Found relationship: inventory.product_id → products.id',
    'Found relationship: shipments.order_id → orders.id',
    'Analyzing cardinality and join patterns...',
    'Detected 5 primary relationships',
  ],
  '3': [
    'Identifying numeric columns for aggregations...',
    'Found metric: Total Revenue (SUM of orders.total_amount)',
    'Found metric: Average Order Value (AVG of orders.total_amount)',
    'Found metric: Active Customers (COUNT DISTINCT of orders.customer_id)',
    'Found metric: Inventory Turnover (calculated from inventory table)',
    'Analyzing temporal patterns...',
    'Detected time-series columns: created_at, updated_at, shipped_at',
  ],
  '4': [
    'Analyzing business context and user personas...',
    'Generating questions based on table relationships...',
    'Generated question: "What is the primary key of the orders table?"',
    'Generated question: "What date field should be used for time-based analysis?"',
    'Generated question: "How do we identify returning customers?"',
    'Validating question relevance...',
  ],
  '5': [
    'Creating sample queries from business questions...',
    'Generated query: "What were our total sales last month?"',
    'Generated query: "Which products are currently low in stock?"',
    'Generated query: "Who are our top 10 customers by revenue?"',
    'Validating SQL syntax...',
    'Sample queries created successfully',
  ],
};

export function Step3RunAnalysis() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<AnalysisTask[]>(INITIAL_TASKS);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  useEffect(() => {
    if (currentTaskIndex >= tasks.length) {
      // All tasks complete, navigate to next step after a brief delay
      setTimeout(() => {
        navigate('/agents/create/step-4');
      }, 1500);
      return;
    }

    const currentTask = tasks[currentTaskIndex];
    const taskLogs = TASK_LOGS[currentTask.id] || [];

    // Start the current task
    setTasks((prev) =>
      prev.map((task, idx) =>
        idx === currentTaskIndex ? { ...task, status: 'running' } : task
      )
    );

    // Add logs progressively
    if (currentLogIndex < taskLogs.length) {
      const logInterval = setInterval(() => {
        if (currentLogIndex < taskLogs.length) {
          const newLog: LogEntry = {
            timestamp: new Date(),
            taskId: currentTask.id,
            message: taskLogs[currentLogIndex],
            type: currentLogIndex === taskLogs.length - 1 ? 'success' : 'info',
          };
          setLogs((prev) => [...prev, newLog]);
          setCurrentLogIndex((prev) => prev + 1);

          // Update progress
          const progress = ((currentLogIndex + 1) / taskLogs.length) * 100;
          setTasks((prev) =>
            prev.map((task, idx) =>
              idx === currentTaskIndex ? { ...task, progress } : task
            )
          );
        }
      }, 300);

      return () => clearInterval(logInterval);
    }

    // Complete the task when all logs are done
    if (currentLogIndex >= taskLogs.length) {
      const completeTimeout = setTimeout(() => {
        setTasks((prev) =>
          prev.map((task, idx) =>
            idx === currentTaskIndex ? { ...task, status: 'complete', progress: 100 } : task
          )
        );
        setCurrentTaskIndex((prev) => prev + 1);
        setCurrentLogIndex(0);
      }, 500);

      return () => clearTimeout(completeTimeout);
    }
  }, [currentTaskIndex, tasks.length, navigate, currentLogIndex]);

  const overallProgress = (tasks.filter((t) => t.status === 'complete').length / tasks.length) * 100;

  return (
    <WizardLayout
      currentStep={3}
      totalSteps={6}
      title="Run Analysis"
      onBack={() => navigate('/agents/create/step-2')}
    >
      <div className="grid grid-cols-2 gap-6 h-[calc(100vh-200px)] pb-8">
        {/* Left: Progress & Tasks */}
        <div className="space-y-6">
          <Card className="p-6 border-2 border-[#00B5B3]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#E0F7F7] rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-[#00B5B3] animate-spin" />
              </div>
              <h2 className="text-lg font-semibold text-[#333333] mb-1">
                Analyzing Your Data
              </h2>
              <p className="text-xs text-[#666666]">
                Please wait while we analyze your tables and generate insights...
              </p>
            </div>

            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#333333]">Overall Progress</span>
                <span className="text-xs font-semibold text-[#00B5B3]">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border transition-all ${
                    task.status === 'complete'
                      ? 'border-[#00B98E] bg-[#E6F7F4]'
                      : task.status === 'running'
                      ? 'border-[#00B5B3] bg-[#F0FFFE]'
                      : 'border-[#EEEEEE] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {task.status === 'complete' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00B98E]" />
                      ) : task.status === 'running' ? (
                        <Loader2 className="w-4 h-4 text-[#00B5B3] animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#DDDDDD]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${
                            task.status === 'complete'
                              ? 'text-[#00B98E]'
                              : task.status === 'running'
                              ? 'text-[#00B5B3]'
                              : 'text-[#999999]'
                          }`}
                        >
                          {task.label}
                        </span>
                        {task.status === 'running' && (
                          <span className="text-xs text-[#00B5B3]">{Math.round(task.progress)}%</span>
                        )}
                      </div>
                      {task.status === 'running' && (
                        <Progress value={task.progress} className="h-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Logs */}
        <Card className="border-2 border-[#EEEEEE] flex flex-col overflow-hidden">
          <div className="p-4 border-b-2 border-[#EEEEEE] bg-[#FAFBFC]">
            <h3 className="text-sm font-semibold text-[#333333]">Analysis Logs</h3>
            <p className="text-xs text-[#666666] mt-1">{logs.length} events</p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2 font-mono text-xs">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 p-2 rounded ${
                    log.type === 'success' ? 'bg-[#E6F7F4]' : 'bg-[#F8F9FA]'
                  }`}
                >
                  <span className="text-[#999999] flex-shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <Info className={`w-3 h-3 flex-shrink-0 mt-0.5 ${
                    log.type === 'success' ? 'text-[#00B98E]' : 'text-[#666666]'
                  }`} />
                  <span className={log.type === 'success' ? 'text-[#00B98E]' : 'text-[#333333]'}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </WizardLayout>
  );
}
