# Styling Architecture Document

## Purpose

This document defines the atomic CSS architecture for the glassmorphic UI refactor. It maps backend data connections that must remain untouched and establishes the file structure for implementing the monochromatic, typography-driven design system specified in DESIGN-IDEA.md.

---

## Design Principles

### Monochromatic Palette
- **Only 2 colors**: `#FFFFFF` (white) and `#696A6F` (gray)
- **All text**: Uses `#696A6F` at various weights and opacities
- **No separate primary/secondary colors**: What appears darker is just bolder weight or higher opacity
- **Hierarchy**: Created entirely through font weight (300, 400, 700, 800) and opacity (14%, 25%, 50%, 75%, 100%)

### Typography-Driven Design
All visual hierarchy is established through:
- Font weight (Light 300, Regular 400, Bold 700, Extra Bold 800)
- Font size (11px to 160px scale)
- Opacity (14%, 25%, 50%, 75%, 100%)
- Line height and spacing

### Glassmorphism Aesthetic
- Backdrop blur: 75px on main overlay
- White transparency: 75% opacity
- Noise texture: 13% opacity, screen blend mode
- Subtle inner shadows and gradient strokes
- "Behind the glass" data materialization metaphor

---

## Backend Structure (DO NOT TOUCH)

### API Routes
**Files**: `app/api/storage/route.js`, `app/api/storage/join/route.js`
**Purpose**: GitHub integration for YAML file storage
**Critical**: All endpoints, response structures, and error handling must remain unchanged

### Data Validation
**File**: `lib/microproduct-schema.js`
**Schemas**: `microproductSchema`, `statusSchema`, `joinSchema`
**Critical**: Field names, validation rules, and schema structure are shared between client/server

### State Management
**Files**: `app/page.tsx`, `app/browse/page.tsx`, `app/submit/page.tsx`
**Variables**: `opps`, `opportunities`, `formData`, `loading`, `joined`, `joinForms`
**Functions**: `startJoin`, `cancelJoin`, `submitJoin`, `renderTeam`, `handleChange`, `handleSubmit`
**Critical**: All state variable names, function signatures, and data flow logic must remain unchanged

### Data Bindings (PRESERVE EXACTLY)

#### Landing Page
```tsx
{stats.total}           // Computed from opps array
{stats.pending}         // Filtered by status prefix
{stats.approved}
{stats['in-progress']}
{stats.completed}

{recent.map(r => (
  <div className={`badge ${r.status}`}>{r.status}</div>
  <div>{r.parsed?.title ?? r.name}</div>
  <div>{r.parsed?.lead_name ?? '—'}</div>
))}
```

#### Browse Page
```tsx
{opportunities.map(opp => {
  const status = (opp.name?.split('__')?.[0] ?? '').toLowerCase();
  const p = opp.parsed || {};
  
  return (
    <div>{p.title ?? opp.name}</div>
    <div>{p.duration_weeks ?? '—'} weeks</div>
    <div>{p.team_members?.length ?? 0} members</div>
    <div>{status}</div>
  );
})}
```

#### Submit Page
```tsx
<input
  name="title"
  value={formData.title}
  onChange={handleChange}
  className={fieldErrors.title ? 'input-error' : ''}
/>
```

### Navigation Links (PRESERVE)
```tsx
<Link href="/submit">Submit a Microproduct</Link>
<Link href="/browse">Browse All Microproducts</Link>
<Link href="/">Home</Link>
<a href="https://cosmicspace.org/news/">News</a>
```

---

## Atomic CSS File Structure

```
app/styles/
├── tokens/
│   ├── colors.css          # Monochromatic palette only
│   ├── typography.css      # Font family, sizes, weights, line heights
│   ├── spacing.css         # Margins, padding, gaps
│   ├── effects.css         # Shadows, blur, opacity values
│   ├── animations.css      # Keyframes, transitions, turbulence
│   └── index.css
├── base/
│   ├── reset.css           # CSS reset
│   ├── global.css          # Body, html, universal styles
│   └── index.css
├── components/
│   ├── buttons.css         # .btn-glass, .primary-cta, .join-btn
│   ├── inputs.css          # Form inputs (preserve existing)
│   ├── badges.css          # Status badges (monochromatic)
│   ├── glass.css           # .glass-overlay, glassmorphic effects
│   ├── classification.css  # .classification-marking
│   ├── navigation.css      # .bottom-nav, nav links
│   ├── filters.css         # .filter-bar, .filter-pill, filter icon
│   └── index.css
├── layouts/
│   ├── landing.css         # Landing page grid, hero number, progress
│   ├── browse.css          # Table structure, fixed columns
│   ├── submit.css          # Form layout (Phase 2)
│   └── index.css
└── main.css                # Master import
```

