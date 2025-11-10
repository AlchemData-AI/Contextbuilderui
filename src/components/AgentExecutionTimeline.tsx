import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle, Circle, XCircle, Brain, ChevronDown, ChevronRight, Code, FileText } from 'lucide-react';
import { cn } from './ui/utils';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ExecutionStep {
  step_number: number;
  step_type: 'ActionStep' | 'PlanningStep';
  completed: boolean;
  action?: string;
  observations?: string;
  status?: 'pending' | 'in-progress' | 'complete' | 'failed';
  error?: string;
}

export interface FinalAnswer {
  answer: string;
  total_steps: number;
}

interface AgentExecutionTimelineProps {
  steps: ExecutionStep[];
  finalAnswer?: FinalAnswer;
  isStreaming?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════
// HELPER: FORMAT JSON
// ═══════════════════════════════════════════════════════════════════

function formatJSON(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return text;
  }
}

function isJSON(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function StepIndicator({ status }: { status: ExecutionStep['status'] }) {
  if (status === 'complete') {
    return (
      <div className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
        <CheckCircle className="w-4 h-4 text-white" />
      </div>
    );
  }
  
  if (status === 'in-progress') {
    return (
      <div className="w-6 h-6 rounded-full bg-[#00B5B3] flex items-center justify-center flex-shrink-0">
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      </div>
    );
  }
  
  if (status === 'failed') {
    return (
      <div className="w-6 h-6 rounded-full bg-[#F44336] flex items-center justify-center flex-shrink-0">
        <XCircle className="w-4 h-4 text-white" />
      </div>
    );
  }
  
  // pending
  return (
    <div className="w-6 h-6 rounded-full border-2 border-[#CCCCCC] flex items-center justify-center flex-shrink-0">
      <Circle className="w-3 h-3 text-[#CCCCCC]" />
    </div>
  );
}

function CodeBlock({ code, label, isComplete }: { code: string; label: string; isComplete: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Check if this is SQL code (contains SELECT, FROM, etc.)
  const isSQL = /\b(SELECT|FROM|WHERE|JOIN)\b/i.test(code);
  
  return (
    <div className="mt-2 border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6] hover:from-[#F3F4F6] hover:to-[#E5E7EB] transition-colors text-left border-b border-[#E5E7EB]"
      >
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-8 h-8 rounded flex items-center justify-center",
            isSQL ? "bg-[#00B5B3]/10" : "bg-[#6B7280]/10"
          )}>
            <Code className={cn(
              "w-4 h-4",
              isSQL ? "text-[#00B5B3]" : "text-[#6B7280]"
            )} />
          </div>
          <div>
            <span className="text-xs font-medium text-[#374151]">{label}</span>
            {isSQL && (
              <div className="text-[10px] text-[#6B7280] mt-0.5">SQL Query</div>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-[#FAFAFA]">
          <pre className="text-xs text-[#1F2937] font-mono whitespace-pre-wrap break-words leading-relaxed">
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}

function ResultsBlock({ results, isComplete }: { results: string; isComplete: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isJSONData = isJSON(results);
  const displayText = isJSONData ? formatJSON(results) : results;
  
  // Count rows if JSON array
  let rowCount = 0;
  if (isJSONData) {
    try {
      const parsed = JSON.parse(results);
      if (Array.isArray(parsed)) {
        rowCount = parsed.length;
      }
    } catch {}
  }
  
  return (
    <div className="mt-2 border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6] hover:from-[#F3F4F6] hover:to-[#E5E7EB] transition-colors text-left border-b border-[#E5E7EB]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-[#10B981]/10">
            <FileText className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#374151]">Results</span>
            {rowCount > 0 && (
              <div className="text-[10px] text-[#6B7280] mt-0.5">{rowCount} rows returned</div>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-white">
          <pre className="text-xs text-[#1F2937] font-mono whitespace-pre-wrap break-words leading-relaxed">
            {displayText}
          </pre>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function AgentExecutionTimeline({ 
  steps, 
  finalAnswer, 
  isStreaming = false,
  className 
}: AgentExecutionTimelineProps) {
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Timeline */}
      <div className="relative">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isPlanningStep = step.step_type === 'PlanningStep';
            const status = step.status || (
              step.completed ? 'complete' : 
              isStreaming && isLast ? 'in-progress' : 
              'pending'
            );
            
            return (
              <motion.div
                key={step.step_number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative pb-6 last:pb-0"
              >
                {/* Connecting Line */}
                {!isLast && (
                  <div 
                    className={cn(
                      'absolute left-3 top-6 bottom-0 w-0.5',
                      status === 'complete' ? 'bg-[#4CAF50]' : 'bg-[#E0E0E0]'
                    )}
                  />
                )}
                
                {/* Step Content */}
                <div className="flex gap-3">
                  {/* Indicator */}
                  <div className="relative z-10">
                    <StepIndicator status={status} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    {/* Step Label */}
                    <div className="flex items-center gap-2 mb-2">
                      {isPlanningStep ? (
                        <>
                          <Brain className="w-4 h-4 text-[#00B5B3]" />
                          <span className="text-sm text-[#333333]">Planning...</span>
                        </>
                      ) : (
                        <span className="text-sm text-[#333333]">Step {step.step_number}</span>
                      )}
                      
                      {status === 'in-progress' && (
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-[#00B5B3]"
                        />
                      )}
                    </div>
                    
                    {/* Planning Step Content */}
                    {isPlanningStep && status === 'in-progress' && (
                      <p className="text-xs text-[#666666]">Analyzing results and planning next steps...</p>
                    )}
                    
                    {/* Action Code */}
                    {step.action && (
                      <CodeBlock 
                        code={step.action}
                        label={status === 'in-progress' ? 'Executing...' : 'Code executed'}
                        isComplete={status === 'complete'}
                      />
                    )}
                    
                    {/* Observations/Results */}
                    {step.observations && (
                      <ResultsBlock 
                        results={step.observations}
                        isComplete={status === 'complete'}
                      />
                    )}
                    
                    {/* Error Message */}
                    {step.error && status === 'failed' && (
                      <div className="mt-2 p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg">
                        <p className="text-xs text-[#C62828]">{step.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Final Answer */}
      {finalAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 pt-6 border-t border-[#EEEEEE]"
        >
          <div className="flex items-start gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[#4CAF50] mt-0.5 flex-shrink-0" />
            <span className="text-sm text-[#4CAF50]">Analysis Complete</span>
          </div>
          <div className="pl-6">
            <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-wrap">
              {finalAnswer.answer}
            </p>
            <p className="text-xs text-[#999999] mt-3">
              Completed in {finalAnswer.total_steps} steps
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
