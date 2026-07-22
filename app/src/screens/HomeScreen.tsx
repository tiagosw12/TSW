import { useState } from "react";
import { Menu, Plus } from "lucide-react";
import { useTopicPriorities } from "../hooks/useTopicPriorities";
import { useSubjects } from "../hooks/useSubjects";
import { PriorityCard, tierFor } from "../components/PriorityCard";
import { Sheet } from "../components/Sheet";
import { SubjectsSheet } from "./SubjectsSheet";
import { ExamsSheet } from "./ExamsSheet";
import { ProfileSheet } from "./ProfileSheet";
import { TimerSheet, type TimerTarget } from "./TimerSheet";
import type { TopicPriority } from "../types/db";

type MenuSheetKind = "menu" | "subjects" | "exams" | "profile" | null;

export function HomeScreen() {
  const { priorities, loading, error, refetch, version } = useTopicPriorities();
  const { subjects } = useSubjects();
  const [openSheet, setOpenSheet] = useState<MenuSheetKind>(null);
  const [timerTarget, setTimerTarget] = useState<TimerTarget | null | "avulso">(null);

  const maxPriority = priorities[0]?.priority ?? 0;
  const iconBySubject = new Map(subjects.map((s) => [s.id, s.icon]));

  function openTimerFor(item: TopicPriority) {
    setTimerTarget({
      topicId: item.topic_id,
      topicName: item.topic_name,
      subjectId: item.subject_id,
      subjectName: item.subject_name,
    });
  }

  return (
    <div className="home">
      <header className="home__header">
        <div>
          <p className="home__eyebrow">fila de hoje</p>
          <h1 className="home__title">O que estudar agora</h1>
        </div>
        <button className="icon-button" onClick={() => setOpenSheet("menu")} aria-label="Menu">
          <Menu size={22} strokeWidth={2.25} />
        </button>
      </header>

      {loading && <p className="home__status">Carregando fila…</p>}
      {error && <p className="form__error">{error}</p>}
      {!loading && !error && priorities.length === 0 && (
        <p className="home__status">Nenhum tópico cadastrado ainda. Use o menu para adicionar matérias.</p>
      )}

      <div className="priority-queue">
        {priorities.map((item) => (
          <PriorityCard
            key={item.topic_id}
            item={item}
            tier={tierFor(item.priority, maxPriority)}
            icon={iconBySubject.get(item.subject_id) ?? "stethoscope"}
            onStudy={openTimerFor}
            refreshKey={version}
          />
        ))}
      </div>

      <button className="fab" onClick={() => setTimerTarget("avulso")} aria-label="Estudar tópico avulso">
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {openSheet === "menu" && (
        <Sheet title="Menu" onClose={() => setOpenSheet(null)}>
          <div className="menu-list">
            <button className="menu-list__item" onClick={() => setOpenSheet("subjects")}>
              Matérias & Tópicos
            </button>
            <button className="menu-list__item" onClick={() => setOpenSheet("exams")}>
              Provas
            </button>
            <button className="menu-list__item" onClick={() => setOpenSheet("profile")}>
              Perfil
            </button>
          </div>
        </Sheet>
      )}

      {openSheet === "subjects" && <SubjectsSheet onClose={() => setOpenSheet(null)} />}
      {openSheet === "exams" && <ExamsSheet onClose={() => setOpenSheet(null)} />}
      {openSheet === "profile" && <ProfileSheet onClose={() => setOpenSheet(null)} />}

      {timerTarget !== null && (
        <TimerSheet
          initialTarget={timerTarget === "avulso" ? null : timerTarget}
          onClose={() => setTimerTarget(null)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
