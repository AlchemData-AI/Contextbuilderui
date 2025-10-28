# Settings & Rules Implementation Guide

## Overview

This document describes the comprehensive implementation of Settings (with Data Connectors and Sampling Scale) and Rules management system for AlchemData AI Context Builder.

## Features Implemented

### 1. Settings Page (`/pages/Settings.tsx`)

A complete settings interface with three main tabs:

#### A. General Settings
- **User Profile Display**: Shows current user information (name, email, role)
- **Onboarding Data**: Displays team, job role, geographies, and data identifiers from onboarding

#### B. Context Builder Settings
- **Sampling Scale Configuration**: 
  - Interactive slider with 3 levels: Fast (10%), Balanced (50%), Comprehensive (100%)
  - Real-time preview of:
    - Data sampling percentage
    - Average processing time
    - Cost impact
  - Descriptive cards explaining each mode
  - Settings persist using Zustand store
  - Visual indicator shows current mode in wizard (Step 3)

**Sampling Levels:**
- **Fast (0)**: 10% sampling, ~2min processing, Low cost - Best for rapid prototyping
- **Balanced (1)**: 50% sampling, ~5min processing, Medium cost - Recommended default
- **Comprehensive (2)**: 100% sampling, ~10min processing, High cost - Most accurate

#### C. Data Connectors (Admin Only)
- **Access Control**: Only visible to users with admin role
- **Connected Sources Display**: 
  - Shows currently connected data sources
  - Status badges (Connected/Disconnected/Error)
  - Host information
  - Configure and Disconnect actions
- **Available Connectors Grid**:
  - 12 pre-configured connectors (Salesforce, SAP, Workday, ServiceNow, etc.)
  - Search functionality
  - Visual cards with icons
  - Quick connect workflow
- **Connection Dialog**:
  - Form for entering connection details (name, host, username, password)
  - Security notice about credential encryption
  - Save and cancel actions
- **Reference Image**: Shows Databricks design inspiration

### 2. Settings Store (`/lib/settingsStore.ts`)

Zustand-based persistent storage for settings:

```typescript
interface SettingsState {
  samplingScale: SamplingScale; // 0, 1, or 2
  dataConnectors: DataConnector[];
  setSamplingScale: (scale: SamplingScale) => void;
  addDataConnector: (connector) => void;
  removeDataConnector: (id: string) => void;
  updateDataConnector: (id, updates) => void;
}
```

**Default Connectors:**
- SQL Server (Production SQL Server) - Connected
- Snowflake (Snowflake Analytics) - Connected

### 3. Rules Management (`/pages/Rules.tsx`)

Complete rules dashboard with creation capabilities:

#### Features:
- **Listing View**:
  - Grid layout showing all accessible rules
  - Search across name and description
  - Filter by type (all, cohort, filter, reference, custom)
  - Access control (public/private with shared users)
  
- **Rule Cards Display**:
  - Type badge and icon
  - Public/private visibility indicator
  - Description and definition (in code block)
  - Creation date and last used
  - Metadata badges (team, geography)
  - Action menu (Edit, Duplicate, Share, Delete)

- **AI-Assisted Creation** (Method 3 - Manual):
  - Click "New Rule" to open chat panel
  - Sliding panel from right (480px width)
  - **Left sidebar auto-collapses for better focus**
  - Conversational AI guides rule creation
  - Multi-step flow:
    1. AI asks what kind of rule you want
    2. User describes the rule
    3. User provides name, description, and criteria
    4. AI creates and saves the rule
  - Default visibility: Private
  - Smooth animations with Motion/React
  - Close button to dismiss panel

- **Rule Types**:
  - **Cohort** (purple): Customer segments or groups
  - **Filter** (blue): Data filtering criteria
  - **Reference** (green): Reference data and lookups
  - **Custom** (gray): Custom rules

### 4. Onboarding Flow (`/pages/Onboarding.tsx`)

First-time user onboarding (Method 1 - At Login):

#### Features:
- **Form Fields**:
  - Full Name (required)
  - Team
  - Job Role
  - Geographies (multi-select with add/remove)
  - Data Identifiers (textarea for SQL-like identifiers)
  
- **User Experience**:
  - Clean, professional design matching AlchemData brand
  - Info card explaining benefits of providing information
  - Skip option for users who want to proceed without onboarding
  - Automatic redirect after completion
  
- **Auto-Redirect Logic**:
  - New users without `isOnboarded` flag are redirected to /onboarding
  - After completion, users proceed to main app (/chat)

### 5. Auth Store Updates (`/lib/authStore.ts`)

