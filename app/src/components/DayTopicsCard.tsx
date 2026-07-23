import { GraduationCap } from "lucide-react";
import type { TopicPriorityByDay } from "../types/db";
import { SubjectIconBadge } from "./SubjectIconBadge";
import { tierFor, type PriorityTier } from "./PriorityCard";

const TIER_LABEL: Record<PriorityTier, string> = {
  critical: "urgente",
  moderate: "atenção",
  low: "em dia",
};

export function DayTopicsCard({
  items,
  maxPriority,
}: {
  items: TopicPriorityByDay[];
  maxPriority: number;
}) {
  if (items.length === 0) return null;

  const [top, ...rest] = items;
  const topTier = tierFor(top.priority, maxPriority);
  const examName = items.find((item) => item.nearest_exam_id !== null)?.nearest_exam_name;

  return (
    <div className={`priority-card priority-card--${topTier} ${examName ? "day-card--exam" : ""}`}>
      {examName && (
        <div className="day-card__exam-banner">
          <GraduationCap size={16} strokeWidth={1.75} />
          <span>Vinculado à prova · {examName}</span>
        </div>
      )}

      <div className="priority-card__header">
        <SubjectIconBadge subjectName={top.subject_name} tier={topTier} size={36} />
        <div className="priority-card__header-text">
          <span className="priority-card__subject">{top.subject_name}</span>
          <span className="priority-card__topic">{top.topic_name}</span>
        </div>
        <span className={`chip chip--${topTier}`}>{TIER_LABEL[topTier]}</span>
      </div>

      {rest.length > 0 && (
        <div className="day-card__rest">
          {rest.map((item, index) => {
            const rowTier = tierFor(item.priority, maxPriority);
            return (
              <div className="day-card__row" key={item.topic_id}>
                <SubjectIconBadge subjectName={item.subject_name} tier={rowTier} size={22} />
                <span className="day-card__row-text">
                  {item.subject_name} · {item.topic_name}
                </span>
                <span className="chip chip--rank">{index + 2}º lugar</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
