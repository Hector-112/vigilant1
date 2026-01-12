
/**
 * Utility to provide haptic feedback using the Web Vibration API.
 * Levels: 
 * - 'light': subtle tap (10ms)
 * - 'medium': firm tap (20ms)
 * - 'heavy': distinct feedback (40ms)
 * - 'error': triple short burst
 */
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'error' = 'light') => {
  if (!window.navigator || !window.navigator.vibrate) return;

  switch (type) {
    case 'light':
      window.navigator.vibrate(10);
      break;
    case 'medium':
      window.navigator.vibrate(20);
      break;
    case 'heavy':
      window.navigator.vibrate(40);
      break;
    case 'error':
      window.navigator.vibrate([30, 50, 30, 50, 30]);
      break;
  }
};
