// src/hooks/useDraft.js
// Simple localStorage-backed draft persistence with debounce and hydration.

import { useEffect, useRef } from "react";

/**
 * useDraft
 * Keeps a text field (or JSON-serializable state) persisted under a key.
 *
 * Params:
 *  - key: string
 *  - value: any (string or JSON-serializable)
 *  - setValue: (v) => void
 *  - { debounce = 500, serialize = JSON.stringify, deserialize = JSON.parse }
 *
 * Behavior:
 *  - On first mount, hydrate from localStorage if present (does not overwrite subsequent updates).
 *  - Debounced save on value changes.
 *  - Provides a helper clear function.
 */
export function useDraft(
  key,
  value,
  setValue,
  {
    debounce = 500,
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
  } = {}
) {
  const inited = useRef(false);
  const timer = useRef(null);

  // Hydrate once
  useEffect(() => {
    if (inited.current) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const parsed = deserialize(raw);
        if (parsed !== undefined) setValue(parsed);
      }
    } catch {
      // ignore parse errors
    } finally {
      inited.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on change (debounced)
  useEffect(() => {
    if (!inited.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        if (value === undefined || value === null || (typeof value === "string" && value === "")) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, serialize(value));
        }
      } catch {
        // storage full or forbidden
      }
    }, debounce);
    return () => timer.current && clearTimeout(timer.current);
  }, [key, value, debounce, serialize]);

  // Return a clear helper
  function clearDraft() {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  return { clearDraft };
}

function defaultSerialize(v) {
  return typeof v === "string" ? v : JSON.stringify(v);
}
function defaultDeserialize(raw) {
  try {
    // attempt JSON parse; if fails, return raw string
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
