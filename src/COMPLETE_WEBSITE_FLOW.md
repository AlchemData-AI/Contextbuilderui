# AlchemData AI - Complete Website Flow Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication & Roles](#authentication--roles)
3. [Main Application Structure](#main-application-structure)
4. [Core User Flows](#core-user-flows)
5. [Detailed Screen-by-Screen Breakdown](#detailed-screen-by-screen-breakdown)
6. [Technical Architecture](#technical-architecture)

---

## Overview

**AlchemData AI Context Builder** is an enterprise-grade B2B SaaS platform for creating and managing "Context Agents" that serve as knowledge engines for AI Data Scientists.

### Design System
- **Primary Color**: AlchemData Teal (#00B5B3)
- **Typography**: Inter font family
- **Grid**: 8pt spacing system
- **Aesthetic**: Databricks-inspired clean, professional UI

### Core Functionality
- ✅ **Agent Creation Wizard** (8 steps)
- ✅ **Agentic Chat** (Gemini/OpenAI-style interface)
- ✅ **Role-Based Access Control** (User/Analyst/Admin)
- ✅ **Agent Sharing** (Public/Private visibility)
- ✅ **Rules Management** (3 creation methods)
- ✅ **Real-time Agent Execution Timeline** (SSE streaming)
- ✅ **Settings & Configuration**
- ✅ **SQL Workbench**
- ✅ **Data Catalog**

---

## Authentication & Roles

### Login Flow
**Route**: `/login`

The application uses role-based authentication with three user types:

#### 1. **User** (Basic Access)
- ✅ Can view published agents
- ✅ Can access chat interface
- ✅ Can use SQL Workbench (view-only)
- ❌ Cannot create agents
- ❌ Cannot edit agents
- ❌ Cannot access data sources

#### 2. **Analyst** (Power User)
- ✅ All User permissions
- ✅ Can create new agents
- ✅ Can edit own agents
- ✅ Can configure golden queries
- ✅ Can access data catalog
- ❌ Cannot access admin settings
- ❌ Cannot manage data sources

#### 3. **Admin** (Full Access)
- ✅ All Analyst permissions
- ✅ Can edit any agent
- ✅ Can delete agents
- ✅ Can manage data sources
- ✅ Can access all settings
- ✅ Can manage users

### Onboarding Flow
**Route**: `/onboarding`

New users go through an onboarding flow after first login to:
- Select their role
- Configure initial preferences
- Learn about the platform

After onboarding, users are redirected to `/chat` (main entry point).

---

## Main Application Structure

### ChatLayout Wrapper
Most of the application runs inside `ChatLayout`, which provides:
- **Left Sidebar** with navigation
- **Main Content Area**
- **Collapsible Right Panel** (for chat contexts)

### Navigation Structure

```
🏠 Chat Home            /chat
💬 Agentic Chat         /chat/new or /chat/:conversationId
📊 Chat Dashboard       /chat/dashboard
🤖 Agents               /agents
📋 Rules                /rules
💾 SQL Workbench        /sql-workbench
📚 Data Catalog         /data-catalog
🔌 Data Sources         /data-sources (Admin only)
📖 Documentation        /documentation
⚙️ Settings             /settings
```

---

## Core User Flows

### Flow 1: Creating a New Agent (Primary Flow)

**Entry Point**: Click "Create New Agent" from `/agents` dashboard

**8-Step Wizard Process**:

```
Step 1: Select Tables                    /agents/create/step-1
   ↓
Step 2: Persona Definition              /agents/create/step-2
   ↓
Step 3: Run Analysis                    /agents/create/step-3
   ↓
Step 4: Analysis Validation             /agents/create/step-4
   ↓
Step 5: Configure Relationships         /agents/create/step-5
   ↓
Step 6: Sample Queries & Metrics        /agents/create/step-6
   ↓
Step 7 (Sub-step A): Context Review     /agents/create/step-7
   ↓
Step 7 (Sub-step B): Review & Publish   /agents/create/step-8
   ↓
Step 8: Agent Relationships (Optional)  /agents/create/step-9
   ↓
Success Page                            /publish-success
```

### Flow 2: Editing an Existing Agent

**Entry Point**: Click "Edit" from agent actions menu

**Same wizard, different routes**:
- `/agents/:agentId/edit/step-1` through `/agents/:agentId/edit/step-8`
- Pre-filled with existing agent data
- Creates new version for published agents
- Modifies in-place for draft agents

### Flow 3: Extending an Agent (Post-Publish)

**Entry Point**: After publishing, or from agent details

**Routes**:
- `/agents/:id/extend` - Full-screen extension wizard
- `/configure-relationships/:agentId` - Add agent-to-agent relationships
- `/configure-golden-queries/:agentId` - Add/manage golden queries

### Flow 4: Using Agentic Chat

**Entry Point**: `/chat` or `/chat/new`

**Chat Flow**:
1. User enters question
2. Agent streams 5 types of execution steps (SSE):
   - 🔍 Understanding
   - 📊 Planning
   - 🔧 Execution
   - ✅ Validation
   - 💬 Response
3. Real-time timeline shows step progress
4. User can save rules mid-conversation
5. Can request analyst review
6. Can provide feedback on responses

### Flow 5: Rules Management

**Three Methods to Create Rules**:

#### Method 1: Onboarding Flow
- During agent wizard (Steps 2, 4, 6)
- System auto-suggests rules based on data analysis

#### Method 2: Manual Creation via `/rules`
- AI-assisted chat interface
- User describes what they want
- AI generates appropriate rules

#### Method 3: Mid-Conversation Saving
- During chat, click "Save as Rule"
- Captures context from current conversation
- Adds to agent's rule set

---

## Detailed Screen-by-Screen Breakdown

### 🏠 Chat Home (`/chat`)
**Component**: `ChatWelcome`

**What You See**:
- Welcome message
- Recent conversations list
- Quick actions to start new chat
- Agent selector

**Actions**:
- Click "New Chat" → `/chat/new`
- Click conversation → `/chat/:conversationId`
- Select agent for chat session

---

### 💬 Agentic Chat (`/chat/new` or `/chat/:conversationId`)
**Component**: `AgenticChat`

**Features**:
- **Left Panel**: Conversation history with date grouping
- **Center Panel**: Chat messages with streaming responses
- **Right Panel**: 
  - Agent context information
  - Execution timeline (real-time SSE)
  - Confidence indicators for trusted queries
  
**Execution Timeline** (5 Step Types):
1. **Understanding** - Agent analyzes the question
2. **Planning** - Creates execution plan
3. **Execution** - Runs queries/analysis
4. **Validation** - Checks results
5. **Response** - Formulates answer

**Special Features**:
- Trust badges for high-confidence queries
- Artifact panel for SQL/charts/tables
- Feedback buttons (👍/👎)
- Save as rule functionality
- Request analyst review
- Export conversation

**Artifact Types**:
- SQL queries with syntax highlighting
- Data tables with pagination
- Charts (line, bar, pie using Recharts)
- Python code snippets

---

### 🤖 Agents Dashboard (`/agents`)
**Component**: `AgentsDashboard`

**What You See**:
- Agents table with 10+ sample agents
- Search bar (filter by name/description)
- Multi-filter dropdowns:
  - Status (Draft, Published, Archived)
  - Owner (filter by creator)
  - Last Modified date range

**Agent Card Information**:
- Name (clickable → agent details)
- Description
- Status badge
- Owner
- Last modified date
- Actions dropdown (⋮)

**Actions Menu**:
- **View** → `/agents/:agentId`
- **Edit** → `/agents/:agentId/edit/step-1`
- **Clone** → Duplicates agent
- **Share** → Share dialog
- **Extend** → `/agents/:id/extend`
- **Archive/Delete** (Admin only)

**Top Actions**:
- **Create New Agent** → `/agents/create/step-1`
- **Import Agent** (future)

---

### 📄 Agent Details (`/agents/:agentId`)
**Component**: `AgentDetails`

**Tabs**:
1. **Overview**
   - Agent metadata
   - Status and visibility
   - Usage statistics
   
2. **Context**
   - Table and column descriptions
   - Business context
   - Relationships
   
3. **Rules**
   - All rules for this agent
   - Grouped by type
   - Edit capabilities
   
4. **Sample Queries**
   - Golden queries list
   - Expected results
   - Test functionality
   
5. **Activity**
   - Usage logs
   - Performance metrics
   - User feedback

**Actions**:
- Edit Agent
- Share Settings
- Archive
- View in Chat

---

## 🧙‍♂️ Agent Creation Wizard (Detailed)

### Step 1: Select Tables (`/agents/create/step-1`)
**Component**: `Step1SelectTables`

**Layout**: Two-pane (Available | Selected)

**Features**:
- Search and filter available tables
- Schema information (rows, columns)
- Visual selection with checkboxes
- Drag tables between panes
- Remove buttons on selected items
- Metadata preview on hover

**Validation**: Must select at least 1 table

**Navigation**:
- Back → Dashboard
- Continue → Step 2

---

### Step 2: Persona Definition (`/agents/create/step-2`)
**Component**: `Step2PersonaDefinition`

**What You Configure**:
- **Target Users**: Who will use this agent?
  - Sales Managers
  - Business Analysts
  - Data Scientists
  - Executives
  
- **Business Context**: What is this agent for?
  - Free-text description
  
- **Analysis Scope**:
  - Quick insights
  - Deep analysis
  - Custom
  
- **Question Types** (checkboxes):
  - Performance metrics
  - Trend analysis
  - Forecasting
  - Anomaly detection
  - Comparative analysis

**Advanced Settings** (Progressive Disclosure):
- Analysis depth slider
- Include technical details toggle
- Auto-generate sample queries toggle

**Navigation**:
- Back → Step 1
- Continue → Step 3

---

### Step 3: Run Analysis (`/agents/create/step-3`)
**Component**: `Step3RunAnalysis`

**Visual Design**: Vertical timeline format

**Analysis Phases** (Auto-runs):
1. **Schema Analysis** (10s)
   - Analyzing table structures
   - Identifying primary keys
   - Detecting foreign keys
   
2. **Relationship Discovery** (15s)
   - Analyzing table connections
   - Validating relationships
   - Building graph model
   
3. **Column Profiling** (20s)
   - Analyzing data types
   - Detecting patterns
   - Identifying metrics
   
4. **Metric Identification** (12s)
   - Finding KPIs
   - Calculating aggregates
   - Defining dimensions
   
5. **Query Pattern Analysis** (18s)
   - Common query patterns
   - Performance optimization
   - Index recommendations

**Features**:
- Overall progress bar (0-100%)
- Each step expandable to show logs
- Timestamped log entries
- Visual status indicators:
  - ⏳ Pending (gray)
  - ⚙️ Running (teal, animated)
  - ✅ Complete (green)

**Auto-navigation**: When complete, auto-advances to Step 4

---

### Step 4: Analysis Validation (`/agents/create/step-4`)
**Component**: `Step4AnalysisValidation`

**Summary Cards** (Top):
- 📊 Tables Analyzed: X tables
- 🔗 Relationships Found: Y connections
- 📈 Metrics Identified: Z metrics
- ❓ Questions Generated: N questions

**4-Tab Interface**:

#### Tab 1: Relationship Graph (Default)
- Interactive force-directed graph
- Nodes = Tables
- Edges = Foreign key relationships
- Hover to highlight
- Click to select
- Selected table info panel below

#### Tab 2: Key Metrics
- Metric cards with:
  - Name
  - Type (Sum, Avg, Count, etc.)
  - Source table
  - Trend indicator (↑↓)
  - Sample value

#### Tab 3: Query Patterns
- Common patterns discovered:
  - "Revenue by time period"
  - "Customer segmentation"
  - "Product performance"
- Frequency badges
- Complexity indicators

#### Tab 4: Relationships Table
- Tabular view of all relationships
- Columns:
  - Source Table
  - Source Column
  - Target Table
  - Target Column
  - Relationship Type
  - Confidence Score

**Validation Actions**:
- Accept all
- Reject specific items
- Modify relationships

**Navigation**:
- Back → Step 3 (re-runs analysis)
- Continue → Step 5

---

### Step 5: Configure Relationships (`/agents/create/step-5`)
**Component**: `Step5ConfigureRelationships`

**Purpose**: Fine-tune table relationships

**Features**:
- Visual relationship editor
- Add/remove relationships
- Set cardinality (1:1, 1:N, N:M)
- Define join conditions
- AI suggestions for improvements

**Relationship Card** shows:
- Source ↔️ Target
- Join columns
- Relationship type
- Confidence indicator
- Edit/Delete actions

**AI Assistant**:
- Chat interface on right
- Ask questions about relationships
- Get suggestions for missing links
- Validate relationship logic

**Navigation**:
- Back → Step 4
- Continue → Step 6

---

### Step 6: Sample Queries & Metrics (`/agents/create/step-6`)
**Component**: `Step5SampleQueriesMetrics`

**Two Sections**:

#### A. Sample Queries (Golden Queries)
- Pre-populated with 3 sample queries
- Each query has:
  - Natural language question
  - Expected result description
  - Edit capability
  - Delete button (if > 1)
  
- **Add Another Query** button
- Minimum 1 query required

**Purpose**: These become "trusted queries" that get confidence indicators in chat

#### B. Key Metrics
- Define business metrics:
  - Total Revenue
  - Average Order Value
  - Active Customers
  - Inventory Turnover
  
- Each metric has:
  - Name
  - Calculation formula
  - Source tables
  - Unit (currency, count, etc.)

**Navigation**:
- Back → Step 5
- Continue to Review → Step 7

---

### Step 7A: Context Review (`/agents/create/step-7`)
**Component**: `Step6ContextReview`

**Purpose**: Review and edit business context for tables and columns

**Layout**: Accordion-style expandable sections

**For Each Table**:
- Table name and schema
- **Business Context** textarea (editable)
  - What is this table for?
  - Business meaning
  - Usage notes
  
**For Each Column** in table:
- Column name and data type
- **Business Context** textarea (editable)
  - What does this column represent?
  - Business rules
  - Valid values/ranges

**Note**: "Description" fields were removed - only "Business Context" remains

**Features**:
- AI suggestions for context (sparkle icon)
- Bulk edit capabilities
- Copy context from similar tables

**Navigation**:
- Back → Step 6
- Continue to Review → Step 7B (step-8)

---

### Step 7B: Review & Publish (`/agents/create/step-8`)
**Component**: `Step6ReviewPublish`

**Shows in Sidebar**: Still displays as "Step 7" (same as 7A - they're sub-steps)

**Agent Details**:
- **Agent Name** (required)
- **Description** (optional)

**Configuration Summary**:
- 📊 Data Tables: List of selected tables
- 👥 Target Users: Selected personas
- 🔗 Relationships: Count of validated relationships
- 📈 Key Metrics: List of defined metrics
- 💬 Sample Queries: Count of golden queries

**Sharing Settings** (Radio buttons):

#### Option 1: Public
- 🌐 Available to everyone in organization
- Default selection

#### Option 2: Private
- 🔒 Share with specific people by email
- Email input field
- Add/remove email list
- Minimum 1 email required if private

**Ready to Publish Banner**:
- ✅ "Configuration complete" indicator
- Summary of settings

**Footer** (Fixed at bottom):
- Configuration complete badge
- Visibility indicator
- **Publish Agent** button (primary CTA)

**On Publish**:
- Shows "Publishing..." state
- Success toast
- Navigates to Step 8 (Agent Relationships - Optional)

**Navigation**:
- Back → Step 7A (Context Review)
- Publish → Step 8 (Optional) or Success

---

### Step 8: Agent Relationships (Optional) (`/agents/create/step-9`)
**Component**: `Step8AgentRelationships`

**Shows in Sidebar**: Step 8 with "Optional" badge

**Purpose**: Connect this agent to other existing agents for cross-analysis

**Proposed Connections** (AI-generated):
Each connection card shows:
- Target agent name and description
- Confidence score (0-100%)
- Relationship reason
- Priority (High/Medium/Low)
- Relationship type:
  - One-way → This agent can query that agent
  - Bidirectional ↔️ Both agents can query each other
  
- **Foreign Keys** that enable the connection
- **Shared Tables**

**User Actions per Connection**:
- ✅ Approve
- ❌ Reject
- ✏️ Modify (opens AI chat)
- 💬 Ask questions (chat interface)

**AI Chat Feature**:
- Click "Discuss" on any connection
- Chat panel slides in
- Ask questions about the relationship
- Get explanations
- Modify connection parameters

**Footer**:
- Shows approval count
- **Skip All** button → Navigate to agent details
- **Finish** button → Navigate to agent details

**Navigation**:
- Skip All → `/agents/:agentId`
- Finish → `/agents/:agentId`

---

### ✅ Publish Success (`/publish-success`)
**Component**: `PublishSuccess`

**Celebration Screen**:
- 🎉 Success animation
- Agent name and ID
- Summary of configuration
- Next steps:
  - View agent
  - Start chat
  - Create another agent

---

## 📋 Rules Management (`/rules`)
**Component**: `Rules`

**Purpose**: Central place to view and manage all rules across agents

**Rule Types**:
1. **Business Rules** - Domain logic
2. **Calculation Rules** - Metric definitions
3. **Validation Rules** - Data quality checks
4. **Query Rules** - SQL optimization
5. **Visualization Rules** - Chart preferences

**Features**:
- Filter by agent
- Filter by rule type
- Search rules
- Edit/Delete rules
- Test rules

**Create New Rule** (AI Chat Interface):
1. Click "Create Rule"
2. Describe what you want in natural language
3. AI generates rule
4. Review and confirm
5. Assign to agent(s)

**Rule Card Shows**:
- Rule name
- Type badge
- Description
- Associated agent(s)
- Created date
- Last used date
- Actions (Edit, Delete, Duplicate)

---

## 💾 SQL Workbench (`/sql-workbench`)
**Component**: `SQLWorkbench`

**Purpose**: Execute SQL queries and explore data

**Layout**:
- **Left Panel**: Database schema tree
- **Center Panel**: SQL editor with syntax highlighting
- **Bottom Panel**: Query results table

**Features**:
- Auto-complete for table/column names
- Query history
- Save queries
- Export results (CSV, JSON)
- Format SQL
- Explain query plan

**Role-based access**:
- **User**: Read-only queries
- **Analyst**: Read-only + Save queries
- **Admin**: Full access including DDL

---

## 📚 Data Catalog (`/data-catalog`)
**Component**: `DataCatalog`

**Purpose**: Browse all available data sources, tables, and columns

**Features**:
- Search across all metadata
- Browse by database/schema/table
- View lineage
- See table usage statistics
- View sample data
- Access control information

**Table Detail View**:
- Schema information
- Column details with types
- Sample data preview
- Related agents
- Usage statistics
- Last refresh date

---

## 🔌 Data Sources (`/data-sources`)
**Component**: `DataSources`
**Access**: Admin only

**Purpose**: Configure database connections

**Features**:
- Add new data source
- Test connection
- Configure refresh schedule
- View connection logs
- Manage credentials

**Supported Sources**:
- PostgreSQL
- MySQL
- Snowflake
- BigQuery
- Redshift
- Databricks

---

## ⚙️ Settings (`/settings`)
**Component**: `Settings`

**Three Main Sections**:

### 1. Data Connectors
- Configure database connections
- API keys
- Authentication methods
- Connection testing

### 2. Context Builder Settings
- **Sampling Scale**: How much data to analyze
  - Light (1%)
  - Medium (10%)
  - Heavy (50%)
  - Full (100%)
- Analysis preferences
- Default configurations

### 3. Failure Case Prompts
- Test scenarios for agent behavior
- Edge case handling
- Error recovery strategies
- Custom prompts for testing

**Other Settings Tabs**:
- Profile (User information)
- Notifications (Email, Slack)
- API Keys (For integrations)
- Security (2FA, Session timeout)
- Team (User management - Admin only)

---

## Technical Architecture

### State Management

**Zustand Stores**:

1. **authStore** (`/lib/authStore.ts`)
   - User authentication state
   - Role and permissions
   - Onboarding status

2. **conversationStore** (`/lib/conversationStore.ts`)
   - Chat history
   - Active conversation
   - Message streaming state

3. **editAgentStore** (`/lib/editAgentStore.ts`)
   - Agent being edited
   - Wizard progress
   - Draft changes

4. **rulesStore** (`/lib/rulesStore.ts`)
   - All rules
   - Rule creation state
   - Rule associations

5. **settingsStore** (`/lib/settingsStore.ts`)
   - User preferences
   - App configuration

6. **layoutStore** (`/lib/layoutStore.ts`)
   - Sidebar collapsed state
   - Panel visibility
   - Layout preferences

7. **notebookStore** (`/lib/notebookStore.ts`)
   - Notebook cells
   - Execution state
   - Results cache

### Key Components

**Layout Components**:
- `Layout.tsx` - Dashboard wrapper
- `ChatLayout.tsx` - Chat interface wrapper with sidebar
- `WizardLayout.tsx` - Wizard stepper with left sidebar
- `TwoPanelWizardLayout.tsx` - Split-pane wizard variant

**Wizard Components**:
- `WizardChat.tsx` - AI chat interface for wizard steps
- `UnifiedWizardChat.tsx` - Enhanced chat with context
- `RelationshipGraph.tsx` - Interactive graph visualization

**Chat Components**:
- `AgentExecutionTimeline.tsx` - Real-time step display (SSE)
- `NotebookEditor.tsx` - Code/query editor
- `NotebookRightSidebar.tsx` - Context panel
- `SqlWorkbench.tsx` - SQL editor component

**Shared Components**:
- `Sidebar.tsx` - Main navigation
- `Logo.tsx` - AlchemData branding
- `StatusBadge.tsx` - Status indicators
- `ProtectedRoute.tsx` - Route guards with permissions
- `NetworkGraph.tsx` - Force-directed graph
- `TrustBadgeTest.tsx` - Confidence indicators

### Routing Structure

**Public Routes**:
- `/login` - Authentication

**Protected Routes** (require auth):
- `/onboarding` - First-time setup
- `/chat/*` - Chat interface
- `/agents/*` - Agent management
- `/rules` - Rules management
- `/sql-workbench` - SQL execution
- `/data-catalog` - Data browsing

**Permission-Gated Routes**:
- `/agents/create/*` - Requires `canCreateAgents`
- `/agents/:id/edit/*` - Requires `canEditAgents`
- `/agents/:id/extend` - Requires `canEditAgents`
- `/data-sources` - Requires `canAccessDataSources`
- `/settings` (some tabs) - Requires admin role

### Real-Time Features

**Server-Sent Events (SSE)**:
- Agent execution timeline
- Live query results
- Progress updates
- Notification streaming

**Streaming Steps** (5 types):
1. Understanding - Question analysis
2. Planning - Execution strategy
3. Execution - Running queries
4. Validation - Result checking
5. Response - Answer formulation

### Data Flow

**Agent Creation Flow**:
```
User Input → Wizard State → Analysis Service → Results → Validation → Agent Store → Backend
```

**Chat Flow**:
```
User Question → Agent Selection → SSE Stream → Timeline Updates → Artifact Display → User Feedback
```

**Rules Flow**:
```
User Intent → AI Chat → Rule Generation → Review → Confirmation → Rules Store → Agent Association
```

---

## 🎯 Key User Journeys

### Journey 1: First-Time User (Analyst Role)
1. Login at `/login`
2. Complete onboarding at `/onboarding`
3. Redirect to `/chat` (welcome screen)
4. Explore chat interface
5. Navigate to `/agents` to see existing agents
6. Click "Create New Agent"
7. Complete 8-step wizard
8. Publish agent
9. Test in chat interface

### Journey 2: Creating Rules Mid-Conversation
1. Start chat at `/chat/new`
2. Ask question
3. Agent responds with execution timeline
4. User notices pattern they want to save
5. Click "Save as Rule"
6. Review generated rule
7. Confirm and associate with agent
8. Continue conversation

### Journey 3: Agent Collaboration Setup
1. Publish primary agent (Step 8 complete)
2. See suggested agent relationships
3. Review each connection
4. Use AI chat to understand relationships
5. Approve high-confidence connections
6. Modify uncertain connections
7. Skip low-priority connections
8. Finish and view agent details

### Journey 4: Post-Publish Configuration
1. Agent published and live
2. Navigate to agent details
3. Click "Configure Golden Queries"
4. Add trusted queries for confidence badges
5. Test queries
6. Save configuration
7. Queries now show trust badges in chat

---

## 📊 Feature Matrix by Role

| Feature | User | Analyst | Admin |
|---------|------|---------|-------|
| View agents | ✅ | ✅ | ✅ |
| Use chat | ✅ | ✅ | ✅ |
| Create agents | ❌ | ✅ | ✅ |
| Edit own agents | ❌ | ✅ | ✅ |
| Edit any agent | ❌ | ❌ | ✅ |
| Delete agents | ❌ | ❌ | ✅ |
| Create rules | ❌ | ✅ | ✅ |
| SQL Workbench (read) | ✅ | ✅ | ✅ |
| SQL Workbench (write) | ❌ | ❌ | ✅ |
| Data Catalog | ✅ | ✅ | ✅ |
| Data Sources | ❌ | ❌ | ✅ |
| Settings (basic) | ✅ | ✅ | ✅ |
| Settings (admin) | ❌ | ❌ | ✅ |
| User management | ❌ | ❌ | ✅ |

---

## 🗺️ Site Map

```
AlchemData AI Context Builder
│
├── 🔐 Authentication
│   ├── /login - Login page
│   └── /onboarding - First-time setup
│
├── 💬 Chat (Main Entry Point)
│   ├── /chat - Welcome screen
│   ├── /chat/new - New conversation
│   ├── /chat/:conversationId - Existing conversation
│   └── /chat/dashboard - All conversations
│
├── 🤖 Agents
│   ├── /agents - Dashboard
│   ├── /agents/:agentId - Agent details
│   │
│   ├── Create Wizard (8 steps)
│   │   ├── /agents/create/step-1 - Select Tables
│   │   ├── /agents/create/step-2 - Persona Definition
│   │   ├── /agents/create/step-3 - Run Analysis
│   │   ├── /agents/create/step-4 - Analysis Validation
│   │   ├── /agents/create/step-5 - Configure Relationships
│   │   ├── /agents/create/step-6 - Sample Queries & Metrics
│   │   ├── /agents/create/step-7 - Context Review
│   │   ├── /agents/create/step-8 - Review & Publish
│   │   └── /agents/create/step-9 - Agent Relationships (Optional)
│   │
│   ├── Edit Wizard (Same steps, different routes)
│   │   └── /agents/:agentId/edit/step-[1-8]
│   │
│   └── Post-Publish
│       ├── /publish-success - Success screen
│       ├── /agents/:id/extend - Extension wizard
│       ├── /configure-relationships/:agentId - Agent connections
│       └── /configure-golden-queries/:agentId - Trusted queries
│
├── 📋 Rules
│   └── /rules - Rules management
│
├── 💾 Data Tools
│   ├── /sql-workbench - SQL editor
│   └── /data-catalog - Data browsing
│
├── 🔌 Admin
│   ├── /data-sources - Connection management (Admin only)
│   └── /settings - Configuration
│       ├── Data Connectors
│       ├── Context Builder Settings
│       ├── Failure Case Prompts
│       ├── Profile
│       ├── Notifications
│       ├── API Keys
│       ├── Security
│       └── Team (Admin only)
│
└── 📖 Help
    └── /documentation - User guides
```

---

## 🎨 Design Patterns Used

### 1. Progressive Disclosure
- Advanced settings hidden by default
- Expandable sections for details
- Optional wizard steps

### 2. Two-Pane Layouts
- Available vs. Selected (Step 1)
- Source vs. Target selection
- Before vs. After comparison

### 3. Wizard Pattern
- Linear flow with validation
- Back/forward navigation
- Progress indicator
- Save draft capability

### 4. Real-time Feedback
- SSE streaming
- Progress bars
- Status indicators
- Toast notifications

### 5. Conversational UI
- AI chat interfaces
- Natural language input
- Contextual suggestions
- Inline editing

### 6. Master-Detail
- List of items → Detail view
- Agents table → Agent details
- Rules list → Rule editor

---

## 📚 Related Documentation Files

- **README.md** - Project overview
- **NAVIGATION_GUIDE.md** - Quick navigation reference
- **DESIGN_SYSTEM.md** - Design tokens and components
- **AGENTIC_CHAT_COMPLETE.md** - Chat implementation details
- **AGENT_EDITING_FLOW_PLAN.md** - Agent editing workflows
- **RULES_IMPROVEMENTS_SUMMARY.md** - Rules management features
- **SETTINGS_AND_RULES_IMPLEMENTATION.md** - Settings page details
- **EXECUTION_TIMELINE_TRUST_BADGE.md** - Real-time timeline features
- **TRUSTED_QUERY_CONFIDENCE_INDICATOR.md** - Trust badge system
- **GOLDEN_QUERIES_FEEDBACK_LOOP.md** - Golden queries workflow
- **SQL_WORKBENCH_IMPROVEMENTS.md** - SQL editor features
- **ERROR_HANDLING_TESTING_GUIDE.md** - Error scenarios
- **HOW_TO_SEE_TRUST_BADGE.md** - Trust badge usage guide
- **IN_CHAT_RULE_SAVING_GUIDE.md** - Mid-conversation rule saving

---

## 🚀 Getting Started Checklist

**For New Users**:
- [ ] Login at `/login`
- [ ] Complete onboarding
- [ ] Explore chat at `/chat`
- [ ] Browse agents at `/agents`
- [ ] Try SQL Workbench at `/sql-workbench`
- [ ] Create first agent (if Analyst/Admin)

**For Analysts**:
- [ ] Create new agent via wizard
- [ ] Configure golden queries
- [ ] Save rules during conversations
- [ ] Set up agent relationships
- [ ] Test agent in chat

**For Admins**:
- [ ] Configure data sources at `/data-sources`
- [ ] Review settings at `/settings`
- [ ] Set up team members
- [ ] Configure sampling scale
- [ ] Set up failure case prompts

---

**Last Updated**: November 24, 2025
**Version**: 2.0
**Status**: Current and Complete
