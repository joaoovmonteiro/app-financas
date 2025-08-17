import { useEffect } from 'react';

export function useKeyboardDismiss() {
  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      // Check if the touch is outside of input/textarea elements
      const target = e.target as HTMLElement;
      if (target && !target.matches('input, textarea, [contenteditable]')) {
        // Blur any active input to dismiss keyboard
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          activeElement.blur();
        }
      }
    };

    // Add touch event listener for mobile
    document.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, []);
}