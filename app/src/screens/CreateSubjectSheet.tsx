import { useState } from "react";
import { useSubjects } from "../hooks/useSubjects";
import { useToast } from "../contexts/ToastContext";
import { Sheet } from "../components/Sheet";
import { IconPicker } from "../components/IconPicker";

export function CreateSubjectSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { createSubject } = useSubjects();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) return;
    const err = await createSubject(name.trim(), null, icon);
    if (err) return setError(err);
    showToast("Matéria criada");
    onSaved();
    onClose();
  }

  return (
    <Sheet title="Nova matéria" onClose={onClose}>
      <div className="form">
        <label className="form__field">
          <span>Nome</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <div className="form__field">
          <span>Ícone</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
        {error && <p className="form__error">{error}</p>}
        <button className="button button--primary" disabled={!name.trim()} onClick={save}>
          Criar matéria
        </button>
      </div>
    </Sheet>
  );
}
