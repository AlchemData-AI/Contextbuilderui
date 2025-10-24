import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { StatusBadge } from '../components/StatusBadge';
import { mockAgents, owners, categories, statuses, type Agent } from '../lib/mockData';

export function AgentsDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter logic
  const filteredAgents = useMemo(() => {
    return mockAgents.filter((agent) => {
      const matchesSearch =
        searchQuery === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOwner = ownerFilter === 'all' || agent.owner === ownerFilter;
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || agent.category === categoryFilter;

      return matchesSearch && matchesOwner && matchesStatus && matchesCategory;
    });
  }, [searchQuery, ownerFilter, statusFilter, categoryFilter]);

  const handleCreateAgent = () => {
    navigate('/agents/create/step-1');
  };

  const handleAgentClick = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  const handleAction = (action: string, agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Action: ${action}`, agent);
    // TODO: Implement actions
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-semibold text-[#333333] mb-1">Agents Dashboard</h1>
            <p className="text-[14px] text-[#666666]">
              Manage your Context Agents for the AI Data Scientist
            </p>
          </div>
          <Button
            onClick={handleCreateAgent}
            className="bg-[#00B5B3] hover:bg-[#009999] text-white px-4 py-2 rounded h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Agent
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-[#DDDDDD] focus:border-[#00B5B3] focus:ring-2 focus:ring-[#00B5B3]/20"
            />
          </div>

          {/* Owner Filter */}
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[200px] h-9 border-[#DDDDDD]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#666666]" />
                <SelectValue placeholder="Owner" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {owners.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner.split('@')[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9 border-[#DDDDDD]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#666666]" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-9 border-[#DDDDDD]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#666666]" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-[#FAFBFC] px-8 py-6">
        <div className="bg-white rounded-md border border-[#EEEEEE] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#DDDDDD]">
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Agent Name
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Owner
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Category
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Last Updated
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Version
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#666666]">
                    No agents found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
                    className="border-b border-[#EEEEEE] hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div>
                        <div className="text-[14px] font-medium text-[#00B5B3] hover:underline">
                          {agent.name}
                        </div>
                        {agent.description && (
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-[12px] text-[#999999] mt-0.5 truncate max-w-md cursor-default">
                                  {agent.description}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" align="start" className="max-w-sm">
                                <p className="text-[12px]">{agent.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[14px] text-[#4A4A4A]">
                      {agent.owner.split('@')[0]}
                    </td>
                    <td className="px-6 py-3.5 text-[14px] text-[#4A4A4A]">{agent.category}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={agent.status} />
                    </td>
                    <td className="px-6 py-3.5 text-[14px] text-[#4A4A4A]">
                      {new Date(agent.lastUpdated).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-3.5 text-[14px] text-[#666666] font-mono">{agent.version}</td>
                    <td className="px-6 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-[#E0F7F7] rounded transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-[#666666]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => handleAction('view', agent, e as any)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleAction('clone', agent, e as any)}>
                            Clone Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleAction('publish', agent, e as any)}>
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => handleAction('archive', agent, e as any)}>
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleAction('delete', agent, e as any)}
                            className="text-[#F44336]"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-[12px] text-[#666666]">
          Showing {filteredAgents.length} of {mockAgents.length} agents
        </div>
      </div>
    </div>
  );
}
