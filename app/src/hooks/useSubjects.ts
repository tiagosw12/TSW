import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import type { Subject, Topic } from "../types/db";

export interface SubjectWithTopics extends Subject {
  topics: Topic[];
}

export function useSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const [subjectsRes, topicsRes] = await Promise.all([
      supabase.from("subjects").select("*").order("name"),
      supabase.from("topics").select("*").order("name"),
    ]);

    if (subjectsRes.error) {
      setError(subjectsRes.error.message);
      setLoading(false);
      return;
    }
    if (topicsRes.error) {
      setError(topicsRes.error.message);
      setLoading(false);
      return;
    }

    const topicsBySubject = new Map<string, Topic[]>();
    for (const topic of topicsRes.data ?? []) {
      const list = topicsBySubject.get(topic.subject_id) ?? [];
      list.push(topic);
      topicsBySubject.set(topic.subject_id, list);
    }

    setError(null);
    setSubjects(
      (subjectsRes.data ?? []).map((subject) => ({
        ...subject,
        topics: topicsBySubject.get(subject.id) ?? [],
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function createSubject(name: string, color: string | null) {
    if (!user) return "Sessão expirada.";
    const { error: insertError } = await supabase
      .from("subjects")
      .insert({ user_id: user.id, name, color });
    if (insertError) return insertError.message;
    await refetch();
    return null;
  }

  async function renameSubject(id: string, name: string) {
    const { error: updateError } = await supabase.from("subjects").update({ name }).eq("id", id);
    if (updateError) return updateError.message;
    await refetch();
    return null;
  }

  async function deleteSubject(id: string) {
    const { error: deleteError } = await supabase.from("subjects").delete().eq("id", id);
    if (deleteError) return deleteError.message;
    await refetch();
    return null;
  }

  async function createTopic(subjectId: string, name: string, manualImportance: number) {
    if (!user) return "Sessão expirada.";
    const { error: insertError } = await supabase
      .from("topics")
      .insert({ user_id: user.id, subject_id: subjectId, name, manual_importance: manualImportance });
    if (insertError) return insertError.message;
    await refetch();
    return null;
  }

  async function updateTopic(id: string, changes: { name?: string; manual_importance?: number }) {
    const { error: updateError } = await supabase.from("topics").update(changes).eq("id", id);
    if (updateError) return updateError.message;
    await refetch();
    return null;
  }

  async function deleteTopic(id: string) {
    const { error: deleteError } = await supabase.from("topics").delete().eq("id", id);
    if (deleteError) return deleteError.message;
    await refetch();
    return null;
  }

  return {
    subjects,
    loading,
    error,
    refetch,
    createSubject,
    renameSubject,
    deleteSubject,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}
