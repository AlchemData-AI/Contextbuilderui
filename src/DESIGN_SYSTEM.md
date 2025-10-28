# AlchemData AI Design System

## Overview
This design system follows enterprise-grade principles inspired by Databricks, ensuring a clean, scannable, and professional interface.

## ✍️ Typography

### Font Family
- **Primary:** Inter (with fallback to SF Pro and system fonts)
- **Monospace:** SF Mono, Menlo, Monaco, Consolas

### Font Sizes
- **UI Labels/Buttons:** 13px - 14px (`text-sm`, `text-base`)
- **Body Text/Code:** 13px (`text-sm`)
- **Headings:** 16px - 18px (`text-md`, `text-lg`)
- **Large Headings:** 20px - 24px (`text-xl`, `text-2xl`)

### Font Weights
- **Regular:** 400 (body text, labels, inputs)
- **Medium:** 500 (buttons, emphasized labels)
- **Semibold:** 600 (headings)

### Implementation
```css
/* In globals.css */
--text-xs: 11px;
--text-sm: 13px;    /* UI Labels, Body Text, Code */
--text-base: 14px;  /* Standard UI Labels */
--text-md: 16px;    /* Headings */
--text-lg: 18px;    /* Large Headings */
```

## 📏 Layout & Spacing: The 8pt Grid System

All spacing follows multiples of 8px to maintain visual consistency.

### Spacing Scale
```css
--spacing-1: 8px;    /* 1 unit */
--spacing-2: 16px;   /* 2 units - minimum between major sections */
--spacing-3: 24px;   /* 3 units - generous section spacing */
--spacing-4: 32px;   /* 4 units */
--spacing-5: 40px;   /* 5 units */
--spacing-6: 48px;   /* 6 units */
```

### Component Spacing Guidelines
- **Navigation Items:** 8-12px vertical and horizontal padding
- **Card/Panel Padding:** 24px (3 units) minimum
- **Between Sections:** 16-24px (2-3 units)
- **Input Fields:** 12px horizontal padding
- **Buttons:** 12-16px horizontal padding

### Tailwind Mappings
- `p-2` = 8px (1 unit)
- `p-3` = 12px (1.5 units) 
- `p-4` = 16px (2 units)
- `p-6` = 24px (3 units)
- `p-8` = 32px (4 units)

## 🎨 Color System

### Primary Brand
- **AlchemData Teal:** `#00B5B3` (primary actions, focus states)
- **Teal Hover:** `#009999`
- **Teal Light:** `#E0F7F7` (backgrounds, highlights)

### Text Colors
- **Primary:** `#333333` (main content)
- **Secondary:** `#4A4A4A` (supporting text)
- **Muted:** `#666666` (labels, metadata)
- **Placeholder:** `#999999`

### Background Colors
- **Primary:** `#FFFFFF` (cards, panels)
- **Subtle:** `#F8F9FA` (page backgrounds)
- **Hover:** `#F3F4F6`

### Borders
- **Default:** `#DDDDDD`
- **Light:** `#EEEEEE`
- **Databricks-style:** `#E5E7EB`

### Status Colors
- **Success:** `#4CAF50`
- **Warning:** `#FFC107`
- **Error:** `#F44336`
- **Info:** `#9E9E9E`

## 🧩 Components & Iconography

### Icons
- **Library:** Lucide React
- **Sizes:** 16x16px or 24x24px
- **Weight:** Consistent line weight (lightweight, line-art style)

### Buttons

#### Primary
```tsx
<Button className="bg-[#00B5B3] hover:bg-[#009999]">
  Primary Action
</Button>
```

#### Secondary
```tsx
<Button variant="outline" className="border-[#D1D5DB]">
  Secondary Action
</Button>
```

#### Icon-Only
```tsx
<Button variant="ghost" size="icon" className="hover:bg-[#F3F4F6]">
  <Icon className="w-4 h-4" />
</Button>
```

### Input Fields
- Simple border with `#DDDDDD`
- Focus state: `border-[#00B5B3]` with subtle ring
- Placeholder text: `#999999`
- Height: 36px (h-9)
- Padding: 12px horizontal

```tsx
<Input 
  className="border-[#D1D5DB] focus-visible:border-[#00B5B3]"
  placeholder="Enter value..."
/>
```

### Cards & Panels
```tsx
<div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6">
  {/* Content with 24px padding */}
</div>
```

## 📐 Layout Patterns

### Multi-Column Layouts
- **Sidebar:** 240px fixed width
- **Main Content:** Flexible
- **Context Panel:** 25% width (when present)

### Page Structure
```tsx
<div className="max-w-[1400px] mx-auto px-8 py-8">
  {/* Centered content with generous padding */}
</div>
```

### Tables
- **Compact rows:** `py-1.5` (6px vertical)
- **Header background:** `#F9FAFB`
- **Borders:** `#E5E7EB`
- **Hover:** `hover:bg-[#F9FAFB]`

## 🎯 Usage Examples

### Databricks-Style Cell
```tsx
<div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm">
  <div className="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
    {/* Header with light gray background */}
  </div>
  <div className="p-6">
    {/* Content with generous padding */}
  </div>
</div>
```

### Navigation Item
```tsx
<NavLink className="flex items-center gap-3 px-3 py-2 rounded transition-colors">
  <Icon className="w-4 h-4" />
  <span className="text-sm">Label</span>
</NavLink>
```

## ✅ Quick Checklist

- [ ] All spacing uses multiples of 8px
- [ ] Navigation items have 8-12px padding
- [ ] Major sections have 16-24px spacing between them
- [ ] Font sizes follow the defined scale (13-14px for UI, 16-18px for headings)
- [ ] Icons are 16x16 or 24x24
- [ ] Input fields show teal border on focus
- [ ] Buttons use proper variants (primary solid, secondary outline/ghost)
- [ ] Tables use compact row height
- [ ] Cards have subtle borders and shadows
- [ ] Color palette is consistent

## 🚫 Anti-Patterns to Avoid

- ❌ Using arbitrary padding values (e.g., `p-5`, `p-7`)
- ❌ Mixing font sizes outside the defined scale
- ❌ Heavy borders or excessive shadows
- ❌ Cramming elements without whitespace
- ❌ Using multiple icon sets
- ❌ Inconsistent button styles
- ❌ Missing focus states on inputs
