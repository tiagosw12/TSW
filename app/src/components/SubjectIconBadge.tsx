import { resolveSubjectIcon } from "../lib/subjectIcon";
import type { PriorityTier } from "./PriorityCard";

export function SubjectIconBadge({
  subjectName,
  icon,
  tier,
  size = 36,
}: {
  subjectName: string;
  icon?: string | null;
  tier: PriorityTier;
  size?: number;
}) {
  const Icon = resolveSubjectIcon(subjectName, icon);
  return (
    <span
      className={`subject-badge subject-badge--${tier}`}
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    >
      <Icon size={Math.round(size * 0.58)} strokeWidth={1.75} />
    </span>
  );
}
