# Comprehensive Scroll Fix Plan

## Problem
Scroll issues appearing inconsistently across different pages due to incorrect height/overflow patterns.

## Root Cause Analysis

### Correct Pattern for Full-Height Layouts:
```tsx
<div className="h-screen flex flex-col">          {/* Container: Fixed viewport height */}
  <header className="flex-shrink-0">              {/* Header: Fixed height, doesn't scroll */}
    ...
  </header>
  <main className="flex-1 overflow-y-auto">      {/* Content: Fills remaining space, scrolls */}
    ...
  </main>
</div>
```

### Anti-Patterns (Causes Scroll Issues):
❌ Using `min-h-screen` - allows infinite expansion, no scroll constraint
❌ Missing `overflow-y-auto` on flex-1 content area
❌ Missing `flex-shrink-0` on fixed headers
❌ Using `h-full` without parent height constraint

## Pages That Need Fixes

### ✅ Already Fixed:
1. **ChatDashboard** (Analyst/Admin view) - Lines 243-274

###  Need Fixing:

2. **ChatDashboard** (User view) - Lines 172-237
   - Uses `h-full` but needs proper scroll container
   
3. **AgenticChat** - Line 1229
   - Uses `h-full` on root
   - Centered mode needs scroll for demo buttons
   - Normal chat mode needs proper scroll

4. **AgentsDashboard** - Need to check
5. **AgentDetails** - Already fixed tabs, but need to verify root
6. **DataSources** - Need to check
7. **DataCatalog** - Need to check  
8. **Settings** - Need to check
9. **Documentation** - Need to check

## Fix Strategy

1. **Identify root container** - should be `h-screen flex flex-col`
2. **Fixed headers/footers** - add `flex-shrink-0`
3. **Scrollable content** - add `flex-1 overflow-y-auto`
4. **Nested scroll areas** - each independent section needs own scroll

## Implementation Order

1. Fix ChatDashboard user view (most critical)
2. Fix AgenticChat centered mode + demo buttons visibility
3. Fix remaining dashboard pages systematically
4. Verify all pages work correctly
