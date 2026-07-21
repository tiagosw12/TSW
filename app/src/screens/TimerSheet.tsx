import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useSubjects } from "../hooks/useSubjects";
import { ACTIVITY_TYPES, type ActivityType } from "../types/db";
import { Sheet } from "../components/Sheet";

export interface TimerTarget {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
}

type Phase = "pick" | "setup" | "running" | "saving";

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function TimerSheet({
  initialTarget,
  onClose,
  onSaved,
}: {
  initialTarget: TimerTarget | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { subjects } = useSubjects();

  const [target, setTarget] = useState<TimerTarget | null>(initialTarget);
  const [phase, setPhase] = useState<Phase>(initialTarget ? "setup" : "pick");
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [correctPercentage, setCorrectPercentage] = useState(70);
  const [questionsCount, setQuestionsCount] = useState(10);
  const [quizError, setQuizError] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "running") return;
    const interval = window.setInterval(() => {
      if (startedAtRef.current) {
        setElapsedSeconds((Date.now() - startedAtRef.current) / 1000);
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [phase]);

  function pickTopic(topicId: string, topicName: string, subjectId: string, subjectName: string) {
    setTarget({ topicId, topicName, subjectId, subjectName });
    setPhase("setup");
  }

  function startCycle() {
    if (!activityType) return;
    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    setPhase("running");
  }

  function stopCycle() {
    setPhase("saving");
  }

  async function saveSession() {
    if (!user || !target || !activityType || !startedAtRef.current) return;
    setSaveError(null);

    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const { error } = await supabase.from("study_sessions").insert({
      user_id: user.id,
      topic_id: target.topicId,
      activity_type: activityType,
      duration_minutes: durationMinutes,
      performed_at: new Date(startedAtRef.current).toISOString(),
    });

    if (error) {
      setSaveError("Não foi possível salvar a sessão (sem conexão?). Tente novamente.");
      return;
    }

    showToast("Sessão registrada — retenção atualizada");
    onSaved();
    onClose();
  }

  async function saveQuiz() {
    if (!user || !target) return;
    setQuizError(null);

    const { error } = await supabase.from("quiz_results").insert({
      user_id: user.id,
      subject_id: target.subjectId,
      topic_id: target.topicId,
      correct_percentage: correctPercentage,
      questions_count: questionsCount,
    });

    if (error) {
      setQuizError("Não foi possível salvar o resultado (sem conexão?). Tente novamente.");
      return;
    }

    showToast("Resultado registrado — retenção atualizada");
    onSaved();
    onClose();
  }

  return (
    <Sheet title={target ? `${target.subjectName} · ${target.topicName}` : "Estudar tópico"} onClose={onClose}>
      {phase === "pick" && (
        <div className="timer-pick">
          {subjects.length === 0 && <p className="empty-hint">Cadastre uma matéria e um tópico primeiro.</p>}
          {subjects.map((subject) => (
            <div key={subject.id} className="timer-pick__subject">
              <h3>{subject.name}</h3>
              <div className="timer-pick__topics">
                {subject.topics.map((topic) => (
                  <button
                    key={topic.id}
                    className="button button--secondary"
                    onClick={() => pickTopic(topic.id, topic.name, subject.id, subject.name)}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {phase === "setup" && (
        <div className="timer-setup">
          <p className="timer-setup__label">Tipo de atividade</p>
          <div className="activity-grid">
            {ACTIVITY_TYPES.map((activity) => (
              <button
                key={activity.value}
                className={`activity-option ${activityType === activity.value ? "activity-option--active" : ""}`}
                onClick={() => setActivityType(activity.value)}
              >
                {activity.label}
              </button>
            ))}
          </div>
          {activityType === "questao" ? (
            <div className="quiz-form">
              <label className="form__field">
                <span>Acerto: {correctPercentage}%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={correctPercentage}
                  onChange={(e) => setCorrectPercentage(Number(e.target.value))}
                />
              </label>
              <label className="form__field">
                <span>Quantidade de questões</span>
                <input
                  type="number"
                  min={1}
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(Math.max(1, Math.round(Number(e.target.value) || 1)))}
                />
              </label>
              {quizError && <p className="form__error">{quizError}</p>}
              <button className="button button--primary" onClick={saveQuiz}>
                Salvar resultado
              </button>
            </div>
          ) : (
            <button className="button button--primary" disabled={!activityType} onClick={startCycle}>
              Iniciar ciclo
            </button>
          )}
        </div>
      )}

      {phase === "running" && (
        <div className="timer-running">
          <div className="timer-running__clock">{formatElapsed(elapsedSeconds)}</div>
          <p className="timer-running__activity">
            {ACTIVITY_TYPES.find((a) => a.value === activityType)?.label}
          </p>
          <button className="button button--stop" onClick={stopCycle}>
            Encerrar ciclo
          </button>
        </div>
      )}

      {phase === "saving" && (
        <div className="timer-saving">
          <p>
            Ciclo de {formatElapsed(elapsedSeconds)} concluído. Registrar em study_sessions?
          </p>
          {saveError && <p className="form__error">{saveError}</p>}
          <div className="timer-saving__actions">
            <button className="button button--secondary" onClick={() => setPhase("running")}>
              Voltar
            </button>
            <button className="button button--primary" onClick={saveSession}>
              Salvar sessão
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
