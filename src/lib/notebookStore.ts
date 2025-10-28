import { create } from 'zustand';

export interface NotebookCell {
  id: string;
  type: 'sql';
  content: string;
  language: 'sql';
  isExecuting?: boolean;
  executionTime?: number;
  results?: {
    columns: string[];
    rows: any[];
    rowCount: number;
  };
  error?: string;
  logs?: {
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
  }[];
  status?: 'idle' | 'running' | 'success' | 'error';
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  cells: NotebookCell[];
}

interface NotebookStore {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  
  // Notebook operations
  createNotebook: (name: string, description?: string) => string;
  deleteNotebook: (id: string) => void;
  updateNotebook: (id: string, updates: Partial<Notebook>) => void;
  setActiveNotebook: (id: string | null) => void;
  getNotebook: (id: string) => Notebook | undefined;
  
  // Cell operations
  addCell: (notebookId: string, type: 'sql', index?: number) => string;
  updateCell: (notebookId: string, cellId: string, updates: Partial<NotebookCell>) => void;
  deleteCell: (notebookId: string, cellId: string) => void;
  executeCell: (notebookId: string, cellId: string) => Promise<void>;
  moveCellUp: (notebookId: string, cellId: string) => void;
  moveCellDown: (notebookId: string, cellId: string) => void;
}

// Mock data for demo
const mockNotebooks: Notebook[] = [
  {
    id: 'nb-1',
    name: 'Sales Analysis Q4 2024',
    description: 'Quarterly sales performance analysis',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-28'),
    createdBy: 'Sarah Chen',
    cells: [
      {
        id: 'cell-2',
        type: 'sql',
        language: 'sql',
        content: 'SELECT \n  region,\n  SUM(revenue) as total_revenue,\n  COUNT(DISTINCT customer_id) as customer_count\nFROM sales\nWHERE date >= \'2024-10-01\'\nGROUP BY region\nORDER BY total_revenue DESC;',
        results: {
          columns: ['region', 'total_revenue', 'customer_count'],
          rows: [
            { region: 'North America', total_revenue: 2450000, customer_count: 1250 },
            { region: 'Europe', total_revenue: 1890000, customer_count: 980 },
            { region: 'Asia Pacific', total_revenue: 1650000, customer_count: 850 },
            { region: 'Latin America', total_revenue: 780000, customer_count: 420 },
          ],
          rowCount: 4,
        },
        executionTime: 2.45,
        status: 'success',
        logs: [
          {
            timestamp: new Date(Date.now() - 5000).toISOString(),
            level: 'info',
            message: 'Starting query execution...',
          },
          {
            timestamp: new Date(Date.now() - 4700).toISOString(),
            level: 'info',
            message: 'Connected to database: production_db',
          },
          {
            timestamp: new Date(Date.now() - 4300).toISOString(),
            level: 'info',
            message: 'Query compiled successfully',
          },
          {
            timestamp: new Date(Date.now() - 3500).toISOString(),
            level: 'info',
            message: 'Executing query on remote cluster...',
          },
          {
            timestamp: new Date(Date.now() - 2550).toISOString(),
            level: 'success',
            message: 'Query completed successfully. Retrieved 4 rows in 2.45s',
          },
        ],
      },
    ],
  },
  {
    id: 'nb-2',
    name: 'Customer Segmentation',
    description: 'RFM analysis for customer segments',
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-10-27'),
    createdBy: 'Michael Park',
    cells: [
      {
        id: 'cell-1',
        type: 'sql',
        language: 'sql',
        content: 'SELECT \n  customer_segment,\n  COUNT(*) as customer_count,\n  AVG(lifetime_value) as avg_ltv\nFROM customers\nGROUP BY customer_segment;',
      },
    ],
  },
  {
    id: 'nb-3',
    name: 'Product Performance Dashboard',
    createdAt: new Date('2024-10-18'),
    updatedAt: new Date('2024-10-25'),
    createdBy: 'Sarah Chen',
    cells: [],
  },
];

