import { useTopicHistory } from "../hooks/useTopicHistory";
import type { TopicPriority } from "../types/db";
import { RetentionTrace } from "./RetentionTrace";
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
  refreshKey,
}: {
  item: TopicPriority;
  tier: PriorityTier;
  onStudy: (item: TopicPriority) => void;
  refreshKey: number;
}) {
  const { retention, events } = useTopicHistory(item.topic_id, refreshKey);

  return (
    <button className={`priority-card priority-card--${tier}`} onClick={() => onStudy(item)}>
      <div className="priority-card__header">
        <SubjectIconBadge subjectName={item.subject_name} tier={tier} size={32} />
        <div className="priority-card__header-text">
          <span className="priority-card__subject">{item.subject_name}</span>
          <span className="priority-card__topic">{item.topic_name}</span>
        </div>
      </div>

      <RetentionTrace retention={retention} events={events} />

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
