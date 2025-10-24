import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  Network, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Send,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type ValidationItem = {
  id: string;
  type: 'relationship' | 'metric' | 'question';
  title: string;
  question: string;
  aiSuggestion: string;
  status: 'pending' | 'validated' | 'rejected' | 'modified';
  conversation: { role: 'ai' | 'user'; message: string; timestamp: Date }[];
};

const MOCK_VALIDATION_ITEMS: ValidationItem[] = [
  // Relationships
  {
    id: 'r1',
    type: 'relationship',
    title: 'orders → customers',
    question: 'How do orders relate to customers?',
    aiSuggestion: 'orders.customer_id → customers.id (One-to-Many: Each order belongs to one customer)',
    status: 'pending',
    conversation: [],
  },
  {
    id: 'r2',
    type: 'relationship',
    title: 'order_items → orders',
    question: 'How do order items relate to orders?',
    aiSuggestion: 'order_items.order_id → orders.id (One-to-Many: Each order item belongs to one order)',
    status: 'pending',
    conversation: [],
  },
  {
    id: 'r3',
    type: 'relationship',
    title: 'order_items → products',
    question: 'How do order items relate to products?',
    aiSuggestion: 'order_items.product_id → products.id (Many-to-One: Multiple order items can reference the same product)',
    status: 'pending',
    conversation: [],
  },
  // Metrics
  {
    id: 'm1',
    type: 'metric',
    title: 'Total Revenue',
    question: 'How should we calculate Total Revenue?',
    aiSuggestion: 'SELECT SUM(total_amount) FROM orders',
    status: 'pending',
    conversation: [],
  },
  {
    id: 'm2',
    type: 'metric',
    title: 'Average Order Value',
    question: 'How should we calculate Average Order Value?',
    aiSuggestion: 'SELECT AVG(total_amount) FROM orders',
    status: 'pending',
    conversation: [],
  },
  {
    id: 'm3',
    type: 'metric',
    title: 'Active Customers',
    question: 'How should we identify Active Customers?',
    aiSuggestion: 'SELECT COUNT(DISTINCT customer_id) FROM orders WHERE created_at > CURRENT_DATE - INTERVAL 90 DAY',
    status: 'pending',
    conversation: [],
  },
  // Questions
  {
    id: 'q1',
    type: 'question',
    title: 'Primary Key - orders',
    question: 'What is the primary key of the orders table?',
    aiSuggestion: 'id (auto-incrementing integer)',
    status: 'pending',
    conversation: [],
  },
  {
    id: 'q2',
    type: 'question',
    title: 'Date Field - orders',
    question: 'What date field should be used for time-based analysis in orders?',
    aiSuggestion: 'created_at (datetime field)',
    status: 'pending',
    conversation: [],
  },
];

