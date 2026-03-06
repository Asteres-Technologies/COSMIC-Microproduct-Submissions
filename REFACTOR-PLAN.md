# UI Refactor Implementation Plan

## Project Scope: Style-Only Refactor

### Critical Rule: Backend Preservation

**NO CHANGES TO:**
- API routes (`/api/storage/*`)
- Data fetching logic
- Form submission handlers
- State management
- Business logic
- Zod validation schemas
- GitHub integration
- Data flow patterns
- Component props/data structure

**CHANGES ONLY TO:**
- HTML structure and JSX markup
- CSS styling (all files)
- Visual layout and positioning
- Typography and spacing
- Colors and effects
- Animations and transitions
- Component organization (visual only)

**Connection Requirement:**
All data connections, event handlers, state updates, and API calls must remain exactly as they are. We're changing how things look, not how they work.

---

## Phase 1: Current Focus

### Pages in Scope
1. **Landing Page** (`app/page.tsx` + `app/page.css`)
2. **Browse Microproducts Page** (`app/browse/page.tsx` + `app/browse/browse.css`)

### Pages Deferred
- Submit page (Phase 2)
- Any additional pages (Phase 3+)

---

## New UI Overview

### Landing Page (Hero Page)
**Current State**: Traditional layout with stats sidebar, text content, and CTAs
**New Design**: Glassmorphic hero page with:
- Fixed satellite background (rotated -30deg)
- Glass overlay with blur and noise texture
- Classification marking at top center
- Vertical progress indicator on left rail
- Large decorative hero number ("01") at 14% opacity
- Right-aligned main content block
- Bottom navigation links
- Content transition animation system (evaporation/condensation)

### Browse Microproducts Page
**Current State**: Card grid with detailed project information
**New Design**: Professional terminal-style table with:
- Same glassmorphic background as landing
- Classification marking at top center
- Centered table container (max-width constraint)
- Fixed-column table structure with vertical gutters
- Project cards as horizontal rows with:
  - Title (truncated with ellipsis)
  - Duration, Members, Status columns
  - VIEW and JOIN action buttons
- Filter system (right-aligned, slide-out reveal)
- 1px dividers between rows
- Bottom navigation links

---

## Current Work: Phase 1 Implementation

### Step 1: Global Foundation
Set up the base styling system that both pages will use:
- Color palette and CSS custom properties
- Typography scale
- Glassmorphic effect utilities
- Shadow system
- Animation timing functions

### Step 2: Landing Page Refactor
Transform the hero page to match the glassmorphic design:
- Background layers (satellite + glass overlay)
- Layout restructure (left/right split)
- Component styling (classification, progress, hero number, content block)
- Navigation links
- Content transition animation system

### Step 3: Browse Page Refactor
Transform the browse page to the terminal-style table:
- Background consistency with landing
- Table structure with fixed columns
- Row styling with proper typography
- Filter system implementation
- Action button styling

### Step 4: Integration & Polish
- Ensure navigation between pages works seamlessly
- Test responsive behavior
- Verify all data connections remain intact
- Polish animations and transitions

---

## Atomic-Level Implementation Checklist

### PHASE 1.1: Global Foundation Setup

#### 1.1.1: CSS Custom Properties (globals.css)
- [ ] Remove all existing neumorphic variables
- [ ] Add color palette variables:
  - [ ] `--color-white: #FFFFFF`
  - [ ] `--color-primary-text: #1A1A1B`
  - [ ] `--color-secondary-text: #696A6F`
  - [ ] `--color-bg-glass: rgba(255, 255, 255, 0.75)`
  - [ ] `--color-noise-overlay: rgba(255, 255, 255, 0.13)`
- [ ] Add typography scale variables:
  - [ ] `--font-inter: 'Inter', sans-serif`
  - [ ] `--fs-hero-number: 160px`
  - [ ] `--fs-main-heading: 48px`
  - [ ] `--fs-body: 16px`
  - [ ] `--fs-meta: 11px`
  - [ ] `--fs-classification: 16px`
  - [ ] `--fs-progress: 16px`
  - [ ] `--fs-nav: 12px`
  - [ ] `--fs-table-content: 14px`
  - [ ] `--fs-table-button: 11px`
- [ ] Add spacing variables:
  - [ ] `--spacing-global-margin: 100px`
  - [ ] `--spacing-global-margin-vertical: 50px`
  - [ ] `--spacing-classification-top: 50px`
  - [ ] `--spacing-progress-left: 25px`
  - [ ] `--spacing-progress-gap: 10px`
  - [ ] `--spacing-nav-bottom: 50px`
  - [ ] `--spacing-nav-right: 100px`
