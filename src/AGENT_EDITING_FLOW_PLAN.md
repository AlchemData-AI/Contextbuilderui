# Agent Editing Flow - Comprehensive Plan

## Overview
Enable users to edit existing agents with a focus on:
1. **In-place editing** in AgentDetails page
2. **Table detail pages** with conversational AI context editing
3. **Version control** for published agents
4. **Draft system** for safe modifications

---

## Core Principles

### 1. Safety First
- **Draft agents**: Edit directly (destructive)
- **Published agents**: Create new version/draft (non-destructive)
- **Extended agents**: Don't modify base agent

### 2. Progressive Disclosure
- View mode by default
- Edit mode opt-in via "Edit Agent" button
- Inline editing where possible

### 3. Conversational AI
- Edit table context via natural language
- AI suggests improvements
- Back-and-forth refinement

---

## User Flows

### Flow 1: Edit Draft Agent (In-Place)

```
┌─────────────────────────────────────────┐
│ Agent Details (Draft)                   │
│ Status: Draft                           │
│ Owner: You                              │
│                                         │
│ [Edit Agent] [Publish]                  │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Agent Details (Edit Mode)               │
│                                         │
│ Name: [Sales Analytics___________]     │
│ Desc: [Comprehensive sales...____]     │
│ Category: [Sales ▼]                    │
│                                         │
│ Tables (3):                            │
│ • orders [Edit Context]                │
│ • order_items [Edit Context]           │
│ • customers [Edit Context]             │
│                                         │
│ [Save Changes] [Cancel]                │
└─────────────────────────────────────────┘
```

**Behavior:**
- Edit directly modifies the draft
- Changes save immediately to draft
- No version created
- Can publish when ready

---

### Flow 2: Edit Published Agent (Create New Version)

```
┌─────────────────────────────────────────┐
│ Agent Details (Published)               │
│ Status: Published                       │
│ Version: 2.3                            │
│                                         │
│ [Edit Agent] [Share]                    │
└─────────────────────────────────────────┘
           ↓ Click "Edit Agent"
┌─────────────────────────────────────────┐
│ ⚠️ Edit Published Agent?                │
│                                         │
│ This will create a new draft version   │
│ (v3.0) that won't affect the current   │
│ published agent until you publish it.  │
│                                         │
│ Original agent remains published and   │
│ available to all users.                │
│                                         │
│ [Create Draft v3.0] [Cancel]           │
└─────────────────────────────────────────┘
           ↓ Click "Create Draft"
┌─────────────────────────────────────────┐
│ Agent Details (Draft v3.0)              │
│ Status: Draft                           │
│ Based on: Sales Analytics v2.3         │
│                                         │
│ [Now in edit mode...]                  │
└─────────────────────────────────────────┘
```

**Behavior:**
- Creates new draft version (e.g., v2.3 → v3.0 draft)
- Original published agent unchanged
- Edit the draft freely
- Publish replaces old version

---

### Flow 3: Edit Table Context (Conversational AI)

```
┌─────────────────────────────────────────┐
│ Agent Details (Edit Mode)               │
│                                         │
│ Tables (3):                            │
│ • ecommerce.orders [Edit Context] ←    │
│ • ecommerce.order_items                │
│ • ecommerce.customers                  │
└─────────────────────────────────────────┘
           ↓ Click "Edit Context"
┌─────────────────────────────────────────┐
│ Table Context: ecommerce.orders         │
├─────────────────────────────────────────┤
│                                         │
│ 📊 Table Information                    │
│ • 2.5M records                         │
│ • 12 columns                           │
│ • Keys: order_id (PK), customer_id     │
│                                         │
│ 💬 Current Context                      │
│ ┌─────────────────────────────────────┐ │
│ │ Order transactions including        │ │
│ │ order date, status, total amount,   │ │
│ │ and customer references.            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🤖 AI Conversation                      │
│ ┌─────────────────────────────────────┐ │
│ │ AI: How would you like to refine   │ │
│ │     the context for this table?    │ │
│ │                                     │ │
│ │ You: [Add information about order  │ │
│ │       fulfillment status_______]   │ │
│ │                              [Send]│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Apply Changes] [Cancel]                │
└─────────────────────────────────────────┘
```

