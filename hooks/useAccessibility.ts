import { useEffect, useRef } from 'react';

// --- KEYBOARD SHORTCUTS HOOK ---
type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: (e: KeyboardEvent) => void;
};

export const useKeyboardShortcuts = (shortcuts: KeyCombo[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const matchesCtrl = !!shortcut.ctrlKey === e.ctrlKey;
        const matchesAlt = !!shortcut.altKey === e.altKey;
        const matchesShift = !!shortcut.shiftKey === e.shiftKey;

        if (matchesKey && matchesCtrl && matchesAlt && matchesShift) {
          e.preventDefault();
          shortcut.action(e);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// --- FOCUS TRAP HOOK ---
export const useFocusTrap = (isActive: boolean) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const currentRef = ref.current;
    currentRef.addEventListener('keydown', handleTab);
    
    // Initial focus
    firstElement?.focus();

    return () => {
      currentRef.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);

  return ref;
};

// --- HELPER FOR ARIA LABELS ---
export const getAriaLabelForIncident = (type: string, severity: string, address: string) => {
  return `${severity} severity ${type} incident at ${address}. Press Enter to view details.`;
};