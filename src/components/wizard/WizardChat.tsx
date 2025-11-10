import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Loader2, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';

// Helper function to parse markdown bold syntax
function parseMarkdownBold(text: string) {
  const parts: (string | { bold: string })[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ bold: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  isStreaming?: boolean;
  streamingContent?: string;
  showThinking?: boolean;
  thinkingExpanded?: boolean;
  thinkingSteps?: string[];
  canConfirm?: boolean;
  isSystemMessage?: boolean;
}

interface WizardChatProps {
  taskTitle: string;
  taskDescription: string;
  initialPrompt?: string;
  placeholder?: string;
  onConfirm: (extractedValue: string) => void;
  onSkip?: () => void;
  className?: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const typewriterCursor = {
  blink: {
    opacity: [1, 1, 0, 0],
    transition: { duration: 1, repeat: Infinity },
  },
};

export function WizardChat({
  taskTitle,
  taskDescription,
  initialPrompt,
  placeholder = 'Type your message...',
  onConfirm,
  onSkip,
  className,
}: WizardChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialPrompt) {
      return [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: initialPrompt,
          timestamp: new Date(),
        },
      ];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [extractedValue, setExtractedValue] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset chat when taskTitle or initialPrompt changes (new conversation)
  useEffect(() => {
    if (initialPrompt) {
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: initialPrompt,
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages([]);
    }
    setInput('');
    setIsLoading(false);
    setShowConfirmButton(false);
    setExtractedValue('');
    setIsConfirmed(false);
  }, [taskTitle, initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAIResponse = (userInput: string, taskInfo: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (taskInfo.includes('Business Context')) {
      if (messages.length === 1) {
        return "Great! Based on what you've described, it sounds like you're building an agent for sales analytics. Would you like me to help you structure a business context that covers revenue analysis, product performance tracking, and customer behavior insights?";
      } else if (lowerInput.includes('yes') || lowerInput.includes('sure')) {
        return "Perfect! I'll help you create a comprehensive business context. This agent will help sales managers and executives analyze revenue trends, identify top-performing products, monitor customer purchasing patterns, and generate insights across different regions and time periods. Does this align with your needs? If so, I can confirm this as your business context.";
      }
    } else if (taskInfo.includes('Target Users')) {
      if (messages.length === 1) {
        return "I understand you want to define who will use this agent. Common user types include Sales Managers, Data Analysts, Executives, or Marketing Teams. Who do you envision using this agent?";
      } else if (
        lowerInput.includes('sales') ||
        lowerInput.includes('manager') ||
        lowerInput.includes('analyst')
      ) {
        return `Excellent choice! ${userInput} are perfect users for this type of agent. They'll benefit from quick access to sales data, revenue metrics, and performance analytics. Shall I confirm "${userInput}" as your target user role?`;
      }
    }

    return `I understand. Based on our conversation, I can help you with that. Let me know if you'd like to confirm this information or if you need any adjustments.`;
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInputText = input.trim();
    setInput('');
    
    // Check if user typed "confirm" - trigger confirmation immediately
    if (userInputText.toLowerCase() === 'confirm' && messages.length > 0) {
      setShowConfirmButton(true);
      // Use the previous user message as the extracted value, or the confirm text
      const previousUserMessages = messages.filter(m => m.role === 'user');
      if (previousUserMessages.length > 0) {
        setExtractedValue(previousUserMessages[previousUserMessages.length - 1].content);
      }
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      simulateAIResponse(userInputText);
    }, 800);
  };

  const simulateAIResponse = (userInput: string) => {
    const aiMessageId = (Date.now() + 1).toString();

    // Add thinking phase
    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        showThinking: true,
        isThinking: true,
        thinkingExpanded: true,
        thinkingSteps: ['Processing your input...', 'Understanding context...'],
      },
    ]);

    // Simulate thinking steps
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                thinkingSteps: [
                  'Processing your input...',
                  'Understanding context...',
                  'Analyzing requirements...',
                  'Preparing response...',
                ],
              }
            : msg
        )
      );
    }, 400);

    // After thinking, stream the response
    setTimeout(() => {
      const responseContent = generateAIResponse(userInput, taskTitle);
      const hasConfirm = responseContent.toLowerCase().includes('confirm');

      if (hasConfirm) {
        setShowConfirmButton(true);
        setExtractedValue(userInput);
        
        // Add a message explaining what will be confirmed
        setTimeout(() => {
          const confirmPromptMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: `Ready to Confirm\n\nClick the "Confirm & Continue" button below when you're ready to save this information and proceed.`,
            timestamp: new Date(),
            isSystemMessage: true,
          };
          setMessages((prev) => [...prev, confirmPromptMessage]);
        }, 2000);
      }

      // Start streaming
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                isThinking: false,
                isStreaming: true,
                streamingContent: '',
                canConfirm: hasConfirm,
              }
            : msg
        )
      );

      // Simulate streaming
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < responseContent.length) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    streamingContent: responseContent.slice(0, currentIndex + 1),
                  }
                : msg
            )
          );
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: responseContent,
                    isStreaming: false,
                    streamingContent: undefined,
                  }
                : msg
            )
          );
          setIsLoading(false);
        }
      }, 20);
    }, 1500);
  };

  const handleConfirm = () => {
    // Add confirmation message to chat
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Task Completed ✅`,
      timestamp: new Date(),
      isSystemMessage: true,
    };
    setMessages((prev) => [...prev, confirmationMessage]);
    setIsConfirmed(true);
    setShowConfirmButton(false);
    
    // Call the confirm handler after a brief delay to show the message
    setTimeout(() => {
      onConfirm(extractedValue);
    }, 600);
  };

  const handleRestart = () => {
    setIsConfirmed(false);
    setShowConfirmButton(false);
    setExtractedValue('');
  };

  const toggleThinking = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, thinkingExpanded: !msg.thinkingExpanded } : msg
      )
    );
  };

  return (
    <div className={cn('h-full flex flex-col bg-white', className)}>
      {/* Scrollable area - contains messages */}
      <div className="flex-1 overflow-y-auto pb-10">
        {/* Messages */}
        <div className="px-6 py-6">
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-lg',
                      message.role === 'user'
                        ? 'bg-[#00B5B3] text-white px-4 py-3 max-w-lg'
                        : 'space-y-3 w-full'
                    )}
                  >
                  {message.role === 'assistant' && (
                    <>
                      {/* Thinking Phase */}
                      {message.showThinking && message.thinkingSteps && (
                        <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded-lg p-3">
                          <button
                            onClick={() => toggleThinking(message.id)}
                            className="flex items-center justify-between w-full text-left"
                          >
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#00B5B3]" />
                              <span className="text-xs text-[#666666]">
                                {message.isThinking ? 'Thinking...' : 'Thought process'}
                              </span>
                            </div>
                            {message.thinkingExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#999999]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#999999]" />
                            )}
                          </button>

                          {message.thinkingExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-2 space-y-1.5"
                            >
                              {message.thinkingSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-[#666666]">
                                  <span className="text-[#00B5B3] mt-0.5">•</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* AI Response */}
                      {(message.content || message.isStreaming) && (
                        <div className="rounded-lg pr-4">
                          <p className="text-sm text-[#333333]">
                            {parseMarkdownBold(message.isStreaming ? message.streamingContent || '' : message.content).map((part, idx) => 
                              typeof part === 'string' ? (
                                <span key={idx}>{part}</span>
                              ) : (
                                <strong key={idx}>{part.bold}</strong>
                              )
                            )}
                            {message.isStreaming && (
                              <motion.span
                                variants={typewriterCursor}
                                animate="blink"
                                className="inline-block w-0.5 h-4 bg-[#00B5B3] ml-0.5"
                              />
                            )}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {message.role === 'user' && <p className="text-sm">{message.content}</p>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Sticky input/confirmation at bottom */}
      <div className="flex-shrink-0 bg-transparent">
        {isConfirmed ? (
          /* Confirmed state - minimal restart option */
          <div className="px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-[#666666]">Section completed</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                className="text-[#00B5B3] hover:text-[#009996] hover:bg-[#F0FFFE] h-8 px-3"
              >
                Edit response
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Confirm banner */}
            {showConfirmButton && (
              <div className="px-6 pt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#E8F5E9] border border-[#4CAF50] rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4CAF50]" />
                    <p className="text-sm text-[#2E7D32]">Ready to confirm and continue</p>
                  </div>
                  <Button
                    onClick={handleConfirm}
                    className="bg-[#4CAF50] hover:bg-[#45A049] text-white"
                    size="sm"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm & Continue
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Input area */}
            <div className="px-6 pb-6 pt-2">
              <div className="flex gap-2 items-end bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-3 border border-[#EEEEEE]">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={placeholder}
                  disabled={isLoading}
                  className="min-h-[36px] max-h-[120px] resize-none border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none"
                />
                {onSkip && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Add a prominent confirmation message to chat
                      const confirmMessage: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: `Task Completed ✅`,
                        timestamp: new Date(),
                        isSystemMessage: true,
                      };
                      setMessages((prev) => [...prev, confirmMessage]);
                      setIsConfirmed(true);
                      // Call the skip handler after a brief delay
                      setTimeout(() => {
                        onSkip();
                      }, 600);
                    }}
                    className="border-[#00B5B3] text-[#00B5B3] hover:bg-[#F0FFFE] hover:border-[#009996] h-9 px-3 flex-shrink-0"
                    title="Mark as Done"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#00B5B3] hover:bg-[#009996] flex-shrink-0 h-9 px-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
