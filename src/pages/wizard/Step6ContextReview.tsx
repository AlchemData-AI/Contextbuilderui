import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  ChevronRight,
  Search,
  Database,
  Columns3,
  ListFilter,
  Edit2,
  MessageSquare,
  Sparkles,
  Table,
  Check,
  X,
  Loader2,
  Brain,
  Layers,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface TableContext {
  tableName: string;
  schemaName: string;
  description: string;
  businessPurpose: string;
  recordCount: number;
  columns: ColumnContext[];
}

interface ColumnContext {
  columnName: string;
  dataType: string;
  description: string;
  businessMeaning: string;
  sampleValues: ValueContext[];
  isKey: boolean;
  isForeignKey: boolean;
  relationships?: string[];
}

interface ValueContext {
  value: string;
  meaning: string;
  frequency: number;
  category?: string;
}

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════

const MOCK_TABLE_CONTEXTS: TableContext[] = [
  {
    tableName: 'customers',
    schemaName: 'public',
    description: 'Stores customer account information and contact details',
    businessPurpose: 'Central repository for all customer data including demographics, contact information, and account status',
    recordCount: 12458,
    columns: [
      {
        columnName: 'customer_id',
        dataType: 'INTEGER',
        description: 'Unique identifier for each customer',
        businessMeaning: 'Primary key used to track individual customer accounts across all systems',
        isKey: true,
        isForeignKey: false,
        sampleValues: [],
      },
      {
        columnName: 'customer_type',
        dataType: 'VARCHAR',
        description: 'Classification of customer account type',
        businessMeaning: 'Indicates the customer segment for pricing and service level differentiation',
        isKey: false,
        isForeignKey: false,
        sampleValues: [
          {
            value: 'enterprise',
            meaning: 'Large organizations with 500+ employees, receive premium support and custom pricing',
            frequency: 234,
            category: 'Premium',
          },
          {
            value: 'smb',
            meaning: 'Small and medium businesses with 10-499 employees, standard pricing tier',
            frequency: 5621,
            category: 'Standard',
          },
          {
            value: 'individual',
            meaning: 'Individual customers or freelancers, self-service model with basic support',
            frequency: 6603,
            category: 'Basic',
          },
        ],
        relationships: ['affects pricing tier', 'determines support level'],
      },
      {
        columnName: 'account_status',
        dataType: 'VARCHAR',
        description: 'Current status of the customer account',
        businessMeaning: 'Lifecycle stage of customer account, determines available actions and billing',
        isKey: false,
        isForeignKey: false,
        sampleValues: [
          {
            value: 'active',
            meaning: 'Account is in good standing with current subscription, full access to services',
            frequency: 10234,
          },
          {
            value: 'suspended',
            meaning: 'Temporary suspension due to payment issues, limited access until resolved',
            frequency: 342,
          },
          {
            value: 'churned',
            meaning: 'Customer has cancelled subscription, no access but data retained for 90 days',
            frequency: 1234,
          },
          {
            value: 'trial',
            meaning: 'Free trial period, full access for 14 days before payment required',
            frequency: 648,
          },
        ],
      },
      {
        columnName: 'region',
        dataType: 'VARCHAR',
        description: 'Geographic region of customer',
        businessMeaning: 'Used for regional analysis, compliance requirements, and time zone handling',
        isKey: false,
        isForeignKey: false,
        sampleValues: [
          {
            value: 'us-west',
            meaning: 'Western United States (CA, OR, WA, NV, AZ)',
            frequency: 4523,
          },
          {
            value: 'us-east',
            meaning: 'Eastern United States (NY, MA, FL, GA, NC)',
            frequency: 3891,
          },
          {
            value: 'eu',
            meaning: 'European Union, subject to GDPR compliance',
            frequency: 2876,
          },
          {
            value: 'apac',
            meaning: 'Asia-Pacific region (Japan, Australia, Singapore)',
            frequency: 1168,
          },
        ],
      },
    ],
  },
  {
    tableName: 'orders',
    schemaName: 'public',
    description: 'Transactional records of customer orders and purchases',
    businessPurpose: 'Tracks all order activity including amounts, status, and timestamps for revenue analysis',
    recordCount: 45621,
    columns: [
      {
        columnName: 'order_id',
        dataType: 'INTEGER',
        description: 'Unique identifier for each order',
        businessMeaning: 'Primary key for order tracking and reference in support tickets',
        isKey: true,
        isForeignKey: false,
        sampleValues: [],
      },
      {
        columnName: 'customer_id',
        dataType: 'INTEGER',
        description: 'Reference to customer who placed the order',
        businessMeaning: 'Links order to customer account for lifetime value calculations',
        isKey: false,
        isForeignKey: true,
        relationships: ['customers.customer_id'],
        sampleValues: [],
      },
      {
        columnName: 'order_status',
        dataType: 'VARCHAR',
        description: 'Current fulfillment status of the order',
        businessMeaning: 'Pipeline stage for order processing and fulfillment tracking',
        isKey: false,
        isForeignKey: false,
        sampleValues: [
          {
            value: 'pending',
            meaning: 'Order placed but payment not yet confirmed, awaiting authorization',
            frequency: 1234,
          },
          {
            value: 'processing',
            meaning: 'Payment confirmed, order being prepared for shipment',
            frequency: 2876,
          },
          {
            value: 'shipped',
            meaning: 'Order dispatched to carrier, tracking number available',
            frequency: 3421,
          },
          {
            value: 'delivered',
            meaning: 'Successfully delivered to customer, eligible for review',
            frequency: 36890,
          },
          {
            value: 'cancelled',
            meaning: 'Order cancelled by customer or system, refund processed if applicable',
            frequency: 1200,
          },
        ],
      },
      {
        columnName: 'payment_method',
        dataType: 'VARCHAR',
        description: 'Method used for payment',
        businessMeaning: 'Payment instrument for transaction processing and fee calculations',
        isKey: false,
        isForeignKey: false,
        sampleValues: [
          {
            value: 'credit_card',
            meaning: 'Credit card payment via Stripe, 2.9% + $0.30 transaction fee',
            frequency: 32456,
          },
          {
            value: 'paypal',
            meaning: 'PayPal payment, 3.49% + fixed fee based on currency',
            frequency: 8934,
          },
          {
            value: 'bank_transfer',
            meaning: 'Direct bank transfer (ACH/wire), used for large enterprise orders',
            frequency: 2341,
          },
          {
            value: 'invoice',
            meaning: 'Net-30 invoice payment for qualified enterprise customers',
            frequency: 1890,
          },
        ],
      },
    ],
  },
  {
    tableName: 'products',
    schemaName: 'public',
    description: 'Product catalog with SKUs, pricing, and inventory details',
    businessPurpose: 'Master data for all products available for sale',
    recordCount: 8934,
    columns: [
      {
        columnName: 'product_id',
        dataType: 'INTEGER',
        description: 'Unique identifier for each product',
        businessMeaning: 'Primary key for product catalog lookups',
        isKey: true,
        isForeignKey: false,
        sampleValues: [],
      },
      {
        columnName: 'category',
        dataType: 'VARCHAR',
        description: 'Product category classification',
        businessMeaning: 'Groups products for navigation, filtering, and analysis',
        isKey: false,
        isForeignKey: false,
        sampleValues: [
          {
            value: 'electronics',
            meaning: 'Electronic devices and gadgets (phones, laptops, tablets)',
            frequency: 2341,
            category: 'Hardware',
          },
          {
            value: 'clothing',
            meaning: 'Apparel and accessories (shirts, pants, shoes)',
            frequency: 3456,
            category: 'Apparel',
          },
          {
            value: 'home_goods',
            meaning: 'Household items and furniture (chairs, lamps, decor)',
            frequency: 1876,
            category: 'Home',
          },
          {
            value: 'books',
            meaning: 'Physical and digital books across all genres',
            frequency: 1261,
            category: 'Media',
          },
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function Step6ContextReview() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'tables' | 'columns' | 'values'>('tables');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContext, setEditContext] = useState<{
    type: 'table' | 'column' | 'value';
    target: string;
    currentContext: string;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const filteredTables = MOCK_TABLE_CONTEXTS.filter(
    (table) =>
      table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditContext = (type: 'table' | 'column' | 'value', target: string, currentContext: string) => {
    setEditContext({ type, target, currentContext });
    setChatMessages([
      {
        role: 'assistant',
        content: `I'll help you refine the context for **${target}**. The current context is:\n\n"${currentContext}"\n\nWhat changes would you like to make?`,
      },
    ]);
    setEditDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsAiTyping(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiResponse = `I understand. I'll update the ${editContext?.type} context to: "${userMessage}". This provides better clarity and aligns with your business terminology. Would you like me to apply this change?`;

    setChatMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsAiTyping(false);
  };

  const handleApplyChange = () => {
    toast.success('Context updated successfully');
    setEditDialogOpen(false);
    setChatMessages([]);
    setEditContext(null);
  };

  const handleNext = () => {
    navigate('/agents/create/step-8'); // Fixed: Navigate to step-8 (Review & Publish)
  };

  const handleBack = () => {
    navigate('/agents/create/step-6');
  };

  return (
    <WizardLayout
      currentStep={7}
      totalSteps={8}
      title="New Context Agent"
    >
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Header with Search and View Toggle */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                placeholder="Search tables, columns, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="px-3 py-1.5">
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              {MOCK_TABLE_CONTEXTS.length} Tables
            </Badge>
          </div>

          {/* View Toggle */}
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tables" className="gap-2">
                <Database className="w-4 h-4" />
                Tables
              </TabsTrigger>
              <TabsTrigger value="columns" className="gap-2">
                <Columns3 className="w-4 h-4" />
                Columns
              </TabsTrigger>
              <TabsTrigger value="values" className="gap-2">
                <Tag className="w-4 h-4" />
                Values
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <AnimatePresence mode="wait">
            {/* Tables View */}
            {activeView === 'tables' && (
              <motion.div
                key="tables"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {filteredTables.map((table) => (
                  <Card key={table.tableName} className="p-4 hover:border-[#00B5B3] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Table className="w-4 h-4 text-[#00B5B3] flex-shrink-0" />
                          <h3 className="font-medium text-[#111827]">
                            {table.schemaName}.{table.tableName}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {table.recordCount.toLocaleString()} rows
                          </Badge>
                        </div>

                        <div className="space-y-3 mt-3">
                          {/* Business Context */}
                          <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <p className="text-xs text-[#6B7280]">Business Context</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[#00B5B3] hover:text-[#00B5B3] hover:bg-[#E0F7F7]"
                                onClick={() =>
                                  handleEditContext('table', table.tableName, table.businessPurpose)
                                }
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                            <p className="text-sm text-[#374151]">{table.businessPurpose}</p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            setSelectedTable(table.tableName);
                            setActiveView('columns');
                          }}
                        >
                          View {table.columns.length} Columns
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}

            {/* Columns View */}
            {activeView === 'columns' && (
              <motion.div
                key="columns"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Table Selector */}
                {!selectedTable && (
                  <Card className="p-4 bg-[#F9FAFB] border-[#E5E7EB]">
                    <p className="text-sm text-[#6B7280] mb-3">Select a table to view its columns:</p>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_TABLE_CONTEXTS.map((table) => (
                        <Button
                          key={table.tableName}
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTable(table.tableName)}
                          className="hover:border-[#00B5B3] hover:text-[#00B5B3]"
                        >
                          {table.tableName}
                        </Button>
                      ))}
                    </div>
                  </Card>
                )}

                {selectedTable && (
                  <>
                    {/* Back to Tables */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTable(null)}
                      className="mb-2"
                    >
                      ← Back to all tables
                    </Button>

                    {MOCK_TABLE_CONTEXTS.find((t) => t.tableName === selectedTable)?.columns.map(
                      (column) => (
                        <Card
                          key={column.columnName}
                          className="p-4 hover:border-[#00B5B3] transition-colors"
                        >
                          <div className="space-y-3">
                            {/* Column Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Columns3 className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                                <h4 className="font-medium text-[#111827]">{column.columnName}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {column.dataType}
                                </Badge>
                                {column.isKey && (
                                  <Badge className="text-xs bg-[#FFD700] hover:bg-[#FFD700] text-[#333]">
                                    PK
                                  </Badge>
                                )}
                                {column.isForeignKey && (
                                  <Badge className="text-xs bg-[#00B5B3] hover:bg-[#00B5B3]">FK</Badge>
                                )}
                              </div>
                            </div>

                            {/* Business Context */}
                            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <p className="text-xs text-[#6B7280]">Business Context</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[#00B5B3] hover:text-[#00B5B3] hover:bg-[#E0F7F7]"
                                  onClick={() =>
                                    handleEditContext(
                                      'column',
                                      column.columnName,
                                      column.businessMeaning
                                    )
                                  }
                                >
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                              <p className="text-sm text-[#374151]">{column.businessMeaning}</p>
                            </div>

                            {/* Relationships */}
                            {column.relationships && column.relationships.length > 0 && (
                              <div className="p-3 bg-[#FFF9E6] rounded-lg border border-[#FFE8A3]">
                                <p className="text-xs text-[#B8860B] mb-1.5">Relationships</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {column.relationships.map((rel, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {rel}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Value Context Preview */}
                            {column.sampleValues.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedColumn(column.columnName);
                                  setActiveView('values');
                                }}
                              >
                                View {column.sampleValues.length} Value Contexts
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            )}
                          </div>
                        </Card>
                      )
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Values View */}
            {activeView === 'values' && (
              <motion.div
                key="values"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Column Selector */}
                {!selectedColumn && (
                  <Card className="p-4 bg-[#F9FAFB] border-[#E5E7EB]">
                    <p className="text-sm text-[#6B7280] mb-3">
                      Select a column to view value-level context:
                    </p>
                    <div className="space-y-4">
                      {MOCK_TABLE_CONTEXTS.map((table) => (
                        <div key={table.tableName}>
                          <p className="text-xs font-medium text-[#111827] mb-2">{table.tableName}</p>
                          <div className="flex flex-wrap gap-2">
                            {table.columns
                              .filter((col) => col.sampleValues.length > 0)
                              .map((column) => (
                                <Button
                                  key={column.columnName}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTable(table.tableName);
                                    setSelectedColumn(column.columnName);
                                  }}
                                  className="hover:border-[#00B5B3] hover:text-[#00B5B3]"
                                >
                                  {column.columnName}
                                  <Badge variant="outline" className="ml-2 text-[10px]">
                                    {column.sampleValues.length}
                                  </Badge>
                                </Button>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {selectedColumn && selectedTable && (
                  <>
                    {/* Back Navigation */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedColumn(null)}
                      >
                        ← Back to columns
                      </Button>
                      <Badge variant="outline">
                        {selectedTable}.{selectedColumn}
                      </Badge>
                    </div>

                    {MOCK_TABLE_CONTEXTS.find((t) => t.tableName === selectedTable)
                      ?.columns.find((c) => c.columnName === selectedColumn)
                      ?.sampleValues.map((value, idx) => (
                        <Card
                          key={idx}
                          className="p-4 hover:border-[#00B5B3] transition-colors"
                        >
                          <div className="space-y-3">
                            {/* Value Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                                <code className="font-mono text-sm text-[#111827] bg-[#F3F4F6] px-2 py-1 rounded">
                                  {value.value}
                                </code>
                                {value.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {value.category}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs text-[#6B7280]">
                                  {value.frequency.toLocaleString()} records
                                </Badge>
                              </div>
                            </div>

                            {/* Value Meaning */}
                            <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <p className="text-xs text-[#6B7280]">Business Meaning</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[#00B5B3] hover:text-[#00B5B3] hover:bg-[#E0F7F7]"
                                  onClick={() =>
                                    handleEditContext('value', value.value, value.meaning)
                                  }
                                >
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                              <p className="text-sm text-[#374151]">{value.meaning}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-[#EEEEEE] mt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1.5">
              <Brain className="w-3.5 h-3.5 mr-1.5 text-[#00B5B3]" />
              AI-Generated Context
            </Badge>
            <Button onClick={handleNext} className="bg-[#00B5B3] hover:bg-[#009996]">
              Continue to Review
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Context Dialog with Chat */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#00B5B3]" />
              Refine Context with AI
            </DialogTitle>
            <DialogDescription>
              Chat with AI to refine the context for{' '}
              <span className="font-medium text-[#111827]">{editContext?.target}</span>
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6 py-4">
            <div className="space-y-4">
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-[#00B5B3] text-white'
                        : 'bg-[#F3F4F6] text-[#374151]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#F3F4F6] rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00B5B3]" />
                      <span className="text-sm text-[#6B7280]">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-[#E5E7EB] pt-4 mt-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Describe the changes you'd like to make..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isAiTyping}
                className="bg-[#00B5B3] hover:bg-[#009996]"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setChatMessages([]);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyChange}
                disabled={chatMessages.length < 2}
                className="flex-1 bg-[#00B5B3] hover:bg-[#009996]"
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </WizardLayout>
  );
}