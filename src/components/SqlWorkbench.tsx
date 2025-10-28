import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Play, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SqlWorkbenchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSql?: string;
  title?: string;
  description?: string;
  onSave?: (sql: string) => void;
  readOnly?: boolean;
}

// Mock data generator for different table patterns
const generateMockResults = (sql: string) => {
  const lowerSql = sql.toLowerCase();
  
  // Detect what kind of query this is
  if (lowerSql.includes('customer')) {
    return {
      columns: ['customer_id', 'name', 'email', 'total_orders', 'lifetime_value'],
      rows: [
        ['C001', 'John Smith', 'john.smith@email.com', '12', '$2,450.00'],
        ['C002', 'Sarah Johnson', 'sarah.j@email.com', '8', '$1,890.50'],
        ['C003', 'Michael Chen', 'mchen@email.com', '15', '$3,200.75'],
        ['C004', 'Emma Williams', 'emma.w@email.com', '5', '$890.00'],
        ['C005', 'David Brown', 'david.b@email.com', '20', '$4,100.25'],
      ],
    };
  } else if (lowerSql.includes('order')) {
    return {
      columns: ['order_id', 'customer_id', 'order_date', 'status', 'total_amount'],
      rows: [
        ['ORD-1001', 'C001', '2025-10-25', 'Delivered', '$125.50'],
        ['ORD-1002', 'C003', '2025-10-24', 'Processing', '$289.99'],
        ['ORD-1003', 'C002', '2025-10-23', 'Shipped', '$456.00'],
        ['ORD-1004', 'C005', '2025-10-22', 'Delivered', '$78.25'],
        ['ORD-1005', 'C001', '2025-10-21', 'Delivered', '$199.99'],
      ],
    };
  } else if (lowerSql.includes('product')) {
    return {
      columns: ['product_id', 'name', 'category', 'price', 'stock_level', 'sales_last_30d'],
      rows: [
        ['P001', 'Wireless Mouse', 'Electronics', '$29.99', '145', '67'],
        ['P002', 'USB-C Cable', 'Accessories', '$12.99', '423', '156'],
        ['P003', 'Laptop Stand', 'Office', '$49.99', '78', '34'],
        ['P004', 'Keyboard', 'Electronics', '$79.99', '92', '45'],
        ['P005', 'Monitor', 'Electronics', '$299.99', '34', '12'],
      ],
    };
  } else if (lowerSql.includes('inventory') || lowerSql.includes('stock')) {
    return {
      columns: ['sku', 'product_name', 'warehouse', 'quantity', 'reorder_point', 'status'],
      rows: [
        ['SKU-001', 'Wireless Mouse', 'WH-East', '145', '50', 'In Stock'],
        ['SKU-002', 'USB-C Cable', 'WH-West', '423', '100', 'In Stock'],
        ['SKU-003', 'Laptop Stand', 'WH-East', '78', '30', 'In Stock'],
        ['SKU-004', 'Keyboard', 'WH-Central', '92', '40', 'In Stock'],
        ['SKU-005', 'Monitor', 'WH-West', '34', '20', 'In Stock'],
      ],
    };
  } else if (lowerSql.includes('shipment') || lowerSql.includes('delivery')) {
    return {
      columns: ['shipment_id', 'order_id', 'carrier', 'status', 'ship_date', 'est_delivery'],
      rows: [
        ['SHP-5001', 'ORD-1001', 'FedEx', 'Delivered', '2025-10-23', '2025-10-25'],
        ['SHP-5002', 'ORD-1002', 'UPS', 'In Transit', '2025-10-24', '2025-10-27'],
        ['SHP-5003', 'ORD-1003', 'USPS', 'In Transit', '2025-10-23', '2025-10-26'],
        ['SHP-5004', 'ORD-1004', 'FedEx', 'Delivered', '2025-10-22', '2025-10-24'],
        ['SHP-5005', 'ORD-1005', 'UPS', 'Delivered', '2025-10-21', '2025-10-23'],
      ],
    };
  } else if (lowerSql.includes('revenue') || lowerSql.includes('sum') || lowerSql.includes('count') || lowerSql.includes('avg')) {
    // Aggregate query
    return {
      columns: ['metric', 'value'],
      rows: [
        ['Total Revenue', '$1,245,890.50'],
        ['Total Orders', '3,456'],
        ['Avg Order Value', '$360.45'],
        ['Total Customers', '892'],
        ['Active Customers (30d)', '567'],
      ],
    };
  } else {
    // Generic result
    return {
      columns: ['id', 'value', 'status', 'created_at'],
      rows: [
        ['1', 'Sample Data 1', 'Active', '2025-10-25'],
        ['2', 'Sample Data 2', 'Active', '2025-10-24'],
        ['3', 'Sample Data 3', 'Pending', '2025-10-23'],
        ['4', 'Sample Data 4', 'Active', '2025-10-22'],
        ['5', 'Sample Data 5', 'Active', '2025-10-21'],
      ],
    };
  }
};

