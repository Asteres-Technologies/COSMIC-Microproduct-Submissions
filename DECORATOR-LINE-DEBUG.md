# Decorator Line Inconsistency — Debug Theories

## The Problem
All `.decorator-line` elements use the same CSS class (single rule in `landing.css`, no overrides). The HTML is identical: `<div class="decorator-line"></div>` with no inline styles. Yet some render thicker than others.

**Correct (thicker):** Overview section (title + deliverable decorator lines)
**Incorrect (thinner):** All other sections (Description, Timeline, Team, Dependencies)

---

## Theory 1: CSS `filter: blur(0px)` compositing layer
`getAnimationStyle('idle')` was returning `{ filter: 'blur(0px)', opacity: 1 }`. Even though `blur(0px)` is visually a no-op, it creates a GPU compositing layer. Elements inside a composited layer can have sub-pixel rendering differences for thin elements like a 2px line.

**Status:** TESTED — Changed idle to return `{}`. Did not fix the issue.

---

## Theory 2: `animation-fill-mode: forwards` retaining `filter: blur(0px)`
The `content-show` keyframe ended at `filter: blur(0px)`. With `forwards` fill mode, this value persists after the animation ends, keeping the compositing layer active even after idle state clears the inline style.

**Status:** TESTED — Changed keyframe end to `filter: none`. Did not fix the issue.

---

## Theory 3: Browser animation reuse / not restarting
Same `@keyframes` name applied to the same DOM element repeatedly might not restart properly. Created alternating `content-show-a` / `content-show-b` keyframes.

**Status:** TESTED — Alternating animation names based on section index. Did not fix the issue.

---

## Theory 4: `position: fixed` on `.detail-panel` creating compositing layer
`.detail-panel` is `position: fixed`, which forces GPU compositing. The decorator line's 2px height could render inconsistently across repaints within that composited layer.

**Analysis:** `.detail-panel` is `position: fixed` with `display: flex; align-items: center; justify-content: flex-end`. The `.detail-section-content` child sits inside this. The home page uses a similar pattern — `.hero-page-layout` is also `position: fixed` with `display: flex; align-items: center`, and `.main-content-block` sits inside it with the same decorator line. The home page works fine. So `position: fixed` alone isn't the differentiator.

However, the home page's `.main-content-block` has `flex-grow: 2; flex-shrink: 0` while the browse page's `.detail-section-content` has neither — it's just `max-width: 800px`. This means the flex container calculates the content area size differently. But this would be consistent across all sections, not varying per section.

**Status:** UNLIKELY — same pattern works on home page

---

## Theory 5: `line-height: auto` on `.main-heading` causing sub-pixel alignment
`.main-heading` has `line-height: auto`. Different text content (varying lengths, characters with descenders, line wrapping) causes the browser to compute different bottom edges. The decorator line below lands on different sub-pixel positions depending on the heading text, causing the 2px line to straddle pixel boundaries differently and appear thicker or thinner.

**Analysis:** `line-height: auto` is NOT a valid CSS value. The valid keyword is `normal`. Browsers will ignore the invalid value. Tailwind v4 preflight sets `line-height: 1.5` on `html`, which is inherited by all elements. So `.main-heading` effectively has `line-height: 1.5` (inherited) since its own `line-height: auto` is invalid and ignored.

With `line-height: 1.5` and `font-size: 24px`, the computed line-height is 36px. This is consistent regardless of text content. Single-line headings all have the same height. Multi-line headings would have multiples of 36px.

The overview heading ("Lunar Supply Chain: Power Infrastructure Edition") might wrap to 2 lines while "Description" or "Timeline (1/3)" stays on 1 line. Different total element heights = different vertical position for the decorator line below = different sub-pixel alignment.

BUT: you said the overview title decorator line AND the deliverable decorator line are BOTH correct. The deliverable's decorator line sits below `<div class="body-paragraph" style="font-weight: 700; margin-bottom: 8px">Deliverable</div>` — a completely different element with different height. If sub-pixel alignment from the element above was the cause, these two lines would look different from each other. They don't.

**Status:** UNLIKELY — doesn't explain why two decorator lines with different elements above them both look correct in the overview

---

## Theory 6: Content chunking / linkify output affecting layout
The `linkify()` function generates different HTML structures depending on content:
- Labels (colon within 60 chars): `<div>` with inline `fontSize: 16px`, `fontWeight: 700`, `marginTop/Bottom: 12px`
- Non-label lines in label blocks: `<div>` with inline `fontSize: 12px`
- Plain text: bare `<div>` with no inline styles

