// src/hooks/useToggle.js
import { useState, useCallback } from 'react';

export function useToggle(initialValue = false) {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback(() => {
    setState(s => !s);
  }, []);

  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);

  return { state, toggle, setTrue, setFalse };
}