- [ ] Add opacity variables:
  - [ ] `--opacity-hero-number: 0.14`
  - [ ] `--opacity-classification: 0.14`
  - [ ] `--opacity-progress-active: 1`
  - [ ] `--opacity-progress-secondary: 0.5`
  - [ ] `--opacity-progress-tertiary: 0.25`
  - [ ] `--opacity-progress-quaternary: 0.125`
  - [ ] `--opacity-filter-idle: 0.5`
  - [ ] `--opacity-filter-active: 1`
- [ ] Add shadow/effect variables:
  - [ ] `--shadow-inner-x: 0`
  - [ ] `--shadow-inner-y: 4px`
  - [ ] `--shadow-inner-blur: 6.3px`
  - [ ] `--shadow-inner-color: rgba(0, 0, 0, 0.13)`
  - [ ] `--shadow-button-y: 4px`
  - [ ] `--gradient-stroke-light: #E7E7E7`
  - [ ] `--gradient-stroke-dark: #E1E1E1`
  - [ ] `--blur-glass: 75px`
  - [ ] `--blur-backdrop-small: 2px`
- [ ] Add animation variables:
  - [ ] `--transition-duration: 400ms`
  - [ ] `--transition-easing: ease-in-out`
  - [ ] `--animation-evaporation: 400ms`
  - [ ] `--animation-condensation: 400ms`

#### 1.1.2: Typography Setup (globals.css)
- [ ] Import Inter font from Google Fonts or local
- [ ] Set body font to Inter
- [ ] Define font-weight values:
  - [ ] Light: 300
  - [ ] Regular: 400
  - [ ] Bold: 700
  - [ ] Extra Bold: 800
- [ ] Set default line-height to auto for most elements
- [ ] Set body line-height to 1.6 for paragraphs

#### 1.1.3: Reset & Base Styles (globals.css)
- [ ] Remove existing neumorphic base styles
- [ ] Set body background to `#FFFFFF`
- [ ] Set body color to `--color-primary-text`
- [ ] Remove any existing box-shadow defaults
- [ ] Reset margins and padding on key elements
- [ ] Set box-sizing: border-box globally

#### 1.1.4: Glassmorphic Utility Classes (globals.css)
- [ ] Create `.glass-overlay` class:
  - [ ] `backdrop-filter: blur(var(--blur-glass))`
  - [ ] `background: var(--color-bg-glass)`
  - [ ] Position: fixed, full viewport
  - [ ] z-index: 1
- [ ] Create `.glass-container` class:
  - [ ] Position: relative
  - [ ] z-index: 2 (above glass overlay)
- [ ] Create `.classification-marking` class:
  - [ ] Typography: Inter Extra Bold, 16px
  - [ ] Color: `--color-secondary-text` at 14% opacity
  - [ ] Padding: 5px (top/bottom), 15px (left/right)
  - [ ] Border-radius: auto-hugging
  - [ ] 1px gradient stroke
  - [ ] Inner shadow
  - [ ] Backdrop blur: 2px
- [ ] Create `.gradient-stroke` utility:
  - [ ] Border: 1px solid
  - [ ] Border-image with gradient (top-left light, bottom-right dark)

#### 1.1.5: Button Base Styles (globals.css)
- [ ] Create `.btn-glass` base class:
  - [ ] Typography: Inter Light, 11px
  - [ ] Color: `--color-secondary-text`
  - [ ] Padding: 5px (top/bottom), 25px (left/right)
  - [ ] Border-radius: 33px (pill shape)
  - [ ] 1px gradient stroke
  - [ ] Drop shadow: y:4px, blur:6.3px
  - [ ] Transition: 400ms ease-in-out
- [ ] Create `.btn-glass:hover` state:
  - [ ] Opacity: 100%
  - [ ] Container outline visible
- [ ] Create `.btn-glass:active` state:
  - [ ] Background: white at 14% opacity
  - [ ] Inner shadow applied
  - [ ] Pressed/cutout effect

---

### PHASE 1.2: Landing Page Background Layers

