import { useState, useRef, useEffect } from 'react';
import { Notebook, NotebookCell, useNotebookStore } from '../lib/notebookStore';
import { useSidebar } from './ChatLayout';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import {
  ChevronLeft,
  Play,
  Plus,
  Trash2,
  Download,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Sparkles,
  Send,
  Code,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Maximize2,
  Hash,
  X,
  Command,
  ChevronRight,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { NotebookRightSidebar } from './NotebookRightSidebar';

interface NotebookEditorProps {
  notebook: Notebook;
  onClose: () => void;
}

export function NotebookEditor({ notebook, onClose }: NotebookEditorProps) {
  const { updateNotebook, addCell, updateCell, deleteCell, executeCell, moveCellUp, moveCellDown } = useNotebookStore();
  const { setIsCollapsed } = useSidebar();
  const [isEditing, setIsEditing] = useState(false);
  const [notebookName, setNotebookName] = useState(notebook.name);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [cellAiInputs, setCellAiInputs] = useState<Record<string, string>>({});
  const [cellAiProcessing, setCellAiProcessing] = useState<Record<string, boolean>>({});
  const [logsExpanded, setLogsExpanded] = useState<Record<string, boolean>>({});
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Collapse sidebar when notebook opens, expand when it closes
  useEffect(() => {
    setIsCollapsed(true);
    return () => {
      setIsCollapsed(false);
    };
  }, [setIsCollapsed]);

  const handleSaveName = () => {
    if (notebookName.trim()) {
      updateNotebook(notebook.id, { name: notebookName });
      setIsEditing(false);
    }
  };

  const handleAddCell = () => {
    addCell(notebook.id, 'sql');
  };

  const handleExecuteCell = async (cellId: string) => {
    await executeCell(notebook.id, cellId);
  };

  const handleExportResults = (cell: NotebookCell) => {
    if (!cell.results) return;

    const csv = [
      cell.results.columns.join(','),
      ...cell.results.rows.map((row) =>
        cell.results!.columns.map((col) => row[col]).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCellAiSubmit = async (cellId: string) => {
    const input = cellAiInputs[cellId];
    if (!input?.trim() || cellAiProcessing[cellId]) return;

    setCellAiProcessing((prev) => ({ ...prev, [cellId]: true }));

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const generatedCode = `SELECT \n  product_name,\n  SUM(quantity) as total_sold,\n  SUM(revenue) as total_revenue\nFROM sales\nWHERE date >= CURRENT_DATE - INTERVAL '30 days'\nGROUP BY product_name\nORDER BY total_revenue DESC\nLIMIT 10;`;

    updateCell(notebook.id, cellId, { content: generatedCode });
    setCellAiInputs((prev) => ({ ...prev, [cellId]: '' }));
    setCellAiProcessing((prev) => ({ ...prev, [cellId]: false }));
  };

  const handleInsertCode = (code: string) => {
    if (selectedCellId) {
      updateCell(notebook.id, selectedCellId, { content: code });
    } else {
      const newCellId = addCell(notebook.id, 'sql');
      updateCell(notebook.id, newCellId, { content: code });
    }
  };

  return (
    <div className="h-screen flex bg-[#F9FAFB]">
      {/* Main Editor Area */}
      <div className="flex flex-col overflow-hidden flex-1">
        {/* Notebook Header */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 hover:bg-[#F3F4F6]"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {isEditing ? (
                <Input
                  value={notebookName}
                  onChange={(e) => setNotebookName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="max-w-md border-[#D1D5DB] h-8"
                  autoFocus
                />
              ) : (
                <h2
                  onClick={() => setIsEditing(true)}
                  className="text-[#111827] cursor-pointer hover:text-[#00B5B3] transition-colors"
                >
                  {notebook.name}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className={`h-8 border-[#D1D5DB] ${rightSidebarOpen ? "border-[#00B5B3] text-[#00B5B3] bg-[#E6F7F7]" : ""}`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Assistant
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                onClick={handleAddCell}
                className="h-8 border-[#D1D5DB]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Cell
              </Button>
            </div>
          </div>
        </div>

        {/* Cells - with proper scrolling and spacing */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            <div className="space-y-4">
              {notebook.cells.length === 0 ? (
                <div className="text-center py-24 text-[#6B7280]">
                  <Code className="w-16 h-16 mx-auto mb-6 opacity-40" />
                  <p className="text-lg mb-4">No cells yet</p>
                  <p className="text-sm">Add a SQL cell to get started</p>
                </div>
              ) : (
                notebook.cells.map((cell, index) => (
                  <div
                    key={cell.id}
                    className={`bg-white border rounded-lg transition-all ${
                      selectedCellId === cell.id 
                        ? 'border-[#00B5B3] shadow-md' 
                        : 'border-[#E5E7EB] shadow-sm hover:shadow-md'
                    }`}
                    onClick={() => setSelectedCellId(cell.id)}
                  >
                    {/* Cell Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        {/* Play Button */}
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteCell(cell.id);
                          }}
                          disabled={cell.status === 'running' || !cell.content}
                          className="h-7 px-3 bg-[#00B5B3] hover:bg-[#009999] text-white"
                        >
                          {cell.status === 'running' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        
                        {/* Cell Number */}
                        <div className="flex items-center gap-1.5 px-2">
                          <Hash className="w-3.5 h-3.5 text-[#9CA3AF]" />
                          <span className="text-sm text-[#6B7280]">{index + 1}</span>
                        </div>
                        
                        {/* Language Badge */}
                        <Badge variant="secondary" className="bg-[#F3F4F6] text-[#374151] border-0 h-6">
                          SQL
                        </Badge>
                        
                        {/* Status Badge */}
                        {cell.status === 'success' && (
                          <Badge variant="secondary" className="bg-[#D1FAE5] text-[#065F46] border-0 h-6">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Success
                          </Badge>
                        )}
                        {cell.status === 'error' && (
                          <Badge variant="secondary" className="bg-[#FEE2E2] text-[#991B1B] border-0 h-6">
                            <XCircle className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-[#F3F4F6]"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCell(notebook.id, cell.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#6B7280]" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-[#F3F4F6]"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle focus mode
                          }}
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-[#6B7280]" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-[#F3F4F6]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-3.5 h-3.5 text-[#6B7280]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                moveCellUp(notebook.id, cell.id);
                              }}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Move Up
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                moveCellDown(notebook.id, cell.id);
                              }}
                              disabled={index === notebook.cells.length - 1}
                            >
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Move Down
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportResults(cell);
                              }}
                              disabled={!cell.results}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export Results
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* AI Assistant Input Box - Databricks Style */}
                    <div className="px-4 pt-4">
                      <div 
                        className="relative rounded-md border-2 bg-white"
                        style={{
                          borderImage: 'linear-gradient(90deg, #00B5B3 0%, #0891B2 50%, #06B6D4 100%) 1',
                        }}
                      >
                        <div className="flex items-center gap-2 px-3 py-2">
                          <Sparkles className="w-4 h-4 text-[#00B5B3] flex-shrink-0" />
                          <Input
                            value={cellAiInputs[cell.id] || ''}
                            onChange={(e) => setCellAiInputs((prev) => ({ ...prev, [cell.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault();
                                handleCellAiSubmit(cell.id);
                              }
                              e.stopPropagation();
                            }}
                            placeholder="@ for objects or / for commands, ⌘ for history"
                            className="border-0 shadow-none focus-visible:ring-0 h-7 text-sm placeholder:text-[#9CA3AF] bg-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {cellAiInputs[cell.id] && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCellAiInputs((prev) => ({ ...prev, [cell.id]: '' }));
                                }}
                                className="h-7 px-2 text-xs text-[#6B7280] hover:bg-[#F3F4F6]"
                              >
                                Cancel <kbd className="ml-1 text-xs">ESC</kbd>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCellAiSubmit(cell.id);
                              }}
                              disabled={!cellAiInputs[cell.id]?.trim() || cellAiProcessing[cell.id]}
                              className="h-7 px-3 text-xs bg-[#00B5B3] hover:bg-[#009999] disabled:opacity-40"
                            >
                              {cellAiProcessing[cell.id] ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>Generate <kbd className="ml-1">↵</kbd></>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Code Editor */}
                    <div className="px-4 pt-3 pb-2">
                      <Textarea
                        value={cell.content}
                        onChange={(e) => updateCell(notebook.id, cell.id, { content: e.target.value })}
                        placeholder="-- Enter SQL query here"
                        className="font-mono text-sm min-h-[100px] resize-y bg-transparent border-0 focus:ring-0 focus:outline-none rounded-none shadow-none p-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Keyboard Hint */}
                    <div className="px-4 pb-3">
                      <p className="text-xs text-[#9CA3AF]">
                        <kbd className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-xs">Shift</kbd>
                        {' + '}
                        <kbd className="px-1.5 py-0.5 bg-[#F3F4F6] rounded text-xs">Enter</kbd>
                        {' to run cell'}
                      </p>
                    </div>

                    {/* Run Logs Section */}
                    {cell.logs && cell.logs.length > 0 && (
                      <div className="border-t border-[#E5E7EB]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogsExpanded((prev) => ({ ...prev, [cell.id]: !prev[cell.id] }));
                          }}
                          className="w-full px-4 py-2 bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors flex items-center justify-between border-b border-[#E5E7EB]"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-[#6B7280] transition-transform ${
                                logsExpanded[cell.id] ? 'rotate-90' : ''
                              }`}
                            />
                            <span className="text-sm text-[#374151]">Run Logs</span>
                            <Badge variant="secondary" className="bg-[#E5E7EB] text-[#374151] border-0 h-5 text-xs">
                              {cell.logs.length} events
                            </Badge>
                          </div>
                          {cell.executionTime && (
                            <span className="text-xs text-[#6B7280] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {cell.executionTime}s
                            </span>
                          )}
                        </button>

                        {logsExpanded[cell.id] && (
                          <div className="px-4 py-3 bg-[#FAFBFC] max-h-64 overflow-y-auto">
                            <div className="space-y-1.5 font-mono text-xs">
                              {cell.logs.map((log, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 py-1"
                                >
                                  {log.level === 'info' && (
                                    <Info className="w-3.5 h-3.5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                                  )}
                                  {log.level === 'success' && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5" />
                                  )}
                                  {log.level === 'warning' && (
                                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                                  )}
                                  {log.level === 'error' && (
                                    <AlertCircle className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-[#9CA3AF] text-xs">
                                        {new Date(log.timestamp).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit',
                                          hour12: false,
                                        })}
                                      </span>
                                      <span
                                        className={`text-xs ${
                                          log.level === 'success'
                                            ? 'text-[#059669]'
                                            : log.level === 'error'
                                            ? 'text-[#DC2626]'
                                            : log.level === 'warning'
                                            ? 'text-[#D97706]'
                                            : 'text-[#374151]'
                                        }`}
                                      >
                                        {log.message}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Results Section */}
                    {cell.results && (
                      <div className="border-t border-[#E5E7EB]">
                        {/* Results Header */}
                        <div className="px-4 py-2 bg-[#F9FAFB] flex items-center justify-between border-b border-[#E5E7EB]">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-[#6B7280]">
                              {cell.results.rows.length} rows
                            </span>
                            {cell.executionTime && (
                              <>
                                <span className="text-[#D1D5DB]">|</span>
                                <span className="text-sm text-[#6B7280] flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {cell.executionTime}s
                                </span>
                              </>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportResults(cell);
                            }}
                            className="h-7 text-[#6B7280] hover:text-[#00B5B3] hover:bg-[#F3F4F6]"
                          >
                            <Download className="w-3.5 h-3.5 mr-2" />
                            Export
                          </Button>
                        </div>

                        {/* Results Table */}
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                                {cell.results.columns.map((column) => (
                                  <TableHead
                                    key={column}
                                    className="text-[#374151] font-medium border-b border-[#E5E7EB] h-8"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {column}
                                      <ArrowUpDown className="w-3 h-3 text-[#9CA3AF]" />
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cell.results.rows.map((row, rowIndex) => (
                                <TableRow
                                  key={rowIndex}
                                  className="hover:bg-[#F9FAFB] border-b border-[#E5E7EB]"
                                >
                                  {cell.results!.columns.map((column) => (
                                    <TableCell
                                      key={`${rowIndex}-${column}`}
                                      className="text-[#1F2937] py-1.5 px-4 text-sm"
                                    >
                                      {row[column]}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {cell.error && (
                      <div className="px-4 py-3 bg-[#FEF2F2] border-t border-[#FEE2E2]">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-[#991B1B] mb-1">Error</p>
                            <p className="text-xs text-[#DC2626] font-mono">{cell.error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Assistant & Catalog */}
      <NotebookRightSidebar
        isOpen={rightSidebarOpen}
        onClose={() => setRightSidebarOpen(false)}
        onInsertCode={handleInsertCode}
      />
    </div>
  );
}
