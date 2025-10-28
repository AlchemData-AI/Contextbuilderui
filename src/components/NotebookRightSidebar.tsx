import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import {
  Sparkles,
  Database,
  Send,
  Loader2,
  CheckCircle2,
  Code,
  ChevronRight,
  X,
  Search,
  Table2,
  Columns3,
  ArrowUpDown,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  thinkingSteps?: string[];
  generatedCode?: string;
}

interface NotebookRightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode?: (code: string) => void;
}

// Mock data catalog
const MOCK_TABLES = [
  {
    schema: 'public',
    name: 'sales',
    type: 'table',
    rows: 125000,
    columns: [
      { name: 'id', type: 'integer', nullable: false },
      { name: 'product_name', type: 'varchar', nullable: false },
      { name: 'quantity', type: 'integer', nullable: false },
      { name: 'revenue', type: 'decimal', nullable: false },
      { name: 'date', type: 'timestamp', nullable: false },
      { name: 'customer_id', type: 'integer', nullable: true },
      { name: 'region', type: 'varchar', nullable: true },
    ],
  },
  {
    schema: 'public',
    name: 'customers',
    type: 'table',
    rows: 45000,
    columns: [
      { name: 'id', type: 'integer', nullable: false },
      { name: 'name', type: 'varchar', nullable: false },
      { name: 'email', type: 'varchar', nullable: false },
      { name: 'customer_segment', type: 'varchar', nullable: true },
      { name: 'lifetime_value', type: 'decimal', nullable: true },
      { name: 'created_at', type: 'timestamp', nullable: false },
    ],
  },
  {
    schema: 'public',
    name: 'products',
    type: 'table',
    rows: 2500,
    columns: [
      { name: 'id', type: 'integer', nullable: false },
      { name: 'name', type: 'varchar', nullable: false },
      { name: 'category', type: 'varchar', nullable: true },
      { name: 'price', type: 'decimal', nullable: false },
      { name: 'stock', type: 'integer', nullable: false },
    ],
  },
];

