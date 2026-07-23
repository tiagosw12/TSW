import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useSubjects } from "../hooks/useSubjects";
import { Sheet } from "../components/Sheet";
import { TopicPicker } from "../components/TopicPicker";

type QuickActivity = "resumo" | "esquema";

export function QuickLogSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { subjects } = useSubjects();

  const [target, setTarget] = useState<{ topicId: string; topicName: string; subjectName: string } | null>(null);
  const [activityType, setActivityType] = useState<QuickActivity>("resumo");
  const [minutes, setMinutes] = useState(15);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!user || !target) return;
    setError(null);
    const { error: insertError } = await supabase.from("study_sessions").insert({
      user_id: user.id,
      topic_id: target.topicId,
      activity_type: activityType,
      duration_minutes: Math.max(1, Math.round(minutes)),
      performed_at: new Date().toISOString(),
    });
    if (insertError) {
      setError("Não foi possível salvar (sem conexão?). Tente novamente.");
      return;
    }
    showToast("Registrado — retenção atualizada");
    onSaved();
    onClose();
  }

  return (
    <Sheet title={target ? `${target.subjectName} · ${target.topicName}` : "Resumo / esquema"} onClose={onClose}>
      {!target ? (
        <TopicPicker
          subjects={subjects}
          onPick={(topicId, topicName, _subjectId, subjectName) => setTarget({ topicId, topicName, subjectName })}
        />
      ) : (
        <div className="quick-log">
          <div className="activity-grid">
            {(["resumo", "esquema"] as const).map((option) => (
              <button
                key={option}
                className={`activity-option ${activityType === option ? "activity-option--active" : ""}`}
                onClick={() => setActivityType(option)}
              >
                {option === "resumo" ? "Resumo" : "Esquema"}
              </button>
            ))}
          </div>
          <label className="form__field">
            <span>Duração (minutos)</span>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Math.round(Number(e.target.value) || 1)))}
            />
          </label>
          {error && <p className="form__error">{error}</p>}
          <button className="button button--primary" onClick={save}>
            Salvar
          </button>
        </div>
      )}
    </Sheet>
  );
}