---

## Token Specifications

### colors.css
```css
:root {
  /* Monochromatic palette - only 2 colors */
  --color-white: #FFFFFF;
  --color-text: #696A6F;
  
  /* Glass effects */
  --color-bg-glass: rgba(255, 255, 255, 0.75);
  --color-noise-overlay: rgba(255, 255, 255, 0.13);
  
  /* Borders (subtle gradients) */
  --color-stroke-light: #E7E7E7;
  --color-stroke-dark: #E1E1E1;
}
```

**Note**: No separate primary/secondary text colors. All text uses `#696A6F` with hierarchy created through font weight and opacity only.

### typography.css
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800&display=swap');

:root {
  --font-inter: 'Inter', sans-serif;
  
  /* Font sizes - hierarchy through scale */
  --fs-hero-number: 160px;
  --fs-main-heading: 48px;
  --fs-body: 16px;
  --fs-table-content: 14px;
  --fs-section-notice: 12px;
  --fs-nav: 12px;
  --fs-meta: 11px;
  --fs-button: 11px;
  
  /* Font weights - hierarchy through weight */
  --fw-light: 300;
  --fw-regular: 400;
  --fw-bold: 700;
  --fw-extra-bold: 800;
  
  /* Line heights */
  --lh-auto: auto;
  --lh-tight: 1.2;
  --lh-normal: 1.4;
  --lh-relaxed: 1.6;
}
```

### spacing.css
```css
:root {
  /* Global margins */
  --spacing-global-margin: 100px;
  --spacing-global-margin-vertical: 50px;
  
  /* Component positioning */
  --spacing-classification-top: 50px;
  --spacing-progress-left: 25px;
  --spacing-progress-gap: 10px;
  --spacing-nav-bottom: 50px;
  --spacing-nav-right: 100px;
  
  /* Internal spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### effects.css
```css
:root {
  /* Opacity hierarchy */
  --opacity-full: 1;
  --opacity-glass: 0.75;
  --opacity-secondary: 0.5;
  --opacity-tertiary: 0.25;
  --opacity-hero: 0.14;
  --opacity-noise: 0.13;
  --opacity-quaternary: 0.125;
  
  /* Blur effects */
  --blur-glass: 75px;
  --blur-backdrop-small: 2px;
  --blur-evaporation: 20px;
  
  /* Shadows */
  --shadow-inner: inset 0 4px 6.3px rgba(0, 0, 0, 0.13);
  --shadow-button: 0 4px 6.3px rgba(0, 0, 0, 0.13);
  
  /* Gradient stroke */
  --gradient-stroke: linear-gradient(135deg, var(--color-stroke-light), var(--color-stroke-dark));
}
```

### animations.css
```css
:root {
  --transition-duration: 400ms;
  --transition-easing: ease-in-out;
  --animation-evaporation: 400ms;
  --animation-condensation: 400ms;
}

