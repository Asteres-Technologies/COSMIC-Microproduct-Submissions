// Modular animation system for consistent transitions across the app

export type AnimationState = 'idle' | 'hiding' | 'showing';

export const ANIMATION_DURATION = 1200; // ms

// CSS keyframes for blur-fade animations
export const animationKeyframes = `
  @keyframes content-hide {
    0% {
      filter: blur(0px);
      opacity: 1;
    }
    75% {
      filter: blur(1000px);
      opacity: 1;
    }
    100% {
      filter: blur(1000px);
      opacity: 0;
    }
  }

  @keyframes content-show {
    0% {
      filter: blur(1000px);
      opacity: 0;
    }
    25% {
      filter: blur(1000px);
      opacity: 1;
    }
    100% {
      filter: blur(0px);
      opacity: 1;
    }
  }
`;

// Get animation CSS properties based on state
export function getAnimationStyle(state: AnimationState): React.CSSProperties {
  if (state === 'hiding') {
    return {
      animation: `content-hide ${ANIMATION_DURATION}ms ease-in-out forwards`,
    };
  }
  
  if (state === 'showing') {
    return {
      animation: `content-show ${ANIMATION_DURATION}ms ease-in-out forwards`,
      filter: 'blur(100px)',
      opacity: 0,
    };
  }
  
  // idle state
  return {
    filter: 'blur(0px)',
    opacity: 1,
  };
}

// Get hero number animation CSS properties (blur + opacity for depth effect)
export function getHeroNumberAnimationStyle(state: AnimationState): React.CSSProperties {
  if (state === 'hiding') {
    return {
      animation: `hero-number-hide ${ANIMATION_DURATION}ms ease-in-out forwards`,
    };
  }
  
  if (state === 'showing') {
    return {
      animation: `hero-number-show ${ANIMATION_DURATION}ms ease-in-out forwards`,
      filter: 'blur(100px)',
      opacity: 0,
    };
  }
  
  // idle state
  return {
    filter: 'blur(0px)',
    opacity: 1,
  };
}
