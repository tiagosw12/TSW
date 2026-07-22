import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { TopicRetention } from "../types/db";

export function useTopicHistory(topicId: string, refreshKey: number = 0) {
  const [retention, setRetention] = useState<TopicRetention | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    supabase
      .from("topic_retention")
      .select("*")
      .eq("topic_id", topicId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setRetention(data ?? null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [topicId, refreshKey]);

  return { retention, loading };
}
