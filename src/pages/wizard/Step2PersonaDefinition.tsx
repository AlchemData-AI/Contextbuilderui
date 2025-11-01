import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { TwoPanelWizardLayout, PanelItem } from '../../components/wizard/TwoPanelWizardLayout';
import { WizardChat } from '../../components/wizard/WizardChat';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { ChevronRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Step2PersonaDefinition() {
  const navigate = useNavigate();

  // Form state
  const [businessContext, setBusinessContext] = useState('');
  const [targetUserRole, setTargetUserRole] = useState('');
  const [hasUserIdentification, setHasUserIdentification] = useState<'yes' | 'no' | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  // Panel state
  const [activeItemId, setActiveItemId] = useState('business-context');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [showUserIdChat, setShowUserIdChat] = useState(false);
  const [userIdConfirmed, setUserIdConfirmed] = useState(false);

  const panelItems: PanelItem[] = [
    {
      id: 'business-context',
      label: 'Business Context',
      description: 'Describe the business domain and purpose',
      completed: completedItems.has('business-context'),
      inputType: 'free-text',
    },
    {
      id: 'target-users',
      label: 'Target Users',
      description: 'Define who will use this agent',
      completed: completedItems.has('target-users'),
      inputType: 'free-text',
    },
    {
      id: 'user-identification',
      label: 'User Identification',
      description: 'How to identify users in your data',
      completed: completedItems.has('user-identification'),
      inputType: 'multiple-choice',
    },
  ];

  const handleConfirmBusinessContext = (value: string) => {
    setBusinessContext(value);
    setCompletedItems(new Set(completedItems).add('business-context'));
    setActiveItemId('target-users');
    toast.success('Business context saved');
  };

  const handleSkipBusinessContext = () => {
    setCompletedItems(new Set(completedItems).add('business-context'));
    setActiveItemId('target-users');
    toast.success('Business context marked as done');
  };

  const handleConfirmTargetUsers = (value: string) => {
    setTargetUserRole(value);
    setCompletedItems(new Set(completedItems).add('target-users'));
    setActiveItemId('user-identification');
    toast.success('Target users saved');
  };

  const handleSkipTargetUsers = () => {
    setCompletedItems(new Set(completedItems).add('target-users'));
    setActiveItemId('user-identification');
    toast.success('Target users marked as done');
  };

  const handleUserIdentificationConfirm = () => {
    if (!hasUserIdentification) {
      toast.error('Please select an option');
      return;
    }
    setUserIdConfirmed(true);
    setCompletedItems(new Set(completedItems).add('user-identification'));
    toast.success('User identification preference saved');
  };

  const handleUserIdEdit = () => {
    setUserIdConfirmed(false);
  };

  const handleUserIdChatConfirm = (value: string) => {
    // Parse the chat response to determine yes/no
    setHasUserIdentification('yes'); // Default based on chat
    setCompletedItems(new Set(completedItems).add('user-identification'));
    setShowUserIdChat(false);
    toast.success('User identification preference saved');
  };

  const handleSkipUserIdChat = () => {
    setCompletedItems(new Set(completedItems).add('user-identification'));
    setShowUserIdChat(false);
    toast.success('User identification marked as done');
  };

  const handleContinue = () => {
    if (completedItems.size < panelItems.length) {
      toast.error('Please complete all sections before continuing');
      return;
    }

    setIsLoading(true);
    const wizardData = {
      businessContext,
      targetUserRole,
      hasUserIdentification,
    };
    localStorage.setItem(
      'wizardData',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('wizardData') || '{}'),
        ...wizardData,
      })
    );
    
    setTimeout(() => {
      toast.success('Persona defined successfully');
      navigate('/agents/create/step-3');
    }, 600);
  };

  const renderContent = () => {
    const activeItem = panelItems.find((i) => i.id === activeItemId);
    if (!activeItem) return null;

    switch (activeItemId) {
      case 'business-context':
        return (
          <WizardChat
            taskTitle="Business Context"
            taskDescription="Define the business domain and what insights this agent should provide. Help us understand what business problems this agent will solve and what kind of questions users will ask."
            initialPrompt="Hi! I'm here to help you define the business context for your agent. Can you tell me about the business domain you're working with? For example, are you analyzing sales, marketing, operations, or something else?"
            placeholder="Describe your business domain..."
            onConfirm={handleConfirmBusinessContext}
            onSkip={handleSkipBusinessContext}
          />
        );

      case 'target-users':
        return (
          <WizardChat
            taskTitle="Target Users"
            taskDescription="Define who will be using this agent. Identify the primary roles, departments, or user types that will interact with this agent to get insights and answers."
            initialPrompt="Now let's define who will be using this agent. What roles or departments will benefit from this agent? For example, Sales Managers, Data Analysts, Marketing Team, or Executives?"
            placeholder="Tell me about your target users..."
            onConfirm={handleConfirmTargetUsers}
            onSkip={handleSkipTargetUsers}
          />
        );

      case 'user-identification':
        if (showUserIdChat) {
          return (
            <WizardChat
              taskTitle="User Identification"
              taskDescription="Let's discuss how to identify different users or roles in your data. This helps personalize the agent's responses based on who's asking."
              initialPrompt="Tell me more about how users are identified in your system. Do you have user IDs, role columns, or department fields in your data?"
              placeholder="Describe your user identification approach..."
              onConfirm={handleUserIdChatConfirm}
              onSkip={handleSkipUserIdChat}
            />
          );
        }

        return (
          <div className="absolute inset-0 flex flex-col">
            {userIdConfirmed ? (
              /* Confirmed state */
              <div className="flex-1 overflow-y-auto pb-10">
                <div className="p-6">
                  <div className="py-6 pr-6">
                    <p className="font-semibold text-sm text-[#333333] mb-4">✅ Task Completed</p>
                    <div className="space-y-3">
                      <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                        hasUserIdentification === 'yes' 
                          ? 'bg-[#F0FFFE] border-[#00B5B3]' 
                          : 'bg-white border-[#EEEEEE]'
                      }`}>
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                          hasUserIdentification === 'yes'
                            ? 'border-[#00B5B3] bg-[#00B5B3]'
                            : 'border-[#DDDDDD]'
                        }`}>
                          {hasUserIdentification === 'yes' && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-[#333333]">
                          Yes, I have user identification data
                        </p>
                      </div>
                      <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                        hasUserIdentification === 'no' 
                          ? 'bg-[#F0FFFE] border-[#00B5B3]' 
                          : 'bg-white border-[#EEEEEE]'
                      }`}>
                        <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                          hasUserIdentification === 'no'
                            ? 'border-[#00B5B3] bg-[#00B5B3]'
                            : 'border-[#DDDDDD]'
                        }`}>
                          {hasUserIdentification === 'no' && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-[#333333]">
                          No, all users see the same data
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="flex-1 overflow-y-auto pb-10">
                  <div className="p-6 space-y-4">
                    <div>
                      <Label>Do you need user-specific data access? *</Label>
                      <p className="text-xs text-[#999999] mt-1 mb-4">
                        This helps personalize results based on user roles or permissions
                      </p>
                      <RadioGroup
                        value={hasUserIdentification}
                        onValueChange={(value) => setHasUserIdentification(value as 'yes' | 'no')}
                      >
                        <div className="space-y-3">
                          <div
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              hasUserIdentification === 'yes'
                                ? 'border-[#00B5B3] bg-[#F0FFFE]'
                                : 'border-[#EEEEEE] hover:border-[#CCCCCC]'
                            }`}
                            onClick={() => setHasUserIdentification('yes')}
                          >
                            <RadioGroupItem value="yes" id="yes" className="sr-only" />
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <Label htmlFor="yes" className="cursor-pointer">
                                  Yes, I have user identification data
                                </Label>
                                <p className="text-xs text-[#666666] mt-1">
                                  I have tables/columns that identify different user types or roles
                                </p>
                              </div>
                              {hasUserIdentification === 'yes' && (
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00B5B3] flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              hasUserIdentification === 'no'
                                ? 'border-[#00B5B3] bg-[#F0FFFE]'
                                : 'border-[#EEEEEE] hover:border-[#CCCCCC]'
                            }`}
                            onClick={() => setHasUserIdentification('no')}
                          >
                            <RadioGroupItem value="no" id="no" className="sr-only" />
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <Label htmlFor="no" className="cursor-pointer">
                                  No, all users see the same data
                                </Label>
                                <p className="text-xs text-[#666666] mt-1">
                                  All users will have access to the same information
                                </p>
                              </div>
                              {hasUserIdentification === 'no' && (
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00B5B3] flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Footer with Confirm and Chat Option */}
                <div className="flex-shrink-0 border-t border-[#EEEEEE] p-4 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowUserIdChat(true)}
                      className="text-[#00B5B3] border-[#00B5B3] hover:bg-[#F0FFFE]"
                    >
                      Chat with AI instead
                    </Button>
                    <Button
                      onClick={handleUserIdentificationConfirm}
                      disabled={!hasUserIdentification}
                      className="bg-[#00B5B3] hover:bg-[#009996] disabled:bg-[#CCCCCC]"
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Confirmed state - minimal edit option */}
            {userIdConfirmed && (
              <div className="flex-shrink-0 border-t border-[#EEEEEE] bg-white px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-[#666666]">Section completed</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUserIdEdit}
                    className="text-[#00B5B3] hover:text-[#009996] hover:bg-[#F0FFFE] h-8 px-3"
                  >
                    Edit response
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <WizardLayout
      currentStep={2}
      totalSteps={6}
      title="Persona Definition"
      onBack={() => navigate('/agents/create/step-1')}
      onSaveDraft={() => {
        localStorage.setItem(
          'wizardDraft',
          JSON.stringify({
            step: 2,
            businessContext,
            targetUserRole,
            hasUserIdentification,
          })
        );
        toast.success('Draft saved');
      }}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <TwoPanelWizardLayout
            items={panelItems}
            activeItemId={activeItemId}
            onItemClick={setActiveItemId}
          >
            {renderContent()}
          </TwoPanelWizardLayout>
        </div>

        {/* Footer - Always show progress */}
        <div className="fixed bottom-0 left-[280px] right-0 bg-white border-t border-[#EEEEEE] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] z-40">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00B5B3] text-white flex items-center justify-center text-xs">
                    {completedItems.size}
                  </div>
                  <span className="text-sm text-[#666666]">
                    {completedItems.size}/{panelItems.length} section{panelItems.length !== 1 ? 's' : ''} completed
                  </span>
                </div>
                {completedItems.size === panelItems.length && (
                  <Badge variant="outline" className="bg-[#E8F5E9] text-[#4CAF50] border-[#4CAF50]">
                    <Check className="w-3 h-3 mr-1" />
                    Ready to continue
                  </Badge>
                )}
              </div>
              <Button 
                onClick={handleContinue} 
                className="bg-[#00B5B3] hover:bg-[#009996]"
                disabled={completedItems.size < panelItems.length || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue to Run Analysis
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
