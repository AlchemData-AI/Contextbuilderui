import { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

interface WizardLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps?: number;
  title?: string;
  onBack?: () => void;
  onSaveDraft?: () => void;
}

const steps = [
  { number: 1, label: 'Select Tables', isAdvanced: false },
  { number: 2, label: 'Persona Definition', isAdvanced: false },
  { number: 3, label: 'Run Analysis', isAdvanced: false },
  { number: 4, label: 'Validation', isAdvanced: false },
  { number: 5, label: 'Relationships', isAdvanced: false },
  { number: 6, label: 'Queries & Metrics', isAdvanced: false },
  { number: 7, label: 'Review & Publish', isAdvanced: false },
  { number: 8, label: 'Agent Relationships', isAdvanced: true },
];

export function WizardLayout({
  children,
  currentStep,
  totalSteps = 8,
  title,
  onBack,
  onSaveDraft,
}: WizardLayoutProps) {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
    } else {
      toast.success('Draft saved successfully');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-screen flex bg-[#FAFBFC]">
      {/* Left Sidebar with Vertical Steps */}
      <div className="w-[280px] bg-white border-r border-[#EEEEEE] flex flex-col">
        {/* Sidebar Header */}
        <div className="px-6 py-6 border-b border-[#EEEEEE]">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#666666] hover:text-[#333333] transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[14px]">{currentStep === 1 ? 'Dashboard' : 'Back'}</span>
          </button>
          <h2 className="text-[16px] text-[#333333]">
            {title || 'New Context Agent'}
          </h2>
          <p className="text-[12px] text-[#999999] mt-1">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Vertical Progress Steps */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;
              const isUpcoming = step.number > currentStep;

              return (
                <div key={step.number} className="relative">
                  <div className="flex items-start gap-3">
                    {/* Step Number/Check */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-[12px] font-medium transition-all ${
                        isCurrent
                          ? 'bg-[#00B5B3] text-white'
                          : isCompleted
                          ? 'bg-[#4CAF50] text-white'
                          : 'bg-[#F8F9FA] text-[#999999] border border-[#DDDDDD]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-[14px] transition-colors ${
                            isCurrent
                              ? 'text-[#333333]'
                              : isCompleted
                              ? 'text-[#666666]'
                              : 'text-[#999999]'
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.isAdvanced && (
                          <Badge 
                            variant="outline" 
                            className="bg-[#F8F9FA] border-[#DDDDDD] text-[#999999] text-[10px] px-1.5 py-0"
                          >
                            Optional
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-[15px] top-10 w-[2px] h-6 transition-colors ${
                        isCompleted ? 'bg-[#4CAF50]' : 'bg-[#EEEEEE]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Draft Button */}
        <div className="px-6 py-4 border-t border-[#EEEEEE]">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="w-full border-[#DDDDDD] hover:bg-[#F8F9FA]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header (optional - can show current step title) */}
        <div className="bg-white border-b border-[#EEEEEE] px-8 py-4">
          <h1 className="text-[20px] text-[#333333]">
            {steps[currentStep - 1]?.label || 'Step'}
          </h1>
          <p className="text-[12px] text-[#999999] mt-0.5">
            Configure your context agent settings
          </p>
        </div>

        {/* Content - Fixed height, no scrolling */}
        <div className="flex-1 min-h-0">
          <div className="h-full p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}