# Analyst Review Workflow Update

## Overview
This document describes the updated analyst review workflow where review requests stay within the same chat conversation instead of creating a separate approval flow.

## Key Changes

###  1. Updated Flow
**Before:**
- User clicks "Request Analyst Review" button in SQL artifact
- Opens a dialog to select analyst
- Sends review as separate notification
- Analyst sees separate review dialog

**After:**
- User clicks "Request Analyst Review" button in SQL artifact
- Conversation is marked with status "review-needed"
- System message is added to the conversation
- Conversation appears in ChatDashboard with "review-needed" status
- Analyst opens the conversation and sees all SQL artifacts
- Analyst can click "Add to Golden Set" directly from SQL artifacts
- Analyst provides feedback by typing in the chat

### 2. Data Model Updates

```typescript
interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messageCount: number;
  messages: Message[];
  status?: 'review-needed' | 'reviewed' | 'in-progress' | 'completed';  // NEW
  user?: string;  // NEW
  agent?: string;  // NEW
}
```

### 3. Button Rendering Logic

In SQL artifact viewer:
- **Users** (no edit_agents permission): See "Request Analyst Review" button
- **Analysts/Admins** (has edit_agents permission): See "Add to Golden Set" button

The button shown is based on user role, NOT on conversation status. This allows:
- Users to always request reviews
- Analysts to always add to golden set when they view any conversation

### 4. Request Review Handler

Simplified to just:
1. Add a system message to the conversation
2. Update conversation status to "review-needed"
3. Show toast notification

No dialog, no analyst selection, no separate review flow.

### 5. Analyst Workflow

1. Analyst sees conversations with "review-needed" status in ChatDashboard
2. Analyst clicks on conversation to open it
3. Analyst reviews the chat history and SQL artifacts
4. In each SQL artifact, analyst sees "Add to Golden Set" button
5. Analyst can add query to golden set with one click
6. Analyst can provide feedback/motivation by typing in the chat
7. When done, conversation status can be updated to "reviewed"

### 6. Removed Components

- Analyst selection dialog (for requesting review)
- Separate analyst review dialog
- Email input for analyst
- Mock analysts list (MOCK_ANALYSTS)

### 7. State Variables to Remove

- `reviewDialogOpen`
- `selectedAnalyst`
- `analystEmail`
- `requestingSql`
- `generatedSummary`
- `analystReviewDialogOpen`
- `reviewData`
- `analystDecision`
- `addToGoldenSet`
- `analystNotes`

## Implementation Benefits

1. **Simpler UX**: Everything happens in one place (the chat)
2. **Better Context**: Analysts see full conversation history
3. **Async Workflow**: Analysts can review when available, users don't wait
4. **No Complex State**: Removed multiple dialogs and complex state management
5. **Role-Based**: Clean separation between user and analyst capabilities

