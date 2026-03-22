// Reusable content transition object
// Encapsulates the exact animation from the home page scroll:
// - CSS: content-hide (vanish at 1%) + content-show (blur in from 100px)
// - Smoke: character particles explode out / collapse in
// - Timing: ANIMATION_DURATION with 50% overlap between hide and show
//
// Usage:
//   const ct = new ContentTransition(smokeEffect);
//   ct.hide(elements);                    // hide a group of elements
//   ct.show(elements);                    // show a group of elements
//   ct.transition(hideEls, showEls);      // hide then show with overlap
//   ct.staggerShow(elements, delay);      // show elements one by one

import { SmokeEffect } from './smoke-effect';

export const ANIMATION_DURATION = 1200;

export type AnimState = 'idle' | 'hiding' | 'showing';

export interface TextElement {
  el: HTMLElement;
}

export class ContentTransition {
  private smoke: SmokeEffect;

  constructor(smoke: SmokeEffect) {
    this.smoke = smoke;
  }

  // Hide a group of elements — particles explode out, CSS hides at 1%
  // Returns a promise that resolves when the animation is done
  hide(elements: TextElement[]): Promise<void> {
    return new Promise(resolve => {
      if (elements.length === 0) { resolve(); return; }

      // Build particles from all elements using auto-detect
      const first = elements[0];
      this.smoke.initFromElement(first.el);
      for (let i = 1; i < elements.length; i++) {
        this.smoke.addFromElement(elements[i].el);
      }
      this.smoke.startHide();

      setTimeout(resolve, ANIMATION_DURATION);
    });
  }

  // Show a group of elements — particles collapse in, CSS blurs in
  // Returns a promise that resolves when the animation is done
  show(elements: TextElement[]): Promise<void> {
    return new Promise(resolve => {
      if (elements.length === 0) { resolve(); return; }

      const first = elements[0];
      this.smoke.initFromElement(first.el);
      for (let i = 1; i < elements.length; i++) {
        this.smoke.addFromElement(elements[i].el);
      }
      this.smoke.startShow();

      setTimeout(resolve, ANIMATION_DURATION);
    });
  }

  // Hide then show with 50% overlap (same as home page section change)
  // onSwap is called at the overlap point to swap content
  transition(
    hideElements: TextElement[],
    showElements: TextElement[],
    onSwap: () => void
  ): Promise<void> {
    return new Promise(resolve => {
      this.hide(hideElements);

      setTimeout(() => {
        onSwap();
        requestAnimationFrame(() => {
          this.show(showElements).then(resolve);
        });
      }, ANIMATION_DURATION / 2);
    });
  }

  // Show elements one by one with a delay between each
  // Each element gets its own independent smoke animation group
  // onShow is called per element so the caller can update CSS state
  staggerShow(
    elements: TextElement[],
    staggerDelay: number,
    onShow: (index: number) => void,
    onDone: (index: number) => void
  ) {
    elements.forEach((e, i) => {
      setTimeout(() => {
        onShow(i);

        // Fire independent smoke for this element
        this.smoke.initFromElement(e.el);
        this.smoke.startShow();

        setTimeout(() => onDone(i), ANIMATION_DURATION);
      }, i * staggerDelay);
    });
  }

  // Hide elements one by one with a delay between each (reverse stagger)
  staggerHide(
    elements: TextElement[],
    staggerDelay: number,
    onHide: (index: number) => void,
    onDone: (index: number) => void
  ) {
    elements.forEach((e, i) => {
      setTimeout(() => {
        onHide(i);

        this.smoke.initFromElement(e.el);
        this.smoke.startHide();

        setTimeout(() => onDone(i), ANIMATION_DURATION);
      }, i * staggerDelay);
    });
  }
}
