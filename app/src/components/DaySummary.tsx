import type { TodaySummary } from "../hooks/useTodaySummary";

export function DaySummary({ summary }: { summary: TodaySummary }) {
  return (
    <div className="day-summary">
      <div className="day-summary__tile">
        <div className="day-summary__value">{summary.minutes}min</div>
        <div className="day-summary__label">Hoje</div>
      </div>
      <div className="day-summary__tile">
        <div className="day-summary__value">{summary.sessions}</div>
        <div className="day-summary__label">Sessões</div>
      </div>
      <div className="day-summary__tile">
        <div className="day-summary__value">{summary.quizzes}</div>
        <div className="day-summary__label">Quiz</div>
      </div>
    </div>
  );
}
