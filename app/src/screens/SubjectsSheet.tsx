import { useState } from "react";
import { useSubjects } from "../hooks/useSubjects";
import { Sheet } from "../components/Sheet";

export function SubjectsSheet({ onClose }: { onClose: () => void }) {
  const { subjects, createSubject, renameSubject, deleteSubject, createTopic, updateTopic, deleteTopic } =
    useSubjects();

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newTopicBySubject, setNewTopicBySubject] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleCreateSubject() {
    if (!newSubjectName.trim()) return;
    const err = await createSubject(newSubjectName.trim(), null);
    if (err) return setError(err);
    setNewSubjectName("");
    setError(null);
  }

  async function handleCreateTopic(subjectId: string) {
    const name = (newTopicBySubject[subjectId] ?? "").trim();
    if (!name) return;
    const err = await createTopic(subjectId, name, 1);
    if (err) return setError(err);
    setNewTopicBySubject((current) => ({ ...current, [subjectId]: "" }));
    setError(null);
  }

  return (
    <Sheet title="Matérias & Tópicos" onClose={onClose}>
      {error && <p className="form__error">{error}</p>}

      <div className="crud-list">
        {subjects.map((subject) => (
          <div key={subject.id} className="crud-list__group">
            <div className="crud-list__group-header">
              <input
                className="crud-list__inline-input"
                defaultValue={subject.name}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== subject.name) renameSubject(subject.id, value);
                }}
              />
              <button
                className="button button--danger-link"
                onClick={() => confirm(`Excluir "${subject.name}" e todos os seus tópicos?`) && deleteSubject(subject.id)}
              >
                excluir
              </button>
            </div>

            <ul className="crud-list__items">
              {subject.topics.map((topic) => (
                <li key={topic.id} className="crud-list__item">
                  <input
                    className="crud-list__inline-input"
                    defaultValue={topic.name}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (value && value !== topic.name) updateTopic(topic.id, { name: value });
                    }}
                  />
                  <label className="crud-list__importance">
                    import.
                    <input
                      type="number"
                      min={0.1}
                      max={5}
                      step={0.5}
                      defaultValue={topic.manual_importance}
                      onBlur={(e) => {
                        const value = Number(e.target.value);
                        if (value > 0) updateTopic(topic.id, { manual_importance: value });
                      }}
                    />
                  </label>
                  <button
                    className="button button--danger-link"
                    onClick={() => confirm(`Excluir "${topic.name}"?`) && deleteTopic(topic.id)}
                  >
                    excluir
                  </button>
                </li>
              ))}
            </ul>

            <div className="crud-list__add-row">
              <input
                placeholder="Novo tópico"
                value={newTopicBySubject[subject.id] ?? ""}
                onChange={(e) =>
                  setNewTopicBySubject((current) => ({ ...current, [subject.id]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreateTopic(subject.id)}
              />
              <button className="button button--secondary" onClick={() => handleCreateTopic(subject.id)}>
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="crud-list__add-row crud-list__add-row--subject">
        <input
          placeholder="Nova matéria"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateSubject()}
        />
        <button className="button button--primary" onClick={handleCreateSubject}>
          Adicionar matéria
        </button>
      </div>
    </Sheet>
  );
}