These are inside `body-paragraph` (a sibling BELOW the decorator line), so they shouldn't directly affect it. But the varying content height/structure below could influence how the browser lays out or repaints the decorator line above.

**Analysis:** The decorator line is a block-level `<div>` with explicit `height: 2px`. Elements BELOW it in normal flow cannot affect its rendered height. CSS block layout flows top-down — the decorator line's position and size are determined before the browser lays out the body-paragraph below it. The content below can only affect what comes after it, not before.

The only way content below could affect the decorator line is through margin collapsing. The decorator line has `margin-bottom: 50px`. The `body-paragraph` has no `margin-top` (reset to 0 by Tailwind preflight). But even if margins collapsed, that affects spacing, not the line's rendered height.

The `linkify` output for sections with `hasLabels = true` (like Timeline with "Week N:" patterns) generates divs with `marginTop: 12px` on the first child. This margin could collapse with the `body-paragraph`'s margin... but again, only affects spacing below the decorator line.

**Status:** ELIMINATED — elements below cannot affect the decorator line's rendered height

---

## Theory 7: Tailwind v4 CSS layers / specificity
Tailwind v4 uses `@layer` which can affect specificity. Our styles import after Tailwind (`globals.css` imports Tailwind first, then `main.css`). If Tailwind generates any rule matching `.decorator-line` or generic `div` selectors with higher layer priority, it could interfere.

**Analysis:** Examined the compiled CSS output in `.next/dev/static/chunks/`. Findings:

1. Tailwind v4 preflight (`@layer base`) sets `*, :after, :before { box-sizing: border-box; border: 0 solid; margin: 0; padding: 0; }`. The `border: 0 solid` and `margin: 0` apply to all elements but our `.decorator-line` rule explicitly sets its own margins and uses `background` not `border` for the line.

2. There are FOUR compiled CSS chunks containing `.decorator-line`:
   - `app_globals_css_*.css`: `height: 2px; margin-bottom: 50px` ✓ current
   - `[root-of-the-server]__*.css`: `height: 2px; margin-bottom: 50px` ✓ current
   - `app_page_*.css`: `height: 2px; margin-bottom: var(--spacing-sm)` ✗ STALE
   - `app_styles_layouts_landing_*.css`: `height: 2px; margin-bottom: var(--spacing-sm)` ✗ STALE

   Two chunks have stale `margin-bottom` values from a previous version. However, `height: 2px` is consistent across ALL chunks. The stale margin is a separate issue (spacing, not thickness).

3. No compiled chunk contains the old `.detail-section-content .decorator-line` override from browse.css — that removal is clean.

4. No Tailwind-generated utility class targets `.decorator-line`.

5. Tailwind preflight sets `h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }` in `@layer base`. Our `.main-heading` class overrides both with higher specificity.

**Status:** PARTIALLY RELEVANT — stale build cache has different margin-bottom values across chunks (could cause spacing inconsistency), but height is consistent at 2px across all chunks. A clean rebuild (delete `.next`) would fix the stale margin issue but likely won't fix the thickness issue.

---

## Theory 8: Stale `.next` build cache serving conflicting CSS chunks
Multiple compiled CSS chunks contain the `.decorator-line` rule with DIFFERENT `margin-bottom` values. Two chunks have the current `50px`, two have a stale `var(--spacing-sm)` (8px). Depending on chunk load order, the browser may apply different values. While `height` is consistent at `2px` across all chunks, the presence of stale cache suggests the dev server is not cleanly recompiling — there could be transient states where an even older chunk (with a different height) loads briefly or the cascade between chunks produces unexpected results.

**Status:** TESTED — Deleted `.next` folder and restarted dev server. Did not fix the issue.

---

## Theory 9: Browser rendering quirk with `background` on thin elements ✅ FIX
Using `background` to color a 2px-tall `<div>` renders inconsistently across repaints/section swaps. The browser's paint engine handles `background` fills on very thin elements differently depending on compositing context, repaint timing, or sub-pixel alignment during layout.

**Fix:** Changed from `height: 2px; background: var(--color-text)` to `height: 0; border-bottom: 2px solid var(--color-text)`. Borders are rendered by a different paint path in the browser and are pixel-snapped more reliably than background fills on thin elements.

**Status:** TESTED — Fixed the issue. All decorator lines now render consistently across all sections.
