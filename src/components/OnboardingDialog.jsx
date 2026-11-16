import { useEffect, useRef } from 'react';

// Shared focus containment and restoration for the sequential onboarding dialogs.
export default function OnboardingDialog({ titleId, children, className = '', onDismiss }) {
  const card = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    card.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus?.();
    };
  }, []);
  const handleKey = event => {
    if (event.key === 'Escape' && onDismiss) { event.preventDefault(); onDismiss(); }
    if (event.key !== 'Tab') return;
    const elements = [...card.current.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]')];
    const first = elements[0]; const last = elements.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === card.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === card.current)) {
      event.preventDefault(); first.focus();
    }
  };
  return <div className="onboarding-overlay">
    <section ref={card} tabIndex={-1} onKeyDown={handleKey} role="dialog" aria-modal="true" aria-labelledby={titleId}
      className={`onboarding-card glass-card ${className}`}>
      {children}
    </section>
  </div>;
}