#### 1.2.1: Satellite Background (page.css)
- [ ] Create `.landing-background` class
- [ ] Add satellite image as background-image
- [ ] Set background-position: center-left
- [ ] Set background-size: cover or contain (test which looks better)
- [ ] Apply transform: rotate(-30deg)
- [ ] Set position: fixed
- [ ] Set dimensions: 100vw x 100vh
- [ ] Set z-index: 0

#### 1.2.2: Glass Overlay Layer (page.css)
- [ ] Create `.landing-glass-overlay` class
- [ ] Apply backdrop-filter: blur(75px)
- [ ] Set background: white at 75% opacity
- [ ] Add noise texture as background-image
- [ ] Set noise blend-mode: screen
- [ ] Set noise opacity: 13%
- [ ] Set position: fixed
- [ ] Set dimensions: 100vw x 100vh
- [ ] Set z-index: 1

#### 1.2.3: Content Container (page.css)
- [ ] Create `.landing-content` class
- [ ] Set position: relative
- [ ] Set z-index: 2
- [ ] Set min-height: 100vh
- [ ] Apply global margins: 100px (left/right), 50px (top/bottom)

---

### PHASE 1.3: Landing Page Layout Structure

#### 1.3.1: Grid System (page.css)
- [ ] Create `.landing-grid` class
- [ ] Set display: grid or flex
- [ ] Define left region: 0-40% width
- [ ] Define right region: 40-100% width
- [ ] Set min-height: 100vh
- [ ] Ensure proper alignment

#### 1.3.2: Classification Marking (page.tsx + page.css)
- [ ] Add classification div at top of page
- [ ] Apply `.classification-marking` class
- [ ] Set text: "unclassified / public"
- [ ] Position: top 50px, horizontally centered
- [ ] Ensure z-index above glass overlay

#### 1.3.3: Vertical Progress Indicator (page.tsx + page.css)
- [ ] Create `.progress-indicator` container
- [ ] Position: left 25px, vertically centered
- [ ] Create vertical stack with 10px gaps
- [ ] Add four progress markers: "01", "02", "03", "04"
- [ ] Apply typography: Inter Extra Bold, 16px, center-aligned
- [ ] Set colors: all `--color-secondary-text`
- [ ] Set opacity states:
  - [ ] 01: 100%
  - [ ] 02: 50%
  - [ ] 03: 25%
  - [ ] 04: 12.5%

#### 1.3.4: Hero Number (page.tsx + page.css)
- [ ] Create `.hero-number` element
- [ ] Set text: "01"
- [ ] Position: left region, overlapping satellite area
- [ ] Typography: Inter Extra Bold, 160px
- [ ] Color: `--color-secondary-text` at 14% opacity
- [ ] Apply same effects as classification (gradient stroke, inner shadow, backdrop blur)
- [ ] Ensure it doesn't overlap main content text

---

### PHASE 1.4: Landing Page Main Content Block

#### 1.4.1: Content Container (page.tsx + page.css)
- [ ] Create `.main-content-block` container
- [ ] Position: right 100px, vertically centered
- [ ] Set text-align: right
- [ ] Set max-width: 550px

#### 1.4.2: Section Notice (page.tsx + page.css)
- [ ] Add section notice text element
- [ ] Typography: Inter Light, 12px
- [ ] Color: `--color-secondary-text`
- [ ] Text: "Ensure that all data..."
- [ ] Position: above main heading

#### 1.4.3: Main Heading (page.tsx + page.css)
- [ ] Create heading element
- [ ] Text: "COSMIC Microproducts Portal"
- [ ] Typography: Inter Bold, 48px
- [ ] Color: `--color-primary-text`
- [ ] Right-aligned

#### 1.4.4: Decorator Line (page.tsx + page.css)
- [ ] Create decorative line element
- [ ] Dimensions: 75px width, 2px height
- [ ] Color: `--color-secondary-text`
- [ ] Position: right-aligned under heading
- [ ] Margin: appropriate spacing

#### 1.4.5: Meta Information (page.tsx + page.css)
- [ ] Add meta info text
- [ ] Typography: Inter Light, 11px
- [ ] Color: `--color-secondary-text`
- [ ] Right-aligned
- [ ] Content: date, version, or status info

#### 1.4.6: Body Paragraph (page.tsx + page.css)
- [ ] Add body text element
- [ ] Text: "This portal helps COSMIC members..."
- [ ] Typography: Inter Regular, 16px, line-height: 1.6
- [ ] Color: `--color-primary-text`
- [ ] Max-width: 550px
- [ ] Right-aligned

---

### PHASE 1.5: Landing Page Navigation

