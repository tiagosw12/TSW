import { useMemo } from "react";
import type { TopicRetention } from "../types/db";
import type { ReviewEvent } from "../hooks/useTopicHistory";

const WIDTH = 300;
const HEIGHT = 72;
const BASELINE = HEIGHT - 6;
const AMPLITUDE = HEIGHT - 14;
const WINDOW_DAYS = 30;
const SAMPLES_PER_SEGMENT = 24;

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
 * The rightmost point of the curve always equals retention.estimated_retention
 * exactly, since it's produced by the same R = e^(-t/S) formula the backend
 * uses. Spikes at earlier review events use that event's recorded quality as
 * an illustrative amplitude (we don't have historical stability snapshots to
 * replay precisely) — only the current, present-day leg is authoritative.
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

  const anchors = events.length > 0 ? events.map((e) => new Date(e.performedAt).getTime()) : [lastReviewedAt];
  const qualities = events.length > 0 ? events.map((e) => e.quality) : [1];

  const toX = (t: number) => ((t - windowStart) / (now - windowStart)) * WIDTH;
  const toY = (r: number) => BASELINE - Math.max(0, Math.min(1, r)) * AMPLITUDE;

  const points: Point[] = [];

  // Before the first known review in the window there's no data — draw flat
  // baseline instead of a fabricated "already retained" line.
  if (anchors[0] > windowStart) {
    points.push({ x: 0, y: toY(0) });
    points.push({ x: toX(anchors[0]), y: toY(0) });
  }

  for (let i = 0; i < anchors.length; i++) {
    const segmentStart = anchors[i];
    const segmentEnd = i < anchors.length - 1 ? anchors[i + 1] : now;
    const isFinalSegment = i === anchors.length - 1;
    const amplitude = isFinalSegment ? 1 : qualities[i];

    const steps = SAMPLES_PER_SEGMENT;
    for (let s = 0; s <= steps; s++) {
      const t = segmentStart + ((segmentEnd - segmentStart) * s) / steps;
      if (t < windowStart) continue;
      const elapsedMs = isFinalSegment ? t - lastReviewedAt : t - segmentStart;
      const r = amplitude * Math.exp(-Math.max(0, elapsedMs) / stabilityMs);
      points.push({ x: toX(t), y: toY(r) });
    }
  }

  if (points.length === 0 || points[0].x > 0) {
    points.unshift({ x: 0, y: points[0]?.y ?? BASELINE });
  }
  return points;
}

export function RetentionTrace({
  retention,
  events,
}: {
  retention: TopicRetention | null;
  events: ReviewEvent[];
}) {
  const points = useMemo(() => buildPoints(retention, events), [retention, events]);
  const currentRetention = retention?.estimated_retention ?? 0;
  const strokeColor = colorForRetention(currentRetention);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

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
      <line x1={0} y1={BASELINE} x2={WIDTH} y2={BASELINE} className="retention-trace__baseline" />
      <path d={path} className="retention-trace__path" stroke={strokeColor} />
    </svg>
  );
}