export function NotebookRightSidebar({ isOpen, onClose, onInsertCode }: NotebookRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'catalog'>('ai');
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  const handleAiSubmit = async () => {
    if (!aiInput.trim() || isAiProcessing) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: aiInput,
      timestamp: new Date(),
    };

    setAiMessages((prev) => [...prev, userMessage]);
    setAiInput('');
    setIsAiProcessing(true);

    // Simulate AI thinking
    const thinkingId = `msg-${Date.now() + 1}`;
    const thinkingMsg: AIMessage = {
      id: thinkingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isThinking: true,
      thinkingSteps: [],
    };

    setAiMessages((prev) => [...prev, thinkingMsg]);

    const steps = [
      'Analyzing your request...',
      'Understanding code context...',
      'Generating optimized solution...',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAiMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { ...m, thinkingSteps: steps.slice(0, i + 1) }
            : m
        )
      );
    }

    // Generate code
    await new Promise((resolve) => setTimeout(resolve, 600));
    const generatedCode = `-- Find top selling products\nSELECT \n  product_name,\n  SUM(quantity) as total_sold,\n  SUM(revenue) as total_revenue\nFROM sales\nWHERE date >= CURRENT_DATE - INTERVAL '30 days'\nGROUP BY product_name\nORDER BY total_revenue DESC\nLIMIT 10;`;

    setAiMessages((prev) =>
      prev.map((m) =>
        m.id === thinkingId
          ? {
              ...m,
              isThinking: false,
              content: 'I\'ve generated an optimized SQL query for your request. This query will help you analyze top-selling products efficiently.',
              generatedCode,
            }
          : m
      )
    );

    setIsAiProcessing(false);

    // Auto-scroll to bottom
    setTimeout(() => {
      if (aiScrollRef.current) {
        aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const filteredTables = MOCK_TABLES.filter(
    (table) =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.schema.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-[#E5E7EB] bg-white flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h3 className="text-[#111827] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00B5B3]" />
          Assistant
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0 hover:bg-[#F3F4F6]"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ai' | 'catalog')} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full rounded-none border-b border-[#E5E7EB] bg-[#F9FAFB] p-0 h-10 justify-start">
          <TabsTrigger
            value="ai"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#00B5B3] data-[state=active]:bg-white px-4 h-10"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            AI Intelligence
          </TabsTrigger>
          <TabsTrigger
            value="catalog"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#00B5B3] data-[state=active]:bg-white px-4 h-10"
          >
            <Database className="w-3.5 h-3.5 mr-2" />
            Catalog
          </TabsTrigger>
        </TabsList>

        {/* AI Intelligence Tab */}
        <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 m-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0" ref={aiScrollRef}>
            {/* Quick Actions */}
            <div className="space-y-2 mb-4">
              <p className="text-sm text-[#6B7280] mb-3">Ask questions about your code</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-8 text-xs border-[#D1D5DB] hover:border-[#00B5B3] hover:bg-[#E6F7F7]"
                onClick={() => setAiInput('Find tables to query')}
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Find tables to query
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-8 text-xs border-[#D1D5DB] hover:border-[#00B5B3] hover:bg-[#E6F7F7]"
                onClick={() => setAiInput('Show me example queries')}
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Find some queries
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-8 text-xs border-[#D1D5DB] hover:border-[#00B5B3] hover:bg-[#E6F7F7]"
                onClick={() => setAiInput('Create a new code cell')}
              >
                <Code className="w-3 h-3 mr-2" />
                Create a code cell
              </Button>
            </div>
            {aiMessages.length > 0 && (
              <div className="space-y-4">
                {aiMessages.map((message) => (
                  <div key={message.id}>
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="bg-[#F3F4F6] rounded-lg px-3 py-2 max-w-[85%]">
                          <p className="text-sm text-[#1F2937]">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {message.isThinking ? (
                          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00B5B3]" />
                              <span className="text-sm text-[#6B7280]">Thinking...</span>
                            </div>
                            <div className="space-y-1.5">
                              {message.thinkingSteps?.map((step, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-[#6B7280]">
                                  <CheckCircle2 className="w-3 h-3 text-[#00B5B3]" />
                                  {step}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="bg-[#E6F7F7] rounded-lg px-3 py-2 mb-2">
                              <p className="text-sm text-[#1F2937]">{message.content}</p>
                            </div>
                            {message.generatedCode && (
                              <div className="bg-[#1F2937] rounded-lg p-3">
                                <pre className="text-xs text-[#E5E7EB] font-mono overflow-x-auto mb-2 whitespace-pre-wrap">
                                  {message.generatedCode}
                                </pre>
                                <Button
                                  size="sm"
                                  onClick={() => onInsertCode?.(message.generatedCode!)}
                                  className="w-full h-7 bg-[#00B5B3] hover:bg-[#009996] text-xs"
                                >
                                  <Code className="w-3 h-3 mr-2" />
                                  Insert into Cell
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[#E5E7EB] p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiSubmit();
                  }
                }}
                placeholder="Ask about code, tables, or queries..."
                className="resize-none border-[#D1D5DB] text-sm h-20 focus:ring-[#00B5B3] focus:border-[#00B5B3]"
                disabled={isAiProcessing}
              />
              <Button
                onClick={handleAiSubmit}
                disabled={!aiInput.trim() || isAiProcessing}
                size="sm"
                className="bg-[#00B5B3] hover:bg-[#009996] self-end h-8 w-8 p-0"
              >
                {isAiProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-2">
              @ for objects, / for commands, ⌘ for history
            </p>
          </div>
        </TabsContent>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="flex-1 flex flex-col min-h-0 m-0">
          {/* Search */}
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
              <Input
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm border-[#D1D5DB] focus:ring-[#00B5B3] focus:border-[#00B5B3]"
              />
            </div>
          </div>

          {/* Tables List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredTables.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280]">No tables found</p>
                </div>
              ) : (
                filteredTables.map((table) => (
                  <div
                    key={`${table.schema}.${table.name}`}
                    className="border border-[#E5E7EB] rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedTable(
                          expandedTable === table.name ? null : table.name
                        )
                      }
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${
                            expandedTable === table.name ? 'rotate-90' : ''
                          }`}
                        />
                        <Table2 className="w-3.5 h-3.5 text-[#00B5B3]" />
                        <div className="text-left">
                          <div className="text-sm text-[#111827]">{table.name}</div>
                          <div className="text-xs text-[#6B7280]">
                            {table.rows.toLocaleString()} rows
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-[#F3F4F6] text-[#6B7280] border-0 h-5 text-xs">
                        {table.columns.length} cols
                      </Badge>
                    </button>

                    {expandedTable === table.name && (
                      <div className="border-t border-[#E5E7EB] bg-[#FAFBFC]">
                        <div className="px-3 py-2">
                          <div className="text-xs text-[#6B7280] mb-2 flex items-center gap-1">
                            <Columns3 className="w-3 h-3" />
                            Columns
                          </div>
                          <div className="space-y-1.5">
                            {table.columns.map((column) => (
                              <div
                                key={column.name}
                                className="flex items-center justify-between text-xs py-1"
                              >
                                <span className="font-mono text-[#374151]">
                                  {column.name}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <Badge
                                    variant="secondary"
                                    className="bg-[#E5E7EB] text-[#6B7280] border-0 h-4 text-xs px-1.5"
                                  >
                                    {column.type}
                                  </Badge>
                                  {!column.nullable && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-[#DBEAFE] text-[#1E40AF] border-0 h-4 text-xs px-1.5"
                                    >
                                      NOT NULL
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
