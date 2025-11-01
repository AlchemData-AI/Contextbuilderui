import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardLayout } from '../../components/wizard/WizardLayout';
import { TwoPanelWizardLayout, PanelItem } from '../../components/wizard/TwoPanelWizardLayout';
import { WizardChat } from '../../components/wizard/WizardChat';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ValidationItem {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'completed';
  answer?: string;
}

const MOCK_VALIDATION_ITEMS: ValidationItem[] = [
  {
    id: 'q1',
    label: 'Order ID clarification',
    description: 'We see order id, main order id and order line id in the same table, which one represents what?',
    status: 'pending',
  },
  {
    id: 'q2',
    label: 'Return flag repetition',
    description: 'We see repetition of rows for return flags being marked differently, what does that mean?',
    status: 'pending',
  },
  {
    id: 'q3',
    label: 'GMV currency unit',
    description: 'Is GMV in paise or rupee?',
    status: 'pending',
  },
];

export function Step4AnalysisValidation() {
  const navigate = useNavigate();
  const [validationItems, setValidationItems] = useState(MOCK_VALIDATION_ITEMS);
  const [activeItemId, setActiveItemId] = useState(MOCK_VALIDATION_ITEMS[0].id);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const activeItem = validationItems.find((i) => i.id === activeItemId);

  const panelItems: PanelItem[] = validationItems.map((item) => ({
    id: item.id,
    label: item.label,
    description: item.description,
    completed: completedItems.has(item.id),
    inputType: 'free-text',
  }));

  const handleConfirm = (value: string) => {
    if (!activeItem) return;

    setValidationItems((items) =>
      items.map((item) =>
        item.id === activeItemId ? { ...item, status: 'completed', answer: value } : item
      )
    );

    setCompletedItems(new Set(completedItems).add(activeItemId));
    toast.success('Answer saved');
    moveToNextPending();
  };

  const handleSkip = () => {
    if (!activeItem) return;
    setCompletedItems(new Set(completedItems).add(activeItemId));
    toast.success('Question marked as done');
    moveToNextPending();
  };

  const moveToNextPending = () => {
    const currentIndex = validationItems.findIndex((i) => i.id === activeItemId);
    const nextPending = validationItems
      .slice(currentIndex + 1)
      .find((i) => !completedItems.has(i.id));

    if (nextPending) {
      setActiveItemId(nextPending.id);
    }
  };

  const handleContinue = () => {
    if (completedItems.size < validationItems.length) {
      toast.error('Please answer all questions before continuing');
      return;
    }

    localStorage.setItem('wizardData', JSON.stringify({
      ...JSON.parse(localStorage.getItem('wizardData') || '{}'),
      validationItems,
    }));

    toast.success('Validation complete');
    navigate('/agents/create/step-5');
  };

  const renderContent = () => {
    if (!activeItem) return null;

    return (
      <WizardChat
        key={activeItemId}
        taskTitle={activeItem.label}
        taskDescription={activeItem.description}
        initialPrompt={`I see that ${activeItem.description.toLowerCase()} Could you help clarify this so I can better understand your data?`}
        placeholder="Type your answer..."
        onConfirm={handleConfirm}
        onSkip={handleSkip}
      />
    );
  };

  return (
    <WizardLayout
      currentStep={4}
      totalSteps={6}
      title="Analysis Validation"
      onBack={() => navigate('/agents/create/step-3')}
      onSaveDraft={() => {
        localStorage.setItem('wizardDraft', JSON.stringify({
          step: 4,
          validationItems,
        }));
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
                    {completedItems.size}/{validationItems.length} question{validationItems.length !== 1 ? 's' : ''} answered
                  </span>
                </div>
                {completedItems.size === validationItems.length && (
                  <Badge variant="outline" className="bg-[#E8F5E9] text-[#4CAF50] border-[#4CAF50]">
                    <Check className="w-3 h-3 mr-1" />
                    Ready to continue
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleContinue}
                className="bg-[#00B5B3] hover:bg-[#009996]"
                disabled={completedItems.size < validationItems.length}
              >
                Continue to Relationships
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