export const useNotebookStore = create<NotebookStore>((set, get) => ({
  notebooks: mockNotebooks,
  activeNotebookId: null,

  createNotebook: (name: string, description?: string) => {
    const newNotebook: Notebook = {
      id: `nb-${Date.now()}`,
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Current User',
      cells: [
        {
          id: `cell-${Date.now()}`,
          type: 'sql',
          language: 'sql',
          content: '',
        },
      ],
    };
    
    set((state) => ({
      notebooks: [...state.notebooks, newNotebook],
      activeNotebookId: newNotebook.id,
    }));
    
    return newNotebook.id;
  },

  deleteNotebook: (id: string) => {
    set((state) => ({
      notebooks: state.notebooks.filter((nb) => nb.id !== id),
      activeNotebookId: state.activeNotebookId === id ? null : state.activeNotebookId,
    }));
  },

  updateNotebook: (id: string, updates: Partial<Notebook>) => {
    set((state) => ({
      notebooks: state.notebooks.map((nb) =>
        nb.id === id ? { ...nb, ...updates, updatedAt: new Date() } : nb
      ),
    }));
  },

  setActiveNotebook: (id: string | null) => {
    set({ activeNotebookId: id });
  },

  getNotebook: (id: string) => {
    return get().notebooks.find((nb) => nb.id === id);
  },

  addCell: (notebookId: string, type: 'sql', index?: number) => {
    const cellId = `cell-${Date.now()}`;
    const newCell: NotebookCell = {
      id: cellId,
      type: 'sql',
      language: 'sql',
      content: '',
    };

    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          const cells = [...nb.cells];
          if (index !== undefined) {
            cells.splice(index, 0, newCell);
          } else {
            cells.push(newCell);
          }
          return { ...nb, cells, updatedAt: new Date() };
        }
        return nb;
      }),
    }));

    return cellId;
  },

  updateCell: (notebookId: string, cellId: string, updates: Partial<NotebookCell>) => {
    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          return {
            ...nb,
            cells: nb.cells.map((cell) =>
              cell.id === cellId ? { ...cell, ...updates } : cell
            ),
            updatedAt: new Date(),
          };
        }
        return nb;
      }),
    }));
  },

  deleteCell: (notebookId: string, cellId: string) => {
    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          return {
            ...nb,
            cells: nb.cells.filter((cell) => cell.id !== cellId),
            updatedAt: new Date(),
          };
        }
        return nb;
      }),
    }));
  },

  executeCell: async (notebookId: string, cellId: string) => {
    const startTime = Date.now();
    const logs: NotebookCell['logs'] = [];
    
    // Set executing state
    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          return {
            ...nb,
            cells: nb.cells.map((cell) =>
              cell.id === cellId ? { ...cell, isExecuting: true, status: 'running', error: undefined, logs: [] } : cell
            ),
          };
        }
        return nb;
      }),
    }));

    // Add initial log
    logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Starting query execution...',
    });

    // Simulate connection
    await new Promise((resolve) => setTimeout(resolve, 300));
    logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Connected to database: production_db',
    });

    // Update logs in state
    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          return {
            ...nb,
            cells: nb.cells.map((c) =>
              c.id === cellId ? { ...c, logs: [...logs] } : c
            ),
          };
        }
        return nb;
      }),
    }));

    // Simulate query planning
    await new Promise((resolve) => setTimeout(resolve, 400));
    logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Query compiled successfully',
    });

    // Update logs
    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          return {
            ...nb,
            cells: nb.cells.map((c) =>
              c.id === cellId ? { ...c, logs: [...logs] } : c
            ),
          };
        }
        return nb;
      }),
    }));

    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 800));
    logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Executing query on remote cluster...',
    });

    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          return {
            ...nb,
            cells: nb.cells.map((c) =>
              c.id === cellId ? { ...c, logs: [...logs] } : c
            ),
          };
        }
        return nb;
      }),
    }));

    await new Promise((resolve) => setTimeout(resolve, 600));

    const notebook = get().notebooks.find((nb) => nb.id === notebookId);
    const cell = notebook?.cells.find((c) => c.id === cellId);

    if (!cell || cell.type !== 'sql') return;

    // Mock results based on query content
    const mockResults = {
      columns: ['id', 'name', 'value', 'created_at'],
      rows: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        value: Math.floor(Math.random() * 10000),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      })),
      rowCount: 10,
    };

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    logs.push({
      timestamp: new Date().toISOString(),
      level: 'success',
      message: `Query completed successfully. Retrieved ${mockResults.rowCount} rows in ${executionTime}s`,
    });

    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          return {
            ...nb,
            cells: nb.cells.map((c) =>
              c.id === cellId
                ? {
                    ...c,
                    isExecuting: false,
                    status: 'success',
                    results: mockResults,
                    executionTime: parseFloat(executionTime),
                    logs,
                  }
                : c
            ),
            updatedAt: new Date(),
          };
        }
        return nb;
      }),
    }));
  },

  moveCellUp: (notebookId: string, cellId: string) => {
    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          const cells = [...nb.cells];
          const index = cells.findIndex((c) => c.id === cellId);
          if (index > 0) {
            [cells[index - 1], cells[index]] = [cells[index], cells[index - 1]];
          }
          return { ...nb, cells, updatedAt: new Date() };
        }
        return nb;
      }),
    }));
  },

  moveCellDown: (notebookId: string, cellId: string) => {
    set((state) => ({
      notebooks: state.notebooks.map((nb) => {
        if (nb.id === notebookId) {
          const cells = [...nb.cells];
          const index = cells.findIndex((c) => c.id === cellId);
          if (index < cells.length - 1) {
            [cells[index], cells[index + 1]] = [cells[index + 1], cells[index]];
          }
          return { ...nb, cells, updatedAt: new Date() };
        }
        return nb;
      }),
    }));
  },
}));