**AI Conversation Flow:**
```
1. User: "Add information about order fulfillment status"
   AI: "I'll update the context to include fulfillment details:
        
        Order transactions including order date, status, 
        total amount, customer references, and fulfillment 
        status tracking from placement to delivery.
        
        Does this look good?"

2. User: "Yes, also mention payment methods"
   AI: "Updated:
        
        Order transactions including order date, order status,
        total amount, payment method, customer references, and
        fulfillment status tracking from placement to delivery.
        
        Shall I apply this?"

3. User: "Perfect!"
   AI: "✓ Context updated! Changes saved to draft."
```

---

## Implementation Plan

### Phase 1: Edit Mode in AgentDetails

#### 1.1 Add Edit Button
```tsx
// AgentDetails.tsx
const [isEditMode, setIsEditMode] = useState(false);
const [editedAgent, setEditedAgent] = useState(agent);

// In header actions
{agent.owner === currentUser && (
  <Button 
    variant="outline" 
    onClick={handleEditClick}
  >
    <Edit className="w-4 h-4 mr-2" />
    Edit Agent
  </Button>
)}
```

#### 1.2 Edit Mode UI Changes
```tsx
{isEditMode ? (
  // Edit Mode
  <>
    <Input 
      value={editedAgent.name}
      onChange={(e) => setEditedAgent({...editedAgent, name: e.target.value})}
    />
    <Textarea 
      value={editedAgent.description}
      onChange={(e) => setEditedAgent({...editedAgent, description: e.target.value})}
    />
    <Select 
      value={editedAgent.category}
      onChange={(value) => setEditedAgent({...editedAgent, category: value})}
    />
  </>
) : (
  // View Mode
  <>
    <h1>{agent.name}</h1>
    <p>{agent.description}</p>
    <Badge>{agent.category}</Badge>
  </>
)}
```

#### 1.3 Handle Published Agent Editing
```tsx
const handleEditClick = () => {
  if (agent.status === 'published') {
    // Show dialog
    setShowVersionDialog(true);
  } else {
    // Edit directly
    setIsEditMode(true);
  }
};

const handleCreateDraftVersion = () => {
  const draftVersion = {
    ...agent,
    id: generateNewId(),
    status: 'draft',
    version: incrementVersion(agent.version),
    baseVersionId: agent.id,
    baseVersionName: `${agent.name} v${agent.version}`,
  };
  
  // Save draft
  saveDraft(draftVersion);
  
  // Navigate to draft
  navigate(`/agents/${draftVersion.id}`);
  setIsEditMode(true);
};
```

---

### Phase 2: Table Detail Page

#### Route
```
/tables/:schema/:tableName
```

#### Component Structure
```tsx
// pages/TableDetail.tsx
export function TableDetail() {
  const { schema, tableName } = useParams();
  const [tableInfo, setTableInfo] = useState(null);
  const [contextHistory, setContextHistory] = useState([]);
  const [isEditingContext, setIsEditingContext] = useState(false);
  
  // Load table information
  // Show agents using this table
  // Display current context
  // Enable AI conversation
}
```

