import type { SubjectWithTopics } from "../hooks/useSubjects";

export function TopicPicker({
  subjects,
  onPick,
}: {
  subjects: SubjectWithTopics[];
  onPick: (topicId: string, topicName: string, subjectId: string, subjectName: string) => void;
}) {
  return (
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
                onClick={() => onPick(topic.id, topic.name, subject.id, subject.name)}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
