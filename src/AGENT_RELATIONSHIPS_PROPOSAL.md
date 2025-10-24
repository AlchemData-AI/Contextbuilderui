# Agent Relationships Feature Proposal

## Overview
Enable agents to reference and collaborate with other agents, creating a network of specialized knowledge engines.

---

## Strategic Placement Decision

### ❌ Option 1: During Validation (Step 4)
**Pros:**
- Everything configured in one flow

**Cons:**
- Too complex - users already validating data relationships
- Not all agents need inter-agent relationships
- Would slow down agent creation
- Circular dependency issues (referencing agents that don't exist yet)

### ❌ Option 2: As Final Wizard Step (Step 7)
**Pros:**
- Part of creation flow
- Natural progression

**Cons:**
- Makes wizard longer
- Optional feature feels mandatory
- Can't reference agents created later

### ✅ Option 3: Post-Publication Configuration (RECOMMENDED)
**Pros:**
- Keeps wizard focused on core agent creation
- Only available when other agents exist
- Can be edited anytime
- Optional feature that doesn't block publishing
- Natural place for advanced configuration
- Allows circular references (Agent A ↔ Agent B)

**Implementation Location:** Agent Details Page → New "Connected Agents" Tab

---

## Use Cases

### 1. Specialization Hierarchy
```
Sales Analytics Agent
  ├─→ Customer Insights Agent (for customer analysis)
  ├─→ Product Analytics Agent (for product performance)
  └─→ Forecasting Agent (for predictions)
```

### 2. Domain Expertise
```
Business Intelligence Agent
  ├─→ Sales Agent (sales questions)
  ├─→ Finance Agent (financial questions)
  ├─→ Operations Agent (operational questions)
  └─→ Marketing Agent (marketing questions)
```

### 3. Cross-functional Analysis
```
Supply Chain Agent ↔ Sales Agent ↔ Inventory Agent
(Bidirectional relationships for holistic insights)
```

---

## Proposed UI Flow

### Location: Agent Details Page → New Tab

```
┌─────────────────────────────────────────────┐
│ [Overview] [Queries] [Configuration]        │
│ [Activity] [Connected Agents] ← NEW TAB     │
└─────────────────────────────────────────────┘
```

### Tab Content Layout

```
┌──────────────────────────────────────────────────────────┐
│  Connected Agents                                         │
│  ──────────────────────────────────────────────────────  │
│                                                           │
│  This agent can reference other agents for specialized   │
│  knowledge. Connected agents can answer questions        │
│  outside this agent's primary domain.                    │
│                                                           │
│  [+ Add Agent Connection]                                │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📊 Customer Insights Agent                         │ │
│  │ Provides customer behavior and segmentation data   │ │
│  │                                                     │ │
│  │ Relationship Type: One-way (this agent can call)  │ │
│  │ Priority: High                                     │ │
│  │ Status: Active                                     │ │
│  │                                                     │ │
│  │ Use for: "Customer questions", "Segmentation"     │ │
│  │                                                     │ │
│  │ [Edit] [Test Connection] [Remove]                 │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📈 Forecasting Agent                               │ │
│  │ Provides predictive analytics and trends          │ │
│  │                                                     │ │
│  │ Relationship Type: Bidirectional                  │ │
│  │ Priority: Medium                                   │ │
│  │ Status: Active                                     │ │
│  │                                                     │ │
│  │ Use for: "Future predictions", "Trends"           │ │
│  │                                                     │ │
│  │ [Edit] [Test Connection] [Remove]                 │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Connection Dialog

When clicking "[+ Add Agent Connection]":

```
┌─────────────────────────────────────────────────┐
│  Add Agent Connection                      [×]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Select Agent                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ 🔍 Search agents...                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Available Agents:                              │
│  ┌─────────────────────────────────────────┐   │
│  │ ☐ Customer Insights Agent               │   │
│  │   Analyzes customer behavior            │   │
│  │                                          │   │
│  │ ☐ Product Analytics Agent               │   │
│  │   Tracks product performance            │   │
│  │                                          │   │
│  │ ☐ Forecasting Agent                     │   │
│  │   Provides predictive analytics         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Relationship Type                              │
│  ○ One-way (this agent can call selected)      │
│  ○ Bidirectional (agents can call each other)  │
│                                                 │
│  Priority                                       │
│  ○ High (always try this agent first)          │
│  ○ Medium (try if primary data insufficient)   │
│  ○ Low (fallback option)                       │
│                                                 │
│  When to Use (Optional)                         │
│  ┌─────────────────────────────────────────┐   │
│  │ Add keywords or question patterns...    │   │
│  └─────────────────────────────────────────┘   │
│  e.g., "customer behavior", "churn analysis"   │
│                                                 │
│             [Cancel]  [Add Connection]          │
└─────────────────────────────────────────────────┘
```

---

## Visual Representation

### Agent Details Overview Tab Enhancement

Add a "Connected Agents" section to the Overview tab:

```
┌──────────────────────────────────────────┐
│  Connected Agents (3)                    │
├──────────────────────────────────────────┤
│                                          │
│  Customer     Product      Forecasting   │
│  Insights  →  Analytics →  Agent         │
│  Agent        Agent                      │
│                                          │
│  [View All Connections →]                │
└──────────────────────────────────────────┘
```

### Network Visualization (Future Enhancement)

```
              Sales Analytics Agent
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
   Customer      Product       Forecasting
   Insights      Analytics        Agent
    Agent         Agent
```

---

## Implementation Details

### Data Model

```typescript
interface AgentConnection {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  relationshipType: 'one-way' | 'bidirectional';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'paused' | 'error';
  useForKeywords: string[];
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
}
```

### API Endpoints (Mock)

```typescript
// Get connections for an agent
GET /api/agents/:agentId/connections

// Add a new connection
POST /api/agents/:agentId/connections
{
  targetAgentId: string;
  relationshipType: 'one-way' | 'bidirectional';
  priority: 'high' | 'medium' | 'low';
  useForKeywords: string[];
}

// Update connection
PATCH /api/agents/:agentId/connections/:connectionId

// Remove connection
DELETE /api/agents/:agentId/connections/:connectionId

// Test connection
POST /api/agents/:agentId/connections/:connectionId/test
```

---

## Behavior Specification

### Query Routing Logic

1. **Primary Agent**: Attempt to answer with own data
2. **If insufficient**: Check connected agents by priority
3. **High Priority**: Try immediately
4. **Medium Priority**: Try if confidence < 70%
5. **Low Priority**: Try if no answer found

### Example Flow:

```
User asks Sales Agent: "What's our customer churn rate by segment?"

1. Sales Agent checks own data
   → Has sales data but no churn calculation

2. Checks connected agents with "churn" keyword
   → Finds "Customer Insights Agent" (High Priority)

3. Routes sub-query to Customer Insights Agent
   → Gets churn rate by segment

4. Combines data and responds with full context
   → "Based on Customer Insights data, your churn rate..."
```

---

## UI Components Needed

### 1. ConnectedAgentsTab.tsx
Main tab content with list of connections

### 2. AddConnectionDialog.tsx
Dialog for adding new agent connections

### 3. ConnectionCard.tsx
Individual connection card with details

### 4. ConnectionTestDialog.tsx
Test connection with sample queries

### 5. ConnectionNetworkGraph.tsx (Phase 2)
Visual graph of agent relationships

---

## User Benefits

### For Agent Creators:
- ✅ Create specialized agents without redundancy
- ✅ Avoid duplicating data relationships
- ✅ Compose complex analytical capabilities
- ✅ Maintain single source of truth per domain

### For End Users:
- ✅ Seamless experience across agent boundaries
- ✅ More comprehensive answers
- ✅ Don't need to know which agent to ask
- ✅ Automatic routing to best knowledge source

### For Organizations:
- ✅ Build knowledge graph of agents
- ✅ Encourage specialization
- ✅ Reduce maintenance overhead
- ✅ Scale analytics capabilities

---

## Success Metrics

- Number of agent connections created
- Query routing success rate
- Response quality improvement (user feedback)
- Reduction in "I don't know" responses
- Time saved by reusing agent capabilities

---

## Implementation Phases

### Phase 1: Core Functionality (MVP)
- ✅ Add "Connected Agents" tab to Agent Details
- ✅ Simple list view with Add/Edit/Remove
- ✅ One-way relationships only
- ✅ Basic keyword matching

### Phase 2: Enhanced Routing
- Bidirectional relationships
- Priority-based routing
- Automatic fallback logic
- Connection testing

### Phase 3: Visualization & Analytics
- Network graph visualization
- Connection usage analytics
- Suggested connections (ML-based)
- Circular dependency detection

---

## Alternative: Quick Add During Creation

If we want to support adding connections during creation, add an optional step:

**Location:** After Step 6 (Review & Publish)

```
Step 6: Review & Publish
  → [Publish Agent]
  
Step 6.5 (Optional): Connect Related Agents
  → Shows if 2+ agents exist
  → "Want to connect this agent to existing agents?"
  → [Skip] or [Add Connections]
```

This keeps the main flow lean while offering the option for advanced users.

---

## Recommendation

**Implement as post-publication feature in Agent Details page.**

**Rationale:**
1. Keeps wizard focused and fast
2. Natural place for advanced config
3. Can reference any existing agent
4. Easy to modify over time
5. Doesn't block agent creation
6. Clear separation of concerns

**Next Steps:**
1. Add "Connected Agents" tab to AgentDetails.tsx
2. Create connection dialog
3. Implement connection cards
4. Add mock data for demonstration
5. Design connection testing UI
