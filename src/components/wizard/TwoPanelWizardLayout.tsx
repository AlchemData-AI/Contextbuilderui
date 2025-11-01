import { ReactNode, useState } from 'react';
import { MessageSquare, CheckCircle2, Circle, Edit3, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

export interface PanelItem {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  inputType: 'multiple-choice' | 'free-text' | 'sql-code';
}

interface TwoPanelWizardLayoutProps {
  items: PanelItem[];
  activeItemId: string;
  onItemClick: (itemId: string) => void;
  children: ReactNode;
  onSwitchToForm?: (itemId: string) => void; // Optional: switch from chat to form
  showFormToggle?: boolean; // Show "Switch to Form" for free-text items
  isInChatMode?: boolean; // Whether currently in chat mode
}

export function TwoPanelWizardLayout({
  items,
  activeItemId,
  onItemClick,
  children,
  onSwitchToForm,
  showFormToggle = false,
  isInChatMode = false,
}: TwoPanelWizardLayoutProps) {
  const activeItem = items.find((i) => i.id === activeItemId);
  const isFreeText = activeItem?.inputType === 'free-text';

  return (
    <div className="flex h-full gap-6">
      {/* Left Panel - Items List */}
      <div className="w-[320px] flex-shrink-0 space-y-2">
        {items.map((item, index) => {
          const isActive = item.id === activeItemId;
          const isCompleted = item.completed;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                'w-full text-left p-4 rounded-lg border transition-all',
                isActive
                  ? 'border-[#00B5B3] bg-[#F0FFFE] shadow-sm'
                  : 'border-[#EEEEEE] bg-white hover:border-[#CCCCCC] hover:bg-[#FAFBFC]'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                  ) : (
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs',
                        isActive
                          ? 'border-[#00B5B3] text-[#00B5B3]'
                          : 'border-[#CCCCCC] text-[#999999]'
                      )}
                    >
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm mb-1',
                      isActive ? 'text-[#333333]' : 'text-[#666666]'
                    )}
                  >
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-[#999999] line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Panel - Active Item Content */}
      <div className="flex-1 min-w-0 bg-white rounded-tl-lg rounded-tr-lg border border-[#EEEEEE] flex flex-col self-stretch">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EEEEEE] flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00B5B3] to-[#0099A8] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-[#333333]">
              {activeItem?.label}
            </h3>
          </div>
          {showFormToggle && isFreeText && onSwitchToForm && isInChatMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSwitchToForm(activeItemId)}
              className="ml-4 border-[#DDDDDD] hover:bg-[#FAFBFC] flex-shrink-0"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Switch to Form
            </Button>
          )}
        </div>

        {/* Content Area - Relative positioned for absolute children */}
        <div className="flex-1 relative overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