#### Layout
```
┌──────────────────────────────────────────────────┐
│ [Breadcrumb: Agents > Sales Analytics > orders] │
├──────────────────────────────────────────────────┤
│                                                  │
│ 📊 ecommerce.orders                              │
│                                                  │
│ ┌────────────────┬─────────────────────────────┐ │
│ │ TABLE INFO     │ CONTEXT                     │ │
│ ├────────────────┼─────────────────────────────┤ │
│ │                │                             │ │
│ │ Records:       │ 💬 Current Context          │ │
│ │ 2.5M           │ ┌─────────────────────────┐ │ │
│ │                │ │ Order transactions...   │ │ │
│ │ Columns: 12    │ │ [Full text]            │ │ │
│ │ • order_id     │ └─────────────────────────┘ │ │
│ │ • customer_id  │                             │ │
│ │ • order_date   │ [Edit Context with AI]      │ │
│ │ • total        │                             │ │
│ │ • status       │ 🤖 Used By                  │ │
│ │                │ • Sales Analytics (owner)   │ │
│ │ Keys:          │ • Revenue Tracker           │ │
│ │ • PK: order_id │ • Customer Journey          │ │
│ │ • FK: customer │                             │ │
│ │                │ 🔗 Relationships            │ │
│ │ Sample Data:   │ orders.customer_id →        │ │
│ │ [Show Preview] │   customers.id              │ │
│ │                │                             │ │
│ └────────────────┴─────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Phase 3: AI Conversational Context Editor

#### Component: ContextEditor
```tsx
// components/ContextEditor.tsx
export function ContextEditor({ 
  tableName, 
  currentContext, 
  onSave 
}) {
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      message: 'How would you like to refine the context for this table?'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [proposedContext, setProposedContext] = useState(currentContext);
  
  const handleSendMessage = async () => {
    // Add user message
    setConversation([...conversation, {
      role: 'user',
      message: userInput
    }]);
    
    // Simulate AI response (in real app, call AI API)
    const aiResponse = await generateContextUpdate(
      currentContext, 
      proposedContext,
      userInput
    );
    
    // Add AI response
    setConversation([...conversation, {
      role: 'user',
      message: userInput
    }, {
      role: 'assistant',
      message: aiResponse.message,
      updatedContext: aiResponse.context
    }]);
    
    setProposedContext(aiResponse.context);
    setUserInput('');
  };
  
  return (
    <Dialog>
      <DialogContent className="max-w-3xl">
        {/* Current Context */}
        <div className="bg-[#F8F9FA] p-4 rounded">
          <h4>Current Context</h4>
          <p>{currentContext}</p>
        </div>
        
        {/* Conversation */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {conversation.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
              <div className={`inline-block p-3 rounded ${
                msg.role === 'user' 
                  ? 'bg-[#00B5B3] text-white' 
                  : 'bg-[#F8F9FA]'
              }`}>
                {msg.message}
                {msg.updatedContext && (
                  <div className="mt-2 p-2 bg-white/10 rounded text-sm">
                    <strong>Proposed Update:</strong>
                    <p>{msg.updatedContext}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Describe what you want to change..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(proposedContext)}
            disabled={proposedContext === currentContext}
          >
            Apply Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Phase 4: Editable Components

#### 4.1 Editable Agent Name
```tsx
{isEditMode ? (
  <Input 
    value={editedAgent.name}
    onChange={(e) => setEditedAgent({...editedAgent, name: e.target.value})}
    className="text-2xl font-bold"
  />
) : (
  <h1>{agent.name}</h1>
)}
```

#### 4.2 Editable Description
```tsx
{isEditMode ? (
  <Textarea 
    value={editedAgent.description}
    onChange={(e) => setEditedAgent({...editedAgent, description: e.target.value})}
    rows={3}
  />
) : (
  <p>{agent.description}</p>
)}
```

#### 4.3 Editable Category
```tsx
{isEditMode ? (
  <Select 
    value={editedAgent.category}
    onValueChange={(value) => setEditedAgent({...editedAgent, category: value})}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Sales">Sales</SelectItem>
      <SelectItem value="Inventory">Inventory</SelectItem>
      <SelectItem value="Logistics">Logistics</SelectItem>
      <SelectItem value="Customer">Customer</SelectItem>
    </SelectContent>
  </Select>
) : (
  <Badge>{agent.category}</Badge>
)}
```

#### 4.4 Editable Table List
```tsx
{isEditMode ? (
  <div className="space-y-2">
    {editedAgent.tables.map((table) => (
      <div key={table} className="flex items-center justify-between p-2 border rounded">
        <span>{table}</span>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => openContextEditor(table)}
          >
            Edit Context
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => removeTable(table)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    ))}
    <Button 
      variant="outline" 
      onClick={openAddTableDialog}
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Table
    </Button>
  </div>
) : (
  <div className="space-y-2">
    {agent.tables.map((table) => (
      <Link 
        key={table} 
        to={`/tables/${table.split('.')[0]}/${table.split('.')[1]}`}
        className="block p-2 hover:bg-[#F8F9FA] rounded"
      >
        {table}
      </Link>
    ))}
  </div>
)}
```

---

## Edit Permissions

### Permission Matrix

| Agent Status | Owner | Viewer | Editor | Can Edit? |
|--------------|-------|--------|--------|-----------|
| **Draft** | ✓ | - | ✓ | Yes (in-place) |
| **Published** | ✓ | - | ✓ | Yes (new version) |
| **Draft** | - | ✓ | - | No |
| **Published** | - | ✓ | - | No |
| **Extended** | ✓ | - | ✓ | Yes (own agent only) |

### Permission Checks
```tsx
const canEdit = () => {
  // Must be owner or editor
  if (agent.owner !== currentUser && !agent.editors?.includes(currentUser)) {
    return false;
  }
  
  // Can't edit base agent if this is an extension
  if (agent.isExtension && isViewingBaseAgent) {
    return false;
  }
  
  return true;
};

// Show edit button only if permitted
{canEdit() && (
  <Button onClick={handleEditClick}>Edit Agent</Button>
)}
```

---

## Version Control

### Version Numbering
```
Draft: No version number (shows "Draft")
First publish: v1.0
Minor edit: v1.1, v1.2, v1.3...
Major edit: v2.0, v3.0...

User decides major vs minor when publishing
```

### Version History
```tsx
// In AgentDetails
<Card>
  <h3>Version History</h3>
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div>
        <Badge>Current</Badge>
        <span className="ml-2">v2.3</span>
      </div>
      <span className="text-sm text-[#666666]">2 days ago</span>
    </div>
    <div className="flex items-center justify-between">
      <div>
        <span className="ml-2">v2.2</span>
      </div>
      <div className="flex gap-2">
        <span className="text-sm text-[#666666]">1 week ago</span>
        <Button size="sm" variant="ghost">View</Button>
      </div>
    </div>
  </div>
</Card>
```

---

## Save & Cancel Behavior

### Draft Agent (In-Place Editing)
```tsx
const handleSave = async () => {
  // Validate
  if (!editedAgent.name.trim()) {
    toast.error('Agent name is required');
    return;
  }
  
  // Save
  await updateAgent(editedAgent);
  
  // Update UI
  setAgent(editedAgent);
  setIsEditMode(false);
  toast.success('Agent updated');
};

const handleCancel = () => {
  // Revert changes
  setEditedAgent(agent);
  setIsEditMode(false);
};
```

### Published Agent (Version Creation)
```tsx
const handlePublishEdited = async () => {
  // Show version dialog
  setShowPublishDialog(true);
};

// In publish dialog
const handleVersionPublish = async (versionType: 'major' | 'minor') => {
  const newVersion = versionType === 'major'
    ? incrementMajor(agent.version)
    : incrementMinor(agent.version);
  
  // Publish new version
  await publishAgent({
    ...editedAgent,
    version: newVersion,
    replacesVersion: agent.version,
  });
  
  // Archive old version
  await archiveAgent(agent.id);
  
  toast.success(`Published v${newVersion}`);
  navigate(`/agents/${editedAgent.id}`);
};
```

---

## UI States

### State 1: View Mode (Default)
```
┌──────────────────────────────────────┐
│ Sales Analytics Agent                │
│ Comprehensive sales data analysis    │
│ Category: Sales                      │
│                                      │
│ Tables (3): orders, order_items...  │
│                                      │
│ [Edit Agent] [Share] [Configure]    │
└──────────────────────────────────────┘
```

### State 2: Edit Mode (Draft)
```
┌──────────────────────────────────────┐
│ Name: [Sales Analytics Agent____]   │
│ Desc: [Comprehensive sales...____]  │
│ Category: [Sales ▼]                 │
│                                      │
│ Tables (3):                         │
│ • orders [Edit Context] [Remove]    │
│ • order_items [Edit Context]        │
│ [+ Add Table]                       │
│                                      │
│ [Save Changes] [Cancel]             │
└──────────────────────────────────────┘
```

### State 3: Edit Published Warning
```
┌──────────────────────────────────────┐
│ ⚠️ Edit Published Agent?             │
│                                      │
│ Create new draft v3.0?               │
│ Original v2.3 stays published.       │
│                                      │
│ [Create Draft] [Cancel]             │
└──────────────────────────────────────┘
```

### State 4: Table Context Editor
```
┌──────────────────────────────────────┐
│ 💬 Edit Context: ecommerce.orders    │
├──────────────────────────────────────┤
│                                      │
│ Current: Order transactions...       │
│                                      │
│ AI: How to refine?                  │
│ You: Add fulfillment status_____    │
│ AI: Updated context...              │
│                                      │
│ [Apply] [Cancel]                    │
└──────────────────────────────────────┘
```

---

## Navigation Flow

### Edit Flow Map
```
AgentDetails (View)
    ↓ [Edit Agent]
    ├─ Draft? → Edit Mode
    │           ↓
    │       AgentDetails (Edit Mode)
    │           ↓
    │       [Edit Context] → ContextEditor Dialog
    │           ↓           (AI Conversation)
    │       [Save] → AgentDetails (View)
    │
    └─ Published? → Create Version Dialog
                ↓
            AgentDetails (New Draft, Edit Mode)
                ↓
            [Publish] → Version Dialog
                ↓
            AgentDetails (New Published Version)
```

---

## Implementation Checklist

### Phase 1: Basic Edit Mode ✓
- [ ] Add "Edit Agent" button in AgentDetails
- [ ] Create edit mode state
- [ ] Editable name field
- [ ] Editable description field
- [ ] Editable category dropdown
- [ ] Save/Cancel buttons
- [ ] Validate changes
- [ ] Toast notifications

### Phase 2: Published Agent Versioning ✓
- [ ] Detect published status
- [ ] Show version warning dialog
- [ ] Create draft version function
- [ ] Navigate to new draft
- [ ] Show version history
- [ ] Archive old versions

### Phase 3: Table Context Editing ✓
- [ ] "Edit Context" button per table
- [ ] Create ContextEditor component
- [ ] AI conversation interface
- [ ] Mock AI responses
- [ ] Apply context changes
- [ ] Save to agent draft

### Phase 4: Table Detail Page ✓
- [ ] Create TableDetail.tsx page
- [ ] Add route in App.tsx
- [ ] Show table information
- [ ] Display current context
- [ ] List agents using table
- [ ] Show relationships
- [ ] Sample data preview
- [ ] Link from AgentDetails

### Phase 5: Advanced Features
- [ ] Add/remove tables in edit mode
- [ ] Bulk edit multiple tables
- [ ] Context suggestions from AI
- [ ] Validation warnings
- [ ] Diff view (before/after)
- [ ] Restore previous versions

---

## Mock AI Responses

### Context Update Examples

**Input:** "Add information about order fulfillment"
```
AI Response:
"I'll update the context to include fulfillment information:

Order transactions including order date, status, total amount,
customer references, and fulfillment status tracking from 
order placement through delivery.

Does this capture what you need?"
```

**Input:** "Make it more concise"
```
AI Response:
"Here's a more concise version:

Order transactions with date, status, amount, customer reference,
and fulfillment tracking.

Is this better?"
```

**Input:** "Focus on the business metrics available"
```
AI Response:
"Updated to emphasize business metrics:

Order transactions enabling analysis of revenue, order frequency,
customer purchase patterns, and fulfillment performance metrics.

Shall I apply this?"
```

---

## Data Model Updates

### Agent Type Extension
```typescript
interface Agent {
  // ... existing fields
  
  // Version control
  version?: string;
  versionHistory?: VersionHistory[];
  baseVersionId?: string;
  baseVersionName?: string;
  
  // Edit permissions
  editors?: string[];
  lastEditedBy?: string;
  lastEditedAt?: string;
  
  // Draft system
  isDraft?: boolean;
  draftOf?: string; // If draft, which published agent
}

interface VersionHistory {
  version: string;
  publishedAt: string;
  publishedBy: string;
  changes: string[];
  agentId: string;
}
```

### Table Context
```typescript
interface TableContext {
  tableId: string;
  tableName: string;
  schema: string;
  context: string;
  lastUpdated: string;
  updatedBy: string;
  conversationHistory?: ContextConversation[];
}

interface ContextConversation {
  timestamp: string;
  userMessage: string;
  aiResponse: string;
  contextBefore: string;
  contextAfter: string;
}
```

---

## Summary

### What We're Building

1. **✅ Edit Mode in AgentDetails**
   - Toggle between view/edit modes
   - Inline editing of name, description, category
   - Edit tables and their contexts
   - Save/cancel with validation

2. **✅ Version Control for Published Agents**
   - Create draft versions instead of direct edits
   - Version history tracking
   - Major/minor version increments
   - Archive old versions

3. **✅ Table Detail Pages**
   - Dedicated page per table
   - Show table info, context, usage
   - Link from agent details
   - Contextual navigation

4. **✅ AI Conversational Context Editor**
   - Natural language editing
   - Back-and-forth refinement
   - Show proposed changes
   - Apply or reject updates

5. **✅ Permission System**
   - Owner and editor roles
   - Can't edit others' agents
   - Can't modify base of extensions
   - Clear permission indicators

---

## Next Steps

1. **Implement Phase 1** (Basic Edit Mode)
   - Start with AgentDetails edit toggle
   - Add editable fields
   - Save/cancel logic

2. **Implement Phase 2** (Versioning)
   - Version warning dialog
   - Draft creation
   - Version history UI

3. **Implement Phase 3** (Context Editor)
   - ContextEditor component
   - Conversation interface
   - Mock AI responses

4. **Implement Phase 4** (Table Pages)
   - TableDetail page
   - Navigation from AgentDetails
   - Full table information

Ready to implement? 🚀
