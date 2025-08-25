// src/components/Tour/Tour.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./tour.css";

/**
 * Lightweight, dependency-free onboarding tour.
 *
 * Props:
 * - steps: Array<{ id?: string, title: string, body: string, target?: string, placement?: 'top'|'bottom'|'left'|'right', offset?: number }>
 *    - target: optional CSS selector for the element to highlight (e.g., '[data-tour="create"]')
 *    - placement: preferred popover side relative to target
 *    - offset: extra pixels to offset from target
 * - visible: boolean
 * - onClose: () => void
 *
 * Notes:
 * - If target is not found or omitted, the step renders centered as a modal card.
 * - Esc or clicking the backdrop closes the tour.
 * - Arrow keys (← →) navigate steps.
 */
export default function Tour({ steps = [], visible = false, onClose }) {
  const [index, setIndex] = useState(0);
  const [coords, setCoords] = useState(null);
  const [highlightRect, setHighlightRect] = useState(null);
  const cardRef = useRef(null);

  const step = steps[index];

  // Compute target position on mount/resize/step change
  useEffect(() => {
    if (!visible || !step) return;
    const update = () => {
      if (step.target) {
        const el = document.querySelector(step.target);
        if (el) {
          const r = el.getBoundingClientRect();
          setHighlightRect({
            x: r.x + window.scrollX,
            y: r.y + window.scrollY,
            w: r.width,
            h: r.height,
          });
          setCoords(placePopover(r, step.placement || "bottom", step.offset || 12));
          return;
        }
      }
      // Fallback: centered card
      setHighlightRect(null);
      setCoords(null);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [visible, step]);

  // Reset index when hidden
  useEffect(() => {
    if (!visible) setIndex(0);
  }, [visible]);

  // Keyboard controls
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, index]);

  const atStart = index === 0;
  const atEnd = index === steps.length - 1;

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }
  function next() {
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  }

  const styleCard = useMemo(() => {
    if (!coords) return {};
    return { top: `${coords.top + window.scrollY}px`, left: `${coords.left + window.scrollX}px` };
  }, [coords]);

  if (!visible || !step) return null;

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true">
      <div className="tour-backdrop" onClick={onClose} />

      {/* Spotlight highlight */}
      {highlightRect && (
        <div
          className="tour-spotlight"
          style={{
            "--tour-x": `${highlightRect.x}px`,
            "--tour-y": `${highlightRect.y}px`,
            "--tour-w": `${highlightRect.w}px`,
            "--tour-h": `${highlightRect.h}px`,
          }}
        />
      )}

      {/* Popover card */}
      <div
        ref={cardRef}
        className={`tour-card ${coords ? "tour-card--popover" : "tour-card--center"}`}
        style={coords ? styleCard : undefined}
        data-placement={step.placement || "bottom"}
      >
        <div className="tour-header">
          <span className="tour-step">{index + 1} / {steps.length}</span>
          <button className="tour-close" onClick={onClose} aria-label="Close tour">✕</button>
        </div>

        <h3 className="tour-title">{step.title}</h3>
        {step.body && <p className="tour-body">{step.body}</p>}

        <div className="tour-actions">
          <button className="tour-btn ghost" onClick={onClose}>Skip</button>
          <div className="tour-nav">
            <button className="tour-btn" onClick={prev} disabled={atStart} aria-label="Previous step">←</button>
            <button className="tour-btn primary" onClick={atEnd ? onClose : next}>
              {atEnd ? "Done" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compute a reasonable popover position relative to a rect.
 */
function placePopover(rect, placement, offset) {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const margin = offset;

  let top = 0;
  let left = 0;

  switch (placement) {
    case "top":
      top = Math.max(12, rect.top - margin);
      left = Math.min(Math.max(12, centerX - 220), vw - 12 - 440);
      break;
    case "left":
      top = Math.min(Math.max(12, centerY - 120), vh - 12 - 240);
      left = Math.max(12, rect.left - margin - 420);
      break;
    case "right":
      top = Math.min(Math.max(12, centerY - 120), vh - 12 - 240);
      left = Math.min(rect.right + margin, vw - 12 - 420);
      break;
    case "bottom":
    default:
      top = Math.min(rect.bottom + margin, vh - 12 - 240);
      left = Math.min(Math.max(12, centerX - 220), vw - 12 - 440);
      break;
  }
  return { top: Math.max(12, top), left: Math.max(12, left) };
}
