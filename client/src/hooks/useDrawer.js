import { useEffect, useRef, useState } from 'react';

// Off-canvas drawer behavior: focus moves in when it opens, and Escape closes it and returns focus to the opener.
// (LearningLayout from Phase 6 has the same logic inline and can adopt this hook later.)
export function useDrawer() {
  const [open, setOpen] = useState(false);
  const openerRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        openerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return { open, setOpen, openerRef, closeRef };
}