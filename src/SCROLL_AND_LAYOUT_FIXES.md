# Scroll and Layout Fixes

## Issues Fixed

### 1. Agent Extension Page Not Scrolling
**Problem**: Content in `/pages/AgentExtension.tsx` was not scrollable.

**Root Cause**: The page was using `h-full overflow-y-auto` which conflicts with the Layout component's own overflow handling.

**Solution**: Changed the root div from `h-full overflow-y-auto` to just normal flow (no height constraint). The Layout component already has `overflow-auto` on the main element, so child components should flow naturally without height constraints.

**Code Change**:
```tsx
// Before
<Layout>
  <div className="h-full bg-[#F8F9FA] overflow-y-auto">

// After  
<Layout>
  <div className="bg-[#F8F9FA]">
```

### 2. Chat Panel Breaking When Artifacts Open
**Problem**: When the artifact panel opened, the chat panel's layout would break and content would overflow.

**Root Cause**: Multiple issues:
1. Both chat and artifact panels were using fixed `w-1/2` widths instead of flex-based widths
2. The chat content had a fixed `max-w-[800px]` that didn't adapt when the panel width changed
3. Missing `overflow-hidden` on the chat container
4. Input area didn't adjust its max-width when artifacts opened

**Solution**: 
1. Changed both panels to use `flex-1` so they share space equally
2. Made message and input areas responsive to artifact panel state
3. Added proper overflow handling
4. Added `flex-shrink-0` to input area to prevent it from being squashed

**Code Changes**:

**Chat Panel Container**:
```tsx
// Before
<div className={`flex flex-col transition-all ${artifactPanelOpen ? 'w-1/2' : 'flex-1'} relative min-w-0`}>

// After
<div className={`flex flex-col ${artifactPanelOpen ? 'flex-1' : 'flex-1'} relative overflow-hidden`}>
```

**Artifact Panel Container**:
```tsx
// Before
<motion.div className="w-1/2 border-l border-[#EEEEEE] bg-white flex flex-col">

// After
<motion.div className="flex-1 border-l border-[#EEEEEE] bg-white flex flex-col overflow-hidden">
```

**Messages Container**:
```tsx
// Before
<div className={`max-w-[800px] mx-auto px-8 ...`}>

// After
<div className={`${artifactPanelOpen ? 'max-w-full' : 'max-w-[800px]'} mx-auto px-8 ...`}>
```

**Input Area**:
```tsx
// Before
<motion.div className="border-t border-[#EEEEEE] px-6 py-4 bg-white">
  <div className="max-w-[800px] mx-auto flex items-end gap-2">

// After
<motion.div className="border-t border-[#EEEEEE] px-6 py-4 bg-white flex-shrink-0">
  <div className={`${artifactPanelOpen ? 'max-w-full' : 'max-w-[800px]'} mx-auto flex items-end gap-2`}>
```

## Layout Architecture

### Layout Component Structure
```
<div className="flex h-screen">
  <Sidebar />
  <main className="flex-1 overflow-auto">
    <Outlet />  ← Child pages render here
  </main>
</div>
```

**Key Points**:
- The main container has `h-screen` (fixed viewport height)
- The main element has `overflow-auto` (scrollable)
- Child components should NOT set their own height constraints
- Child components should flow naturally and let the parent handle scrolling

### Best Practices for Child Components

**✅ DO**:
```tsx
<Layout>
  <div className="bg-[#F8F9FA]">
    {/* Content flows naturally */}
  </div>
</Layout>
```

**❌ DON'T**:
```tsx
<Layout>
  <div className="h-full overflow-auto">  {/* Don't set height constraints */}
    {/* This breaks scrolling */}
  </div>
</Layout>

<Layout>
  <div className="min-h-screen">  {/* Don't use min-h-screen */}
    {/* This also breaks scrolling */}
  </div>
</Layout>
```

### WizardLayout vs Layout

