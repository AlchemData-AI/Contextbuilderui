// Mock data for AlchemData AI Context Builder - E-commerce focus

export interface Agent {
  id: string;
  name: string;
  owner: string;
  status: 'published' | 'draft' | 'error';
  lastUpdated: string;
  version: string;
  description?: string;
  category: string;
  tables?: string[]; // e.g., ['ecommerce.orders', 'ecommerce.customers']
  contextDescription?: string; // What context this agent provides
  visibility?: 'public' | 'private'; // Public = available to all, Private = only shared users
  sharedWith?: string[]; // Email addresses of users with access (when private)
}

export interface Rule {
  id: string;
  name: string;
  owner: string;
  type: 'cohort' | 'filter' | 'reference' | 'custom';
  description: string;
  definition: string; // The actual rule definition (e.g., SQL filter, criteria)
  createdAt: string;
  lastUsed?: string;
  visibility: 'public' | 'private';
  sharedWith?: string[];
  metadata?: {
    team?: string;
    geography?: string;
    category?: string;
    [key: string]: any;
  };
  sourceType?: 'manual' | 'chat' | 'onboarding';
  sourceConversationId?: string; // Link back to chat
}

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Sales Analytics Agent',
    owner: 'sarah.chen@company.com',
    status: 'published',
    lastUpdated: '2025-10-20',
    version: 'v2.3',
    description: 'Comprehensive sales data analysis across all channels',
    category: 'Sales',
    tables: ['ecommerce.orders', 'ecommerce.order_items', 'ecommerce.customers'],
    contextDescription: 'Revenue metrics, customer segmentation, and sales trends',
    visibility: 'public',
    sharedWith: [],
  },
  {
    id: '2',
    name: 'Inventory Management Agent',
    owner: 'mike.rodriguez@company.com',
    status: 'published',
    lastUpdated: '2025-10-18',
    version: 'v1.8',
    description: 'Real-time inventory tracking and forecasting',
    category: 'Inventory',
    tables: ['warehouse.inventory'],
    contextDescription: 'Stock levels, reorder points, and inventory turnover',
    visibility: 'public',
    sharedWith: [],
  },
  {
    id: '3',
    name: 'Customer Journey Agent',
    owner: 'sarah.chen@company.com',
    status: 'draft',
    lastUpdated: '2025-10-24',
    version: 'v0.5',
    description: 'Customer behavior and funnel analysis',
    category: 'Sales',
    tables: [],
    contextDescription: 'Customer lifecycle, conversion funnels, and behavior patterns',
    visibility: 'private',
    sharedWith: ['sarah.chen@company.com'],
  },
  {
    id: '4',
    name: 'Logistics Optimization Agent',
    owner: 'james.wilson@company.com',
    status: 'published',
    lastUpdated: '2025-10-15',
    version: 'v3.1',
    description: 'Shipping, delivery, and warehouse operations',
    category: 'Logistics',
    tables: ['logistics.shipments'],
    contextDescription: 'Delivery performance, carrier metrics, and fulfillment efficiency',
    visibility: 'public',
    sharedWith: [],
  },
  {
    id: '5',
    name: 'Product Performance Agent',
    owner: 'sarah.chen@company.com',
    status: 'error',
    lastUpdated: '2025-10-22',
    version: 'v1.2',
    description: 'Product-level sales and margin analysis',
    category: 'Sales',
    tables: [],
    contextDescription: 'Product profitability, return rates, and category performance',
    visibility: 'private',
    sharedWith: ['sarah.chen@company.com', 'michael.rodriguez@company.com'],
  },
  {
    id: '6',
    name: 'Warehouse Stock Agent',
    owner: 'mike.rodriguez@company.com',
    status: 'published',
    lastUpdated: '2025-10-19',
    version: 'v2.0',
    description: 'Multi-warehouse inventory distribution',
    category: 'Inventory',
    tables: [],
    contextDescription: 'Multi-location stock management and distribution patterns',
    visibility: 'public',
    sharedWith: [],
  },
  {
    id: '7',
    name: 'Fulfillment Agent',
    owner: 'james.wilson@company.com',
    status: 'draft',
    lastUpdated: '2025-10-23',
    version: 'v0.3',
    description: 'Order processing and fulfillment tracking',
    category: 'Logistics',
    tables: [],
    contextDescription: 'Order-to-ship time, fulfillment bottlenecks, and processing efficiency',
    visibility: 'private',
    sharedWith: ['james.wilson@company.com'],
  },
  {
    id: '8',
    name: 'Returns & Refunds Agent',
    owner: 'emma.taylor@company.com',
    status: 'published',
    lastUpdated: '2025-10-17',
    version: 'v1.5',
    description: 'Returns processing and refund analytics',
    category: 'Sales',
    tables: [],
    contextDescription: 'Return reasons, refund processing times, and product return rates',
    visibility: 'public',
    sharedWith: [],
  },
  {
    id: '9',
    name: 'Supplier Relations Agent',
    owner: 'mike.rodriguez@company.com',
    status: 'published',
    lastUpdated: '2025-10-16',
    version: 'v1.9',
    description: 'Supplier performance and procurement data',
    category: 'Inventory',
    tables: [],
    contextDescription: 'Supplier reliability, lead times, and procurement costs',
    visibility: 'public',
    sharedWith: [],
  },
  {
    id: '10',
    name: 'Delivery Performance Agent',
    owner: 'james.wilson@company.com',
    status: 'published',
    lastUpdated: '2025-10-21',
    version: 'v2.2',
    description: 'Carrier performance and delivery metrics',
    category: 'Logistics',
    tables: [],
    contextDescription: 'On-time delivery rates, carrier costs, and delivery SLAs',
    visibility: 'public',
    sharedWith: [],
  },
];

