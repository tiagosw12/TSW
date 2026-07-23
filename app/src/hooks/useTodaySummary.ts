import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useDataRefresh } from "../contexts/DataRefreshContext";

export interface TodaySummary {
  minutes: number;
  sessions: number;
  quizzes: number;
}

function startOfTodayIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

function startOfTomorrowIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
}

export function useTodaySummary() {
  const { user } = useAuth();
  const { version } = useDataRefresh();
  const [summary, setSummary] = useState<TodaySummary>({ minutes: 0, sessions: 0, quizzes: 0 });
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const start = startOfTodayIso();
    const end = startOfTomorrowIso();

    const [sessionsRes, quizRes] = await Promise.all([
      supabase.from("study_sessions").select("duration_minutes").gte("performed_at", start).lt("performed_at", end),
      supabase
        .from("quiz_results")
        .select("id", { count: "exact", head: true })
        .gte("performed_at", start)
        .lt("performed_at", end),
    ]);

    const minutes = (sessionsRes.data ?? []).reduce((sum, row) => sum + row.duration_minutes, 0);
    setSummary({
      minutes,
      sessions: sessionsRes.data?.length ?? 0,
      quizzes: quizRes.count ?? 0,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch, version]);

  return { summary, loading };
}
