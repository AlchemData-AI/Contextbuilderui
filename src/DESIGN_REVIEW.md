# Design Architecture Review

## Current State Analysis

### ✅ What's Working Well

1. **Color Consistency**
   - Primary teal (#00B5B3) used consistently
   - Status colors (green, orange, red) well-defined
   - Neutral grays follow a clear hierarchy

2. **Typography**
   - Small text sizes (text-xs, text-sm) used appropriately
   - Font weights consistent (font-medium, font-semibold)
   - No overriding of default typography unless needed

3. **Scroll Areas**
   - No nested scrolls detected ✓
   - ScrollArea properly placed in sidebars and content areas
   - Main content scrolls, headers/footers fixed

### 🔧 Areas for Standardization

## 1. BORDER CONSISTENCY

### Current Issues:
- Mixed use of `border` vs `border-2`
- Inconsistent border colors (#EEEEEE vs #DDDDDD)

### Recommended Standard:
```tsx
// Primary containers (main sections, dialogs)
className="border-2 border-[#EEEEEE]"

// Secondary containers (cards, items within lists)
className="border border-[#EEEEEE]"

// Interactive borders (selected state)
className="border-2 border-[#00B5B3]"

// Inputs (all form inputs)
className="border-2 border-[#DDDDDD] focus:border-[#00B5B3]"
```

### Files to Update:
- Step4AnalysisValidation.tsx: Standardize sidebar card borders
- Step5SampleQueriesMetrics.tsx: Already using border (good)
- AgentDetails.tsx: Already using border (good)

---

## 2. CARD PADDING CONSISTENCY

### Current Issues:
- Mix of p-3, p-4, p-5, p-6

### Recommended Standard:
```tsx
// Large content cards (main sections)
className="p-5"

// List items, smaller cards
className="p-4"

// Compact items (sidebar items, chat messages)
className="p-3"

// Minimal items (tags, badges)
className="p-2"
```

---

## 3. SCROLL PLACEMENT

### ✅ Current Implementation (Correct):
```
Layout Structure:
┌─────────────────────────┐
│ Fixed Header            │
├─────────────────────────┤
│ ┌──────┬──────────────┐ │
│ │ Nav  │ ScrollArea   │ │
│ │(fix) │ (content)    │ │
│ │      │              │ │
│ └──────┴──────────────┘ │
└─────────────────────────┘
```

**All wizard steps correctly implement this pattern.**

---

## 4. COMPONENT UNIFORMITY

### Buttons

**Current State:** Mix of sizes
**Recommended:**
```tsx
// Primary actions
<Button className="bg-[#00B5B3] hover:bg-[#009996]">

// Secondary actions
<Button variant="outline" className="border-[#DDDDDD]">

// Destructive actions
<Button variant="outline" className="text-[#F04438] border-[#F04438]">

// Sizes
size="sm"  // For compact UIs (wizard steps)
size="default" // For primary pages
```

### Input Fields

**Standard:**
```tsx
<Input className="border-2 border-[#DDDDDD] focus:border-[#00B5B3] transition-colors" />
<Textarea className="border-2 border-[#DDDDDD] focus:border-[#00B5B3] transition-colors" />
```

### Cards in Grids

**Standard:**
```tsx
// 2-column grid (queries, metrics)
<div className="grid grid-cols-2 gap-4">
  <Card className="p-4 border border-[#EEEEEE] flex flex-col">

// 4-column grid (dashboard metrics)
<div className="grid grid-cols-4 gap-4">
  <Card className="p-4 border border-[#EEEEEE]">
```

---

## 5. SPACING CONSISTENCY

### Current Standard (Good):
- Gap between sections: `space-y-6`
- Gap between items: `space-y-4`
- Gap within items: `space-y-3`
- Gap for compact lists: `space-y-2`

### Grid Gaps:
- Main grids: `gap-4`
- Compact grids: `gap-3`
- Form fields: `gap-2`

---

## 6. STATUS INDICATORS

### Standard Badge Usage:
```tsx
// Active/Success
<Badge className="bg-[#00B98E] text-white">Active</Badge>

// Pending/Warning
<Badge className="bg-[#F79009] text-white">Pending</Badge>

// Draft/Neutral
<Badge variant="outline" className="border-[#DDDDDD]">Draft</Badge>

// Error
<Badge className="bg-[#F04438] text-white">Error</Badge>
```

---

## 7. SECTION HEADERS

### Standard Pattern:
```tsx
// In sidebars/lists (Step 4 validation)
<div className="flex items-center gap-1.5 px-2 py-1.5 mb-1.5 bg-[#E0F7F7] rounded border-l-2 border-[#00B5B3]">
  <Icon className="w-3.5 h-3.5 text-[#00B5B3]" />
  <span className="text-[10px] font-semibold text-[#00B5B3] uppercase tracking-wide">
    Section Name
  </span>
</div>

// In main content areas
<div className="flex items-center gap-3 mb-4">
  <Icon className="w-5 h-5 text-[#00B5B3]" />
  <h3 className="text-sm font-semibold text-[#333333]">
    Section Name
  </h3>
</div>
```

---

## Implementation Priority

### High Priority (Immediate):
1. ✅ Standardize border widths across wizard steps
2. ✅ Ensure all inputs use border-2
3. ✅ Card padding consistency

### Medium Priority (Next Sprint):
1. Button size consistency
2. Badge color standardization
3. Section header patterns

### Low Priority (Nice to Have):
1. Animation consistency
2. Hover state standardization
3. Focus ring styles

---

## Specific File Updates Needed

### Step4AnalysisValidation.tsx
- ✅ Section headers now use highlighted style
- Consider: Reduce border-2 to border on right panel

### Step5SampleQueriesMetrics.tsx
- ✅ Already using correct border styles
- ✅ Cards are uniform

### AgentDetails.tsx
- ✅ Using correct patterns
- Consider: Add transition effects on hover

### All Wizard Steps
- Review button sizes (some use default, some use sm)
- Standardize "Save Draft" button placement and style

---

## Design Tokens Reference

```css
/* Colors */
--primary: #00B5B3
--primary-hover: #009996
--primary-light: #E0F7F7
--primary-bg: #F0FFFE

--success: #00B98E
--warning: #F79009
--error: #F04438

--gray-50: #FAFBFC
--gray-100: #F8F9FA
--gray-200: #EEEEEE
--gray-300: #DDDDDD
--gray-600: #666666
--gray-700: #333333
--gray-800: #999999

/* Borders */
--border-primary: 2px solid #EEEEEE
--border-secondary: 1px solid #EEEEEE
--border-input: 2px solid #DDDDDD
--border-active: 2px solid #00B5B3

/* Spacing */
--space-section: 1.5rem (space-y-6)
--space-items: 1rem (space-y-4)
--space-compact: 0.75rem (space-y-3)
--space-tight: 0.5rem (space-y-2)

/* Border Radius */
--radius-card: 0.5rem (rounded-lg)
--radius-button: 0.375rem (rounded-md)
--radius-input: 0.375rem (rounded-md)
```

---

## Testing Checklist

- [ ] All wizard steps use consistent borders
- [ ] No nested scroll areas
- [ ] All cards in grids have same padding
- [ ] All inputs have border-2
- [ ] Section headers are visually distinct
- [ ] Buttons have consistent sizing per context
- [ ] Status badges use correct colors
- [ ] Spacing between sections is consistent
- [ ] ScrollArea is at correct level (not nested)
- [ ] Focus states are visible and consistent