export const mockRules: Rule[] = [
  {
    id: '1',
    name: 'West Coast Territory',
    owner: 'sarah.chen@company.com',
    type: 'filter',
    description: 'Sales data for California, Oregon, and Washington states',
    definition: "state IN ('CA', 'OR', 'WA')",
    createdAt: '2025-10-15',
    lastUsed: '2025-10-27',
    visibility: 'private',
    sharedWith: ['sarah.chen@company.com'],
    metadata: {
      team: 'West Coast Sales',
      geography: 'US West',
      category: 'Territory',
    },
  },
  {
    id: '2',
    name: 'High-Value Customers',
    owner: 'sarah.chen@company.com',
    type: 'cohort',
    description: 'Customers with lifetime value > $10,000',
    definition: "total_purchase_value > 10000",
    createdAt: '2025-10-18',
    lastUsed: '2025-10-28',
    visibility: 'public',
    sharedWith: [],
    metadata: {
      category: 'Customer Segment',
    },
  },
  {
    id: '3',
    name: 'Q4 2024 Holiday Season',
    owner: 'mike.rodriguez@company.com',
    type: 'reference',
    description: 'Date range for Q4 2024 holiday shopping period',
    definition: "order_date BETWEEN '2024-11-01' AND '2024-12-31'",
    createdAt: '2025-09-20',
    lastUsed: '2025-10-25',
    visibility: 'public',
    sharedWith: [],
    metadata: {
      category: 'Time Period',
    },
  },
  {
    id: '4',
    name: 'Electronics Category',
    owner: 'james.wilson@company.com',
    type: 'filter',
    description: 'All electronics products including phones, laptops, tablets',
    definition: "product_category IN ('Electronics', 'Phones', 'Laptops', 'Tablets')",
    createdAt: '2025-10-10',
    visibility: 'public',
    sharedWith: [],
    metadata: {
      category: 'Product',
    },
  },
  {
    id: '5',
    name: 'My Team - East Region',
    owner: 'emma.taylor@company.com',
    type: 'reference',
    description: 'Sales representatives in the East region team',
    definition: "sales_rep_id IN (101, 102, 103, 105, 108)",
    createdAt: '2025-10-05',
    lastUsed: '2025-10-26',
    visibility: 'private',
    sharedWith: ['emma.taylor@company.com', 'sarah.chen@company.com'],
    metadata: {
      team: 'East Region Sales',
      geography: 'US East',
      category: 'Team',
    },
  },
];

export const owners = Array.from(new Set(mockAgents.map((a) => a.owner))).sort();
export const categories = Array.from(new Set(mockAgents.map((a) => a.category))).sort();
export const statuses = ['published', 'draft', 'error'] as const;

