# Relationships Step Implementation

## Overview
Added a new Step 5 "Configure Relationships" to the wizard flow, which comes right after the Validation step. This step presents table relationships in a listing format with approve/reject/modify actions.

## Key Features

### Centered Listing Panel
- **Default State**: Listing panel is centered on the screen, showing all detected relationships
- **Modified State**: When "Modify" is clicked, the panel shifts to the left (45% width) and chat opens on the right (55% width)

### Three Action Buttons per Relationship
1. **Approve** (Green) - Accept the relationship as-is
2. **Reject** (Red) - Mark the relationship as incorrect
3. **Modify** (Teal) - Open AI chat to discuss and modify the relationship

### Smooth Transitions
- Panel smoothly transitions between centered and left-aligned states
- Chat slides in from the right when modifying
- All animations use CSS transitions for polish

## Updated Wizard Flow

The wizard now has 7 steps instead of 6:

1. **Step 1**: Select Tables
2. **Step 2**: Persona Definition  
3. **Step 3**: Run Analysis
4. **Step 4**: Validation
5. **Step 5**: Configure Relationships ⭐ NEW
6. **Step 6**: Queries & Metrics (previously Step 5)
7. **Step 7**: Review & Publish (previously Step 6)

## Files Modified

### New Files Created
- `/pages/wizard/Step5ConfigureRelationships.tsx` - Main component for relationships step

### Files Updated
1. **App.tsx**
   - Added import for `Step5ConfigureRelationships`
   - Updated routes:
     - `step-5` → `Step5ConfigureRelationships`
     - `step-6` → `Step5SampleQueriesMetrics`
     - `step-7` → `Step6ReviewPublish`

2. **WizardLayout.tsx**
   - Updated `steps` array to include 7 steps with "Relationships" at position 5
   - Changed `totalSteps` default from 6 to 7

3. **Step4AnalysisValidation.tsx**
   - Navigation continues to `step-5` (now Relationships)

4. **Step5SampleQueriesMetrics.tsx**
   - Updated `currentStep` from 5 to 6
   - Updated `totalSteps` from 6 to 7
   - Updated `onBack` to navigate to `step-5`
   - Updated continue navigation to `step-7`

5. **Step6ReviewPublish.tsx**
   - Updated `currentStep` from 6 to 7
   - Updated `totalSteps` from 6 to 7
   - Updated `onBack` to navigate to `step-6`

## Component Design

### Layout Structure
```
Main Container (h-full flex flex-col)
├── Header (gradient background with summary)
├── Two-Panel Content Area (flex-1 flex gap-6)
│   ├── Left Panel - Listing (transitions between full-width and 45%)
│   │   └── Relationship Cards
│   │       ├── Relationship Header (tables, columns, confidence)
│   │       ├── Reason Box (why detected)
│   │       └── Action Buttons (Approve/Reject/Modify)
│   └── Right Panel - Chat (only shown when modifying, 55%)
│       └── WizardChat Component
└── Footer (progress and continue button)
```

### Data Structure
```typescript
interface Relationship {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  relationshipType: 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one';
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  reason?: string;
}
```

### State Management
- `relationships`: Array of all detected relationships
- `activeRelId`: Currently selected relationship for modification
- `showChat`: Boolean to control chat panel visibility
- Approved count tracked for progress display

### User Flow
1. User lands on page with all relationships showing as "pending"
2. For each relationship, user can:
   - **Approve**: Marks as approved, moves to next
   - **Reject**: Marks as rejected, moves to next
   - **Modify**: Opens chat panel to discuss changes with AI
3. In chat mode:
   - User describes desired changes
   - AI responds with suggestions
   - User confirms or skips
   - Relationship marked as "modified"
4. Once all relationships reviewed, user can continue to next step

## Styling Details

### Colors
- **Approved**: Green (#4CAF50) with light green background
- **Rejected**: Red (#F04438) with light red background
- **Modified**: Orange (#F79009) with light orange background
- **Pending**: Gray with neutral background

### Confidence Badges
- **90%+**: Green badge
- **80-89%**: Orange badge
- **<80%**: Gray badge

### Layout Transitions
- Smooth 300ms transition on panel width changes
- Panel uses `transition-all duration-300` for smooth animations

## Navigation Flow
```
Step 4 (Validation) 
    ↓ Continue
Step 5 (Relationships) ⭐ NEW
    ↓ Continue
Step 6 (Queries & Metrics)
    ↓ Continue
Step 7 (Review & Publish)
    ↓ Publish
Success Page
```

## Testing Checklist
- [ ] All 7 steps show correctly in sidebar
- [ ] Step 5 displays relationships correctly
- [ ] Approve button marks relationship as approved
- [ ] Reject button marks relationship as rejected
- [ ] Modify button opens chat panel and shifts listing left
- [ ] Chat panel allows modification discussion
- [ ] Closing chat returns to centered layout
- [ ] Progress counter updates correctly
- [ ] Continue button enables only when all reviewed
- [ ] Navigation to Step 6 works correctly
- [ ] Back button returns to Step 4

## Mock Data
The component includes 4 sample relationships:
1. orders.customer_id → customers.id (many-to-one, 98% confidence)
2. order_items.order_id → orders.id (many-to-one, 95% confidence)
3. order_items.product_id → products.id (many-to-one, 92% confidence)
4. customers.id → customer_segments.customer_id (one-to-many, 88% confidence)

## Future Enhancements
- [ ] Add visual relationship diagram
- [ ] Support creating new relationships manually
- [ ] Bulk approve/reject options
- [ ] Filter relationships by confidence level
- [ ] Export relationship configuration
- [ ] Relationship validation preview
