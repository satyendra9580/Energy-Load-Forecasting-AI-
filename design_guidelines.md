# Energy Load Forecasting Dashboard - Design Guidelines

## Design Approach: Material Design for Data Applications

**Rationale**: This is a data-intensive productivity tool requiring clear information hierarchy, robust data visualization, and efficient workflows. Material Design provides excellent patterns for data-heavy interfaces while maintaining visual clarity.

**Key Principles**:
- Data first: Information clarity over decoration
- Structured layouts with clear zones for different functions
- Consistent interaction patterns for scientific workflows
- Professional, trustworthy aesthetic for technical users

---

## Typography System

**Font Family**: 
- Primary: 'Inter' or 'Roboto' via Google Fonts CDN
- Monospace: 'Roboto Mono' for numerical data, metrics, timestamps

**Type Scale**:
- Page Title: text-3xl font-bold (Dashboard headers)
- Section Headers: text-xl font-semibold (Model Selection, Metrics)
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Metrics/Data: text-sm font-medium (tables, numbers)
- Labels: text-sm font-medium
- Captions: text-xs (timestamps, metadata)

---

## Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, and 8
- Component padding: p-6
- Card spacing: p-4 or p-6
- Section margins: mt-8, mb-8
- Grid gaps: gap-6
- Tight spacing: space-y-2 (form elements)
- Comfortable spacing: space-y-4 (card content)

**Container Strategy**:
- Dashboard shell: max-w-7xl mx-auto px-4
- Full-width charts: w-full within container
- Form sections: max-w-2xl for optimal readability

**Grid Layouts**:
- Metrics cards: grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6
- Model comparison: grid-cols-1 lg:grid-cols-2 gap-6
- Upload + Preview: Single column, sequential flow

---

## Component Library

### Navigation & Shell
**Top Navigation Bar**:
- Fixed header with project branding
- Primary navigation: Dashboard, Models, Data Upload, Documentation
- Right-aligned utilities: Download CSV, Settings icon
- Height: h-16, with shadow-sm for subtle elevation

**Sidebar Navigation** (Optional for multi-page):
- w-64 fixed sidebar for larger screens
- Collapsible on tablet/mobile
- Navigation items with icon + label (Heroicons)

### Data Upload Interface
**Upload Zone**:
- Dashed border card with centered upload area
- Large upload icon (Heroicons: arrow-up-tray)
- Drag-and-drop target styling
- File type indicator: "CSV files only"
- Upload button: text-base font-medium

**Data Preview Table**:
- Full-width responsive table
- Sticky header row
- Zebra striping for row readability
- Max height with overflow-y-auto
- Monospace font for data cells

### Model Selection & Configuration
**Model Selector Cards**:
- Grid of selectable cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Each card: p-6, border, hover:shadow-md transition
- Model icon at top (Heroicons: cpu-chip, chart-bar)
- Model name: text-lg font-semibold
- Description: text-sm text-gray-600
- "Select" button at bottom
- Active state: border-2 with distinct styling

**Horizon Selector**:
- Segmented button group
- "1 Day" | "7 Days" toggle
- Active segment with solid background
- Equal width buttons: grid-cols-2

**Action Buttons**:
- Primary actions: "Train Model", "Generate Forecast"
- Secondary: "Reset", "Configure"
- Full width on mobile, inline on desktop
- Icon + text labels

### Data Visualization
**Chart Containers**:
- White background cards with shadow-sm
- Card header: title + metadata (last updated time)
- Chart area: aspect-video or aspect-[16/9]
- Padding: p-6
- Use Recharts for React integration

**Chart Types Required**:
1. Time Series Line Chart (Actual vs Forecast)
   - Dual line overlay
   - X-axis: timestamps, Y-axis: load values
   - Legend at top-right
   - Tooltip on hover showing exact values

2. Residual Plot
   - Scatter or bar chart of prediction errors
   - Zero line reference

3. Metrics Heatmap
   - Hourly error visualization
   - Grid layout with intensity indicators

### Metrics Display
**Metrics Cards**:
- Grid of stat cards (3-4 columns on desktop)
- Each card structure:
  - Metric label: text-sm font-medium uppercase
  - Large value: text-3xl font-bold
  - Unit/context: text-sm
  - Optional trend indicator

**Metrics Table**:
- Comparison table for multiple models
- Columns: Model Name, MAE, RMSE, MAPE, Training Time
- Sortable headers
- Best-performing row highlighted

### Forms & Inputs
**Form Layout**:
- Vertical stack with space-y-4
- Label above input: text-sm font-medium mb-2
- Input fields: h-10, px-4, border rounded
- Helper text: text-xs mt-1

**Select Dropdowns**:
- Custom styled select with Heroicons chevron-down
- Options list with hover states

**Date/Time Pickers**:
- For forecast range selection
- Native HTML5 or library integration

### Status & Feedback
**Loading States**:
- Skeleton loaders for charts
- Spinner for actions: "Training model..."
- Progress bar for long operations

**Alert Banners**:
- Success: Model trained successfully
- Error: Invalid data format
- Info: Processing may take several minutes
- Position: top of relevant section, dismissible

### Tables
**Data Tables**:
- Full-width, responsive
- Sticky header: font-medium
- Cell padding: px-4 py-3
- Borders: border-b between rows
- Hover row highlight
- Pagination at bottom for large datasets

---

## Page Layouts

### Dashboard Home
**Structure**:
1. Page header with title + action buttons
2. Metrics summary grid (4 cards)
3. Main forecast chart (large, prominent)
4. Secondary charts in 2-column grid
5. Recent activity/logs section

### Model Training Page
**Structure**:
1. Model selection grid
2. Configuration panel (parameters, horizon)
3. Training action button (prominent)
4. Training progress/status
5. Results section (metrics + charts) appears after training

### Data Upload Page
**Structure**:
1. Upload zone (centered, prominent)
2. File validation status
3. Data preview table (full-width)
4. Column mapping interface
5. "Process Data" action button

---

## Responsive Behavior

**Breakpoints**:
- Mobile: Single column, stacked components
- Tablet (md:): 2-column grids where appropriate
- Desktop (lg:): Full multi-column layouts, sidebar navigation

**Chart Responsiveness**:
- Full-width on mobile
- Maintain aspect ratio
- Adjust legend position (bottom on mobile, right on desktop)
- Reduce font sizes appropriately

---

## Icons
**Library**: Heroicons (via CDN)

**Icon Usage**:
- Model cards: cpu-chip, chart-bar, beaker, bolt
- Actions: arrow-up-tray (upload), arrow-down-tray (download), play (train), chart-bar-square (predict)
- Navigation: home, cog-6-tooth, document-text
- Status: check-circle, exclamation-triangle, information-circle
- Size: h-5 w-5 for inline, h-8 w-8 for feature icons

---

## Accessibility
- All interactive elements: focus:ring-2 focus:ring-offset-2
- ARIA labels for icon-only buttons
- Semantic HTML: proper heading hierarchy
- Form labels associated with inputs
- Sufficient contrast ratios throughout
- Keyboard navigation support for all interactions

---

## Professional Polish
- Consistent card elevation: shadow-sm for base, shadow-md on hover
- Subtle transitions: transition-all duration-200 for interactive elements
- Rounded corners: rounded-lg for cards, rounded-md for buttons
- Proper visual hierarchy with spacing and typography scale
- Clean, uncluttered layouts that prioritize data visibility