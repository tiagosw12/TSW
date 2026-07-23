import type { PriorityTier } from "./PriorityCard";

export function RetentionBar({ retention, tier }: { retention: number; tier: PriorityTier }) {
  const pct = Math.max(0, Math.min(1, retention)) * 100;
  return (
    <div className="retention-bar" role="img" aria-label={`Retenção estimada ${pct.toFixed(0)}%`}>
      <div className={`retention-bar__fill retention-bar__fill--${tier}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
