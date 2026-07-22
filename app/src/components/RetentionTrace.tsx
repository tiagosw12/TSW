import { useId, useMemo } from "react";
import type { TopicRetention } from "../types/db";

const WIDTH = 300;
const HEIGHT = 44;
const BASELINE = HEIGHT - 4;
const AMPLITUDE = HEIGHT - 10;
const SAMPLES = 60;

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
 * A single continuous R = e^(-t/S) curve spanning the whole width, from the
 * moment of the last review (t=0, r=1, left edge) to now (t=days_since_review,
 * r=estimated_retention, right edge) — sampled at many intermediate points so
 * the decay reads as a smooth curve rather than two endpoints joined by a
 * straight line.
 */
function buildPoints(retention: TopicRetention | null): Point[] {
  const toY = (r: number) => BASELINE - Math.max(0, Math.min(1, r)) * AMPLITUDE;

  if (!retention) {
    return [
      { x: 0, y: BASELINE },
      { x: WIDTH, y: BASELINE },
    ];
  }

  const stabilityDays = Math.max(retention.stability_days, 0.25);
  const totalDays = Math.max(retention.days_since_review, 0);

  const points: Point[] = [];
  for (let s = 0; s <= SAMPLES; s++) {
    const elapsedDays = (totalDays * s) / SAMPLES;
    const r = Math.exp(-elapsedDays / stabilityDays);
    points.push({ x: (WIDTH * s) / SAMPLES, y: toY(r) });
  }
  return points;
}

export function RetentionTrace({ retention }: { retention: TopicRetention | null }) {
  const gradientId = useId();
  const points = useMemo(() => buildPoints(retention), [retention]);
  const currentRetention = retention?.estimated_retention ?? 0;
  const strokeColor = colorForRetention(currentRetention);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${path} L${WIDTH},${BASELINE} L0,${BASELINE} Z`;

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
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path d={path} className="retention-trace__path" stroke={strokeColor} />
    </svg>
  );
}