#### 1.5.1: Bottom Navigation Links (page.tsx + page.css)
- [ ] Create `.bottom-nav` container
- [ ] Position: bottom 50px, right 100px
- [ ] Create three link elements:
  - [ ] "SUBMIT PRODUCT"
  - [ ] "BROWSE PRODUCTS"
  - [ ] "NEWS"
- [ ] Typography: Inter Light, 12px
- [ ] Color: `--color-secondary-text`
- [ ] Spacing: appropriate gaps between links

#### 1.5.2: Navigation Hover States (page.css)
- [ ] On hover: transform translateY(-10px)
- [ ] On hover: font-weight: 700 (Bold)
- [ ] Transition: 200-300ms
- [ ] Ensure smooth animation

---

### PHASE 1.6: Landing Page Animation System

#### 1.6.1: SVG Filter Setup (page.tsx)
- [ ] Add hidden SVG element to page
- [ ] Create `<filter id="turbulence-filter">`
- [ ] Add `<feTurbulence>` element:
  - [ ] type: "fractalNoise"
  - [ ] baseFrequency: 0 (initial)
  - [ ] numOctaves: 3
- [ ] Add `<feDisplacementMap>` element:
  - [ ] scale: 0 (initial)
  - [ ] xChannelSelector: "R"
  - [ ] yChannelSelector: "G"

#### 1.6.2: Animation Keyframes (page.css)
- [ ] Create `@keyframes evaporate`:
  - [ ] 0%: opacity 1, blur 0, turbulence 0
  - [ ] 100%: opacity 0, blur 20px, turbulence 0.05
- [ ] Create `@keyframes condense`:
  - [ ] 0%: opacity 0, blur 20px, turbulence 0.05
  - [ ] 100%: opacity 1, blur 0, turbulence 0
- [ ] Set duration: 400ms
- [ ] Set easing: ease-out (evaporate), ease-in (condense)

#### 1.6.3: Animation Classes (page.css)
- [ ] Create `.evaporating` class:
  - [ ] Apply evaporate animation
  - [ ] Apply turbulence filter
- [ ] Create `.condensing` class:
  - [ ] Apply condense animation
  - [ ] Apply turbulence filter
- [ ] Create `.hidden` class:
  - [ ] opacity: 0
  - [ ] pointer-events: none

#### 1.6.4: Scroll Trigger Logic (page.tsx)
- [ ] Add Intersection Observer or scroll listener
- [ ] Detect when scroll reaches 100vh threshold
- [ ] Trigger evaporation on current content
- [ ] Swap content at 0% opacity
- [ ] Trigger condensation on new content
- [ ] Update hero number (cross-fade)
- [ ] Update progress indicator opacity
- [ ] Lock scroll during transition

---

### PHASE 1.7: Browse Page Background & Structure

#### 1.7.1: Background Consistency (browse.css)
- [ ] Apply same `.landing-background` class
- [ ] Apply same `.landing-glass-overlay` class
- [ ] Ensure satellite and glass are identical to landing page
- [ ] Set z-index layers correctly

#### 1.7.2: Classification Marking (browse/page.tsx + browse.css)
- [ ] Add classification div at top
- [ ] Apply same `.classification-marking` class
- [ ] Position: top 50px, horizontally centered
- [ ] Ensure consistency with landing page

#### 1.7.3: Content Container (browse.css)
- [ ] Create `.browse-container` class
- [ ] Set position: relative, z-index: 2
- [ ] Center horizontally
- [ ] Set max-width: TBD (based on column widths)
- [ ] Apply appropriate padding

---

### PHASE 1.8: Browse Page Table Structure

#### 1.8.1: Table Container (browse/page.tsx + browse.css)
- [ ] Create `.table-container` element
- [ ] Set display: flex or grid
- [ ] Set flex-direction: column
- [ ] Center horizontally
- [ ] Apply max-width constraint

#### 1.8.2: Table Header/Filter Bar (browse/page.tsx + browse.css)
- [ ] Create `.filter-bar` container
- [ ] Position: above table, right-aligned
- [ ] Add filter trigger button/icon
- [ ] Create filter pills container (initially hidden)
- [ ] Set up slide-out animation

#### 1.8.3: Filter Pills (browse/page.tsx + browse.css)
- [ ] Create three filter pill elements:
  - [ ] "project length"
  - [ ] "members"
  - [ ] "status"