/* Evaporation: data clearing */
@keyframes evaporate {
  0% {
    opacity: 1;
    filter: blur(0) url(#turbulence-filter);
  }
  100% {
    opacity: 0;
    filter: blur(var(--blur-evaporation)) url(#turbulence-filter);
  }
}

/* Condensation: data materialization */
@keyframes condense {
  0% {
    opacity: 0;
    filter: blur(var(--blur-evaporation)) url(#turbulence-filter);
  }
  100% {
    opacity: 1;
    filter: blur(0) url(#turbulence-filter);
  }
}

/* Hero number cross-fade */
@keyframes hero-fade-out {
  from { opacity: var(--opacity-hero); }
  to { opacity: 0; }
}

@keyframes hero-fade-in {
  from { opacity: 0; }
  to { opacity: var(--opacity-hero); }
}

/* Progress indicator transitions */
.progress-marker {
  transition: opacity var(--transition-duration) var(--transition-easing);
}
```

---

## Component Specifications

### buttons.css
```css
/* Base glass button - monochromatic */
.btn-glass {
  font-family: var(--font-inter);
  font-weight: var(--fw-light);
  font-size: var(--fs-button);
  color: var(--color-text);
  padding: 5px 25px;
  border-radius: 33px;
  border: 1px solid transparent;
  background: transparent;
  box-shadow: var(--shadow-button);
  transition: all var(--transition-duration) var(--transition-easing);
  cursor: pointer;
}

.btn-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid;
  border-image: var(--gradient-stroke) 1;
  pointer-events: none;
}

.btn-glass:hover {
  opacity: var(--opacity-full);
  outline: 1px solid var(--color-stroke-light);
}

.btn-glass:active {
  background: rgba(255, 255, 255, var(--opacity-hero));
  box-shadow: var(--shadow-inner);
}

/* Preserve existing button classes for backward compatibility */
.primary-cta,
.join-btn,
.secondary-cta,
.tertiary-cta,
.submit-btn {
  /* Keep existing functionality, restyle with monochromatic palette */
}
```

### badges.css
```css
/* Monochromatic status badges - no color coding */
.badge {
  font-family: var(--font-inter);
  font-weight: var(--fw-regular);
  font-size: var(--fs-meta);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  text-transform: capitalize;
  background: transparent;
  border: 1px solid var(--color-text);
}

/* Status communicated through text content, not color */
.badge.pending,
.badge.approved,
.badge.in-progress,
.badge.completed {
  /* All use same monochromatic styling */
  color: var(--color-text);
  background: transparent;
}
```

### glass.css
```css
/* Fixed background layers */
.landing-background,
.browse-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('/satellite.jpg');
  background-position: center-left;
  background-size: cover;
  transform: rotate(-30deg);
  z-index: 0;
}

.glass-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(var(--blur-glass));
  background: var(--color-bg-glass);
  z-index: 1;
  pointer-events: none;
}

.glass-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise-texture.png');
  background-blend-mode: screen;
  opacity: var(--opacity-noise);
}

.glass-container {
  position: relative;
  z-index: 2;
}
```

### classification.css
```css
.classification-marking {
  position: fixed;
  top: var(--spacing-classification-top);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  
  font-family: var(--font-inter);
  font-weight: var(--fw-extra-bold);
  font-size: var(--fs-meta);
  color: var(--color-text);
  opacity: var(--opacity-hero);
  
  padding: 5px 15px;
  border-radius: 8px;
  box-shadow: var(--shadow-inner);
  backdrop-filter: blur(var(--blur-backdrop-small));
}

.classification-marking::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid;
  border-image: var(--gradient-stroke) 1;
  pointer-events: none;
}
```

### navigation.css
```css
.bottom-nav {
  position: fixed;
  bottom: var(--spacing-nav-bottom);
  right: var(--spacing-nav-right);
  display: flex;
  gap: var(--spacing-md);
  z-index: 10;
}

.bottom-nav a {
  font-family: var(--font-inter);
  font-weight: var(--fw-light);
  font-size: var(--fs-nav);
  color: var(--color-text);
  text-decoration: none;
  transition: all 200ms ease;
}

.bottom-nav a:hover {
  transform: translateY(-10px);
  font-weight: var(--fw-bold);
}

/* Browse page: centered navigation */
.browse-container .bottom-nav {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}
```

### filters.css
```css
.filter-bar {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

/* Filter pill - monochromatic ghost mode */
.filter-pill {
  font-family: var(--font-inter);
  font-weight: var(--fw-regular);
  font-size: var(--fs-meta);
  color: var(--color-text);
  padding: 3px 15px;
  border-radius: 33px;
  background: transparent;
  border: none;
  opacity: var(--opacity-secondary);
  transition: all var(--transition-duration) var(--transition-easing);
  cursor: pointer;
}

.filter-pill:hover {
  opacity: var(--opacity-full);
  outline: 1px solid var(--color-stroke-light);
}

.filter-pill.active {
  opacity: var(--opacity-full);
  background: rgba(255, 255, 255, var(--opacity-hero));
  box-shadow: var(--shadow-inner);
}

.filter-pill.active::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid;
  border-image: var(--gradient-stroke) 1;
  pointer-events: none;
}

/* Custom filter icon: descending lines (7px → 5px → 3px) */
.filter-icon {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-end;
}

.filter-icon::before {
  content: '';
  width: 7px;
  height: 1px;
  background: var(--color-text);
}

.filter-icon::after {
  content: '';
  width: 5px;
  height: 1px;
  background: var(--color-text);
}

