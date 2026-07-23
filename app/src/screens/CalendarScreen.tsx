import { useMemo } from "react";
import { useTopicPrioritiesByRange } from "../hooks/useTopicPrioritiesByRange";
import { DayTopicsCard } from "../components/DayTopicsCard";

const PROJECTION_DAYS = 14;
const WEEKDAY_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateLabel(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

function dayInfo(date: Date, diffDays: number) {
  if (diffDays === 0) return { label: "Hoje", weekday: WEEKDAY_SHORT[date.getDay()], emphasize: true };
  if (diffDays === 1) return { label: "Amanhã", weekday: WEEKDAY_SHORT[date.getDay()], emphasize: false };
  const full = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return { label: full.charAt(0).toUpperCase() + full.slice(1), weekday: null, emphasize: false };
}

export function CalendarScreen() {
  const today = useMemo(() => startOfToday(), []);
  const rangeEnd = useMemo(() => addDays(today, PROJECTION_DAYS - 1), [today]);

  const { byDay, loading, error } = useTopicPrioritiesByRange(today, rangeEnd);

  const days = useMemo(() => Array.from({ length: PROJECTION_DAYS }, (_, i) => addDays(today, i)), [today]);

  const globalMaxPriority = useMemo(() => {
    let max = 0;
    for (const list of Object.values(byDay)) {
      for (const item of list) max = Math.max(max, item.priority);
    }
    return max;
  }, [byDay]);

  return (
    <div className="home">
      <header className="home__header">
        <div>
          <p className="home__eyebrow">projeção</p>
          <h1 className="home__title">Próximos {PROJECTION_DAYS} dias</h1>
        </div>
      </header>

      {loading && <p className="home__status">Carregando projeção…</p>}
      {error && <p className="form__error">{error}</p>}

      <div className="agenda">
        {days.map((date, index) => {
          const key = toKey(date);
          const items = byDay[key] ?? [];
          const info = dayInfo(date, index);
          return (
            <div className="agenda__day" key={key}>
              <div className="agenda__day-header">
                <span className={`agenda__day-label ${info.emphasize ? "agenda__day-label--today" : ""}`}>
                  {info.label}
                  {info.weekday && <span className="agenda__day-weekday"> · {info.weekday}</span>}
                </span>
                <span className="agenda__day-date">{dateLabel(date)}</span>
              </div>
              {!loading && items.length === 0 ? (
                <p className="home__status">Nenhum tópico projetado.</p>
              ) : (
                <DayTopicsCard items={items} maxPriority={globalMaxPriority} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
