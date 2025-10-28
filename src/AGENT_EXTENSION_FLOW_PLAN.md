# Agent Extension Flow - Design Plan

## Current Issue
- Agent suggestion appears after table suggestions
- No clear path for extending existing agents
- "Build on Existing Agent" option has no implementation

---

## Proposed Flow

### Step 1: User Describes Intent
```
┌─────────────────────────────────────────┐
│ What do you want to analyze?           │
│ ┌─────────────────────────────────────┐ │
│ │ "analyze sales performance..."      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│           [Generate Suggestions]        │
└─────────────────────────────────────────┘
```

### Step 2: Agent Suggestion (FIRST)
```
┌─────────────────────────────────────────┐
│ ⚠️ Found a Similar Existing Agent      │
├─────────────────────────────────────────┤
│                                         │
│ ○ Build on Existing Agent [Rec]        │
│   ┌───────────────────────────────┐    │
│   │ Sales Analytics Agent         │    │
│   │ 3 tables, 15 metrics...       │    │
│   └───────────────────────────────┘    │
│                                         │
│ ○ Create New Standalone Agent          │
│   Start fresh with new tables.         │
└─────────────────────────────────────────┘
```

**Behavior:**
- Shows FIRST, before tables
- User MUST choose before seeing tables

### Step 3a: If "Build on Existing" → Agent Extension Page
```
Redirect to: /agents/{id}/extend

┌─────────────────────────────────────────┐
│ Extending: Sales Analytics Agent       │
├─────────────────────────────────────────┤
│                                         │
│ 📋 Inherited Context (Read-Only)       │
│ ├─ Tables (3)                           │
│ │  • ecommerce.orders                   │
│ │  • ecommerce.order_items              │
│ │  • ecommerce.customers                │
│ ├─ Relationships (5)                    │
│ └─ Golden Queries (12)                  │
│                                         │
│ ➕ Add New Context                      │
│ ┌─────────────────────────────────────┐ │
│ │ [Select Additional Tables]          │ │
│ │ [Define New Metrics]                │ │
│ │ [Add Relationships]                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│    [Cancel]  [Create Extended Agent]   │
└─────────────────────────────────────────┘
```

### Step 3b: If "Create New" → Show Table Suggestions
```
(Current flow continues)

┌─────────────────────────────────────────┐
│ Suggested Tables                        │
│ ☑ ecommerce.orders                      │
│ ☑ ecommerce.order_items                 │
│ ☐ ecommerce.customers                   │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

## Agent Extension Page Design

### Route
```
/agents/{agentId}/extend
```

### Component: `AgentExtension.tsx`

### Layout (Left-Right Panes)

```
┌──────────────────┬──────────────────────┐
│   INHERITED      │   NEW ADDITIONS      │
│   (Read-Only)    │   (Editable)         │
├──────────────────┼──────────────────────┤
│                  │                      │
│ 📊 Base Agent    │ ➕ Additional Tables │
│ Sales Analytics  │ ┌──────────────────┐ │
│                  │ │ Search tables... │ │
│ Tables (3):      │ └──────────────────┘ │
│ • orders         │                      │
│ • order_items    │ Selected (2):        │
│ • customers      │ ☑ products           │
│                  │ ☑ returns            │
│ Relationships:   │                      │
│ • orders →       │ ➕ New Context       │
│   customers      │ ┌──────────────────┐ │
│ • orders →       │ │ Define metrics   │ │
│   order_items    │ │ for new tables   │ │
│                  │ └──────────────────┘ │
│ Golden Queries:  │                      │
│ • Total Revenue  │ ➕ New Relationships │
│ • Top Customers  │ (Auto-detected)      │
│ • (10 more...)   │                      │
│                  │                      │
│                  │ [Create Agent] →     │
└──────────────────┴──────────────────────┘
```

---

## Implementation Options

### Option A: Extension as New Agent (RECOMMENDED)
**Behavior:**
- Creates a NEW agent that references the base agent
- Inherits all context, relationships, queries from base
- Adds new tables/context on top
- Base agent remains unchanged
- New agent shows "Extended from: Sales Analytics Agent"

**Pros:**
- Non-destructive
- Clear lineage
- Can have multiple extensions
- Easier to implement

**Cons:**
- More agents in the system
- Could get cluttered

**Data Model:**
```typescript
{
  id: 'new-agent-id',
  name: 'Sales Analytics Extended',
  baseAgentId: '1', // Reference to parent
  baseAgentName: 'Sales Analytics Agent',
  inheritedTables: ['orders', 'order_items', 'customers'],
  newTables: ['products', 'returns'],
  inheritedRelationships: [...],
  newRelationships: [...],
  status: 'draft'
}
```

---

### Option B: Version-Based Extension
**Behavior:**
- Creates a new VERSION of the existing agent
- Increments version number (v2.3 → v3.0)
- Replaces the current agent
- Version history maintained

**Pros:**
- Clean agent list
- Clear versioning
- Single source of truth

**Cons:**
- More complex version management
- Could break existing dependencies
- Harder rollback

---

### Option C: In-Place Editing
**Behavior:**
- Directly modifies the existing agent
- Adds new tables/context
- Updates version number
- No new agent created

**Pros:**
- Simplest for users
- No duplicate agents

**Cons:**
- Destructive
- No rollback
- Could break things for other users

---

## Recommendation: Option A (Extension as New Agent)

### Why?
1. **Non-destructive** - Base agent stays intact
2. **Clear lineage** - Easy to see relationships
3. **Flexible** - Multiple people can extend same agent
4. **Safe** - No risk of breaking existing workflows
5. **Aligns with "Context Agent" philosophy** - Agents build on each other

---

## UI/UX Details

### Agent Extension Page Components

#### 1. Header
```tsx
<div className="bg-white border-b border-[#EEEEEE] p-6">
  <div className="flex items-center gap-2 text-sm text-[#666666] mb-2">
    <Link to="/agents">Agents</Link>
    <ChevronRight className="w-4 h-4" />
    <Link to={`/agents/${baseAgent.id}`}>{baseAgent.name}</Link>
    <ChevronRight className="w-4 h-4" />
    <span className="text-[#333333]">Extend</span>
  </div>
  <h1>Create Extended Agent</h1>
  <p>Build on top of {baseAgent.name} by adding new tables and context</p>
