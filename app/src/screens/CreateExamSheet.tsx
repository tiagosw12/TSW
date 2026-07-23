import { useState } from "react";
import { useExams } from "../hooks/useExams";
import { useToast } from "../contexts/ToastContext";
import { Sheet } from "../components/Sheet";

export function CreateExamSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { createExam } = useExams();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim() || !examDate) return;
    const err = await createExam(name.trim(), examDate, null);
    if (err) return setError(err);
    showToast("Prova criada");
    onSaved();
    onClose();
  }

  return (
    <Sheet title="Nova prova" onClose={onClose}>
      <div className="form">
        <label className="form__field">
          <span>Nome</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label className="form__field">
          <span>Data</span>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </label>
        {error && <p className="form__error">{error}</p>}
        <button className="button button--primary" disabled={!name.trim() || !examDate} onClick={save}>
          Criar prova
        </button>
      </div>
    </Sheet>
  );
}