// Database Tables for E-commerce
export interface DatabaseTable {
  name: string;
  schema: string;
  rowCount: number;
  columns: number;
  description: string;
}

export const mockTables: DatabaseTable[] = [
  { name: 'customers', schema: 'public', rowCount: 125000, columns: 18, description: 'Customer master data' },
  { name: 'orders', schema: 'public', rowCount: 850000, columns: 12, description: 'Order transactions' },
  { name: 'order_items', schema: 'public', rowCount: 2100000, columns: 9, description: 'Line items per order' },
  { name: 'products', schema: 'public', rowCount: 15000, columns: 22, description: 'Product catalog' },
  { name: 'inventory', schema: 'public', rowCount: 45000, columns: 11, description: 'Inventory levels by location' },
  { name: 'shipments', schema: 'public', rowCount: 780000, columns: 15, description: 'Shipping & delivery data' },
  { name: 'returns', schema: 'public', rowCount: 65000, columns: 10, description: 'Product returns' },
  { name: 'payments', schema: 'public', rowCount: 820000, columns: 13, description: 'Payment transactions' },
  { name: 'suppliers', schema: 'public', rowCount: 450, columns: 14, description: 'Supplier information' },
  { name: 'warehouses', schema: 'public', rowCount: 12, columns: 9, description: 'Warehouse locations' },
  { name: 'categories', schema: 'public', rowCount: 180, columns: 7, description: 'Product categories' },
  { name: 'reviews', schema: 'public', rowCount: 320000, columns: 8, description: 'Customer product reviews' },
  { name: 'shopping_sessions', schema: 'analytics', rowCount: 1500000, columns: 16, description: 'Web session data' },
  { name: 'cart_events', schema: 'analytics', rowCount: 3200000, columns: 10, description: 'Shopping cart interactions' },
];

// Business Questions for Step 5
export interface Question {
  id: string;
  category: string;
  question: string;
  answer: string;
  suggestedTables: string[];
  importance: 'high' | 'medium' | 'low';
  answered: boolean;
}

