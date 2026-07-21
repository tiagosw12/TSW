import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { ActivityType, TopicRetention } from "../types/db";

export interface ReviewEvent {
  performedAt: string;
  quality: number; // 0..1, used only to size the spike — not fed back into any stored value
  label: string;
}

const ACTIVITY_QUALITY: Record<ActivityType, number> = {
  questao: 0.9,
  esquema: 0.7,
  resumo: 0.6,
  leitura: 0.4,
};

const LOOKBACK_DAYS = 30;

export function useTopicHistory(topicId: string) {
  const [retention, setRetention] = useState<TopicRetention | null>(null);
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const since = new Date(Date.now() - LOOKBACK_DAYS * 86400_000).toISOString();

    Promise.all([
      supabase.from("topic_retention").select("*").eq("topic_id", topicId).maybeSingle(),
      supabase
        .from("study_sessions")
        .select("activity_type, performed_at")
        .eq("topic_id", topicId)
        .gte("performed_at", since),
      supabase
        .from("quiz_results")
        .select("correct_percentage, performed_at")
        .eq("topic_id", topicId)
        .gte("performed_at", since),
    ]).then(([retentionRes, sessionsRes, quizRes]) => {
      if (cancelled) return;

      const sessionEvents: ReviewEvent[] = (sessionsRes.data ?? []).map((row) => ({
        performedAt: row.performed_at,
        quality: ACTIVITY_QUALITY[row.activity_type],
        label: row.activity_type,
      }));
      const quizEvents: ReviewEvent[] = (quizRes.data ?? []).map((row) => ({
        performedAt: row.performed_at,
        quality: row.correct_percentage / 100,
        label: `quiz ${row.correct_percentage}%`,
      }));

      setRetention(retentionRes.data ?? null);
      setEvents([...sessionEvents, ...quizEvents].sort((a, b) => a.performedAt.localeCompare(b.performedAt)));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [topicId]);

  return { retention, events, loading };
}
