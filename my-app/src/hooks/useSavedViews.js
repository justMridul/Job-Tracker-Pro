// src/hooks/useSavedViews.js
// Manage named, user-local saved filter views backed by localStorage.

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * useSavedViews
 * Persist and manage saved filter/query views keyed by a namespace (e.g., "internships").
 *
 * Each view: { id: string, name: string, query: string, createdAt: number, pinned?: boolean }
 *
 * Usage:
 *  const { views, addView, removeView, renameView, togglePin, clearAll, getViewById } =
 *    useSavedViews("internships");
 *
 *  addView({ name: "Remote Open", query: location.search });
 *  navigate(`/internships${views[0].query}`);
 */
export function useSavedViews(namespace, { limit = 30 } = {}) {
  const storageKey = `views:${namespace}`;
  const [views, setViews] = useState(() => read(storageKey, []));

  // Keep in sync with storage (multi-tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === storageKey) {
        setViews(read(storageKey, []));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  const persist = useCallback(
    (next) => {
      setViews(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    },
    [storageKey]
  );

  const addView = useCallback(
    ({ name, query }) => {
      if (!query) return null;
      const id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const v = { id, name: name?.trim() || "Saved view", query, createdAt: Date.now(), pinned: false };
      const next = [v, ...views].slice(0, limit);
      persist(next);
      return v;
    },
    [views, limit, persist]
  );

  const removeView = useCallback(
    (id) => {
      persist(views.filter((v) => v.id !== id));
    },
    [views, persist]
  );

  const renameView = useCallback(
    (id, name) => {
      persist(views.map((v) => (v.id === id ? { ...v, name: name?.trim() || v.name } : v)));
    },
    [views, persist]
  );

  const togglePin = useCallback(
    (id) => {
      persist(
        views
          .map((v) => (v.id === id ? { ...v, pinned: !v.pinned } : v))
          // Keep pinned on top
          .sort((a, b) => (Number(b.pinned) - Number(a.pinned)) || (b.createdAt - a.createdAt))
      );
    },
    [views, persist]
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  const getViewById = useCallback((id) => views.find((v) => v.id === id) || null, [views]);

  const pinned = useMemo(() => views.filter((v) => v.pinned), [views]);
  const unpinned = useMemo(() => views.filter((v) => !v.pinned), [views]);

  return { views, pinned, unpinned, addView, removeView, renameView, togglePin, clearAll, getViewById };
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