export const mockQuestions: Question[] = [
  // Sales Performance (5)
  {
    id: 'q1',
    category: 'Sales Performance',
    question: 'What is our total revenue for the current year?',
    answer: '',
    suggestedTables: ['orders', 'order_items'],
    importance: 'high',
    answered: false,
  },
  {
    id: 'q2',
    category: 'Sales Performance',
    question: 'What is the average order value across all channels?',
    answer: '',
    suggestedTables: ['orders'],
    importance: 'high',
    answered: false,
  },
  {
    id: 'q3',
    category: 'Sales Performance',
    question: 'How do we calculate the conversion rate from sessions to orders?',
    answer: '',
    suggestedTables: ['shopping_sessions', 'orders'],
    importance: 'medium',
    answered: false,
  },
  {
    id: 'q4',
    category: 'Sales Performance',
    question: 'What defines a "high-value" customer in our business?',
    answer: '',
    suggestedTables: ['customers', 'orders'],
    importance: 'high',
    answered: false,
  },
  {
    id: 'q5',
    category: 'Sales Performance',
    question: 'Which product categories generate the most revenue?',
    answer: '',
    suggestedTables: ['products', 'categories', 'order_items'],
    importance: 'medium',
    answered: false,
  },

  // Inventory Management (5)
  {
    id: 'q6',
    category: 'Inventory Management',
    question: 'What is considered "low stock" for different product types?',
    answer: '',
    suggestedTables: ['inventory', 'products'],
    importance: 'high',
    answered: false,
  },
  {
    id: 'q7',
    category: 'Inventory Management',
    question: 'How do we calculate inventory turnover rate?',
    answer: '',
    suggestedTables: ['inventory', 'order_items'],
    importance: 'medium',
    answered: false,
  },
  {
    id: 'q8',
    category: 'Inventory Management',
    question: 'Which warehouses should prioritize restocking?',
    answer: '',
    suggestedTables: ['inventory', 'warehouses', 'products'],
    importance: 'medium',
    answered: false,
  },
  {
    id: 'q9',
    category: 'Inventory Management',
    question: 'What is our target stock level for seasonal products?',
    answer: '',
    suggestedTables: ['inventory', 'products', 'categories'],
    importance: 'low',
    answered: false,
  },
  {
    id: 'q10',
    category: 'Inventory Management',
    question: 'How do we identify slow-moving inventory?',
    answer: '',
    suggestedTables: ['inventory', 'order_items', 'products'],
    importance: 'medium',
    answered: false,
  },

  // Customer Behavior (5)
  {
    id: 'q11',
    category: 'Customer Behavior',
    question: 'What defines an "active" customer vs an "inactive" one?',
    answer: '',
    suggestedTables: ['customers', 'orders'],
    importance: 'high',
    answered: false,
  },
  {
    id: 'q12',
    category: 'Customer Behavior',
    question: 'How do we calculate customer lifetime value (CLV)?',
    answer: '',
    suggestedTables: ['customers', 'orders', 'order_items'],
    importance: 'high',
    answered: false,
  },
  {
    id: 'q13',
    category: 'Customer Behavior',
    question: 'What indicates a customer is at risk of churning?',
    answer: '',
    suggestedTables: ['customers', 'orders', 'shopping_sessions'],
    importance: 'medium',
    answered: false,
  },
  {
    id: 'q14',
    category: 'Customer Behavior',
    question: 'Which customer segments should we prioritize for retention?',
    answer: '',
    suggestedTables: ['customers', 'orders'],
    importance: 'medium',
    answered: false,
  },
  {
    id: 'q15',
    category: 'Customer Behavior',
    question: 'What is the typical purchase frequency for repeat customers?',
    answer: '',
    suggestedTables: ['customers', 'orders'],
    importance: 'low',
    answered: false,
  },

  // Product Performance (5)
  {
    id: 'q16',
    category: 'Product Performance',
    question: 'What defines a "top-performing" product?',
    answer: '',
    suggestedTables: ['products', 'order_items'],
    importance: 'high',
    answered: false,
  },
  {
    id: 'q17',
    category: 'Product Performance',
    question: 'How do we calculate product margin and profitability?',
    answer: '',
    suggestedTables: ['products', 'order_items', 'suppliers'],
    importance: 'high',
    answered: false,
  },
  {
    id: 'q18',
    category: 'Product Performance',
    question: 'Which products have the highest return rates?',
    answer: '',
    suggestedTables: ['returns', 'products', 'order_items'],
    importance: 'medium',
    answered: false,
  },
  {
    id: 'q19',
    category: 'Product Performance',
    question: 'What is our target review rating for product quality?',
    answer: '',
    suggestedTables: ['reviews', 'products'],
    importance: 'low',
    answered: false,
  },
  {
    id: 'q20',
    category: 'Product Performance',
    question: 'How do we identify products ready for discontinuation?',
    answer: '',
    suggestedTables: ['products', 'order_items', 'inventory'],
    importance: 'medium',
    answered: false,
  },

  // Logistics & Fulfillment (4)
  {
    id: 'q21',
    category: 'Logistics & Fulfillment',
    question: 'What is our target delivery time by shipping method?',
    answer: '',
    suggestedTables: ['shipments', 'orders'],
    importance: 'high',
    answered: false,
  },
  {
    id: 'q22',
    category: 'Logistics & Fulfillment',
    question: 'How do we measure on-time delivery performance?',
    answer: '',
    suggestedTables: ['shipments', 'orders'],
    importance: 'medium',
    answered: false,
  },
  {
    id: 'q23',
    category: 'Logistics & Fulfillment',
    question: 'Which carriers should we prioritize for different regions?',
    answer: '',
    suggestedTables: ['shipments', 'warehouses'],
    importance: 'medium',
    answered: false,
  },
  {
    id: 'q24',
    category: 'Logistics & Fulfillment',
    question: 'What is an acceptable fulfillment cost as % of order value?',
    answer: '',
    suggestedTables: ['shipments', 'orders'],
    importance: 'low',
    answered: false,
  },
];

// Agent Review Submissions - Simple table for tracking AI chat reviews
export interface AgentReview {
  id: string;
  agentId: string;
  conversationId: string;
  aiSummary: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const mockAgentReviews: AgentReview[] = [];
