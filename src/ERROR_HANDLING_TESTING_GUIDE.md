# Error Handling Testing Guide

## Overview
This guide explains how to test the three error handling scenarios implemented in the AI Chat interface.

## What Was Implemented

Three error types with distinct UI treatments:

### 1. **Lack of Context Error** (Yellow/Amber Alert)
- Occurs when the AI doesn't have enough information to answer within the current agent's knowledge base
- Non-blocking - user can provide more details in next message
- No action buttons needed

### 2. **System Error** (Red Alert)
- Technical difficulties or backend failures
- Shows retry button if `errorMetadata.retryable = true`
- Provides clear error messaging

### 3. **Access Denied - Private Agent** (Teal Alert)
- Relevant information exists in private agents the user can't access
- Shows which specific agents have the needed information
- Includes "Request Access" button to request permissions

---

## How to Test

### Step 1: Navigate to Chat
1. Log in to the application (any role: user, analyst, or admin)
2. Click **"AI Chat"** in the left sidebar navigation
3. You'll land on the chat welcome screen

### Step 2: Access Demo Buttons
On the welcome screen, you'll see:
- Main chat input area
- Example prompts below
- **Three small demo buttons** labeled:
  - `Lack of Context`
  - `System Error`
  - `Private Agent Access`

### Step 3: Test Each Error Type

#### Test 1: Lack of Context Error
1. Click the **"Lack of Context"** button
2. **Expected Result**:
   - User message appears: "Show me the customer segmentation data"
   - Yellow/amber alert box appears with:
     - Sparkles icon
     - "Insufficient Context" heading
     - Message asking for clarification
   - No action buttons
   - You can continue chatting normally

#### Test 2: System Error
1. Refresh the page or navigate back to `/chat`
2. Click the **"System Error"** button
3. **Expected Result**:
   - User message appears: "Analyze the sales trends"
   - Red alert box appears with:
     - AlertTriangle icon
     - "System Error" heading
     - Error message
     - **"Retry" button** with RefreshCw icon
   - Clicking retry should re-submit the query (currently creates new conversation)

#### Test 3: Private Agent Access
1. Refresh the page or navigate back to `/chat`
2. Click the **"Private Agent Access"** button
3. **Expected Result**:
   - User message appears: "Show me financial projections"
   - Teal alert box appears with:
     - Lock icon
     - "Context Available in Private Agent" heading
     - Explanation text
     - List of 2 private agents:
       - Financial Planning Agent
       - Budget Forecasting Agent
     - **"Request Access"** button with UserPlus icon
   - Clicking "Request Access" shows toast: "Access request sent to admin"

---

## Testing in Real Chat Flow

You can also manually trigger errors by:

1. **Starting a new chat** (click "+ New Chat" or use the input)
2. **Modifying the demo code** in `/pages/AgenticChat.tsx` to trigger errors based on specific user queries
3. **Backend Integration**: Once connected to real backend, these errors would be triggered by actual API responses

---

## Visual Indicators

Each error type has distinct styling:

| Error Type | Border | Background | Icon | Action Button |
|------------|--------|------------|------|---------------|
| Lack of Context | `#FFD666` | `#FFF4E6` | Sparkles | None |
| System Error | `#FF6B6B` | `#FFE6E6` | AlertTriangle | Retry (if retryable) |
| Access Denied | `#00B5B3` | `#E0F7F7` | Lock | Request Access |

---

## Code Locations

If you need to modify the error handling:

### 1. Type Definitions
**File**: `/lib/conversationStore.ts`
```typescript
errorType?: 'lack_of_context' | 'system_error' | 'access_denied';
errorMetadata?: {
  privateAgentIds?: string[];
  privateAgentNames?: string[];
  retryable?: boolean;
};
```

### 2. Demo Buttons
**File**: `/pages/AgenticChat.tsx`
- Lines 1302-1324: Lack of Context button
- Lines 1325-1348: System Error button  
- Lines 1349-1375: Private Agent Access button

### 3. Error UI Rendering
**File**: `/pages/AgenticChat.tsx`
- Lines 2034-2050: Lack of Context UI
- Lines 2053-2079: System Error UI
- Lines 2082-2127: Access Denied UI

---

## Advanced Testing

### Test Error Persistence
1. Trigger an error
2. Navigate away to another page (e.g., Agents Dashboard)
3. Return to the chat using "Recent Conversations" or Chat Dashboard
4. **Expected**: Error messages persist in conversation history

### Test Multiple Errors
1. Trigger one error type
2. Send a normal message
3. Trigger a different error type
4. **Expected**: All messages display correctly in chronological order

### Test Retry Functionality
1. Trigger System Error
2. Click "Retry" button
3. **Expected**: Creates new query attempt (in production: would re-execute the failed query)

### Test Access Request
1. Trigger Private Agent Access error
2. Click "Request Access"
3. **Expected**: Toast notification confirms request sent
4. (In production: would notify admin users)

---

## Known Limitations

1. **Demo Mode**: These are simulated errors. Real errors would come from backend API
2. **Retry Logic**: Currently creates new conversation; production would re-execute query
3. **Access Requests**: Currently shows toast only; production would integrate with RBAC system
4. **Analytics**: Error tracking not yet implemented

---

## Future Enhancements

- [ ] Track error frequency for product insights
- [ ] Implement smart retry with exponential backoff
- [ ] Connect "Request Access" to actual permission system
- [ ] Auto-suggest alternative agents based on error context
- [ ] Admin notification system for access requests
- [ ] Backend error logging and monitoring integration

---

## Screenshots Reference

The demo buttons appear at the bottom of the welcome screen:
```
┌─────────────────────────────────────────┐
│   What can I help you analyze today?   │
│                                         │
│   [Chat Input Box with Send Button]    │
│                                         │
│   Try these examples:                   │
│   [Example Cards...]                    │
│                                         │
│   [Lack of Context] [System Error]     │
│   [Private Agent Access]                │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

**Q: I don't see the demo buttons**
- Make sure you're on the chat welcome screen (`/chat` or `/chat/new`)
- Buttons appear below the example prompts

**Q: Error doesn't display**
- Check browser console for errors
- Ensure you clicked the correct demo button
- Try refreshing the page

**Q: Toast notification doesn't appear**
- Ensure sonner is properly imported
- Check that toast container is rendered in app root

**Q: Can I test errors in existing conversations?**
- Currently, demo buttons only work from welcome screen
- To test in existing chats, manually modify message data

---

## Contact

For issues or questions about error handling:
- Review: `/ERROR_HANDLING_IMPLEMENTATION.md`
- Code: `/pages/AgenticChat.tsx`
- Store: `/lib/conversationStore.ts`
