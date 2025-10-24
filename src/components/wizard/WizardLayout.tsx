import { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { Button } from '../ui/button';
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
  { number: 1, label: 'Select Tables' },
  { number: 2, label: 'Persona Definition' },
  { number: 3, label: 'Run Analysis' },
  { number: 4, label: 'Validation' },
  { number: 5, label: 'Queries & Metrics' },
  { number: 6, label: 'Review & Publish' },
];

export function WizardLayout({
  children,
  currentStep,
  totalSteps = 6,
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
    <div className="h-screen flex flex-col bg-[#FAFBFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#EEEEEE] px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#666666] hover:text-[#333333] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[14px]">{currentStep === 1 ? 'Back to Dashboard' : 'Back'}</span>
          </button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="border-[#DDDDDD] hover:bg-[#F8F9FA]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>

        <div className="mb-4">
          <h1 className="text-[20px] font-semibold text-[#333333]">{title || 'New Context Agent'}</h1>
          <p className="text-[12px] text-[#999999] mt-0.5">Step {currentStep} of {totalSteps}</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center w-7 h-7 min-w-[28px] rounded-full text-[12px] font-medium transition-colors ${
                    step.number === currentStep
                      ? 'bg-[#00B5B3] text-white'
                      : step.number < currentStep
                      ? 'bg-[#4CAF50] text-white'
                      : 'bg-[#F8F9FA] text-[#999999] border border-[#DDDDDD]'
                  }`}
                >
                  {step.number < currentStep ? '✓' : step.number}
                </div>
                <span
                  className={`text-[12px] transition-colors ${
                    step.number === currentStep
                      ? 'text-[#333333] font-medium'
                      : step.number < currentStep
                      ? 'text-[#666666]'
                      : 'text-[#999999]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-[2px] w-8 mx-2 transition-colors ${
                    step.number < currentStep ? 'bg-[#4CAF50]' : 'bg-[#EEEEEE]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">{children}</div>
    </div>
  );
}
