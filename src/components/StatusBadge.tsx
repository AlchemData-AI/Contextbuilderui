import React from 'react';

type StatusType = 'published' | 'draft' | 'error' | 'running' | 'completed' | 'failed' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
}

const statusConfig: Record<StatusType, { bg: string; text: string }> = {
  published: { bg: '#4CAF50', text: '#FFFFFF' },
  draft: { bg: '#9E9E9E', text: '#FFFFFF' },
  error: { bg: '#F44336', text: '#FFFFFF' },
  running: { bg: '#FFC107', text: '#FFFFFF' },
  completed: { bg: '#4CAF50', text: '#FFFFFF' },
  failed: { bg: '#F44336', text: '#FFFFFF' },
  pending: { bg: '#FFC107', text: '#FFFFFF' },
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayText = children || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {displayText}
    </span>
  );
}
