# Application Structure & Layout Guide

## Core Philosophy: Dashboard-First Web App

This application is a portal for submitting and tracking 2-12 week deliverables (microproducts). It should be treated as a **Dashboard-First Web App**, not a traditional website.

**Key Distinction:**
- **Website**: For browsing and consuming content
- **App**: For doing and taking action
- **Dashboard**: For monitoring, managing, and executing tasks

Since the content is action-oriented (submitting, reviewing, joining projects), the interface should feel like a cohesive workspace rather than a collection of separate pages.

---

## The Single-Page App (SPA) Experience

### The Concept
Even though Next.js uses multiple routes (`/`, `/submit`, `/browse`), the user experience should feel like a single cohesive workspace where tools are switched, not pages.

### Implementation Strategy
- **Persistent Navigation**: Use a sidebar or header that stays in place across all views
- **Content Swapping**: Only the center column content changes between routes
- **Cognitive Continuity**: Users should feel like they're switching tools in a toolbox, not leaving and entering different websites

### Why This Matters
Reduces cognitive load and creates a professional app-like experience. Users stay oriented and focused on their tasks rather than relearning navigation patterns on each page.

---

## The Three Core Views

### 1. The Hub (Landing Page - `/`)

**Purpose**: High-level overview, stats, and quick actions

**Layout Strategy**: Bento Grid

**Content Hierarchy**:
1. **Live Stats Tiles** (Primary Focus)
   - Total microproducts submitted
   - Pending submissions
   - Active projects
   - Recent completions
   - Each stat in its own raised neumorphic tile

2. **Quick Actions**
   - Prominent "Submit New Microproduct" button
   - "Browse Projects" shortcut
   - Centered and easily accessible

3. **Recent Activity Feed**
   - Small, inset well showing latest submissions
   - Recent status changes
   - New collaborators joining projects
   - Positioned to provide context without overwhelming

4. **Help/Info Tile** (Secondary)
   - "What is a Microproduct?" information
   - Tucked into a smaller tile
   - Available but not dominating the view

**Design Principles**:
- Task-based grouping: Stats and actions first, information second
- Bento grid creates visual interest and hierarchy
- Each tile is a distinct, raised neumorphic element
- Maximum width: 1200px to prevent the "2400px void" issue

---

### 2. The Workspace (Submit Page - `/submit`)

**Purpose**: Focused production environment for creating submissions

**Layout Strategy**: Single Focused Column

**Content Hierarchy**:
1. **Centered Form Container**
   - Maximum width: 800px
   - Wrapped in a neu-raised container
   - Eliminates distractions
   - Creates a "workspace within a workspace" feel

2. **Form Elements**
   - All inputs use neu-inset style (pressed/well effect)
   - Creates the feeling of "filling holes" in the surface
   - Clear visual feedback for active fields

3. **Submit Action**
   - Primary button with prominent neumorphic styling
   - Clear call-to-action
   - Satisfying tactile feedback on press

**Design Principles**:
- Minimize distractions: Single column, centered focus
- White space on sides creates floating surface effect
- Inset inputs make interaction feel physical and intentional
- Clean, professional production environment

---

### 3. The Gallery (Browse Page - `/browse`)

**Purpose**: Discovery, exploration, and networking

**Layout Strategy**: Responsive Grid Gallery

**Content Hierarchy**:
1. **Search/Filter Bar**
   - Inset neumorphic style (well effect)
   - Sticky at top for easy access
   - Feels like a physical control panel

2. **Project Grid**
   - CSS Grid: `repeat(auto-fill, minmax(350px, 1fr))`
   - Each project card is a raised neumorphic tile
   - Hover states lift cards toward viewer
   - Quick scan of titles, statuses, and key info

3. **Project Cards**
   - Consistent size and spacing
   - Clear visual hierarchy within each card
   - Status indicators using color accents
   - Join/View actions prominently displayed

**Design Principles**:
- Scannable layout: Grid allows quick visual parsing
- Responsive: Adapts to screen size while maintaining card integrity
- Interactive: Each card responds to hover with depth changes
- Discovery-focused: Easy to browse and find interesting projects

---

## Layout Constraints & Consistency

### The Centered Column Strategy

**The Problem**: 
Without constraints, content can stretch to 2400px+ on ultrawide monitors, creating awkward empty space and poor readability.

**The Solution**:
Lock all page containers to a maximum width of 1200px, centered on the viewport.

**Implementation**:
- All main content containers: `max-width: 1200px`
- Horizontal centering: `margin: 0 auto`
- Creates elegant white space on sides
- Makes the central "app surface" appear to float

**Benefits**:
- Consistent reading width across all views
- Professional, intentional design
- Better visual hierarchy
- Neumorphic elements have clear boundaries

---

## Neumorphic Dashboard Principles

### 1. Task-Based Grouping
Don't just list information. Organize content by what users need to do:
- **Primary**: Actions and live data (stats, quick submit)
- **Secondary**: Context and recent activity
- **Tertiary**: Help and informational content

