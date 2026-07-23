import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useExams } from "../hooks/useExams";
import { useSubjects } from "../hooks/useSubjects";
import { useToast } from "../contexts/ToastContext";
import { useDataRefresh } from "../contexts/DataRefreshContext";

export function ExamDetailScreen() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { exams, deleteExam, linkSubject, linkTopic, unlinkSubject, unlinkTopic } = useExams();
  const { subjects } = useSubjects();
  const { showToast } = useToast();
  const { bump } = useDataRefresh();

  const exam = exams.find((e) => e.id === examId);

  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [weight, setWeight] = useState("1");
  const [error, setError] = useState<string | null>(null);

  if (!exam) {
    return (
      <div className="home">
        <p className="home__status">Prova não encontrada.</p>
      </div>
    );
  }

  const currentExam = exam;
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  async function handleLink() {
    setError(null);
    const err = topicId
      ? await linkTopic(currentExam.id, topicId, Number(weight) || 1)
      : await linkSubject(currentExam.id, subjectId, Number(weight) || 1);
    if (err) {
      setError(err);
      return;
    }
    bump();
    setSubjectId("");
    setTopicId("");
    setWeight("1");
  }

  async function handleUnlinkSubject(linkId: string) {
    await unlinkSubject(linkId);
    bump();
  }

  async function handleUnlinkTopic(linkId: string) {
    await unlinkTopic(linkId);
    bump();
  }

  async function handleDelete() {
    if (!confirm(`Excluir a prova "${currentExam.name}"?`)) return;
    await deleteExam(currentExam.id);
    bump();
    showToast("Prova excluída");
    navigate("/materias");
  }

  return (
    <div className="home">
      <header className="detail-header">
        <button className="icon-button" onClick={() => navigate("/materias")} aria-label="Voltar">
          <ArrowLeft size={20} />
        </button>
        <h1 className="detail-header__title">{exam.name}</h1>
      </header>

      <p className="exam-date">{exam.exam_date}</p>

      <ul className="crud-list__items detail-links">
        {exam.subjectLinks.map((link) => (
          <li key={link.id} className="crud-list__item">
            <span>{link.subject_name} (matéria inteira)</span>
            <span className="crud-list__weight">peso {link.weight}</span>
            <button className="button button--danger-link" onClick={() => handleUnlinkSubject(link.id)}>
              remover
            </button>
          </li>
        ))}
        {exam.topicLinks.map((link) => (
          <li key={link.id} className="crud-list__item">
            <span>{link.topic_name}</span>
            <span className="crud-list__weight">peso {link.weight}</span>
            <button className="button button--danger-link" onClick={() => handleUnlinkTopic(link.id)}>
              remover
            </button>
          </li>
        ))}
        {exam.subjectLinks.length === 0 && exam.topicLinks.length === 0 && (
          <p className="empty-hint">Nenhuma matéria ou tópico vinculado ainda.</p>
        )}
      </ul>

      <div className="link-row">
        <select
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicId("");
          }}
        >
          <option value="">Vincular matéria/tópico…</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        {selectedSubject && (
          <select value={topicId} onChange={(e) => setTopicId(e.target.value)}>
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
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <button className="button button--secondary" disabled={!subjectId} onClick={handleLink}>
          Vincular
        </button>
      </div>

      {error && <p className="form__error">{error}</p>}

      <button className="button button--danger detail-delete-button" onClick={handleDelete}>
        <Trash2 size={16} />
        Excluir prova
      </button>
    </div>
  );
}
