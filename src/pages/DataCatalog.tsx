import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Database,
  FolderOpen,
  Table as TableIcon,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  Calendar,
  Hash,
  type LucideIcon,
} from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

interface CatalogTable {
  id: string;
  name: string;
  schema: string;
  catalog: string;
  description?: string;
  rowCount: number;
  createdAt: Date;
  columns: Column[];
  sampleData?: any[];
}

interface Schema {
  id: string;
  name: string;
  catalog: string;
  tables: CatalogTable[];
}

interface Catalog {
  id: string;
  name: string;
  description?: string;
  schemas: Schema[];
}

// Mock data
const mockCatalogs: Catalog[] = [
  {
    id: 'cat-1',
    name: 'production',
    description: 'Production database catalog',
    schemas: [
      {
        id: 'schema-1',
        name: 'sales',
        catalog: 'production',
        tables: [
          {
            id: 'table-1',
            name: 'orders',
            schema: 'sales',
            catalog: 'production',
            description: 'Customer orders and transactions',
            rowCount: 125430,
            createdAt: new Date('2024-01-15'),
            columns: [
              { name: 'order_id', type: 'BIGINT', nullable: false, description: 'Unique order identifier' },
              { name: 'customer_id', type: 'BIGINT', nullable: false, description: 'Customer reference' },
              { name: 'order_date', type: 'TIMESTAMP', nullable: false, description: 'Order creation timestamp' },
              { name: 'total_amount', type: 'DECIMAL(10,2)', nullable: false, description: 'Order total in USD' },
              { name: 'status', type: 'VARCHAR(50)', nullable: false, description: 'Order status' },
            ],
            sampleData: [
              { order_id: 1001, customer_id: 501, order_date: '2024-10-28 10:30:00', total_amount: 249.99, status: 'completed' },
              { order_id: 1002, customer_id: 502, order_date: '2024-10-28 11:15:00', total_amount: 149.50, status: 'processing' },
              { order_id: 1003, customer_id: 503, order_date: '2024-10-28 12:00:00', total_amount: 399.00, status: 'shipped' },
            ],
          },
          {
            id: 'table-2',
            name: 'customers',
            schema: 'sales',
            catalog: 'production',
            description: 'Customer master data',
            rowCount: 45230,
            createdAt: new Date('2024-01-15'),
            columns: [
              { name: 'customer_id', type: 'BIGINT', nullable: false },
              { name: 'email', type: 'VARCHAR(255)', nullable: false },
              { name: 'name', type: 'VARCHAR(255)', nullable: false },
              { name: 'created_at', type: 'TIMESTAMP', nullable: false },
              { name: 'country', type: 'VARCHAR(100)', nullable: true },
            ],
          },
          {
            id: 'table-3',
            name: 'products',
            schema: 'sales',
            catalog: 'production',
            rowCount: 3420,
            createdAt: new Date('2024-01-20'),
            columns: [
              { name: 'product_id', type: 'BIGINT', nullable: false },
              { name: 'name', type: 'VARCHAR(255)', nullable: false },
              { name: 'price', type: 'DECIMAL(10,2)', nullable: false },
              { name: 'category', type: 'VARCHAR(100)', nullable: true },
            ],
          },
        ],
      },
      {
        id: 'schema-2',
        name: 'analytics',
        catalog: 'production',
        tables: [
          {
            id: 'table-4',
            name: 'daily_metrics',
            schema: 'analytics',
            catalog: 'production',
            description: 'Daily aggregated business metrics',
            rowCount: 1250,
            createdAt: new Date('2024-02-01'),
            columns: [
              { name: 'date', type: 'DATE', nullable: false },
              { name: 'revenue', type: 'DECIMAL(12,2)', nullable: false },
              { name: 'orders_count', type: 'INTEGER', nullable: false },
              { name: 'new_customers', type: 'INTEGER', nullable: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cat-2',
    name: 'staging',
    description: 'Staging environment catalog',
    schemas: [
      {
        id: 'schema-3',
        name: 'raw',
        catalog: 'staging',
        tables: [
          {
            id: 'table-5',
            name: 'import_logs',
            schema: 'raw',
            catalog: 'staging',
            rowCount: 8930,
            createdAt: new Date('2024-03-01'),
            columns: [
              { name: 'log_id', type: 'BIGINT', nullable: false },
              { name: 'timestamp', type: 'TIMESTAMP', nullable: false },
              { name: 'status', type: 'VARCHAR(50)', nullable: false },
              { name: 'records_processed', type: 'INTEGER', nullable: true },
            ],
          },
        ],
      },
    ],
  },
];

export default function DataCatalog() {
  const [catalogs] = useState<Catalog[]>(mockCatalogs);
  const [expandedCatalogs, setExpandedCatalogs] = useState<Set<string>>(new Set(['cat-1']));
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set(['schema-1']));
  const [selectedTable, setSelectedTable] = useState<CatalogTable | null>(mockCatalogs[0].schemas[0].tables[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCatalogName, setNewCatalogName] = useState('');
  const [newCatalogDescription, setNewCatalogDescription] = useState('');

  const toggleCatalog = (catalogId: string) => {
    setExpandedCatalogs((prev) => {
      const next = new Set(prev);
      if (next.has(catalogId)) {
        next.delete(catalogId);
      } else {
        next.add(catalogId);
      }
      return next;
    });
  };

  const toggleSchema = (schemaId: string) => {
    setExpandedSchemas((prev) => {
      const next = new Set(prev);
      if (next.has(schemaId)) {
        next.delete(schemaId);
      } else {
        next.add(schemaId);
      }
      return next;
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Left Sidebar - Catalog Tree */}
      <div className="w-80 border-r border-[#F0F0F0] flex flex-col bg-[#FAFBFC]">
        <div className="border-b border-[#F0F0F0] p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[#00B5B3]" />
              <h2 className="font-medium text-[#1A1A1A]">Data Catalog</h2>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#00B5B3] hover:bg-[#009996] text-white h-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {catalogs.map((catalog) => (
              <div key={catalog.id} className="mb-2">
                <CatalogTreeItem
                  icon={Database}
                  label={catalog.name}
                  isExpanded={expandedCatalogs.has(catalog.id)}
                  onToggle={() => toggleCatalog(catalog.id)}
                  description={catalog.description}
                />
                
                {expandedCatalogs.has(catalog.id) && (
                  <div className="ml-6">
                    {catalog.schemas.map((schema) => (
                      <div key={schema.id}>
                        <CatalogTreeItem
                          icon={FolderOpen}
                          label={schema.name}
                          isExpanded={expandedSchemas.has(schema.id)}
                          onToggle={() => toggleSchema(schema.id)}
                          level={1}
                        />
                        
                        {expandedSchemas.has(schema.id) && (
                          <div className="ml-6">
                            {schema.tables.map((table) => (
                              <CatalogTreeItem
                                key={table.id}
                                icon={TableIcon}
                                label={table.name}
                                isSelected={selectedTable?.id === table.id}
                                onClick={() => setSelectedTable(table)}
                                level={2}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content - Table Details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedTable ? (
          <>
            {/* Header */}
            <div className="border-b border-[#F0F0F0] px-10 py-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedTable.catalog}
                    </Badge>
                    <ChevronRight className="w-3 h-3 text-[#999999]" />
                    <Badge variant="outline" className="text-xs">
                      {selectedTable.schema}
                    </Badge>
                  </div>
                  <h1 className="text-[#1A1A1A] mb-3">{selectedTable.name}</h1>
                  {selectedTable.description && (
                    <p className="text-sm text-[#666666] leading-relaxed">{selectedTable.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-[#666666]">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span>{formatNumber(selectedTable.rowCount)} rows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(selectedTable.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="schema" className="h-full flex flex-col">
                <div className="border-b border-[#F0F0F0] px-10">
                  <TabsList className="bg-transparent">
                    <TabsTrigger value="schema">Schema</TabsTrigger>
                    <TabsTrigger value="sample">Sample Data</TabsTrigger>
                    <TabsTrigger value="info">Table Info</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="schema" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-10">
                        <div className="border border-[#F0F0F0] rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="bg-[#FAFBFC] w-[30%] h-12">Column Name</TableHead>
                                <TableHead className="bg-[#FAFBFC] w-[20%] h-12">Data Type</TableHead>
                                <TableHead className="bg-[#FAFBFC] w-[15%] h-12">Nullable</TableHead>
                                <TableHead className="bg-[#FAFBFC] h-12">Description</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedTable.columns.map((column) => (
                                <TableRow key={column.name}>
                                  <TableCell className="font-mono text-sm py-4">{column.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="secondary" className="text-xs">
                                      {column.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {column.nullable ? (
                                      <span className="text-[#999999]">Yes</span>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">
                                        NOT NULL
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-[#666666]">
                                    {column.description || '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="sample" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-10">
                        {selectedTable.sampleData && selectedTable.sampleData.length > 0 ? (
                          <div className="border border-[#F0F0F0] rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {selectedTable.columns.map((col) => (
                                    <TableHead key={col.name} className="bg-[#FAFAFA]">
                                      {col.name}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedTable.sampleData.map((row, idx) => (
                                  <TableRow key={idx}>
                                    {selectedTable.columns.map((col) => (
                                      <TableCell key={col.name} className="font-mono text-sm">
                                        {String(row[col.name] ?? '-')}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-16">
                            <FileText className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
                            <p className="text-sm text-[#999999]">
                              No sample data available for this table
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="info" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-10">
                        <div className="space-y-8 max-w-2xl">
                          <div>
                            <label className="text-sm text-[#666666]">Full Name</label>
                            <p className="text-sm font-mono text-[#333333] mt-1">
                              {selectedTable.catalog}.{selectedTable.schema}.{selectedTable.name}
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm text-[#666666]">Row Count</label>
                            <p className="text-sm text-[#333333] mt-1">
                              {formatNumber(selectedTable.rowCount)} rows
                            </p>
                          </div>

                          <div>
                            <label className="text-sm text-[#666666]">Column Count</label>
                            <p className="text-sm text-[#333333] mt-1">
                              {selectedTable.columns.length} columns
                            </p>
                          </div>

                          <div>
                            <label className="text-sm text-[#666666]">Created Date</label>
                            <p className="text-sm text-[#333333] mt-1">
                              {formatDate(selectedTable.createdAt)}
                            </p>
                          </div>

                          {selectedTable.description && (
                            <div>
                              <label className="text-sm text-[#666666]">Description</label>
                              <p className="text-sm text-[#333333] mt-1">
                                {selectedTable.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Database className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
              <h3 className="text-[#666666] mb-2">No table selected</h3>
              <p className="text-sm text-[#999999]">
                Select a table from the catalog tree to view details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Catalog Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Catalog</DialogTitle>
            <DialogDescription>
              Add a new catalog to organize your data tables
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="catalog-name">Catalog Name</Label>
              <Input
                id="catalog-name"
                placeholder="e.g., production"
                value={newCatalogName}
                onChange={(e) => setNewCatalogName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="catalog-description">Description (optional)</Label>
              <Textarea
                id="catalog-description"
                placeholder="What is this catalog for?"
                value={newCatalogDescription}
                onChange={(e) => setNewCatalogDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newCatalogName.trim()}
              className="bg-[#00B5B3] hover:bg-[#009996] text-white"
            >
              Create Catalog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CatalogTreeItemProps {
  icon: LucideIcon;
  label: string;
  isExpanded?: boolean;
  isSelected?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  description?: string;
  level?: number;
}

function CatalogTreeItem({
  icon: Icon,
  label,
  isExpanded,
  isSelected,
  onToggle,
  onClick,
  description,
  level = 0,
}: CatalogTreeItemProps) {
  const hasChildren = onToggle !== undefined;

  return (
    <button
      onClick={onClick || onToggle}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left
        transition-colors group
        ${isSelected 
          ? 'bg-[#E6F7F7] text-[#00B5B3]' 
          : 'text-[#666666] hover:bg-[#F0F0F0]'
        }
      `}
    >
      {hasChildren && (
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      )}
      {!hasChildren && <div className="w-4" />}
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm truncate">{label}</span>
    </button>
  );
}
