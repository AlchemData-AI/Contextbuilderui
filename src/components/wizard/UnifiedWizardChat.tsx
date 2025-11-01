import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Loader2, Sparkles, ChevronDown, ChevronUp, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

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
}

interface TaskSection {
  id: string;
  title: string;
  description: string;
  type: 'chat' | 'multiple-choice';
  status: 'active' | 'completed' | 'upcoming';
  messages: Message[];
  // For multiple choice
  choices?: { value: string; label: string; description: string }[];
  selectedChoice?: string;
  showChatForChoice?: boolean;
}

interface UnifiedWizardChatProps {
  sections: TaskSection[];
  onSectionComplete: (sectionId: string, value: string) => void;
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

export function UnifiedWizardChat({
  sections: initialSections,
  onSectionComplete,
  className,
}: UnifiedWizardChatProps) {
  const [sections, setSections] = useState<TaskSection[]>(initialSections);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [extractedValue, setExtractedValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSection = sections.find((s) => s.status === 'active');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sections]);

  const generateAIResponse = (userInput: string, sectionTitle: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (sectionTitle.includes('Business Context')) {
      if (activeSection && activeSection.messages.length === 1) {
        return "Great! Based on what you've described, it sounds like you're building an agent for sales analytics. Would you like me to help you structure a business context that covers revenue analysis, product performance tracking, and customer behavior insights?";
      } else if (lowerInput.includes('yes') || lowerInput.includes('sure')) {
        return "Perfect! I'll help you create a comprehensive business context. This agent will help sales managers and executives analyze revenue trends, identify top-performing products, monitor customer purchasing patterns, and generate insights across different regions and time periods. Does this align with your needs? If so, I can confirm this as your business context.";
      }
    } else if (sectionTitle.includes('Target Users')) {
      if (activeSection && activeSection.messages.length === 0) {
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
    if (!input.trim() || isLoading || !activeSection) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setSections((prev) =>
      prev.map((section) =>
        section.id === activeSection.id
          ? { ...section, messages: [...section.messages, userMessage] }
          : section
      )
    );

    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      simulateAIResponse(userMessage.content);
    }, 800);
  };

