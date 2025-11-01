import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Send,
  Mic,
  Paperclip,
  Settings as SettingsIcon,
  Database,
  Users,
  CheckCircle,
  Download,
  Copy,
  Edit,
  Play,
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
  X,
  Plus,
  Loader2,
  PanelRightOpen,
  PanelLeft,
  Sparkles,
  Code,
  BarChart3,
  Table as TableIcon,
  ChevronDown,
  ChevronRight,
  Check,
  Edit3,
  Maximize2,
  Shield,
  Mail,
  UserPlus,
  Star,
  Home,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore, hasPermission } from '../lib/authStore';
import { useConversationStore, type Artifact as StoreArtifact, type Message as StoreMessage, type Conversation as StoreConversation } from '../lib/conversationStore';
import { useRulesStore } from '../lib/rulesStore';
import { useSidebar } from '../components/ChatLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';

// ═══════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  }
};

const slideInFromRight = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: { type: 'spring', damping: 30, stiffness: 300 }
  },
  exit: { 
    x: '100%',
    transition: { duration: 0.2 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const typewriterCursor = {
  blink: {
    opacity: [1, 0, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// ═══════���══���═════════════════════════════════���═══���══��═══════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface Agent {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  created: string;
  lastUpdated: string;
  trustedQueries: number;
  usage: number;
  dataSources: string[];
  sampleQueries: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  streamingContent?: string;
  isAnalysisMode?: boolean;
  
  // Thinking phase (before analysis plan)
  showThinking?: boolean;
  thinkingSteps?: string[];
  isThinking?: boolean;
  thinkingExpanded?: boolean;
  
  // Analysis plan preview (shown BEFORE execution)
  showAnalysisPlan?: boolean;
  analysisPlan?: {
    steps: { title: string; details: string[]; isTrusted?: boolean }[];
    estimatedTime: string;
    expectedOutput: string;
  };
  isPlanGenerating?: boolean; // New: indicates plan is being generated
  planStepsVisible?: number; // New: number of steps visible during generation
  planGenerationFailed?: boolean; // New: indicates plan generation failed
  needsApproval?: boolean;
  
  // New execution tracking
  executionPhase?: 'planning' | 'coding' | 'fetching' | 'complete' | 'failed';
  executionLogs?: ExecutionLog[];
  executionExpanded?: boolean;
  
  artifacts?: Artifact[];
  showReviewButton?: boolean;
  
  // Rule saving
  savedAsRule?: boolean;
  savedRuleName?: string;
  savedRuleId?: string;
  
  // Error handling
  errorType?: 'system_error' | 'access_denied'; // Removed 'lack_of_context'
  errorMetadata?: {
    privateAgentIds?: string[];
    privateAgentNames?: string[];
    retryable?: boolean;
    failedPhase?: 'chat' | 'plan' | 'execution'; // Which phase failed
  };
}

interface ExecutionLog {
  id: string;
  phase: 'planning' | 'coding' | 'fetching';
  stepNumber: number;
  totalSteps: number;
  title: string;
  status: 'pending' | 'in-progress' | 'complete' | 'failed'; // Added 'failed'
  details?: string[];
  code?: string;
  streamingCode?: string;
  isStreaming?: boolean;
  thinkingText?: string; // Real-time thinking/reasoning text
  streamingThinking?: string; // Streaming thinking text
  errorMessage?: string; // Error details if failed
}

interface SQLArtifact {
  type: 'sql';
  query: string;
  streamingQuery?: string;
  isStreaming?: boolean;
  trustLevel: 'trusted' | 'team-validated' | 'new';
  validatedBy?: string;
  validatedDate?: string;
  usedIn?: number;
  lastExecuted?: string;
  rowsReturned?: number;
}

interface ChartArtifact {
  type: 'chart';
  chartType: 'bar' | 'line';
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  isAnimating?: boolean;
  insights?: string[];
}

interface TableArtifact {
  type: 'table';
  title: string;
  columns: string[];
  rows: string[][];
  totalRows: number;
}

type Artifact = SQLArtifact | ChartArtifact | TableArtifact;

interface Analyst {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  avgResponse: string;
}

// ═══════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════

const MOCK_AGENTS: Agent[] = [
  {
    id: 'rev-agent',
    name: 'Revenue Analytics Agent',
    description: 'This agent specializes in revenue analysis across all business units and time periods.',
    createdBy: 'Data Analytics Team',
    created: 'March 2025',
    lastUpdated: 'Oct 15, 2025',
    trustedQueries: 127,
    usage: 1453,
    dataSources: ['revenue_fact', 'region_dim', 'customer_dim', 'time_dim'],
    sampleQueries: ['Q3 Revenue by Region', 'YoY Revenue Growth', 'Top Customers by Revenue'],
  },
];

const MOCK_ANALYSTS: Analyst[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    specialty: 'Revenue Analytics',
    available: true,
    avgResponse: '2 hours',
  },
  {
    id: 'team',
    name: 'Data Analytics Team',
    specialty: 'General Analytics',
    available: true,
    avgResponse: '4 hours',
  },
];

// ═══════════════════════════════════════════════════════════════════
// UTILITY: STREAMING TEXT
// ═══════════════════════════════════════════════════════════════════

async function streamText(
  text: string,
  onChunk: (chunk: string) => void,
  speed: number = 20
): Promise<void> {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, speed));
    onChunk(words.slice(0, i + 1).join(' '));
  }
}

async function streamCode(
  code: string,
  onChunk: (chunk: string) => void,
  speed: number = 15
): Promise<void> {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, speed));
    onChunk(lines.slice(0, i + 1).join('\n'));
  }
}