Enhanced user model with onboarding support:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOnboarded?: boolean;
  onboardingData?: {
    team?: string;
    jobRole?: string;
    geographies?: string[];
    dataIdentifiers?: string;
  };
}
```

**New Demo User:**
- "New User" (new.user@company.com) - For testing onboarding flow

### 6. Mock Data (`/lib/mockData.ts`)

#### Rule Interface:
```typescript
interface Rule {
  id: string;
  name: string;
  owner: string;
  type: 'cohort' | 'filter' | 'reference' | 'custom';
  description: string;
  definition: string; // SQL or criteria
  createdAt: string;
  lastUsed?: string;
  visibility: 'public' | 'private';
  sharedWith?: string[];
  metadata?: {
    team?: string;
    geography?: string;
    category?: string;
  };
}
```

**Sample Rules:**
1. West Coast Territory (filter) - Private
2. High-Value Customers (cohort) - Public
3. Q4 2024 Holiday Season (reference) - Public
4. Electronics Category (filter) - Public
5. My Team - East Region (reference) - Private

### 7. Integration Points

#### Step 3 Run Analysis (`/pages/wizard/Step3RunAnalysis.tsx`)
- Displays current sampling scale badge
- Shows Fast/Balanced/Comprehensive with appropriate icon
- Users can see what setting will be used during analysis

## Testing Guide

### Test Onboarding Flow:
1. Go to Login page
2. Select "New User" (4th card)
3. Should redirect to /onboarding
4. Fill out form or click "Skip for now"
5. Redirects to /chat after completion

### Test Settings - Sampling Scale:
1. Login as any user
2. Navigate to Settings
3. Go to "Context Builder" tab
4. Adjust the slider between Fast/Balanced/Comprehensive
5. Observe real-time updates to description and stats
6. Click "Save Settings"
7. Create new agent and check Step 3 - should show saved preference

### Test Settings - Data Connectors (Admin Only):
1. Login as "Jessica Williams" (Admin)
2. Navigate to Settings
3. Go to "Data Connectors" tab
4. See 2 connected sources (SQL Server, Snowflake)
5. Search for "Google" - should show Google Analytics
6. Click "Connect" on any available source
7. Fill out connection form and save
8. Should appear in connected sources
9. Click "Disconnect" to remove

### Test Rules - Listing:
1. Login as any user
2. Navigate to Rules
3. See grid of rules (5 default rules)
4. Try search: type "West" - should filter to West Coast Territory
5. Try filters: Click "cohort" - should show only High-Value Customers
6. Click "all" to reset

### Test Rules - Manual Creation (AI Chat):
1. On Rules page, click "New Rule"
2. Chat panel slides in from right
3. AI greets and asks what kind of rule you want
4. Type: "I want to track premium customers"
5. AI asks for details
6. Type: "Premium Customers\nCustomers with >$5000 spend\ncustomer_lifetime_value > 5000"
7. AI creates the rule
8. Check rules list - new rule should appear
9. Should be private by default

### Test Rules - Access Control:
1. Login as "Sarah Chen"
2. Navigate to Rules
3. Should see:
   - All public rules (High-Value Customers, Q4 Holiday, Electronics)
   - Her private rules (West Coast Territory)
   - Private rules shared with her (My Team - East Region)
4. Should NOT see private rules from other users

## File Structure

```
/pages/
  ├── Settings.tsx (Complete settings interface)
  ├── Onboarding.tsx (First-time user onboarding)
  ├── Rules.tsx (Rules dashboard with AI chat creation)
  └── wizard/
      └── Step3RunAnalysis.tsx (Updated with sampling indicator)

/lib/
  ├── settingsStore.ts (Settings persistence)
  ├── authStore.ts (Updated with onboarding)
  └── mockData.ts (Updated with Rule interface and data)

/App.tsx (Updated with onboarding route and redirect)
```

## Design Principles

### Colors:
- Primary: #00B5B3 (AlchemData Teal)
- Backgrounds: #F5F5F5, #F0FFFE, #E0F7F7
- Text: #333333 (headings), #666666 (body), #999999 (muted)
- Borders: #EEEEEE, #DDDDDD

### Typography:
- Follows existing 8pt grid system
- 13-14px for UI labels
- 13px for body text
- Consistent with Databricks-inspired design

### Spacing:
- Uses 8pt grid: 8px, 16px, 24px, 32px, 48px
- Cards: p-6 (24px padding)
- Gaps: gap-4 (16px), gap-6 (24px)

## Role-Based Access

### User Role:
- ✅ View rules (public + their private)
- ✅ Create rules
- ✅ Access general settings
- ✅ Access context builder settings
- ❌ Access data connectors

### Analyst Role:
- ✅ All user permissions
- ❌ Access data connectors

### Admin Role:
- ✅ All permissions
- ✅ Access data connectors
- ✅ Manage all connectors
- ✅ View all system settings

## Future Enhancements (Not Implemented)

1. **Rules - Method 2 (In-Chat Creation)**:
   - During agentic chat, detect when user wants to save a view
   - Show "Save as Rule" button after query results
   - Quick save flow with inline dialog

2. **Rules - Advanced Features**:
   - Rule editing
   - Rule sharing with specific users
   - Rule usage analytics
   - Rule templates

3. **Settings - Additional Features**:
   - Notification preferences
   - API key management
   - Team management
   - Audit logs

4. **Data Connectors - Advanced**:
   - Connection testing
   - Sync scheduling
   - Data preview
   - Schema refresh

## Notes

- All settings persist using Zustand with localStorage
- Onboarding data stored in auth store
- Rules use same sharing model as agents
- Data connectors only accessible to admins
- Sampling scale affects all new agent creation
- Chat-based rule creation uses simulated AI (can be connected to real LLM)
