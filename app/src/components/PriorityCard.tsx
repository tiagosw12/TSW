import { useTopicHistory } from "../hooks/useTopicHistory";
import type { TopicPriority } from "../types/db";
import { RetentionTrace } from "./RetentionTrace";
import { iconForKey } from "../lib/subjectIcons";

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
  icon,
  onStudy,
  refreshKey,
}: {
  item: TopicPriority;
  tier: PriorityTier;
  icon: string;
  onStudy: (item: TopicPriority) => void;
  refreshKey: number;
}) {
  const { retention } = useTopicHistory(item.topic_id, refreshKey);
  const Icon = iconForKey(icon);

  return (
    <button className="priority-card" onClick={() => onStudy(item)}>
      <div className={`subject-icon subject-icon--${tier} priority-card__icon`}>
        <Icon size={22} strokeWidth={2.25} color="#fff" />
      </div>

      <div className="priority-card__body">
        <div className="priority-card__header">
          <span className="priority-card__subject">{item.subject_name}</span>
          <span className="priority-card__topic">{item.topic_name}</span>
        </div>

        <RetentionTrace retention={retention} />

        <div className="priority-card__meta">
          <span>
            Retenção <strong>{(item.estimated_retention * 100).toFixed(0)}%</strong>
          </span>
          {item.nearest_exam_name && item.days_to_nearest_exam !== null ? (
            <span className="priority-card__exam">
              {item.nearest_exam_name} · {formatDaysLabel(item.days_to_nearest_exam)}
            </span>
          ) : (
            <span className="priority-card__exam priority-card__exam--none">sem prova vinculada</span>
          )}
        </div>
      </div>
    </button>
  );
}

function formatDaysLabel(days: number) {
  if (days <= 0) return "hoje";
  if (days === 1) return "amanhã";
  return `em ${days} dias`;
}
