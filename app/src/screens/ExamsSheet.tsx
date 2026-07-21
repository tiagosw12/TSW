import { useState } from "react";
import { useExams } from "../hooks/useExams";
import { useSubjects } from "../hooks/useSubjects";
import { Sheet } from "../components/Sheet";

export function ExamsSheet({ onClose }: { onClose: () => void }) {
  const { exams, createExam, deleteExam, linkSubject, linkTopic, unlinkSubject, unlinkTopic } = useExams();
  const { subjects } = useSubjects();

  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [linkTarget, setLinkTarget] = useState<Record<string, { subjectId: string; topicId: string; weight: string }>>(
    {},
  );

  async function handleCreateExam() {
    if (!name.trim() || !examDate) return;
    const err = await createExam(name.trim(), examDate, null);
    if (err) return setError(err);
    setName("");
    setExamDate("");
    setError(null);
  }

  function linkStateFor(examId: string) {
    return linkTarget[examId] ?? { subjectId: "", topicId: "", weight: "1" };
  }

  function setLinkState(examId: string, changes: Partial<{ subjectId: string; topicId: string; weight: string }>) {
    setLinkTarget((current) => ({ ...current, [examId]: { ...linkStateFor(examId), ...changes } }));
  }

  async function handleLinkSubject(examId: string) {
    const state = linkStateFor(examId);
    if (!state.subjectId) return;
    const err = await linkSubject(examId, state.subjectId, Number(state.weight) || 1);
    if (err) setError(err);
  }

  async function handleLinkTopic(examId: string) {
    const state = linkStateFor(examId);
    if (!state.topicId) return;
    const err = await linkTopic(examId, state.topicId, Number(state.weight) || 1);
    if (err) setError(err);
  }

  return (
    <Sheet title="Provas" onClose={onClose}>
      {error && <p className="form__error">{error}</p>}

      <div className="crud-list">
        {exams.map((exam) => {
          const state = linkStateFor(exam.id);
          const selectedSubject = subjects.find((s) => s.id === state.subjectId);
          return (
            <div key={exam.id} className="crud-list__group">
              <div className="crud-list__group-header">
                <div>
                  <strong>{exam.name}</strong>
                  <span className="exam-date"> · {exam.exam_date}</span>
                </div>
                <button
                  className="button button--danger-link"
                  onClick={() => confirm(`Excluir a prova "${exam.name}"?`) && deleteExam(exam.id)}
                >
                  excluir
                </button>
              </div>

              <ul className="crud-list__items">
                {exam.subjectLinks.map((link) => (
                  <li key={link.id} className="crud-list__item">
                    <span>{link.subject_name} (matéria inteira)</span>
                    <span className="crud-list__weight">peso {link.weight}</span>
                    <button className="button button--danger-link" onClick={() => unlinkSubject(link.id)}>
                      remover
                    </button>
                  </li>
                ))}
                {exam.topicLinks.map((link) => (
                  <li key={link.id} className="crud-list__item">
                    <span>{link.topic_name}</span>
                    <span className="crud-list__weight">peso {link.weight}</span>
                    <button className="button button--danger-link" onClick={() => unlinkTopic(link.id)}>
                      remover
                    </button>
                  </li>
                ))}
              </ul>

              <div className="link-row">
                <select
                  value={state.subjectId}
                  onChange={(e) => setLinkState(exam.id, { subjectId: e.target.value, topicId: "" })}
                >
                  <option value="">Vincular matéria/tópico…</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                {selectedSubject && (
                  <select value={state.topicId} onChange={(e) => setLinkState(exam.id, { topicId: e.target.value })}>
                    <option value="">Matéria inteira</option>
                    {selectedSubject.topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  className="link-row__weight"
                  value={state.weight}
                  onChange={(e) => setLinkState(exam.id, { weight: e.target.value })}
                />
                <button
                  className="button button--secondary"
                  disabled={!state.subjectId}
                  onClick={() => (state.topicId ? handleLinkTopic(exam.id) : handleLinkSubject(exam.id))}
                >
                  Vincular
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="crud-list__add-row crud-list__add-row--subject">
        <input placeholder="Nome da prova" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        <button className="button button--primary" onClick={handleCreateExam}>
          Adicionar prova
        </button>
      </div>
    </Sheet>
  );
}
