import type { TopicPriority } from "../types/db";
import { RetentionBar } from "./RetentionBar";
import { SubjectIconBadge } from "./SubjectIconBadge";

export type PriorityTier = "critical" | "moderate" | "low";

export function tierFor(priority: number, maxPriority: number): PriorityTier {
  if (maxPriority <= 0) return "low";
  const normalized = priority / maxPriority;
  if (normalized >= 0.66) return "critical";
  if (normalized >= 0.33) return "moderate";
  return "low";
}

export function PriorityCard({
  item,
  tier,
  onStudy,
}: {
  item: TopicPriority;
  tier: PriorityTier;
  onStudy: (item: TopicPriority) => void;
}) {
  return (
    <button className={`priority-card priority-card--${tier}`} onClick={() => onStudy(item)}>
      <div className="priority-card__header">
        <SubjectIconBadge subjectName={item.subject_name} icon={item.subject_icon} tier={tier} size={32} />
        <div className="priority-card__header-text">
          <span className="priority-card__subject">{item.subject_name}</span>
          <span className="priority-card__topic">{item.topic_name}</span>
        </div>
      </div>

      <RetentionBar retention={item.estimated_retention} tier={tier} />

      <div className="priority-card__meta">
        <span>Retenção {(item.estimated_retention * 100).toFixed(0)}%</span>
        {item.nearest_exam_name && item.days_to_nearest_exam !== null ? (
          <span className="priority-card__exam">
            {item.nearest_exam_name} · {formatDaysLabel(item.days_to_nearest_exam)}
          </span>
        ) : (
          <span className="priority-card__exam priority-card__exam--none">sem prova vinculada</span>
        )}
      </div>
    </button>
  );
}

function formatDaysLabel(days: number) {
  if (days <= 0) return "hoje";
  if (days === 1) return "amanhã";
  return `em ${days} dias`;
}