export function Step4AnalysisValidation() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ValidationItem[]>(MOCK_VALIDATION_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(items[0]?.id || null);
  const [activeSection, setActiveSection] = useState<'all' | 'relationship' | 'metric' | 'question'>('all');
  const [chatInput, setChatInput] = useState('');
  const [quickActions, setQuickActions] = useState<string[]>(['Accept', 'Modify', 'Reject']);

  const selectedItem = items.find((item) => item.id === selectedItemId);

  const filteredBySection = items.filter((item) => 
    activeSection === 'all' || item.type === activeSection
  );

  const groupedItems = {
    relationship: filteredBySection.filter((item) => item.type === 'relationship'),
    metric: filteredBySection.filter((item) => item.type === 'metric'),
    question: filteredBySection.filter((item) => item.type === 'question'),
  };

  const handleQuickAction = (action: string) => {
    setChatInput(action);
    // Auto-submit
    setTimeout(() => handleSendMessage(action), 100);
  };

  const handleSendMessage = (message?: string) => {
    const msg = message || chatInput;
    if (!msg.trim() || !selectedItem) return;

    const newConversation = [
      ...selectedItem.conversation,
      { role: 'user' as const, message: msg, timestamp: new Date() },
    ];

    // Determine status based on message
    let newStatus = selectedItem.status;
    if (msg.toLowerCase().includes('accept')) {
      newStatus = 'validated';
    } else if (msg.toLowerCase().includes('reject')) {
      newStatus = 'rejected';
    } else if (msg.toLowerCase().includes('modify')) {
      newStatus = 'modified';
    }

    setItems(items.map((item) =>
      item.id === selectedItemId
        ? { ...item, conversation: newConversation, status: newStatus }
        : item
    ));

    setChatInput('');
    
    if (newStatus !== 'pending') {
      toast.success(`Item ${newStatus}`);
      
      // Move to next pending item
      const currentIndex = filteredBySection.findIndex((item) => item.id === selectedItemId);
      const nextItem = filteredBySection.slice(currentIndex + 1).find((item) => item.status === 'pending');
      if (nextItem) {
        setTimeout(() => setSelectedItemId(nextItem.id), 500);
      }
    }
  };

  const handleContinue = () => {
    const pendingCount = items.filter((item) => item.status === 'pending').length;
    if (pendingCount > 0) {
      toast.error(`Please validate all items (${pendingCount} remaining)`);
      return;
    }
    localStorage.setItem('wizardData', JSON.stringify({ 
      ...JSON.parse(localStorage.getItem('wizardData') || '{}'),
      validationItems: items 
    }));
    toast.success('Analysis validated successfully');
    navigate('/agents/create/step-5');
  };

  const getStatusIcon = (status: ValidationItem['status']) => {
    switch (status) {
      case 'validated':
        return <CheckCircle2 className="w-4 h-4 text-[#00B98E]" />;
      case 'rejected':
        return <X className="w-4 h-4 text-[#F04438]" />;
      case 'modified':
        return <CheckCircle2 className="w-4 h-4 text-[#F79009]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#999999]" />;
    }
  };

  const getTypeIcon = (type: ValidationItem['type']) => {
    switch (type) {
      case 'relationship':
        return <Network className="w-4 h-4 text-[#00B5B3]" />;
      case 'metric':
        return <TrendingUp className="w-4 h-4 text-[#00B5B3]" />;
      case 'question':
        return <MessageSquare className="w-4 h-4 text-[#00B5B3]" />;
    }
  };

  const validatedCount = items.filter((item) => item.status !== 'pending').length;
  const totalCount = items.length;

  const renderCodeOrText = (text: string) => {
    // Check if text contains SQL keywords or code patterns
    const sqlPattern = /\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i;
    const columnPattern = /\w+\.\w+/; // table.column pattern
    
    if (sqlPattern.test(text) || columnPattern.test(text)) {
      return (
        <pre className="bg-[#F8F9FA] border border-[#EEEEEE] rounded p-2 font-mono text-[11px] text-[#333333] overflow-x-auto whitespace-pre-wrap">
          {text}
        </pre>
      );
    }
    
    return <p className="text-xs text-[#333333]">{text}</p>;
  };

  return (
    <WizardLayout
      currentStep={4}
      totalSteps={6}
      title="Analysis & Validation"
      onBack={() => navigate('/agents/create/step-3')}
      onSaveDraft={() => {
        localStorage.setItem('wizardDraft', JSON.stringify({ step: 4, items }));
        toast.success('Draft saved');
      }}
    >
      <div className="flex h-[calc(100vh-200px)] gap-6">
        {/* Left: Listing View */}
        <div className="w-[340px] flex flex-col bg-white rounded-lg border border-[#EEEEEE] overflow-hidden">
          <div className="p-3 border-b border-[#EEEEEE] bg-[#FAFBFC]">
            <h3 className="text-sm font-semibold text-[#333333] mb-0.5">
              Validation Items
            </h3>
            <p className="text-xs text-[#666666]">
              {validatedCount} of {totalCount} validated
            </p>
          </div>

          <ScrollArea className="flex-1 h-full">
            <div className="p-2 space-y-3 pb-8">
              {/* Relationships Section */}
              {(activeSection === 'all' || activeSection === 'relationship') && groupedItems.relationship.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1.5 bg-[#E0F7F7] rounded border-l-2 border-[#00B5B3]">
                    <Network className="w-3.5 h-3.5 text-[#00B5B3]" />
                    <span className="text-[10px] font-semibold text-[#00B5B3] uppercase tracking-wide">
                      Relationships
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {groupedItems.relationship.map((item) => (
                      <Card
                        key={item.id}
                        className={`p-2.5 cursor-pointer transition-all ${
                          selectedItemId === item.id
                            ? 'border border-[#00B5B3] bg-[#F0FFFE] shadow-sm'
                            : 'border border-transparent hover:border-[#EEEEEE]'
                        }`}
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#333333] truncate">
                              {item.title}
                            </p>
                            {item.status !== 'pending' && (
                              <Badge variant="outline" className="text-[10px] mt-1 h-4">
                                {item.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics Section */}
              {(activeSection === 'all' || activeSection === 'metric') && groupedItems.metric.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1.5 bg-[#E0F7F7] rounded border-l-2 border-[#00B5B3]">
                    <TrendingUp className="w-3.5 h-3.5 text-[#00B5B3]" />
                    <span className="text-[10px] font-semibold text-[#00B5B3] uppercase tracking-wide">
                      Metrics
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {groupedItems.metric.map((item) => (
                      <Card
                        key={item.id}
                        className={`p-2.5 cursor-pointer transition-all ${
                          selectedItemId === item.id
                            ? 'border border-[#00B5B3] bg-[#F0FFFE] shadow-sm'
                            : 'border border-transparent hover:border-[#EEEEEE]'
                        }`}
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#333333] truncate">
                              {item.title}
                            </p>
                            {item.status !== 'pending' && (
                              <Badge variant="outline" className="text-[10px] mt-1 h-4">
                                {item.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Section */}
              {(activeSection === 'all' || activeSection === 'question') && groupedItems.question.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1.5 bg-[#E0F7F7] rounded border-l-2 border-[#00B5B3]">
                    <MessageSquare className="w-3.5 h-3.5 text-[#00B5B3]" />
                    <span className="text-[10px] font-semibold text-[#00B5B3] uppercase tracking-wide">
                      Questions
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {groupedItems.question.map((item) => (
                      <Card
                        key={item.id}
                        className={`p-2.5 cursor-pointer transition-all ${
                          selectedItemId === item.id
                            ? 'border border-[#00B5B3] bg-[#F0FFFE] shadow-sm'
                            : 'border border-transparent hover:border-[#EEEEEE]'
                        }`}
                        onClick={() => setSelectedItemId(item.id)}
                      >
                        <div className="flex items-start gap-2">
                          {getStatusIcon(item.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#333333] truncate">
                              {item.title}
                            </p>
                            {item.status !== 'pending' && (
                              <Badge variant="outline" className="text-[10px] mt-1 h-4">
                                {item.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Chat Interface */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-[#EEEEEE] overflow-hidden">
          {selectedItem ? (
            <>
              {/* Question Header */}
              <div className="p-4 border-b border-[#EEEEEE] bg-[#FAFBFC]">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F7F7] flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(selectedItem.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#333333] mb-1.5">{selectedItem.question}</h3>
                    {selectedItem.status !== 'pending' && (
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(selectedItem.status)}
                        <span className="text-xs text-[#666666] capitalize">{selectedItem.status}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3 max-w-3xl">
                  {/* AI Suggestion */}
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#00B5B3] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-white font-semibold">AI</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#F8F9FA] rounded-lg p-3 border border-[#EEEEEE]">
                        {renderCodeOrText(selectedItem.aiSuggestion)}
                      </div>
                      <p className="text-[10px] text-[#999999] mt-1">Just now</p>
                    </div>
                  </div>

                  {/* Conversation History */}
                  {selectedItem.conversation.map((msg, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'ai' ? 'bg-[#00B5B3]' : 'bg-[#666666]'
                      }`}>
                        <span className="text-[10px] text-white font-semibold">
                          {msg.role === 'ai' ? 'AI' : 'You'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className={`rounded-lg p-3 ${
                          msg.role === 'ai'
                            ? 'bg-[#F8F9FA] border border-[#EEEEEE]'
                            : 'bg-[#E0F7F7] border border-[#00B5B3]'
                        }`}>
                          {renderCodeOrText(msg.message)}
                        </div>
                        <p className="text-[10px] text-[#999999] mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              {selectedItem.status === 'pending' && (
                <div className="p-3 border-t border-[#EEEEEE] bg-[#FAFBFC]">
                  {/* Quick Actions */}
                  <div className="flex gap-1.5 mb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction('Accept this suggestion')}
                      className="text-xs h-7 text-[#00B98E] border-[#00B98E] hover:bg-[#E6F7F4]"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction('I want to modify this. ')}
                      className="text-xs h-7 text-[#F79009] border-[#F79009] hover:bg-[#FFF8E6]"
                    >
                      Modify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction('Reject this suggestion')}
                      className="text-xs h-7 text-[#F04438] border-[#F04438] hover:bg-[#FEF3F2]"
                    >
                      Reject
                    </Button>
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your response or feedback... (SQL, text, or questions)"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      rows={2}
                      className="resize-none text-xs border border-[#DDDDDD] focus:border-[#00B5B3] transition-colors"
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!chatInput.trim()}
                      className="bg-[#00B5B3] hover:bg-[#009996] px-3 h-auto"
                      size="sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#999999]">
              <p>Select an item to validate</p>
            </div>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleContinue}
          className="bg-[#00B5B3] hover:bg-[#009996]"
          disabled={items.some((item) => item.status === 'pending')}
        >
          Continue to Queries & Metrics
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </WizardLayout>
  );
}