function isAnalysisRequest(text: string): boolean {
  const lowerText = text.toLowerCase();
  const analysisKeywords = ['analyze', 'analyse', 'analysis', 'create analysis', 'run analysis', 'generate analysis'];
  return analysisKeywords.some(keyword => lowerText.includes(keyword));
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function AgenticChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useAuthStore();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { 
    getConversation, 
    addConversation, 
    updateConversation, 
    addMessage: addMessageToStore,
    requestReview: requestReviewInStore,
    approveQuery: approveQueryInStore
  } = useConversationStore();

  // Use conversationId from URL params if available, otherwise default to 'new'
  const [currentConvId, setCurrentConvId] = useState(conversationId || 'new');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isCenteredMode, setIsCenteredMode] = useState(true); // For centered chatbox
  const [isFocused, setIsFocused] = useState(false);
  const shouldAutoSendRef = useRef(false);

  // Artifact Panel
  const [artifactPanelOpen, setArtifactPanelOpen] = useState(false);
  const [artifactPanelArtifacts, setArtifactPanelArtifacts] = useState<Artifact[]>([]);
  const [activeArtifactTab, setActiveArtifactTab] = useState<string>('chart');
  const [currentConversationStatus, setCurrentConversationStatus] = useState<string | undefined>();

  // Dialogs
  const [agentDetailsOpen, setAgentDetailsOpen] = useState(false);
  const [selectedAgentForDetails, setSelectedAgentForDetails] = useState<Agent | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedAnalyst, setSelectedAnalyst] = useState<Analyst | null>(null);
  
  // SQL Editing
  const [sqlEditDialogOpen, setSqlEditDialogOpen] = useState(false);
  const [editingSql, setEditingSql] = useState('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  // Request Analyst Workflow
  const [analystEmail, setAnalystEmail] = useState('');
  const [requestingSql, setRequestingSql] = useState<string>('');
  const [generatedSummary, setGeneratedSummary] = useState('');

  // Save Rule Dialog
  const addRule = useRulesStore((state) => state.addRule);
  const [showSaveRuleDialog, setShowSaveRuleDialog] = useState(false);
  const [ruleMessageId, setRuleMessageId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<'cohort' | 'filter' | 'reference' | 'custom'>('custom');
  const [ruleDescription, setRuleDescription] = useState('');
  const [ruleDefinition, setRuleDefinition] = useState('');
  const [ruleIsPublic, setRuleIsPublic] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const analysisMessageRef = useRef<HTMLDivElement>(null);
  const planGenerationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldAutoScroll) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        // Check for active execution first
        const hasActiveExecution = messages.some(m => m.executionLogs && m.executionLogs.length > 0 && m.executionPhase !== 'complete');
        const hasActivePlan = messages.some(m => m.showAnalysisPlan && m.isPlanGenerating);
        
        if (hasActivePlan && planGenerationRef.current) {
          setTimeout(() => {
            planGenerationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        } else if (hasActiveExecution && analysisMessageRef.current) {
          setTimeout(() => {
            // Find the code block being written
            const codeBlock = analysisMessageRef.current?.querySelector('pre');
            if (codeBlock) {
              // Scroll to the code block with some padding
              codeBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              // Fallback to the execution section
              analysisMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              setTimeout(() => {
                window.scrollBy({ top: 200, behavior: 'smooth' });
              }, 200);
            }
          }, 100);
        } else if (!hasActivePlan && !hasActiveExecution) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }, [messages, shouldAutoScroll]);

  // Save/Load conversations - Load from shared store
  // Only load when URL conversationId changes (component mount or navigation)
  useEffect(() => {
    const urlConvId = conversationId || 'new';
    
    if (urlConvId === 'new') {
      setMessages([]);
      setCurrentConvId('new');
      setCurrentConversationStatus(undefined);
      setIsCenteredMode(true); // Show centered mode for new chats
      setIsCollapsed(false); // Ensure sidebar is expanded for new chats
      
      // Handle initial message from ChatWelcome
      const initialMessage = (location.state as any)?.initialMessage;
      if (initialMessage) {
        setInput(initialMessage);
        // Mark that we should auto-send once input is set
        shouldAutoSendRef.current = true;
        // Clear the state to prevent re-triggering on back navigation
        window.history.replaceState({}, document.title);
      }
    } else {
      const conv = getConversation(urlConvId);
      if (conv) {
        setMessages(conv.messages as any[]); // Type compatibility
        setCurrentConversationStatus(conv.status);
        setCurrentConvId(urlConvId);
        setIsCenteredMode(false); // Exit centered mode for existing chats
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleSend = async (autoSend = false) => {
    if (!input.trim() || isProcessing) return;

    // Exit centered mode and collapse sidebar when sending a message
    if (isCenteredMode) {
      setIsCenteredMode(false);
    }
    // Always collapse sidebar when user starts typing/sending
    if (!isCollapsed) {
      setIsCollapsed(true);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    
    // If this is a new conversation, create it in the store
    let activeConvId = currentConvId;
    if (currentConvId === 'new') {
      activeConvId = `conv-${Date.now()}`;
      addConversation({
        id: activeConvId,
        title: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
        userId: user?.id || 'unknown',
        userName: user?.name || 'Current User',
        agentId: 'agent-1',
        agentName: 'Revenue Analytics Agent',
        status: 'in-progress',
        messages: [userMsg as any],
      });
      setCurrentConvId(activeConvId);
      // Update URL without triggering navigation/reload
      window.history.replaceState(null, '', `/chat/${activeConvId}`);
    } else {
      // Add message to existing conversation
      addMessageToStore(currentConvId, userMsg as any);
    }

    const inputText = input;
    setInput('');
    setIsProcessing(true);

    // Check for demo error scenarios
    const lowerInput = inputText.toLowerCase();
    
    // Demo: Private Agent Access - Show reasoning first
    if (lowerInput.includes('financial projections') || lowerInput.includes('financial planning')) {
      await simulatePrivateAgentAccessFlow(userMsg, newMessages, activeConvId);
      setIsProcessing(false);
      return;
    }
    
    // Demo: Execution failure during analysis
    if (lowerInput.includes('sales trends') && lowerInput.includes('analyze')) {
      // This will be handled in simulateAnalysisFlow with execution failure
      await simulateAnalysisFlowWithFailure(userMsg, newMessages, activeConvId, 'execution');
      setIsProcessing(false);
      return;
    }
    
    // Demo: Plan generation failure
    if (lowerInput.includes('revenue forecast') || lowerInput.includes('forecast revenue')) {
      await simulateAnalysisFlowWithFailure(userMsg, newMessages, activeConvId, 'plan');
      setIsProcessing(false);
      return;
    }
    
    // Demo: Regular chat streaming failure
    if (lowerInput.includes('customer churn') && lowerInput.includes('last month')) {
      await simulateRegularChatWithFailure(userMsg, newMessages, activeConvId);
      setIsProcessing(false);
      return;
    }

    const isAnalysis = isAnalysisRequest(inputText);

    if (isAnalysis) {
      await simulateAnalysisFlow(userMsg, newMessages, activeConvId);
    } else {
      await simulateRegularChat(userMsg, newMessages, activeConvId);
    }
    
    setIsProcessing(false);
  };

  // Handle auto-send when input is set from navigation  
  useEffect(() => {
    if (shouldAutoSendRef.current && input.trim() && !isProcessing) {
      shouldAutoSendRef.current = false;
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        handleSend(true);
      }, 200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isProcessing]);

  const simulateRegularChat = async (userMsg: Message, currentMessages: Message[], conversationId: string) => {
    const baseId = Date.now();
    const assistantMsgId = (baseId + 1).toString();
    
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      streamingContent: '',
      isStreaming: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...currentMessages, assistantMsg];
    setMessages(updatedMessages);

    const responses = [
      "**Q3** typically refers to the third quarter of the fiscal year, covering **July through September**.\n\nFor revenue analysis by region, I can help you create a comprehensive analysis that breaks down performance across your geographical areas.",
      "Revenue by region analysis helps identify which markets are performing well and where there might be opportunities for growth.\n\n_Would you like me to create a detailed analysis for Q3 2025?_",
      "I can help you understand your Q3 revenue data. To get started with a detailed analysis, just say **'analyze Q3 revenue by region'** and I'll walk you through the process.",
    ];

    const responseText = responses[Math.floor(Math.random() * responses.length)];

    await streamText(responseText, (chunk) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, streamingContent: chunk }
            : m
        )
      );
    }, 25);

    const finalMessages = updatedMessages.map((m) =>
      m.id === assistantMsgId
        ? { ...m, content: responseText, isStreaming: false, streamingContent: '' }
        : m
    );

    setMessages(finalMessages);

    // Save assistant message to store
    const assistantMessage = finalMessages.find(m => m.id === assistantMsgId);
    if (assistantMessage && conversationId !== 'new') {
      addMessageToStore(conversationId, assistantMessage as any);
    }
  };

  // DEMO: Regular chat with streaming failure
  const simulateRegularChatWithFailure = async (userMsg: Message, currentMessages: Message[], conversationId: string) => {
    const baseId = Date.now();
    const assistantMsgId = (baseId + 1).toString();
    
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      streamingContent: '',
      isStreaming: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...currentMessages, assistantMsg];
    setMessages(updatedMessages);

    // Start streaming then fail midway
    const partialResponse = "I'm analyzing customer churn data for last month. Let me retrieve that inform";

    await streamText(partialResponse, (chunk) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, streamingContent: chunk }
            : m
        )
      );
    }, 25);

    // Simulate failure
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const errorMsg: Message = {
      id: `${assistantMsgId}-error`,
      role: 'assistant',
      content: 'Failed to retrieve data. The database connection timed out.',
      timestamp: new Date(),
      errorType: 'system_error',
      errorMetadata: { 
        retryable: true,
        failedPhase: 'chat',
      },
    };

    // Replace the streaming message with error
    setMessages((prev) => 
      prev.map(m => m.id === assistantMsgId ? errorMsg : m)
    );
  };

  // DEMO: Analysis flow with failure at different phases
  const simulateAnalysisFlowWithFailure = async (
    userMsg: Message, 
    currentMessages: Message[], 
    conversationId: string,
    failurePoint: 'plan' | 'execution'
  ) => {
    if (failurePoint === 'plan') {
      // Show thinking phase, then fail during plan generation
      const baseId = Date.now();
      const thinkingMsgId = (baseId + 1).toString();
      
      const thinkingStepsData = [
        "Understanding your question...",
        "Identified query intent: Revenue forecast analysis",
        "Time period detected: Future projection needed",
        "Searching for relevant Context Agents...",
      ];

      const thinkingMsg: Message = {
        id: thinkingMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        showThinking: true,
        isThinking: true,
        thinkingSteps: [],
        thinkingExpanded: true,
      };

      let updatedMessages = [...currentMessages, thinkingMsg];
      setMessages(updatedMessages);

      // Stream thinking steps
      for (let i = 0; i < thinkingStepsData.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingMsgId
              ? { ...m, thinkingSteps: thinkingStepsData.slice(0, i + 1) }
              : m
          )
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsgId
            ? { ...m, isThinking: false, thinkingExpanded: false }
            : m
        )
      );

      // Start plan generation, then fail
      await new Promise((resolve) => setTimeout(resolve, 400));
      const planMsgId = (baseId + 2).toString();
      
      const planMsg: Message = {
        id: planMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        showAnalysisPlan: true,
        isPlanGenerating: true,
        planStepsVisible: 0,
        analysisPlan: {
          steps: [],
          estimatedTime: '~3 seconds',
          expectedOutput: 'Forecast analysis',
        },
      };

      setMessages((prev) => [...prev, planMsg]);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Fail plan generation
      const errorMsg: Message = {
        id: `${planMsgId}-error`,
        role: 'assistant',
        content: 'Failed to generate analysis plan. The forecasting model is currently unavailable.',
        timestamp: new Date(),
        errorType: 'system_error',
        errorMetadata: { 
          retryable: true,
          failedPhase: 'plan',
        },
      };

      setMessages((prev) => 
        prev.map(m => m.id === planMsgId ? errorMsg : m)
      );

    } else if (failurePoint === 'execution') {
      // Complete thinking and planning, fail during execution
      await simulateThinkingPhase(currentMessages);
      await new Promise((resolve) => setTimeout(resolve, 400));
      await simulatePlanGeneration();
      // Plan approval happens automatically in demo
      await new Promise((resolve) => setTimeout(resolve, 800));
      await simulateExecutionWithFailure();
    }
  };

  const simulateThinkingPhase = async (currentMessages: Message[]) => {
    const baseId = Date.now();
    const thinkingMsgId = (baseId + 1).toString();
    
    const thinkingStepsData = [
      "Understanding your question...",
      "Identified query intent: Sales trends analysis",
      "Searching for relevant Context Agents...",
      "Found: Sales Analytics Agent",
      "Planning analysis approach...",
    ];

    const thinkingMsg: Message = {
      id: thinkingMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      showThinking: true,
      isThinking: true,
      thinkingSteps: [],
      thinkingExpanded: true,
    };

    setMessages((prev) => [...prev, thinkingMsg]);

    for (let i = 0; i < thinkingStepsData.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsgId
            ? { ...m, thinkingSteps: thinkingStepsData.slice(0, i + 1) }
            : m
        )
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    setMessages((prev) =>
      prev.map((m) =>
        m.id === thinkingMsgId
          ? { ...m, isThinking: false, thinkingExpanded: false }
          : m
      )
    );
  };

  const simulatePlanGeneration = async () => {
    const planMsgId = `plan-${Date.now()}`;
    const fullPlan = {
      steps: [
        {
          title: 'Query Sales Database',
          details: [
            'Access sales_fact table with trend data',
            'Filter for recent time periods',
          ],
        },
        {
          title: 'Calculate Trends',
          details: [
            'Compute period-over-period changes',
            'Identify growth patterns',
          ],
        },
      ],
      estimatedTime: '~3 seconds',
      expectedOutput: 'Trend analysis with charts',
    };

    const planMsg: Message = {
      id: planMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      showAnalysisPlan: true,
      isPlanGenerating: true,
      planStepsVisible: 0,
      needsApproval: false,
      analysisPlan: fullPlan,
    };

    setMessages((prev) => [...prev, planMsg]);

    for (let i = 1; i <= fullPlan.steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === planMsgId
            ? { ...m, planStepsVisible: i }
            : m
        )
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    setMessages((prev) =>
      prev.map((m) =>
        m.id === planMsgId
          ? { ...m, isPlanGenerating: false }
          : m
      )
    );
  };

  const simulateExecutionWithFailure = async () => {
    const executionMsgId = `exec-${Date.now()}`;
    
    const executionMsg: Message = {
      id: executionMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isAnalysisMode: true,
      executionPhase: 'planning',
      executionExpanded: true,
      executionLogs: [
        {
          id: '1',
          phase: 'planning',
          stepNumber: 1,
          totalSteps: 3,
          title: 'Planning analysis',
          status: 'in-progress',
          details: [],
        },
        {
          id: '2',
          phase: 'coding',
          stepNumber: 2,
          totalSteps: 3,
          title: 'Writing SQL query',
          status: 'pending',
        },
        {
          id: '3',
          phase: 'fetching',
          stepNumber: 3,
          totalSteps: 3,
          title: 'Fetching data',
          status: 'pending',
        },
      ],
    };

    setMessages((prev) => [...prev, executionMsg]);

    // Complete planning phase
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === executionMsgId && m.executionLogs) {
          const logs = [...m.executionLogs];
          logs[0] = { ...logs[0], status: 'complete', details: ['Analysis plan validated'] };
          logs[1] = { ...logs[1], status: 'in-progress' };
          return { ...m, executionLogs: logs, executionPhase: 'coding' };
        }
        return m;
      })
    );

    // Fail during coding phase
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === executionMsgId && m.executionLogs) {
          const logs = [...m.executionLogs];
          logs[1] = { 
            ...logs[1], 
            status: 'failed',
            errorMessage: 'Query generation failed: Unable to map business terms to database schema',
          };
          return { ...m, executionLogs: logs, executionPhase: 'failed' };
        }
        return m;
      })
    );

    // Add error message
    await new Promise((resolve) => setTimeout(resolve, 300));
    const errorMsg: Message = {
      id: `${executionMsgId}-error`,
      role: 'assistant',
      content: 'Analysis execution failed during SQL generation. This might be due to missing schema mappings or an ambiguous query.',
      timestamp: new Date(),
      errorType: 'system_error',
      errorMetadata: { 
        retryable: true,
        failedPhase: 'execution',
      },
    };

    setMessages((prev) => [...prev, errorMsg]);
  };

  // DEMO: Private Agent Access - Show reasoning first, then access dialogue
  const simulatePrivateAgentAccessFlow = async (
    userMsg: Message, 
    currentMessages: Message[], 
    conversationId: string
  ) => {
    // STEP 1: Show thinking/reasoning phase
    const baseId = Date.now();
    const thinkingMsgId = (baseId + 1).toString();
    
    const thinkingStepsData = [
      "Understanding your question...",
      "Identified query intent: Financial projections analysis",
      "Searching for relevant Context Agents...",
      "Checking accessible agents for financial data...",
      "No accessible agents found with required context",
      "Found matching private agents: Financial Planning Agent, Budget Forecasting Agent",
    ];

    const thinkingMsg: Message = {
      id: thinkingMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      showThinking: true,
      isThinking: true,
      thinkingSteps: [],
      thinkingExpanded: true,
    };

    setMessages((prev) => [...prev, thinkingMsg]);

    // Stream thinking steps
    for (let i = 0; i < thinkingStepsData.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsgId
            ? { ...m, thinkingSteps: thinkingStepsData.slice(0, i + 1) }
            : m
        )
      );
    }

    // Complete thinking and auto-collapse
    await new Promise((resolve) => setTimeout(resolve, 400));
    setMessages((prev) =>
      prev.map((m) =>
        m.id === thinkingMsgId
          ? { ...m, isThinking: false, thinkingExpanded: false }
          : m
      )
    );

    // STEP 2: Show access denied dialogue
    await new Promise((resolve) => setTimeout(resolve, 500));
    const errorMsg: Message = {
      id: `${baseId + 2}`,
      role: 'assistant',
      content: 'Access denied',
      timestamp: new Date(),
      errorType: 'access_denied',
      errorMetadata: {
        privateAgentNames: ['Financial Planning Agent', 'Budget Forecasting Agent'],
        privateAgentIds: ['agent-fin-1', 'agent-fin-2'],
      },
    };

    setMessages((prev) => [...prev, errorMsg]);
  };

  const simulateAnalysisFlow = async (userMsg: Message, currentMessages: Message[], conversationId: string) => {
    // STEP 1: Show detailed "thinking/reasoning" phase
    const baseId = Date.now();
    const thinkingMsgId = (baseId + 1).toString();
    
    const thinkingStepsData = [
      "Understanding your question...",
      "Identified query intent: Revenue analysis",
      "Time period detected: Q3 2025 (Jul-Sep)",
      "Dimension needed: Regional breakdown",
      "Searching for relevant Context Agents...",
      "Found: Revenue Analytics Agent (trusted)",
      "Planning analysis approach...",
    ];

    const thinkingMsg: Message = {
      id: thinkingMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      showThinking: true,
      isThinking: true,
      thinkingSteps: [],
      thinkingExpanded: true,
    };

    let updatedMessages = [...currentMessages, thinkingMsg];
    setMessages(updatedMessages);

    // Stream thinking steps one by one
    for (let i = 0; i < thinkingStepsData.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsgId
            ? { ...m, thinkingSteps: thinkingStepsData.slice(0, i + 1) }
            : m
        )
      );
    }

    // Complete thinking and auto-collapse
    await new Promise((resolve) => setTimeout(resolve, 300));
    setMessages((prev) =>
      prev.map((m) =>
        m.id === thinkingMsgId
          ? { ...m, isThinking: false, thinkingExpanded: false }
          : m
      )
    );

    // STEP 2: Show analysis plan (needs approval) - with generation animation
    const planMsgId = (baseId + 2).toString();
    
    const fullPlan = {
      steps: [
        {
          title: 'Query Revenue Data',
          details: [
            'Join revenue_fact with region_dim tables',
            'Filter for Q3 2025 (Jul-Sep)',
            'Aggregate by region',
          ],
          isTrusted: true,
        },
        {
          title: 'Calculate Metrics',
          details: [
            'Sum total revenue per region',
            'Count transactions',
            'Calculate average order value',
          ],
        },
        {
          title: 'Generate Visualizations',
          details: [
            'Create bar chart showing regional comparison',
            'Generate summary table with key metrics',
            'Export data for further analysis',
          ],
        },
      ],
      estimatedTime: '~3 seconds',
      expectedOutput: 'Bar chart, data table, and SQL query',
    };

    // Start with loading state
    const planMsg: Message = {
      id: planMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      showAnalysisPlan: true,
      isPlanGenerating: true,
      planStepsVisible: 0,
      needsApproval: false,
      analysisPlan: fullPlan,
    };

    setMessages((prev) => [...prev, planMsg]);

    // Animate steps appearing one by one
    for (let i = 1; i <= fullPlan.steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === planMsgId
            ? { ...m, planStepsVisible: i }
            : m
        )
      );
    }

    // Complete generation and show approval buttons
    await new Promise((resolve) => setTimeout(resolve, 400));
    setMessages((prev) => {
      const updated = prev.map((m) =>
        m.id === planMsgId
          ? { ...m, isPlanGenerating: false, needsApproval: true }
          : m
      );
      
      return updated;
    });

    // Disable auto-scroll during plan review
    setShouldAutoScroll(false);
  };

  const handleApprovePlan = async (planMsgId: string) => {
    // Update the plan message to remove approval UI
    setMessages((prev) =>
      prev.map((m) =>
        m.id === planMsgId
          ? { ...m, needsApproval: false }
          : m
      )
    );

    setShouldAutoScroll(false); // Keep scroll position at analysis message
    
    const baseId = Date.now();
    const executionMsgId = (baseId + 1).toString();
    
    // Create execution message with logs
    const executionMsg: Message = {
      id: executionMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isAnalysisMode: true,
      executionPhase: 'planning',
      executionExpanded: true,
      executionLogs: [
        {
          id: '1',
          phase: 'planning',
          stepNumber: 1,
          totalSteps: 3,
          title: 'Planning analysis',
          status: 'in-progress',
          details: [],
        },
        {
          id: '2',
          phase: 'coding',
          stepNumber: 2,
          totalSteps: 3,
          title: 'Writing SQL query',
          status: 'pending',
        },
        {
          id: '3',
          phase: 'fetching',
          stepNumber: 3,
          totalSteps: 3,
          title: 'Fetching data',
          status: 'pending',
        },
      ],
    };

    setMessages((prev) => [...prev, executionMsg]);

    // Auto-scroll to execution when it starts
    setShouldAutoScroll(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    // PHASE 1: Planning (with thinking text + details)
    const planningThinking = "Analyzing the query structure... The user wants revenue data broken down by region for Q3 2025. I'll need to join the revenue_fact table with region_dim to get regional names and aggregate the data appropriately.";
    
    // Stream thinking text
    await streamText(planningThinking, (chunk) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === executionMsgId && m.executionLogs) {
            const logs = [...m.executionLogs];
            logs[0] = {
              ...logs[0],
              streamingThinking: chunk,
            };
            return { ...m, executionLogs: logs };
          }
          return m;
        })
      );
    }, 15);

    // Set complete thinking text
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === executionMsgId && m.executionLogs) {
          const logs = [...m.executionLogs];
          logs[0] = {
            ...logs[0],
            thinkingText: planningThinking,
            streamingThinking: undefined,
          };
          return { ...m, executionLogs: logs };
        }
        return m;
      })
    );
    
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const planningDetails = [
      'Identified query intent: Revenue analysis',
      'Time period: Q3 2025 (Jul-Sep)',
      'Dimension: Regional breakdown',
      'Selected agent: Revenue Analytics Agent',
    ];

    for (let i = 0; i < planningDetails.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === executionMsgId && m.executionLogs) {
            const logs = [...m.executionLogs];
            logs[0] = {
              ...logs[0],
              details: planningDetails.slice(0, i + 1),
            };
            return { ...m, executionLogs: logs };
          }
          return m;
        })
      );
    }

    // Complete planning
    await new Promise((resolve) => setTimeout(resolve, 400));
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === executionMsgId && m.executionLogs) {
          const logs = [...m.executionLogs];
          logs[0] = { ...logs[0], status: 'complete' };
          logs[1] = { ...logs[1], status: 'in-progress' };
          return { ...m, executionPhase: 'coding', executionLogs: logs };
        }
        return m;
      })
    );

    // PHASE 2: Writing SQL (with thinking + streaming code)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const codingThinking = "Now I'll construct the SQL query. I need to join revenue_fact with region_dim, filter for Q3 2025, and aggregate by region. I'll also order by total revenue to show the top-performing regions first.";

    // Stream thinking for coding phase
    await streamText(codingThinking, (chunk) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === executionMsgId && m.executionLogs) {
            const logs = [...m.executionLogs];
            logs[1] = {
              ...logs[1],
              streamingThinking: chunk,
            };
            return { ...m, executionLogs: logs };
          }
          return m;
        })
      );
    }, 15);

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === executionMsgId && m.executionLogs) {
          const logs = [...m.executionLogs];
          logs[1] = {
            ...logs[1],
            thinkingText: codingThinking,
            streamingThinking: undefined,
          };
          return { ...m, executionLogs: logs };
        }
        return m;
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 300));

    const sqlQuery = `SELECT
    r.region_name,
    SUM(f.revenue) as total_revenue,
    COUNT(f.transaction_id) as transaction_count
FROM revenue_fact f
JOIN region_dim r ON f.region_id = r.region_id
WHERE f.quarter = 'Q3'
    AND f.year = 2025
GROUP BY r.region_name
ORDER BY total_revenue DESC`;

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === executionMsgId && m.executionLogs) {
          const logs = [...m.executionLogs];
          logs[1] = { ...logs[1], code: sqlQuery, streamingCode: '', isStreaming: true };
          return { ...m, executionLogs: logs };
        }
        return m;
      })
    );

    // Stream the SQL code
    await streamCode(sqlQuery, (chunk) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === executionMsgId && m.executionLogs) {
            const logs = [...m.executionLogs];
            logs[1] = { ...logs[1], streamingCode: chunk };
            return { ...m, executionLogs: logs };
          }
          return m;
        })
      );
    }, 12);

    // Complete coding
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === executionMsgId && m.executionLogs) {
          const logs = [...m.executionLogs];
          logs[1] = { ...logs[1], status: 'complete', isStreaming: false };
          logs[2] = { ...logs[2], status: 'in-progress' };
          return { ...m, executionPhase: 'fetching', executionLogs: logs };
        }
        return m;
      })
    );

    // PHASE 3: Fetching data (with thinking)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const fetchingThinking = "Executing the query against the data warehouse. This will scan the revenue_fact table for Q3 2025 data and join with region dimension table to get regional names.";

    // Stream thinking for fetching phase
    await streamText(fetchingThinking, (chunk) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === executionMsgId && m.executionLogs) {
            const logs = [...m.executionLogs];
            logs[2] = {
              ...logs[2],
              streamingThinking: chunk,
            };
            return { ...m, executionLogs: logs };
          }
          return m;
        })
      );
    }, 15);

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === executionMsgId && m.executionLogs) {
          const logs = [...m.executionLogs];
          logs[2] = {
            ...logs[2],
            thinkingText: fetchingThinking,
            streamingThinking: undefined,
          };
          return { ...m, executionLogs: logs };
        }
        return m;
      })
    );
    
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const fetchingDetails = [
      'Connecting to data warehouse...',
      'Executing query on revenue_fact table...',
      'Retrieved 5 regions, 47,892 transactions',
      'Preparing visualization...',
    ];

    for (let i = 0; i < fetchingDetails.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === executionMsgId && m.executionLogs) {
            const logs = [...m.executionLogs];
            logs[2] = {
              ...logs[2],
              details: fetchingDetails.slice(0, i + 1),
            };
            return { ...m, executionLogs: logs };
          }
          return m;
        })
      );
    }

    // Complete fetching
    await new Promise((resolve) => setTimeout(resolve, 400));
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === executionMsgId && m.executionLogs) {
          const logs = [...m.executionLogs];
          logs[2] = { ...logs[2], status: 'complete' };
          return { ...m, executionPhase: 'complete', executionExpanded: false, executionLogs: logs };
        }
        return m;
      })
    );

    // Create artifacts and show results
    await new Promise((resolve) => setTimeout(resolve, 300));

    const sqlArtifact: SQLArtifact = {
      type: 'sql',
      query: sqlQuery,
      trustLevel: 'trusted',
      validatedBy: 'Sarah Chen',
      validatedDate: 'Oct 2025',
      usedIn: 143,
      lastExecuted: '2 minutes ago',
      rowsReturned: 5,
    };

    const chartArtifact: ChartArtifact = {
      type: 'chart',
      chartType: 'bar',
      title: 'Q3 2025 Revenue by Region',
      xAxis: 'Region',
      yAxis: 'Total Revenue ($)',
      data: [
        { region: 'West', revenue: 3254123 },
        { region: 'East', revenue: 4523891 },
        { region: 'North', revenue: 3982445 },
        { region: 'South', revenue: 3123789 },
        { region: 'Central', revenue: 2345678 },
      ],
      isAnimating: true,
      insights: [
        '🏆 East region leads with $4.52M (26% of total)',
        '📈 North region shows strong performance at $3.98M',
        '📊 Total Q3 revenue across all regions: $17.23M',
        '⚠️ Central region underperforming (14% of total)',
      ],
    };

    const tableArtifact: TableArtifact = {
      type: 'table',
      title: 'Results: Q3 Revenue by Region',
      columns: ['Region', 'Revenue', 'Transactions', 'Avg Order'],
      rows: [
        ['East', '$4,523,891', '12,456', '$363'],
        ['North', '$3,982,445', '10,234', '$389'],
        ['West', '$3,254,123', '9,876', '$329'],
        ['South', '$3,123,789', '8,765', '$356'],
        ['Central', '$2,345,678', '7,234', '$324'],
      ],
      totalRows: 5,
    };

    // Open artifact panel - SQL as default for analysts/admins, chart for users
    setArtifactPanelArtifacts([chartArtifact, tableArtifact, sqlArtifact]);
    const defaultTab = hasPermission(user.role, 'canEditAgents') ? 'sql' : 'chart';
    setActiveArtifactTab(defaultTab);
    setArtifactPanelOpen(true);

    // Add results message
    const resultsMsg: Message = {
      id: (Date.now() + 1000).toString(),
      role: 'assistant',
      content: "Here's your **Q3 2025 revenue analysis by region**:\n\nThe data shows **$17.23M in total revenue** across all regions. The **East region is the top performer** with $4.52M, representing 26% of total revenue. _View the chart panel for detailed visualizations._",
      timestamp: new Date(),
      artifacts: [chartArtifact, tableArtifact, sqlArtifact],
      showReviewButton: true,
    };

    setMessages((prev) => [...prev, resultsMsg]);

    // Save message to shared store
    if (conversationId !== 'new') {
      addMessageToStore(conversationId, resultsMsg as any);
    }

    // Re-enable auto scroll
    setShouldAutoScroll(true);
  };

  const handleRequestReview = () => {
    const recipientName = selectedAnalyst?.name || analystEmail;
    
    if (!recipientName) {
      toast.error('Please select an analyst or enter an email');
      return;
    }

    // AI-generate summary based on the SQL query
    const aiSummary = `This query analyzes Q3 2025 revenue data by region. It performs a join between the revenue_fact and region_dim tables to aggregate sales figures. The analysis focuses on the third quarter (months 7-9) and groups results by geographic region to identify performance patterns.`;
    setGeneratedSummary(aiSummary);
    
    const notification: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Review request sent to **${recipientName}**.\n\nAn AI-generated summary has been prepared and shared with the analyst for review.\n\n_You'll be notified when the review is complete._`,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, notification];
    setMessages(updatedMessages);

    setReviewDialogOpen(false);
    toast.success(`Review request sent to ${recipientName}`);

    // Mark the current conversation as needing review using shared store
    if (currentConvId === 'new') {
      // Create a new conversation if we're in a new chat
      const newConvId = `conv-${Date.now()}`;
      const newTitle = messages.length > 0 ? messages[0].content.substring(0, 50) : 'New Analysis';
      
      addConversation({
        id: newConvId,
        title: newTitle,
        userId: user?.id || 'unknown',
        userName: user?.name || 'Current User',
        agentId: 'agent-1',
        agentName: 'Revenue Analytics Agent',
        status: 'review-needed',
        messages: updatedMessages as any[],
      });
      
      setCurrentConvId(newConvId);
      setCurrentConversationStatus('review-needed');
      
      // Navigate to the new conversation
      navigate(`/chat/${newConvId}`);
    } else {
      // Add notification message to existing conversation
      addMessageToStore(currentConvId, notification as any);
      
      // Request review in the store
      requestReviewInStore(currentConvId, user?.id || 'unknown', user?.name || 'Current User');
      setCurrentConversationStatus('review-needed');
    }

    // Reset selection
    setSelectedAnalyst(null);
    setAnalystEmail('');
  };

  // Removed handleAnalystReviewSubmit - replaced with inline approval in SQL artifact viewer

  const handleAnalystReviewSubmit_UNUSED = () => {
    if (!analystDecision) {
      toast.error('Please approve or reject the query');
      return;
    }

    const recipientName = reviewData?.recipientName || 'Analyst';
    
    if (analystDecision === 'approve') {
      // Build approval message
      let approvalContent = `✅ **Query approved by ${recipientName}**\n\n`;
      
      if (analystNotes.trim()) {
        approvalContent += `**Validation Notes:**\n_"${analystNotes}"_\n\n`;
      } else {
        approvalContent += `**Validation Notes:**\n_"Query structure looks good. The join logic is optimal and filters are appropriate for Q3 2025 analysis. Approved for production use."_\n\n`;
      }
      
      if (addToGoldenSet) {
        approvalContent += `⭐ **This query has been added to the Golden Set** and will be available as a trusted query for future analyses.`;
      }
      
      const validationMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: approvalContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, validationMessage]);
      toast.success('Query approved' + (addToGoldenSet ? ' and added to Golden Set' : ''));
    } else {
      // Build rejection message
      let rejectionContent = `❌ **Query rejected by ${recipientName}**\n\n`;
      
      if (analystNotes.trim()) {
        rejectionContent += `**Feedback:**\n_"${analystNotes}"_\n\n`;
      } else {
        rejectionContent += `Please revise the query and resubmit for review.`;
      }
      
      const rejectionMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: rejectionContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, rejectionMessage]);
      toast.error('Query rejected - please review feedback');
    }

    // Reset and close
    setAnalystReviewDialogOpen(false);
    setReviewData(null);
    setAnalystDecision(null);
    setAddToGoldenSet(false);
    setAnalystNotes('');
    setRequestingSql('');
  };

  const handleViewArtifacts = (artifacts: Artifact[]) => {
    setArtifactPanelArtifacts(artifacts);
    // SQL as default for analysts/admins, chart for users
    const defaultTab = hasPermission(user.role, 'canEditAgents') ? 'sql' : 'chart';
    setActiveArtifactTab(defaultTab);
    setArtifactPanelOpen(true);
  };

  const toggleExecutionLogs = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, executionExpanded: !m.executionExpanded } : m
      )
    );
  };

  const toggleThinking = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, thinkingExpanded: !m.thinkingExpanded } : m
      )
    );
  };

  const handleEditSql = (logId: string, currentSql: string) => {
    setEditingLogId(logId);
    setEditingSql(currentSql);
    setSqlEditDialogOpen(true);
  };

  const handleSaveSql = () => {
    if (!editingLogId) return;

    setMessages((prev) =>
      prev.map((m) => {
        if (m.executionLogs) {
          const updatedLogs = m.executionLogs.map((log) =>
            log.id === editingLogId ? { ...log, code: editingSql } : log
          );
          return { ...m, executionLogs: updatedLogs };
        }
        return m;
      })
    );

    setSqlEditDialogOpen(false);
    setEditingLogId(null);
    setEditingSql('');
    toast.success('SQL query updated');
  };

  // Handle opening Save Rule dialog
  const handleSaveAsRule = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    // Extract definition from artifacts or message content
    let definition = '';
    if (message.artifacts && message.artifacts.length > 0) {
      const sqlArtifact = message.artifacts.find(a => a.type === 'sql') as SQLArtifact | undefined;
      if (sqlArtifact && sqlArtifact.query) {
        definition = sqlArtifact.query;
        // Try to extract WHERE clause for cleaner rules
        const whereMatch = sqlArtifact.query.match(/WHERE\s+(.+?)(?:GROUP BY|ORDER BY|LIMIT|$)/is);
        if (whereMatch) {
          definition = whereMatch[1].trim();
        }
      }
    }

    setRuleMessageId(messageId);
    setRuleDefinition(definition);
    setRuleName('');
    setRuleType('custom');
    setRuleDescription('');
    setRuleIsPublic(false);
    setShowSaveRuleDialog(true);
  };

  // Handle saving the rule
  const handleSaveRule = () => {
    if (!ruleName.trim()) {
      toast.error('Please enter a rule name');
      return;
    }

    if (!ruleDefinition.trim()) {
      toast.error('No definition found to save');
      return;
    }

    const newRule = addRule({
      name: ruleName.trim(),
      owner: user?.email || '',
      type: ruleType,
      description: ruleDescription.trim() || `Rule saved from chat`,
      definition: ruleDefinition,
      visibility: ruleIsPublic ? 'public' : 'private',
      sharedWith: ruleIsPublic ? [] : [user?.email || ''],
      metadata: {},
      sourceType: 'chat',
      sourceConversationId: currentConvId,
    });

    // Mark message as having saved rule
    if (ruleMessageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === ruleMessageId
            ? { ...m, savedAsRule: true, savedRuleName: newRule.name, savedRuleId: newRule.id }
            : m
        )
      );
    }

    setShowSaveRuleDialog(false);
    toast.success(`Rule "${newRule.name}" saved successfully!`);
    
    // Reset form
    setRuleName('');
    setRuleType('custom');
    setRuleDescription('');
    setRuleDefinition('');
    setRuleIsPublic(false);
    setRuleMessageId(null);
  };

  // ════════════════════════════════════════════════════��══════════
  // RENDER
  // ═══════════════��═══════════════════════════════════════════════

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Centered Welcome Mode - Shows when no messages */}
      {isCenteredMode && messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#00B5B3]" />
            </div>
            <h1 className="text-[#333333] mb-2">
              What can I help you analyze today?
            </h1>
            <p className="text-[#666666]">
              Ask questions about your data, run analysis, or explore insights
            </p>
          </motion.div>

          {/* Centered Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-3xl"
          >
            <div
              className={`
                relative rounded-lg border-2 transition-all
                ${isFocused 
                  ? 'border-[#00B5B3] shadow-lg shadow-[#00B5B3]/10' 
                  : 'border-[#EEEEEE] hover:border-[#DDDDDD]'
                }
              `}
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="How can I help you today?"
                className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-[#333333] placeholder:text-[#999999] pr-12"
              />
              <div className="absolute bottom-3 right-3">
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  size="sm"
                  className="bg-[#00B5B3] hover:bg-[#009996] disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Helper Text */}
            <div className="mt-2 text-xs text-[#999999] text-center">
              Press <kbd className="px-1.5 py-0.5 bg-[#F5F5F5] rounded border border-[#EEEEEE]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-[#F5F5F5] rounded border border-[#EEEEEE]">Shift + Enter</kbd> for new line
            </div>
          </motion.div>

          {/* Example Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-3xl mt-12"
          >
            <div className="text-sm text-[#666666] mb-4">
              Try these examples:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Regular Example */}
              <motion.button
                onClick={() => setInput('Analyze Q3 2025 revenue by region and product line')}
                className="group p-4 rounded-lg border border-[#EEEEEE] hover:border-[#00B5B3] hover:shadow-md transition-all text-left"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#F5F5F5] group-hover:bg-[#E6F7F7] transition-colors">
                    <BarChart3 className="w-4 h-4 text-[#666666] group-hover:text-[#00B5B3] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#333333] mb-1">
                      Analyze Q3 revenue
                    </div>
                    <div className="text-xs text-[#999999]">
                      Break down revenue by region and product line
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Regular Example 2 */}
              <motion.button
                onClick={() => setInput('Show me customer churn trends for Q3 2025')}
                className="group p-4 rounded-lg border border-[#EEEEEE] hover:border-[#00B5B3] hover:shadow-md transition-all text-left"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#F5F5F5] group-hover:bg-[#E6F7F7] transition-colors">
                    <Database className="w-4 h-4 text-[#666666] group-hover:text-[#00B5B3] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#333333] mb-1">
                      Customer insights
                    </div>
                    <div className="text-xs text-[#999999]">
                      Show customer churn trends this quarter
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Regular Example 3 */}
              <motion.button
                onClick={() => setInput('Compare year-over-year sales performance')}
                className="group p-4 rounded-lg border border-[#EEEEEE] hover:border-[#00B5B3] hover:shadow-md transition-all text-left"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#F5F5F5] group-hover:bg-[#E6F7F7] transition-colors">
                    <TableIcon className="w-4 h-4 text-[#666666] group-hover:text-[#00B5B3] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#333333] mb-1">
                      Sales performance
                    </div>
                    <div className="text-xs text-[#999999]">
                      Compare YoY sales performance
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Demo Error Hints */}
            <div className="mt-8 p-4 rounded-lg bg-[#F5F5F5] border border-[#EEEEEE]">
              <div className="text-xs text-[#666666] mb-2">
                <span className="font-medium text-[#333333]">Demo error scenarios:</span> Try typing these phrases to see error handling:
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <code className="px-2 py-1 bg-white rounded border border-[#DDDDDD] text-[#666666]">analyze sales trends</code>
                <code className="px-2 py-1 bg-white rounded border border-[#DDDDDD] text-[#666666]">revenue forecast</code>
                <code className="px-2 py-1 bg-white rounded border border-[#DDDDDD] text-[#666666]">customer churn last month</code>
                <code className="px-2 py-1 bg-white rounded border border-[#DDDDDD] text-[#666666]">financial projections</code>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Normal Chat Mode - Shows when there are messages */}
      {(!isCenteredMode || messages.length > 0) && (
        <div className={`flex flex-col ${artifactPanelOpen ? 'flex-1' : 'flex-1'} relative overflow-hidden`}>
          {/* Back Button - Shows when viewing existing conversation */}
          {conversationId && conversationId !== 'new' && messages.length > 0 && (
            <div className="absolute top-4 left-8 z-20">
              <Button
                onClick={() => navigate('/chat/dashboard')}
                variant="ghost"
                size="sm"
                className="text-[#666666] hover:text-[#333333] bg-[#FAFAFA] hover:bg-[#F5F5F5] border-2 border-[#DDDDDD] hover:border-[#CCCCCC]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chats
              </Button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className={`${artifactPanelOpen ? 'max-w-full' : 'max-w-[800px]'} mx-auto px-8 ${conversationId && conversationId !== 'new' && messages.length > 0 ? 'pt-16 pb-8' : 'py-8'}`}>

              <AnimatePresence mode="popLayout">
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <MessageComponent
                      key={msg.id}
                      message={msg}
                      onViewArtifacts={handleViewArtifacts}
                      onRequestReview={() => setReviewDialogOpen(true)}
                      onSaveAsRule={handleSaveAsRule}
                      onToggleExecutionLogs={toggleExecutionLogs}
                      onToggleThinking={toggleThinking}
                      onEditSql={handleEditSql}
                      onApprovePlan={handleApprovePlan}
                      analysisMessageRef={msg.executionLogs && msg.executionLogs.length > 0 ? analysisMessageRef : undefined}
                      planGenerationRef={msg.showAnalysisPlan && msg.isPlanGenerating ? planGenerationRef : undefined}
                    />
                  ))}
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-[#666666]"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </AnimatePresence>
            </div>
          </div>

          {/* Input Area */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border-t border-[#EEEEEE] px-6 py-4 bg-white flex-shrink-0"
          >
            <div className={`${artifactPanelOpen ? 'max-w-full' : 'max-w-[800px]'} mx-auto flex items-end gap-2`}>
              <Button variant="ghost" size="sm" className="text-[#666666] mb-2">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your question... (try 'analyze Q3 revenue by region')"
                className="flex-1 resize-none border-[#DDDDDD] min-h-[44px] max-h-[120px]"
                rows={1}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  className="bg-[#00B5B3] hover:bg-[#009996] mb-2"
                  size="sm"
                >
                  Send
                </Button>
              </motion.div>
              <Button variant="ghost" size="sm" className="text-[#666666] mb-2">
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Artifact Panel with Tabs */}
      <AnimatePresence>
          {artifactPanelOpen && artifactPanelArtifacts.length > 0 && (
            <motion.div
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 border-l border-[#EEEEEE] bg-white flex flex-col overflow-hidden"
            >
              <div className="border-b border-[#EEEEEE] px-6 py-4 flex items-center justify-between">
                <h3 className="font-medium text-[#333333]">Artifacts</h3>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setArtifactPanelOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>

              <Tabs value={activeArtifactTab} onValueChange={setActiveArtifactTab} className="flex-1 flex flex-col">
                <div className="border-b border-[#EEEEEE] px-6">
                  <TabsList className="bg-transparent">
                    {artifactPanelArtifacts.some(a => a.type === 'chart') && (
                      <TabsTrigger value="chart" className="gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Chart
                      </TabsTrigger>
                    )}
                    {artifactPanelArtifacts.some(a => a.type === 'table') && (
                      <TabsTrigger value="table" className="gap-2">
                        <TableIcon className="w-4 h-4" />
                        Table
                      </TabsTrigger>
                    )}
                    {artifactPanelArtifacts.some(a => a.type === 'sql') && (
                      <TabsTrigger value="sql" className="gap-2">
                        <Code className="w-4 h-4" />
                        SQL
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {artifactPanelArtifacts.map((artifact) => (
                    <TabsContent 
                      key={artifact.type} 
                      value={artifact.type}
                      className="p-6 mt-0 h-full"
                    >
                      <ArtifactViewer 
                        artifact={artifact} 
                        conversationStatus={currentConversationStatus}
                        onReviewComplete={() => {
                          setCurrentConversationStatus('reviewed');
                          // Update status in shared store
                          if (currentConvId !== 'new') {
                            approveQueryInStore(
                              currentConvId, 
                              user?.id || 'unknown', 
                              user?.name || 'Analyst',
                              'Query approved and added to Golden Set'
                            );
                            toast.success('Query added to Golden Set');
                          }
                        }}
                      />
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Review Request Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Analyst Review</DialogTitle>
            <DialogDescription>
              Request expert validation for your SQL query
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Recent Analysts */}
            <div>
              <Label className="text-sm font-medium text-[#374151] mb-3 block">
                Recent Analysts
              </Label>
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-2"
              >
                {MOCK_ANALYSTS.map((analyst) => (
                  <motion.div
                    key={analyst.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setSelectedAnalyst(analyst);
                      setAnalystEmail(analyst.name.toLowerCase().replace(' ', '.') + '@alchemdata.ai');
                    }}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedAnalyst?.id === analyst.id
                        ? 'border-[#00B5B3] bg-[#E0F7F7]'
                        : 'border-[#E5E7EB] hover:border-[#00B5B3]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00B5B3] text-white flex items-center justify-center text-sm">
                        {analyst.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#111827]">{analyst.name}</span>
                          {analyst.available && (
                            <Badge className="text-[10px] bg-[#00B98E] hover:bg-[#00B98E] px-1.5 py-0">
                              Available
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280]">{analyst.specialty} • Avg: {analyst.avgResponse}</p>
                      </div>
                      <AnimatePresence>
                        {selectedAnalyst?.id === analyst.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <CheckCircle className="w-4 h-4 text-[#00B5B3]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Or Add Email */}
            <div>
              <Label htmlFor="analyst-email" className="text-sm font-medium text-[#374151] mb-2 block">
                Or Enter Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <Input
                  id="analyst-email"
                  type="email"
                  placeholder="analyst@company.com"
                  value={analystEmail}
                  onChange={(e) => {
                    setAnalystEmail(e.target.value);
                    if (e.target.value) {
                      setSelectedAnalyst(null); // Clear selected analyst when typing email
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Info Message */}
            <div className="p-4 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB]">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#00B5B3] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#374151] font-medium mb-1">
                    AI-Generated Summary
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    An AI-generated summary of your SQL query will be created and shared with the analyst for review. The analyst will validate the query and decide whether to add it to the Golden Set.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setReviewDialogOpen(false);
                setSelectedAnalyst(null);
                setAnalystEmail('');
                setRequestingSql('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#00B5B3] hover:bg-[#009996]"
              onClick={handleRequestReview}
              disabled={!selectedAnalyst && !analystEmail}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SQL Edit Dialog */}
      <Dialog open={sqlEditDialogOpen} onOpenChange={setSqlEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#111827]">Edit SQL Query</h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Modify the SQL query below. The updated query will be used for the analysis.
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <Textarea
              value={editingSql}
              onChange={(e) => setEditingSql(e.target.value)}
              className="w-full h-full font-mono text-sm resize-none min-h-[300px]"
              placeholder="Enter your SQL query..."
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setSqlEditDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#00B5B3] hover:bg-[#009996]"
              onClick={handleSaveSql}
            >
              <Check className="w-4 h-4 mr-2" />
              Save & Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MESSAGE COMPONENT
// ═══════════════════════════════════════════════���═══════════════════

function MessageComponent({
  message,
  onViewArtifacts,
  onRequestReview,
  onToggleExecutionLogs,
  onToggleThinking,
  onEditSql,
  onApprovePlan,
  analysisMessageRef,
  planGenerationRef,
}: {
  message: Message;
  onViewArtifacts: (artifacts: Artifact[]) => void;
  onRequestReview: () => void;
  onToggleExecutionLogs: (msgId: string) => void;
  onToggleThinking: (msgId: string) => void;
  onEditSql: (logId: string, sql: string) => void;
  onApprovePlan: (msgId: string) => void;
  analysisMessageRef?: React.RefObject<HTMLDivElement>;
  planGenerationRef?: React.RefObject<HTMLDivElement>;
}) {
  if (message.role === 'user') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start mb-6"
      >
        <div className="bg-[#F3F4F6] text-[#374151] rounded-full px-5 py-2 text-sm inline-block">
          {message.content}
        </div>
      </motion.div>
    );
  }

  const displayContent = message.isStreaming ? message.streamingContent : message.content;

  return (
    <motion.div 
      ref={analysisMessageRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Thinking/Reasoning Phase - Minimal Figma-style */}
      <AnimatePresence>
        {message.showThinking && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleThinking(message.id);
              }}
              className="w-full text-left py-1.5 hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#999999]">Reasoning</span>
                {message.isThinking && (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Loader2 className="w-3 h-3 animate-spin text-[#00B5B3]" />
                  </motion.div>
                )}
                {!message.thinkingExpanded && !message.isThinking && (
                  <span className="text-xs text-[#999999]">
                    • {message.thinkingSteps?.length || 0} steps
                  </span>
                )}
                {message.thinkingExpanded ? (
                  <ChevronDown className="w-3 h-3 text-[#BBBBBB] ml-auto" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-[#BBBBBB] ml-auto" />
                )}
              </div>
            </button>
            
            <AnimatePresence mode="wait">
              {message.thinkingExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="py-2 space-y-1.5 pl-6">
                    {message.thinkingSteps?.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="text-sm text-[#6B7280] font-light"
                      >
                        • {step}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Plan Preview - Shows BEFORE execution */}
      <AnimatePresence>
        {message.showAnalysisPlan && message.analysisPlan && (
          <motion.div 
            ref={planGenerationRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Plan text content - same format as system message */}
            <div className="text-[#111827] prose prose-sm max-w-none mb-4">
              <p className="mb-3">
                To answer your question, I'll follow these steps:
              </p>

              {/* Steps as conversational list */}
              <div className="space-y-2">
                {message.analysisPlan.steps.map((step, idx) => {
                  const isVisible = !message.isPlanGenerating || (message.planStepsVisible ?? 0) > idx;
                  const hasTrustedBadge = step.isTrusted;
                  
                  return (
                    <AnimatePresence key={idx} mode="wait">
                      {isVisible ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ 
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1]
                          }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-start gap-2 text-[#111827]">
                            <span>{idx + 1}.</span>
                            <div className="flex-1">
                              <div className="flex items-start gap-2">
                                <span className="flex-1">
                                  <strong>{step.title}</strong>
                                  {step.details.length > 0 && (
                                    <span>
                                      {' — '}
                                      {step.details.join(', ')}
                                    </span>
                                  )}
                                  {hasTrustedBadge && (
                                    <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-[#00B5B3]/10 text-[#00B5B3] rounded text-[11px] align-middle">
                                      <Shield className="w-3 h-3" />
                                      Trusted
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        message.isPlanGenerating && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-2"
                          >
                            <div className="w-3 h-3 bg-[#E5E7EB] rounded animate-pulse mt-1.5" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-4 bg-[#E5E7EB] rounded animate-pulse w-3/4" />
                            </div>
                          </motion.div>
                        )
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs opacity-60 mt-3">
                <span>⏱ {message.analysisPlan.estimatedTime}</span>
                <span>•</span>
                <span>{message.analysisPlan.expectedOutput}</span>
              </div>
            </div>

            {/* Approval button - always visible when plan is ready */}
            {message.needsApproval && !message.isPlanGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2"
              >
                <Button
                  onClick={() => onApprovePlan(message.id)}
                  size="sm"
                  className="bg-[#00B5B3] hover:bg-[#009996] text-white"
                >
                  Approve & Execute
                </Button>
                <Button variant="outline" size="sm" className="text-[#6B7280]">
                  Modify
                </Button>
                <Button variant="ghost" size="sm" className="text-[#6B7280]">
                  ✕ Cancel
                </Button>
              </motion.div>
            )}

            {!message.needsApproval && (
              <div className="text-xs text-[#999999] font-light flex items-center gap-1.5">
                <span>Plan approved — executing...</span>
                <Check className="w-3 h-3 text-[#00B98E]" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution Logs - Minimal style */}
      <AnimatePresence>
        {message.executionLogs && message.executionLogs.length > 0 && (
          <motion.div 
            ref={analysisMessageRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-2"
          >
            {/* Collapsible Header */}
            <button
              onClick={() => onToggleExecutionLogs(message.id)}
              className="w-full py-1.5 flex items-center gap-2 text-left hover:opacity-70 transition-opacity"
            >
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs text-[#6B7280]">
                  {message.executionPhase === 'complete' 
                    ? 'Completed analysis' 
                    : 'Working on analysis...'}
                </span>
                
                {message.executionPhase === 'complete' ? (
                  <Check className="w-3.5 h-3.5 text-[#00B98E]" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00B5B3]" />
                )}
                
                {!message.executionExpanded && message.executionPhase === 'complete' && (
                  <span className="text-xs text-[#999999] font-light">
                    • 3 steps • Generated SQL, chart, and table
                  </span>
                )}
              </div>
              
              {message.executionExpanded ? (
                <ChevronDown className="w-3 h-3 text-[#BBBBBB] flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#BBBBBB] flex-shrink-0" />
              )}
            </button>

            {/* Expanded Logs */}
            <AnimatePresence>
              {message.executionExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="py-3 space-y-4 pl-6">
                    {message.executionLogs.map((log) => (
                      <ExecutionLogComponent key={log.id} log={log} onEditSql={onEditSql} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Handling UI */}
      {message.errorType && (
        <>
          {/* System Error */}
          {message.errorType === 'system_error' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-[#FF6B6B] rounded-lg bg-[#FFE6E6]"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#FF4444] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-[#333333] mb-1">System Error</h4>
                  <p className="text-sm text-[#666666] mb-3">
                    We're experiencing technical difficulties. {message.errorMetadata?.retryable ? 'Please try again in a few moments.' : 'Please come back later.'}
                  </p>
                  {message.errorMetadata?.retryable && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[#FF4444] border-[#FF4444] hover:bg-[#FF4444] hover:text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Access Denied - Private Agent */}
          {message.errorType === 'access_denied' && message.errorMetadata?.privateAgentNames && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-[#00B5B3] rounded-lg bg-[#E0F7F7]"
            >
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#00B5B3] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-[#333333] mb-1">Context Available in Private Agent</h4>
                  <p className="text-sm text-[#666666] mb-2">
                    I couldn't find the context needed to answer your question in the agents you have access to.
                  </p>
                  <p className="text-sm text-[#666666] mb-3">
                    However, the following private agent{message.errorMetadata.privateAgentNames.length > 1 ? 's' : ''} may have the information you need:
                  </p>
                  <div className="space-y-2 mb-3">
                    {message.errorMetadata.privateAgentNames.map((agentName, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-[#374151]">
                        <Database className="w-4 h-4 text-[#00B5B3]" />
                        <span className="font-medium">{agentName}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#00B5B3] hover:bg-[#009996] text-white"
                    onClick={() => {
                      toast.success('Access request sent to admin');
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Request Access
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Message Content with Typography */}
      {displayContent && !message.errorType && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[#111827] prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: displayContent
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/_(.*?)_/g, '<em>$1</em>')
              .replace(/\n/g, '<br />')
          }}
        />
      )}

      {/* Artifact Summary */}
      <AnimatePresence>
        {message.artifacts && message.artifacts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-3"
          >
            <div className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg bg-white">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#374151]">
                  Generated {message.artifacts.length} artifact{message.artifacts.length > 1 ? 's' : ''}
                </span>
                <div className="flex gap-1.5">
                  {message.artifacts.map((artifact, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs text-[#6B7280]">
                      {artifact.type === 'sql' && 'SQL 📝'}
                      {artifact.type === 'chart' && 'Chart 📊'}
                      {artifact.type === 'table' && 'Table 📋'}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewArtifacts(message.artifacts!)}
                className="text-[#00B5B3] hover:text-[#00B5B3] hover:bg-[#E0F7F7]"
              >
                View All
                <Maximize2 className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Review Button */}
      <AnimatePresence>
        {message.showReviewButton && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <Button
              onClick={onRequestReview}
              variant="outline"
              size="sm"
              className="text-[#6B7280] hover:text-[#00B5B3] hover:border-[#00B5B3]"
            >
              Request Analyst Review
              <Users className="w-4 h-4 ml-2" />
            </Button>
            {/* Save as Rule Button */}
            {message.artifacts && message.artifacts.some(a => a.type === 'sql') && !message.savedAsRule && (
              <Button
                onClick={() => onSaveAsRule?.(message.id)}
                variant="outline"
                size="sm"
                className="text-[#00B5B3] hover:text-[#00B5B3] hover:bg-[#E0F7F7] border-[#00B5B3]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save as Rule
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Saved Rule Badge */}
      <AnimatePresence>
        {message.savedAsRule && message.savedRuleName && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2"
          >
            <Badge className="bg-[#E0F7F7] text-[#00B5B3] border-0">
              <Check className="w-3 h-3 mr-1" />
              Saved as: {message.savedRuleName}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SQL SYNTAX HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════════

function highlightSql(sql: string): string {
  const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|GROUP BY|ORDER BY|HAVING|AS|COUNT|SUM|AVG|MAX|MIN|DISTINCT|LIMIT|OFFSET|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|DATABASE)\b/gi;
  const functions = /\b(COUNT|SUM|AVG|MAX|MIN|UPPER|LOWER|TRIM|LENGTH|SUBSTRING|CONCAT|ROUND|FLOOR|CEIL|NOW|DATE|YEAR|MONTH|DAY)\s*\(/gi;
  const strings = /'([^']*)'/g;
  const numbers = /\b(\d+)\b/g;
  const comments = /(--[^\n]*)/g;
  
  return sql
    .replace(keywords, '<span style="color: #C586C0;">$1</span>')
    .replace(functions, '<span style="color: #DCDCAA;">$1</span>(')
    .replace(strings, '<span style="color: #CE9178;">\'$1\'</span>')
    .replace(numbers, '<span style="color: #B5CEA8;">$1</span>')
    .replace(comments, '<span style="color: #6A9955;">$1</span>');
}

// ═════════════════════════��═════════════════════════════════════════
// EXECUTION LOG COMPONENT
// ═══════════════════════════════════════════════════════════════════

function ExecutionLogComponent({ log, onEditSql }: { log: ExecutionLog; onEditSql: (logId: string, sql: string) => void }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        {log.status === 'complete' && (
          <div className="w-5 h-5 rounded-full bg-[#00B98E] flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        {log.status === 'in-progress' && (
          <div className="w-5 h-5 rounded-full border-2 border-[#00B5B3] flex items-center justify-center">
            <Loader2 className="w-3 h-3 animate-spin text-[#00B5B3]" />
          </div>
        )}
        {log.status === 'pending' && (
          <div className="w-5 h-5 rounded-full border-2 border-[#D1D5DB]" />
        )}
        {log.status === 'failed' && (
          <div className="w-5 h-5 rounded-full bg-[#FF4444] flex items-center justify-center">
            <X className="w-3 h-3 text-white" />
          </div>
        )}
        {log.stepNumber < log.totalSteps && (
          <div className={`w-0.5 h-8 mt-1 ${
            log.status === 'complete' ? 'bg-[#00B98E]' : 
            log.status === 'failed' ? 'bg-[#FF4444]' : 
            'bg-[#E5E7EB]'
          }`} />
        )}
      </div>

      <div className="flex-1 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm ${
            log.status === 'complete' 
              ? 'text-[#6B7280]' 
              : log.status === 'in-progress'
              ? 'text-[#374151]'
              : log.status === 'failed'
              ? 'text-[#FF4444]'
              : 'text-[#9CA3AF]'
          }`}>
            {log.stepNumber}. {log.title}
          </span>
        </div>

        {/* Error Message for Failed Status */}
        {log.status === 'failed' && log.errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1.5 p-2 rounded border border-[#FF6B6B] bg-[#FFE6E6]"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF4444] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#666666]">
                {log.errorMessage}
              </div>
            </div>
          </motion.div>
        )}

        {/* Thinking Text - Shows what the AI is doing */}
        {(log.thinkingText || log.streamingThinking) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1.5"
          >
            <div className="text-xs text-[#6B7280] font-light">
              {log.streamingThinking || log.thinkingText}
              {log.streamingThinking && (
                <motion.span 
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block ml-1"
                >
                  ▊
                </motion.span>
              )}
            </div>
          </motion.div>
        )}

        {/* Details */}
        {log.details && log.details.length > 0 && (
          <div className="space-y-1 mt-1.5">
            {log.details.map((detail, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-xs text-[#6B7280] font-light flex items-start gap-2"
              >
                <span className="text-[#00B5B3] mt-0.5">▸</span>
                <span>{detail}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Code Block - Compact with light background */}
        {log.code && (
          <div className="mt-2 rounded border border-[#E5E7EB] bg-[#F9FAFB] group">
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280]">query.sql</span>
              {!log.isStreaming && log.status === 'complete' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditSql(log.id, log.code!)}
                  className="text-xs h-6 text-[#6B7280] hover:text-[#00B5B3] hover:bg-[#E5E7EB] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            <div className="p-2.5">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#374151]">
                {log.isStreaming ? (
                  <span>{log.streamingCode}</span>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: highlightSql(log.code) }} />
                )}
                {log.isStreaming && (
                  <motion.span 
                    variants={typewriterCursor}
                    animate="blink"
                    className="inline-block w-1 h-3 bg-[#00B5B3] ml-1"
                  />
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ARTIFACT VIEWER
// ════��═══════════════════════════════════════════════���══════════════

function ArtifactViewer({ 
  artifact, 
  conversationStatus,
  onReviewComplete 
}: { 
  artifact: Artifact;
  conversationStatus?: string;
  onReviewComplete?: () => void;
}) {
  const { user } = useAuthStore();
  const [addedToGolden, setAddedToGolden] = useState(false);
  const [editedQuery, setEditedQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);
  
  const handleAddToGoldenSet = () => {
    setAddedToGolden(true);
    toast.success('Query added to Golden Set');
  };
  
  const handleApproveAndAddToGolden = () => {
    if (onReviewComplete) {
      onReviewComplete();
    }
    setShowReviewSuccess(true);
    setAddedToGolden(true);
    toast.success('Query approved and added to Golden Set');
  };
  
  if (artifact.type === 'sql') {
    const displayQuery = isEditing ? editedQuery : (artifact.isStreaming ? artifact.streamingQuery : artifact.query);
    const isAnalystReview = conversationStatus === 'review-needed' && hasPermission(user.role, 'canEditAgents');
    
    // Initialize edited query
    if (!editedQuery && artifact.query) {
      setEditedQuery(artifact.query);
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col border border-[#E5E7EB] rounded-lg p-4"
      >
        {/* Review Banner for Analysts */}
        {isAnalystReview && !showReviewSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-[#FFF4E6] border border-[#FFD666] rounded-lg"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#FF9900] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-[#333333] mb-1">Review Requested</h4>
                <p className="text-sm text-[#666666] mb-2">
                  A user has requested analyst review for this SQL query. Review the query below, make any necessary edits, and approve to add it to the Golden Set.
                </p>
                <p className="text-xs text-[#999999]">
                  <strong>AI Summary:</strong> This query analyzes Q3 2025 revenue data by region. It performs a join between revenue_fact and region_dim tables to aggregate sales figures by geographic region.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Banner */}
        {showReviewSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-[#E6F9F4] border border-[#00B98E] rounded-lg"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00B98E] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-[#333333] mb-1">✅ Query Approved</h4>
                <p className="text-sm text-[#666666]">
                  This query has been validated and added to the Golden Set. It's now available as a trusted query for future analyses.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-[#333333]">SQL Query</h3>
            <TrustBadge level={artifact.trustLevel} validator={artifact.validatedBy} />
            {isEditing && (
              <Badge className="bg-[#FF9900] hover:bg-[#FF9900] text-white text-xs">
                Editing
              </Badge>
            )}
          </div>
          {artifact.validatedBy && (
            <p className="text-xs text-[#666666]">
              Validated by: {artifact.validatedBy} ({artifact.validatedDate})
            </p>
          )}
        </div>

        <div className="border border-[#EEEEEE] rounded-lg p-4 bg-[#FAFAFA] font-mono text-xs mb-4 flex-1 overflow-auto">
          <div className="flex gap-4">
            <div className="text-[#999999] select-none text-right pr-2 border-r border-[#EEEEEE]">
              {displayQuery?.split('\n').map((_, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  {idx + 1}
                </motion.div>
              ))}
            </div>
            <pre className="whitespace-pre text-[#333333] flex-1">
              {displayQuery}
              {artifact.isStreaming && (
                <motion.span 
                  variants={typewriterCursor}
                  animate="blink"
                  className="inline-block w-1 h-3 bg-[#00B5B3] ml-1"
                />
              )}
            </pre>
          </div>
        </div>

        {!artifact.isStreaming && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button size="sm" className="bg-[#00B5B3] hover:bg-[#009996]">
                Run Query
                <Play className="w-3 h-3 ml-2" />
              </Button>
              <Button size="sm" variant="outline">
                Copy
                <Copy className="w-3 h-3 ml-2" />
              </Button>
              <Button size="sm" variant="outline">
                Edit
                <Edit className="w-3 h-3 ml-2" />
              </Button>
              <Button size="sm" variant="outline">
                Export
                <Download className="w-3 h-3 ml-2" />
              </Button>
              {!hasPermission(user.role, 'canEditAgents') ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setRequestingSql(artifact.query);
                  setGeneratedSummary(`Please review and validate this SQL query for Q3 2025 revenue analysis:\n\n${artifact.query.substring(0, 200)}...`);
                  setReviewDialogOpen(true);
                }}
              >
                Request Analyst Review
                <UserPlus className="w-3 h-3 ml-2" />
              </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    toast.success('Query added to Golden Set');
                  }}
                  className="text-[#00B5B3] border-[#00B5B3] hover:bg-[#00B5B3] hover:text-white"
                >
                  Add to Golden Set
                  <Star className="w-3 h-3 ml-2" />
                </Button>
              )}
            </div>

            <div className="space-y-3 text-sm border-t border-[#EEEEEE] pt-4">
              <div>
                <p className="text-xs text-[#999999]">Last executed</p>
                <p className="text-[#333333]">{artifact.lastExecuted}</p>
              </div>
              <div>
                <p className="text-xs text-[#999999]">Rows returned</p>
                <p className="text-[#333333]">{artifact.rowsReturned}</p>
              </div>
              {artifact.usedIn && (
                <div>
                  <p className="text-xs text-[#999999]">Used in conversations</p>
                  <p className="text-[#333333]">{artifact.usedIn}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#EEEEEE]">
              <h4 className="text-sm font-medium mb-3">Feedback 💭</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Helpful
                  <ThumbsUp className="w-3 h-3 ml-2" />
                </Button>
                <Button size="sm" variant="outline">
                  Not Helpful
                  <ThumbsDown className="w-3 h-3 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  }

  if (artifact.type === 'chart') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col border border-[#E5E7EB] rounded-lg p-4"
      >
        <h3 className="font-medium text-[#333333] mb-4">{artifact.title}</h3>

        <div className="border border-[#EEEEEE] rounded-lg p-6 mb-4 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={artifact.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
              <XAxis dataKey="region" />
              <YAxis />
              <RechartsTooltip />
              <Bar 
                dataKey="revenue" 
                fill="#00B5B3" 
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Insights */}
        {artifact.insights && artifact.insights.length > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
            <h4 className="text-sm font-medium text-[#374151] mb-2">Key Insights 💡</h4>
            <ul className="space-y-1.5">
              {artifact.insights.map((insight, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-sm text-[#6B7280]"
                >
                  {insight}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            Download as PNG, SVG, or PDF
            <Download className="w-4 h-4 ml-2" />
          </Button>

          <div className="text-sm space-y-2 border-t border-[#EEEEEE] pt-4">
            <div>
              <p className="text-xs text-[#999999]">Chart Type</p>
              <p className="text-[#333333] capitalize">{artifact.chartType}</p>
            </div>
            <div>
              <p className="text-xs text-[#999999]">Data Points</p>
              <p className="text-[#333333]">{artifact.data.length}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (artifact.type === 'table') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col border border-[#E5E7EB] rounded-lg p-4"
      >
        <h3 className="font-medium text-[#333333] mb-4">{artifact.title}</h3>

        <Button variant="outline" className="w-full mb-4">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>

        <div className="border border-[#EEEEEE] rounded-lg overflow-hidden flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA] sticky top-0">
                {artifact.columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs text-[#666666] uppercase"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {artifact.rows.map((row, rowIdx) => (
                <motion.tr 
                  key={rowIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIdx * 0.05 }}
                  className="border-b border-[#EEEEEE] last:border-0"
                >
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3 text-[#333333]">
                      {cell}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-[#666666] mt-4">
          Showing {artifact.totalRows} rows × {artifact.columns.length} columns
        </p>
      </motion.div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════
// TRUST BADGE
// ═══════════════════════════════════════════════════════════════════

function TrustBadge({
  level,
  validator,
}: {
  level: 'trusted' | 'team-validated' | 'new';
  validator?: string;
}) {
  if (level === 'trusted') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <Badge className="bg-[#00B98E] hover:bg-[#00B98E] text-white text-xs">
          ✓ Trusted Query
          {validator && ` • ${validator}`}
        </Badge>
      </motion.div>
    );
  }

  if (level === 'team-validated') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <Badge className="bg-[#0066CC] hover:bg-[#0066CC] text-white text-xs">
          👥 Team Validated
          {validator && ` • ${validator}`}
        </Badge>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 15 }}
    >
      <Badge variant="outline" className="bg-[#FFF9E6] border-[#FFE8A3] text-[#B8860B] text-xs">
        ⚠️ Review Needed
      </Badge>
    </motion.div>
  );
}