  const simulateAIResponse = (userInput: string) => {
    if (!activeSection) return;

    const aiMessageId = (Date.now() + 1).toString();

    // Add thinking phase
    setSections((prev) =>
      prev.map((section) =>
        section.id === activeSection.id
          ? {
              ...section,
              messages: [
                ...section.messages,
                {
                  id: aiMessageId,
                  role: 'assistant' as const,
                  content: '',
                  timestamp: new Date(),
                  showThinking: true,
                  isThinking: true,
                  thinkingExpanded: true,
                  thinkingSteps: ['Processing your input...', 'Understanding context...'],
                },
              ],
            }
          : section
      )
    );

    // Simulate thinking steps
    setTimeout(() => {
      setSections((prev) =>
        prev.map((section) =>
          section.id === activeSection.id
            ? {
                ...section,
                messages: section.messages.map((msg) =>
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
                ),
              }
            : section
        )
      );
    }, 400);

    // After thinking, stream the response
    setTimeout(() => {
      const responseContent = generateAIResponse(userInput, activeSection.title);
      const hasConfirm = responseContent.toLowerCase().includes('confirm');

      if (hasConfirm) {
        setShowConfirmButton(true);
        setExtractedValue(userInput);
      }

      // Start streaming
      setSections((prev) =>
        prev.map((section) =>
          section.id === activeSection.id
            ? {
                ...section,
                messages: section.messages.map((msg) =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        isThinking: false,
                        isStreaming: true,
                        streamingContent: '',
                      }
                    : msg
                ),
              }
            : section
        )
      );

      // Simulate streaming
      let currentIndex = 0;
      const streamInterval = setInterval(() => {
        if (currentIndex < responseContent.length) {
          setSections((prev) =>
            prev.map((section) =>
              section.id === activeSection.id
                ? {
                    ...section,
                    messages: section.messages.map((msg) =>
                      msg.id === aiMessageId
                        ? {
                            ...msg,
                            streamingContent: responseContent.slice(0, currentIndex + 1),
                          }
                        : msg
                    ),
                  }
                : section
            )
          );
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setSections((prev) =>
            prev.map((section) =>
              section.id === activeSection.id
                ? {
                    ...section,
                    messages: section.messages.map((msg) =>
                      msg.id === aiMessageId
                        ? {
                            ...msg,
                            content: responseContent,
                            isStreaming: false,
                            streamingContent: undefined,
                          }
                        : msg
                    ),
                  }
                : section
            )
          );
          setIsLoading(false);
        }
      }, 20);
    }, 1500);
  };

  const handleConfirm = () => {
    if (!activeSection) return;

    setShowConfirmButton(false);
    onSectionComplete(activeSection.id, extractedValue);
    setExtractedValue('');
  };

  const handleChoiceSelect = (sectionId: string, value: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, selectedChoice: value } : section
      )
    );
  };

  const handleChoiceConfirm = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section && section.selectedChoice) {
      onSectionComplete(sectionId, section.selectedChoice);
    }
  };

  const toggleChatForChoice = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, showChatForChoice: !section.showChatForChoice }
          : section
      )
    );
  };

  const toggleThinking = (sectionId: string, messageId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              messages: section.messages.map((msg) =>
                msg.id === messageId ? { ...msg, thinkingExpanded: !msg.thinkingExpanded } : msg
              ),
            }
          : section
      )
    );
  };

  return (
    <div className={cn('absolute inset-0 flex flex-col bg-white', className)}>
      {/* Scrollable area - contains all sections */}
      <div className="flex-1 overflow-y-auto pb-10">
        <div className="px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {sections.map((section, sectionIndex) => (
            <div key={section.id}>
              {/* Section Header */}
              <div
                className={cn(
                  'mb-6 pb-4',
                  sectionIndex > 0 && 'border-t-2 border-[#EEEEEE] pt-8'
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      section.status === 'completed'
                        ? 'bg-[#E8F5E9]'
                        : section.status === 'active'
                        ? 'bg-gradient-to-br from-[#00B5B3] to-[#0099A8]'
                        : 'bg-[#F8F9FA]'
                    )}
                  >
                    {section.status === 'completed' ? (
                      <Check className="w-5 h-5 text-[#4CAF50]" />
                    ) : (
                      <Sparkles
                        className={cn(
                          'w-5 h-5',
                          section.status === 'active' ? 'text-white' : 'text-[#999999]'
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={cn(
                        section.status === 'active' ? 'text-[#333333]' : 'text-[#999999]'
                      )}
                    >
                      {section.title}
                    </h3>
                    {section.status === 'completed' && (
                      <p className="text-xs text-[#4CAF50]">Completed ✓</p>
                    )}
                  </div>
                </div>
                <p
                  className={cn(
                    'text-sm leading-relaxed ml-[52px]',
                    section.status === 'active' ? 'text-[#666666]' : 'text-[#999999]'
                  )}
                >
                  {section.description}
                </p>
              </div>

              {/* Section Content */}
              {section.status !== 'upcoming' && (
                <>
                  {/* Chat Messages */}
                  {section.type === 'chat' || section.showChatForChoice ? (
                    <div className="space-y-6">
                      <AnimatePresence mode="popLayout">
                        {section.messages.map((message) => (
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
                                        onClick={() => toggleThinking(section.id, message.id)}
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
                                            <div
                                              key={idx}
                                              className="flex items-start gap-2 text-xs text-[#666666]"
                                            >
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
                                    <div className="bg-[#F8F9FA] rounded-lg px-4 py-3">
                                      <p className="text-sm text-[#333333] whitespace-pre-wrap">
                                        {message.isStreaming
                                          ? message.streamingContent
                                          : message.content}
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

                              {message.role === 'user' && (
                                <p className="text-sm">{message.content}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : null}

                  {/* Multiple Choice */}
                  {section.type === 'multiple-choice' && !section.showChatForChoice && (
                    <div className="space-y-4">
                      <RadioGroup
                        value={section.selectedChoice}
                        onValueChange={(value) => handleChoiceSelect(section.id, value)}
                      >
                        <div className="space-y-3">
                          {section.choices?.map((choice) => (
                            <div
                              key={choice.value}
                              className={cn(
                                'border-2 rounded-lg p-4 cursor-pointer transition-all',
                                section.selectedChoice === choice.value
                                  ? 'border-[#00B5B3] bg-[#F0FFFE]'
                                  : 'border-[#EEEEEE] hover:border-[#CCCCCC]'
                              )}
                              onClick={() => handleChoiceSelect(section.id, choice.value)}
                            >
                              <div className="flex items-start gap-3">
                                <RadioGroupItem
                                  value={choice.value}
                                  id={choice.value}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <Label htmlFor={choice.value} className="cursor-pointer">
                                    {choice.label}
                                  </Label>
                                  <p className="text-xs text-[#666666] mt-1">
                                    {choice.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleChoiceConfirm(section.id)}
                          disabled={!section.selectedChoice}
                          className="bg-[#00B5B3] hover:bg-[#009996]"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Confirm Selection
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => toggleChatForChoice(section.id)}
                          className="border-[#DDDDDD] hover:bg-[#FAFBFC]"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Need help? Chat with AI
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Sticky input at bottom - only shows for active section */}
      {activeSection && (activeSection.type === 'chat' || activeSection.showChatForChoice) && (
        <div className="flex-shrink-0 border-t border-[#EEEEEE] bg-white">
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
          <div className="p-6 space-y-3">
            <div className="flex gap-2">
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
                placeholder={`Discuss ${activeSection.title.toLowerCase()}...`}
                disabled={isLoading}
                className="min-h-[44px] max-h-[120px] resize-none border-[#DDDDDD] focus:border-[#00B5B3] transition-colors"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-[#00B5B3] hover:bg-[#009996] flex-shrink-0 h-[44px] px-4"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            <p className="text-xs text-[#999999] text-center">
              Always review the accuracy of responses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