- [ ] Apply `.filter-pill` class
- [ ] Typography: Inter Regular, 11px
- [ ] Color: `--color-secondary-text`
- [ ] Border-radius: 33px
- [ ] Padding: 3px (top/bottom), 15px (left/right)
- [ ] Default state: 50% opacity, no container
- [ ] Hover state: 100% opacity, container visible
- [ ] Active state: white background 14%, gradient stroke, inner shadow

#### 1.8.4: Filter Icon (browse/page.tsx + browse.css)
- [ ] Create custom filter icon (three horizontal lines)
- [ ] Top line: 7px wide, 1px height
- [ ] Middle line: 5px wide, 1px height
- [ ] Bottom line: 3px wide, 1px height
- [ ] Gap between lines: 2px
- [ ] Color: `--color-secondary-text`

---

### PHASE 1.9: Browse Page Table Rows

#### 1.9.1: Row Container (browse/page.tsx + browse.css)
- [ ] Create `.table-row` class
- [ ] Set display: grid or flex
- [ ] Define fixed column widths (TBD - measure content)
- [ ] Set row height: fixed/consistent
- [ ] Add 1px divider between rows:
  - [ ] Height: 1px
  - [ ] Color: `--color-secondary-text`

#### 1.9.2: Column 1: Project Title (browse.css)
- [ ] Set fixed width (TBD)
- [ ] Typography: Inter Bold, 14px
- [ ] Color: `--color-secondary-text`
- [ ] Text-overflow: ellipsis
- [ ] White-space: nowrap
- [ ] Overflow: hidden
- [ ] Left-aligned

#### 1.9.3: Column 2: Duration (browse.css)
- [ ] Set fixed width (TBD)
- [ ] Typography: Inter Regular, 14px
- [ ] Color: `--color-secondary-text`
- [ ] Format: "X Weeks"
- [ ] Left-aligned

#### 1.9.4: Column 3: Members (browse.css)
- [ ] Set fixed width (TBD)
- [ ] Typography: Inter Regular, 14px
- [ ] Color: `--color-secondary-text`
- [ ] Format: "X Members"
- [ ] Left-aligned

#### 1.9.5: Column 4: Status (browse.css)
- [ ] Set fixed width (TBD)
- [ ] Typography: Inter Regular, 14px
- [ ] Color: `--color-secondary-text`
- [ ] Format: All caps (e.g., "APPROVED", "PENDING")
- [ ] Left-aligned

#### 1.9.6: Column 5: Action Buttons (browse.css)
- [ ] Set fixed width (TBD)
- [ ] Create two buttons: "VIEW" and "JOIN"
- [ ] Apply `.btn-glass` class
- [ ] Typography: Inter Light, 11px
- [ ] Color: `--color-secondary-text`
- [ ] Padding: 5px (top/bottom), 25px (left/right)
- [ ] Gradient stroke
- [ ] Drop shadow: y:4px, blur:6.3px
- [ ] Right-aligned within column
- [ ] Consistent gap between buttons

---

### PHASE 1.10: Browse Page Navigation

#### 1.10.1: Bottom Navigation (browse/page.tsx + browse.css)
- [ ] Create `.bottom-nav` container (same as landing)
- [ ] Position: bottom center
- [ ] Add three links:
  - [ ] "SUBMIT PRODUCT"
  - [ ] "BROWSE PRODUCTS"
  - [ ] "NEWS"
- [ ] Typography: Inter Light, 12px
- [ ] Color: `--color-secondary-text`
- [ ] Center-aligned
- [ ] Consistent spacing

---

### PHASE 1.11: Data Connection Verification

#### 1.11.1: Landing Page Data (page.tsx)
- [ ] Verify `useEffect` for fetching opportunities remains unchanged
- [ ] Verify stats calculation logic remains unchanged
- [ ] Verify recent activity filtering remains unchanged
- [ ] Verify all state variables remain unchanged
- [ ] Test that data displays correctly in new layout

#### 1.11.2: Browse Page Data (browse/page.tsx)
- [ ] Verify `useEffect` for fetching opportunities remains unchanged
- [ ] Verify join form state management remains unchanged
- [ ] Verify `startJoin`, `cancelJoin`, `submitJoin` functions remain unchanged
- [ ] Verify `renderTeam` function remains unchanged
- [ ] Verify all API calls remain unchanged
- [ ] Test that all data displays correctly in table format
- [ ] Test that JOIN functionality still works
- [ ] Test that VIEW navigation still works

