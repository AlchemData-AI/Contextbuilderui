import { useState, useMemo } from 'react';
import { useNotebookStore } from '../lib/notebookStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2,
  Filter,
  Copy,
  Download,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { NotebookEditor } from '../components/NotebookEditor';
import { Badge } from '../components/ui/badge';

export default function SQLWorkbench() {
  const { notebooks, activeNotebookId, createNotebook, deleteNotebook, setActiveNotebook } = useNotebookStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newNotebookDescription, setNewNotebookDescription] = useState('');

  const activeNotebook = notebooks.find((nb) => nb.id === activeNotebookId);

  // Get unique creators for filter
  const creators = useMemo(() => {
    const uniqueCreators = Array.from(new Set(notebooks.map((nb) => nb.createdBy)));
    return uniqueCreators.sort();
  }, [notebooks]);

  // Filter logic
  const filteredNotebooks = useMemo(() => {
    return notebooks.filter((nb) => {
      const matchesSearch =
        searchQuery === '' ||
        nb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nb.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCreator = createdByFilter === 'all' || nb.createdBy === createdByFilter;

      return matchesSearch && matchesCreator;
    });
  }, [notebooks, searchQuery, createdByFilter]);

  const handleCreateNotebook = () => {
    if (!newNotebookName.trim()) return;
    
    createNotebook(newNotebookName, newNotebookDescription || undefined);
    setShowCreateDialog(false);
    setNewNotebookName('');
    setNewNotebookDescription('');
  };

  const handleDeleteNotebook = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this notebook?')) {
      deleteNotebook(id);
    }
  };

  const handleAction = (action: string, notebookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Action: ${action}`, notebookId);
    
    if (action === 'delete') {
      handleDeleteNotebook(notebookId, e);
    }
    // TODO: Implement other actions
  };

  // Show notebook editor if one is active
  if (activeNotebook) {
    return <NotebookEditor notebook={activeNotebook} onClose={() => setActiveNotebook(null)} />;
  }

  // Show notebooks list
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-semibold text-[#333333] mb-1">SQL Workbench</h1>
            <p className="text-[14px] text-[#666666]">
              Create and manage SQL notebooks for data analysis
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#00B5B3] hover:bg-[#009999] text-white px-4 py-2 rounded h-9"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Notebook
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <Input
              type="text"
              placeholder="Search notebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-[#DDDDDD] focus:border-[#00B5B3] focus:ring-2 focus:ring-[#00B5B3]/20"
            />
          </div>

          {/* Creator Filter */}
          <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
            <SelectTrigger className="w-[200px] h-9 border-[#DDDDDD]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#666666]" />
                <SelectValue placeholder="Created By" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creators</SelectItem>
              {creators.map((creator) => (
                <SelectItem key={creator} value={creator}>
                  {creator}
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
                  Notebook Name
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Created By
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Cells
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Last Updated
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Created
                </th>
                <th className="text-left px-6 py-3 text-[12px] font-semibold text-[#666666] uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredNotebooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#666666]">
                    {searchQuery || createdByFilter !== 'all' 
                      ? 'No notebooks found matching your filters.' 
                      : 'No notebooks yet. Create your first notebook to get started.'}
                  </td>
                </tr>
              ) : (
                filteredNotebooks.map((notebook) => (
                  <tr
                    key={notebook.id}
                    onClick={() => setActiveNotebook(notebook.id)}
                    className="border-b border-[#EEEEEE] hover:bg-[#F8F9FA] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div>
                        <div className="text-[14px] font-medium text-[#00B5B3] hover:underline">
                          {notebook.name}
                        </div>
                        {notebook.description && (
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-[12px] text-[#999999] mt-0.5 truncate max-w-md cursor-default">
                                  {notebook.description}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" align="start" className="max-w-sm">
                                <p className="text-[12px]">{notebook.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[14px] text-[#4A4A4A]">
                      {notebook.createdBy}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="secondary" className="bg-[#F3F4F6] text-[#6B7280] border-0">
                        {notebook.cells.length} {notebook.cells.length === 1 ? 'cell' : 'cells'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-[14px] text-[#4A4A4A]">
                      {new Date(notebook.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-3.5 text-[14px] text-[#4A4A4A]">
                      {new Date(notebook.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
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
                          <DropdownMenuItem onClick={(e) => handleAction('open', notebook.id, e as any)}>
                            Open Notebook
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleAction('duplicate', notebook.id, e as any)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleAction('export', notebook.id, e as any)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => handleAction('delete', notebook.id, e as any)}
                            className="text-[#F44336]"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
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
          Showing {filteredNotebooks.length} of {notebooks.length} notebooks
        </div>
      </div>

      {/* Create Notebook Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
            <DialogDescription>
              Create a new SQL notebook to write and execute queries
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Notebook Name</Label>
              <Input
                id="name"
                placeholder="e.g., Sales Analysis Q4 2024"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNotebook()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this notebook for?"
                value={newNotebookDescription}
                onChange={(e) => setNewNotebookDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewNotebookName('');
                setNewNotebookDescription('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNotebook}
              disabled={!newNotebookName.trim()}
              className="bg-[#00B5B3] hover:bg-[#009996] text-white"
            >
              Create Notebook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
