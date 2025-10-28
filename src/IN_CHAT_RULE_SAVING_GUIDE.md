# In-Chat Rule Saving Implementation Guide

## Overview

This document describes how to implement **Method 2: In-Chat Rule Saving** - allowing users to save rules directly from agentic chat conversations.

## Current Status

✅ **Implemented:**
- Method 1: Onboarding metadata collection
- Method 3: Manual rule creation via Rules page AI chat

❌ **Not Implemented:**
- Method 2: Save rules during agentic chat

## Implementation Plan

### 1. Add "Save as Rule" Button in Chat

**Location:** `/pages/AgenticChat.tsx`

**When to show:**
- After a SQL query is executed successfully
- When the assistant provides a filter or cohort definition
- When user explicitly asks to save something as a rule

**UI Design:**
```tsx
// Add after query results
<Button 
  variant="outline" 
  className="border-2 border-[#00B5B3] text-[#00B5B3] hover:bg-[#E0F7F7]"
  onClick={() => handleSaveAsRule(message)}
>
  <Plus className="w-4 h-4 mr-2" />
  Save as Rule
</Button>
```

### 2. Save Rule Dialog

Create a dialog that appears when "Save as Rule" is clicked:

```tsx
<Dialog open={showSaveRuleDialog} onOpenChange={setShowSaveRuleDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Save as Rule</DialogTitle>
      <DialogDescription>
        Create a reusable rule from this query or filter
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      {/* Rule Name */}
      <div>
        <Label>Rule Name</Label>
        <Input 
          placeholder="e.g., High-Value Customers"
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
        />
      </div>

      {/* Rule Type */}
      <div>
        <Label>Rule Type</Label>
        <Select value={ruleType} onValueChange={setRuleType}>
          <SelectOption value="cohort">Cohort</SelectOption>
          <SelectOption value="filter">Filter</SelectOption>
          <SelectOption value="reference">Reference</SelectOption>
          <SelectOption value="custom">Custom</SelectOption>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <Textarea 
          placeholder="What does this rule represent?"
          value={ruleDescription}
          onChange={(e) => setRuleDescription(e.target.value)}
        />
      </div>

      {/* Auto-filled Definition */}
      <div>
        <Label>Definition</Label>
        <div className="p-3 bg-[#F5F5F5] rounded border border-[#EEEEEE]">
          <code className="text-xs text-[#333333]">
            {extractedDefinition}
          </code>
        </div>
      </div>

      {/* Visibility */}
      <div className="flex items-center gap-2">
        <Switch 
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label>Make this rule public</Label>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setShowSaveRuleDialog(false)}>
        Cancel
      </Button>
      <Button 
        className="bg-[#00B5B3] hover:bg-[#009996]"
        onClick={handleSaveRule}
      >
        Save Rule
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3. Extract Definition from Chat Context

**Helper function to extract SQL or filter from message:**

```tsx
function extractRuleDefinition(message: Message): string {
  // If message contains SQL
  if (message.sql) {
    return message.sql;
  }

  // If message contains a filter description
  // Parse patterns like "customers with revenue > $10000"
  // or "products in category 'Electronics'"
  
  // Return the extracted filter criteria
  return message.content; // Simplified
}
```

### 4. Save to Rules Store

**Add to mockData or create a rules store:**

```tsx
// In /lib/mockData.ts or new /lib/rulesStore.ts
export interface Rule {
  id: string;
  name: string;
  owner: string;
  type: 'cohort' | 'filter' | 'reference' | 'custom';
  description: string;
  definition: string;
  createdAt: string;
  lastUsed?: string;
  visibility: 'public' | 'private';
  sharedWith?: string[];
  metadata?: {
    team?: string;
    geography?: string;
    category?: string;
  };
  // NEW: Track source
  sourceType?: 'manual' | 'chat' | 'onboarding';
  sourceConversationId?: string; // Link back to chat
}

