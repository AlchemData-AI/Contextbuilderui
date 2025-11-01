# Wizard Footer and Width Fix

## Architecture Review

### The Problem

Two issues with the wizard layout:

1. **Footer Overlap**: Fixed footer at viewport bottom overlaps with absolutely positioned chat content
2. **Chat Width**: Content area too wide on large screens, affecting readability

### Current Structure

```
WizardLayout (h-screen)
├── Sidebar (280px)
└── Main Content
    ├── Header (px-8 py-4)
    └── Content Area (flex-1, p-8)
        └── Step2PersonaDefinition (h-full flex flex-col)
            ├── TwoPanelWizardLayout (flex-1)
            │   ├── Left Panel (320px) - Items list
            │   └── Right Panel (flex-1) - Content
            │       └── WizardChat (absolute inset-0)
            └── Fixed Footer (fixed bottom-0 left-[280px])
```

### The Solution

**For Footer Overlap:**
- Container: `absolute inset-0` (fill parent)
- Scrollable area: Add `pb-24` (96px bottom padding)
- Footer stays at `fixed bottom-0`
- Padding ensures content scrolls above footer

**For Width:**
- Add max-width constraint to TwoPanelWizardLayout right panel
- Keep messages at max-w-3xl for readability
- Center everything properly

## Implementation

### 1. WizardChat.tsx
```tsx
// Container fills space, scrollable area has bottom padding
<div className="absolute inset-0 flex flex-col bg-white">
  <div className="flex-1 overflow-y-auto pb-24">
    {/* Messages with max-w-3xl */}
  </div>
  <div className="flex-shrink-0">
    {/* Sticky input */}
  </div>
</div>
```

### 2. UnifiedWizardChat.tsx
Same pattern as WizardChat.

### 3. Step2PersonaDefinition.tsx Form
```tsx
<div className="absolute inset-0 flex flex-col">
  <div className="flex-1 overflow-y-auto pb-24">
    {/* Form content */}
  </div>
  <div className="flex-shrink-0">
    {/* Footer buttons */}
  </div>
</div>
```

### 4. TwoPanelWizardLayout.tsx (Optional Width Fix)
Add max-width to right panel if needed:
```tsx
<div className="flex-1 min-w-0 max-w-5xl bg-white rounded-lg...">
```

## Why This Works

1. **Flexbox container** with `flex flex-col` creates vertical layout
2. **Scrollable area** with `flex-1 overflow-y-auto pb-24`:
   - Takes all available space
   - Scrolls when content overflows
   - Bottom padding creates clearance for fixed footer
3. **Sticky elements** with `flex-shrink-0`:
   - Don't scroll away
   - Stay at bottom of container
4. **Fixed footer** overlays but doesn't hide content due to padding

## Testing Checklist

- [ ] Chat content doesn't overlap with footer
- [ ] Scrolling works smoothly
- [ ] Input area is accessible
- [ ] No excessive white space
- [ ] Works on all wizard steps
- [ ] Responsive on different screen sizes