.filter-icon span {
  width: 3px;
  height: 1px;
  background: var(--color-text);
}
```

---

## Layout Specifications

### landing.css
```css
.landing-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  margin: var(--spacing-global-margin-vertical) var(--spacing-global-margin);
}

.landing-grid {
  display: grid;
  grid-template-columns: 40% 60%;
  min-height: 100vh;
  align-items: center;
}

/* Hero number - decorative, 14% opacity */
.hero-number {
  font-family: var(--font-inter);
  font-weight: var(--fw-extra-bold);
  font-size: var(--fs-hero-number);
  color: var(--color-text);
  opacity: var(--opacity-hero);
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.hero-number::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid;
  border-image: var(--gradient-stroke) 1;
  box-shadow: var(--shadow-inner);
  backdrop-filter: blur(var(--blur-backdrop-small));
  pointer-events: none;
}

/* Vertical progress indicator */
.progress-indicator {
  position: fixed;
  left: var(--spacing-progress-left);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-progress-gap);
  z-index: 10;
}

.progress-marker {
  font-family: var(--font-inter);
  font-weight: var(--fw-extra-bold);
  font-size: var(--fs-meta);
  color: var(--color-text);
  text-align: center;
}

.progress-marker.active { opacity: var(--opacity-full); }
.progress-marker.secondary { opacity: var(--opacity-secondary); }
.progress-marker.tertiary { opacity: var(--opacity-tertiary); }
.progress-marker.quaternary { opacity: var(--opacity-quaternary); }

/* Main content block - right-aligned */
.main-content-block {
  position: absolute;
  right: var(--spacing-global-margin);
  top: 50%;
  transform: translateY(-50%);
  max-width: 550px;
  text-align: right;
}

.section-notice {
  font-family: var(--font-inter);
  font-weight: var(--fw-light);
  font-size: var(--fs-section-notice);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

.main-heading {
  font-family: var(--font-inter);
  font-weight: var(--fw-bold);
  font-size: var(--fs-main-heading);
  color: var(--color-text);
  line-height: var(--lh-auto);
  margin-bottom: var(--spacing-sm);
}

.decorator-line {
  width: 75px;
  height: 2px;
  background: var(--color-text);
  margin-left: auto;
  margin-bottom: var(--spacing-sm);
}

.meta-info {
  font-family: var(--font-inter);
  font-weight: var(--fw-light);
  font-size: var(--fs-meta);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.body-paragraph {
  font-family: var(--font-inter);
  font-weight: var(--fw-regular);
  font-size: var(--fs-body);
  color: var(--color-text);
  line-height: var(--lh-relaxed);
  max-width: 550px;
}
```

### browse.css
```css
.browse-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

/* Fixed-column table structure */
.table-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-text);
  align-items: center;
}

/* Column typography - all monochromatic */
.table-row .title {
  font-family: var(--font-inter);
  font-weight: var(--fw-bold);
  font-size: var(--fs-table-content);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-row .duration,
.table-row .members,
.table-row .status {
  font-family: var(--font-inter);
  font-weight: var(--fw-regular);
  font-size: var(--fs-table-content);
  color: var(--color-text);
}

.table-row .status {
  text-transform: uppercase;
}

.table-row .actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}
```

---

## Animation System

### SVG Turbulence Filter
```html
<!-- Add to page.tsx and browse/page.tsx -->
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

### Animation Classes
```css
/* Applied during evaporation */
.evaporating {
  animation: evaporate var(--animation-evaporation) ease-out forwards;
}

/* Applied during condensation */
.condensing {
  animation: condense var(--animation-condensation) ease-in forwards;
}

/* Hidden state between transitions */
.hidden {
  opacity: 0;
  pointer-events: none;
}
```

### Scroll Trigger Logic (JavaScript)
```javascript
// Pseudo-code for scroll-triggered transitions
const threshold = window.innerHeight; // 100vh

scrollObserver.observe(nextSection, {
  threshold: 0,
  rootMargin: '0px'
});

function onScrollTrigger() {
  // Lock scroll
  disableScroll();
  
  // Phase 1: Evaporation (400ms)
  currentContent.classList.add('evaporating');
  
  setTimeout(() => {
    // Phase 2: State swap at 0% opacity
    currentContent.classList.add('hidden');
    swapContent();
    
    // Phase 3: Condensation (400ms)
    newContent.classList.add('condensing');
    
    setTimeout(() => {
      // Unlock scroll
      enableScroll();
    }, 400);
  }, 400);
}
```

