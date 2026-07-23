import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, GraduationCap } from "lucide-react";
import { useSubjects } from "../hooks/useSubjects";
import { useExams } from "../hooks/useExams";
import { resolveSubjectIcon } from "../lib/subjectIcon";
import { useDataRefresh } from "../contexts/DataRefreshContext";
import { CreateSubjectSheet } from "./CreateSubjectSheet";
import { CreateExamSheet } from "./CreateExamSheet";

type Tab = "materias" | "provas";

export function SubjectsProvasScreen() {
  const [tab, setTab] = useState<Tab>("materias");
  const [creating, setCreating] = useState<"subject" | "exam" | null>(null);
  const navigate = useNavigate();
  const { subjects } = useSubjects();
  const { exams } = useExams();
  const { bump } = useDataRefresh();

  return (
    <div className="home">
      <header className="home__header">
        <div>
          <p className="home__eyebrow">cadastro</p>
          <h1 className="home__title">Matérias & Provas</h1>
        </div>
      </header>

      <div className="segmented">
        <button
          className={`segmented__option ${tab === "materias" ? "segmented__option--active" : ""}`}
          onClick={() => setTab("materias")}
        >
          Matérias
        </button>
        <button
          className={`segmented__option ${tab === "provas" ? "segmented__option--active" : ""}`}
          onClick={() => setTab("provas")}
        >
          Provas
        </button>
      </div>

      {tab === "materias" ? (
        <div className="materias-list">
          {subjects.map((subject) => {
            const Icon = resolveSubjectIcon(subject.name, subject.icon);
            return (
              <button
                key={subject.id}
                className="list-row"
                onClick={() => navigate(`/materias/subject/${subject.id}`)}
              >
                <span className="list-row__icon">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <span className="list-row__text">
                  <span className="list-row__title">{subject.name}</span>
                  <span className="list-row__subtitle">
                    {subject.topics.length} tópico{subject.topics.length === 1 ? "" : "s"}
                  </span>
                </span>
                <ChevronRight size={18} className="list-row__chevron" />
              </button>
            );
          })}
          <button className="list-add-dashed" onClick={() => setCreating("subject")}>
            + Nova matéria
          </button>
        </div>
      ) : (
        <div className="materias-list">
          {exams.map((exam) => (
            <button key={exam.id} className="list-row" onClick={() => navigate(`/materias/prova/${exam.id}`)}>
              <span className="list-row__icon">
                <GraduationCap size={20} strokeWidth={1.75} />
              </span>
              <span className="list-row__text">
                <span className="list-row__title">{exam.name}</span>
                <span className="list-row__subtitle">{exam.exam_date}</span>
              </span>
              <ChevronRight size={18} className="list-row__chevron" />
            </button>
          ))}
          <button className="list-add-dashed" onClick={() => setCreating("exam")}>
            + Nova prova
          </button>
        </div>
      )}

      {creating === "subject" && (
        <CreateSubjectSheet onClose={() => setCreating(null)} onSaved={bump} />
      )}
      {creating === "exam" && <CreateExamSheet onClose={() => setCreating(null)} onSaved={bump} />}
    </div>
  );
}
