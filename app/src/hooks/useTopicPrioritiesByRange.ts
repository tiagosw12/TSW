import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { TopicPriorityByDay } from "../types/db";

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function useTopicPrioritiesByRange(startDate: Date, endDate: Date) {
  const [byDay, setByDay] = useState<Record<string, TopicPriorityByDay[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startKey = toDateKey(startDate);
  const endKey = toDateKey(endDate);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc("get_topic_priorities_by_date_range", {
      p_start_date: startKey,
      p_end_date: endKey,
    });
    if (rpcError) {
      setError(rpcError.message);
      setByDay({});
    } else {
      setError(null);
      const grouped: Record<string, TopicPriorityByDay[]> = {};
      for (const row of data ?? []) {
        (grouped[row.day] ??= []).push(row);
      }
      setByDay(grouped);
    }
    setLoading(false);
  }, [startKey, endKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { byDay, loading, error, refetch };
}
