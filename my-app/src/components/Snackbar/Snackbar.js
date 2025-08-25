// src/components/Snackbar/Snackbar.jsx
import React, { useEffect, useRef, useState } from "react";
import "./snackbar.css";

/**
 * Snackbar - Toast with action (e.g., Undo), queued messages, and auto-dismiss.
 *
 * Usage:
 *  <SnackbarProvider>
 *    <App />
 *  </SnackbarProvider>
 *
 * In any component:
 *  const { push } = useSnackbar();
 *  push({
 *    message: "Item deleted",
 *    actionText: "Undo",
 *    duration: 5000,
 *    onAction: () => undoDelete(),
 *  });
 *
 * Props (for push):
 *  - message: string | ReactNode
 *  - actionText?: string
 *  - onAction?: () => void | Promise<void>
 *  - duration?: number (ms, default 4000); set 0 to require manual close
 *  - variant?: "default" | "success" | "error" | "warning"
 *  - id?: string (optional custom id)
 */

const SnackbarContext = React.createContext(null);

export function SnackbarProvider({ children, max = 2, position = "bottom-center" }) {
  const [queue, setQueue] = useState([]); // pending items
  const [active, setActive] = useState([]); // currently displayed (max N)
  const idRef = useRef(0);

  function nextId() {
    idRef.current += 1;
    return `snack_${idRef.current}`;
  }

  const push = (item) => {
    const id = item.id || nextId();
    setQueue((q) => [...q, { id, ...defaults(item) }]);
    return id;
  };

  const close = (id) => {
    setActive((arr) => arr.filter((s) => s.id !== id));
  };

  // Promote from queue to active up to max
  useEffect(() => {
    if (active.length >= max || queue.length === 0) return;
    const toFill = Math.max(0, max - active.length);
    const next = queue.slice(0, toFill);
    if (next.length) {
      setActive((a) => [...a, ...next]);
      setQueue((q) => q.slice(next.length));
    }
  }, [queue, active, max]);

  const ctx = { push, close };

  return (
    <SnackbarContext.Provider value={ctx}>
      {children}
      <SnackStack items={active} onClose={close} position={position} />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = React.useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
  return ctx;
}

function defaults(item) {
  return {
    message: "",
    actionText: undefined,
    onAction: undefined,
    duration: 4000,
    variant: "default",
    ...item,
  };
}

function SnackStack({ items, onClose, position }) {
  return (
    <div className={`snack-stack snack-${position}`}>
      {items.map((snack) => (
        <Snack key={snack.id} {...snack} onClose={() => onClose(snack.id)} />
      ))}
    </div>
  );
}

function Snack({ message, actionText, onAction, duration, variant = "default", onClose }) {
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef(null);
  const hoveredRef = useRef(false);
  const remainingRef = useRef(duration);
  const lastTickRef = useRef(null);

  // Auto-dismiss timer with hover pause
  useEffect(() => {
    if (!duration || duration <= 0) return undefined;

    // start timer
    lastTickRef.current = performance.now();
    startTimer();

    // cleanup
    return () => {
      stopTimer();
    };
    // We intentionally depend only on `duration`.
    // Other values are refs or stable function identities.
    // eslint-disable-next-line
  }, [duration]);

  function startTimer() {
    stopTimer();
    timerRef.current = requestAnimationFrame(tick);
  }
  function stopTimer() {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    timerRef.current = null;
  }
  function tick(now) {
    if (!hoveredRef.current) {
      const dt = now - lastTickRef.current;
      remainingRef.current -= dt;
      lastTickRef.current = now;
      if (remainingRef.current <= 0) {
        handleClose();
        return;
      }
    } else {
      // keep time base in sync while paused
      lastTickRef.current = now;
    }
    timerRef.current = requestAnimationFrame(tick);
  }

  function handleMouseEnter() {
    hoveredRef.current = true;
  }
  function handleMouseLeave() {
    hoveredRef.current = false;
    if (duration && duration > 0 && !timerRef.current) startTimer();
  }

  async function handleAction() {
    try {
      if (onAction) await onAction();
    } finally {
      handleClose();
    }
  }

  function handleClose() {
    setLeaving(true);
    setTimeout(() => onClose?.(), 200);
  }

  return (
    <div
      className={`snack ${leaving ? "snack-leave" : "snack-enter"} snack-${variant}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="status"
      aria-live="polite"
    >
      <div className="snack-body">
        <span className="snack-msg">{message}</span>
        <div className="snack-actions">
          {actionText && (
            <button className="snack-btn snack-action" onClick={handleAction}>
              {actionText}
            </button>
          )}
          <button className="snack-btn snack-close" onClick={handleClose} aria-label="Dismiss">
            ✕
          </button>
        </div>
      </div>
      {duration > 0 && <ProgressBar remainingRef={remainingRef} total={duration} paused={hoveredRef} />}
    </div>
  );
}

function ProgressBar({ remainingRef, total, paused }) {
  const [pct, setPct] = useState(100);

  useEffect(() => {
    let raf;
    const loop = () => {
      const v = Math.max(0, Math.min(1, remainingRef.current / total));
      setPct(v * 100);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
    // remainingRef is a mutable ref; we intentionally only depend on `total`
    // to avoid unnecessary re-subscribes.
    // eslint-disable-next-line
  }, [total]);

  return (
    <div className="snack-progress">
      <div className="snack-progress-bar" style={{ width: `${pct}%`, opacity: paused.current ? 0.5 : 1 }} />
    </div>
  );
}

export default SnackbarProvider;