</div>
```

#### 2. Two-Pane Layout
```tsx
<div className="grid grid-cols-2 gap-6">
  {/* Left: Inherited */}
  <Card className="p-6 bg-[#F8F9FA] border-2 border-[#DDDDDD]">
    <div className="flex items-center gap-2 mb-4">
      <Lock className="w-4 h-4 text-[#999999]" />
      <h3>Inherited from Base Agent</h3>
      <Badge>Read-Only</Badge>
    </div>
    
    {/* Show inherited tables, relationships, queries */}
    <InheritedContext agent={baseAgent} />
  </Card>
  
  {/* Right: New Additions */}
  <Card className="p-6 border-2 border-[#00B5B3]">
    <div className="flex items-center gap-2 mb-4">
      <Plus className="w-4 h-4 text-[#00B5B3]" />
      <h3>New Additions</h3>
    </div>
    
    {/* Table selection, context definition */}
    <NewAdditions />
  </Card>
</div>
```

#### 3. Workflow Steps
```
1. Review Inherited Context (auto-loaded)
2. Select Additional Tables
3. Define Context for New Tables (optional)
4. Review Auto-Detected Relationships
5. Name Extended Agent
6. Create (saves as draft)
```

#### 4. Footer Actions
```tsx
<div className="flex justify-between">
  <Button variant="outline" onClick={handleCancel}>
    Cancel
  </Button>
  <div className="flex gap-2">
    <Button variant="outline" onClick={handleSaveDraft}>
      Save Draft
    </Button>
    <Button onClick={handleCreateAgent}>
      Create Extended Agent
    </Button>
  </div>
</div>
```

---

## Agent Details Page Updates

### Add "Extend This Agent" Button

**Location:** Top-right actions area

```tsx
<div className="flex gap-2">
  <Button 
    variant="outline" 
    onClick={() => navigate(`/agents/${agent.id}/extend`)}
  >
    <GitBranch className="w-4 h-4 mr-2" />
    Extend This Agent
  </Button>
  <Button variant="outline">
    <Settings className="w-4 h-4 mr-2" />
    Configure
  </Button>
  <Button variant="outline">
    <Share2 className="w-4 h-4 mr-2" />
    Share
  </Button>
</div>
```

### Show Extension Relationships

**If agent is extended from another:**
```tsx
<Card className="p-4 bg-[#FFF8F0] border border-[#FF9500]">
  <div className="flex items-center gap-2">
    <GitBranch className="w-4 h-4 text-[#FF9500]" />
    <span className="text-sm">
      Extended from: 
      <Link to={`/agents/${baseAgentId}`} className="text-[#00B5B3] ml-1">
        {baseAgentName}
      </Link>
    </span>
  </div>
</Card>
```

**If agent has been extended by others:**
```tsx
<Card className="p-4 bg-[#F0FFFE] border border-[#00B5B3]">
  <h4 className="font-medium mb-2">Extended By</h4>
  <div className="space-y-1">
    {extendedAgents.map(agent => (
      <Link key={agent.id} to={`/agents/${agent.id}`}>
        <div className="text-sm text-[#00B5B3] hover:underline">
          → {agent.name}
        </div>
      </Link>
    ))}
  </div>
</Card>
```

---

## Updated Step 1 Flow

### Current Issues
- Table suggestions shown immediately
- Agent suggestion appears after tables
- No clear choice before tables

### New Flow

```tsx
// 1. User types description
const [agentGoal, setAgentGoal] = useState('');
const [showAgentSuggestion, setShowAgentSuggestion] = useState(false);
const [showTables, setShowTables] = useState(false);

// 2. Generate suggestions
const handleGenerate = () => {
  // Find matching agent
  const match = findMatchingAgent(agentGoal);
  
  if (match) {
    setSuggestedAgent(match);
    setShowAgentSuggestion(true);
    setShowTables(false); // Don't show tables yet!
  } else {
    setShowAgentSuggestion(false);
    setShowTables(true); // No match, go straight to tables
  }
};