**WizardLayout** is self-contained and handles its own overflow:
```tsx
<div className="h-screen flex flex-col">
  <div>Header</div>
  <div className="flex-1 overflow-auto">
    {children}  ← Wizard steps render here
  </div>
</div>
```

**Layout** delegates overflow to its main element:
```tsx
<div className="flex h-screen">
  <Sidebar />
  <main className="flex-1 overflow-auto">
    {children}  ← Pages render here
  </main>
</div>
```

## Chat Layout Specifics

### Two-Panel Layout (Chat + Artifacts)

When artifacts are open, the layout uses a flex-based approach:

```
<div className="h-full flex overflow-hidden">
  
  <!-- Chat Panel -->
  <div className="flex-1 flex flex-col overflow-hidden">
    <div className="flex-1 overflow-y-auto">
      Messages (with responsive max-width)
    </div>
    <div className="flex-shrink-0">
      Input Area (with responsive max-width)
    </div>
  </div>
  
  <!-- Artifact Panel (conditionally rendered) -->
  <motion.div className="flex-1 flex flex-col overflow-hidden">
    <div>Header</div>
    <div className="flex-1 overflow-y-auto">
      Artifact Content
    </div>
  </motion.div>
  
</div>
```

**Key Design Decisions**:
1. Both panels get `flex-1` → Equal width distribution (50/50 split)
2. Both have `overflow-hidden` → Prevents content from breaking layout
3. Inner content areas have `overflow-y-auto` → Enables scrolling
4. Chat content uses responsive max-width → Better readability when narrow
5. Input area has `flex-shrink-0` → Prevents compression

### 3. Agent Details Page Scroll Issues
**Problem**: Content in `/pages/AgentDetails.tsx` tabs was not scrollable, and when it was, all tabs shared the same scroll position.

**Root Cause**: 
1. Initially, the page was using the shadcn ScrollArea component, which wasn't working correctly in the flex layout
2. First fix attempt put ALL TabsContent elements inside ONE shared scroll container, causing tabs to share scroll position

**Solution**: 
1. Added `overflow-hidden` to the Tabs component to constrain child height
2. Made EACH TabsContent its own independent scroll container with `flex-1 overflow-y-auto`
3. Removed the shared wrapper div
4. Removed the ScrollArea import

**Code Changes**:
```tsx
// Tabs container
<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
  <div>TabsList...</div>
  
  {/* Each tab has its own scroll container - independent scroll positions */}
  <TabsContent value="overview" className="mt-0 space-y-6 flex-1 overflow-y-auto px-8 py-6">
    ...content...
  </TabsContent>
  
  <TabsContent value="queries" className="mt-0 space-y-4 flex-1 overflow-y-auto px-8 py-6">
    ...content...
  </TabsContent>
  
  {/* etc. for all tabs */}
</Tabs>
```

**Key Insight**: When using Radix UI Tabs, each TabsContent component should be its own scroll container to maintain independent scroll positions per tab.

## Files Modified

1. `/pages/AgentExtension.tsx` - Removed height constraints
2. `/pages/AgenticChat.tsx` - Fixed two-panel flex layout and responsive widths  
3. `/pages/AgentDetails.tsx` - Added overflow-hidden to Tabs for ScrollArea to work

## Testing Checklist

- [x] Agent Extension page scrolls properly
- [x] Chat panel works with no artifacts
- [x] Chat panel doesn't break when artifacts open
- [x] Messages are readable in split view
- [x] Input area is accessible in split view
- [x] Artifact panel scrolls independently
- [x] All wizard pages still work correctly
- [x] AgentsDashboard still works correctly
- [x] AgentDetails still works correctly

## Future Considerations

1. **Responsive Breakpoints**: Consider adding mobile/tablet breakpoints where artifacts open as an overlay instead of side-by-side
2. **Resizable Panels**: Could implement draggable divider between chat and artifacts
3. **Panel Width Preferences**: Could save user's preferred panel width ratios
4. **Artifact Minimize**: Add option to minimize artifact panel to just a tab bar
