import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, Loader2, ChevronDown, ChevronRight, Terminal, Zap, BarChart3, TrendingUp } from 'lucide-react';
import { useSettingsStore } from '../../lib/settingsStore';

interface AnalysisTask {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete';
  progress: number;
  logs: string[];
  duration?: string;
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

const TASK_DURATIONS: Record<string, string> = {
  '1': '2.3s',
  '2': '1.8s',
  '3': '1.5s',
  '4': '2.1s',
  '5': '1.9s',
};

export function Step3RunAnalysis() {
  const navigate = useNavigate();
  const samplingScale = useSettingsStore((state) => state.samplingScale);
  const [tasks, setTasks] = useState<AnalysisTask[]>(INITIAL_TASKS);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const getSamplingLabel = (scale: number) => {
    switch (scale) {
      case 0: return 'Fast';
      case 1: return 'Balanced';
      case 2: return 'Comprehensive';
      default: return 'Balanced';
    }
  };

  const getSamplingIcon = (scale: number) => {
    switch (scale) {
      case 0: return Zap;
      case 1: return BarChart3;
      case 2: return TrendingUp;
      default: return BarChart3;
    }
  };

  const SamplingIcon = getSamplingIcon(samplingScale);

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
          
          // Add log to task's logs array
          setTasks((prev) =>
            prev.map((task, idx) =>
              idx === currentTaskIndex 
                ? { ...task, logs: [...task.logs, taskLogs[currentLogIndex]] } 
                : task
            )
          );
          
          setCurrentLogIndex((prev) => prev + 1);

          // Update progress
          const progress = ((currentLogIndex + 1) / taskLogs.length) * 100;
          setTasks((prev) =>
            prev.map((task, idx) =>
              idx === currentTaskIndex ? { ...task, progress } : task
            )
          );
        }
      }, 200);

      return () => clearInterval(logInterval);
    }

    // Complete the task when all logs are done
    if (currentLogIndex >= taskLogs.length) {
      const completeTimeout = setTimeout(() => {
        setTasks((prev) =>
          prev.map((task, idx) =>
            idx === currentTaskIndex 
              ? { ...task, status: 'complete', progress: 100, duration: TASK_DURATIONS[task.id] } 
              : task
          )
        );
        setCurrentTaskIndex((prev) => prev + 1);
        setCurrentLogIndex(0);
      }, 400);

      return () => clearTimeout(completeTimeout);
    }
  }, [currentTaskIndex, tasks.length, navigate, currentLogIndex]);

  const overallProgress = (tasks.filter((t) => t.status === 'complete').length / tasks.length) * 100;
  const completedCount = tasks.filter((t) => t.status === 'complete').length;
  const isAnalyzing = currentTaskIndex < tasks.length;

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  return (
    <WizardLayout
      currentStep={3}
      totalSteps={6}
      title="Run Analysis"
      onBack={() => navigate('/agents/create/step-2')}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Overall Progress */}
        <Card className="p-6 border border-[#EEEEEE]">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 bg-[#E0F7F7] rounded-lg flex items-center justify-center flex-shrink-0">
              {isAnalyzing ? (
                <Loader2 className="w-6 h-6 text-[#00B5B3] animate-spin" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#00B98E]" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#333333] mb-1">
                {isAnalyzing ? 'Analyzing Your Data' : 'Analysis Complete'}
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#666666]">
                  {isAnalyzing 
                    ? 'AI is examining your data sources to understand patterns and relationships'
                    : 'All analysis tasks completed successfully'
                  }
                </p>
                <Badge 
                  variant="outline" 
                  className="bg-[#E0F7F7] text-[#00B5B3] border-0 text-xs px-2 py-1"
                >
                  <SamplingIcon className="w-3 h-3 mr-1" />
                  {getSamplingLabel(samplingScale)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#333333]">
                Overall Progress
              </span>
              <span className="text-sm font-semibold text-[#00B5B3]">
                {completedCount} of {tasks.length} complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-2.5" />
          </div>
        </Card>

        {/* Analysis Steps with Collapsible Logs */}
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="space-y-3 pr-4">
            {tasks.map((task, index) => (
              <Card 
                key={task.id} 
                className={`border transition-all ${
                  task.status === 'complete'
                    ? 'border-[#00B98E] bg-[#F9FFFD]'
                    : task.status === 'running'
                    ? 'border-[#00B5B3] bg-[#F0FFFE]'
                    : 'border-[#EEEEEE] bg-white'
                }`}
              >
                <Collapsible
                  open={expandedTasks.has(task.id)}
                  onOpenChange={() => toggleTask(task.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center gap-3 hover:bg-black/[0.02] transition-colors">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {task.status === 'complete' ? (
                          <CheckCircle2 className="w-5 h-5 text-[#00B98E]" />
                        ) : task.status === 'running' ? (
                          <Loader2 className="w-5 h-5 text-[#00B5B3] animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#DDDDDD]" />
                        )}
                      </div>

                      {/* Task Info */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${
                            task.status === 'complete'
                              ? 'text-[#00B98E]'
                              : task.status === 'running'
                              ? 'text-[#00B5B3]'
                              : 'text-[#999999]'
                          }`}>
                            {task.label}
                          </span>
                          {task.status === 'complete' && task.duration && (
                            <span className="text-xs text-[#999999]">• {task.duration}</span>
                          )}
                        </div>
                        
                        {task.status === 'running' && (
                          <Progress value={task.progress} className="h-1 w-full" />
                        )}
                      </div>

                      {/* Expand/Collapse Indicator */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {task.logs.length > 0 && (
                          <span className="text-xs text-[#999999]">
                            {task.logs.length} events
                          </span>
                        )}
                        {task.logs.length > 0 && (
                          expandedTasks.has(task.id) ? (
                            <ChevronDown className="w-4 h-4 text-[#666666]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#666666]" />
                          )
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Collapsible Log Content */}
                  {task.logs.length > 0 && (
                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t border-[#EEEEEE]/50 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Terminal className="w-3.5 h-3.5 text-[#999999]" />
                          <span className="text-xs font-medium text-[#666666]">Execution Logs</span>
                        </div>
                        <div className="bg-[#FAFBFC] rounded-lg p-3 border border-[#EEEEEE]">
                          <div className="space-y-1 font-mono text-xs">
                            {task.logs.map((log, idx) => (
                              <div 
                                key={idx}
                                className="text-[#666666] leading-relaxed"
                              >
                                <span className="text-[#999999] mr-2">›</span>
                                {log}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </WizardLayout>
  );
}
