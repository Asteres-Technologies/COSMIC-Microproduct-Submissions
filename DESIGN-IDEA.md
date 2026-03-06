# COSMIC Portal Design Specification

## Design System Overview

This document defines the visual design system for the COSMIC Microproducts Portal landing page. The design uses a glassmorphism aesthetic with a satellite imagery background, creating a modern, research-focused interface that represents the RTFG and COSMIC Chair authority.

---

## Design Philosophy

**Visual Language**: Glassmorphism with subtle depth
**Target Platforms**: Desktop and Tablet (responsive)
**Brand Identity**: Research-focused, authoritative, modern
**Key Aesthetic**: Layered transparency with soft blur effects

---

## Visual Hierarchy & Layout Structure

### Spatial Grid System

**Layout Method**: 12-column grid with left/right split
**Viewport**: Full viewport (`100vw` x `100vh`)

**Region Breakdown**:
- **Left Region** (0% - 40% width): Satellite imagery and hero number "01"
- **Right Region** (40% - 100% width): Main content block, right-aligned
- **Global Margins**: 100px (left/right), 50px (top/bottom)

**Purpose**: This split ensures the hero number and satellite occupy the left visual space while the content remains clearly readable on the right, preventing text overlap.

---

## Background Layer Stack

The background uses a three-layer approach to create depth and visual interest:

### Layer 0: Base Canvas
- **Fill**: Solid white `#FFFFFF`
- **Purpose**: Clean foundation for transparency effects

### Layer 1: Satellite Image
- **Asset**: `satellite.png`
- **Position**: Anchored to center-left
- **Rotation**: -30 degrees
- **Purpose**: Establishes the research/space theme, creates visual interest in the left region

### Layer 2: Glass Overlay
- **Backdrop Blur**: 75px
- **Fill**: White `#FFFFFF` at 75% opacity
- **Noise Texture**: `noise-texture.png` (or SVG generated)
  - Blend mode: Screen
  - Opacity: 13%
- **Purpose**: Creates the glassmorphism effect, softens the satellite image, adds subtle texture

---

## Typography System

**Primary Typeface**: Inter
**Hierarchy**: Established through weight, size, and opacity variations

### Type Scale

| Element | Weight | Size | Line Height | Color | Opacity |
|---------|--------|------|-------------|-------|---------|
| Hero Number | Extra Bold | 160px | Auto | #696A6F | 14% |
| Main Heading | Bold | 48px | Auto | #1A1A1B | 100% |
| Body Text | Regular | 16px | 1.6 | #1A1A1B | 100% |
| Progress Indicator | Extra Bold | 16px | Auto | #696A6F | Variable |
| Classification | Extra Bold | 16px | Auto | #696A6F | 14% |
| Section Notice | Light | 12px | Auto | #696A6F | 100% |
| Meta Info | Light | 11px | Auto | #696A6F | 100% |
| Navigation Links | Light | 12px | Auto | #696A6F | 100% |

---

## Color Palette

**Primary Colors**:
- **Base White**: `#FFFFFF` (background, glass overlay)
- **Primary Text**: `#1A1A1B` (headings, body text)
- **Secondary Text**: `#696A6F` (meta info, decorative elements)

**Opacity Variations**:
- 100%: Active elements, primary text
- 75%: Glass overlay fill
- 50%: Secondary progress indicators
- 25%: Tertiary progress indicators
- 14%: Hero number, classification marking
- 13%: Noise texture, inner shadows
- 12.5%: Quaternary progress indicators

---

## Component Specifications

### 1. Classification Marking
**Location**: Top center
**Position**: Top 50px, horizontally centered

**Container**:
- Auto-layout (hugging)
- Padding: 5px (top/bottom), 15px (left/right)

**Typography**: Inter Extra Bold, 16px, #696A6F at 14% opacity

