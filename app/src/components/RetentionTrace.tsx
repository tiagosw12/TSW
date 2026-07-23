import { useId, useMemo } from "react";
import type { TopicRetention } from "../types/db";
import type { ReviewEvent } from "../hooks/useTopicHistory";

const WIDTH = 300;
const HEIGHT = 72;
const BASELINE = HEIGHT - 6;
const AMPLITUDE = HEIGHT - 14;
const WINDOW_DAYS = 30;
const SAMPLES = 80;

// Colors follow the same value the number does: near-1 retention reads as a
// healthy trace, near-0 reads as the trace flattening out — a monitor
// "flatline" is a literal stand-in for "forgotten", not a decoration.
function colorForRetention(r: number) {
  const clamped = Math.max(0, Math.min(1, r));
  if (clamped > 0.55) return "var(--accent-trace)";
  if (clamped > 0.25) return "var(--accent-warn)";
  return "var(--accent-critical)";
}

interface Point {
  x: number;
  y: number;
}

/**
 * Each review (past events, or just last_reviewed_at when there's no event
 * history) contributes a smooth bump: retention decays exponentially away
 * from that review in *both* directions — R = e^(-|t - review| / S) — since
 * we don't have a real snapshot of what retention looked like before an
 * earlier review, decaying outward symmetrically is the least-fabricated
 * shape that's still a single continuous curve. The rendered value at each
 * point in time is the envelope (pointwise max) across all bumps, so nearby
 * reviews blend into one hump instead of resetting with a vertical jump.
 *
 * The rightmost sample is always forced to retention.estimated_retention
 * exactly, since that's the same R = e^(-t/S) formula the backend uses for
 * "now" — everything else is illustrative, but the current value is
 * authoritative.
 */
function buildPoints(retention: TopicRetention | null, events: ReviewEvent[]): Point[] {
  const now = Date.now();
  const windowStart = now - WINDOW_DAYS * 86_400_000;

  if (!retention) {
    return [
      { x: 0, y: BASELINE },
      { x: WIDTH, y: BASELINE },
    ];
  }

  const stabilityMs = Math.max(retention.stability_days, 0.25) * 86_400_000;
  const lastReviewedAt = new Date(retention.last_reviewed_at).getTime();

  const bumps = [
    ...events.map((e) => ({ time: new Date(e.performedAt).getTime(), amplitude: e.quality })),
    { time: lastReviewedAt, amplitude: 1 },
  ];

  const toX = (t: number) => ((t - windowStart) / (now - windowStart)) * WIDTH;
  const toY = (r: number) => BASELINE - Math.max(0, Math.min(1, r)) * AMPLITUDE;

  const points: Point[] = [];
  for (let s = 0; s <= SAMPLES; s++) {
    const t = windowStart + ((now - windowStart) * s) / SAMPLES;
    let r = 0;
    for (const bump of bumps) {
      const candidate = bump.amplitude * Math.exp(-Math.abs(t - bump.time) / stabilityMs);
      if (candidate > r) r = candidate;
    }
    points.push({ x: toX(t), y: toY(r) });
  }
  points[points.length - 1] = { x: WIDTH, y: toY(retention.estimated_retention) };

  return points;
}

/** Catmull-Rom through the sampled points, converted to cubic Bézier segments. */
function smoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length < 3) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  }

  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export function RetentionTrace({
  retention,
  events,
}: {
  retention: TopicRetention | null;
  events: ReviewEvent[];
}) {
  const rawId = useId();
  const gradientId = `retention-gradient-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const points = useMemo(() => buildPoints(retention, events), [retention, events]);
  const currentRetention = retention?.estimated_retention ?? 0;
  const strokeColor = colorForRetention(currentRetention);
  const linePath = useMemo(() => smoothPath(points), [points]);
  const areaPath =
    points.length > 0
      ? `${linePath} L${WIDTH},${BASELINE.toFixed(1)} L${points[0].x.toFixed(1)},${BASELINE.toFixed(1)} Z`
      : "";

  return (
    <svg
      className="retention-trace"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={
        retention
          ? `Retenção estimada ${(currentRetention * 100).toFixed(0)}%`
          : "Sem histórico de estudo registrado"
      }
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={0} y1={BASELINE} x2={WIDTH} y2={BASELINE} className="retention-trace__baseline" />
      {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
      <path d={linePath} className="retention-trace__path" stroke={strokeColor} fill="none" />
    </svg>
  );
}
