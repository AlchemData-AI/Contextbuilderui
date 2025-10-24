import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Card } from '../../components/ui/card';
import { Search, Database, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Table {
  id: string;
  name: string;
  schema: string;
  recordCount: number;
  description: string;
  suggested?: boolean;
}

const MOCK_SUGGESTED_TABLES: Table[] = [
  {
    id: '1',
    name: 'orders',
    schema: 'ecommerce',
    recordCount: 1250000,
    description: 'Customer order transactions with order details, dates, and totals',
    suggested: true,
  },
  {
    id: '2',
    name: 'order_items',
    schema: 'ecommerce',
    recordCount: 3800000,
    description: 'Individual line items for each order including product, quantity, and price',
    suggested: true,
  },
  {
    id: '3',
    name: 'customers',
    schema: 'ecommerce',
    recordCount: 450000,
    description: 'Customer profile information including contact details and registration date',
    suggested: true,
  },
  {
    id: '4',
    name: 'products',
    schema: 'ecommerce',
    recordCount: 25000,
    description: 'Product catalog with SKU, name, category, and pricing information',
    suggested: true,
  },
  {
    id: '5',
    name: 'inventory',
    schema: 'warehouse',
    recordCount: 85000,
    description: 'Real-time inventory levels across warehouses and distribution centers',
    suggested: true,
  },
  {
    id: '6',
    name: 'shipments',
    schema: 'logistics',
    recordCount: 920000,
    description: 'Shipping records with carrier info, tracking, and delivery dates',
    suggested: true,
  },
];

const MOCK_ALL_TABLES: Table[] = [
  ...MOCK_SUGGESTED_TABLES,
  {
    id: '7',
    name: 'returns',
    schema: 'ecommerce',
    recordCount: 45000,
    description: 'Product return and refund transactions',
  },
  {
    id: '8',
    name: 'payments',
    schema: 'finance',
    recordCount: 1300000,
    description: 'Payment processing records and transaction details',
  },
  {
    id: '9',
    name: 'warehouses',
    schema: 'warehouse',
    recordCount: 25,
    description: 'Warehouse locations and facility information',
  },
  {
    id: '10',
    name: 'suppliers',
    schema: 'procurement',
    recordCount: 350,
    description: 'Supplier and vendor contact and contract information',
  },
];

export function Step1SelectTables() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [agentGoal, setAgentGoal] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [manualSearchQuery, setManualSearchQuery] = useState('');

  const handleGenerateSuggestions = () => {
    if (!agentGoal.trim()) {
      toast.error('Please describe what you want to analyze');
      return;
    }
    setShowSuggestions(true);
    toast.success('AI suggested tables based on your goal');
  };

  const toggleTable = (tableId: string) => {
    const newSelected = new Set(selectedTables);
    if (newSelected.has(tableId)) {
      newSelected.delete(tableId);
    } else {
      newSelected.add(tableId);
    }
    setSelectedTables(newSelected);
  };

  const handleContinue = () => {
    if (selectedTables.size === 0) {
      toast.error('Please select at least one table');
      return;
    }
    localStorage.setItem('wizardData', JSON.stringify({ selectedTables: Array.from(selectedTables) }));
    toast.success(`${selectedTables.size} tables selected`);
    navigate('/agents/create/step-2');
  };

  const filteredManualTables = MOCK_ALL_TABLES.filter(
    (table) =>
      !table.suggested &&
      (table.name.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
        table.schema.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
        table.description.toLowerCase().includes(manualSearchQuery.toLowerCase()))
  );

  return (
    <WizardLayout
      currentStep={1}
      totalSteps={6}
      title="Select Tables"
      onBack={() => navigate('/')}
      onSaveDraft={() => {
        localStorage.setItem('wizardDraft', JSON.stringify({ step: 1, selectedTables: Array.from(selectedTables) }));
        toast.success('Draft saved');
      }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search Intent */}
        <Card className="p-6 border-2 border-[#00B5B3] bg-[#F0FFFE]">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#00B5B3]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#333333] mb-2">What do you want to analyze?</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Describe your analysis goal and we'll suggest the most relevant tables from your data warehouse.
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      placeholder="e.g., Analyze sales performance and inventory trends across regions"
                      value={agentGoal}
                      onChange={(e) => setAgentGoal(e.target.value)}
                      className="h-12 pl-4 pr-4 bg-white border-2 border-[#DDDDDD] focus:border-[#00B5B3] transition-colors text-[15px]"
                    />
                  </div>
                  <Button onClick={handleGenerateSuggestions} className="bg-[#00B5B3] hover:bg-[#009996] h-11">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Table Suggestions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Suggested Tables */}
        {showSuggestions && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-[#333333] mb-1">Suggested Tables</h3>
              <p className="text-sm text-[#666666]">Select the tables you want to include in your analysis</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {MOCK_SUGGESTED_TABLES.map((table) => (
                <Card
                  key={table.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTables.has(table.id)
                      ? 'border-2 border-[#00B5B3] bg-[#F0FFFE] shadow-sm'
                      : 'border-2 border-[#EEEEEE] hover:border-[#CCCCCC]'
                  }`}
                  onClick={() => toggleTable(table.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedTables.has(table.id)}
                      onCheckedChange={() => toggleTable(table.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="w-4 h-4 text-[#666666] flex-shrink-0" />
                        <span className="font-medium text-[#333333]">{table.schema}.{table.name}</span>
                      </div>
                      <p className="text-sm text-[#666666] mb-2">{table.description}</p>
                      <p className="text-xs text-[#999999]">
                        {table.recordCount.toLocaleString()} records
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search All Tables - Always Visible */}
        {showSuggestions && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#EEEEEE]" />
              <span className="text-sm text-[#666666]">or search all tables</span>
              <div className="h-px flex-1 bg-[#EEEEEE]" />
            </div>

            <Card className="p-4 border-2 border-[#EEEEEE]">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                <Input
                  placeholder="Search by table name, schema, or description..."
                  value={manualSearchQuery}
                  onChange={(e) => setManualSearchQuery(e.target.value)}
                  className="h-11 pl-10 bg-white border-2 border-[#DDDDDD] focus:border-[#00B5B3] transition-colors text-[15px]"
                />
              </div>

              {manualSearchQuery && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredManualTables.length > 0 ? (
                    filteredManualTables.map((table) => (
                      <div
                        key={table.id}
                        className={`p-3 rounded border-2 cursor-pointer transition-all ${
                          selectedTables.has(table.id)
                            ? 'border-[#00B5B3] bg-[#F0FFFE]'
                            : 'border-[#EEEEEE] hover:border-[#CCCCCC]'
                        }`}
                        onClick={() => toggleTable(table.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedTables.has(table.id)}
                            onCheckedChange={() => toggleTable(table.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-[#666666]" />
                              <span className="font-medium text-[#333333]">{table.schema}.{table.name}</span>
                              <span className="text-xs text-[#999999]">
                                ({table.recordCount.toLocaleString()} records)
                              </span>
                            </div>
                            <p className="text-sm text-[#666666] mt-1">{table.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#666666] text-center py-8">No tables found</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Selected Tables Summary */}
        {selectedTables.size > 0 && (
          <Card className="p-6 bg-[#F0FFFE] border-2 border-[#00B5B3]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#333333] mb-1">
                  {selectedTables.size} Table{selectedTables.size !== 1 ? 's' : ''} Selected
                </h3>
                <p className="text-sm text-[#666666]">
                  {Array.from(selectedTables)
                    .map((id) => {
                      const table = MOCK_ALL_TABLES.find((t) => t.id === id);
                      return table ? `${table.schema}.${table.name}` : '';
                    })
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
              <Button onClick={handleContinue} className="bg-[#00B5B3] hover:bg-[#009996] h-11">
                Continue to Persona Definition
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </WizardLayout>
  );
}
