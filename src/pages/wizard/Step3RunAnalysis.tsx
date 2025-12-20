import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Card } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Badge } from '../../components/ui/badge';
import { Loader2, CheckCircle2, Zap, BarChart3, TrendingUp, Brain } from 'lucide-react';
import { useSettingsStore } from '../../lib/settingsStore';

interface ThinkingLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'thinking' | 'action' | 'complete';
}

const AGENT_THOUGHTS: string[] = [
  "Initializing data analysis agent...",
  "Connecting to data warehouse and establishing schema context",
  "Reading table metadata for: customers, orders, products, order_items, inventory, shipments",
  "Analyzing table structures and identifying primary keys",
  "Examining foreign key relationships across tables",
  "Detected relationship: orders.customer_id → customers.id (many-to-one)",
  "Detected relationship: order_items.order_id → orders.id (many-to-one)",
  "Detected relationship: order_items.product_id → products.id (many-to-one)",
  "Analyzing column data types and constraints",
  "Identifying numeric columns suitable for aggregations",
  "Found aggregation candidates: total_amount, quantity, price, discount",
  "Examining temporal columns for time-series analysis",
  "Detected temporal patterns in: created_at, updated_at, shipped_at",
  "Analyzing cardinality and join patterns between tables",
  "Calculating relationship confidence scores based on referential integrity",
  "Identifying potential fact and dimension tables",
  "Generating business context questions based on schema analysis",
  "Creating sample queries for common analytical patterns",
  "Validating SQL syntax and performance implications",
  "Building knowledge graph of table relationships and dependencies",
  "Analysis complete. Generated 12 relationships, 8 key metrics, and 15 sample queries.",
];

export function Step3RunAnalysis() {
  const navigate = useNavigate();
  const samplingScale = useSettingsStore((state) => state.samplingScale);
  const [logs, setLogs] = useState<ThinkingLog[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const lastLogRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (lastLogRef.current) {
      lastLogRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [logs]);

  // Streaming agent thoughts
  useEffect(() => {
    if (currentLogIndex >= AGENT_THOUGHTS.length) {
      // Mark as complete
      setTimeout(() => {
        setIsComplete(true);
        // Navigate to next step after brief delay
        setTimeout(() => {
          navigate('/agents/create/step-4');
        }, 1500);
      }, 500);
      return;
    }

    const delay = currentLogIndex === 0 ? 500 : 150; // Slower start, then stream faster
    
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
  }, [currentLogIndex, navigate]);

  const progress = (currentLogIndex / AGENT_THOUGHTS.length) * 100;

  return (
    <WizardLayout
      currentStep={3}
      totalSteps={6}
      title="Run Analysis"
      onBack={() => navigate('/agents/create/step-2')}
    >
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
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#333333]">
                  {isComplete ? 'Analysis Complete' : 'Agent Thinking...'}
                </h2>
                <Badge 
                  variant="outline" 
                  className="bg-[#E0F7F7] text-[#00B5B3] border-0 text-xs px-2 py-1"
                >
                  <SamplingIcon className="w-3 h-3 mr-1" />
                  {getSamplingLabel(samplingScale)}
                </Badge>
              </div>
              <p className="text-sm text-[#666666]">
                {isComplete 
                  ? 'AI has completed examining your data sources and generated comprehensive insights'
                  : 'AI is analyzing your data to understand patterns, relationships, and business context'
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
          
          <ScrollArea className="h-[calc(100vh-440px)]">
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
              
              {/* Scroll anchor */}
              <div ref={lastLogRef} />
            </div>
          </ScrollArea>
        </Card>
      </div>

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