### 2. Consistent Container Width
The 1200px max-width creates:
- White space that makes the central surface "float"
- Consistent interaction zones
- Professional, app-like boundaries
- Better neumorphic shadow visibility

### 3. Actionable States
Use neumorphic inset styling for interactive elements:
- Form inputs appear as "holes" waiting to be filled
- Search bars feel like physical controls
- Creates tactile, intentional interaction patterns
- Makes the dashboard feel responsive and alive

### 4. Visual Hierarchy Through Depth
Use neumorphic depth to communicate importance:
- **Raised (default)**: Standard interactive elements
- **Lifted (hover)**: Elements ready for interaction
- **Inset (active/input)**: Elements receiving input or in active state
- **Glowing (focused)**: Primary actions or selected items

---

## Navigation Strategy

### Persistent Navigation Elements

**Header or Sidebar**:
- Always visible across all views
- Clear indication of current view
- Quick access to all three main views
- User profile/settings access

**View Switching**:
- Should feel instant and seamless
- No full page reloads (SPA behavior)
- Smooth transitions between views
- Maintains user context and orientation

**Visual Feedback**:
- Active view indicated with neumorphic inset or glow
- Hover states on navigation items
- Clear, consistent interaction patterns

---

## Content Organization Best Practices

### The Hub (Landing)
- **Don't**: Create a wall of text explaining what microproducts are
- **Do**: Show live stats and recent activity prominently, tuck help into a smaller tile

### The Workspace (Submit)
- **Don't**: Clutter with navigation, stats, or unrelated content
- **Do**: Create a focused, distraction-free production environment

### The Gallery (Browse)
- **Don't**: Use a long vertical list that requires endless scrolling
- **Do**: Use a responsive grid that allows quick visual scanning

---

## Responsive Behavior

### Desktop (1200px+)
- Full Bento Grid on landing
- Centered 800px form on submit
- Multi-column grid on browse (3-4 columns)

### Tablet (768px - 1199px)
- Adjusted Bento Grid (2 columns)
- Centered form maintains width
- 2-column grid on browse

### Mobile (< 768px)
- Single column Bento Grid
- Full-width form with padding
- Single column grid on browse

**Key Principle**: The neumorphic style should adapt gracefully. Shadows may need to be slightly reduced on mobile to prevent visual clutter.

---

## Implementation Checklist

### Global Structure
- [ ] Enforce `max-width: 1200px` on all page containers
- [ ] Center all containers with `margin: 0 auto`
- [ ] Implement persistent navigation (header or sidebar)
- [ ] Ensure smooth view transitions

### Landing Page (/)
- [ ] Convert to Bento Grid layout
- [ ] Prioritize stats tiles over informational content
- [ ] Add quick action buttons (Submit, Browse)
- [ ] Include recent activity feed in inset well
- [ ] Move "What is a Microproduct" to smaller help tile

### Submit Page (/submit)
- [ ] Create centered 800px form container
- [ ] Wrap form in neu-raised container
- [ ] Apply neu-inset style to all inputs
- [ ] Ensure distraction-free environment
- [ ] Prominent submit button with tactile feedback

### Browse Page (/browse)
- [ ] Implement responsive grid: `repeat(auto-fill, minmax(350px, 1fr))`
- [ ] Create inset search/filter bar
- [ ] Design consistent project cards
- [ ] Add hover states that lift cards
- [ ] Include clear status indicators

### Neumorphic Interactions
- [ ] Remove all `transform: translateY()` movements
- [ ] Implement shadow-only hover states (expanded, softer shadows)
- [ ] Implement inset pressed states (inverted shadows)
- [ ] Add smooth transitions (200-300ms)
- [ ] Ensure consistent light source (top-left)

---

## The User Journey

### First Visit
1. Land on Hub → See stats and recent activity
2. Understand the app's purpose through visual hierarchy
3. Click "Submit New Microproduct" or "Browse Projects"

### Submitting a Microproduct
1. Navigate to Submit (via Hub or navigation)
2. Enter focused workspace environment
3. Fill inset form fields (tactile, intentional)
4. Press submit button (satisfying inset feedback)
5. Return to Hub to see updated stats

### Browsing Projects
1. Navigate to Browse
2. Use inset search bar to filter
3. Scan grid of project cards
4. Hover over interesting projects (cards lift)
5. Click to view details or join

### Ongoing Use
- Hub becomes the "home base"
- Quick navigation between views feels seamless
- Stats provide ongoing motivation and context
- Recent activity keeps users engaged

---

## Summary: Dashboard vs Website

**This is NOT a website because**:
- It's not about consuming content
- It's not about browsing pages
- It's not about reading articles

**This IS a dashboard app because**:
- It's about taking action (submit, browse, join)
- It's about monitoring progress (stats, activity)
- It's about managing projects (status, collaboration)
- It's about focused workflows (workspace environments)

The interface should feel like a professional tool that users "work in" rather than a website they "visit." Every design decision should reinforce this app-like, dashboard-first experience.
