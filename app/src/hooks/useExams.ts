import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import type { Exam } from "../types/db";

export interface ExamSubjectLink {
  id: string;
  subject_id: string;
  subject_name: string;
  weight: number;
}

export interface ExamTopicLink {
  id: string;
  topic_id: string;
  topic_name: string;
  weight: number;
}

export interface ExamWithLinks extends Exam {
  subjectLinks: ExamSubjectLink[];
  topicLinks: ExamTopicLink[];
}

export function useExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState<ExamWithLinks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    const [examsRes, subjectLinksRes, topicLinksRes] = await Promise.all([
      supabase.from("exams").select("*").order("exam_date"),
      supabase.from("exam_subjects").select("id, exam_id, subject_id, weight, subjects(name)"),
      supabase.from("exam_topics").select("id, exam_id, topic_id, weight, topics(name)"),
    ]);

    if (examsRes.error) return finish(examsRes.error.message);
    if (subjectLinksRes.error) return finish(subjectLinksRes.error.message);
    if (topicLinksRes.error) return finish(topicLinksRes.error.message);

    type SubjectLinkRow = { id: string; exam_id: string; subject_id: string; weight: number; subjects: { name: string } | null };
    type TopicLinkRow = { id: string; exam_id: string; topic_id: string; weight: number; topics: { name: string } | null };

    const subjectLinksByExam = new Map<string, ExamSubjectLink[]>();
    for (const row of (subjectLinksRes.data ?? []) as unknown as SubjectLinkRow[]) {
      const list = subjectLinksByExam.get(row.exam_id) ?? [];
      list.push({ id: row.id, subject_id: row.subject_id, subject_name: row.subjects?.name ?? "?", weight: row.weight });
      subjectLinksByExam.set(row.exam_id, list);
    }

    const topicLinksByExam = new Map<string, ExamTopicLink[]>();
    for (const row of (topicLinksRes.data ?? []) as unknown as TopicLinkRow[]) {
      const list = topicLinksByExam.get(row.exam_id) ?? [];
      list.push({ id: row.id, topic_id: row.topic_id, topic_name: row.topics?.name ?? "?", weight: row.weight });
      topicLinksByExam.set(row.exam_id, list);
    }

    setExams(
      (examsRes.data ?? []).map((exam) => ({
        ...exam,
        subjectLinks: subjectLinksByExam.get(exam.id) ?? [],
        topicLinks: topicLinksByExam.get(exam.id) ?? [],
      })),
    );
    finish(null);

    function finish(err: string | null) {
      setError(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function createExam(name: string, examDate: string, notes: string | null) {
    if (!user) return "Sessão expirada.";
    const { error: insertError } = await supabase
      .from("exams")
      .insert({ user_id: user.id, name, exam_date: examDate, notes });
    if (insertError) return insertError.message;
    await refetch();
    return null;
  }

  async function deleteExam(id: string) {
    const { error: deleteError } = await supabase.from("exams").delete().eq("id", id);
    if (deleteError) return deleteError.message;
    await refetch();
    return null;
  }

  async function linkSubject(examId: string, subjectId: string, weight: number) {
    if (!user) return "Sessão expirada.";
    const { error: insertError } = await supabase
      .from("exam_subjects")
      .insert({ user_id: user.id, exam_id: examId, subject_id: subjectId, weight });
    if (insertError) return insertError.message;
    await refetch();
    return null;
  }

  async function linkTopic(examId: string, topicId: string, weight: number) {
    if (!user) return "Sessão expirada.";
    const { error: insertError } = await supabase
      .from("exam_topics")
      .insert({ user_id: user.id, exam_id: examId, topic_id: topicId, weight });
    if (insertError) return insertError.message;
    await refetch();
    return null;
  }

  async function unlinkSubject(linkId: string) {
    const { error: deleteError } = await supabase.from("exam_subjects").delete().eq("id", linkId);
    if (deleteError) return deleteError.message;
    await refetch();
    return null;
  }

  async function unlinkTopic(linkId: string) {
    const { error: deleteError } = await supabase.from("exam_topics").delete().eq("id", linkId);
    if (deleteError) return deleteError.message;
    await refetch();
    return null;
  }

  return {
    exams,
    loading,
    error,
    refetch,
    createExam,
    deleteExam,
    linkSubject,
    linkTopic,
    unlinkSubject,
    unlinkTopic,
  };
}
