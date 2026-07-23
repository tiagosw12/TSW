import { useState } from "react";
import { BookMarked, Bookmark, CalendarPlus, CheckCircle2, Clock, NotebookPen } from "lucide-react";
import { Sheet } from "../components/Sheet";
import { TimerSheet } from "./TimerSheet";
import { QuickLogSheet } from "./QuickLogSheet";
import { CreateSubjectSheet } from "./CreateSubjectSheet";
import { CreateTopicSheet } from "./CreateTopicSheet";
import { CreateExamSheet } from "./CreateExamSheet";
import { useDataRefresh } from "../contexts/DataRefreshContext";

type ActionView = "grid" | "study" | "quiz" | "quickLog" | "newSubject" | "newTopic" | "newExam";

export function AddSheet({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<ActionView>("grid");
  const { bump } = useDataRefresh();

  if (view === "study") {
    return <TimerSheet initialTarget={null} onClose={onClose} onSaved={bump} />;
  }
  if (view === "quiz") {
    return <TimerSheet initialTarget={null} initialActivityType="questao" onClose={onClose} onSaved={bump} />;
  }
  if (view === "quickLog") {
    return <QuickLogSheet onClose={onClose} onSaved={bump} />;
  }
  if (view === "newSubject") {
    return <CreateSubjectSheet onClose={onClose} onSaved={bump} />;
  }
  if (view === "newTopic") {
    return <CreateTopicSheet onClose={onClose} onSaved={bump} />;
  }
  if (view === "newExam") {
    return <CreateExamSheet onClose={onClose} onSaved={bump} />;
  }

  return (
    <Sheet title="Adicionar" onClose={onClose}>
      <p className="add-sheet__section-label">Estudar agora</p>
      <div className="add-grid add-grid--wide">
        <button className="add-action add-action--wide" onClick={() => setView("study")}>
          <span className="add-action__icon add-action__icon--blue">
            <Clock size={22} strokeWidth={1.75} />
          </span>
          <span>Iniciar sessão de estudo</span>
        </button>
        <button className="add-action add-action--wide" onClick={() => setView("quiz")}>
          <span className="add-action__icon add-action__icon--purple">
            <CheckCircle2 size={22} strokeWidth={1.75} />
          </span>
          <span>Registrar quiz</span>
        </button>
      </div>

      <p className="add-sheet__section-label">Cadastrar</p>
      <div className="add-grid add-grid--2x2">
        <button className="add-action" onClick={() => setView("newSubject")}>
          <span className="add-action__icon add-action__icon--orange">
            <BookMarked size={22} strokeWidth={1.75} />
          </span>
          <span>Nova matéria</span>
        </button>
        <button className="add-action" onClick={() => setView("newTopic")}>
          <span className="add-action__icon add-action__icon--teal">
            <Bookmark size={22} strokeWidth={1.75} />
          </span>
          <span>Novo tópico</span>
        </button>
        <button className="add-action" onClick={() => setView("newExam")}>
          <span className="add-action__icon add-action__icon--pink">
            <CalendarPlus size={22} strokeWidth={1.75} />
          </span>
          <span>Nova prova</span>
        </button>
        <button className="add-action" onClick={() => setView("quickLog")}>
          <span className="add-action__icon add-action__icon--gray">
            <NotebookPen size={22} strokeWidth={1.75} />
          </span>
          <span>Resumo/esquema</span>
        </button>
      </div>
    </Sheet>
  );
}
