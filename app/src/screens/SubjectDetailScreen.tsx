import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useSubjects } from "../hooks/useSubjects";
import { useToast } from "../contexts/ToastContext";
import { useDataRefresh } from "../contexts/DataRefreshContext";
import { IconPicker } from "../components/IconPicker";
import { resolveSubjectIcon } from "../lib/subjectIcon";

export function SubjectDetailScreen() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { subjects, updateSubject, deleteSubject, createTopic, updateTopic, deleteTopic } = useSubjects();
  const { showToast } = useToast();
  const { bump } = useDataRefresh();

  const subject = subjects.find((s) => s.id === subjectId);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(subject?.name ?? "");
  const [icon, setIcon] = useState<string | null>(subject?.icon ?? null);
  const [newTopicName, setNewTopicName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!subject) {
    return (
      <div className="home">
        <p className="home__status">Matéria não encontrada.</p>
      </div>
    );
  }

  const currentSubject = subject;
  const Icon = resolveSubjectIcon(currentSubject.name, currentSubject.icon);

  async function saveEdit() {
    if (!name.trim()) return;
    const err = await updateSubject(currentSubject.id, { name: name.trim(), icon });
    if (err) return setError(err);
    bump();
    setEditing(false);
  }

  function startEditing() {
    setName(currentSubject.name);
    setIcon(currentSubject.icon);
    setError(null);
    setEditing(true);
  }

  async function handleAddTopic() {
    if (!newTopicName.trim()) return;
    const err = await createTopic(currentSubject.id, newTopicName.trim(), 1);
    if (err) return setError(err);
    bump();
    setNewTopicName("");
  }

  async function handleDeleteSubject() {
    if (!confirm(`Excluir "${currentSubject.name}" e todos os seus tópicos?`)) return;
    await deleteSubject(currentSubject.id);
    bump();
    showToast("Matéria excluída");
    navigate("/materias");
  }

  return (
    <div className="home">
      <header className="detail-header">
        <button className="icon-button" onClick={() => navigate("/materias")} aria-label="Voltar">
          <ArrowLeft size={20} />
        </button>
        {!editing ? (
          <>
            <span className="detail-header__icon">
              <Icon size={22} strokeWidth={1.75} />
            </span>
            <h1 className="detail-header__title">{subject.name}</h1>
            <button className="icon-button" onClick={startEditing} aria-label="Editar matéria">
              <Pencil size={18} />
            </button>
          </>
        ) : (
          <span className="detail-header__title">Editar matéria</span>
        )}
      </header>

      {editing && (
        <div className="form detail-edit-form">
          <label className="form__field">
            <span>Nome</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="form__field">
            <span>Ícone</span>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          {error && <p className="form__error">{error}</p>}
          <div className="detail-edit-form__actions">
            <button className="button button--secondary" onClick={() => setEditing(false)}>
              Cancelar
            </button>
            <button className="button button--primary" onClick={saveEdit}>
              Salvar
            </button>
          </div>
        </div>
      )}

      <ul className="crud-list__items">
        {subject.topics.map((topic) => (
          <li key={topic.id} className="crud-list__item">
            <input
              className="crud-list__inline-input"
              defaultValue={topic.name}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value && value !== topic.name) updateTopic(topic.id, { name: value }).then(bump);
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
                  if (value > 0) updateTopic(topic.id, { manual_importance: value }).then(bump);
                }}
              />
            </label>
            <button
              className="button button--danger-link"
              onClick={() => confirm(`Excluir "${topic.name}"?`) && deleteTopic(topic.id).then(bump)}
            >
              excluir
            </button>
          </li>
        ))}
      </ul>

      <div className="crud-list__add-row">
        <input
          placeholder="Novo tópico"
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
        />
        <button className="button button--secondary" onClick={handleAddTopic}>
          Adicionar
        </button>
      </div>

      <button className="button button--danger detail-delete-button" onClick={handleDeleteSubject}>
        <Trash2 size={16} />
        Excluir matéria
      </button>
    </div>
  );
}
