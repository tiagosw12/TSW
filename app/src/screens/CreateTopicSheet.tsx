import { useState } from "react";
import { useSubjects } from "../hooks/useSubjects";
import { useToast } from "../contexts/ToastContext";
import { Sheet } from "../components/Sheet";

export function CreateTopicSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { subjects, createTopic } = useSubjects();
  const { showToast } = useToast();
  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  const [importance, setImportance] = useState(1);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!subjectId || !name.trim()) return;
    const err = await createTopic(subjectId, name.trim(), importance);
    if (err) return setError(err);
    showToast("Tópico criado");
    onSaved();
    onClose();
  }

  return (
    <Sheet title="Novo tópico" onClose={onClose}>
      {subjects.length === 0 ? (
        <p className="empty-hint">Cadastre uma matéria primeiro.</p>
      ) : (
        <div className="form">
          <label className="form__field">
            <span>Matéria</span>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Selecione…</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form__field">
            <span>Nome do tópico</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <label className="form__field">
            <span>Importância</span>
            <input
              type="number"
              min={0.1}
              max={5}
              step={0.5}
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value) || 1)}
            />
          </label>
          {error && <p className="form__error">{error}</p>}
          <button className="button button--primary" disabled={!subjectId || !name.trim()} onClick={save}>
            Criar tópico
          </button>
        </div>
      )}
    </Sheet>
  );
}
