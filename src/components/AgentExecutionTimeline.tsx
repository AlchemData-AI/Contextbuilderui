import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle, Circle, XCircle, Brain, ChevronDown, ChevronRight, Code, FileText, Database, TableIcon, Lightbulb } from 'lucide-react';
import { cn } from './ui/utils';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type StepType = 
  | 'PlanningStep'      // Agent reasoning/thinking in text
  | 'SQLQueryStep'      // SQL query execution
  | 'PythonCodeStep'    // Python code execution
  | 'DataResultStep'    // Data results (JSON, CSV, etc.)
  | 'ActionStep';       // Generic action (backward compatibility)

export interface ExecutionStep {
  step_number: number;
  step_type: StepType;
  completed: boolean;
  
  // For code/SQL steps
  action?: string;
  sql_query?: string;
  python_code?: string;
  
  // For data/results steps
  observations?: string;
  data?: string;
  data_format?: 'json' | 'csv' | 'text';
  
  // For planning/thinking steps
  thinking?: string;
  reasoning?: string;
  
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
// HELPER: DATA FORMATTING
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

function isCSV(text: string): boolean {
  // Simple CSV detection: look for comma-separated values with multiple lines
  const lines = text.trim().split('\n');
  if (lines.length < 2) return false;
  
  const firstLineCommas = (lines[0].match(/,/g) || []).length;
  if (firstLineCommas === 0) return false;
  
  // Check if other lines have similar number of commas
  return lines.slice(1, 3).every(line => {
    const commas = (line.match(/,/g) || []).length;
    return commas === firstLineCommas;
  });
}

function parseCSV(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => 
    line.split(',').map(cell => cell.trim())
  );
  return { headers, rows };
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function ThinkingBlock({ thinking, isStreaming }: { thinking: string; isStreaming?: boolean }) {
  return (
    <div className="mt-2 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded flex items-center justify-center bg-[#6B7280]/5 flex-shrink-0 border border-[#E5E7EB]">
          <Lightbulb className="w-3.5 h-3.5 text-[#6B7280]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
            Agent Thinking
          </div>
          <p className="text-sm text-[#4B5563] leading-relaxed italic">
            {thinking}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-1.5 h-4 bg-[#6B7280] ml-1 align-middle"
              />
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

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

function SQLQueryBlock({ sql, label, isComplete }: { sql: string; label: string; isComplete: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="mt-2 border-l-2 border-l-[#00B5B3] border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors text-left border-b border-[#E5E7EB]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded flex items-center justify-center bg-[#00B5B3]/5 border border-[#00B5B3]/20">
            <Database className="w-3.5 h-3.5 text-[#00B5B3]" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#374151]">{label}</span>
            <div className="text-[10px] text-[#6B7280] mt-0.5">SQL Query</div>
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
            {sql}
          </pre>
        </div>
      )}
    </div>
  );
}

function PythonCodeBlock({ code, label, isComplete }: { code: string; label: string; isComplete: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="mt-2 border-l-2 border-l-[#8B5CF6] border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors text-left border-b border-[#E5E7EB]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded flex items-center justify-center bg-[#8B5CF6]/5 border border-[#8B5CF6]/20">
            <Code className="w-3.5 h-3.5 text-[#8B5CF6]" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#374151]">{label}</span>
            <div className="text-[10px] text-[#6B7280] mt-0.5">Python Code</div>
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
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}

function DataTableView({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            {headers.map((header, idx) => (
              <th key={idx} className="px-3 py-2 text-left font-medium text-[#374151] bg-[#F9FAFB]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2 text-[#6B7280]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 10 && (
        <div className="px-3 py-2 text-[10px] text-[#9CA3AF] bg-[#F9FAFB] border-t border-[#E5E7EB]">
          Showing 10 of {rows.length} rows
        </div>
      )}
    </div>
  );
}

function DataResultBlock({ data, format }: { data: string; format?: 'json' | 'csv' | 'text' }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
  
  // Auto-detect format if not provided
  const detectedFormat = format || (isJSON(data) ? 'json' : isCSV(data) ? 'csv' : 'text');
  
  // Count rows
  let rowCount = 0;
  let parsedData: { headers: string[]; rows: string[][] } | null = null;
  
  if (detectedFormat === 'json') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        rowCount = parsed.length;
        // Convert JSON to table format
        if (parsed.length > 0) {
          const headers = Object.keys(parsed[0]);
          const rows = parsed.map(obj => headers.map(h => String(obj[h] ?? '')));
          parsedData = { headers, rows };
        }
      }
    } catch {}
  } else if (detectedFormat === 'csv') {
    parsedData = parseCSV(data);
    rowCount = parsedData.rows.length;
  }
  
  const displayText = detectedFormat === 'json' ? formatJSON(data) : data;
  const canShowTable = parsedData !== null;
  
  return (
    <div className="mt-2 border-l-2 border-l-[#10B981] border border-[#E5E7EB] rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors text-left border-b border-[#E5E7EB]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded flex items-center justify-center bg-[#10B981]/5 border border-[#10B981]/20">
            <TableIcon className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <div>
            <span className="text-xs font-medium text-[#374151]">Data Results</span>
            {rowCount > 0 && (
              <div className="text-[10px] text-[#6B7280] mt-0.5">
                {rowCount} rows • {detectedFormat.toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canShowTable && isExpanded && (
            <div className="flex gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "px-2 py-1 text-[10px] rounded transition-colors border",
                  viewMode === 'table' 
                    ? "bg-[#00B5B3] text-white border-[#00B5B3]" 
                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]"
                )}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={cn(
                  "px-2 py-1 text-[10px] rounded transition-colors border",
                  viewMode === 'raw' 
                    ? "bg-[#00B5B3] text-white border-[#00B5B3]" 
                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]"
                )}
              >
                Raw
              </button>
            </div>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="bg-white">
          {canShowTable && viewMode === 'table' ? (
            <DataTableView headers={parsedData!.headers} rows={parsedData!.rows} />
          ) : (
            <div className="p-4">
              <pre className="text-xs text-[#1F2937] font-mono whitespace-pre-wrap break-words leading-relaxed">
                {displayText}
              </pre>
            </div>
          )}
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
                    {step.step_type === 'PlanningStep' && (
                      <>
                        {status === 'in-progress' && !step.thinking && !step.reasoning && (
                          <p className="text-xs text-[#666666]">Analyzing results and planning next steps...</p>
                        )}
                        {(step.thinking || step.reasoning) && (
                          <ThinkingBlock 
                            thinking={step.thinking || step.reasoning || ''} 
                            isStreaming={status === 'in-progress'}
                          />
                        )}
                      </>
                    )}
                    
                    {/* SQL Query Step */}
                    {step.step_type === 'SQLQueryStep' && step.sql_query && (
                      <SQLQueryBlock 
                        sql={step.sql_query}
                        label={status === 'in-progress' ? 'Executing query...' : 'Query executed'}
                        isComplete={status === 'complete'}
                      />
                    )}
                    
                    {/* Python Code Step */}
                    {step.step_type === 'PythonCodeStep' && step.python_code && (
                      <PythonCodeBlock 
                        code={step.python_code}
                        label={status === 'in-progress' ? 'Running code...' : 'Code executed'}
                        isComplete={status === 'complete'}
                      />
                    )}
                    
                    {/* Generic Action (backward compatibility) */}
                    {step.step_type === 'ActionStep' && step.action && (
                      <PythonCodeBlock 
                        code={step.action}
                        label={status === 'in-progress' ? 'Executing...' : 'Code executed'}
                        isComplete={status === 'complete'}
                      />
                    )}
                    
                    {/* Data Result Step */}
                    {step.step_type === 'DataResultStep' && step.data && (
                      <DataResultBlock 
                        data={step.data}
                        format={step.data_format}
                      />
                    )}
                    
                    {/* Observations (legacy/fallback) */}
                    {step.observations && step.step_type !== 'DataResultStep' && (
                      <DataResultBlock 
                        data={step.observations}
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
