import { useState } from "react";
import { useTopicPriorities } from "../hooks/useTopicPriorities";
import { useTodaySummary } from "../hooks/useTodaySummary";
import { useDataRefresh } from "../contexts/DataRefreshContext";
import { PriorityCard, tierFor } from "../components/PriorityCard";
import { DaySummary } from "../components/DaySummary";
import { TimerSheet, type TimerTarget } from "./TimerSheet";
import type { TopicPriority } from "../types/db";

export function HomeScreen() {
  const { priorities, loading, error, refetch } = useTopicPriorities();
  const { summary } = useTodaySummary();
  const { bump } = useDataRefresh();
  const [timerTarget, setTimerTarget] = useState<TimerTarget | null>(null);

  const maxPriority = priorities[0]?.priority ?? 0;

  function openTimerFor(item: TopicPriority) {
    setTimerTarget({
      topicId: item.topic_id,
      topicName: item.topic_name,
      subjectId: item.subject_id,
      subjectName: item.subject_name,
    });
  }

  function handleSaved() {
    refetch();
    bump();
  }

  return (
    <div className="home">
      <header className="home__header">
        <div>
          <p className="home__eyebrow">fila de hoje</p>
          <h1 className="home__title">O que estudar agora</h1>
        </div>
      </header>

      <DaySummary summary={summary} />

      {loading && <p className="home__status">Carregando fila…</p>}
      {error && <p className="form__error">{error}</p>}
      {!loading && !error && priorities.length === 0 && (
        <p className="home__status">Nenhum tópico cadastrado ainda. Use o botão Adicionar para cadastrar matérias.</p>
      )}

      <div className="priority-queue">
        {priorities.map((item) => (
          <PriorityCard
            key={item.topic_id}
            item={item}
            tier={tierFor(item.priority, maxPriority)}
            onStudy={openTimerFor}
          />
        ))}
      </div>

      {timerTarget !== null && (
        <TimerSheet initialTarget={timerTarget} onClose={() => setTimerTarget(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