function saveRule(rule: Omit<Rule, 'id' | 'createdAt'>): Rule {
  const newRule: Rule = {
    ...rule,
    id: `rule-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sourceType: 'chat',
  };
  
  // Add to rules array or Zustand store
  mockRules.push(newRule);
  
  return newRule;
}
```

### 5. Visual Indicators

**Show when a rule was used in chat:**

In chat messages, add a badge if the response used a saved rule:

```tsx
{message.usedRules && message.usedRules.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {message.usedRules.map((ruleId) => {
      const rule = findRuleById(ruleId);
      return (
        <Badge 
          key={ruleId}
          variant="outline"
          className="bg-[#E0F7F7] text-[#00B5B3] border-0 text-xs"
        >
          <Check className="w-3 h-3 mr-1" />
          Used: {rule?.name}
        </Badge>
      );
    })}
  </div>
)}
```

### 6. Auto-Detect Rule Opportunities

**Add AI logic to suggest rule creation:**

When the user asks similar questions multiple times, suggest saving it:

```tsx
// After 2-3 similar queries
{shouldSuggestRule && (
  <div className="mt-4 p-4 bg-[#FFF9E6] border border-[#FFE8A3] rounded-lg">
    <div className="flex items-start gap-3">
      <Sparkles className="w-5 h-5 text-[#D4A500] mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-[#8B7300] mb-2">
          <strong>Tip:</strong> You seem to be querying similar data often.
        </p>
        <Button 
          size="sm"
          variant="outline"
          className="border-[#D4A500] text-[#8B7300] hover:bg-[#FFF9E6]"
          onClick={() => handleSuggestedRuleSave()}
        >
          Save as Reusable Rule
        </Button>
      </div>
    </div>
  </div>
)}
```

## Example Flow

### User Story: Saving a Customer Cohort

1. **User asks in chat:** "Show me all customers with lifetime value > $5000"

2. **AI responds with:**
   - SQL query
   - Results table
   - **[Save as Rule]** button appears

3. **User clicks "Save as Rule"**

4. **Dialog opens with pre-filled values:**
   - Name: (empty - user fills)
   - Type: "Cohort" (auto-detected)
   - Description: (empty - user fills)
   - Definition: `customer_lifetime_value > 5000` (auto-extracted)
   - Visibility: Private (default)

5. **User fills and saves:**
   - Name: "High-Value Customers"
   - Description: "Customers with >$5000 LTV"
   - Clicks "Save Rule"

6. **Confirmation:**
   - Toast: "Rule saved successfully!"
   - Badge appears in chat: "✓ Saved as: High-Value Customers"

7. **Future usage:**
   - User can reference: "Show me all High-Value Customers in California"
   - AI recognizes the saved rule and applies it

## Files to Modify

```
/pages/AgenticChat.tsx
  - Add "Save as Rule" button after query results
  - Add save rule dialog
  - Implement handleSaveAsRule()

/lib/mockData.ts (or new /lib/rulesStore.ts)
  - Add sourceType and sourceConversationId to Rule interface
  - Add saveRule() function
  
/components/ChatMessage.tsx (if separate)
  - Add rule usage badges
  - Add save button UI
```

## Design Considerations

### When to Show "Save as Rule"

✅ **Show for:**
- Successful SQL queries with WHERE clauses
- Cohort definitions (e.g., "customers with X")
- Filter criteria (e.g., "products in category Y")
- Reference data (e.g., "Q4 date range")

❌ **Don't show for:**
- Simple SELECT * queries
- Exploratory "show me everything" queries
- Errors or failed queries
- General questions without actionable filters

### Auto-Naming Suggestions

Parse the query to suggest names:

```tsx
// "customers with revenue > 10000" → "High Revenue Customers"
// "products in category 'Electronics'" → "Electronics Products"
// "orders in last 30 days" → "Recent Orders"

function suggestRuleName(query: string): string {
  // Simple heuristics
  if (query.includes('customer') && query.includes('>')) {
    return 'High-Value Customers';
  }
  if (query.includes('product') && query.includes('category')) {
    return 'Category Products';
  }
  return '';
}
```

## Testing

1. **Basic Save:**
   - Execute query: "Show customers with revenue > $10000"
   - Click "Save as Rule"
   - Fill form and save
   - Check Rules page - new rule should appear

2. **Auto-Detection:**
   - Ask similar questions 3 times
   - System should suggest saving as rule

3. **Rule Usage:**
   - Save a rule: "West Coast Customers"
   - In new chat: "Show me West Coast Customers with >$5000 orders"
   - AI should recognize and apply the saved rule

4. **Visibility:**
   - Save as public
   - Login as different user
   - Check if rule is visible

## Future Enhancements

- **Smart Suggestions:** ML to detect when queries should become rules
- **Rule Composition:** Combine multiple rules ("High-Value West Coast Customers")
- **Version History:** Track changes to rule definitions
- **Usage Analytics:** Show how often rules are used
- **Quick Apply:** Right-click on result → "Save as rule"
- **Template Library:** Pre-built rule templates for common use cases
