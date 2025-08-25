// src/components/Tags/TagInput.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./tagInput.css";

/**
 * TagInput - Lightweight, accessible tag editor with color labels.
 *
 * Features
 * - Enter/Comma to add, Backspace to delete last when input empty.
 * - Deduplication, trim/normalize, max length per tag, optional max tags.
 * - Color labels: "default" | "blue" | "green" | "yellow" | "red" | "purple" | "teal".
 * - Paste multiple tags separated by commas or newlines.
 * - Keyboard: Left/Right to navigate tags, Delete/Backspace to remove focused.
 *
 * Props
 * - value: Array<{ id?: string; text: string; color?: string }>
 * - onChange: (tags) => void
 * - placeholder?: string
 * - colors?: string[] (available color names)
 * - maxTags?: number
 * - maxLength?: number (per tag)
 * - allowDuplicates?: boolean (default false)
 * - readOnly?: boolean
 * - disabled?: boolean
 * - className?: string
 * - style?: React.CSSProperties
 *
 * Example
 *  const [tags, setTags] = useState([{ text: "remote", color: "green" }]);
 *  <TagInput value={tags} onChange={setTags} />
 */

const DEFAULT_COLORS = ["default", "blue", "green", "yellow", "red", "purple", "teal"];

export default function TagInput({
  value = [],
  onChange,
  placeholder = "Add a tag and press Enter",
  colors = DEFAULT_COLORS,
  maxTags,
  maxLength = 28,
  allowDuplicates = false,
  readOnly = false,
  disabled = false,
  className,
  style,
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // keyboard focus for tags
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  // Normalize tags: trim and collapse whitespace
  const normalized = useMemo(() => value.map((t) => ({ ...t, text: norm(t.text) })).filter((t) => t.text), [value]);

  useEffect(() => {
    // Keep activeIndex within bounds
    if (activeIndex >= normalized.length) setActiveIndex(-1);
  }, [normalized.length, activeIndex]);

  function addTag(raw) {
    const parts = splitToTags(raw);
    if (!parts.length) return;
    let next = [...normalized];

    for (let p of parts) {
      let txt = sanitize(p, maxLength);
      if (!txt) continue;
      if (!allowDuplicates && next.some((t) => t.text.toLowerCase() === txt.toLowerCase())) continue;
      if (maxTags && next.length >= maxTags) break;
      next.push({ text: txt, color: pickColor(txt, colors) });
    }
    if (onChange) onChange(next);
    setInput("");
    setActiveIndex(-1);
  }

  function removeTagAt(i) {
    if (i < 0 || i >= normalized.length) return;
    const next = normalized.slice(0, i).concat(normalized.slice(i + 1));
    onChange?.(next);
    setActiveIndex(Math.min(i, next.length - 1));
  }

  function updateColor(i, color) {
    const next = normalized.map((t, idx) => (idx === i ? { ...t, color } : t));
    onChange?.(next);
  }

  function onKeyDown(e) {
    if (readOnly || disabled) return;

    // Add on Enter or Comma
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addTag(input);
      return;
    }

    // Backspace to delete last when input empty
    if (e.key === "Backspace" && input.length === 0 && normalized.length) {
      e.preventDefault();
      removeTagAt(normalized.length - 1);
      return;
    }

    // Arrow navigation through tags when input is empty
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && input.length === 0 && normalized.length) {
      e.preventDefault();
      const dir = e.key === "ArrowLeft" ? -1 : 1;
      const next = clampIndex((activeIndex === -1 ? normalized.length : activeIndex) + dir, normalized.length);
      setActiveIndex(next);
      focusTag(next);
      return;
    }

    // Delete/Backspace on focused tag
    if ((e.key === "Delete" || e.key === "Backspace") && activeIndex >= 0) {
      e.preventDefault();
      removeTagAt(activeIndex);
      return;
    }
  }

  function onPaste(e) {
    if (readOnly || disabled) return;
    const text = e.clipboardData.getData("text");
    if (text && (text.includes(",") || text.includes("\n"))) {
      e.preventDefault();
      addTag(text);
    }
  }

  function focusInput() {
    inputRef.current?.focus();
    setActiveIndex(-1);
  }

  function focusTag(i) {
    // Accessibility: move focus to wrapper; visual ring shows on the tag
    wrapRef.current?.focus({ preventScroll: true });
  }

  return (
    <div
      className={["tag-input", focused ? "is-focused" : "", disabled ? "is-disabled" : "", className].filter(Boolean).join(" ")}
      style={style}
      onClick={focusInput}
    >
      <div
        className="tag-input__wrap"
        tabIndex={-1}
        ref={wrapRef}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {normalized.map((tag, i) => (
          <TagPill
            key={`${tag.text}:${i}`}
            text={tag.text}
            color={tag.color}
            active={i === activeIndex}
            readOnly={readOnly}
            disabled={disabled}
            colors={colors}
            onRemove={() => removeTagAt(i)}
            onColorChange={(c) => updateColor(i, c)}
          />
        ))}

        <input
          ref={inputRef}
          className="tag-input__field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={normalized.length === 0 ? placeholder : ""}
          disabled={disabled || readOnly || (maxTags && normalized.length >= maxTags)}
          maxLength={Math.max(8, maxLength)}
          aria-label="Add tag"
        />
      </div>

      {maxTags && (
        <div className="tag-input__meta" aria-hidden="true">
          {normalized.length}/{maxTags}
        </div>
      )}
    </div>
  );
}

function TagPill({ text, color = "default", active, readOnly, disabled, colors, onRemove, onColorChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!btnRef.current) return;
      if (!btnRef.current.parentElement.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  return (
    <span className={["tag-pill", `tag-${color}`, active ? "tag-active" : ""].join(" ")} role="listitem">
      <span className="tag-text">{text}</span>

      {!readOnly && !disabled && (
        <>
          <button
            ref={btnRef}
            type="button"
            className="tag-color-btn"
            title="Change color"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((s) => !s);
            }}
          />
          {open && (
            <div className="tag-color-pop">
              {colors.map((c) => (
                <button
                  key={c}
                  className={`tag-color-swatch tag-${c}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(false);
                    onColorChange?.(c);
                  }}
                  title={c}
                />
              ))}
            </div>
          )}
          <button type="button" className="tag-remove" aria-label="Remove tag" onClick={onRemove}>
            ✕
          </button>
        </>
      )}
    </span>
  );
}

/* Helpers */
function sanitize(s, max) {
  return norm(s).slice(0, max);
}
function norm(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}
function splitToTags(s) {
  if (!s) return [];
  return s
    .split(/[,;\n]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}
function clampIndex(i, n) {
  return Math.max(-1, Math.min(n - 1, i));
}
function pickColor(txt, palette) {
  if (!palette?.length) return "default";
  // deterministic hash to color
  let h = 0;
  for (let i = 0; i < txt.length; i++) h = (h * 31 + txt.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % palette.length;
  return palette[idx];
}