// 3. Handle choice
const handleBuildOnExisting = () => {
  navigate(`/agents/${suggestedAgent.id}/extend`);
};

const handleCreateNew = () => {
  setShowAgentSuggestion(false);
  setShowTables(true); // NOW show tables
};
```

### Visual States

**State 1: Initial**
```
[Description field]
[Generate Suggestions button]
```

**State 2a: Match Found (Agent Suggestion ONLY)**
```
[Description field] ✓

┌─────────────────────────────┐
│ ⚠️ Found Similar Agent      │
│                             │
│ ○ Build on Existing         │
│ ○ Create New                │
└─────────────────────────────┘

(No tables shown yet)
```

**State 2b: No Match (Tables Immediately)**
```
[Description field] ✓

┌─────────────────────────────┐
│ Suggested Tables            │
│ ☑ orders                    │
│ ☐ customers                 │
└─────────────────────────────┘
```

**State 3: Create New Selected (Show Tables)**
```
[Description field] ✓

✓ Creating new standalone agent

┌─────────────────────────────┐
│ Suggested Tables            │
│ ☑ orders                    │
│ ☐ customers                 │
└─────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Update Step 1 Flow
- [ ] Move agent suggestion to appear FIRST
- [ ] Hide tables until choice is made
- [ ] "Create New" → Show tables
- [ ] "Build on Existing" → Navigate to extension page

### Phase 2: Create Agent Extension Page
- [ ] Create `/pages/AgentExtension.tsx`
- [ ] Add route in `App.tsx`
- [ ] Two-pane layout (inherited vs new)
- [ ] Table selection for new tables
- [ ] Auto-detect relationships
- [ ] Save as new agent with base reference

### Phase 3: Update Agent Details
- [ ] Add "Extend This Agent" button
- [ ] Show base agent reference (if extended)
- [ ] Show child agents (if this agent has been extended)

### Phase 4: Update Mock Data
- [ ] Add `baseAgentId` field to agent type
- [ ] Add sample extended agents
- [ ] Update relationships to show inheritance

---

## Data Model Updates

### Agent Type Extension
```typescript
interface Agent {
  id: string;
  name: string;
  // ... existing fields
  
  // NEW FIELDS
  baseAgentId?: string; // If this agent extends another
  baseAgentName?: string;
  inheritedTables?: string[];
  inheritedRelationships?: Relationship[];
  inheritedGoldenQueries?: GoldenQuery[];
  isExtension: boolean;
  extensionOf?: string; // Human-readable lineage
}
```

### Example Extended Agent
```typescript
{
  id: '11',
  name: 'Sales Analytics Extended',
  owner: 'john.doe@company.com',
  status: 'draft',
  category: 'Sales',
  
  // Extension metadata
  isExtension: true,
  baseAgentId: '1',
  baseAgentName: 'Sales Analytics Agent',
  extensionOf: 'Sales Analytics Agent',
  
  // Inherited from base
  inheritedTables: ['ecommerce.orders', 'ecommerce.order_items', 'ecommerce.customers'],
  
  // New additions
  tables: ['ecommerce.products', 'ecommerce.returns'],
  
  description: 'Extended sales analysis including product performance and returns'
}
```

---

## User Stories

### Story 1: Extend Existing Agent
```
As a data analyst,
When I want to analyze sales data,
And a similar agent already exists,
I want to build on top of it,
So I don't have to recreate existing context.

Steps:
1. Describe "sales performance analysis"
2. See suggestion for "Sales Analytics Agent"
3. Click "Build on Existing Agent"
4. Redirected to extension page
5. See inherited tables (read-only)
6. Add new tables (products, returns)
7. Define context for new tables
8. Create extended agent
9. Agent inherits all base context + adds new
```

### Story 2: Create Fresh Agent
```
As a data analyst,
When I want to analyze unique data,
And no similar agent exists,
I want to create a new agent,
So I can define everything from scratch.

Steps:
1. Describe "customer feedback sentiment"
2. No similar agent found
3. Tables shown immediately
4. Select tables
5. Continue to wizard
6. Complete agent creation
```

### Story 3: Create Fresh Despite Match
```
As a data analyst,
When I see a similar agent suggestion,
But I want to start fresh anyway,
I want to decline the suggestion,
So I can create a completely new agent.

Steps:
1. Describe "sales performance"
2. See "Sales Analytics Agent" suggestion
3. Click "Create New Standalone Agent"
4. Tables shown
5. Continue normal wizard flow
```

---

## Summary

### Key Changes
1. **Agent suggestion appears FIRST** (before tables)
2. **Two paths:**
   - Build on existing → Navigate to `/agents/{id}/extend`
   - Create new → Show table suggestions (current flow)
3. **New page:** Agent Extension with two-pane layout
4. **Data model:** Support for agent inheritance
5. **Agent Details:** Show extension relationships

### Benefits
- ✅ Clear decision point before committing to tables
- ✅ Proper flow for extending agents
- ✅ Non-destructive extensions
- ✅ Clear lineage and relationships
- ✅ Reusable context across agents

Ready to implement? 🚀