#### 1.11.3: Navigation Links (both pages)
- [ ] Verify all `<Link>` components remain unchanged
- [ ] Verify href attributes are correct
- [ ] Test navigation between pages works
- [ ] Test external links (News) work

---

### PHASE 1.12: Responsive Behavior

#### 1.12.1: Landing Page Responsive (page.css)
- [ ] Add breakpoint: 768px (tablet)
  - [ ] Adjust hero number size
  - [ ] Adjust main content max-width
  - [ ] Adjust global margins
- [ ] Add breakpoint: 640px (mobile)
  - [ ] Stack layout vertically
  - [ ] Hide or reposition hero number
  - [ ] Adjust typography sizes
  - [ ] Adjust progress indicator

#### 1.12.2: Browse Page Responsive (browse.css)
- [ ] Add breakpoint: 768px (tablet)
  - [ ] Adjust column widths proportionally
  - [ ] Reduce button padding
- [ ] Add breakpoint: 640px (mobile)
  - [ ] Consider card-based layout instead of table
  - [ ] Stack information vertically
  - [ ] Prioritize title, status, actions
  - [ ] Hide or collapse less critical columns

---

### PHASE 1.13: Polish & Testing

#### 1.13.1: Animation Testing
- [ ] Test evaporation animation smoothness
- [ ] Test condensation animation smoothness
- [ ] Test scroll trigger timing
- [ ] Test content swap imperceptibility
- [ ] Test hero number cross-fade
- [ ] Test progress indicator updates
- [ ] Verify 60fps performance

#### 1.13.2: Filter System Testing
- [ ] Test filter pill hover states
- [ ] Test filter pill active states
- [ ] Test slide-out animation
- [ ] Test filter functionality (sorting)
- [ ] Verify opacity transitions

#### 1.13.3: Button Testing
- [ ] Test all button hover states
- [ ] Test all button active states
- [ ] Test button transitions
- [ ] Verify gradient strokes render correctly
- [ ] Verify drop shadows render correctly

#### 1.13.4: Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Verify backdrop-filter support
- [ ] Provide fallbacks if needed

#### 1.13.5: Accessibility Check
- [ ] Verify keyboard navigation works
- [ ] Verify focus states are visible
- [ ] Verify color contrast meets WCAG AA
- [ ] Test with screen reader (basic check)
- [ ] Verify all interactive elements are accessible

#### 1.13.6: Performance Check
- [ ] Check page load time
- [ ] Check animation performance (60fps)
- [ ] Check for layout shifts
- [ ] Optimize images if needed
- [ ] Minimize CSS if needed

---

### PHASE 1.14: Documentation & Handoff

#### 1.14.1: Code Comments
- [ ] Add comments to complex CSS selectors
- [ ] Add comments to animation keyframes
- [ ] Add comments to layout grid/flex structures
- [ ] Document any browser-specific hacks

#### 1.14.2: Update Documentation
- [ ] Update REFACTOR-PLAN.md with completion status
- [ ] Note any deviations from original design spec
- [ ] Document any issues encountered
- [ ] List any items deferred to Phase 2

#### 1.14.3: Prepare for Phase 2
- [ ] Review submit page current state
- [ ] Plan submit page refactor approach
- [ ] Identify reusable components from Phase 1
- [ ] Create Phase 2 checklist

---

## Success Criteria

### Landing Page
- [ ] Glassmorphic background renders correctly
- [ ] All text elements positioned as specified
- [ ] Hero number at correct opacity and position
- [ ] Progress indicator shows correct opacity states
- [ ] Navigation links work and have correct hover states
- [ ] Content transition animation works smoothly
- [ ] All data displays correctly
- [ ] Page is responsive on mobile/tablet

### Browse Page
- [ ] Background matches landing page
- [ ] Table structure with fixed columns renders correctly
- [ ] All typography matches specification
- [ ] Filter system works (hover, active, slide-out)
- [ ] Action buttons styled correctly
- [ ] Row dividers render correctly
- [ ] Title truncation with ellipsis works
- [ ] All data displays correctly in table format
- [ ] JOIN functionality still works
- [ ] Navigation works
- [ ] Page is responsive on mobile/tablet

### Overall
- [ ] No backend functionality broken
- [ ] All API calls still work
- [ ] All state management intact
- [ ] Navigation between pages seamless
- [ ] Performance is acceptable (60fps animations)
- [ ] Code is modular and maintainable
- [ ] Ready for Phase 2 (submit page)