**Effects**:
- 1px outside gradient stroke (top-left: #E7E7E7, bottom-right: #E1E1E1 at 0%)
- Inner shadow: x:0, y:4, blur:6.3, #000000 at 13% opacity
- Backdrop filter: blur(2px)

**Purpose**: Establishes official/classified aesthetic, reinforces research theme

---

### 2. Vertical Progress Indicator
**Location**: Far left rail
**Position**: Left 25px, vertically centered

**Structure**:
- Vertical stack
- 10px spacing between items

**Typography**: Inter Extra Bold, 16px, center aligned, #696A6F

**Opacity States**:
- 01: 100% (current/active)
- 02: 50%
- 03: 25%
- 04: 12.5%

**Purpose**: Shows user position in multi-step flow, creates visual rhythm on left edge

---

### 3. Hero Number ("01")
**Location**: Left region, overlapping satellite area
**Position**: Specifically to the LEFT of main content block to avoid text overlap

**Typography**: Inter Extra Bold, 160px, #696A6F at 14% opacity

**Effects**:
- 1px gradient stroke (same as classification marking)
- Inner shadow (same as classification marking)
- Backdrop filter: blur(2px)

**Purpose**: Large decorative element that reinforces current step, fills left visual space, creates depth

**Critical Note**: Must NOT overlap readable text - positioned in satellite/left region only

---

### 4. Main Content Block
**Location**: Right region
**Position**: Right 100px, vertically centered
**Text Alignment**: Right-aligned

**Sub-components**:

#### Section Notice
- **Text**: "Ensure that all data..."
- **Style**: Inter Light, 12px, #696A6F
- **Purpose**: Contextual instruction or warning

#### Main Heading
- **Text**: "COSMIC Microproducts Portal"
- **Style**: Inter Bold, 48px, #1A1A1B
- **Purpose**: Primary page title

#### Decorator Line
- **Dimensions**: 75px width, 2px height
- **Color**: #696A6F
- **Position**: Right-aligned under heading
- **Purpose**: Visual separator, adds sophistication

#### Meta Information
- **Style**: Inter Light, 11px, #696A6F
- **Purpose**: Supplementary details (date, version, status)

#### Body Paragraph
- **Text**: "This portal helps COSMIC members..."
- **Style**: Inter Regular, 16px, line-height 1.6, #1A1A1B
- **Max Width**: 550px
- **Purpose**: Primary descriptive content

**Critical Note**: Max-width constraint ensures text stays in right region and doesn't stretch across hero number

---

### 5. Navigation Links
**Location**: Bottom right
**Position**: Bottom 50px, right 100px

**Typography**: Inter Light, 12px, #696A6F

**Hover Interaction**:
- Transform: translateY(-10px) (lifts upward)
- Font weight: 700 (Bold)

**Purpose**: Secondary navigation, subtle interaction feedback

---

## Interaction Patterns

### Navigation Link Hover
- **Visual Change**: Lifts 10px upward, weight increases to bold
- **Timing**: Smooth transition (suggested 200-300ms)
- **Feel**: Lightweight, responsive, draws attention without being aggressive

---

## Responsive Considerations

**Target Devices**: Desktop and Tablet
**Breakpoint Strategy**: Maintain layout integrity across larger screens

**Key Constraints**:
- Body paragraph max-width (550px) prevents text sprawl
- Hero number stays in left region regardless of viewport width
- Global margins (100px) provide breathing room on large displays

---

## Design Rationale

### Why Glassmorphism?
Creates a modern, sophisticated aesthetic that aligns with research/technology themes. The blur and transparency suggest layers of information and depth, appropriate for a data-focused portal.

### Why the Satellite Image?
Reinforces the COSMIC (space/research) theme visually. The rotation (-30deg) creates dynamic energy and prevents static, corporate feel.

### Why Right-Aligned Content?
Creates asymmetric balance with the left-positioned satellite and hero number. Guides eye flow from left (visual interest) to right (actionable content).

### Why Subtle Opacity on Hero Elements?
The 14% opacity on the hero number and classification marking ensures they provide visual interest and structure without competing with readable content. They become part of the background texture while still being perceptible.

---

## Implementation Notes

### Layer Stacking Order (Bottom to Top)
1. White base canvas
2. Satellite image (rotated -30deg)
3. Glass overlay (blur + noise)
4. All UI elements (classification, progress, hero number, content, navigation)

### Preventing Text Overlap
The hero number "01" must be positioned in the left 40% region. The main content block is constrained to the right 60% region with a max-width of 550px. This spatial separation is critical for readability.

### Glass Effect Dependencies
The glassmorphism effect requires:
- Backdrop blur support (75px)
- Noise texture asset or SVG generation
- Proper layer stacking with transparency

If backdrop blur is not supported, provide fallback with solid white background at higher opacity.


---

## Browse Microproducts View (Table/List View)

### Design Philosophy: Atmosphere to Utility

**Landing Page** = Atmosphere & Authority
- Asymmetric layout with visual drama
- Satellite imagery and glassmorphic effects
- Right-aligned content creating dynamic energy
- Goal: Create emotional impact and establish COSMIC/RTFG authority

**Browse View** = Utility & Precision
- Centered, symmetric layout
- Rigid column structure with fixed widths
- Predictable interaction zones
- Goal: High-performance scanning and decision-making tool

This transition represents a shift from "welcome/wow" to "work mode" - from establishing brand identity to enabling efficient task completion.

---

### Page Structure

**Background**:
- Same glassmorphic effect as landing page (white base, blur, noise texture)
- Maintains visual continuity between views
- Light gray/white aesthetic

**Classification Marking**:
- Position: Top center
- Same styling as landing page classification
- Text: "unclassified / public"
- Maintains consistent security/research aesthetic

**Content Container**:
- Centered on viewport
- Fixed maximum width (to be determined based on column widths)
- Symmetric layout creates focused reading experience

**Bottom Navigation**:
- Position: Bottom center
- Links: "SUBMIT PRODUCT", "BROWSE PRODUCTS", "NEWS"
- Typography: Same as landing page navigation (Inter Light, 12px, #696A6F)
- Centered alignment creates symmetry
- Provides primary navigation actions

---

### The Fixed-Column Table System

#### Core Principle: Vertical Gutters

The table uses fixed-width columns to create invisible "vertical gutters" that enable straight-line vertical scanning. This eliminates the zigzag eye movement common in fluid-width layouts.

**Benefits**:
1. Users can scan straight down any column (e.g., Status) without eyes drifting
2. Creates predictable "drop zones" for the gaze
3. Feels like reading a calibrated instrument or research terminal
4. Maintains visual rhythm regardless of content length

#### Column Structure (Left to Right)

**1. Project Title Column**
- **Alignment**: Left-aligned
- **Width**: Fixed (specific pixel value TBD)
- **Typography**: Inter Bold, 14px, line-height: auto, #696A6F
- **Text Overflow**: Truncated with ellipsis (...) when exceeding column width
- **Examples**: 
  - "Autonomous Rendezvous Playbook"
  - "Dynamic Mission Autonomy with ..."
  - "Lunar Supply Chain: Power Infra ..."
- **Purpose**: Prevents long titles from pushing other columns, maintains uniform row height

**2. Duration Column**
- **Alignment**: Left-aligned within fixed width
- **Width**: Fixed (specific pixel value TBD)
- **Typography**: Inter Regular, 14px, line-height: auto, #696A6F
- **Format**: "X Weeks"
- **Examples**: "6 Weeks", "8 Weeks", "12 Weeks", "5 Weeks", "4 Weeks", "3 Weeks"
- **Purpose**: Creates scannable vertical zone for quick duration assessment

**3. Members Column**
- **Alignment**: Left-aligned within fixed width
- **Width**: Fixed (specific pixel value TBD)
- **Typography**: Inter Regular, 14px, line-height: auto, #696A6F
- **Format**: "X Members"
- **Examples**: "2 Members", "3 Members"
- **Purpose**: Quick team size assessment

**4. Status Column**
- **Alignment**: Left-aligned within fixed width
- **Width**: Fixed (specific pixel value TBD)
- **Typography**: Inter Regular, 14px, line-height: auto, #696A6F
- **Format**: All caps (e.g., "APPROVED", "PENDING")
- **Purpose**: Creates highly scannable vertical zone for status filtering
- **Note**: Users can scan straight down this column to find all APPROVED or PENDING projects

**5. Action Buttons Zone**
- **Alignment**: Right-aligned within fixed width
- **Width**: Fixed (specific pixel value TBD)
- **Buttons**: "VIEW" and "JOIN"
- **Typography**: Inter Light, 11px, line-height: auto, #696A6F
- **Padding**: 5px (top/bottom), 25px (left/right)
- **Effects**:
  - 1px gradient stroke (top-left: #E7E7E7, bottom-right: #E1E1E1 at 0%)
  - Drop shadow: x:0, y:4, blur:6.3
- **Spacing**: Consistent gap between VIEW and JOIN buttons
- **Purpose**: Pinned action zone creates muscle memory - buttons always in same position

---

### Row Specifications

**Row Height**: Fixed/consistent across all rows
**Row Dividers**:
- Height: 1px
- Color: #696A6F
- Position: Between each project card
- Purpose: Clear visual separation while maintaining minimal aesthetic

**Row Hover State** (suggested):
- Subtle background color change or opacity shift
- Should feel consistent with overall glassmorphic system
- Maintains professional, calm aesthetic

---

### The "Professional Terminal" Effect

#### Key Design Advantages

**1. Vertical Scanning Efficiency**
- Fixed columns allow eyes to scan straight down any data type
- No hunting or zigzagging between rows
- Status column becomes a quick-filter visual tool

**2. Predictable Interaction Zones**
- Action buttons always in exact same position
- Creates muscle memory for repeated use
- Reduces cognitive load and interaction time

**3. Visual Rhythm & Uniformity**
- Every row identical height
- Every column starts at same pixel position
- Interface becomes "invisible" - users focus on content, not UI
- Feels like a calibrated instrument

**4. Scalability**
- Works equally well with 5 projects or 50 projects
- No layout shift or reflow as content changes
- Maintains professional appearance at any scale

**5. Title Truncation Strategy**
- Ellipsis (...) prevents chaos from long titles
- Maintains uniform row height
- Users can click VIEW to see full details
- Prioritizes scannability over complete information display

---

### Typography Hierarchy

**Monochromatic Approach**:
All text uses #696A6F, creating unified, professional appearance.

**Hierarchy Through Weight & Size**:
- **Bold, 14px**: Project titles (primary focus)
- **Regular, 14px**: Duration, members, status (supporting data)
- **Light, 11px**: Action buttons (secondary interactions)

**Why Monochromatic?**
- Maintains calm, research-focused aesthetic
- Status communicated through text, not color-coding
- Aligns with COSMIC/RTFG professional branding
- Reduces visual noise, increases focus

---

### Comparison: Basic vs. Professional Alignment

| Feature | Basic Web List | Professional Terminal Design |
|---------|---------------|------------------------------|
| **Title Handling** | Wraps or pushes columns | Fixed width with ellipsis truncation |
| **Eye Flow** | Zigzag (hunting for info) | Vertical gutters (straight down scanning) |
| **Interaction** | Variable button positions | Pinned action zone (predictable) |
| **Row Height** | Variable based on content | Fixed/uniform across all rows |
| **Scannability** | Moderate | High-performance |
| **Overall Feel** | Standard web list | High-end research terminal |

---

### Responsive Considerations

**Desktop** (Primary Target):
- Full fixed-column layout as specified
- Optimal scanning and interaction experience
- All columns visible and properly spaced

**Tablet**:
- May need to adjust column widths proportionally
- Maintain fixed-width principle
- Consider reducing button padding slightly

**Mobile**:
- Likely requires different layout approach
- Consider card-based vertical stacking
- Prioritize title, status, and actions
- Duration/members may become secondary info

---

### Interaction Patterns

**Button Hover**:
- Subtle effect consistent with glassmorphic system
- Could use slight opacity change or weight increase
- Should not disrupt the calm, professional aesthetic
- Maintain predictability and precision

**Row Hover** (optional):
- Subtle background highlight
- Helps user track which row they're interacting with
- Should be very subtle to maintain minimal aesthetic

**Click Actions**:
- **VIEW**: Navigate to detailed project page
- **JOIN**: Initiate join request/confirmation flow

---

### Implementation Requirements

**Critical Specifications Needed**:
1. Exact pixel widths for each column
2. Total table container width
3. Horizontal spacing/gaps between columns
4. Vertical padding within rows
5. Exact row height specification

**Technical Considerations**:
- Use CSS Grid or fixed-width table layout
- Implement text-overflow: ellipsis for title column
- Ensure consistent row heights with overflow: hidden
- Maintain pixel-perfect alignment across all rows

---

### Design Rationale Summary

**Why This Approach?**

This rigid, column-based design transforms the browse view from a simple list into a high-performance research tool. By creating fixed vertical gutters and predictable interaction zones, users can:

1. Scan dozens of projects in seconds
2. Filter visually by status without reading every row
3. Develop muscle memory for interactions
4. Focus on content decisions rather than UI navigation

The design conveys precision, authority, and professionalism - appropriate for COSMIC/RTFG branding. It feels like mission control software or a research database rather than a consumer web application.

**The shift from the asymmetric landing page to this centered, rigid structure represents a deliberate transition from atmosphere to utility - from establishing brand identity to enabling efficient work.**


---

## Filter System

### Overview

The filter system provides a minimal, progressive disclosure approach to refining the project list. Filters remain nearly invisible at rest (50% opacity, no container) and reveal themselves on interaction, maintaining the clean, research-focused aesthetic.

**Filtering Philosophy**: Simple, single-click sorting. No complex multi-select or range filtering. Each filter applies a straightforward sort order to keep the interface fast and intuitive.

### Filter Bar Position

**Location**: Above the table, right-aligned
**Filters Available**: "project length", "members", "status"
**Trigger Element**: Filter icon button on far right

---

### Filter Behavior & Sorting Logic

#### Project Length Filter
**Sort Order**: Descending (largest to smallest)
**Behavior**: 
- Single click activates filter
- Projects sorted by duration: 12 weeks → 8 weeks → 6 weeks → 5 weeks → 4 weeks → 3 weeks
- Longest projects appear first
**Use Case**: Quickly find longer-term commitments or shorter sprints

#### Members Filter
**Sort Order**: Descending (largest to smallest)
**Behavior**:
- Single click activates filter
- Projects sorted by team size: 3 members → 2 members
- Larger teams appear first
**Use Case**: Find projects with more collaboration opportunities or smaller, focused teams

#### Status Filter
**Sort Order**: Alphabetical by status, then alphabetical by title within each status
**Behavior**:
- Single click activates filter
- Groups projects by status: APPROVED first, then PENDING
- Within each status group, projects sorted alphabetically by title
- Example order:
  - APPROVED: "Autonomous Rendezvous Playbook"
  - APPROVED: "Dynamic Mission Autonomy..."
  - APPROVED: "Lunar Supply Chain..."
  - PENDING: "Ground Segment Touchpoints..."
  - PENDING: "ISAM Use-Case Snapshot..."
  - PENDING: "ISAM Workforce On-Ramp..."
**Use Case**: Quickly see all approved projects or all pending projects grouped together

#### Default View (No Filter Active)
**Sort Order**: Natural/chronological order (as submitted or as defined by system)
**Behavior**: Projects appear in their default order when no filter is active

---

### Simple Filtering Principle

**No Complex Options**:
- No multi-select filtering
- No range sliders or date pickers
- No AND/OR logic combinations
- No custom sort directions (ascending/descending toggles)

**Single-Click Activation**:
- One click applies the filter/sort
- Click again to deactivate and return to default view
- Only one filter active at a time (clicking a new filter deactivates the previous one)

**Why This Approach?**
- Maintains minimal, fast interface
- Reduces cognitive load
- Aligns with "professional terminal" aesthetic where actions are direct and predictable
- Keeps the focus on scanning and selecting projects, not configuring filters

---

### Filter Pill Component

#### Typography
- **Typeface**: Inter
- **Weight**: Regular
- **Size**: 11px
- **Line Height**: Auto
- **Color**: #696A6F (monochromatic main color)

#### Geometry
- **Shape**: Pill/capsule with maximum rounded corners
- **Border Radius**: 33px
- **Vertical Padding**: 3px (top/bottom)
- **Horizontal Padding**: 15px (left/right)
- **Spacing**: Consistent horizontal gaps between pills

#### Filter Icon Specification

The custom filter icon consists of three horizontal lines stacked vertically, creating a descending/funnel shape:

**Line Specifications**:
- **Top line**: 7px wide × 1px height
- **Middle line**: 5px wide × 1px height
- **Bottom line**: 3px wide × 1px height
- **Gap between lines**: 2px
- **Color**: #696A6F (monochromatic main color)

**Visual Effect**: The descending line widths (7px → 5px → 3px) create a subtle funnel/filter symbol that aligns with the minimal aesthetic.

---

### Interaction States

#### 1. Default/Idle State (Ghost Mode)
**Visibility**:
- Text and filter icon visible
- NO container outline visible
- Blends into background

**Opacity**:
- All elements at 50% opacity
- Creates minimal, ghost-like appearance
- Reduces visual noise when filters not in use

**Purpose**: Keeps interface clean while maintaining discoverability

---

#### 2. Hover State (Reveal)
**Visibility**:
- Container outline becomes visible
- All elements snap to full visibility

**Opacity**:
- Text, icon, and container all at 100% opacity

**Animation**:
- Transition duration: 400ms
- Easing: ease-in-out
- Smooth fade-in of container

**Purpose**: Signals interactivity and readiness for interaction

---

#### 3. Pressed/Active State (Cutout Effect)
**Background**:
- Fill: White at 14% opacity
- Creates subtle depth

**Border**:
- 1px outside gradient stroke
- Top-left: #E7E7E7
- Bottom-right: #E1E1E1 at 0%
- Same gradient as hero elements and action buttons

**Shadow**:
- Inner shadow effect
- x: 0, y: 4, blur: 6.3
- Color: #000000 at 13% opacity
- Creates physically "embedded" or "pressed in" feeling

**Purpose**: 
- Indicates active filter selection
- Uses same glassmorphic inset aesthetic as landing page elements
- Creates tactile, physical feedback

---

### Filter Reveal Animation

#### Trigger Element
**Location**: Top-right of table area
**Content**: Text label + filter icon (e.g., "Click for filters")
**Function**: Toggle button to show/hide filter bar

#### Animation Behavior
**Type**: Horizontal slide-out reveal
**Direction**: Slides out from right to left
**Duration**: 400ms
**Easing**: ease-in-out
**Current Status**: This slide-out is the current design direction

**Progressive Disclosure Philosophy**:
- Filters hidden by default to maintain clean interface
- Slide-out animation reveals filters when needed
- Functionality appears on demand, stays hidden when not needed

---

### Filter Interaction Flow

**Step 1: Initial State**
- Filter bar hidden or in ghost mode (50% opacity)
- Only trigger button visible at full opacity

**Step 2: User Clicks Trigger**
- Filter pills slide out horizontally (400ms)
- Pills appear in ghost mode (50% opacity)

**Step 3: User Hovers Filter**
- Hovered pill snaps to 100% opacity (400ms)
- Container outline becomes visible
- Other pills remain at 50% opacity

**Step 4: User Clicks Filter**
- Pill enters pressed/active state
- Cutout effect applied (white background, gradient stroke, inner shadow)
- Filter dropdown/options appear (implementation TBD)

**Step 5: Filter Applied**
- Active pill maintains pressed/active state
- Table updates to show filtered results
- Other filters remain available for additional refinement

---

### Design Philosophy

**Minimal by Default**:
The 50% opacity ghost mode ensures filters don't compete with the primary content (the project table). They're discoverable but not distracting.

**Progressive Disclosure**:
The slide-out animation and opacity transitions create a sense of revealing functionality only when needed. This aligns with the "professional terminal" aesthetic where the interface stays out of the way until required.

**Consistent Interaction Language**:
The pressed/active state uses the same glassmorphic cutout effect as:
- Landing page hero number and classification marking
- Action buttons (VIEW/JOIN)
- Other interactive elements throughout the system

This creates a unified interaction language where "pressed in" always means "active/selected."

**Sophisticated Minimalism**:
The custom filter icon (descending lines: 7px → 5px → 3px) is more refined than a standard dropdown arrow or generic filter icon. It's subtle, sophisticated, and aligns with the research-focused, authoritative aesthetic.

---

### Implementation Notes

**Filter Options** (TBD):
- Project length: Dropdown with week ranges
- Members: Dropdown with member count ranges
- Status: Toggle between APPROVED/PENDING/ALL

**Multi-Select Behavior** (TBD):
- Can multiple filters be active simultaneously?
- How do filters combine (AND vs OR logic)?

**Exit Animation** (TBD):
- How do filters hide when trigger is clicked again?
- Reverse slide-out animation (400ms)?
- Fade out to ghost mode?

**Mobile Considerations**:
- Filter bar may need different positioning on mobile
- Consider full-width filter bar or modal approach
- Touch targets should be larger than desktop hover states

---

### Visual Consistency Check

**Filter Pills Match**:
- Same gradient stroke as hero elements (✓)
- Same inner shadow as pressed buttons (✓)
- Same monochromatic color palette #696A6F (✓)
- Same glassmorphic aesthetic (✓)
- Same animation timing (400ms ease-in-out) (✓)

The filter system is fully integrated into the existing design language, maintaining visual and interaction consistency across the entire interface.


---

## Content Transition Animation System

### Animation Philosophy: Data Materialization

**Core Concept**: Information doesn't simply appear or disappear - it materializes and dematerializes through the glass overlay, as if data is being projected onto the screen from behind the glassmorphic surface.

**Visual Metaphor**: The interface behaves like a high-end research terminal or mission control display where data "condenses" from vapor into readable form and "evaporates" back into smoke when dismissed. This reinforces the COSMIC/RTFG technical authority and creates a cinematic, sophisticated user experience.

**Universal Application**: Any content entering or exiting the viewport must use this transition system to maintain consistency and the "behind the glass" illusion.

---

### Transition Type: Discrete State Transition

**Not Scroll-Scrubbing**: 
The animation is NOT directly tied to scroll position. Scrolling acts as a trigger, not a controller. Once triggered, the animation runs as a fixed-duration performance regardless of scroll speed.

**Why This Matters**:
- Creates cinematic, intentional feel
- Ensures animation always looks exactly as designed
- Prevents glitchy, half-finished states
- Conveys precision and technical sophistication
- Feels like a command center processing discrete data packets

---

### The Four-Phase Transition Sequence

#### Phase 1: Invisible Scroll (The Void)

**User Action**: User scrolls down the page

**Visual Behavior**:
- Satellite background remains fixed/locked in place
- Glass overlay remains fixed/locked in place
- Viewport appears completely static
- Scroll position changes in background (invisible to user)
- Creates anticipation and tension

**Duration**: Variable (depends on user scroll speed)

**Purpose**: 
- Decouples scroll from visual feedback
- Creates "loading" anticipation
- Maintains the fixed glassmorphic canvas

**Technical Note**: Background elements use `position: fixed` or similar to prevent movement during scroll

---

#### Phase 2: Evaporation (Data Clearing)

**Trigger**: Scroll distance reaches threshold (100vh - one full viewport height)

**Immediate Actions**:
- JavaScript detects threshold crossing
- Layout movement locks (section becomes fixed)
- Evaporation sequence initiates

**Visual Sequence** (All simultaneous, 400ms total duration):

1. **Turbulence Distortion**
   - SVG `<feTurbulence>` filter applied to all text
   - `baseFrequency` tweens from 0 to high value (e.g., 0.05)
   - Creates organic, smoke-like distortion
   - Text appears to break apart into particles

2. **Progressive Blur**
   - CSS `blur()` filter increases from 0px to ~20px
   - Synchronized with turbulence effect
   - Text becomes increasingly unfocused
   - Enhances "evaporation" feeling

3. **Opacity Fade**
   - Opacity decreases from 100% to 0%
   - Linear or ease-out curve
   - Final stage of disappearance
   - Text fades into the glass

**Combined Effect**: 
Text appears to evaporate, dissolve, or be "cleared" from the screen like smoke dissipating through glass. It looks like data being wiped from a terminal display.

**Animation Timing**: 400ms (fixed, regardless of scroll speed)

**Easing**: ease-out or custom cubic-bezier for smooth deceleration

**Elements Affected**:
- All text in the main content block
- Section notice
- Main heading
- Decorator line (fades only, no turbulence)
- Meta info
- Body paragraph

**Elements NOT Affected**:
- Hero number (transitions separately - see Phase 3)
- Vertical progress indicator (updates separately - see Phase 3)
- Classification marking (remains fixed)
- Background layers (remain fixed)
- Navigation links (remain fixed)

---

#### Phase 3: State Swap (The Hidden Moment)

**Timing**: Occurs when evaporation reaches 0% opacity (screen is blank)

**DOM Operations** (Invisible to user):

1. **Content Replacement**
   - Old content removed from DOM
   - New content inserted into DOM
   - New content starts at 0% opacity with full turbulence/blur
   - User sees blank screen during this swap

2. **Hero Number Transition**
   - Current number (e.g., "01") cross-fades out
   - New number (e.g., "02") cross-fades in
   - Both maintain 14% opacity throughout
   - Smooth, subtle transition
   - Duration: 400ms (overlaps with evaporation/condensation)

3. **Progress Indicator Update**
   - Previous marker dims from 100% to 50% opacity
   - New active marker brightens from 50% to 100% opacity
   - Smooth opacity transitions
   - Duration: 400ms (synchronized with content transition)

**Technical Implementation**:
- Use document fragment or virtual DOM for efficient swapping
- Headless navigation (AJAX, React state, Vue state, etc.)
- No page refresh
- Only main content block changes
- Background, navigation, and fixed elements remain untouched

**The "Empty Screen" Moment**:
There should be a brief moment (potentially 50-100ms) where the screen is completely blank between evaporation and condensation. This emphasizes the discrete state change and creates a "processing" feeling.

---

#### Phase 4: Condensation (Data Materialization)

**Trigger**: Immediately after state swap completes (or after brief empty screen pause)

**Visual Sequence** (Reverse of evaporation, 400ms total duration):

1. **Opacity Fade In**
   - Opacity increases from 0% to 100%
   - Linear or ease-in curve
   - First stage of appearance

2. **Progressive Blur Reduction**
   - CSS `blur()` filter decreases from ~20px to 0px
   - Synchronized with turbulence reduction
   - Text becomes increasingly focused
   - Enhances "condensation" feeling

3. **Turbulence Resolution**
   - SVG `<feTurbulence>` filter `baseFrequency` tweens from high value to 0
   - Distortion gradually resolves
   - Text particles "coalesce" into readable form
   - Final stage creates sharp, clear text

**Combined Effect**:
Text appears to condense, materialize, or "form" on the screen like vapor solidifying into readable data. It looks like information being projected onto a terminal display from behind the glass.

**Animation Timing**: 400ms (fixed, matches evaporation duration)

**Easing**: ease-in or custom cubic-bezier for smooth acceleration

**Elements Affected**:
- All text in the new content block
- Section notice
- Main heading
- Decorator line (fades in only, no turbulence)
- Meta info
- Body paragraph

**Staggering** (Optional Enhancement):
- Elements could condense in sequence rather than simultaneously
- Suggested order: Section notice → Heading → Decorator → Meta → Body
- Stagger delay: 50-100ms between elements
- Creates cascading materialization effect
- Total duration still 400ms (elements start at different times but finish together)

---

### SVG Filter Technical Specification

#### Turbulence Filter Structure

```xml
<svg style="position: absolute; width: 0; height: 0;">
  <defs>
    <filter id="turbulence-filter">
      <feTurbulence 
        type="fractalNoise" 
        baseFrequency="0" 
        numOctaves="3" 
        result="turbulence" />
      <feDisplacementMap 
        in="SourceGraphic" 
        in2="turbulence" 
        scale="0" 
        xChannelSelector="R" 
        yChannelSelector="G" />
    </filter>
  </defs>
</svg>
```

**Key Parameters**:

**baseFrequency**:
- Start (readable): 0
- End (evaporated): 0.05 (adjust for desired distortion intensity)
- Controls the "grain" or "noise" of the turbulence
- Higher values = more chaotic distortion

**numOctaves**:
- Value: 3
- Controls complexity of the noise pattern
- Higher values = more detailed, organic distortion
- 3 provides good balance between performance and visual quality

**scale** (in feDisplacementMap):
- Start (readable): 0
- End (evaporated): 50-100 (adjust for desired displacement intensity)
- Controls how much the turbulence displaces the pixels
- Higher values = more dramatic distortion

**type**:
- Value: "fractalNoise"
- Creates organic, cloud-like patterns
- More natural than "turbulence" type

**JavaScript Animation**:
Use GSAP, anime.js, or vanilla JavaScript to tween the `baseFrequency` and `scale` attributes over 400ms synchronized with blur and opacity changes.

---

### Scroll Trigger Implementation

#### Threshold Detection

**Method**: Intersection Observer API or GSAP ScrollTrigger

**Configuration**:
- **Threshold**: 100vh (one full viewport height)
- **Mode**: "toggleActions" NOT "scrub"
- **Trigger Point**: When next section enters viewport
- **Action**: Fire evaporation function on current section

**Example Logic**:
```
When Section 2 enters viewport:
  → Trigger evaporation on Section 1
  → Lock Section 1 in place
  → Run 400ms evaporation animation
  → Swap content at 0% opacity
  → Run 400ms condensation animation
  → Unlock and display Section 2
```

**Scroll Locking**:
During the 800ms transition (400ms evaporation + 400ms condensation), scroll input should be temporarily disabled or queued to prevent user from triggering multiple transitions simultaneously.

---

### Typography During Transition

**All Text Elements Maintain Their Specifications**:

**Hero Number**:
- Inter Extra Bold, 160px, #696A6F at 14% opacity
- Cross-fades between numbers (no turbulence)
- Smooth opacity transition only

**Main Heading**:
- Inter Bold, 48px, #1A1A1B
- Full turbulence + blur + opacity treatment
- Most prominent element in transition

**Body Text**:
- Inter Regular, 16px, line-height 1.6, #1A1A1B
- Full turbulence + blur + opacity treatment
- Largest block of text, creates dramatic effect

**Section Notice**:
- Inter Light, 12px, #696A6F
- Full turbulence + blur + opacity treatment
- Subtle but participates in transition

**Meta Info**:
- Inter Light, 11px, #696A6F
- Full turbulence + blur + opacity treatment
- Small details that enhance overall effect

**Decorator Line**:
- 75px × 2px, #696A6F
- Opacity fade only (no turbulence or blur)
- Simple fade maintains clean geometric form

**Why Typography Matters**:
The varying weights and sizes create visual hierarchy even during the transition. Bold, large text distorts more dramatically, while light, small text creates subtle detail. This maintains readability cues even during the "smoke" phase.

---

### Performance Considerations

**GPU Acceleration**:
- Use `transform: translateZ(0)` or `will-change: filter, opacity` on animated elements
- Forces GPU rendering for smoother animations
- Critical for 60fps performance

**Filter Complexity**:
- SVG filters are computationally expensive
- Test on mid-range devices to ensure 400ms completes smoothly
- Consider reducing `numOctaves` or `scale` values on lower-end devices
- Provide fallback: simple opacity fade if device can't handle filters

**Content Swapping**:
- Pre-load next section content before transition starts
- Use document fragments for efficient DOM manipulation
- Minimize reflow/repaint during swap
- Keep DOM changes isolated to content block only

**Scroll Performance**:
- Debounce or throttle scroll event listeners
- Use passive event listeners where possible
- Lock scroll during transition to prevent janky behavior

---

### Animation Vibe & Feel

**The "Behind the Glass" Illusion**:
Every transition should reinforce the feeling that information exists behind the glassmorphic overlay and is being projected forward onto the viewing surface. Content doesn't slide in from the sides or drop from above - it materializes through the glass itself.

**Organic Yet Precise**:
The turbulence creates organic, smoke-like motion, but the fixed 400ms timing and synchronized elements create precision. This balance conveys both sophistication (organic, natural) and authority (precise, controlled).

**Terminal/Command Center Aesthetic**:
The effect should feel like watching a high-end research terminal or mission control display process data. Information appears in discrete packets, not continuous streams. Each transition is a deliberate "state change" in the system.

**Cinematic Quality**:
The fixed duration and choreographed sequence create a "performance" quality. It's not reactive - it's intentional. This elevates the interface from a website to an experience.

**Emotional Impact**:
- **Evaporation**: Creates tension, anticipation, "something is happening"
- **Empty screen**: Brief pause, "processing," heightens anticipation
- **Condensation**: Relief, clarity, "information has arrived"
- **Overall**: Feels important, authoritative, worth paying attention to

---

### Universal Application Rules

**Any Content Entering Viewport**:
- Must use condensation animation (turbulence → blur → opacity)
- Duration: 400ms
- Easing: ease-in or custom

**Any Content Exiting Viewport**:
- Must use evaporation animation (opacity → blur → turbulence)
- Duration: 400ms
- Easing: ease-out or custom

**Exceptions**:
- Fixed background elements (satellite, glass overlay)
- Persistent navigation (classification marking, progress indicator, bottom links)
- Hero number (uses simple cross-fade)
- Decorator lines and simple geometric shapes (opacity only)

**Consistency is Critical**:
Every transition must use this system. Mixing transition styles (e.g., slide-in for one section, evaporation for another) would break the illusion and feel disjointed.

---

### Content Types & Transition Variations

**Text-Heavy Content** (Paragraphs, descriptions):
- Full turbulence + blur + opacity
- Most dramatic effect
- Creates "smoke" appearance

**Tabular Data** (Browse view table):
- Consider row-by-row staggered condensation
- Each row materializes sequentially (50ms stagger)
- Creates cascading effect
- Maintains readability during transition

**Form Inputs** (Submit page):
- Individual input fields condense separately
- Stagger: 100ms between fields
- Creates top-to-bottom materialization
- Feels like form is "building itself"

**Navigation Elements**:
- Simple opacity fades (no turbulence)
- Faster duration: 200ms
- Maintains clean, geometric appearance

**Images/Icons**:
- Opacity fade only (no turbulence or blur)
- Prevents distortion of visual elements
- Maintains clarity and recognizability

---

### Testing & Refinement Checklist

**Visual Quality**:
- [ ] Turbulence creates organic, smoke-like distortion (not pixelated or glitchy)
- [ ] Blur progression feels smooth (not stepped or jarring)
- [ ] Opacity fade is linear and predictable
- [ ] Combined effect looks like vapor/smoke, not random noise

**Timing**:
- [ ] 400ms duration feels neither too fast nor too slow
- [ ] Evaporation and condensation are symmetrical in feel
- [ ] Empty screen moment is noticeable but not awkward
- [ ] Hero number and progress indicator transitions sync perfectly

**Performance**:
- [ ] Animation runs at 60fps on target devices
- [ ] No jank or stuttering during transition
- [ ] Scroll locking prevents double-triggers
- [ ] Content swap is imperceptible (happens at 0% opacity)

**Consistency**:
- [ ] All content transitions use the same system
- [ ] Typography maintains hierarchy during transition
- [ ] Fixed elements remain truly fixed
- [ ] Animation feel matches across all sections

**User Experience**:
- [ ] Transition feels intentional, not accidental
- [ ] Creates anticipation and satisfaction
- [ ] Reinforces "behind the glass" metaphor
- [ ] Conveys technical authority and sophistication

---

### Implementation Priority

**Phase 1: Core Mechanics**
1. Set up SVG turbulence filter
2. Implement basic evaporation (turbulence + blur + opacity)
3. Implement basic condensation (reverse)
4. Test timing and feel

**Phase 2: Scroll Integration**
1. Set up Intersection Observer or ScrollTrigger
2. Implement threshold detection (100vh)
3. Connect scroll trigger to evaporation function
4. Implement scroll locking during transition

**Phase 3: Content Swapping**
1. Set up headless navigation system
2. Implement DOM content swapping at 0% opacity
3. Pre-load next section content
4. Test state management

**Phase 4: Polish**
1. Add hero number cross-fade
2. Add progress indicator updates
3. Implement staggered condensation for complex content
4. Optimize performance
5. Add fallbacks for low-end devices

**Phase 5: Universal Application**
1. Apply to all content sections
2. Test consistency across all transitions
3. Refine timing and easing curves
4. Final polish and testing

---

### Design Rationale: Why This Complexity?

**Brand Differentiation**:
This transition system is unique and memorable. It immediately distinguishes the COSMIC Portal from standard web applications and conveys the technical sophistication of the RTFG organization.

**Thematic Consistency**:
The glassmorphic aesthetic established on the landing page extends into the interaction layer. The glass isn't just a visual style - it's a functional metaphor for how information is displayed.

**User Engagement**:
The cinematic quality creates moments of delight and anticipation. Users pay attention to transitions, which increases engagement and makes the experience feel premium.

**Technical Authority**:
The precise, discrete state transitions convey that this is a professional research tool, not a consumer website. It feels like mission control software or advanced terminal interfaces.

**Worth the Effort**:
While complex to implement, this animation system is the signature interaction pattern that ties the entire design together. It's the difference between a good design and an exceptional one.
