# AlchemData AI - Navigation Guide

Quick reference for navigating the application.

---

## 🏠 Main Dashboard

**URL**: `/`

**What you'll see**:
- Left sidebar with AlchemData logo and navigation
- Agents table with 10 sample e-commerce agents
- Search bar and 3 filter dropdowns
- "Create New Agent" button (top right)

**Try this**:
1. Search for "sales" to filter agents
2. Use the Owner dropdown to filter by team member
3. Click on "Sales Analytics Agent" name (teal text) → navigates to detail view
4. Click the ⋮ menu on any row → see actions (View, Clone, Publish, Delete)
5. Click "Create New Agent" → starts the wizard at Step 1

---

## 🧙‍♂️ Wizard Flow (Agent Creation)

### Step 1: Select Tables
**URL**: `/agents/create/step-1`

**Navigation**:
- Click "Create New Agent" from dashboard
- OR go directly to URL

**Try this**:
1. Search for "customer" to filter available tables
2. Click on table cards to select them (they move to right pane)
3. In right pane, hover over selected tables → see X button
4. Click X to remove a table
5. Select at least 1 table → "Continue" button activates
6. Click "Continue to Analysis Configuration"

---

### Step 2: Configure Analysis
**URL**: `/agents/create/step-2`

**Try this**:
1. Type in the Business Context textarea
2. Change the Analysis Scope dropdown
3. Toggle the switches (Analyze Relationships, Pattern Detection)
4. Click "Show Advanced Settings" → reveals more options
5. Drag the Analysis Depth slider
6. Click "Back" to return to Step 1
7. Click "Start Analysis" to proceed

---

### Step 3: Run Analysis
**URL**: `/agents/create/step-3`

**Try this**:
1. Watch the overall progress bar fill
2. See each of 5 steps run sequentially
3. Click the ∨ button on any running/completed step → expands logs
4. Read timestamped log entries
5. Wait for all steps to complete (auto-advances)
6. Click "Review Findings" when enabled

---

### Step 4: Review Findings
**URL**: `/agents/create/step-4`

**Try this**:
1. See the 4 summary cards at top (Tables, Relationships, Metrics, Questions)
2. **Relationship Graph tab** (default):
   - Hover over any node → see it highlight
   - Click a node → highlights its connections
   - See selected table info below graph
3. **Key Metrics tab**: View 4 metric cards with trends
4. **Query Patterns tab**: See common patterns with frequency badges
5. **Relationships Table tab**: Tabular view of all connections
6. Click "Answer Questions" to continue

---

### Step 5: Answer Questions ⭐
**URL**: `/agents/create/step-5`

**Most complex screen - take your time!**

**Try this**:
1. See the progress bar showing 0 of 24 answered
2. Notice the yellow alert about high-priority questions
3. Search for "revenue" → filters question list
4. Use Category dropdown → filter by "Sales Performance"
5. Use Importance dropdown → show only "High" priority
6. Use Status dropdown → filter to "Unanswered"
7. Click on a collapsed question card → expands to show answer field
8. Type an answer in the textarea → checkbox turns green
9. See progress bar update automatically
10. Check right sidebar → progress by category updates
11. Answer more questions → watch high-priority alert disappear
12. Click "Continue" when ready (works even if not all answered)

---

### Step 6: Sample Queries
**URL**: `/agents/create/step-6`

**Try this**:
1. See 3 pre-populated sample queries
2. Edit the question or expected result in any query
3. Click the 🗑️ trash icon → removes that query (if > 1)
4. Click "Add Another Query" → adds blank query card
5. Fill in your own example question
6. Click "Review & Publish"

---

### Step 7: Review & Publish
**URL**: `/agents/create/step-7`

**Try this**:
1. Edit the Agent Name and Description
2. Review the Configuration Summary table
3. Toggle "Make Available to Team"
4. Toggle "Send Notification"
5. Check the Completeness checklist (all green)
6. Click "Preview Agent Summary" or "Export Configuration"
7. Click the big "Publish Agent" button in the gradient card
8. Wait for "Publishing..." animation
9. See success toast → redirects to dashboard

**Alternative**:
- Click "Save as Draft" → saves without publishing
- Click "Back" → return to Step 6

---

## 🔧 Other Pages (Placeholders)

### Data Sources
**URL**: `/data-sources`
- Shows "Coming soon..." message

### Documentation
**URL**: `/documentation`
- Shows "Coming soon..." message

### Settings
**URL**: `/settings`
- Shows "Coming soon..." message

### Agent Details
**URL**: `/agents/:agentId`
- Shows agent ID and "Coming soon..." message
- Accessible by clicking agent name in dashboard table

---

## 💾 Save Draft Feature

**Location**: Available on all wizard steps (top right)

**Try this**:
1. Go to any wizard step
2. Click "Save Draft" button
3. See success toast
4. Changes are saved (simulated)

---

## 🔙 Navigation Between Steps

**Forward Navigation**:
- Each step has a "Continue" or "Next" button
- Button may be disabled until requirements met (e.g., Step 1 needs selection)

**Backward Navigation**:
- Each step (except Step 1) has a "Back" button
- Goes to previous step, preserves state (simulated)

**Exit Wizard**:
- Click "Back to Dashboard" (top left) on any step
- Returns to main dashboard

---

## 🎯 Progress Indicator

**Location**: Top of wizard screens

**Visual Guide**:
- **Green circle with ✓**: Completed step
- **Teal circle with number**: Current step
- **Gray circle with number**: Future step
- **Green line**: Connection between completed steps
- **Gray line**: Connection to future steps

---

## 🎨 Interactive Elements

### Hover States
- Table rows → light gray background
- Buttons → color darkens slightly
- Sidebar nav items → light gray background
- Cards → border color changes
- Graph nodes → shadow appears

### Click Actions
- Agent name → navigate to detail
- Question card → expand/collapse
- Graph node → highlight connections
- Filter dropdown → show options
- Checkbox/switch → toggle state

### Visual Feedback
- Progress bars → animate on change
- Status badges → color coded
- Toasts → appear top-right for actions
- Loading states → spinner animation

---

## 🐛 Known Limitations (Simulated Features)

- **No backend**: All data is mock/local
- **No persistence**: Refresh loses changes
- **Auto-simulation**: Step 3 analysis runs automatically
- **Static data**: Filters work on predefined mock data only
- **No auth**: No login/user management

---

## 💡 Tips for Best Experience

1. **Start from Dashboard**: Use the natural flow
2. **Complete Step 1**: Select tables to unlock Step 2
3. **Watch Step 3**: See the analysis simulation run
4. **Explore Step 4 tabs**: Each tab has different content
5. **Answer High Priority**: Start with important questions in Step 5
6. **Use filters**: Especially helpful in Step 5 with 24 questions
7. **Desktop recommended**: Designed for 1200px+ screens

---

## 🎓 Learning the Design System

**Colors**:
- Teal (#00B5B3) = Primary actions, brand
- Green (#4CAF50) = Success, completed
- Yellow (#FFC107) = Warning, medium priority
- Red (#F44336) = Error, high priority, delete
- Gray shades = Text hierarchy and borders

**Spacing**:
- Consistent 8px base unit
- Cards have 16-24px padding
- Sections separated by 24-32px

**Typography**:
- Large headings (24-28px) for page titles
- Medium (16-18px) for section headings
- Body text (13-14px) for content
- Small (11-12px) for labels and metadata

---

**Happy Exploring! 🚀**
