import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { 
  ChevronRight, 
  Lock, 
  Plus, 
  Database, 
  GitBranch,
  Network,
  Sparkles,
  ArrowRight,
  Search
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockAgents } from '../lib/mockData';

// Mock additional tables that could be added
const AVAILABLE_ADDITIONAL_TABLES = [
  {
    id: '4',
    name: 'products',
    schema: 'ecommerce',
    recordCount: 25000,
    description: 'Product catalog with SKU, name, category, and pricing information',
  },
  {
    id: '6',
    name: 'returns',
    schema: 'ecommerce',
    recordCount: 45000,
    description: 'Product returns and refund transactions',
  },
  {
    id: '7',
    name: 'shopping_sessions',
    schema: 'ecommerce',
    recordCount: 890000,
    description: 'User browsing sessions and cart activity',
  },
  {
    id: '8',
    name: 'product_reviews',
    schema: 'ecommerce',
    recordCount: 125000,
    description: 'Customer product ratings and reviews',
  },
];

export function AgentExtension() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const baseAgent = mockAgents.find((a) => a.id === id);
  const [selectedAdditionalTables, setSelectedAdditionalTables] = useState<Set<string>>(new Set());
  const [newAgentName, setNewAgentName] = useState(`${baseAgent?.name} Extended`);
  const [newAgentDescription, setNewAgentDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!baseAgent) {
    return (
      <Layout>
        <div className="p-8">
          <p className="text-[#666666]">Agent not found</p>
        </div>
      </Layout>
    );
  }

  const toggleTable = (tableId: string) => {
    const newSelection = new Set(selectedAdditionalTables);
    if (newSelection.has(tableId)) {
      newSelection.delete(tableId);
    } else {
      newSelection.add(tableId);
    }
    setSelectedAdditionalTables(newSelection);
  };

  const handleCreateExtendedAgent = () => {
    if (!newAgentName.trim()) {
      toast.error('Please provide a name for the extended agent');
      return;
    }

    if (selectedAdditionalTables.size === 0) {
      toast.error('Please select at least one additional table');
      return;
    }

    // Save extended agent data (in real app, would create new agent)
    const extendedAgentData = {
      baseAgentId: baseAgent.id,
      baseAgentName: baseAgent.name,
      name: newAgentName,
      description: newAgentDescription,
      additionalTables: Array.from(selectedAdditionalTables),
    };

    localStorage.setItem('extendedAgentDraft', JSON.stringify(extendedAgentData));
    toast.success('Extended agent created as draft');
    
    // Navigate to agent creation wizard Step 2
    navigate('/agents/create/step-2');
  };

  const filteredTables = AVAILABLE_ADDITIONAL_TABLES.filter((table) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      table.name.toLowerCase().includes(query) ||
      table.schema.toLowerCase().includes(query) ||
      table.description.toLowerCase().includes(query)
    );
  });

  return (
    <Layout>
      <div className="bg-[#F8F9FA]">
        {/* Header */}
        <div className="bg-white border-b border-[#EEEEEE]">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center gap-2 text-sm text-[#666666] mb-3">
              <Link to="/agents" className="hover:text-[#00B5B3]">Agents</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/agents/${baseAgent.id}`} className="hover:text-[#00B5B3]">{baseAgent.name}</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#333333]">Extend</span>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <GitBranch className="w-6 h-6 text-[#00B5B3]" />
                  <h1 className="text-[#333333]">Create Extended Agent</h1>
                </div>
                <p className="text-[#666666]">
                  Build on top of <span className="font-medium text-[#333333]">{baseAgent.name}</span> by adding new tables and context
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Inherited Context (Read-Only) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-[#999999]" />
                <h2 className="font-semibold text-[#333333]">Inherited from Base Agent</h2>
                <Badge variant="outline" className="text-xs bg-[#F8F9FA] text-[#666666] border-[#DDDDDD]">
                  Read-Only
                </Badge>
              </div>

              {/* Base Agent Info */}
              <Card className="p-5 bg-[#F8F9FA] border-2 border-[#DDDDDD]">
                <div className="space-y-4">
                  {/* Agent Details */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[#333333]">{baseAgent.name}</h3>
                      <Badge variant="outline">{baseAgent.category}</Badge>
                    </div>
                    <p className="text-sm text-[#666666]">{baseAgent.description}</p>
                  </div>

                  {/* Tables */}
                  {baseAgent.tables && baseAgent.tables.length > 0 && (
                    <div className="pt-4 border-t border-[#DDDDDD]">
                      <div className="flex items-center gap-2 mb-3">
                        <Database className="w-4 h-4 text-[#666666]" />
                        <h4 className="font-medium text-[#333333]">Tables ({baseAgent.tables.length})</h4>
                      </div>
                      <div className="space-y-2">
                        {baseAgent.tables.map((table) => (
                          <div key={table} className="bg-white border border-[#EEEEEE] rounded p-2.5 flex items-center gap-2">
                            <Database className="w-3.5 h-3.5 text-[#999999]" />
                            <span className="text-sm text-[#666666]">{table}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Context Description */}
                  {baseAgent.contextDescription && (
                    <div className="pt-4 border-t border-[#DDDDDD]">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#666666]" />
                        <h4 className="font-medium text-[#333333]">Context</h4>
                      </div>
                      <p className="text-sm text-[#666666]">{baseAgent.contextDescription}</p>
                    </div>
                  )}

                  {/* Relationships */}
                  <div className="pt-4 border-t border-[#DDDDDD]">
                    <div className="flex items-center gap-2 mb-2">
                      <Network className="w-4 h-4 text-[#666666]" />
                      <h4 className="font-medium text-[#333333]">Relationships</h4>
                    </div>
                    <p className="text-xs text-[#999999]">
                      All existing table relationships will be inherited
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: New Additions (Editable) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-4 h-4 text-[#00B5B3]" />
                <h2 className="font-semibold text-[#333333]">New Additions</h2>
              </div>

              {/* Agent Name & Description */}
              <Card className="p-5 border-2 border-[#00B5B3]">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#333333] mb-2 block">
                      Extended Agent Name *
                    </label>
                    <Input
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      placeholder="e.g., Sales Analytics Extended"
                      className="border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#333333] mb-2 block">
                      Description
                    </label>
                    <Textarea
                      value={newAgentDescription}
                      onChange={(e) => setNewAgentDescription(e.target.value)}
                      placeholder="Describe what additional insights this extended agent provides..."
                      rows={3}
                      className="resize-none border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
                    />
                  </div>
                </div>
              </Card>

              {/* Additional Tables */}
              <Card className="p-5 border-2 border-[#00B5B3]">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-[#333333] mb-1">Select Additional Tables *</h3>
                    <p className="text-sm text-[#666666] mb-3">
                      Choose tables to add to the extended agent
                    </p>

                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                      <Input
                        placeholder="Search tables..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-10 border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
                      />
                    </div>
                  </div>

                  {/* Table List */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {filteredTables.map((table) => (
                      <div
                        key={table.id}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                          selectedAdditionalTables.has(table.id)
                            ? 'border-[#00B5B3] bg-[#F0FFFE]'
                            : 'border-[#EEEEEE] hover:border-[#CCCCCC]'
                        }`}
                        onClick={() => toggleTable(table.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedAdditionalTables.has(table.id)}
                            onCheckedChange={() => toggleTable(table.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Database className="w-3.5 h-3.5 text-[#666666] flex-shrink-0" />
                              <span className="font-medium text-[#333333] text-sm">
                                {table.schema}.{table.name}
                              </span>
                            </div>
                            <p className="text-xs text-[#666666] mb-1">{table.description}</p>
                            <p className="text-xs text-[#999999]">
                              {table.recordCount.toLocaleString()} records
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedAdditionalTables.size > 0 && (
                    <div className="pt-3 border-t border-[#EEEEEE]">
                      <p className="text-sm text-[#00B5B3]">
                        ✓ {selectedAdditionalTables.size} additional table{selectedAdditionalTables.size !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Info Box */}
              <Card className="p-4 bg-[#E6F7F4] border border-[#00B98E]">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-[#00B98E] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#333333] mb-1 font-medium">
                      What happens next?
                    </p>
                    <ul className="text-xs text-[#666666] space-y-1">
                      <li>• Relationships will be auto-detected between new and existing tables</li>
                      <li>• You'll define context for the new tables in the wizard</li>
                      <li>• All base agent context and queries remain intact</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#EEEEEE]">
            <Button 
              variant="outline" 
              onClick={() => navigate('/agents')}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateExtendedAgent}
              disabled={!newAgentName.trim() || selectedAdditionalTables.size === 0}
              className="bg-[#00B5B3] hover:bg-[#009996]"
            >
              Create Extended Agent
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
