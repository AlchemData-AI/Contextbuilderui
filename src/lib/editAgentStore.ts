/**
 * Simple in-memory store for agent editing
 * In a real app, this would be handled by a state management library or backend
 */

export interface EditAgentData {
  agentId: string;
  mode: 'create' | 'edit';
  originalData?: any;
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6?: any;
}

let editStore: EditAgentData | null = null;

export const setEditData = (data: EditAgentData) => {
  editStore = data;
};

export const getEditData = (): EditAgentData | null => {
  return editStore;
};

export const clearEditData = () => {
  editStore = null;
};

export const updateStepData = (step: string, data: any) => {
  if (editStore) {
    editStore = {
      ...editStore,
      [step]: data,
    };
  }
};

// Mock agent data for editing
export const MOCK_AGENT_EDIT_DATA = {
  agentId: 'sales-analytics-agent',
  mode: 'edit' as const,
  originalData: {
    name: 'Sales Analytics Agent',
    description: 'Analyzes sales performance, inventory trends, and customer behavior',
    targetUsers: ['Sales Managers', 'Business Analysts'],
    tables: [
      'ecommerce.orders',
      'ecommerce.order_items',
      'ecommerce.customers',
      'ecommerce.products',
      'warehouse.inventory',
      'logistics.shipments',
    ],
  },
  step1: {
    selectedTables: [
      {
        schema: 'ecommerce',
        name: 'orders',
        fullName: 'ecommerce.orders',
        recordCount: '2.5M',
        columns: 12,
        description: 'Order transactions and customer purchases',
      },
      {
        schema: 'ecommerce',
        name: 'order_items',
        fullName: 'ecommerce.order_items',
        recordCount: '8.2M',
        columns: 8,
        description: 'Individual items within each order',
      },
      {
        schema: 'ecommerce',
        name: 'customers',
        fullName: 'ecommerce.customers',
        recordCount: '450K',
        columns: 15,
        description: 'Customer profile and contact information',
      },
      {
        schema: 'ecommerce',
        name: 'products',
        fullName: 'ecommerce.products',
        recordCount: '12K',
        columns: 10,
        description: 'Product catalog with pricing and categories',
      },
      {
        schema: 'warehouse',
        name: 'inventory',
        fullName: 'warehouse.inventory',
        recordCount: '50K',
        columns: 8,
        description: 'Current inventory levels and stock status',
      },
      {
        schema: 'logistics',
        name: 'shipments',
        fullName: 'logistics.shipments',
        recordCount: '3.1M',
        columns: 14,
        description: 'Shipment tracking and delivery information',
      },
    ],
  },
  step2: {
    agentName: 'Sales Analytics Agent',
    description: 'Analyzes sales performance, inventory trends, and customer behavior',
    targetUsers: ['Sales Managers', 'Business Analysts'],
    primaryFocus: 'sales',
  },
  step4: {
    validationQuestions: [
      {
        id: '1',
        question: 'What was our total revenue last month?',
        expectedAnswer: 'Based on the orders table, filtering by order_date and aggregating total_amount',
        userResponse: 'Aggregate total_amount from orders where order_date is within last month',
        status: 'approved' as const,
      },
      {
        id: '2',
        question: 'Which products have the highest inventory turnover?',
        expectedAnswer: 'Join products with order_items and inventory, calculate turnover ratio',
        userResponse: 'Join products, order_items, and inventory tables to calculate turnover ratio',
        status: 'approved' as const,
      },
      {
        id: '3',
        question: 'Show me customers who haven\'t ordered in 60+ days',
        expectedAnswer: 'Query customers table joined with orders, filter by last order date',
        userResponse: 'Filter customers by last order_date from orders table, show those with 60+ days since last order',
        status: 'approved' as const,
      },
    ],
  },
  step5: {
    sampleQueries: [
      {
        id: '1',
        category: 'Revenue Analysis',
        query: 'What was the total revenue for each product category last quarter?',
        complexity: 'medium' as const,
      },
      {
        id: '2',
        category: 'Customer Insights',
        query: 'Show me the top 10 customers by lifetime value',
        complexity: 'medium' as const,
      },
      {
        id: '3',
        category: 'Inventory Management',
        query: 'Which products are running low on inventory?',
        complexity: 'low' as const,
      },
    ],
    metrics: [
      {
        id: '1',
        name: 'Total Revenue',
        description: 'Sum of all order amounts',
        table: 'ecommerce.orders',
        column: 'total_amount',
        aggregation: 'SUM' as const,
      },
      {
        id: '2',
        name: 'Average Order Value',
        description: 'Average order total',
        table: 'ecommerce.orders',
        column: 'total_amount',
        aggregation: 'AVG' as const,
      },
      {
        id: '3',
        name: 'Active Customers',
        description: 'Customers who ordered in last 30 days',
        table: 'ecommerce.customers',
        column: 'customer_id',
        aggregation: 'COUNT_DISTINCT' as const,
      },
    ],
  },
};