export function SqlWorkbench({
  open,
  onOpenChange,
  initialSql = '',
  title = 'SQL Workbench',
  description = 'Edit and test your SQL query with sample data',
  onSave,
  readOnly = false,
}: SqlWorkbenchProps) {
  const [sql, setSql] = useState(initialSql);
  const [isRunning, setIsRunning] = useState(false);
  const [queryResults, setQueryResults] = useState<{ columns: string[]; rows: string[][] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setQueryResults(null);

    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic SQL validation
    const trimmedSql = sql.trim();
    if (!trimmedSql) {
      setError('Please enter a SQL query');
      setIsRunning(false);
      return;
    }

    // Check for SELECT statement (basic validation)
    if (!trimmedSql.toLowerCase().startsWith('select')) {
      setError('Only SELECT queries are supported in the workbench');
      setIsRunning(false);
      return;
    }

    // Generate mock results
    const results = generateMockResults(sql);
    setQueryResults(results);
    setIsRunning(false);
    toast.success('Query executed successfully');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    toast.success('SQL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(sql);
      toast.success('SQL query saved');
      onOpenChange(false);
    }
  };

  // Update local state when initialSql changes
  useState(() => {
    setSql(initialSql);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* SQL Editor */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#666666]">SQL Query</label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-7 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handleRun}
                  disabled={isRunning || readOnly}
                  className="h-7 bg-[#00B5B3] hover:bg-[#009996] text-white"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      Run Query
                    </>
                  )}
                </Button>
              </div>
            </div>
            <Textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="font-mono text-xs min-h-[200px] resize-none"
              placeholder="SELECT * FROM table_name WHERE ..."
              readOnly={readOnly}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Query Results */}
          {queryResults && (
            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#666666]">
                  Results ({queryResults.rows.length} rows)
                </label>
                <p className="text-xs text-[#999999]">Showing sample data</p>
              </div>
              <ScrollArea className="flex-1 border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {queryResults.columns.map((col, idx) => (
                        <TableHead key={idx} className="text-xs font-semibold whitespace-nowrap">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryResults.rows.map((row, rowIdx) => (
                      <TableRow key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <TableCell key={cellIdx} className="text-xs whitespace-nowrap">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* No Results Yet */}
          {!queryResults && !error && !isRunning && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded text-center p-8">
              <div>
                <Play className="w-8 h-8 text-[#CCCCCC] mx-auto mb-2" />
                <p className="text-sm text-[#666666]">Run your query to see results</p>
                <p className="text-xs text-[#999999] mt-1">Sample data will be displayed here</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {onSave ? 'Cancel' : 'Close'}
          </Button>
          {onSave && !readOnly && (
            <Button onClick={handleSave} className="bg-[#00B5B3] hover:bg-[#009996]">
              Save Changes
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
