import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface Artifact {
  id: string;
  type: 'chart' | 'table' | 'sql';
  title: string;
  query?: string;
  streamingQuery?: string;
  isStreaming?: boolean;
  data?: any;
  columns?: string[];
  rows?: any[][];
  totalRows?: number;
  reviewStatus?: 'pending' | 'approved' | 'needs-changes';
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  artifacts?: Artifact[];
  showReviewButton?: boolean;
  isStreaming?: boolean;
  errorType?: 'lack_of_context' | 'system_error' | 'access_denied';
  errorMetadata?: {
    privateAgentIds?: string[];
    privateAgentNames?: string[];
    retryable?: boolean;
  };
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  userName: string;
  agentId: string;
  agentName: string;
  status: 'in-progress' | 'review-needed' | 'reviewed' | 'completed';
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  reviewRequestedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

interface ConversationState {
  conversations: Conversation[];
  addConversation: (conversation: Omit<Conversation, 'createdAt' | 'updatedAt'>) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  getConversation: (id: string) => Conversation | undefined;
  getConversationsByStatus: (status: Conversation['status']) => Conversation[];
  getConversationsByUser: (userId: string) => Conversation[];
  getAllConversations: () => Conversation[];
  requestReview: (conversationId: string, userId: string, userName: string) => void;
  approveQuery: (conversationId: string, reviewerId: string, reviewerName: string, notes?: string) => void;
  deleteConversation: (id: string) => void;
}

// ═══════════════════════════════════════════════════════════════════
// MOCK INITIAL DATA
// ���══════════════════════════════════════════════════════════════════

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'chat-1',
    title: 'Q3 Revenue Analysis by Region',
    userId: '4',
    userName: 'John Smith',
    agentId: 'agent-1',
    agentName: 'Revenue Analytics Agent',
    status: 'review-needed',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Show me Q3 2025 revenue by region',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: "I'll analyze Q3 2025 revenue data broken down by region.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1000),
        artifacts: [
          {
            id: 'sql-1',
            type: 'sql',
            title: 'Q3 Revenue by Region Query',
            query: 'SELECT region, SUM(revenue) as total_revenue FROM sales WHERE quarter = \'Q3\' AND year = 2025 GROUP BY region ORDER BY total_revenue DESC',
          },
        ],
        showReviewButton: true,
      },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    reviewRequestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'chat-2',
    title: 'Customer Churn Analysis',
    userId: '5',
    userName: 'Emily Davis',
    agentId: 'agent-2',
    agentName: 'Customer Analytics Agent',
    status: 'review-needed',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'Analyze customer churn rate for this month',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: "I'll calculate the customer churn rate for the current month.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 1000),
        artifacts: [
          {
            id: 'sql-2',
            type: 'sql',
            title: 'Monthly Churn Rate Query',
            query: 'SELECT COUNT(DISTINCT customer_id) as churned_customers, (COUNT(DISTINCT customer_id) * 100.0 / (SELECT COUNT(*) FROM customers)) as churn_rate FROM customer_status WHERE status = \'churned\' AND MONTH(churn_date) = MONTH(CURRENT_DATE)',
          },
        ],
        showReviewButton: true,
      },
    ],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    reviewRequestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'chat-3',
    title: 'Sales Performance Dashboard',
    userId: '6',
    userName: 'Michael Brown',
    agentId: 'agent-3',
    agentName: 'Sales Analytics Agent',
    status: 'reviewed',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'Show me top performing sales reps',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: "Here are your top performing sales representatives.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 1000),
        artifacts: [
          {
            id: 'sql-3',
            type: 'sql',
            title: 'Top Sales Reps Query',
            query: 'SELECT rep_name, SUM(sale_amount) as total_sales FROM sales GROUP BY rep_name ORDER BY total_sales DESC LIMIT 10',
            reviewStatus: 'approved',
            reviewedBy: 'Michael Rodriguez',
            reviewedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
          },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    reviewedBy: 'Michael Rodriguez',
    reviewedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    reviewNotes: 'Query approved and added to Golden Set',
  },
];

// ═══════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: INITIAL_CONVERSATIONS,

      addConversation: (conversation) => {
        const now = new Date();
        const newConversation: Conversation = {
          ...conversation,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          conversations: [...state.conversations, newConversation],
        }));
      },

      updateConversation: (id, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id
              ? { ...conv, ...updates, updatedAt: new Date() }
              : conv
          ),
        }));
      },

      addMessage: (conversationId, message) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: new Date(),
                  // Auto-generate title from first user message if title is empty or default
                  title: conv.messages.length === 0 && message.role === 'user'
                    ? message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
                    : conv.title,
                }
              : conv
          ),
        }));
      },

      updateMessage: (conversationId, messageId, updates) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));
      },

      getConversation: (id) => {
        return get().conversations.find((conv) => conv.id === id);
      },

      getConversationsByStatus: (status) => {
        return get().conversations.filter((conv) => conv.status === status);
      },

      getConversationsByUser: (userId) => {
        return get().conversations.filter((conv) => conv.userId === userId);
      },

      getAllConversations: () => {
        return get().conversations;
      },

      requestReview: (conversationId, userId, userName) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  status: 'review-needed',
                  reviewRequestedAt: new Date(),
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));
      },

      approveQuery: (conversationId, reviewerId, reviewerName, notes) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  status: 'reviewed',
                  reviewedBy: reviewerName,
                  reviewedAt: new Date(),
                  reviewNotes: notes,
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
        }));
      },
    }),
    {
      name: 'alchemdata-conversations',
    }
  )
);