---

## Data Connection Map

### Landing Page Flow
```
API: GET /api/storage
  ↓
State: setOpps(data.files)
  ↓
Computed: stats = { total, pending, approved, in-progress, completed }
  ↓
Render: Typography displays stats
  ↓
CSS: Monochromatic styling only
```

### Browse Page Flow
```
API: GET /api/storage
  ↓
State: setOpportunities(data.files)
  ↓
Extract: status = opp.name.split('__')[0]
  ↓
Render: Fixed-column table with monochromatic typography
  ↓
CSS: No color-coding, hierarchy through weight/size
```

### Join Flow
```
User clicks JOIN
  ↓
Function: startJoin(filename)
  ↓
State: setJoinForms({ [filename]: { name: '', email: '' } })
  ↓
API: POST /api/storage/join
  ↓
State: setJoined({ [filename]: true })
  ↓
CSS: Button state change (monochromatic)
```

---

## Class Mapping (Preserve Functionality)

### Landing Page Classes
- `.landing-container` → Restyle with glassmorphic layout
- `.hero` → Restyle as grid layout
- `.hero-title` → Restyle with monochromatic typography
- `.hero-stats` → Convert to progress indicator
- `.stat` → Convert to progress marker
- `.badge` → Restyle monochromatic (no color-coding)
- `.primary-cta`, `.secondary-cta`, `.tertiary-cta` → Keep functionality

### Browse Page Classes
- `.browse-container` → Restyle with glassmorphic layout
- `.cards` → Convert to `.table-container`
- `.card` → Convert to `.table-row`
- `.title`, `.status` → Restyle as table cells (monochromatic)
- `.join-btn` → Keep functionality, restyle monochromatic

### Submit Page Classes (Phase 2)
- All existing classes preserved
- No changes in Phase 1

---

## Asset Requirements

### Images
- `public/satellite.jpg` - Satellite background (rotated -30deg)
- `public/noise-texture.png` - Noise overlay (13% opacity, screen blend)

### Fonts
- Inter (weights: 300, 400, 700, 800) via Google Fonts

---

## Import Structure

### app/globals.css
```css
/* Tailwind (if used) */
@import "tailwindcss";

/* Design tokens */
@import "./styles/tokens/index.css";

/* Base styles */
@import "./styles/base/index.css";

/* Components */
@import "./styles/components/index.css";

/* Layouts */
@import "./styles/layouts/index.css";
```

### Page-Specific CSS
- `app/page.css` → Import `layouts/landing.css` only
- `app/browse/browse.css` → Import `layouts/browse.css` only
- `app/submit/submit.css` → No changes (Phase 2)

---

## Critical Rules

### What You CAN Change
- HTML structure (add divs, wrappers)
- CSS classes (add new, restyle existing)
- Visual layout (grid, flexbox, positioning)
- Typography (sizes, weights, spacing)
- Animations and transitions
- Background images and effects

### What You CANNOT Change
- API route files
- Validation schemas
- State variable names
- Function names and signatures
- Data fetching logic
- Event handlers
- Form field names
- Link href attributes
- Data bindings in JSX
- Conditional rendering logic

### Safe JSX Changes
```tsx
// SAFE: Adding new visual elements
<div className="glass-overlay" />
<div className="classification-marking">unclassified / public</div>
<div className="hero-number">01</div>

// UNSAFE: Changing data bindings
{stats.total} → {totalCount} ❌

// SAFE: Wrapping in new elements
<div className="stat-display">{stats.total}</div> ✓
```

---

## Design Philosophy Summary

### Monochromatic Hierarchy
All visual hierarchy is created through typography (weight, size, opacity), not color. Only 2 colors: `#696A6F` and `#FFFFFF`. What appears as darker or lighter text is solely the result of font weight and opacity variations.

### Glassmorphism as Metaphor
The glass overlay isn't just decoration - it's a functional metaphor. Data materializes "through the glass" via turbulence animations, reinforcing the "behind the glass" display concept.

### Typography-Driven Design
Font weight and size create all hierarchy:
- Extra Bold 160px: Decorative hero number
- Bold 48px: Main headings
- Regular 16px: Body text
- Light 12px: Meta information
- Light 11px: Buttons and secondary actions

### Professional Terminal Aesthetic
Fixed-column tables, monochromatic palette, and precise typography create a "mission control" or "research terminal" feel rather than a consumer web application.

---

## End of Document
