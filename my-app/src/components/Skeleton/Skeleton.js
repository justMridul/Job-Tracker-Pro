// src/components/Skeleton/Skeleton.jsx
import React from "react";
import "./skeleton.css";

/**
 * Versatile Skeleton components for loading placeholders.
 *
 * Usage:
 *  - <SkeletonLine width="60%" />
 *  - <SkeletonRect height={180} />
 *  - <SkeletonCircle size={48} />
 *  - <SkeletonList count={5} />
 *
 * Props (common):
 *  - className: string (extra classes)
 *  - style: React.CSSProperties
 *  - animate: boolean (default true) — disable shimmer if false
 *
 * Props (by component):
 *  - SkeletonLine: width (string|number), height (number, default 12), radius
 *  - SkeletonRect: width (string|number, default 100%), height (number), radius
 *  - SkeletonCircle: size (number)
 *  - SkeletonList: count (number), itemHeight (number), gap (number)
 */

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

export function SkeletonLine({
  width = "100%",
  height = 12,
  radius = 8,
  animate = true,
  className,
  style,
}) {
  return (
    <span
      className={cx("skel", "skel-line", animate && "skel-anim", className)}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonRect({
  width = "100%",
  height = 120,
  radius = 12,
  animate = true,
  className,
  style,
}) {
  return (
    <div
      className={cx("skel", "skel-rect", animate && "skel-anim", className)}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCircle({
  size = 40,
  animate = true,
  className,
  style,
}) {
  return (
    <div
      className={cx("skel", "skel-circle", animate && "skel-anim", className)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonList({
  count = 3,
  itemHeight = 14,
  gap = 10,
  animate = true,
  className,
  style,
}) {
  const items = Array.from({ length: count });
  return (
    <div className={cx("skel-list", className)} style={{ gap, ...style }} aria-hidden="true">
      {items.map((_, i) => (
        <SkeletonLine key={i} height={itemHeight} width={`${90 - i * 6}%`} animate={animate} />
      ))}
    </div>
  );
}

/**
 * Composite card skeleton example (optional helper).
 * Use as a drop-in for list cards while loading.
 */
export function SkeletonCard({
  avatar = true,
  lines = 3,
  media = false,
  className,
  style,
}) {
  return (
    <div className={cx("skel-card", className)} style={style} aria-hidden="true">
      <div className="skel-card__head">
        {avatar && <SkeletonCircle size={40} />}
        <div className="skel-card__titles">
          <SkeletonLine width="60%" height={12} />
          <SkeletonLine width="38%" height={10} />
        </div>
      </div>
      {media && <SkeletonRect height={140} style={{ marginTop: 12 }} />}
      <div className="skel-card__body">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} height={12} width={`${92 - i * 8}%`} />
        ))}
      </div>
      <div className="skel-card__footer">
        <SkeletonLine width={80} height={28} radius={10} />
        <SkeletonLine width={110} height={28} radius={10} />
      </div>
    </div>
  );
}

export default SkeletonRect;
