import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Search, Database, ChevronRight, Sparkles, Info, FileStack, GitBranch, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockAgents } from '../../lib/mockData';

interface Table {
  id: string;
  name: string;
  schema: string;
  recordCount: number;
  description: string;
  suggested?: boolean;
  hasContext?: boolean; // Whether this table has existing context
  contextAgents?: string[]; // Agent IDs that use this table
}

interface TableContextChoice {
  tableId: string;
  choice: 'readonly' | 'edit'; // readonly = use for relationships only, edit = extend context
}

// Helper to check if table has existing context
const getTableContext = (tableName: string, schema: string) => {
  const fullTableName = `${schema}.${tableName}`;
  const agentsUsingTable = mockAgents.filter(
    (agent) => agent.tables?.includes(fullTableName) && agent.status === 'published'
  );
  return {
    hasContext: agentsUsingTable.length > 0,
    agents: agentsUsingTable,
  };
};

const MOCK_SUGGESTED_TABLES: Table[] = [
  {
    id: '1',
    name: 'orders',
    schema: 'ecommerce',
    recordCount: 1250000,
    description: 'Customer order transactions with order details, dates, and totals',
    suggested: true,
    ...(() => {
      const context = getTableContext('orders', 'ecommerce');
      return {
        hasContext: context.hasContext,
        contextAgents: context.agents.map((a) => a.id),
      };
    })(),
  },
  {
    id: '2',
    name: 'order_items',
    schema: 'ecommerce',
    recordCount: 3800000,
    description: 'Individual line items for each order including product, quantity, and price',
    suggested: true,
    ...(() => {
      const context = getTableContext('order_items', 'ecommerce');
      return {
        hasContext: context.hasContext,
        contextAgents: context.agents.map((a) => a.id),
      };
    })(),
  },
  {
    id: '3',
    name: 'customers',
    schema: 'ecommerce',
    recordCount: 450000,
    description: 'Customer profile information including contact details and registration date',
    suggested: true,
    ...(() => {
      const context = getTableContext('customers', 'ecommerce');
      return {
        hasContext: context.hasContext,
        contextAgents: context.agents.map((a) => a.id),
      };
    })(),
  },
  {
    id: '4',
    name: 'products',
    schema: 'ecommerce',
    recordCount: 25000,
    description: 'Product catalog with SKU, name, category, and pricing information',
    suggested: true,
    ...(() => {
      const context = getTableContext('products', 'ecommerce');
      return {
        hasContext: context.hasContext,
        contextAgents: context.agents.map((a) => a.id),
      };
    })(),
  },
  {
    id: '5',
    name: 'inventory',
    schema: 'warehouse',
    recordCount: 85000,
    description: 'Real-time inventory levels across warehouses and distribution centers',
    suggested: true,
    ...(() => {
      const context = getTableContext('inventory', 'warehouse');
      return {
        hasContext: context.hasContext,
        contextAgents: context.agents.map((a) => a.id),
      };
    })(),
  },
  {
    id: '6',
    name: 'shipments',
    schema: 'logistics',
    recordCount: 920000,
    description: 'Shipping records with carrier info, tracking, and delivery dates',
    suggested: true,
    ...(() => {
      const context = getTableContext('shipments', 'logistics');
      return {
        hasContext: context.hasContext,
        contextAgents: context.agents.map((a) => a.id),
      };
    })(),
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
  const { agentId } = useParams();
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit/');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [agentGoal, setAgentGoal] = useState('');
  const [showAgentSuggestion, setShowAgentSuggestion] = useState(false);
  const [showTables, setShowTables] = useState(isEditMode); // Show tables immediately in edit mode
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [contextDialogTable, setContextDialogTable] = useState<Table | null>(null);
  const [tableContextChoices, setTableContextChoices] = useState<Map<string, TableContextChoice>>(new Map());
  const [agentCreationType, setAgentCreationType] = useState<'extend' | 'new' | null>(null);
  const [suggestedAgent, setSuggestedAgent] = useState<any>(null);
  
  // Pre-fill data in edit mode
  useEffect(() => {
    if (isEditMode && agentId) {
      // In a real app, load agent data from backend
      // For now, use mock data
      const mockSelectedTableIds = new Set(['1', '2', '3', '4', '5', '6']); // Pre-select the 6 tables
      setSelectedTables(mockSelectedTableIds);
      setAgentGoal('Analyze sales performance, inventory trends, and customer behavior');
    }
  }, [isEditMode, agentId]);

  const handleGenerateSuggestions = () => {
    if (!agentGoal.trim()) {
      toast.error('Please describe what you want to analyze');
      return;
    }
    
    // Find matching agents based on description
    const contextLower = agentGoal.toLowerCase();
    const matchingAgents = mockAgents.filter((agent) => {
      const descLower = (agent.description || '').toLowerCase();
      const categoryLower = agent.category.toLowerCase();
      const contextDescLower = (agent.contextDescription || '').toLowerCase();
      
      const keywords = contextLower.match(/\b\w{4,}\b/g) || [];
      return keywords.some((keyword) => 
        descLower.includes(keyword) || 
        categoryLower.includes(keyword) ||
        contextDescLower.includes(keyword)
      ) && agent.status === 'published';
    });
    
    if (matchingAgents.length > 0) {
      // Found a match - show agent suggestion FIRST
      setSuggestedAgent(matchingAgents[0]);
      setShowAgentSuggestion(true);
      setShowTables(false);
      toast.success('Found a similar existing agent');
    } else {
      // No match - go straight to tables
      setSuggestedAgent(null);
      setShowAgentSuggestion(false);
      setShowTables(true);
      toast.success('AI suggested tables based on your goal');
    }
  };

  const handleBuildOnExisting = () => {
    if (suggestedAgent) {
      // Navigate to agent extension page
      navigate(`/agents/${suggestedAgent.id}/extend`);
    }
  };

  const handleCreateNew = () => {
    setAgentCreationType('new');
    setShowAgentSuggestion(false);
    setShowTables(true);
    toast.success('Creating new standalone agent');
  };

  const toggleTable = (tableId: string) => {
    const table = MOCK_ALL_TABLES.find((t) => t.id === tableId);
    
    // If table has existing context and is being selected, show dialog
    if (table && table.hasContext && !selectedTables.has(tableId)) {
      setContextDialogTable(table);
      setContextDialogOpen(true);
      return;
    }
    
    // Otherwise toggle normally
    const newSelected = new Set(selectedTables);
    if (newSelected.has(tableId)) {
      newSelected.delete(tableId);
      // Remove context choice when deselecting
      const newChoices = new Map(tableContextChoices);
      newChoices.delete(tableId);
      setTableContextChoices(newChoices);
    } else {
      newSelected.add(tableId);
    }
    setSelectedTables(newSelected);
  };

  const handleContextChoice = (choice: 'readonly' | 'edit') => {
    if (!contextDialogTable) return;
    
    // Add table to selected
    const newSelected = new Set(selectedTables);
    newSelected.add(contextDialogTable.id);
    setSelectedTables(newSelected);
    
    // Save context choice
    const newChoices = new Map(tableContextChoices);
    newChoices.set(contextDialogTable.id, {
      tableId: contextDialogTable.id,
      choice,
    });
    setTableContextChoices(newChoices);
    
    // Close dialog
    setContextDialogOpen(false);
    
    if (choice === 'readonly') {
      toast.success(`${contextDialogTable.schema}.${contextDialogTable.name} added (using existing context)`);
    } else {
      toast.success(`${contextDialogTable.schema}.${contextDialogTable.name} added (will extend context)`);
    }
  };

  const handleContinue = () => {
    if (selectedTables.size === 0) {
      toast.error('Please select at least one table');
      return;
    }
    
    // Save table selections and context choices
    const tableContextChoicesObj = Object.fromEntries(tableContextChoices);
    localStorage.setItem('wizardData', JSON.stringify({ 
      selectedTables: Array.from(selectedTables),
      tableContextChoices: tableContextChoicesObj,
      agentCreationType: 'new', // Always new since extension goes to different page
      isEditMode,
      agentId,
    }));
    
    const nextPath = isEditMode 
      ? `/agents/${agentId}/edit/step-2`
      : '/agents/create/step-2';
    
    toast.success(`${selectedTables.size} tables selected`);
    navigate(nextPath);
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
      title={isEditMode ? "Edit Agent - Select Tables" : "Select Tables"}
      onBack={() => navigate(isEditMode ? `/agents/${agentId}` : '/')}
      onSaveDraft={() => {
        localStorage.setItem('wizardDraft', JSON.stringify({ step: 1, selectedTables: Array.from(selectedTables) }));
        toast.success('Draft saved');
      }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Edit Mode Banner */}
        {isEditMode && (
          <Card className="p-4 border-2 border-[#F79009] bg-[#FFF9F0]">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-[#F79009]" />
              <div className="flex-1">
                <h3 className="font-semibold text-[#333333] text-sm">Editing: Sales Analytics Agent</h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  You're editing an existing agent. Make your changes and we'll highlight what's different in the review step.
                </p>
              </div>
            </div>
          </Card>
        )}
        
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

        {/* Agent Suggestion - Shows FIRST if match found */}
        {showAgentSuggestion && suggestedAgent && (
          <Card className="p-5 border-2 border-[#FF9500] bg-[#FFF8F0]">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#FF9500]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#333333] mb-1">
                  Found a Similar Existing Agent
                </h3>
                <p className="text-sm text-[#666666]">
                  We found an agent that matches your description. Choose how you want to proceed.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option 1: Build on Existing */}
              <div
                className="border-2 rounded-lg p-3 cursor-pointer transition-all border-[#EEEEEE] bg-white hover:border-[#00B5B3]"
                onClick={handleBuildOnExisting}
              >
                <div className="flex items-start gap-3">
                  <GitBranch className="w-5 h-5 text-[#00B5B3] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#333333] text-sm">Build on Existing Agent</span>
                      <Badge variant="outline" className="text-xs bg-[#E0F7F7] text-[#00B5B3] border-[#00B5B3]">
                        Recommended
                      </Badge>
                    </div>
                    <p className="text-xs text-[#666666] mb-2">
                      Extend this agent by adding new tables and context.
                    </p>
                    <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded p-2.5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-[#333333] text-sm">{suggestedAgent.name}</p>
                          <p className="text-xs text-[#666666] mt-0.5">{suggestedAgent.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {suggestedAgent.category}
                        </Badge>
                      </div>
                      {suggestedAgent.tables && suggestedAgent.tables.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#DDDDDD]">
                          <p className="text-xs text-[#999999] mb-1">
                            Tables ({suggestedAgent.tables.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {suggestedAgent.tables.slice(0, 3).map((table: string) => (
                              <span key={table} className="text-xs px-1.5 py-0.5 bg-white border border-[#DDDDDD] rounded text-[#666666]">
                                {table}
                              </span>
                            ))}
                            {suggestedAgent.tables.length > 3 && (
                              <span className="text-xs px-1.5 py-0.5 text-[#999999]">
                                +{suggestedAgent.tables.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 2: Create New */}
              <div
                className="border-2 rounded-lg p-3 cursor-pointer transition-all border-[#EEEEEE] bg-white hover:border-[#00B5B3]"
                onClick={handleCreateNew}
              >
                <div className="flex items-start gap-3">
                  <Plus className="w-5 h-5 text-[#666666] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#333333] text-sm">Create New Standalone Agent</p>
                    <p className="text-xs text-[#666666] mt-1">
                      Start fresh and select tables without inheriting context.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* AI Suggested Tables - Only show after choice or if no agent match */}
        {showTables && (
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Database className="w-4 h-4 text-[#666666] flex-shrink-0" />
                        <span className="font-medium text-[#333333]">{table.schema}.{table.name}</span>
                        {table.hasContext && (
                          <Badge variant="outline" className="text-xs bg-[#FFF4E6] text-[#FF9500] border-[#FF9500]">
                            <FileStack className="w-3 h-3 mr-1" />
                            Has Context
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#666666] mb-2">{table.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#999999]">
                          {table.recordCount.toLocaleString()} records
                        </p>
                        {table.hasContext && (
                          <p className="text-xs text-[#FF9500]">
                            Used by {table.contextAgents?.length || 0} agent{table.contextAgents?.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search All Tables - Only show when tables are shown */}
        {showTables && (
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

        {/* Table Context Choice Dialog */}
        <Dialog open={contextDialogOpen} onOpenChange={setContextDialogOpen}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Table Already Has Context</DialogTitle>
              <DialogDescription>
                Choose how you want to use this table.
              </DialogDescription>
            </DialogHeader>

            {contextDialogTable && (
              <div className="overflow-y-auto pr-2 space-y-4">
                {/* Table Info - Compact */}
                <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="w-4 h-4 text-[#666666]" />
                    <span className="font-semibold text-[#333333]">
                      {contextDialogTable.schema}.{contextDialogTable.name}
                    </span>
                  </div>
                  <p className="text-xs text-[#999999]">
                    Used by {contextDialogTable.contextAgents?.length || 0} agent{contextDialogTable.contextAgents?.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Choice Options - Simplified */}
                <div className="space-y-3">
                  {/* Option 1: Use Existing Context */}
                  <div
                    className="border-2 border-[#EEEEEE] rounded-lg p-3 hover:border-[#00B5B3] transition-colors cursor-pointer"
                    onClick={() => handleContextChoice('readonly')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-[#CCCCCC] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-[#333333]">
                          Use Existing Context
                        </p>
                        <p className="text-xs text-[#666666] mt-1">
                          Use for relationships only, without modifying the existing context.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Edit Context */}
                  <div
                    className="border-2 border-[#EEEEEE] rounded-lg p-3 hover:border-[#00B5B3] transition-colors cursor-pointer"
                    onClick={() => handleContextChoice('edit')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-[#CCCCCC] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-[#333333]">
                          Edit Existing Context
                        </p>
                        <p className="text-xs text-[#666666] mt-1">
                          Add new definitions or modify context for this agent.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </WizardLayout>
  );
}
