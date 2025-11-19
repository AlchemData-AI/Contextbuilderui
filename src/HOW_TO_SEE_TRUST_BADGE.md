# How to See the Trust Badge 🎯

## Step-by-Step Guide

### 1. Navigate to Agentic Chat
- Click on the **Agentic Chat** section in your app

### 2. Send a Test Query
- Type any question in the chat (e.g., "Show me Q3 revenue by region")
- Or click the demo question button if available

### 3. Watch the Execution Timeline
The timeline will stream through these steps:
```
Step 1: Planning...
Step 2: Query executed (SQL)
Step 3: Running code... (Python)
Step 4: Data Results
...
```

### 4. Look for "Analysis Complete"
After all steps finish, you'll see:
```
✓ Analysis Complete  [✓ Trusted Query]
                              ↑
                         THIS IS IT!
```

### 5. Hover Over the Badge
Move your mouse over the green **"✓ Trusted Query"** badge

### 6. See the Breakdown Tooltip
A detailed popup will appear showing:

```
┌──────────────────────────────────┐
│ 🛡️ Trusted Query Breakdown       │
├──────────────────────────────────┤
│                                  │
│ ✨ Golden Query            70%   │
│   • Base revenue calculation     │
│   • Regional grouping logic      │
│   • Customer count aggregation   │
│                                  │
│ 🧠 Semantic Model          30%   │
│   • Q3 2025 date filtering       │
│   • Column selection and naming  │
│                                  │
└──────────────────────────────────┘
```

## Visual Reference

### Location in Chat:
```
┌─────────────────────────────────────────┐
│  User: Show me Q3 revenue by region    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Assistant                              │
│                                         │
│  [Execution Timeline]                   │
│  Step 1: Planning... ✓                  │
│  Step 2: Query executed ✓               │
│  Step 3: Running code... ✓              │
│  Step 4: Data Results ✓                 │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  ✓ Analysis Complete [✓ Trusted Query] │ <- HOVER HERE!
│                                         │
│  Based on Q3 2025 data, here's...      │
│                                         │
│  [SQL Artifact] [Chart] [Table]         │
└─────────────────────────────────────────┘
```

## What You Should See

### Badge Appearance:
- **Color**: Green background (#00B98E)
- **Text**: "✓ Trusted Query" in white
- **Animation**: Smooth spring animation when it appears
- **Cursor**: Changes to help icon (?) when hovering

### Tooltip Content:
- **Header**: Shield icon + "Trusted Query Breakdown"
- **Golden Query Section**:
  - Sparkles icon (✨)
  - Percentage (e.g., 70%)
  - List of components from Golden Set
- **Semantic Model Section**:
  - Brain icon (🧠)
  - Percentage (e.g., 30%)
  - List of AI-added components

## Troubleshooting

### If you don't see the badge:

1. **Check the execution completed**
   - Make sure "Analysis Complete" shows up
   - The timeline should be fully done streaming

2. **Verify trust data is present**
   - The badge only appears when `trustLevel: 'trusted'`
   - Currently set up for the demo query

3. **Try refreshing the page**
   - Sometimes React needs a refresh to pick up changes

4. **Check browser console**
   - Look for any JavaScript errors
   - Open DevTools (F12) and check Console tab

### If the tooltip doesn't appear on hover:

1. **Make sure you're hovering directly over the badge**
   - The badge should have a "help" cursor (?)
   
2. **Wait a moment**
   - The tooltip has a small delay before appearing

3. **Check if HoverCard is working**
   - Try hovering over other tooltips in the app

## Current Implementation

The trust badge is currently enabled for:
- ✅ **Demo query** in AgenticChat ("Q3 revenue by region")
- ✅ **Execution timeline** component
- ⚠️  **Real SSE streaming** - You'll need to add trustLevel/trustBreakdown to your backend response

## Adding to More Queries

To show the badge for other queries, update the `finalAnswer` object:

```typescript
const finalAnswer = {
  answer: "Your analysis answer...",
  total_steps: 6,
  trustLevel: 'trusted', // Add this
  trustBreakdown: {      // Add this
    goldenQueryPercentage: 70,
    semanticModelPercentage: 30,
    goldenQueryComponents: [
      'Component from Golden Set',
      'Another component'
    ],
    semanticModelComponents: [
      'AI-added filtering',
      'AI-added selection'
    ]
  }
};
```

## Next Steps

Once you verify it's working:
1. Integrate with your backend to send real trust data
2. Add trust badges to more queries
3. Consider adding click-to-expand functionality
4. Add trust levels to other parts of the UI

---

**Need help?** Check the browser console for errors or verify the HoverCard component is installed in `/components/ui/hover-card.tsx`
