// src/hooks/useHotkeys.js
// Lightweight global hotkeys with optional scope and element-safe handling.

import { useEffect, useRef } from "react";

/**
 * useHotkeys
 * Map keys (e.g., '/', 'n', 'g a') to handlers. Ignores when typing inside inputs by default.
 *
 * Usage:
 *  useHotkeys({
 *    "/": () => searchRef.current?.focus(),
 *    "n": () => openCreateModal(),
 *    "g a": () => navigate("/applications"), // chord: press 'g' then 'a'
 *  });
 *
 * Options:
 *  - enabled: boolean (default true)
 *  - target: EventTarget (default window)
 *  - ignoreInput: boolean (default true) // skip when typing in input/textarea/select/contentEditable
 *  - timeout: number (ms, default 800)   // chord timeout for sequences like "g a"
 */
export function useHotkeys(
  map = {},
  { enabled = true, target = typeof window !== "undefined" ? window : null, ignoreInput = true, timeout = 800 } = {}
) {
  const seqRef = useRef([]);
  const tRef = useRef(null);

  useEffect(() => {
    if (!enabled || !target) return;

    function isEditable(el) {
      if (!ignoreInput) return false;
      if (!el) return false;
      const tag = el.tagName;
      const editable = el.getAttribute && el.getAttribute("contenteditable");
      return (
        editable === "true" ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.closest?.("[contenteditable='true']")
      );
    }

    function clearSeq() {
      seqRef.current = [];
      if (tRef.current) {
        clearTimeout(tRef.current);
        tRef.current = null;
      }
    }

    function scheduleClear() {
      if (tRef.current) clearTimeout(tRef.current);
      tRef.current = setTimeout(clearSeq, timeout);
    }

    function onKeydown(e) {
      if (!enabled) return;
      const key = normalizeKey(e);
      if (!key) return;

      if (isEditable(e.target)) {
        // Allow basic editing keys; ignore hotkeys while typing
        return;
      }

      // Direct single-key handler
      const single = map[key];
      if (typeof single === "function") {
        e.preventDefault();
        single(e);
        clearSeq();
        return;
      }

      // Chords: accumulate and check "g a" style mappings
      seqRef.current.push(key);
      const seqStr = seqRef.current.join(" ");
      const chordHandler = map[seqStr];
      scheduleClear();

      // If exact match, invoke
      if (typeof chordHandler === "function") {
        e.preventDefault();
        chordHandler(e);
        clearSeq();
        return;
      }

      // If no mapping starts with current sequence, reset
      const hasPrefix = Object.keys(map).some((k) => k.startsWith(seqStr + " "));
      if (!hasPrefix) {
        // Try treating the last key as a single mapping
        seqRef.current = [key];
        const lastSingle = map[key];
        if (typeof lastSingle === "function") {
          e.preventDefault();
          lastSingle(e);
          clearSeq();
          return;
        }
        clearSeq();
      }
    }

    target.addEventListener("keydown", onKeydown);
    return () => {
      target.removeEventListener("keydown", onKeydown);
      clearSeq();
    };
  }, [map, enabled, target, ignoreInput, timeout]);
}

function normalizeKey(e) {
  // Normalize to lower-case printable keys; map modifiers
  if (e.metaKey || e.ctrlKey || e.altKey) return null; // extend if you want combos
  const k = e.key;
  if (!k) return null;
  const key = k.length === 1 ? k.toLowerCase() : k.toLowerCase();
  // Skip non-action keys
  const ignore = ["shift", "meta", "control", "alt", "capslock", "tab"];
  if (ignore.includes(key)) return null;
  return key;
}
