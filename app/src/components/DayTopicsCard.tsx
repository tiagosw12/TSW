import { GraduationCap } from "lucide-react";
import type { TopicPriorityByDay } from "../types/db";
import { subjectIcon } from "../lib/subjectIcon";
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
  const tier = tierFor(top.priority, maxPriority);
  const TopIcon = subjectIcon(top.subject_name);
  const examName = items.find((item) => item.nearest_exam_id !== null)?.nearest_exam_name;

  return (
    <div className={`day-card day-card--${tier} ${examName ? "day-card--exam" : ""}`}>
      {examName && (
        <div className="day-card__exam-banner">
          <GraduationCap size={16} strokeWidth={1.75} />
          <span>Vinculado à prova · {examName}</span>
        </div>
      )}

      <div className="day-card__top">
        <TopIcon size={36} strokeWidth={1.75} className="day-card__top-icon" />
        <div className="day-card__top-text">
          <span className="day-card__top-subject">{top.subject_name}</span>
          <span className="day-card__top-topic">{top.topic_name}</span>
        </div>
        <span className={`chip chip--${tier}`}>{TIER_LABEL[tier]}</span>
      </div>

      {rest.length > 0 && (
        <div className="day-card__rest">
          {rest.map((item, index) => {
            const RowIcon = subjectIcon(item.subject_name);
            return (
              <div className="day-card__row" key={item.topic_id}>
                <RowIcon size={18} strokeWidth={1.75} className="day-card__row-icon" />
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
