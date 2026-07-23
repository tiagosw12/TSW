import { useMemo, useState } from "react";
import { useTopicPrioritiesByRange } from "../hooks/useTopicPrioritiesByRange";
import { DayTopicsCard } from "../components/DayTopicsCard";
import { ViewSwitcher } from "../components/ViewSwitcher";
import { tierFor } from "../components/PriorityCard";

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date) {
  return toKey(a) === toKey(b);
}

export function CalendarScreen() {
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const monthStart = useMemo(() => startOfMonth(monthAnchor), [monthAnchor]);
  const monthEnd = useMemo(() => endOfMonth(monthAnchor), [monthAnchor]);

  const { byDay, loading, error } = useTopicPrioritiesByRange(monthStart, monthEnd);

  const globalMaxPriority = useMemo(() => {
    let max = 0;
    for (const list of Object.values(byDay)) {
      for (const item of list) max = Math.max(max, item.priority);
    }
    return max;
  }, [byDay]);

  const gridCells = useMemo(() => {
    const firstWeekday = monthStart.getDay();
    const totalDays = monthEnd.getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= totalDays; day++) {
      cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
    }
    return cells;
  }, [monthStart, monthEnd]);

  function changeMonth(delta: number) {
    const next = new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1);
    setMonthAnchor(next);
    setSelectedDay(next);
  }

  const selectedKey = toKey(selectedDay);
  const selectedItems = byDay[selectedKey] ?? [];

  return (
    <div className="home">
      <header className="home__header">
        <div>
          <p className="home__eyebrow">planejamento</p>
          <h1 className="home__title">Calendário</h1>
        </div>
      </header>

      <ViewSwitcher />

      <div className="calendar__nav">
        <button className="icon-button" onClick={() => changeMonth(-1)} aria-label="Mês anterior">
          ‹
        </button>
        <span className="calendar__month-label">
          {monthStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </span>
        <button className="icon-button" onClick={() => changeMonth(1)} aria-label="Próximo mês">
          ›
        </button>
      </div>

      <div className="calendar__weekdays">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="calendar__weekday">
            {label}
          </span>
        ))}
      </div>

      <div className="calendar__grid">
        {gridCells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} className="calendar__day-cell calendar__day-cell--empty" />;
          const key = toKey(date);
          const items = byDay[key] ?? [];
          const top = items[0];
          const tier = top ? tierFor(top.priority, globalMaxPriority) : null;
          const hasExam = items.some((item) => item.nearest_exam_id !== null);
          const selected = isSameDay(date, selectedDay);
          return (
            <button
              key={key}
              className={`calendar__day-cell ${selected ? "calendar__day-cell--selected" : ""}`}
              onClick={() => setSelectedDay(date)}
            >
              <span className="calendar__day-number">{date.getDate()}</span>
              {tier && <span className={`calendar__day-dot calendar__day-dot--${tier}`} />}
              {hasExam && <span className="calendar__day-exam-mark" />}
            </button>
          );
        })}
      </div>

      {loading && <p className="home__status">Carregando projeção…</p>}
      {error && <p className="form__error">{error}</p>}
      {!loading && !error && selectedItems.length === 0 && (
        <p className="home__status">Nenhum tópico projetado para este dia.</p>
      )}
      {!loading && !error && selectedItems.length > 0 && (
        <DayTopicsCard items={selectedItems} maxPriority={globalMaxPriority} />
      )}
    </div>
  );
}
